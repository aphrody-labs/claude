#!/usr/bin/env bun
// Byte-exact directory map of a repository, one row per top-level directory (`packages/<name>` for plugins): files, bytes and the gate
// that guards it. Same shape as fairwind's `cargo xtask map`; tiers and gates come from map.toml at the root.
//   bun scripts/map.ts [--root <dir>] [--check]   (--check exits 1 when MAP.tsv is not what the tracked files give; writes nothing)
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { REPO_ROOT } from "./lib.ts";

export interface Role {
  tier: string;
  gate: string;
}
export type Roles = Record<string, Role>;

/** The bucket of a tracked path: "(root)" for a file at the root, "packages/<name>" below packages, else the first segment. */
export function bucket(rel: string): string {
  const p = rel.split("/");
  if (p.length === 1) return "(root)";
  return p[0] === "packages" && p.length > 2
    ? `${p[0]}/${p[1]}`
    : (p[0] as string);
}

export function render(
  files: { rel: string; size: number }[],
  roles: Roles,
): string {
  const rows = new Map<string, [number, number]>();
  for (const f of files) {
    const k = bucket(f.rel);
    const e = rows.get(k) ?? [0, 0];
    e[0]++;
    e[1] += f.size;
    rows.set(k, e);
  }
  const fallback = roles.default ?? { tier: "misc", gate: "none" };
  const keys = [...rows.keys()].sort((a, b) =>
    Buffer.compare(Buffer.from(a), Buffer.from(b)),
  );
  const lines = ["dir\ttier\tfiles\tbytes\tgate"];
  for (const k of keys) {
    const r = roles[k] ?? fallback;
    const [n, bytes] = rows.get(k) as [number, number];
    lines.push(`${k}\t${r.tier}\t${n}\t${bytes}\t${r.gate}`);
  }
  return `${lines.join("\n")}\n`;
}

export function build(root: string): string {
  const out = Bun.spawnSync(["git", "ls-files"], {
    cwd: root,
  }).stdout.toString();
  const files: { rel: string; size: number }[] = [];
  for (const rel of out.split("\n").filter(Boolean)) {
    try {
      const st = statSync(join(root, rel));
      if (st.isFile() && rel !== "MAP.tsv") files.push({ rel, size: st.size });
    } catch {}
  }
  const cfg = join(root, "map.toml");
  const roles = existsSync(cfg)
    ? (Bun.TOML.parse(readFileSync(cfg, "utf8")) as Roles)
    : {};
  return render(files, roles);
}

if (import.meta.main) {
  const i = Bun.argv.indexOf("--root");
  const root = i > 0 ? resolve(Bun.argv[i + 1] as string) : REPO_ROOT;
  const body = build(root);
  const path = join(root, "MAP.tsv");
  if (Bun.argv.includes("--check")) {
    const cur = existsSync(path) ? readFileSync(path, "utf8") : "";
    if (cur !== body) {
      console.error("MAP.tsv is out of date (run bun scripts/map.ts)");
      process.exit(1);
    }
  } else writeFileSync(path, body);
  console.log(`MAP.tsv ${body.split("\n").length - 2} rows`);
}
