#!/usr/bin/env bun
// Declarative Claude Code profiles, global and per repository, applied from the live install.
//   bun scripts/profile.ts [--check] [dir]   dir = ~/.claude (global) or a repository (default: cwd)
//   bun scripts/profile.ts --hook            SessionStart: re-apply the cwd repository's MCP toggles when they drift (silent)
//
// Global profile  ~/.claude/profile.toml: [mcp] baseline (servers every project keeps, read by mcp-profiles.ts),
//                 [skills] off / name_only, rendered into the `skillOverrides` key of ~/.claude/settings.json.
// Repo profile    <repo>/.claude/profile.toml or <repo>/tools/claude/profile.toml: allow-list semantics.
//                 [mcp] allow (server names; claude.ai connectors as "claude.ai <Name>")
//                       -> enabledMcpjsonServers, disableClaudeAiConnectors (only when no connector is allowed) and the
//                       per-project disabledMcpServers in ~/.claude.json (what `/mcp disable` writes)
//                 [plugins] id = bool               -> enabledPlugins overrides
//                 [skills] on / name_only           -> every other discovered skill is "off"
//                 rendered into <repo>/.claude/settings.json (generated, committed).
// allowedMcpServers is not used: it matches plugin stdio servers on their expanded, machine-specific command line.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

export type GlobalProfile = {
  mcp?: { baseline?: string[] };
  skills?: { off?: string[]; name_only?: string[] };
};
export type RepoProfile = {
  mcp?: { allow?: string[] };
  plugins?: Record<string, boolean>;
  skills?: { on?: string[]; name_only?: string[] };
};
type Install = { scope: string; installPath: string; projectPath?: string };
type Manifest = {
  skills?: string | string[];
  commands?: string | string[];
  mcpServers?: string | Record<string, unknown>;
};
export type Env = { config: string; state: string };

export const defaultEnv = (): Env => {
  const config = Bun.env.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude");
  return {
    config,
    state: Bun.env.CLAUDE_CONFIG_DIR
      ? join(config, ".claude.json")
      : join(homedir(), ".claude.json"),
  };
};
export const projectKey = (dir: string): string =>
  resolve(dir).replace(/\\/g, "/");
const readJson = <T>(path: string): T | undefined =>
  existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : undefined;
const readToml = <T>(path: string): T | undefined =>
  existsSync(path)
    ? (Bun.TOML.parse(readFileSync(path, "utf8")) as T)
    : undefined;
const sortKeys = <V>(o: Record<string, V>) =>
  Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

export function repoProfilePath(dir: string): string | undefined {
  return [
    join(dir, ".claude", "profile.toml"),
    join(dir, "tools", "claude", "profile.toml"),
  ].find(existsSync);
}
export const globalProfile = (env: Env): GlobalProfile =>
  readToml<GlobalProfile>(join(env.config, "profile.toml")) ?? {};

// --- discovery ---------------------------------------------------------------------------------
function frontmatterName(file: string, fallback: string): string {
  const head = readFileSync(file, "utf8").split(/^---\s*$/m)[1] ?? "";
  return /^name:\s*["']?([^"'\r\n]+)/m.exec(head)?.[1]?.trim() ?? fallback;
}
function skillsIn(dir: string, prefix: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(dir, e.name, "SKILL.md")))
    .map((e) => frontmatterName(join(dir, e.name, "SKILL.md"), e.name))
    .map((name) => (prefix ? `${prefix}:${name}` : name));
}
function commandsIn(dir: string, prefix: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => `${prefix}:${f.slice(0, -3)}`);
}

export type Discovery = { skills: Set<string>; servers: Map<string, string> };

