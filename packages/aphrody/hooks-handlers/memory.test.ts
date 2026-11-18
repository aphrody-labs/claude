import { Database } from "bun:sqlite";
import { afterEach, expect, test } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  chunkAgyTranscript,
  chunkMarkdown,
  chunkTranscript,
  defaultSources,
  ftsQuery,
  geminiSources,
  indexAll,
  openIndex,
  search,
  type Source,
} from "./memory.ts";

const dirs: string[] = [];
function tmp(): string {
  const d = mkdtempSync(join(tmpdir(), "memory-test-"));
  dirs.push(d);
  return d;
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});

test("chunkMarkdown splits on headings and keeps the heading path as title", () => {
  const chunks = chunkMarkdown("intro\n# A\nalpha\n## B\nbeta", "f");
  expect(chunks.map((c) => c.title)).toEqual(["f", "f > A", "f > B"]);
  expect(chunks[2]!.body).toBe("beta");
});

test("chunkMarkdown splits oversized sections", () => {
  expect(chunkMarkdown("x".repeat(4000), "f").length).toBe(3);
});

test("chunkTranscript keeps user and assistant text, drops tools and system markup", () => {
  const lines = [
    { type: "user", message: { content: "hello there" } },
    {
      type: "assistant",
      message: {
        content: [
          { type: "text", text: "hi" },
          { type: "tool_use", name: "Bash" },
        ],
      },
    },
    { type: "user", message: { content: "<command-name>x</command-name>" } },
    { type: "attachment" },
  ].map((l) => JSON.stringify(l));
  const chunks = chunkTranscript(`${lines.join("\n")}\nnot json`, "abc");
  expect(chunks.map((c) => c.body)).toEqual(["hello there", "hi"]);
});

test("ftsQuery quotes prefix terms and drops punctuation", () => {
  expect(ftsQuery("Fleet roles, fr1!")).toBe(
    '"fleet"* AND "roles"* AND "fr1"*',
  );
  expect(ftsQuery("a b", "OR")).toBe("");
  expect(ftsQuery("")).toBe("");
});

test("indexAll is incremental, searchable, ranked and drops deleted files", () => {
  const root = tmp();
  const mem = join(root, "memory");
  mkdirSync(mem);
  writeFileSync(join(mem, "fleet.md"), "# Fleet\nfr1 builds and CI, fr2 tests");
  writeFileSync(join(mem, "git.md"), "# Git\nnever stash on shared trees");
  const src: Source[] = [
    {
      kind: "memory",
      dir: mem,
      match: (n) => n.endsWith(".md"),
      recursive: false,
    },
  ];
  const db = openIndex(join(root, "m.db"));
  try {
    expect(indexAll(db, src)).toMatchObject({
      files: 2,
      changed: 2,
      chunks: 2,
      removed: 0,
    });
    expect(indexAll(db, src).changed).toBe(0);
    expect(search(db, "stash shared")[0]!.title).toBe("git > Git");
    expect(search(db, "stash", { kind: "doc" })).toEqual([]);
    expect(search(db, "builds nonexistentword")[0]!.title).toBe(
      "fleet > Fleet",
    );

    writeFileSync(join(mem, "git.md"), "# Git\nalways rebase");
    utimesSync(join(mem, "git.md"), new Date(), new Date(Date.now() + 5000));
    expect(indexAll(db, src).changed).toBe(1);
    expect(search(db, "stash")).toEqual([]);

    rmSync(join(mem, "fleet.md"));
    expect(indexAll(db, src).removed).toBe(1);
    expect(search(db, "builds")).toEqual([]);
  } finally {
    db.close();
  }
});

test("chunkAgyTranscript keeps requests, answers, reasoning and checkpoints, and skips tool results", () => {
  const lines = [
    {
      type: "USER_INPUT",
      content:
        "<USER_REQUEST>\nfix the oauth redirect\n</USER_REQUEST>\n<ADDITIONAL_METADATA>noise</ADDITIONAL_METADATA>",
    },
    { type: "PLANNER_RESPONSE", thinking: "reading the proxy", tool_calls: [] },
    { type: "GENERIC", content: "Command exited with code 0." },
    { type: "PLANNER_RESPONSE", content: "redirect fixed" },
    { type: "CHECKPOINT", content: "summary so far" },
  ]
    .map((l) => JSON.stringify(l))
    .join("\n");
  const chunks = chunkAgyTranscript(lines, "agy c3274da2");
  expect(chunks.map((c) => c.title)).toEqual([
    "agy c3274da2 user",
    "agy c3274da2 thinking",
    "agy c3274da2 assistant",
    "agy c3274da2 checkpoint",
  ]);
  expect(chunks[0]!.body).toBe("fix the oauth redirect");
});

test("geminiSources index the Gemini memory and brain, and agy sessions only on request", () => {
  const home = tmp();
  mkdirSync(join(home, "memory"), { recursive: true });
  mkdirSync(join(home, "brain", "bun"), { recursive: true });
  writeFileSync(
    join(home, "memory", "quoting.md"),
    "never embed escaped quotes in hooks",
  );
  writeFileSync(
    join(home, "brain", "bun", "INDEX.md"),
    "# Redis\nscan and unlink",
  );
  const agy = join(home, "antigravity-cli");
  const logs = join(agy, "brain", "c3274da2-3f9c", ".system_generated", "logs");
  mkdirSync(logs, { recursive: true });
  writeFileSync(
    join(logs, "transcript.jsonl"),
    `${JSON.stringify({ type: "PLANNER_RESPONSE", content: "deployed the griffon website" })}\n`,
  );
  const summaries = new Database(join(agy, "conversation_summaries.db"));
  summaries.exec(
    "CREATE VIRTUAL TABLE conversations_fts USING fts5(conversation_id UNINDEXED, chunk_index UNINDEXED, title, workspace, user_body, agent_body)",
  );
  summaries
    .query("INSERT INTO conversations_fts VALUES (?, ?, ?, ?, ?, ?)")
    .run("598efceb-aaaa", -1, "Monorepo Audit", "rosegriffon", "", "");
  summaries
    .query("INSERT INTO conversations_fts VALUES (?, ?, ?, ?, ?, ?)")
    .run(
      "598efceb-aaaa",
      0,
      "",
      "",
      "audit the monorepo",
      "nginx upstream repaired",
    );
  summaries.close();

  const db = openIndex(join(tmp(), "m.db"));
  indexAll(db, geminiSources(home));
  expect(search(db, "escaped quotes")[0]!.kind).toBe("memory");
  expect(search(db, "unlink")[0]!.title).toBe("INDEX > Redis");
  expect(search(db, "griffon website")).toEqual([]);

  indexAll(db, geminiSources(home, true));
  expect(search(db, "griffon website")[0]!.title).toBe(
    "agy c3274da2 assistant",
  );
  const hit = search(db, "nginx upstream")[0]!;
  expect(hit.kind).toBe("session");
  expect(hit.title).toBe("598efceb rosegriffon Monorepo Audit assistant");
  db.close();
});

test("defaultSources leaves the Gemini home out when another Claude home is given", () => {
  const home = tmp();
  expect(defaultSources(home).some((s) => s.dir.includes(".gemini"))).toBe(
    false,
  );
});
