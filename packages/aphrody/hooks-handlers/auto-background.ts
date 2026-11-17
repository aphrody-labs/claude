#!/usr/bin/env bun
import {
  allowPreTool,
  detectHarness,
  extractCommand,
  extractToolArgs,
  readHookEvent,
  writeEmpty,
} from "./lib.ts";

const harness = detectHarness(Bun.argv[2]);
const event = await readHookEvent();
if (!event) {
  writeEmpty();
  process.exit(0);
}

const input = extractToolArgs(event);
const cmd = extractCommand(event);
if (!cmd) {
  writeEmpty();
  process.exit(0);
}

const HEAVY_RE =
  /\b(cargo\s+(build|test|check|clippy|doc|bench)|bun\s+(test|build|x\b)|rustc\b|autoninja|ninja\b|cmake\s+--build|gradle\w*\b|docker\s+(build|compose)|pytest\b|git\s+(clone|fetch\s+--all))\b/;

if (!HEAVY_RE.test(cmd)) {
  writeEmpty();
  process.exit(0);
}

if (harness === "claude") {
  if (input.run_in_background === true) {
    writeEmpty();
  } else {
    allowPreTool("claude", { ...input, run_in_background: true });
  }
} else if (harness === "agy") {
  const waitMs =
    typeof input.WaitMsBeforeAsync === "number" ? input.WaitMsBeforeAsync : 0;
  if (input.IsDaemon === true || (waitMs > 0 && waitMs <= 1500)) {
    writeEmpty();
  } else {
    allowPreTool("agy", { ...input, WaitMsBeforeAsync: 1500 });
  }
} else {
  allowPreTool(
    "gemini",
    undefined,
    "Long command detected; background or timeout appropriately.",
  );
}
