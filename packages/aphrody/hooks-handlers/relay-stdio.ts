#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const home = (
  process.env.USERPROFILE ??
  process.env.HOME ??
  homedir()
).replaceAll("\\", "/");
/** Directory holding the checkouts: WORKSPACE_ROOT, else the parent of the checkout containing the working directory. */
function checkoutsParent(start: string): string | undefined {
  for (let dir = start; ; dir = dirname(dir)) {
    if (existsSync(join(dir, ".git"))) return dirname(dir);
    if (dirname(dir) === dir) return undefined;
  }
}
const workspace = process.env.WORKSPACE_ROOT ?? checkoutsParent(process.cwd());
const candidates = [
  process.env.AI_OS_ROOT,
  workspace && join(workspace, "ai-os"),
  join(home, "src", "ai-os"),
  join(home, "ai-os"),
].filter((x): x is string => Boolean(x));

const rel = ["frameworks", "ai-os", "src", "relay", "cli.ts"] as const;
const target = candidates
  .map((c) => join(c, ...rel))
  .find((p) => existsSync(p));
if (!target) {
  console.error(
    "relay-stdio: could not locate frameworks/ai-os/src/relay/cli.ts (clone aphrody-dev/ai-os next to your other checkouts, set WORKSPACE_ROOT, or set AI_OS_ROOT)",
  );
  process.exit(1);
}

const child = Bun.spawn([process.execPath, target, "mcp-stdio"], {
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
  env: process.env,
});
process.exit(await child.exited);
