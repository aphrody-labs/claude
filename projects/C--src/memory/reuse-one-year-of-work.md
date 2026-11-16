---
name: reuse-one-year-of-work
description: Owner 2026-11-16 - a year of his code exists outside the tree (370 crates, 696 npm packages, 101 repos, VPS containers, bunos, yolo, old aphrody CLI); read it before writing anything new
metadata:
  type: feedback
---

Owner 2026-11-16: "tu as oublié nos third party sur disque et projets legacy (bunos, bun distribution, yolo, ancien cli aphrody, nos npm et crates.io, vieux binaires et conteneurs des VPS), il faut lister leurs features et code pour ne pas repartir de rien, je code depuis 1 an sur ce projet".

**Why:** I planned `ay cloud`, ayNT and the Wine layer as new code without searching what he already built.

**How to apply:** before any new unit, search `docs/project/restore-inventory.json`, git history (`git log --all -S`), crates.io and npm under the aphrody names, the 296 `third_party/` dirs and the VPS for an existing implementation. List its features, then restore or reuse it. The monorepo is now `aphrody-labs/ay`. See [[code-before-docs]], [[assemble-not-reinvent]].
