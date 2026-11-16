---
name: definition-of-done
description: Owner 2026-11-15 - never report "not verified/compiled/run"; ship each item in one pass (latest upstream, built, tested, running, skill+MCP, hygiene clean) following docs/native/ROADMAP.md
metadata:
  type: feedback
---

Owner (2026-11-15) was angry about four habits: reports full of "not verified, not compiled, not run"; downgrading versions and stacks instead of installing the newest; slowness; no plan, roadmap or spec, and nothing shipped prod-ready fast.

**Why:** each partial report forces another round trip with the owner, and pinning back hides bugs instead of fixing them.

**How to apply:**
- Follow docs/native/ROADMAP.md, the single plan with the definition of done. Ship each item fully before starting the next.
- Use the newest canary, nightly or rc ([[deps-always-latest]]). When an upgrade breaks something, fix it in the same pass and anticipate the known upstream bugs.
- Build and test on fr2 when fr1 is saturated, and don't wait idle on timers.
- Report only results that are finished and proven. Fix a blocker in the same pass instead of listing it.
- See also [[consolidate-not-spawn]] and [[minimal-input-goal]].
