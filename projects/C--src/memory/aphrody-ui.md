---
name: aphrody-ui
description: UI direction 2026-11-16 - the agy CLI session forks and purges Zed into one aphrody (GPUI, kit, native shell, taffy, wgpu) for web, mobile and desktop, LTO/AOT; src/ui converges on it
metadata:
  type: project
---

Owner 2026-11-16: the agy CLI session has forked Zed and is purging it into a unified aphrody (GPUI, kit, native shell, taffy, wgpu), production-ready on web, mobile and desktop, with LTO and AOT.

**Why:** one UI ecosystem; Dioxus and GPUI combined, with their dependencies deduplicated (taffy, wgpu, winit, text/layout).

**How to apply:** do not start parallel UI stacks in aphrody; src/ui work feeds aphrody; coordinate with the agy session. Risk to watch: GPUI upstream has no official web or mobile backend.

Per ecosystem (owner 2026-11-16): egui for the Craft Apps (as craft-anything), Bevy for games, iced for the Wayland desktop (as COSMIC); all share the deduplicated base (taffy, wgpu, winit, text) with aphrody and Dioxus.
