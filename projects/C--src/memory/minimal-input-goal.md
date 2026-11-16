---
name: minimal-input-goal
description: "Owner 2026-11-15 - a bare skill, single word or URL means turn the whole session context into a goal, decide every open point and execute it end to end, no questions"
metadata:
  node_type: memory
  type: feedback
  originSessionId: aae12588-4a11-4aae-b28f-f3d886683cbb
  modified: 2026-11-16T17:21:17.997Z
---

From 2026-11-15 the owner's inputs are minimal: a skill name, a word or a URL. I take all of the session context, make the most useful goal from it (pending tasks, agent results, blockers), decide every open point and execute it to completion. Aphrody has no human in the loop.

**Why:** the owner wants zero back-and-forth and no longer spells out tasks.

**How to apply:**
- State the goal in one line.
- Skip the interactive phases of skills, such as feature-dev's "ask the user".
- Build, test, commit (ay: scripts/commit.ts) and report results only ([[terse-reports]]).
- A mid-turn message is folded into the running work, not started over.

Related: [[agent-policy]].
