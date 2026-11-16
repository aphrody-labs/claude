---
name: minimal-input-goal
description: Owner 2026-11-15 - a bare skill or single word with no args means turn the whole session context into a goal and execute it end to end, no human in the loop
metadata:
  type: feedback
---

Owner (2026-11-15): when he sends a skill, or a word with nothing after it, use all the session context to make it a goal and execute it. From now on his inputs will be minimal; I decide everything and execute. Aphrody has no human in the loop.

**Why:** Aphrody runs with no human in the loop; the owner wants to stop spelling out tasks.

**How to apply:**
- For a bare `/skill` or a single word, derive the most useful goal from the open threads of the session: pending tasks, agent results, blockers.
- Apply the skill to that goal and finish it in the same turn, without asking. Extends [[full-autonomy-tools]].
- Combine with [[consolidate-not-spawn]]: work inline or through existing agents, and deliver through skills and MCP.
