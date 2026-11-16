# Aphrody Global Agent Config

Versioned, reproducible global configuration for **Claude Code**, **Antigravity (`agy`)**, **Gemini CLI**, and **Bun**.

## What Is Managed Here

- `packages/aphrody` (`aphrody`): unified cross-CLI autonomous plugin (recursive `worker`/`researcher` agents, non-blocking Bun hooks for auto-backgrounding, native `bun check` diagnostics, continuous self-learning journal capture/distillation, config sync, MCP integrations, `Autonome` output style, curated skills).
- `packages/bun` (`bun`): unified Bun-native command rewriter and 36 specialized Bun/Rust/JSC skills.
- `.claude-plugin/marketplace.json`: local Claude Code marketplace registering `aphrody` and `bun`.
- `gemini/`: portable templates materialized into `~/.gemini/` (`settings.json`, `projects.json`, `trustedFolders.json`, `config/*`, `antigravity-cli/*`).
- `projects/*/memory/`: deduplicated, conflict-free project memory synchronized with local SQLite memory stores.
- `scripts/`: `setup.ts` (idempotent cross-CLI provisioning), `check.ts` (strict multi-CLI validation + lint/type/hygiene), `sync.ts` (bidirectional sync + git push), `merge-brain.ts` (memory/SQLite/session compaction).

## Quickstart

```sh
bun run setup
bun run check
bun run sync
```
