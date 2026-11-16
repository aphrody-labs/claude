#!/usr/bin/env bun
// Reproduces the global Claude Code setup on this machine:
// configures git identity and GitHub credentials, installs every plugin enabled in settings.json that is not installed yet,
// then validates the local aphrody plugin.
import { resolve } from "node:path"

const root = resolve(import.meta.dir, "..")
const settings = await Bun.file(resolve(root, "settings.json")).json()

function claude(...args: string[]) {
  const r = Bun.spawnSync(["claude", ...args], { stdout: "pipe", stderr: "pipe" })
  return { ok: r.exitCode === 0, out: r.stdout.toString() + r.stderr.toString() }
}

// Git identity and GitHub credentials: include the tracked gitconfig from the
// global git config, then let gh serve git credentials for github.com.
function git(...args: string[]) {
  return Bun.spawnSync(["git", ...args], { stdout: "pipe", stderr: "pipe" }).stdout.toString().trim()
}
const gitconfig = resolve(root, "gitconfig").replaceAll("\\", "/")
if (!git("config", "--global", "--get-all", "include.path").split("\n").includes(gitconfig)) {
  git("config", "--global", "--add", "include.path", gitconfig)
}
for (const key of ["user.name", "user.email"]) git("config", "--global", "--unset-all", key)
const gh = Bun.spawnSync(["gh", "auth", "setup-git"], { stdout: "pipe", stderr: "pipe" })
console.log(gh.exitCode === 0 ? "ok       git identity + gh credential helper" : "FAILED   gh auth setup-git (run gh auth login)")

// Marketplaces declared in settings.json (GitHub sources) must exist before
// their plugins can install; adding an existing one is a no-op failure.
const known = claude("plugin", "marketplace", "list").out
for (const [name, m] of Object.entries<any>(settings.extraKnownMarketplaces ?? {})) {
  if (known.includes(name) || m?.source?.source !== "github") continue
  const r = claude("plugin", "marketplace", "add", m.source.repo)
  console.log(`${r.ok ? "add     " : "FAILED  "} marketplace ${name}`)
}

const installed = claude("plugin", "list").out
const wanted = Object.entries(settings.enabledPlugins ?? {})
  .filter(([id, on]) => on === true && !id.endsWith("@builtin") && !id.endsWith("@skills-dir"))
  .map(([id]) => id)

let failed = 0
for (const id of wanted) {
  if (installed.includes(id)) { console.log(`ok       ${id}`); continue }
  const r = claude("plugin", "install", id, "--scope", "user")
  console.log(`${r.ok ? "install " : "FAILED  "} ${id}`)
  if (!r.ok) { failed++; console.error(r.out.trim()) }
}

const v = claude("plugin", "validate", resolve(root, "skills", "aphrody"))
console.log(v.ok ? "ok       aphrody@skills-dir (valid)" : `FAILED   aphrody@skills-dir\n${v.out.trim()}`)
process.exit(failed || !v.ok ? 1 : 0)
