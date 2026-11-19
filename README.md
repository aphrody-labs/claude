# Aphrody global agent config

Versioned, reproducible global configuration for Claude Code, Antigravity (`agy`), Gemini CLI and Bun.

## What this repository manages

Claude Code as an agent in the OpenClaw / Hermes Agent model: the harness is the runtime, this repo adds memory search, a learning loop, a scheduler, a channel gateway launcher and a plugin set. Study and feature matrix: `docs/research/agents.md`.

- `CLAUDE.md`, `settings.json`, `gitconfig`: Claude Code global contract, permissions (NHITL, zero `deny`), and Git configuration.
- `profile.toml` + `scripts/profile.ts`: declarative Claude profiles. Global: MCP baseline and skill dedupe (`skillOverrides`). Per repository (`.claude/profile.toml` or `tools/claude/profile.toml`): allowed MCP servers, plugins and kept skills, rendered into the repo's `.claude/settings.json` and the per-project `disabledMcpServers`; re-applied at SessionStart (`--hook`), gated by `bun run check`.
- `agent.toml`: agent layer config (gateway channels, scheduled jobs).
- `packages/`: plugins. `aphrody` (agents, hooks-handlers, MCP servers `claude-bridge` and `memory`, skills, output style) and `bun` (command rewrites, Bun/Rust/JSC skills). Marketplace: `.claude-plugin/marketplace.json`.
- `skills/`: user-level skills outside any plugin (`agent-ops`, `linux-kernel-docs`); every other skill lives once, in the aphrody plugin (source `~/.gemini/plugins/aphrody/skills`, mirrored by `scripts/align-agy.ts`) or in the fairwind plugin (`aphrody-labs/fairwind`, `plugin/`, installed as `fairwind@fairwind`).
- `MAP.tsv` + `map.toml`: byte-exact directory map with the gate of each directory, rendered by `scripts/map.ts` (gated by `bun run check`), same shape as fairwind's `cargo xtask map`.
- `scripts/`: typed Bun scripts, each with a `.test.ts`: `setup`, `check`, `sync`, `merge-brain`, `memory`, `cron`, `gateway`, `graph`, `bench`, `matrix`, `skills`, `notify`, `statusline`, `lib`, `hygiene`; `ops/` holds account-level one-offs (`github`, `cloudflare-ci-token`).
- `docs/`: `research/` (agent framework matrix), `graph/` (module graph, JSON and Mermaid), `bench/` (hyperfine results).
- `gemini/`: portable templates for `~/.gemini/` materialized by `scripts/setup.ts`.
- `projects/*/memory/`: consolidated per-workspace memories and `MEMORY.md`.

## Quickstart

```sh
bun run setup      # provision claude, agy, gemini from this repo
bun run check      # full gate
bun test scripts packages
bun run memory search <words>
bun run cron list
bun run graph      # docs/graph
bun run bench <label>
```
