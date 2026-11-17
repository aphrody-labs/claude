#!/usr/bin/env bun
// Gateway launcher: a persistent Claude Code session wired to the chat channels listed in agent.toml
// (Anthropic's official telegram / discord / imessage channel plugins, MCP servers that push messages into the session).
//   bun scripts/gateway.ts [--dry]
import { loadConfig } from "./cron.ts";

export function gatewayArgv(channels: string[], model: string): string[] {
  return [
    "claude",
    "--model",
    model,
    ...(channels.length ? ["--channels", ...channels] : []),
  ];
}

if (import.meta.main) {
  const cfg = loadConfig();
  const argv = gatewayArgv(cfg.gateway.channels, cfg.agent.model);
  if (cfg.gateway.channels.length === 0)
    console.error(
      "agent.toml: [gateway].channels is empty; starting a plain session.",
    );
  if (Bun.argv.includes("--dry")) {
    console.log(argv.join(" "));
    process.exit(0);
  }
  const p = Bun.spawn(argv, {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  process.exit(await p.exited);
}
