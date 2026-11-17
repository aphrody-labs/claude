#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  detectHarness,
  emitContext,
  extractFilePath,
  readHookEvent,
  writeEmpty,
} from "./lib.ts";

const harness = detectHarness(Bun.argv[2]);
const event = await readHookEvent();
if (!event) {
  writeEmpty();
  process.exit(0);
}

const filePath = extractFilePath(event);
if (!filePath || !/\.(ts|tsx|mts|cts)$/i.test(filePath)) {
  writeEmpty();
  process.exit(0);
}

const normalized = filePath.replaceAll("\\", "/");
if (/\/(third_party|node_modules)\//i.test(normalized)) {
  writeEmpty();
  process.exit(0);
}

function findTsconfig(startFile: string): string | null {
  let dir = dirname(resolve(startFile));
  for (let i = 0; i < 6; i++) {
    const cfg = join(dir, "tsconfig.json");
    if (existsSync(cfg)) return cfg;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const tsconfig = findTsconfig(filePath);
if (!tsconfig) {
  writeEmpty();
  process.exit(0);
}

// The Aphrody runtime carries a native checker; --no-script keeps a project "check" script from shadowing it.
const hasBunCheck =
  (process.release as { sourceUrl?: string } | undefined)?.sourceUrl?.includes(
    "aphrody-labs/bun",
  ) === true ||
  Bun.spawnSync(["bun", "check", "--no-script", "--help"], {
    stdout: "ignore",
    stderr: "ignore",
  }).exitCode === 0;
const tscBin = join(
  dirname(tsconfig),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsc.exe" : "tsc",
);
const cmd = hasBunCheck
  ? ["bun", "check", "--no-script", "--no-pretty", filePath]
  : existsSync(tscBin)
    ? [tscBin, "--noEmit", "--pretty", "false", "-p", tsconfig]
    : [
        "bun",
        "x",
        "--bun",
        "tsc",
        "--noEmit",
        "--pretty",
        "false",
        "-p",
        tsconfig,
      ];

const proc = Bun.spawn(cmd, {
  cwd: dirname(tsconfig),
  stdout: "pipe",
  stderr: "pipe",
  stdin: "ignore",
});

const timer = setTimeout(() => {
  try {
    proc.kill();
  } catch {
    // Process already exited.
  }
}, 12_000);

const [out, err, code] = await Promise.all([
  new Response(proc.stdout).text(),
  new Response(proc.stderr).text(),
  proc.exited,
]);
clearTimeout(timer);

if (code === 0) {
  writeEmpty();
  process.exit(0);
}

const lines = `${out}\n${err}`
  .split(/\r?\n/)
  .map((l) => l.trimEnd())
  .filter(Boolean)
  .slice(0, 12);

if (lines.length === 0) {
  writeEmpty();
  process.exit(0);
}

emitContext(
  harness,
  "PostToolUse",
  `TypeScript check diagnostics (${tsconfig}):\n${lines.join("\n")}`,
);
