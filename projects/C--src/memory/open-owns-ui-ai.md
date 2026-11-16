---
name: open-owns-ui-ai
description: Owner decision relayed 2026-11-15 by session apps-4d - aphrody-labs/open (C:\src\apps\open) owns UI/TUI/GUI, desktop and mobile Material 3, crawl, browser engines, AI routing and inference; do not extend these in aphrody-dev/src
metadata:
  type: project
---

The owner's decision reached me on 2026-11-15 from session apps-4d. aphrody-labs/open, checked out at C:\src\apps\open, owns:
- UI, TUI and GUI;
- desktop and mobile Material 3;
- crawl;
- browser engines;
- AI routing and inference.

Do not start or extend work on these in aphrody-dev/src. Route changes to open: roadmap and decisions in open/docs/roadmap, research in open/docs/ideas.

Decisions recorded there:
- Web is Angular, on a fork that follows upstream automatically, with Bun patches, AOT/LTO and a shared C ABI.
- For maximum platform coverage: Flutter, Rust and Compose Multiplatform.
- Bazel is the build system everywhere.
- Inference is local-first across all providers.

**How to apply:**
- Before UI, desktop or mobile work, or browser-engine and AI-routing work, check open/docs/roadmap and do it in apps/open.
- [[material-ui-stack]] is superseded on ownership: the per-platform choices now live in open.
- The Electron migrator (GPUI/Tauri) is a desktop GUI topic, so it moves to open.
