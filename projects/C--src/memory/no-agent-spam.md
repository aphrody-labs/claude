---
name: no-agent-spam
description: Do the work myself in the main thread; do not fan tasks out to subagents
metadata:
  node_type: memory
  type: feedback
  originSessionId: 3e586339-05ce-487a-bc54-5f2fe1de083d
  modified: 2026-11-16T13:53:41.135Z
---

Do the work myself instead of launching background agents.

**Why:** on 2026-11-16 the user said "pourquoi tu spam les agents, fais tout toi-même" after I launched three agents at once (Figma, specs, nie e2e).

**How to apply:** execute requests directly with tools, sequentially in the main thread. Use a subagent only if the user asks for one. See [[no-pauses]], [[fix-it-yourself]].
