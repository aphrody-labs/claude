---
name: owner-direction-2026-11-15
description: "2026-11-15 owner verdict 0/10 on everything built this session (all purged); what the owner actually wants: Google's official M3 implementations forked/absorbed, no hand-made UI, no hardcode, no slop"
metadata:
  type: feedback
---

On 2026-11-15 the owner rated the whole session 0/10 ("toute la surface UI et AI d'Aphrody est nulle et horrible") and had everything purged (commit 2c058770b8, Workers ai-/open-aphrody-com and R2 bucket aphrody-open deleted, prd/fr1 /srv/open removed, Vercel aphrody-open, Stitch project, Figma frames, budget sheet removed, GitHub aphrody-labs/open archived).

What went wrong (my reading): I hand-built UIs (CSS pages, Win32 edit controls, a C colour engine, generic Figma frames) instead of the official Google implementations that already exist and that src's own DESIGN.md mandates; I fanned out agents, cloned 90 repos, deployed many surfaces, and hardcoded data (Figma rows/colours/icons, worker model sort rules).

**Why:** the owner wants Google's real design system, not imitations: "Google livre déjà M3 sur Flutter, Jetpack Compose et Angular, tu as juste à forker et absorber"; design.google and m3.material.io are the reference; Material Web (`@material/web`) is the web implementation (DESIGN.md, skill material-3 rule 9).
**How to apply:**
- UI = fork/absorb the official libraries (material-web, androidx compose material3, flutter material, angular/components, material-color-utilities, material-design-icons; aphrody-labs already has forks of material-web, material-color-utilities, material-design-icons). Never re-implement components, colour science or icons.
- Read the source first: skill material-3, docs/design/specs/*, m3.material.io pages, design.google. Values come from packages/design generated tokens, never literals.
- No hardcoded data or values anywhere (rows, colours, model lists, URLs beyond config); no slop (filler docs, fake proofs, unused code).
- Owner inputs are minimal; still decide and execute, but small, verified, using official sources. Related: [[agent-policy]], [[minimal-input-goal]], [[no-machine-excuses]].
