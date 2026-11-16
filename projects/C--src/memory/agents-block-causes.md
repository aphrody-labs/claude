---
name: agents-block-causes
description: Why sub-agents stall here - no SendMessage or claude-in-chrome in sub-agents, too many concurrent writers on the shared tree, CI runs cancelled by other pushes; coordinate through the main session, cap at ~4 writers
metadata:
  type: feedback
---

On 2026-11-15 the owner reported agents often stuck and Claude Code crashing. What I measured:
- **Missing tools in sub-agents.** They have no SendMessage and no claude-in-chrome. Briefs saying "notify agent X" or "review through the browser" stall them: the restore agent could not tell the fleet agent the rescue was ready, and the Gemini reviews stalled.
- **Too many writers.** 9 to 12 agents ran in parallel on the shared tree. Each one hit index.lock contention, push races, and CI runs cancelled by other pushes (unixwin needed its own concurrency group). Overlapping scopes (identity, naming, tree-sitter, language audit) touched the same files.
- **Crash evidence.** Windows WER shows no claude.exe crash, only git.exe (2026-11-14 20:12), rustc and local nie binaries. Claude Code was at the newest npm version (2.1.325) when checked. Terminal crashes need `claude --debug-file <path>` to capture evidence.

**Why:** handoffs between agents and parallel writers on one tree turn into deadlocks and churn.

**How to apply:**
- I am the only coordinator: agents report to me and I relay the handoffs.
- At most about 4 concurrent writing agents, with disjoint file scopes declared in each brief. Serialize overlapping work.
- Browser steps stay with me.
- Long CI waits get their own concurrency group.
- See [[agent-report-vs-request]].
