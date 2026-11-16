# Global Agent Config Repo

This repository versions portable configuration across Claude Code, Antigravity (`agy`), Gemini CLI, and Bun.

## Structure

- `CLAUDE.md`, `settings.json`, `gitconfig`: Claude Code global contract, permissions (NHITL, zero `deny`), and Git configuration.
- `packages/aphrody/`: unified cross-CLI plugin (recursive agents, non-blocking Bun hooks, MCP servers, `Autonome` output style, curated skills).
- `packages/bun/`: unified Bun-native workflow plugin (transparent command rewrites, context, and 36 Bun/Rust/JSC skills).
- `.claude-plugin/marketplace.json`: local Claude Code marketplace exposing `aphrody` and `bun`.
- `gemini/`: portable templates for `~/.gemini/` (`settings.json`, `projects.json`, `trustedFolders.json`, `config/*`, `antigravity-cli/*`) materialized by `scripts/setup.ts`.
- `projects/*/memory/`: consolidated per-workspace memories and `MEMORY.md`.
- `scripts/`: `setup.ts`, `check.ts`, `sync.ts`, `merge-brain.ts`, `github.ts`, `lib.ts`.

## Verification

Run `bun run check` after any edit to validate both plugins across `claude`, `agy --strict`, and `gemini`, typecheck and lint scripts, and enforce zero stale paths or `deny` rules.
