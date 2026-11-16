---
name: language-by-domain
description: No language fanaticism - Rust core, Python for ML/AI/data/research/RE, Go for containers/deploy/cloud tooling, C/C++ for C/C++ ecosystems, TypeScript only when justified
metadata:
  type: feedback
---

On 2026-11-15 the owner rejected the "Bun and TypeScript for everything" habit, unjustified TypeScript in particular, as slop. The language follows the domain:
- Rust at the core.
- Python for ML, AI, big data, research and reverse engineering.
- Go for Docker and containers, self-hosting, deploy, rclone, gcloud and Google tooling.
- C/C++ for C/C++ ecosystems: FFmpeg, Blender, VLC, Hyprland, LLVM, WebAssembly.
- TypeScript only where it is justified: web UI, Bun-native tooling.

**Why:** forcing everything into TypeScript (py2bun conversions, hand-written TS ports of Go or Python tools) fights each domain's best ecosystem and produces slop.

**How to apply:**
- Before writing code, name the domain and use its language and upstream libraries.
- Each package declares its language through its own manifest.
- Never convert Python or Go to TypeScript without a measured reason.
- "Bun only" still applies inside the JS world: no Node or npm tooling that Bun replaces ([[assemble-not-reinvent]]).
- The rule lives in AGENTS.md and the global CLAUDE.md.
