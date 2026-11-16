---
name: proof-not-http-200
description: HTTP 200 is never proof; proof = real browser render inspected, real content and working interaction, native app screenshots
metadata:
  type: feedback
---

An HTTP 200 (or a green CI run, or "build done") is never proof that a deliverable works. Proof is: the page or app rendered in a real browser (claude-in-chrome or chrome-devtools) with the screenshot actually looked at, the real content present (real names, icons, texts, assets, no placeholders), the main interaction exercised (click, load wasm, WebGPU frame drawn), and for native apps a real screenshot via agent-desktop/agent-browser.

**Why:** owner said on 2026-11-13 that "renvoie 200 n'est jamais une preuve reelle"; agents reported 200 as success while content was fake or the scene was flat.
**How to apply:** in every agent brief require screenshot inspection plus DOM/content assertions plus one exercised interaction; report what the screenshot shows, not the status code. See [[tests-real-targets]], [[subagent-models-cheap]].
