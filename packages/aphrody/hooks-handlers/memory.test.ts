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
  chunkMarkdown,
  chunkTranscript,
  ftsQuery,
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
