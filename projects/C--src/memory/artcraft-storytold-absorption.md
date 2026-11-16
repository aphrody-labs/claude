---
name: artcraft-storytold-absorption
description: "State on 2026-11-13 of the Epic, media, storytold/ArtCraft and games work in src, what exists already and what is not started"
metadata:
  node_type: memory
  type: project
  originSessionId: 8a42912e-c1a2-4628-8f78-d900cfaee5a0
  modified: 2026-11-15T01:13:43.118Z
---

Docs: docs/epic/*, docs/games/{PLAN,ARTCRAFT,MEDIA-STACK}.md, docs/SESSION-LEDGER-2026-11-13.md. Refactoring src into a game engine and creative suite is not started; the owner stopped that goal on 2026-11-13.

Facts the plan rests on: the workspace already pins bevy 0.20, egui 0.37, wgpu 30.0.1, winit 0.30.13 (workspace pin; 0.31 is beta); frameworks/ui has bevy and egui adapters; media lives in frameworks/tv (ffmpeg-next, LGPL build); the C ABI is crates/core-capi; Craft Apps use egui 0.37 with storytold forks (wgpu 30, winit 0.30.13); craft-libs has 114 Apache-2.0 format crates. aphrody-labs/src is public.

**Why:** owner decision 2026-11-13: any UI framework is fine (Bevy UI, egui, iced, WinUI 3, Tauri) if the result is good-looking, optimized and functional.

**How to apply:** follow docs/games/PLAN.md section 4; license status does not decide what is absorbed ([[licenses-go-to-human]]); never put personal or account data in committed docs. See [[verify-before-delegating]].

