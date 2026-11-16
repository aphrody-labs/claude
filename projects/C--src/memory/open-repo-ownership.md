---
name: open-repo-ownership
description: Owner 2026-11-15 (relayed by session apps-4d) - aphrody-labs/open (apps/open) owns UI/TUI/GUI/desktop/mobile Material 3, crawl, browser engines, AI routing/inference; don't extend those in src
metadata:
  type: project
---
aphrody-labs/open (checkout C:\src\apps\open) owns: UI, TUI, GUI, desktop and mobile Material 3, crawl, browser engines, AI routing/inference. New work or extensions there go to open (roadmap open/docs/roadmap, research open/docs/ideas), not aphrody-dev/src. Owner decisions in open: web = Angular on an auto-following fork with Bun patches, AOT/LTO, shared C ABI; Flutter + Rust + Compose Multiplatform; Bazel everywhere; local-first inference across all providers.

**Why:** owner split ownership between repos (notice relayed 2026-11-15).
**How to apply:** in src, only repair breakages in those areas (regressions, broken builds); route features (e.g. new engines in packages/chromium-bun registry, router features in packages/ai-os/src/router, design system changes) to apps/open. Supersedes parts of [[material-platform-choice]].
