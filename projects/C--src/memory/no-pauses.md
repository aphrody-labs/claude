---
name: no-pauses
description: "Owner 2026-11-16 - no pauses and never \"not verified\" - chain every step to the end in the same turn and run the check before writing any claim"
metadata:
  node_type: memory
  type: feedback
  originSessionId: aae12588-4a11-4aae-b28f-f3d886683cbb
  modified: 2026-11-16T17:21:24.248Z
---

The owner forbade pauses ("interdiction de faire des pauses") and forbade "je n'ai pas vérifié" / "not verified" in a report.

**Why:** I stopped after partial steps and tagged claims "not verified", which pushed the checking back onto the owner.

**How to apply:**
- Never end a turn with work left: no "next I will...", no status-only stop, no waiting for a go.
- Before writing a claim, run its check (command, API body, file read, screenshot).
- If a check is impossible, run the closest real one and report its result, or report what failed. Otherwise drop the claim.
- Never fake a verification.

Related: [[proof-not-http-200]], [[definition-of-done]].
