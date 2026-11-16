---
name: open-repo-ownership
description: "Owner 2026-11-15 (relayed by session apps-4d) - aphrody-labs/open (apps/open) owns UI/TUI/GUI, desktop and mobile Material 3, crawl, browser engines, AI routing and inference; features there go to open"
metadata:
  node_type: memory
  type: project
  originSessionId: aae12588-4a11-4aae-b28f-f3d886683cbb
  modified: 2026-11-16T17:21:21.499Z
---

aphrody-labs/open (checkout under apps/open) owns:
- UI, TUI and GUI;
- desktop and mobile Material 3;
- crawl and browser engines;
- AI routing and inference.

Owner decisions recorded in open:
- Web is Angular, on a fork that follows upstream automatically, with Bun patches, AOT/LTO and a shared C ABI.
- Flutter, Rust and Compose Multiplatform for the other platforms.

**Why:** the owner split ownership between repositories (notice relayed on 2026-11-15).

**How to apply:**
- In the monorepo, only repair breakages in those areas: regressions and broken builds.
- Route features (new browser engines, router features, design-system changes) to open: roadmap in open/docs/roadmap, research in open/docs/ideas.

Related: [[material-ui-stack]], [[auto-saas-of-open]].
