---
name: max-parallel-async
description: Owner directive 2026-11-14 - act decisively and asynchronously, maximum parallelism and execution speed (fleet + agents + background runs)
metadata:
  type: feedback
---

The owner said on 2026-11-14: "agissez de manière résolue et asynchrone, parallélisme et vitesse d'exécution au max".

**Why:** long sequential waits (downloads, clones, builds, emulator boots) were slowing delivery while fleet capacity sat idle.

**How to apply:**
- Run every independent step in the background (`run_in_background`, systemd-run, tmux on the VPS) and never block on a single download or build.
- Split each piece of work across machines at the same time: fr1 builds, fr2 runs tests, benchmarks and research without limits, and the PC only downloads.
- Use one sub-agent per independent workstream, launched in the same message. Agents keep their own background jobs going and do other work while waiting.
- Decide without asking and report tersely ([[terse-reports]]).
- The weekly Claude quota still applies ([[subagent-models-cheap]]).
- Placement rules are in [[fleet-roles]].
