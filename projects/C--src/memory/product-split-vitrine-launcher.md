---
name: product-split-vitrine-launcher
description: aphrody.com is the showcase only; aphrody-app (aphrody.app) is the full-Rust apps suite and fullscreen game launcher
metadata:
  type: project
---

Owner decision 2026-11-13: aphrody.com = vitrine (showcase: identity, products, screenshots, downloads). apps/aphrody-app (aphrody.app) = full-Rust apps plus a fullscreen game launcher (console-style shell, Bevy/wgpu; Windows DX12, Linux Vulkan, Chromium WebGPU wasm, mobile layout). The gamescope console UI, Craft apps and Bevy games are launched from aphrody-app, not from aphrody.com routes.

**Why:** the owner wants one product (the launcher) and a marketing front, not a mixed web app.
**How to apply:** put app/launcher work in apps/aphrody-app and crates/gamescope-*; keep apps/aphrody (aphrody.com) as pure showcase. Console design source: docs/design/replica/console/. See [[community-sites-not-aphrody-products]], [[products-vs-platform]].
