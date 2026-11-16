import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  ensureDirLink,
  HOME,
  renderTemplate,
  REPO_ROOT,
  runCmd,
  templateVars,
  writeIfChanged,
} from "./lib.ts";
import { syncInstructionFiles } from "./sync.ts";

const KEEP_CLAUDE_PLUGINS = new Set(["aphrody@aphrody", "bun@aphrody"]);

function setupGit(): void {
  const gitconfig = resolve(REPO_ROOT, "gitconfig");
  const includes = runCmd([
    "git",
    "config",
    "--global",
    "--get-all",
    "include.path",
  ]).out.split(/\r?\n/);
  if (
    !includes.some(
      (l) => l.trim().replaceAll("\\", "/") === gitconfig.replaceAll("\\", "/"),
    )
  ) {
    runCmd(["git", "config", "--global", "--add", "include.path", gitconfig]);
  }
  for (const key of ["user.name", "user.email"]) {
    runCmd(["git", "config", "--global", "--unset-all", key]);
  }
  if (Bun.which("gh")) {
    runCmd(["gh", "auth", "setup-git"]);
  }
}

async function setupClaudePlugins(): Promise<void> {
  if (!Bun.which("claude")) return;

  const oldSkill = join(REPO_ROOT, "skills", "aphrody");
  if (existsSync(oldSkill)) rmSync(oldSkill, { recursive: true, force: true });

  const listRes = runCmd(["claude", "plugin", "list", "--json"]);
  if (listRes.ok && listRes.out) {
    try {
      const installed = JSON.parse(listRes.out) as Array<{ id: string }>;
      const toRemove = installed
        .filter((p) => !KEEP_CLAUDE_PLUGINS.has(p.id))
        .map((p) => p.id);
      if (toRemove.length > 0) {
        await Promise.all(
          toRemove.map(async (id) => {
            const p = Bun.spawn(
              ["claude", "plugin", "uninstall", id, "--scope", "user"],
              {
                cwd: REPO_ROOT,
                stdout: "ignore",
                stderr: "ignore",
                stdin: "ignore",
              },
            );
            await p.exited;
          }),
        );
      }
    } catch {
      // Ignore parse failure.
    }
  }

  for (const staleDir of [
    join(REPO_ROOT, "plugins", "cache", "anthropic-plugin-directory"),
    join(REPO_ROOT, "plugins", "cache", "claude-plugins-official"),
    join(REPO_ROOT, "plugins", "marketplaces", "claude-plugins-official"),
  ]) {
    if (existsSync(staleDir))
      rmSync(staleDir, { recursive: true, force: true });
  }
  runCmd([
    "claude",
    "plugin",
    "marketplace",
    "remove",
    "claude-plugins-official",
  ]);

  const mktList = runCmd(["claude", "plugin", "marketplace", "list", "--json"]);
  const hasMkt = mktList.ok && mktList.out.includes('"name": "aphrody"');
  if (!hasMkt) {
    runCmd(["claude", "plugin", "marketplace", "add", REPO_ROOT]);
  } else {
    runCmd(["claude", "plugin", "marketplace", "update", "aphrody"]);
  }

  for (const id of KEEP_CLAUDE_PLUGINS) {
    const res = runCmd([
      "claude",
      "plugin",
      "install",
      id,
      "--scope",
      "user",
      "-y",
    ]);
    if (!res.ok)
      console.error(`claude plugin install ${id}: ${res.err || res.out}`);
    runCmd(["claude", "plugin", "update", id, "--scope", "user"]);
  }
}

function setupAgyAndGemini(): void {
  const geminiRoot = join(HOME, ".gemini");
  const agyPluginsDir = join(geminiRoot, "config", "plugins");

  for (const name of ["aphrody", "bun"]) {
    ensureDirLink(join(REPO_ROOT, "packages", name), join(agyPluginsDir, name));
  }

  if (Bun.which("gemini")) {
    for (const name of ["aphrody", "bun"]) {
      const target = join(REPO_ROOT, "packages", name);
      const extLink = join(geminiRoot, "extensions", name);
      if (existsSync(extLink))
        rmSync(extLink, { recursive: true, force: true });
      const res = runCmd(["gemini", "extensions", "link", target, "--consent"]);
      if (!res.ok)
        console.error(`gemini extensions link ${name}: ${res.err || res.out}`);
    }
  }

  ensureDirLink(
    join(REPO_ROOT, "packages", "bun"),
    join(HOME, ".bun", "agent-plugin"),
  );

  const vars = templateVars();
  const tmplRoot = join(REPO_ROOT, "gemini");
  const simpleFiles = [
    "settings.json",
    "projects.json",
    "trustedFolders.json",
    join("config", "hooks.json"),
    join("config", "mcp_config.json"),
    join("config", "projects", "default-cli-project.json"),
    join("antigravity-cli", "hooks.json"),
  ];
  for (const rel of simpleFiles) {
    const src = join(tmplRoot, rel);
    if (!existsSync(src)) continue;
    const rendered = renderTemplate(
      readFileSync(src, "utf8"),
      vars,
      rel.endsWith(".json"),
    );
    writeIfChanged(join(geminiRoot, rel), rendered);
  }

  const agySettingsSrc = join(tmplRoot, "antigravity-cli", "settings.json");
  const agySettingsDst = join(geminiRoot, "antigravity-cli", "settings.json");
  if (existsSync(agySettingsSrc)) {
    const desired = JSON.parse(
      renderTemplate(readFileSync(agySettingsSrc, "utf8"), vars, true),
    ) as Record<string, unknown>;
    let current: Record<string, unknown> = {};
    if (existsSync(agySettingsDst)) {
      try {
        current = JSON.parse(readFileSync(agySettingsDst, "utf8")) as Record<
          string,
          unknown
        >;
      } catch {
        current = {};
      }
    }
    const oldWs = Array.isArray(current.trustedWorkspaces)
      ? (current.trustedWorkspaces as string[])
      : [];
    const wantedWs = Array.isArray(desired.trustedWorkspaces)
      ? (desired.trustedWorkspaces as string[])
      : [];
    const cleanWs = [...new Set([...wantedWs, ...oldWs])].filter((w) =>
      existsSync(w),
    );
    const merged = { ...current, ...desired, trustedWorkspaces: cleanWs };
    writeIfChanged(agySettingsDst, `${JSON.stringify(merged, null, 2)}\n`);
  }

  const piSettings = join(HOME, ".pi", "agent", "settings.json");
  if (existsSync(piSettings)) {
    try {
      const data = JSON.parse(readFileSync(piSettings, "utf8")) as Record<
        string,
        unknown
      >;
      if (typeof data.envFile === "string" && !existsSync(data.envFile)) {
        delete data.envFile;
        writeFileSync(piSettings, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      }
    } catch {
      // Ignore invalid JSON.
    }
  }
}

runCmd([
  "bun",
  "--no-install",
  join(REPO_ROOT, "scripts", "merge-brain.ts"),
  "--cleanup",
]);
// Hostinger stdio MCP servers (token from HOSTINGER_API_TOKEN, no OAuth); version pinned, referenced by absolute path in the plugin.
runCmd(["bun", "add", "-g", "@hostinger/mcp@4.3.0"]);
setupGit();
setupAgyAndGemini();
await setupClaudePlugins();
syncInstructionFiles();
runCmd(["bun", "--no-install", join(REPO_ROOT, "scripts", "merge-brain.ts")]);
console.log("Setup complete.");
