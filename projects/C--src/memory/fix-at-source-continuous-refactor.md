---
name: fix-at-source-continuous-refactor
description: Owner 2026-11-16 - every legacy error is fixed at its source, architecture and sub-architecture are reorganized and refactored continuously, everything designed for scalability and performance
metadata:
  type: feedback
---

Owner 2026-11-16: "toutes les erreurs legacy doivent être fix à la source et toute l'architecture et sous-architecture doivent être réorganisées et refactorisées en permanence, tout doit être pensé pour la scalabilité et les performances".

**Why:** I listed the red CI causes as "pre-existing" instead of fixing them.

**How to apply:**
- A red check is never "pre-existing": find the root cause and fix it there, with no skip, allow-list or pin-back.
- Each touched unit leaves better structured than found.
- Choose designs that scale (one workspace, one lock, deduplicated deps, generated code) and measure performance.
- Never remove a feature. See [[purge-means-modernize]], [[plan-design-before-build]].
