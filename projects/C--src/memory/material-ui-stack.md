---
name: material-ui-stack
description: "Owner 2026-11-15 UI direction - Material per platform (Angular Material web, Compose Android, Flutter cross-platform; not Material Web), Google M3 kit, opentui TUI style, Rust native UI; reuse src design packages first"
metadata:
  node_type: memory
  type: project
  originSessionId: aae12588-4a11-4aae-b28f-f3d886683cbb
  modified: 2026-11-16T17:21:14.749Z
---

Owner decision, 2026-11-15:
- Web: Angular Material (angular/components).
- Android: Jetpack Compose Material 3.
- Cross-platform: Flutter.
- Not Material Web (@material/web). It is not archived, but its README calls it maintenance mode and asks for maintainers, and Google points web users to Angular Material.
- Design: the Google Material Design 3 kit (skill material-3), the opencode TUI style (anomalyco/opentui), and a Rust native UI library.

**Why:** follow Google's current recommendation. A generic dark Figma mockup was rejected as "not Aphrody at all".

**How to apply:**
- Tokens come from material-color-utilities.
- Reuse what exists (packages/design, src/ui/kit) before creating anything.
- Resolve versions live (`gh api repos/angular/components/releases/latest`), never from this note.
- UI work for open goes to that repo ([[open-repo-ownership]]).
- The native stack is in [[aphrody-ui]].
