---
name: ay-hub-source-of-truth
description: aphrody-dev/ay is the entry point and source of truth; craft apps, Bun plugins, npm packages and crates are satellites
metadata:
  type: project
---

aphrody-dev/ay (C:\src\ay) is the hub: entry point and single source of truth. Everything else gravitates around it: craft apps (craft-anything, nie football games), Bun runtime and plugins (aphrody-labs/bun), agent plugin (aphrody-labs/claude), apps (shenron), npm packages (@aphrody scope) and crates (aphrody- prefix). Recorded in ay.toml [repos] and [registries] (commit 3af88e7, 2026-11-16).

**Why:** owner said 2026-11-16 "aphrody-dev/ay est notre point d'entrée et source of truth, le reste gravite autour".

**How to apply:** new identity, host, product or repo facts go into ay.toml first; satellites read from it and never redefine names. rosegriffon is leaving for its own org rose-griffon (blocked on aphrody-dev invite); nie stays in aphrody-labs. Related: [[git-and-workspace-map]], [[naming-and-privacy]], [[ay-legacy-rebuild]].