/** Skills and MCP servers of the plugins enabled for `key` (user settings merged with `overrides`). */
export function discover(
  env: Env,
  key: string,
  overrides: Record<string, boolean> = {},
): Discovery {
  const user =
    readJson<{ enabledPlugins?: Record<string, boolean> }>(
      join(env.config, "settings.json"),
    ) ?? {};
  const enabled = { ...user.enabledPlugins, ...overrides };
  const installed =
    readJson<{ plugins: Record<string, Install[]> }>(
      join(env.config, "plugins", "installed_plugins.json"),
    )?.plugins ?? {};
  const markets =
    readJson<Record<string, { source: { source: string; path?: string } }>>(
      join(env.config, "plugins", "known_marketplaces.json"),
    ) ?? {};
  const skills = new Set(skillsIn(join(env.config, "skills"), ""));
  const servers = new Map<string, string>(); // toggle name -> bare name
  const state =
    readJson<{ mcpServers?: object; claudeAiMcpEverConnected?: string[] }>(
      env.state,
    ) ?? {};
  // claude.ai connectors this account ever connected (Claude Code's own record of them).
  for (const name of state.claudeAiMcpEverConnected ?? [])
    servers.set(name, name);
  for (const name of Object.keys(state.mcpServers ?? {}))
    servers.set(name, name);

  for (const [id, installs] of Object.entries(installed)) {
    if (enabled[id] !== true) continue;
    const install = installs.find(
      (e) => e.scope === "user" || e.projectPath === key,
    );
    if (!install) continue;
    const [plugin, market] = id.split("@") as [string, string];
    let dir = install.installPath;
    const source = markets[market]?.source;
    if (source?.source === "directory" && source.path) {
      // Directory marketplaces load plugins in place from their source, not from the install cache.
      const entry = readJson<{ plugins: { name: string; source: unknown }[] }>(
        join(source.path, ".claude-plugin", "marketplace.json"),
      )?.plugins.find((p) => p.name === plugin);
      if (typeof entry?.source === "string")
        dir = join(source.path, entry.source);
    }
    const manifest =
      readJson<Manifest>(join(dir, ".claude-plugin", "plugin.json")) ??
      readJson<Manifest>(join(dir, "plugin.json")) ??
      {};
    for (const d of manifest.skills === undefined
      ? ["skills"]
      : [manifest.skills].flat())
      for (const s of skillsIn(join(dir, d), plugin)) skills.add(s);
    for (const d of manifest.commands === undefined
      ? ["commands"]
      : [manifest.commands].flat())
      for (const s of commandsIn(join(dir, d), plugin)) skills.add(s);
    const declared = manifest.mcpServers;
    let names: string[];
    if (typeof declared === "object") names = Object.keys(declared);
    else {
      const file = readJson<Record<string, unknown>>(
        join(dir, typeof declared === "string" ? declared : ".mcp.json"),
      );
      names = file ? Object.keys((file.mcpServers as object) ?? file) : [];
    }
    for (const server of names)
      servers.set(`plugin:${plugin}:${server}`, server);
  }
  return { skills, servers };
}

// --- rendering ---------------------------------------------------------------------------------
export function renderGlobalOverrides(
  profile: GlobalProfile,
  found: Set<string>,
): { overrides: Record<string, string>; missing: string[] } {
  const overrides: Record<string, string> = {};
  for (const s of profile.skills?.off ?? []) overrides[s] = "off";
  for (const s of profile.skills?.name_only ?? []) overrides[s] = "name-only";
  return {
    overrides: sortKeys(overrides),
    missing: Object.keys(overrides).filter((s) => !found.has(s)),
  };
}

export function renderRepo(
  profile: RepoProfile,
  found: Discovery,
  mcpJson: string[],
) {
  const allow = profile.mcp?.allow ?? [];
  const nameOnly = profile.skills?.name_only ?? [];
  const keep = new Set([...(profile.skills?.on ?? []), ...nameOnly]);
  const skillOverrides: Record<string, string> = {};
  for (const name of [...found.skills].sort()) {
    if (nameOnly.includes(name)) skillOverrides[name] = "name-only";
    else if (!keep.has(name)) skillOverrides[name] = "off";
  }
  return {
    settings: {
      $schema: "https://json.schemastore.org/claude-code-settings.json",
      disableClaudeAiConnectors: !allow.some((n) => n.startsWith("claude.ai ")),
      enabledMcpjsonServers: mcpJson.filter((n) => allow.includes(n)),
      enabledPlugins: sortKeys(profile.plugins ?? {}),
      skillOverrides,
    },
    disabled: [...found.servers]
      .filter(([, bare]) => !allow.includes(bare))
      .map(([toggle]) => toggle)
      .sort(),
    missing: [...keep].filter((s) => !found.skills.has(s)),
  };
}

// --- state -------------------------------------------------------------------------------------
const currentDisabled = (env: Env, key: string): string[] =>
  [
    ...(readJson<{
      projects?: Record<string, { disabledMcpServers?: string[] }>;
    }>(env.state)?.projects?.[key]?.disabledMcpServers ?? []),
  ].sort();

