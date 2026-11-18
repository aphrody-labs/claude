import { afterAll, expect, test } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  discover,
  type Env,
  projectKey,
  renderGlobalOverrides,
  renderRepo,
  run,
} from "./profile.ts";

const base = mkdtempSync(join(tmpdir(), "profile-"));
afterAll(() => rmSync(base, { recursive: true, force: true }));
const put = (path: string, text: string) => (
  mkdirSync(join(path, ".."), { recursive: true }),
  writeFileSync(path, text)
);
const skill = (dir: string, name: string) =>
  put(join(dir, name, "SKILL.md"), `---\nname: ${name}\ndescription: d\n---\n`);

// Fixture: a cached plugin "p@m" with two skills, a command and an MCP server, one user skill, one user MCP server.
const config = join(base, "config");
const env: Env = { config, state: join(base, "claude.json") };
const plugin = join(config, "plugins", "cache", "m", "p", "1");
skill(join(plugin, "skills"), "keep");
skill(join(plugin, "skills"), "drop");
put(join(plugin, "commands", "cmd.md"), "x");
put(
  join(plugin, ".mcp.json"),
  JSON.stringify({ srv: { type: "http", url: "https://x" } }),
);
put(
  join(plugin, ".claude-plugin", "plugin.json"),
  JSON.stringify({ name: "p" }),
);
skill(join(config, "skills"), "mine");
put(
  join(config, "settings.json"),
  JSON.stringify({ enabledPlugins: { "p@m": true } }),
);
put(
  join(config, "plugins", "installed_plugins.json"),
  JSON.stringify({
    plugins: { "p@m": [{ scope: "user", installPath: plugin }] },
  }),
);
put(
  join(config, "plugins", "known_marketplaces.json"),
  JSON.stringify({ m: { source: { source: "github" } } }),
);
put(
  env.state,
  JSON.stringify({
    mcpServers: { user: {} },
    claudeAiMcpEverConnected: ["claude.ai Figma", "claude.ai Gmail"],
    projects: {},
  }),
);

test("discover reads plugin skills, commands, MCP servers and user entries", () => {
  const found = discover(env, "x");
  expect([...found.skills].sort()).toEqual([
    "mine",
    "p:cmd",
    "p:drop",
    "p:keep",
  ]);
  expect([...found.servers]).toEqual([
    ["claude.ai Figma", "claude.ai Figma"],
    ["claude.ai Gmail", "claude.ai Gmail"],
    ["user", "user"],
    ["plugin:p:srv", "srv"],
  ]);
  expect(discover(env, "x", { "p@m": false }).skills.size).toBe(1);
});

test("renderRepo turns off what the profile does not keep", () => {
  const found = discover(env, "x");
  const { settings, disabled, missing } = renderRepo(
    {
      mcp: { allow: ["srv", "local", "claude.ai Figma"] },
      skills: { on: ["p:keep", "ghost"], name_only: ["mine"] },
    },
    found,
    ["local", "other"],
  );
  expect(settings.skillOverrides).toEqual({
    mine: "name-only",
    "p:cmd": "off",
    "p:drop": "off",
  });
  expect(settings.disableClaudeAiConnectors).toBe(false);
  expect(settings.enabledMcpjsonServers).toEqual(["local"]);
  expect(disabled).toEqual(["claude.ai Gmail", "user"]);
  expect(missing).toEqual(["ghost"]);
});

test("renderGlobalOverrides reports unknown skills", () => {
  const { overrides, missing } = renderGlobalOverrides(
    { skills: { off: ["p:drop"], name_only: ["nope"] } },
    new Set(["p:drop"]),
  );
  expect(overrides).toEqual({ nope: "name-only", "p:drop": "off" });
  expect(missing).toEqual(["nope"]);
});

test("run applies a repo profile, then check and hook see no drift", () => {
  const repo = join(base, "repo");
  put(
    join(repo, ".claude", "profile.toml"),
    '[mcp]\nallow = ["srv"]\n[skills]\non = ["p:keep"]\n',
  );
  expect(run(repo, "check", env).drift).toEqual([
    ".claude/settings.json",
    "disabledMcpServers",
  ]);
  run(repo, "apply", env);
  expect(run(repo, "check", env).drift).toEqual([]);
  const state = JSON.parse(readFileSync(env.state, "utf8"));
  expect(state.projects[projectKey(repo)].disabledMcpServers).toEqual([
    "claude.ai Figma",
    "claude.ai Gmail",
    "user",
  ]);
  expect(state.mcpServers).toEqual({ user: {} });
  state.projects[projectKey(repo)].disabledMcpServers = [];
  writeFileSync(env.state, JSON.stringify(state));
  expect(run(repo, "hook", env).drift).toEqual(["disabledMcpServers"]);
  expect(run(repo, "check", env).drift).toEqual([]);
});

test("run on the config dir renders global skillOverrides only", () => {
  put(join(config, "profile.toml"), '[skills]\noff = ["p:drop"]\n');
  run(config, "apply", env);
  const settings = JSON.parse(
    readFileSync(join(config, "settings.json"), "utf8"),
  );
  expect(settings).toEqual({
    enabledPlugins: { "p@m": true },
    skillOverrides: { "p:drop": "off" },
  });
  expect(run(config, "check", env).drift).toEqual([]);
});
