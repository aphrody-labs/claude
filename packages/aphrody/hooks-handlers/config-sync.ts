#!/usr/bin/env bun
import { spawn } from "node:child_process";
import { join } from "node:path";
import { findRepoRoot, readHookEvent, writeEmpty } from "./lib.ts";

const mode = Bun.argv[2] ?? "pull";
const root = findRepoRoot();

await readHookEvent();

function git(...args: string[]) {
  const r = Bun.spawnSync(["git", "-C", root, ...args], {
    stdout: "pipe",
    stderr: "pipe",
    stdin: "ignore",
  });
  return {
    ok: r.exitCode === 0,
    out: r.stdout.toString().trim(),
    err: r.stderr.toString().trim(),
  };
}

if (!git("rev-parse", "--is-inside-work-tree").ok) {
  writeEmpty();
  process.exit(0);
}

const hasRemote = git("remote").out.length > 0;

if (mode === "pull" && hasRemote) {
  if (git("status", "--porcelain").out === "") {
    const r = git("pull", "--ff-only", "--quiet");
    if (!r.ok) console.error(`config-sync pull: ${r.err}`);
  }
} else if (mode === "push") {
  // Sync local memory SQLite DBs cleanly when merge-brain.ts exists.
  const mergeScript = join(root, "scripts", "merge-brain.ts");
  Bun.spawnSync(["bun", "--no-install", mergeScript], {
    stdout: "ignore",
    stderr: "ignore",
    stdin: "ignore",
  });

  git("add", "-A");
  if (!git("diff", "--cached", "--quiet").ok) {
    const c = git("commit", "--quiet", "-m", "config: sync");
    if (!c.ok) console.error(`config-sync commit: ${c.err}`);
    else if (hasRemote) {
      spawn("git", ["-C", root, "push", "--quiet"], {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      }).unref();
    }
  }
}

writeEmpty();