export function writeDisabled(env: Env, key: string, disabled: string[]): void {
  // Re-read right before writing: running sessions rewrite ~/.claude.json too.
  const fresh =
    readJson<{ projects?: Record<string, Record<string, unknown>> }>(
      env.state,
    ) ?? {};
  fresh.projects ??= {};
  fresh.projects[key] = {
    ...fresh.projects[key],
    disabledMcpServers: disabled,
  };
  const tmp = `${env.state}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(fresh, null, 2));
  renameSync(tmp, env.state);
}

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);
const fileText = (path: string) =>
  existsSync(path) ? readFileSync(path, "utf8").replace(/\r\n/g, "\n") : "";

/** Applies or checks one target. Returns the list of drifted items (empty = in sync). */
export function run(
  dir: string,
  mode: "apply" | "check" | "hook",
  env = defaultEnv(),
): { drift: string[]; summary: string; missing: string[] } {
  const root = resolve(dir);
  if (projectKey(root) === projectKey(env.config)) {
    const settingsPath = join(env.config, "settings.json");
    const settings = JSON.parse(readFileSync(settingsPath, "utf8")) as Record<
      string,
      unknown
    >;
    const { skills } = discover(env, projectKey(root));
    const { overrides, missing } = renderGlobalOverrides(
      globalProfile(env),
      skills,
    );
    const drift = same(settings.skillOverrides ?? {}, overrides)
      ? []
      : ["skillOverrides in settings.json"];
    if (mode === "apply" && drift.length) {
      const next: Record<string, unknown> = {
        ...settings,
        skillOverrides: overrides,
      };
      if (!Object.keys(overrides).length) delete next.skillOverrides;
      writeFileSync(settingsPath, `${JSON.stringify(next, null, 2)}\n`);
    }
    return {
      drift,
      missing,
      summary: `global: ${skills.size} skills, ${Object.keys(overrides).length} overridden`,
    };
  }

  const profilePath = repoProfilePath(root);
  if (!profilePath)
    return { drift: [], missing: [], summary: `${root}: no profile` };
  const profile = readToml<RepoProfile>(profilePath)!;
  const key = projectKey(root);
  const found = discover(env, key, profile.plugins);
  const mcpJson = Object.keys(
    readJson<{ mcpServers?: object }>(join(root, ".mcp.json"))?.mcpServers ??
      {},
  );
  const { settings, disabled, missing } = renderRepo(profile, found, mcpJson);
  const out = join(root, ".claude", "settings.json");
  const text = `${JSON.stringify(settings, null, 2)}\n`;
  const drift: string[] = [];
  if (mode !== "hook" && fileText(out) !== text)
    drift.push(".claude/settings.json");
  if (!same(currentDisabled(env, key), disabled))
    drift.push("disabledMcpServers");
  if (mode === "apply" && drift.includes(".claude/settings.json")) {
    mkdirSync(join(root, ".claude"), { recursive: true });
    writeFileSync(out, text);
  }
  if (mode !== "check" && drift.includes("disabledMcpServers"))
    writeDisabled(env, key, disabled);
  const overridden = Object.keys(settings.skillOverrides).length;
  return {
    drift,
    missing,
    summary: `${key}: ${found.skills.size} skills (${overridden} overridden), ${found.servers.size} MCP servers (${disabled.length} disabled)`,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const mode = args.includes("--hook")
    ? "hook"
    : args.includes("--check")
      ? "check"
      : "apply";
  const dir = args.find((a) => !a.startsWith("--")) ?? process.cwd();
  try {
    const { drift, summary, missing } = run(dir, mode);
    if (mode === "hook") process.exit(0);
    if (missing.length)
      console.error(
        `profile names skills that are not installed: ${missing.join(", ")}`,
      );
    if (mode === "check" && drift.length) {
      console.error(
        `drift: ${drift.join(", ")}; run bun ~/.claude/scripts/profile.ts ${dir}`,
      );
      process.exit(1);
    }
    console.log(
      `${mode === "check" ? "up to date" : drift.length ? `applied (${drift.join(", ")})` : "in sync"}: ${summary}`,
    );
  } catch (error) {
    if (mode === "hook") process.exit(0); // never block a session start
    throw error;
  }
}
