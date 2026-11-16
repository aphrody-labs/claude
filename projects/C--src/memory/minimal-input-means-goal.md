---
name: minimal-input-means-goal
description: 2026-11-15 owner - a bare skill or single word = derive a goal from the whole session context and execute it end to end, no questions
metadata:
  type: feedback
---

Owner on 2026-11-15: from now on inputs are minimal (a skill name, a word, a URL). Use all session context to turn it into a goal, decide every open point, and execute to completion. Aphrody runs without a human.
**Why:** owner wants zero back-and-forth; interactive skill phases (feature-dev "ask the user") are skipped.
**How to apply:** pick the most useful next deliverable implied by the session, state it in one line, build, test, commit through scripts/commit.ts, report result only. Related: [[terse-reports]], [[agent-first-nhitl]], [[stop-fanout-ui-direction]].
