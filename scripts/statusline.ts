#!/usr/bin/env bun
// Status line: model, folder, git branch, context use, session cost. Reads the session JSON on stdin; no subprocess, so it stays fast.
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

interface Session {
  model?: { display_name?: string; id?: string };
  workspace?: { current_dir?: string };
  cwd?: string;
  context_window?: { used_percentage?: number | null };
  cost?: { total_cost_usd?: number };
}

function branchOf(dir: string): string {
  for (let d = dir; ; d = dirname(d)) {
    const head = join(d, ".git", "HEAD");
    if (existsSync(head)) {
      const ref = readFileSync(head, "utf8").trim();
      return ref.startsWith("ref: refs/heads/")
        ? ref.slice(16)
        : ref.slice(0, 7);
    }
    if (dirname(d) === d) return "";
  }
}

let s: Session = {};
try {
  s = JSON.parse(await Bun.stdin.text()) as Session;
} catch {
  // An empty or invalid payload still prints a minimal line.
}
const dir = s.workspace?.current_dir ?? s.cwd ?? process.cwd();
const used = s.context_window?.used_percentage;
const cost = s.cost?.total_cost_usd;
const parts = [
  s.model?.display_name ?? s.model?.id ?? "claude",
  basename(dir) || dir,
  branchOf(dir),
  used == null ? "" : `ctx ${Math.round(used)}%`,
  cost ? `$${cost.toFixed(2)}` : "",
];
process.stdout.write(parts.filter(Boolean).join(" | "));
