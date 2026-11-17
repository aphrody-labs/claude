// Full-text memory: one SQLite FTS5 index over project memory, instructions, learning digests, research docs and
// (optionally) past session transcripts. Incremental by mtime and size. Same idea as the session search of Hermes
// Agent and the memory search of OpenClaw, on bun:sqlite only.
import { Database } from "bun:sqlite";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { CLAUDE_HOME } from "./lib.ts";

export type Kind = "memory" | "instructions" | "digest" | "doc" | "session";

export interface Hit {
  path: string;
  kind: Kind;
  title: string;
  snippet: string;
  rank: number;
}

export interface Source {
  kind: Kind;
  dir: string;
  match: (name: string) => boolean;
  recursive: boolean;
}

export const DB_PATH = join(CLAUDE_HOME, "learning", "memory.db");
const MAX_CHUNK = 1500;

export function openIndex(path = DB_PATH): Database {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path, { create: true });
  db.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 3000;");
  db.exec(
    `CREATE TABLE IF NOT EXISTS docs (path TEXT PRIMARY KEY, kind TEXT NOT NULL, mtime INTEGER NOT NULL, size INTEGER NOT NULL)`,
  );
  db.exec(
    `CREATE VIRTUAL TABLE IF NOT EXISTS chunks USING fts5(path UNINDEXED, kind UNINDEXED, title, body, tokenize = 'porter unicode61')`,
  );
  return db;
}

export function defaultSources(home = CLAUDE_HOME, sessions = false): Source[] {
  const md = (n: string) => n.endsWith(".md");
  const sources: Source[] = [
    {
      kind: "instructions",
      dir: join(home, "CLAUDE.md"),
      match: () => true,
      recursive: false,
    },
    {
      kind: "digest",
      dir: join(home, "learning", "inbox"),
      match: md,
      recursive: false,
    },
    { kind: "doc", dir: join(home, "docs"), match: md, recursive: true },
  ];
  const projects = join(home, "projects");
  if (existsSync(projects)) {
    for (const p of readdirSync(projects)) {
      sources.push({
        kind: "memory",
        dir: join(projects, p, "memory"),
        match: md,
        recursive: false,
      });
      if (sessions)
        sources.push({
          kind: "session",
          dir: join(projects, p),
          match: (n) => n.endsWith(".jsonl"),
          recursive: false,
        });
    }
  }
  return sources;
}

function listFiles(src: Source): string[] {
  if (!existsSync(src.dir)) return [];
  const st = statSync(src.dir);
  if (st.isFile()) return [src.dir];
  const out: string[] = [];
  for (const e of readdirSync(src.dir, { withFileTypes: true })) {
    const p = join(src.dir, e.name);
    if (e.isDirectory() && src.recursive)
      out.push(...listFiles({ ...src, dir: p }));
    else if (e.isFile() && src.match(e.name)) out.push(p);
  }
  return out;
}

export interface Chunk {
  title: string;
  body: string;
}

/** Splits markdown on headings (and on size) so a hit points at one section, not a whole file. */
export function chunkMarkdown(text: string, fallbackTitle: string): Chunk[] {
  const chunks: Chunk[] = [];
  let title = fallbackTitle;
  let buf: string[] = [];
  const flush = () => {
    const body = buf.join("\n").trim();
    buf = [];
    for (let i = 0; i < body.length; i += MAX_CHUNK)
      chunks.push({ title, body: body.slice(i, i + MAX_CHUNK) });
  };
  for (const line of text.split(/\r?\n/)) {
    const h = line.match(/^#{1,4}\s+(.*)$/);
    if (h) {
      flush();
      title = `${fallbackTitle} > ${h[1]}`;
    } else buf.push(line);
  }
  flush();
  return chunks.filter((c) => c.body.length > 0);
}

interface TranscriptLine {
  type?: string;
  message?: { content?: unknown };
}

/** One chunk per user or assistant text message of a Claude Code transcript (tool calls and results are skipped). */
export function chunkTranscript(text: string, fallbackTitle: string): Chunk[] {
  const chunks: Chunk[] = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith("{")) continue;
    let rec: TranscriptLine;
    try {
      rec = JSON.parse(line) as TranscriptLine;
    } catch {
      continue;
    }
    if (rec.type !== "user" && rec.type !== "assistant") continue;
    const c = rec.message?.content;
    const parts =
      typeof c === "string"
        ? [c]
        : Array.isArray(c)
          ? c
              .filter(
                (b): b is { type: string; text: string } =>
                  b?.type === "text" && typeof b.text === "string",
              )
              .map((b) => b.text)
          : [];
    const body = parts.join("\n").trim();
    if (body && !body.startsWith("<"))
      chunks.push({
        title: `${fallbackTitle} ${rec.type}`,
        body: body.slice(0, MAX_CHUNK),
      });
  }
  return chunks;
}

