---
name: material-platform-choice
description: Owner 2026-11-15 - Material per platform: Angular Material on the web (Material Web is in maintenance), Jetpack Compose on Android, Flutter for multiplatform
metadata:
  type: project
---
Web = Angular Material (angular/components, v22.2.7 released 2026-11-11 per gh api); Android = Jetpack Compose Material 3; multiplatform = Flutter. Material Web (@material/web) is not archived but in maintenance mode (README seeks maintainers; gh api archived=false on 2026-11-15) and Google points web users to Angular Material.

**Why:** follow Google's current recommendation, not a maintenance-mode library.
**How to apply:** packages/design web target and apps/aphrody UI move from md-* web components to Angular Material; tokens stay from material-color-utilities. Resolve versions live, never pin from this note. Related: [[assemble-not-reinvent]], [[deps-always-latest]].
