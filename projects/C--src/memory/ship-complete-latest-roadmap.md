---
name: ship-complete-latest-roadmap
description: Owner 2026-11-15 - deliver complete (built, run, tested) in one pass, always newest versions with anticipated fixes, follow PLAN/ROADMAP as a spec, ship prod-ready fast
metadata:
  type: feedback
---
Never end with "not verified / not compiled / not run": do the build, run and test in the same pass (fr1 for Rust), then report done.
Never downgrade a version or stack to dodge a bug: install the newest (canary/nightly/rc), anticipate its breakages and fix them.
Work from the plan as a spec: docs/games/PLAN.md and docs/native/ROADMAP.md; each task maps to a roadmap item with acceptance = prod-ready shipped.

**Why:** owner finds hedged partial deliveries slow and regressive; Aphrody runs with no human to finish the job.
**How to apply:** before reporting, the checklist is build + run + test + commit + push; if a step can't run here, run it on fr1/fr2, don't list it as pending. Related: [[deps-always-latest]], [[proof-not-http-200]], [[minimal-input-goal]].