export function indexFile(db: Database, kind: Kind, file: string): number {
  const st = statSync(file);
  const prev = db
    .query<{ mtime: number; size: number }, [string]>(
      "SELECT mtime, size FROM docs WHERE path = ?",
    )
    .get(file);
  const mtime = Math.floor(st.mtimeMs);
  if (prev && prev.mtime === mtime && prev.size === st.size) return 0;
  const name = file.replaceAll("\\", "/").split("/").pop() ?? file;
  const text = readFileSync(file, "utf8");
  const chunks =
    kind === "session"
      ? chunkTranscript(text, name.replace(/\.jsonl$/, "").slice(0, 8))
      : chunkMarkdown(text, name.replace(/\.md$/, ""));
  const insert = db.query(
    "INSERT INTO chunks (path, kind, title, body) VALUES (?, ?, ?, ?)",
  );
  db.transaction(() => {
    db.query("DELETE FROM chunks WHERE path = ?").run(file);
    for (const c of chunks) insert.run(file, kind, c.title, c.body);
    db.query(
      "INSERT OR REPLACE INTO docs (path, kind, mtime, size) VALUES (?, ?, ?, ?)",
    ).run(file, kind, mtime, st.size);
  })();
  return chunks.length;
}

export interface IndexStats {
  files: number;
  changed: number;
  chunks: number;
  removed: number;
}

export function indexAll(db: Database, sources: Source[]): IndexStats {
  const stats: IndexStats = { files: 0, changed: 0, chunks: 0, removed: 0 };
  const seen = new Set<string>();
  for (const src of sources) {
    for (const file of listFiles(src)) {
      seen.add(file);
      stats.files++;
      const n = indexFile(db, src.kind, file);
      if (n > 0) {
        stats.changed++;
        stats.chunks += n;
      }
    }
  }
  for (const { path } of db
    .query<{ path: string }, []>("SELECT path FROM docs")
    .all()) {
    if (!seen.has(path) && !existsSync(path)) {
      db.query("DELETE FROM chunks WHERE path = ?").run(path);
      db.query("DELETE FROM docs WHERE path = ?").run(path);
      stats.removed++;
    }
  }
  return stats;
}

/** Free text to an FTS5 query: quoted prefix terms, AND first, OR as the looser retry. */
export function ftsQuery(text: string, op: "AND" | "OR" = "AND"): string {
  const terms = text.toLowerCase().match(/[\p{L}\p{N}_]{2,}/gu) ?? [];
  return terms.map((t) => `"${t}"*`).join(` ${op} `);
}

export function search(
  db: Database,
  text: string,
  opts: { kind?: Kind; limit?: number } = {},
): Hit[] {
  const limit = opts.limit ?? 8;
  for (const op of ["AND", "OR"] as const) {
    const q = ftsQuery(text, op);
    if (!q) return [];
    const rows = db
      .query<Hit, [string, string, number]>(
        `SELECT path, kind, title, snippet(chunks, 3, '[', ']', ' ... ', 24) AS snippet, bm25(chunks, 0, 0, 4, 1) AS rank
         FROM chunks WHERE chunks MATCH ?1 AND (?2 = '' OR kind = ?2) ORDER BY rank LIMIT ?3`,
      )
      .all(q, opts.kind ?? "", limit);
    if (rows.length > 0) return rows;
  }
  return [];
}
