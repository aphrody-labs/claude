---
name: plan-design-before-build
description: "Owner 2026-11-16 called the shenron/rosegriffon/admin/tv/koharu output slop - think, plan, Figma mockups, read docs first; zero visual or feature regression"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 18399a2f-91cb-4d90-b8e6-a1a9d017f9ba
  modified: 2026-11-16T07:27:03.809Z
---

Owner 2026-11-16: "pourquoi c'est du slop ? vous deviez réfléchir, planifier, faire des maquettes Figma, lire les documentations, aucune régression visuelle ni de feature".

**Why:** I launched ~15 parallel agents straight into build and deploy on prd. None of them made a design, read upstream docs or kept a before/after baseline. The result was builds failing on a stale lock and Turbopack, a read-only admin replacing a full one, three subdomains serving the same page, and evidence reduced to health endpoints.

**How to apply:**
- For every product or UI change, follow this order:
  1. Write a written plan.
  2. Read the upstream docs (Context7, docs.rs).
  3. Make a Figma mockup validated against design.google.
  4. Capture a "before" baseline: screenshots of every page and a feature list.
  5. Build.
  6. Diff the "after" against that baseline: visual pixel diff and a feature checklist.
  7. Deploy only when the diff shows zero regression.
- Never replace a working feature with a partial rewrite; the new one runs next to it until it reaches parity.
- See [[proof-not-http-200]] and [[purge-means-modernize]].
