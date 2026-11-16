---
name: material-ui-stack
description: Material choice per platform - Angular Material on the web (Material Web is in maintenance mode), Jetpack Compose on Android, Flutter for cross-platform
metadata:
  type: project
---

Owner decision, 2026-11-15:
- Web: Angular Material (angular/components).
- Android: Jetpack Compose Material 3.
- Cross-platform: Flutter.

Do not adopt Material Web (material-components/material-web): it is not archived (archived=false, last pushed 2026-11-13, GitHub API), but its README calls it maintenance mode and asks for new maintainers.

Always resolve the Angular Material version live (`gh api repos/angular/components/releases/latest`); it was v22.2.7, published 2026-11-11, when checked.

Related: [[definition-of-done]].
