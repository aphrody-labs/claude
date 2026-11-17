---
name: agent-ops
description: "Operate the agent layer of this Claude config: search durable memory and past sessions (FTS5), list/run/install scheduled jobs from agent.toml, start the channel gateway (Telegram, Discord, iMessage), audit skills, and fold learning digests into memory. Use when asked to remember, recall, schedule, run something periodically, reach the agent from a chat app, or clean up skills."
---

# Agent ops

Everything lives in `~/.claude` (repo aphrody-labs/claude); config for the layer is `agent.toml`.

## Recall before asking

- MCP tool `memory_search` (server `memory` of the aphrody plugin) or `bun ~/.claude/scripts/memory.ts search <words> [--kind memory|instructions|digest|doc|session]`.
- `bun ~/.claude/scripts/memory.ts index --sessions` rebuilds the index incrementally (the hourly `memory-index` job does it).

## Schedule

- `bun ~/.claude/scripts/cron.ts list | run <id> | tick`.
- Add a job to `agent.toml` (`[[cron]]`: `kind = "cmd"` with `argv`, or `kind = "agent"` with `prompt`, run headless through `claude -p`), then `bun ~/.claude/scripts/cron.ts install` once: it registers a single OS tick (`aphrody-agent-tick`, every 5 minutes) through `Bun.cron`. `uninstall` removes it.
- Agent jobs cost tokens: they ship `enabled = false`.

## Channels

- `bun ~/.claude/scripts/gateway.ts [--dry]` starts one persistent Claude Code session with the `--channels` listed in `agent.toml`.
- Channel plugins are Anthropic's official `telegram`, `discord`, `imessage` (marketplace `claude-plugins-official`, `external_plugins/`). Install one, give it its bot token with its `configure` command, pair with its `access` command, then add `plugin:<name>@claude-plugins-official` to `[gateway].channels`.

## Learning loop

- Hooks journal failures, recoveries and corrections (`learning/journal.jsonl`) and write digests to `learning/inbox/`; session start announces pending digests.
- Distill: merge durable rules into `projects/<project>/memory/*.md` (one fact per file, no duplicates), delete the processed digests, then `bun ~/.claude/scripts/merge-brain.ts`. The `learn` skill has the rules.

## Skills and config health

- `bun ~/.claude/scripts/skills.ts` lints frontmatter and reports name collisions and near-duplicate descriptions.
- `bun ~/.claude/scripts/graph.ts` regenerates `docs/graph/`, `bun ~/.claude/scripts/matrix.ts` the feature matrix, `bun ~/.claude/scripts/bench.ts <label>` the hook latency numbers, `bun ~/.claude/scripts/check.ts` the full gate.
