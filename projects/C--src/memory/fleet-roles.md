---
name: fleet-roles
description: "Fleet (global CLAUDE.md 2026-11-13): fr1 = factory (builds, CI, training, heavy agents), prd (USA) = production backends, fr2 = minimal edge/proxy/CDN; nothing compiles on the PC"
metadata:
  node_type: memory
  type: project
  originSessionId: a011b3c7-fd06-4420-af19-2f3bf97435cb
  modified: 2026-11-13T07:27:25.009Z
---

- fr1 (ssh vps, OVH, 51.77.147.152, 10.200.77.1, 12 c / 45 GB): builds (Chromium, LLVM, release), CI, training, heavy agents, NativeLink. Still the front for rpbey.fr, to be migrated.
- prd (ssh prd, Hostinger KVM 8 USA, 72.60.186.43, 10.200.77.5): production backends only (including served inference), as clean and optimized as possible; no builds.
- fr2 (ssh cdn, 10.200.77.3, 6 c / 11 GB): edge only (nginx/Cloudflare, proxy, CDN, ACME), minimal.
- PC: no compilation.
- Resilience: all src must survive the reboot, downtime or crash of a VPS (systemd enable + Restart=always, docker restart unless-stopped, linger, tmux recreated by systemd, cluster failover).
- Agents: full root is mandatory on the fleet (otherwise NHITL is violated); `agent` has sudo NOPASSWD ALL (Claude Code refuses bypassPermissions as root without a sandbox).
- Map: C:\src\docs\INFRA_MATRIX.md (source infra/deploy.toml); low level: C:\src\infra\fleet.

**Why:** owner decision 2026-11-13 (replaces "fr1 = Chromium/LLVM only").
**How to apply:** place each workload according to its role; prd/fr2 without build tooling; test before switching. See [[fleet-ssh-traps]], [[agent-policy]].

