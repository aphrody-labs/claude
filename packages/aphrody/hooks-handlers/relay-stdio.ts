#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const home = (
  process.env.USERPROFILE ??
  process.env.HOME ??
  homedir()
).replaceAll("\\", "/");
const candidates = [
  process.env.AI_OS_ROOT,
  join(home, "src", "ai-os"),
  "C:/src/ai-os",
  join(home, "ai-os"),
].filter((x): x is string => Boolean(x));

const rel = ["frameworks", "ai-os", "src", "relay", "cli.ts"] as const;
const target = candidates
  .map((c) => join(c, ...rel))
  .find((p) => existsSync(p));
if (!target) {
  console.error(
    "relay-stdio: could not locate frameworks/ai-os/src/relay/cli.ts (clone aphrody-dev/ai-os to ~/src/ai-os or set AI_OS_ROOT)",
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
