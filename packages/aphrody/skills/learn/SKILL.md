---
name: learn
description: Continuous recursive self-learning across Claude, Antigravity, and Gemini: inspect captured journal entries, distill non-duplicate rules into project memory, and keep SQLite/Markdown memory synchronized.
---

# Continuous Self-Learning Loop

Use this skill to inspect pending failures/recoveries/corrections captured by hooks and distill durable rules automatically without human intervention.

## Journal & State

- Raw events: `~/.claude/learning/journal.jsonl` (secret-redacted)
- Distilled digests: `~/.claude/learning/inbox/`
- Canonical memory: `~/.claude/projects/<project>/memory/*.md` + `MEMORY.md`
- Indexed stores: `~/.agent/memory.sqlite` and `~/.bun/agent/memory.db`

## Commands

- Inspect pending status: `bun ~/.claude/packages/aphrody/hooks-handlers/learn.ts status`
- Distill unreviewed journal entries into inbox digest: `bun ~/.claude/packages/aphrody/hooks-handlers/learn.ts distill`
- Sync Markdown memories to SQLite and clean stale clutter: `bun ~/.claude/scripts/merge-brain.ts`

## Rules for Distilling Memories

1. One durable fact per focused topic file (no bloated catch-all ledgers).
2. Check existing `MEMORY.md` entries first: merge into an existing topic file instead of creating duplicates or contradictions.
3. Delete or update obsolete entries whenever codebase/runtime facts change, then rebuild `MEMORY.md` and run `bun ~/.claude/scripts/merge-brain.ts`.
