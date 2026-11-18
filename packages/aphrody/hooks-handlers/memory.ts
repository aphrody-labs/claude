// Full-text memory: one SQLite FTS5 index over project memory, instructions, learning digests, research docs, the
// Gemini / Antigravity brain (~/.gemini memory, rules, brain) and (optionally) past session transcripts of Claude Code
// and of the Antigravity CLI (agy). Incremental by mtime and size. Same idea as the session search of Hermes
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
import { CLAUDE_HOME, HOME } from "./lib.ts";

export type Kind = "memory" | "instructions" | "digest" | "doc" | "session";

export interface Hit {
  path: string;
  kind: Kind;
  title: string;
  snippet: string;
  rank: number;
}

/** How a file is cut into chunks; when absent it follows the kind (session: Claude transcript, anything else: markdown). */
export type Format = "markdown" | "claude" | "agy" | "agy-summaries";

export interface Source {
  kind: Kind;
  dir: string;
  match: (name: string) => boolean;
  recursive: boolean;
  format?: Format;
}

export const GEMINI_HOME = `${HOME}/.gemini`;

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

/**
 * The Gemini CLI and Antigravity CLI (agy) side of the brain, read in place and never written: curated memory and
 * rules, the compacted brain digests, and with `sessions` every agy conversation (the full-text table agy keeps
 * for all of them, plus the step transcript of the ones whose brain folder still exists).
 */
export function geminiSources(
  geminiHome = GEMINI_HOME,
  sessions = false,
): Source[] {
  const md = (n: string) => n.endsWith(".md");
  const sources: Source[] = [
    {
      kind: "instructions",
      dir: join(geminiHome, "rules"),
      match: md,
      recursive: true,
    },
    {
      kind: "memory",
      dir: join(geminiHome, "memory"),
      match: md,
      recursive: false,
    },
    { kind: "doc", dir: join(geminiHome, "brain"), match: md, recursive: true },
  ];
  if (!sessions) return sources;
  const agy = join(geminiHome, "antigravity-cli");
  sources.push({
    kind: "session",
    dir: join(agy, "conversation_summaries.db"),
    match: () => true,
    recursive: false,
    format: "agy-summaries",
  });
  const brain = join(agy, "brain");
  if (existsSync(brain))
    for (const id of readdirSync(brain))
      sources.push({
        kind: "session",
        dir: join(brain, id, ".system_generated", "logs", "transcript.jsonl"),
        match: () => true,
        recursive: false,
        format: "agy",
      });
  return sources;
}

export function defaultSources(
  home = CLAUDE_HOME,
  sessions = false,
  geminiHome = home === CLAUDE_HOME ? GEMINI_HOME : "",
): Source[] {
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
  if (geminiHome) sources.push(...geminiSources(geminiHome, sessions));
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

interface AgyStep {
  type?: string;
  content?: unknown;
  thinking?: unknown;
}

/**
 * One chunk per user request, model answer, model reasoning note and checkpoint summary of an agy step transcript
 * (`brain/<conversation>/.system_generated/logs/transcript.jsonl`). Tool results (GENERIC steps) are skipped.
 */
export function chunkAgyTranscript(
  text: string,
  fallbackTitle: string,
): Chunk[] {
  const chunks: Chunk[] = [];
  const push = (role: string, raw: unknown) => {
    if (typeof raw !== "string") return;
    const body = raw.trim();
    if (body)
      chunks.push({
        title: `${fallbackTitle} ${role}`,
        body: body.slice(0, MAX_CHUNK),
      });
  };
  for (const line of text.split("\n")) {
    if (!line.startsWith("{")) continue;
    let rec: AgyStep;
    try {
      rec = JSON.parse(line) as AgyStep;
    } catch {
      continue;
    }
    if (rec.type === "USER_INPUT") {
      const c = typeof rec.content === "string" ? rec.content : "";
      push(
        "user",
        c.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/)?.[1] ?? c,
      );
    } else if (rec.type === "PLANNER_RESPONSE") {
      push("assistant", rec.content);
      push("thinking", rec.thinking);
    } else if (rec.type === "CHECKPOINT") push("checkpoint", rec.content);
  }
  return chunks;
}

interface AgySummaryRow {
  conversation_id: string;
  chunk_index: number;
  title: string;
  workspace: string;
  user_body: string;
  agent_body: string;
}

/**
 * Every conversation agy remembers, from the full-text table of its `conversation_summaries.db`: this covers the
 * sessions whose brain folder is gone. The database is opened read-only; agy keeps writing it.
 */
export function chunkAgySummaries(file: string): Chunk[] {
  const src = new Database(file, { readonly: true });
  try {
    const rows = src
      .query<AgySummaryRow, []>(
        "SELECT conversation_id, chunk_index, title, workspace, user_body, agent_body FROM conversations_fts ORDER BY conversation_id, chunk_index",
      )
      .all();
    const chunks: Chunk[] = [];
    const heads = new Map<string, string>();
    for (const r of rows) {
      const id = String(r.conversation_id).slice(0, 8);
      if (r.chunk_index < 0) {
        heads.set(id, [id, r.workspace, r.title].filter(Boolean).join(" "));
        continue;
      }
      const head = heads.get(id) ?? id;
      for (const [role, text] of [
        ["user", r.user_body],
        ["assistant", r.agent_body],
      ] as const) {
        const body = String(text ?? "").trim();
        for (let i = 0; i < body.length; i += MAX_CHUNK)
          chunks.push({
            title: `${head} ${role}`,
            body: body.slice(i, i + MAX_CHUNK),
          });
      }
    }
    return chunks;
  } finally {
    src.close();
  }
}

/** The conversation id an agy transcript path belongs to (`brain/<id>/.system_generated/logs/transcript.jsonl`). */
function agyConversation(file: string): string {
  const parts = file.replaceAll("\\", "/").split("/");
  return (parts.at(-4) ?? "agy").slice(0, 8);
}

export function indexFile(
  db: Database,
  kind: Kind,
  file: string,
  format: Format = kind === "session" ? "claude" : "markdown",
): number {
  const st = statSync(file);
  const prev = db
    .query<{ mtime: number; size: number }, [string]>(
      "SELECT mtime, size FROM docs WHERE path = ?",
    )
    .get(file);
  const mtime = Math.floor(st.mtimeMs);
  if (prev && prev.mtime === mtime && prev.size === st.size) return 0;
  const name = file.replaceAll("\\", "/").split("/").pop() ?? file;
  const chunks =
    format === "agy-summaries"
      ? chunkAgySummaries(file)
      : format === "agy"
        ? chunkAgyTranscript(
            readFileSync(file, "utf8"),
            `agy ${agyConversation(file)}`,
          )
        : format === "claude"
          ? chunkTranscript(
              readFileSync(file, "utf8"),
              name.replace(/\.jsonl$/, "").slice(0, 8),
            )
          : chunkMarkdown(
              readFileSync(file, "utf8"),
              name.replace(/\.md$/, ""),
            );
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
      const n = indexFile(db, src.kind, file, src.format);
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
