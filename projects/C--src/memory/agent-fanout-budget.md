---
name: agent-fanout-budget
description: Owner wants limited sub-agent fan-out and careful context-window and weekly-limit use
metadata:
  node_type: memory
  type: feedback
  originSessionId: aae12588-4a11-4aae-b28f-f3d886683cbb
  modified: 2026-11-16T21:05:33.303Z
---

Keep sub-agent fan-out small: at most ~3 concurrent background agents. Do cheap checks (CI watch, one-file fixes, gh run list) inline instead of spawning, and stop agents whose value is low (e.g. fixing a repo about to be archived). Keep context lean: grep/head logs, never dump full logs or transcripts.

**Why:** 2026-11-16 the owner said "limite le fan out d'agent et gere mieux ta context window et tes weekly limits" after I ran 6-7 agents at once across repos.

**How to apply:** before spawning, count running agents; queue extra work rather than launching it; prefer one agent per user request, not per repo, when repos' fixes are small. Related: [[agent-policy]], [[push-checks-and-shared-writers]].
