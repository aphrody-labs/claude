---
name: no-pauses
description: Never stop mid-task to report or wait; chain every remaining step until the whole request is done
metadata:
  node_type: memory
  type: feedback
  originSessionId: 3e586339-05ce-487a-bc54-5f2fe1de083d
  modified: 2026-11-16T09:59:46.317Z
---

No pauses: do not end a turn with work left (no "next I will...", no status-only stops, no waiting for a go).

**Why:** the user wants continuous autonomous execution of the full plan.

**How to apply:** after each step, start the next immediately; only report when everything requested is done and verified (see [[verify-dont-hedge]]).
