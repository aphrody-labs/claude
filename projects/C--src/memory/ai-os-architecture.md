---
name: ai-os-architecture
description: Existing building blocks and reusable foundations across Aphrody checkouts (OS, browser, Google self-hosted services, edge/hosting, media, UI)
type: project
---

- **Reusable core assets** (flexible architecture per `vision.md` and `CLAUDE.md` — reuse or swap freely per task based on live evidence):
  - Self-hosted Google/AI services (`google-*`, `gemini`, `chromium`, `n2b`, `a2a`, local inference) are permanent core features, never legacy.
  - Native desktop/UI foundations already in checkouts: `C:\src\aphrody` (Zed/GPUI fork), Angular Material / Flutter / Compose, `material-color-utilities`, `egui`/`craft-libs`, `Bevy`, `iced`, `frameworks/tv` (`ffmpeg-next`), `crates/core-capi`.
  - Browser & OS building blocks: `C:\src\browser` (Bun + Servo + Obscura + agent-browser), `C:\src\bun` (`src/craft`, forks), `C:\src\aphrody-git`.
- **Logo**: `docs/logo/aphrody.png` (org avatar, laid out like Bun `docs/logo/bun.png`). Never invent custom brand generators, badge systems, or tile pipelines.
