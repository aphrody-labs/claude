---
name: no-pauses-verify-everything
description: "Owner 2026-11-16 - no pauses between steps, and never answer \"je n'ai pas vérifié\": verify every claim before reporting it"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 18399a2f-91cb-4d90-b8e6-a1a9d017f9ba
  modified: 2026-11-16T10:03:53.805Z
---

Owner 2026-11-16: "interdiction de faire des pauses" and "interdit de dire 'je n'ai pas vérifié'".

**Why:** I stopped after partial steps and reported claims tagged "non vérifié", which pushes the checking back onto him.

**How to apply:** chain every step to the end in the same turn. Run the check (command, API body, file read, screenshot) before writing a claim. If a check is impossible, run the closest real one and report its result. Drop the claim rather than ship it unverified. Never fake a verification. Related: [[proof-not-http-200]], [[plan-design-before-build]].
