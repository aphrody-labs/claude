#!/usr/bin/env bun
// Validates the aphrody plugin manifest, skills, agents and hooks, and that
// every TypeScript file in the repo type-checks under Bun.
import { resolve } from "node:path"

const root = resolve(import.meta.dir, "..")
const run = (cmd: string[]) => Bun.spawnSync(cmd, { cwd: root, stdout: "inherit", stderr: "inherit" }).exitCode
const steps = [
  ["claude", "plugin", "validate", resolve(root, "skills", "aphrody")],
  ["bun", "x", "tsc", "-p", "tsconfig.json"],
]
let code = 0
for (const s of steps) code ||= run(s)
process.exit(code)
