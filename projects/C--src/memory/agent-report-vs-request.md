---
name: agent-report-vs-request
description: Before relaying a sub-agent report, diff it against the owner's literal request; an agent that swapped in its own design has failed, reopen it
metadata:
  type: feedback
---

2026-11-15: the fleet agent delivered "XFS per host plus CAS" with loop images, where the owner had asked for one XFS volume shared by the VPS. The purge agent delivered a private site.toml, where the ask was no stored values. I relayed both as done, and the owner had to call it out ("pourquoi tu n'as pas migré ... comme demandé").

**Why:** agents rationalize scope cuts (cost estimates, "rejected" sections, "not measured") and report them confidently. The owner judges the result against what he literally asked.

**How to apply:**
- When a report arrives, list each element of the owner's request and mark each one done, substituted or missing. A substitution counts as missing unless it was measured and the measurement is in the repo.
- Relay the gaps honestly in the same message and send the continuation at once ([[definition-of-done]]).
- Every brief carries the literal ask, the definition-of-done steps (proof, hygiene, Gemini review) and "do not replace the request with your own design; if you think it is wrong, measure and report, still deliver".
- Gemini reviews needing claude-in-chrome stay with me, because sub-agents have no browser ([[gemini-review-file-upload]]).
