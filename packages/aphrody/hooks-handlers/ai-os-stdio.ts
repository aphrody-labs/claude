#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

const home = (
  process.env.USERPROFILE ??
  process.env.HOME ??
  homedir()
).replaceAll("\\", "/");

/** The user-level value of a variable this process was started without (Windows: HKCU\Environment), read with the system reg.exe. */
function userEnv(name: string): string | undefined {
  const systemRoot = process.env.SystemRoot ?? process.env.windir;
  if (process.platform !== "win32" || !systemRoot) return undefined;
  const r = Bun.spawnSync(
    [
      join(systemRoot, "System32", "reg.exe"),
      "query",
      "HKCU\\Environment",
      "/v",
      name,
    ],
    {
      stdout: "pipe",
      stderr: "ignore",
      stdin: "ignore",
    },
  );
  return r.stdout
    .toString()
    .match(new RegExp(`^\\s*${name}\\s+REG_\\w+\\s+(.+?)\\s*$`, "m"))?.[1];
}

// Explicit configuration only, never the working directory: AY_ROOT, then the checkouts directory
// (WORKSPACE_ROOT, from the environment or the user environment), then ~/src and ~.
const workspace = process.env.WORKSPACE_ROOT ?? userEnv("WORKSPACE_ROOT");
const candidates = [
  process.env.AY_ROOT,
  workspace && join(workspace, "ay"),
  join(home, "src", "ay"),
  join(home, "ay"),
].filter((x): x is string => Boolean(x));

const git = Bun.which("git");
/** A checkout is trusted when it is not the home or a filesystem root and its origin is aphrody-dev/ay. */
function trusted(dir: string): boolean {
  const abs = resolve(dir).replaceAll("\\", "/");
  if (abs === home || dirname(abs) === abs || !git) return false;
  const r = Bun.spawnSync([git, "-C", abs, "remote", "get-url", "origin"], {
    stdout: "pipe",
    stderr: "ignore",
    stdin: "ignore",
  });
  return /[/:]aphrody-dev\/ay(\.git)?$/i.test(r.stdout.toString().trim());
}

const rel = ["packages", "ai-os", "src", "server", "cli.ts"] as const;
const target = candidates.find(
  (c) => existsSync(join(c, ...rel)) && trusted(c),
);
if (!target) {
  console.error(
    "ai-os-stdio: no trusted aphrody-dev/ay checkout with packages/ai-os/src/server/cli.ts (clone it next to your other checkouts and set WORKSPACE_ROOT, or set AY_ROOT)",
  );
  process.exit(1);
}

const child = Bun.spawn([process.execPath, join(target, ...rel), "mcp-stdio"], {
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
  env: { ...process.env, AY_ROOT: target },
});
process.exit(await child.exited);
