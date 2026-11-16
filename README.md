# Aphrody global agent config

Versioned, reproducible global configuration for Claude Code, Antigravity (`agy`), Gemini CLI and Bun.

## What this repository manages

- `packages/aphrody` (`aphrody`): unified cross-CLI autonomous plugin (recursive `worker`/`researcher` agents, non-blocking Bun hooks for auto-backgrounding, native `bun check` diagnostics, continuous self-learning journal capture/distillation, config sync, MCP integrations, `Autonome` output style, curated skills).
- `packages/bun` (`bun`): unified Bun-native command rewriter and 36 specialized Bun/Rust/JSC skills.
- `.claude-plugin/marketplace.json`: local Claude Code marketplace registering `aphrody` and `bun`.
- `gemini/`: portable templates materialized into `~/.gemini/` (`settings.json`, `projects.json`, `trustedFolders.json`, `config/*`, `antigravity-cli/*`).
- `projects/*/memory/`: deduplicated, conflict-free project memory synchronized with local SQLite memory stores.
- `scripts/`:
  - `setup.ts`: idempotent cross-CLI provisioning.
  - `check.ts`: strict multi-CLI validation, lint, type and hygiene checks.
  - `sync.ts`: bidirectional sync and git push.
  - `merge-brain.ts`: memory, SQLite and session compaction.
  - `github.ts`: audit and clean the GitHub account (descriptions, archived duplicates, orgs).
  - `cloudflare-ci-token.ts`: mint an account-owned Cloudflare token and store it as Actions secrets of the given repositories.
  - `notify.ts`: send a message to live Claude Code sessions through the relay mailbox or the native pipe.
  - `statusline.ts`: status line (model, folder, branch, context use, cost) without subprocesses.
  - `lib.ts`: shared helpers.

## Quickstart

```sh
bun run setup
bun run check
bun run sync
bun run github
```
