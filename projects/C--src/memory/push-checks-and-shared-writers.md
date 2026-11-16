---
name: push-checks-and-shared-writers
description: "Owner 2026-11-16 said the whole session was full of errors - run the repo's own checks before pushing, keep low-disk build flags, check other writers before editing shared config, deliver the approved plan"
metadata:
  node_type: memory
  type: feedback
  originSessionId: aae12588-4a11-4aae-b28f-f3d886683cbb
  modified: 2026-11-16T18:02:49.206Z
---

Mistakes from the 2026-11-16 session (craft-anything in the Bun fork, the bun submodule, aphrody-git, memory consolidation), and the rule for each:

- **Pushed to the Bun fork's main without its checks.** It went red for several commits: the source lints scanned `src/craft`, the merged `bun migrate` code broke them, and Cargo.lock was stale. Before a push, run the repo's own gates: `bun test test/internal/source-lints/*`, the affected `cargo check`, and the CI status of the previous push.
- **Filled fr1's disk** with a debug `cargo test` (incremental cache and debug info). Set `CARGO_INCREMENTAL=0` and `CARGO_PROFILE_DEV_DEBUG=0`, check `df` first, and remove the target dir when done.
- **Edited the memory folder and `~/.claude/CLAUDE.md` while another session was editing them.** Then I blamed the wrong session. Before editing shared config, `ListAgents` and `git log`/mtime on the file, then coordinate. Name the culprit only from evidence (commit author or session).
- **Approved plan not delivered.** The plan was `bun craft`: CLI and MCP wired into the Bun binary, dedup onto Bun crates, end-to-end run. I absorbed the trees, then drifted to other requests. When a request moves on, say plainly what of the approved plan is still open.
- **Brittle shell edits** (sed with quotes and backslashes, a Python that isn't there) wasted turns. Use the Edit tool, or a script file, for anything with special characters.
- **Scripts reported results on the wrong signal** ("sync refused" read from empty stdout). Decide on exit codes.
- **Rewrote AGENTS.md rules another session owned** (the main freeze, the sources-of-truth rule) right after saying I'd keep them. When a rule belongs to someone else's active work, change it only on the owner's explicit word, and say so.

Related: [[agent-policy]], [[autonomy-nhitl]].
