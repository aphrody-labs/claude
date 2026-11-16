---
name: agent-policy
description: Recursive parallelism, cheap subagent model selection, coordinator diffing against literal requests, and clean writer coordination
type: feedback
---

- Independent work runs in parallel across parallel tool calls, background jobs, and nested subagents that delegate recursively.
- Only spawn subagents when work is independent and substantial enough to warrant a separate brief; run small or sequential steps inline.
- Default subagents to cheap fast models (`sonnet` medium effort or `haiku`) unless high reasoning is strictly needed.
- Always act as coordinator on shared trees: scope writing subagents to disjoint files, commit cleanly without affecting sibling changes, and keep browser/authenticated UI checks in a session with browser access.
- Before reporting a subagent's result, diff every deliverable against the literal request (`done`, `substituted`, or `missing`). Never silently substitute your own architecture for the request; measure and report contradictions explicitly while delivering what was asked.
- Check host disk space (`fr1` / `fr2`) before launching heavy remote runs or clones.
