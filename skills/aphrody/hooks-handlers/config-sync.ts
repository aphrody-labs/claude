#!/usr/bin/env bun
// Keeps the global config repo (the directory that contains this plugin, two
// levels up: <config>/skills/aphrody) in sync with its remote.
//   pull: fast-forward from origin at session start.
//   push: commit every tracked or whitelisted change and push at session end.
// Never blocks a session: every failure is reported on stderr and exits 0.
import { resolve } from "node:path"

const mode = process.argv[2]
const root = resolve(import.meta.dir, "..", "..", "..")

// Drain the hook event from stdin; the handler does not need its fields.
if (!process.stdin.isTTY) await new Response(Bun.stdin.stream()).text()

function git(...args: string[]) {
  const r = Bun.spawnSync(["git", "-C", root, ...args], { stdout: "pipe", stderr: "pipe" })
  return { ok: r.exitCode === 0, out: r.stdout.toString().trim(), err: r.stderr.toString().trim() }
}

if (!git("rev-parse", "--is-inside-work-tree").ok) process.exit(0)
const hasRemote = git("remote").out.length > 0

if (mode === "pull" && hasRemote) {
  const r = git("pull", "--ff-only", "--quiet")
  if (!r.ok) console.error(`config-sync pull: ${r.err}`)
} else if (mode === "push") {
  git("add", "-A")
  if (git("diff", "--cached", "--quiet").ok) process.exit(0)
  const host = process.env.COMPUTERNAME ?? process.env.HOSTNAME ?? "host"
  const c = git("commit", "--quiet", "-m", `config: sync from ${host}`)
  if (!c.ok) console.error(`config-sync commit: ${c.err}`)
  else if (hasRemote) {
    const p = git("push", "--quiet")
    if (!p.ok) console.error(`config-sync push: ${p.err}`)
  }
}
process.stdout.write("{}")
