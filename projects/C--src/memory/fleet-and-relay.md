---
name: fleet-and-relay
description: Fleet host roles (fr1, fr2, prd, PC), SSH timeout recovery, and Chrome Gemini review fallback
type: project
---

- **Host roles** (resolve endpoints live via `ssh -G <host>` / `deploy.toml` / `INFRA_MATRIX.md`):
  - `fr1` (`vps`, 12c/45GB): Chromium/LLVM/release builds, CI, training, heavy agents, NativeLink.
  - `fr2` (`cdn`, 6c/11GB): edge proxy/CDN, ACME, tests, benchmarks, research.
  - `prd` (`prd`, 8c Zen4 USA): clean production backends & served inference only, zero build tooling.
  - PC (RTX 4070 `sm_89`): local GPU/UI/assets, no heavy Rust compilation.
  - Resilience: systemd `Restart=always`, Docker `unless-stopped`, linger, `agent` user with sudo for headless workers; cluster failover.
- **SSH traps**: always invoke SSH with `timeout 60 ssh <host> '...'`. Exit 255 typically indicates CPU/RAM saturation from runaway `gitleaks` or `lighthouse` Chrome processes (`pkill -f gitleaks; pkill -f user-data-dir=/tmp/lighthouse`).
- **Large Gemini Carbon review fallback**: if relay `gemini_review` hits 429, inject `<input type=file>` into `gemini.google.com/app`, upload bundle under `%TEMP%`, insert into `.ql-editor`, submit, poll `Stop response`, and read verified findings against live code.
