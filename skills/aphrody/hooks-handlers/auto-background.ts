#!/usr/bin/env bun
// PreToolUse(Bash): runs long commands (builds, tests, installs, network, remote shells)
// as background tasks so the session keeps working in parallel and is notified on exit.
import { readEvent, respond, type BashInput, type PreToolUse } from "./lib.ts"

const LONG = [
  /\b(cargo|cross)\s+(build|test|check|clippy|run|install|doc|bench|nextest)\b/,
  /\b(bun|npm|pnpm|yarn)\s+(install|i|ci|add|update|test|run\s+(build|test|check|lint|setup))\b/,
  /\bbun\s+x\s+(tsc|playwright|vitest)\b/,
  /\b(go)\s+(build|test|install|mod\s+download)\b/,
  /\b(pytest|tox|nox|uv\s+(sync|pip\s+install)|pip\s+install)\b/,
  /\b(docker|podman)\s+(build|compose|pull|push|run)\b/,
  /\b(make|cmake|ninja|meson|gradle|gradlew|mvn|msbuild|dotnet\s+(build|test|publish))\b/,
  /\bgit\s+(clone|fetch|push|pull|submodule\s+update|lfs)\b/,
  /\b(ssh|scp|rsync)\s/,
  /\b(winget|choco|scoop|rustup|nix|pacman|apt(-get)?)\s+(install|upgrade|update|build|develop|-S)/,
  /\bclaude\s+(-p|plugin\s+(install|update))\b/,
]

const ev = await readEvent<PreToolUse>()
if (ev?.tool_name === "Bash") {
  const input = ev.tool_input as BashInput
  if (input.run_in_background === undefined && LONG.some((re) => re.test(input.command))) {
    respond({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
        updatedInput: { ...input, run_in_background: true },
        additionalContext: "aphrody: long command moved to a background task; continue other work and read its output when notified.",
      },
    })
  }
}
