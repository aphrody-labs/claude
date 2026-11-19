#!/usr/bin/env bun
// Aligns the Claude Code plugins on the Antigravity CLI (agy) unified plugin: ~/.gemini/plugins/aphrody/skills is the
// single skill source (built by ~/.gemini/scripts/unify-plugins.ts). Its skills are mirrored into
// packages/aphrody/skills; packages/bun keeps its hooks and rules but no longer ships skills, so every skill exists once.
// A skill that another installed Claude plugin already ships (for example the official cloudflare plugin) or that
// profile.toml [skills].exclude lists is not mirrored: Claude takes it from its owner, agy keeps its own copy.
// The MCP servers that are plain remote endpoints (`type: "http"` in the Claude plugin's .claude-plugin/mcp.json) are declared once there
// and mirrored as `serverUrl` entries into every agy mcp_config.json (the package's and both ~/.gemini plugin copies); servers an agent
// owns alone (bun-brain, os-craft, claude-bridge, local stdio ones) are left untouched.
//   bun scripts/align-agy.ts [--check]   (--check exits 1 on drift and writes nothing)
import {
  cpSync,
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  copyFileSync,
  mkdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative, sep } from "node:path";
import { HOME, REPO_ROOT, toSlash } from "./lib.ts";

export const AGY_SKILLS = join(HOME, ".gemini", "plugins", "aphrody", "skills");
export const TARGET = join(REPO_ROOT, "packages", "aphrody", "skills");
/** Plugins of this repo that must not carry skills of their own (they were merged into aphrody by agy). */
export const MERGED = [join(REPO_ROOT, "packages", "bun", "skills")];

export const CLAUDE_MCP = join(
  REPO_ROOT,
  "packages",
  "aphrody",
  ".claude-plugin",
  "mcp.json",
);
/** Every agy mcp_config.json that must carry the shared remote servers. */
export const AGY_MCP_FILES = [
  join(REPO_ROOT, "packages", "aphrody", "mcp_config.json"),
  join(HOME, ".gemini", "plugins", "aphrody", "mcp_config.json"),
  join(HOME, ".gemini", "config", "plugins", "aphrody", "mcp_config.json"),
];

type Servers = Record<string, Record<string, unknown>>;

/** Remote HTTP servers of a Claude mcp.json in agy's `serverUrl` form. */
export function sharedRemote(claude: { mcpServers?: Servers }): Servers {
  const out: Servers = {};
  for (const [name, def] of Object.entries(claude.mcpServers ?? {}))
    if (def.type === "http" && typeof def.url === "string")
      out[name] = { serverUrl: def.url };
  return out;
}

/** The agy config with the shared servers set and every other server kept as it is. */
export function mergeShared(
  agy: { mcpServers?: Servers },
  shared: Servers,
): { mcpServers: Servers } {
  const mcpServers: Servers = { ...(agy.mcpServers ?? {}) };
  for (const [name, def] of Object.entries(shared)) mcpServers[name] = def;
  return { ...agy, mcpServers };
}

/** Files whose content differs from the merged shared servers (and rewrites them unless `check`). */
export function alignMcp(
  check: boolean,
  claudePath = CLAUDE_MCP,
  targets = AGY_MCP_FILES,
): string[] {
  if (!existsSync(claudePath)) return [];
  const shared = sharedRemote(JSON.parse(readFileSync(claudePath, "utf8")));
  const drifted: string[] = [];
  for (const file of targets) {
    if (!existsSync(file)) continue;
    const current = JSON.parse(readFileSync(file, "utf8"));
    const next = mergeShared(current, shared);
    if (JSON.stringify(next) === JSON.stringify(current)) continue;
    drifted.push(toSlash(file));
    if (!check) writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
  }
  return drifted;
}

/** Library files the mirrored skills import (`../../lib/<file>` from the plugin root): copied next to the skills. */
export const SHARED_LIB = ["bun-legacy-scanner.ts"];

/** Library files missing or different in the Claude package (rewrites them unless `check`). */
export function alignLib(
  check: boolean,
  srcRoot = join(HOME, ".gemini", "plugins", "aphrody", "lib"),
  dstRoot = join(REPO_ROOT, "packages", "aphrody", "lib"),
): string[] {
  const drifted: string[] = [];
  for (const f of SHARED_LIB) {
    const a = join(srcRoot, f);
    const b = join(dstRoot, f);
    if (!existsSync(a)) continue;
    if (existsSync(b) && readFileSync(a).equals(readFileSync(b))) continue;
    drifted.push(toSlash(b));
    if (!check) {
      mkdirSync(dstRoot, { recursive: true });
      copyFileSync(a, b);
    }
  }
  return drifted;
}

const OWN_PLUGINS = /^(aphrody|bun)@aphrody$/;

/** Skill directory names Claude must not mirror: shipped by another installed plugin, or listed in profile.toml. */
export function excludedSkills(repo = REPO_ROOT): Set<string> {
  const out = new Set<string>();
  const read = (p: string) => (existsSync(p) ? readFileSync(p, "utf8") : "");
  const profile = read(join(repo, "profile.toml"));
  if (profile) {
    const parsed = Bun.TOML.parse(profile) as {
      skills?: { exclude?: string[] };
    };
    for (const n of parsed.skills?.exclude ?? []) out.add(n);
  }
  const installed = read(join(repo, "plugins", "installed_plugins.json"));
  const plugins = installed
    ? ((
        JSON.parse(installed) as {
          plugins?: Record<string, { installPath?: string }[]>;
        }
      ).plugins ?? {})
    : {};
  for (const [id, entries] of Object.entries(plugins)) {
    if (OWN_PLUGINS.test(id)) continue;
    for (const e of entries) {
      const dir = e.installPath ? join(e.installPath, "skills") : "";
      if (!dir || !existsSync(dir)) continue;
      for (const d of readdirSync(dir, { withFileTypes: true }))
        if (d.isDirectory() && existsSync(join(dir, d.name, "SKILL.md")))
          out.add(d.name);
    }
  }
  return out;
}

function files(
  dir: string,
  skip: Set<string>,
  base = dir,
): Map<string, string> {
  const out = new Map<string, string>();
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (dir === base && skip.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory())
      for (const [k, v] of files(p, skip, base)) out.set(k, v);
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

export function drift(
  src = AGY_SKILLS,
  dst = TARGET,
  merged = MERGED,
  skip = excludedSkills(),
): Drift {
  const a = files(src, skip);
  const b = files(dst, new Set());
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

export function apply(
  src = AGY_SKILLS,
  dst = TARGET,
  merged = MERGED,
  skip = excludedSkills(),
): Drift {
  const d = drift(src, dst, merged, skip);
  if (
    !d.added.length &&
    !d.changed.length &&
    !d.removed.length &&
    !d.merged.length
  )
    return d;
  rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, {
    recursive: true,
    filter: (p) => !skip.has(relative(src, p).split(sep)[0] ?? ""),
  });
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
  const mcp = [...alignMcp(check), ...alignLib(check)];
  const skip = excludedSkills();
  const n = readdirSync(AGY_SKILLS).filter((s) => !skip.has(s)).length;
  console.log(
    JSON.stringify({
      skills: n,
      added: d.added.length,
      changed: d.changed.length,
      removed: d.removed.length,
      merged: d.merged,
      mcp,
    }),
  );
  if (
    check &&
    (d.added.length ||
      d.changed.length ||
      d.removed.length ||
      d.merged.length ||
      mcp.length)
  )
    process.exit(1);
}
