#!/usr/bin/env bun
// Aligns the Claude Code plugins on the Antigravity CLI (agy) unified plugin: ~/.gemini/plugins/aphrody/skills is the
// single skill source (built by ~/.gemini/scripts/unify-plugins.ts). Its skills are mirrored into
// packages/aphrody/skills; packages/bun keeps its hooks and rules but no longer ships skills, so every skill exists once.
//   bun scripts/align-agy.ts [--check]   (--check exits 1 on drift and writes nothing)
import {
  cpSync,
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { join, relative } from "node:path";
import { HOME, REPO_ROOT, toSlash } from "./lib.ts";

export const AGY_SKILLS = join(HOME, ".gemini", "plugins", "aphrody", "skills");
export const TARGET = join(REPO_ROOT, "packages", "aphrody", "skills");
/** Plugins of this repo that must not carry skills of their own (they were merged into aphrody by agy). */
export const MERGED = [join(REPO_ROOT, "packages", "bun", "skills")];

function files(dir: string, base = dir): Map<string, string> {
  const out = new Map<string, string>();
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) for (const [k, v] of files(p, base)) out.set(k, v);
    else if (e.isFile()) out.set(toSlash(relative(base, p)), p);
  }
  return out;
}

export interface Drift {
  added: string[];
  changed: string[];
  removed: string[];
  merged: string[];
}

export function drift(src = AGY_SKILLS, dst = TARGET, merged = MERGED): Drift {
  const a = files(src);
  const b = files(dst);
  const d: Drift = { added: [], changed: [], removed: [], merged: [] };
  for (const [k, p] of a) {
    const q = b.get(k);
    if (!q) d.added.push(k);
    else if (
      statSync(p).size !== statSync(q).size ||
      !readFileSync(p).equals(readFileSync(q))
    )
      d.changed.push(k);
  }
  for (const k of b.keys()) if (!a.has(k)) d.removed.push(k);
  for (const m of merged) if (existsSync(m)) d.merged.push(toSlash(m));
  return d;
}

export function apply(src = AGY_SKILLS, dst = TARGET, merged = MERGED): Drift {
  const d = drift(src, dst, merged);
  rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true });
  for (const m of merged) rmSync(m, { recursive: true, force: true });
  return d;
}

if (import.meta.main) {
  if (!existsSync(AGY_SKILLS)) {
    console.error(`agy skill source missing: ${AGY_SKILLS}`);
    process.exit(1);
  }
  const check = Bun.argv.includes("--check");
  const d = check ? drift() : apply();
  const n = readdirSync(AGY_SKILLS).length;
  console.log(
    JSON.stringify({
      skills: n,
      added: d.added.length,
      changed: d.changed.length,
      removed: d.removed.length,
      merged: d.merged,
    }),
  );
  if (
    check &&
    (d.added.length || d.changed.length || d.removed.length || d.merged.length)
  )
    process.exit(1);
}
