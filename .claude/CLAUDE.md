# Global Agent Config Repo

This repository versions portable configuration across Claude Code, Antigravity (`agy`), Gemini CLI, and Bun.

## Structure

- `CLAUDE.md`, `settings.json`, `gitconfig`: Claude Code global contract, permissions (NHITL, zero `deny`), and Git configuration.
- `agent.toml`: agent layer config (gateway channels, scheduled jobs).
- `packages/`: plugins. `aphrody` (agents, hooks-handlers, MCP servers `claude-bridge` and `memory`, skills, output style) and `bun` (command rewrites, Bun/Rust/JSC skills). Marketplace: `.claude-plugin/marketplace.json`.
- `skills/`: user-level skills outside any plugin (`agent-ops`).
- `scripts/`: typed Bun scripts, each with a `.test.ts`: `setup`, `check`, `sync`, `merge-brain`, `memory`, `cron`, `gateway`, `graph`, `bench`, `matrix`, `skills`, `notify`, `statusline`, `lib`, `hygiene`; `ops/` holds account-level one-offs (`github`, `cloudflare-ci-token`).
- `docs/`: `research/` (agent framework matrix), `graph/` (module graph, JSON and Mermaid), `bench/` (hyperfine results).
- `gemini/`: portable templates for `~/.gemini/` materialized by `scripts/setup.ts`.
- `projects/*/memory/`: consolidated per-workspace memories and `MEMORY.md`.

## Verification

`bun run check` runs the full gate (plugin validation for claude, agy and gemini, typecheck, lint, hygiene, hook smoke tests); `bun test scripts packages` runs every unit test. Use `bun check --no-script <file>` for a native type check: plain `bun check` runs the `check` script of package.json.
