#!/usr/bin/env bun
// PostToolUse(Write|Edit), async: type-checks the TypeScript project that owns the edited
// file and reports only that file's errors back to Claude on its next turn.
import { existsSync, mkdirSync, rmSync } from "node:fs"
import { createHash } from "node:crypto"
import { dirname, join, relative, resolve } from "node:path"
import { tmpdir } from "node:os"
import { readEvent, respond, type FileInput, type PostToolUse } from "./lib.ts"

const ev = await readEvent<PostToolUse>()
const file = (ev?.tool_input as FileInput | undefined)?.file_path
if (!file || !/\.(c|m)?tsx?$/.test(file)) process.exit(0)

let dir = dirname(resolve(file))
while (!existsSync(join(dir, "tsconfig.json"))) {
  const up = dirname(dir)
  if (up === dir) process.exit(0)
  dir = up
}

// One check per project at a time: a newer edit while a check runs is covered by the next one.
const lock = join(tmpdir(), `aphrody-tsc-${createHash("sha1").update(dir).digest("hex").slice(0, 12)}`)
try { mkdirSync(lock) } catch { process.exit(0) }
try {
  const r = Bun.spawnSync(["bun", "x", "tsc", "-p", join(dir, "tsconfig.json"), "--noEmit", "--pretty", "false"], { cwd: dir, stdout: "pipe", stderr: "pipe" })
  const rel = relative(dir, resolve(file)).replaceAll("\\", "/")
  const errors = r.stdout.toString().split("\n").filter((l) => l.replaceAll("\\", "/").startsWith(rel) && l.includes("error TS"))
  if (errors.length) {
    respond({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: `tsc: ${errors.length} type error(s) in ${rel}\n${errors.slice(0, 30).join("\n")}` } })
  }
} finally {
  rmSync(lock, { recursive: true, force: true })
}
