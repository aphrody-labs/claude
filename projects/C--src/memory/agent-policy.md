---
name: agent-policy
description: "One rule for agents and parallelism (2026-11-16, supersedes the 2026-11-13..16 no-fan-out notes) - recursive sub-agents for independent work, cheap models, background jobs, one consolidated report"
metadata:
  node_type: memory
  type: feedback
  originSessionId: aae12588-4a11-4aae-b28f-f3d886683cbb
  modified: 2026-11-16T17:21:10.493Z
---

Latest owner direction (global CLAUDE.md "Execution" line and the 2026-11-16 request for a "no human in the loop, scalable, autonomous, recursive" system): independent work runs in parallel through parallel tool calls, background tasks and nested sub-agents that delegate recursively. Aphrody is agent-first with no human in the loop; the only exception is the owner's sign-in click.

**Why:** the earlier stop orders (2026-11-15 "stop spamming sub-agents", 2026-11-16 "do everything yourself") came from scattered, half-finished fan-out on a saturated fleet, not from parallelism itself. The owner's later instructions ask for recursion and autonomy.

**How to apply:**
- Spawn only for work that is independent and worth a brief. Small or sequential steps run inline.
- Sub-agents run on cheap models ([[subagent-models-cheap]]). Each one ends with a delivered artifact (commit, skill, MCP tool), not loose notes.
- Long steps run in the background on the right host ([[fleet-roles]]): fr1 builds, fr2 tests and research, the PC only downloads.
- Relay one consolidated report, diffed against the owner's literal request ([[agent-report-vs-request]]).
- No workflow, mass clone or fleet-wide build without a reason measured first. Check disk before building (fr1 filled up on 2026-11-16).
