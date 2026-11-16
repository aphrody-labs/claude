---
name: requirements-ledger
description: "Permanent owner requirements drawn from all his requests in the 2026-11-12 session, and lessons learned"
metadata:
  node_type: memory
  type: feedback
  originSessionId: a011b3c7-fd06-4420-af19-2f3bf97435cb
  modified: 2026-11-13T07:27:40.885Z
---

Invariants (37 requests reviewed on 2026-11-12):
- **Truth**: nothing from memory; everything from live sources (gh api, Learn, context7, fork code, measurements). It is late 2026.
- **Stack**: recent Microsoft stack end to end. windows-rs is the core (flat monorepo, wasm), plus webui, Fluent UI, WinUI 3, Windows App SDK, MSIX, .NET 10/11 NativeAOT, C++23 with import std, vcpkg, winget with DSC v3. For JS, bun only: no oxc, biome, vite or node. Aim at LiberNT, and at the exact structure of the real Windows NT on this PC.
- **Real only**: no demo, stub, particles or fake content. Pure GPU rendering at 4K and 120 Hz minimum, measured.
- **No hard-coded absolute path**, no symlink or junction. Cross-platform and stable code. The only roots are src, msys, the VPSes and git (C:\labs is dead).
- **Zero duplication, zero regression, zero legacy**: purge also what is out of scope (code, repositories, docs, scripts, dead toolchains).
- **Test** on this PC and on prd (fr1/f1p reserved for Chromium/LLVM) without saturating them (low priority, few jobs), in addition to CI.
- **Work**: explore in depth with agents in parallel, plan and prove before acting. No questions, ultra-short answers, fast. See [[terse-reports]].

Lessons (my repeated mistakes):
- I built a generic web demo instead of starting from the real NT architecture and the Microsoft stack. Always start from the reference (LiberNT, the ntmap map, windows-rs conventions).
- I wrote hard-coded absolute paths into docs and briefs. Write relative paths or variables.
- Everything is done on main, with no worktree or branch (see global CLAUDE.md).
- Bun on Windows lets a second server bind the same port without error. Kill the old servers before restarting.
- niubash reads ~/.niubashrc and not ~/.bashrc, and "/" there equals NIU_ROOT. The /src -> C:\src fallback goes through NIU_ROOT_FALLBACK=1 (fork rubash/niubash nt/fix-root-fallback).
- The Bash tool's heredocs lose backslashes: write any code containing regexes with the Write or Edit tool.
- "Proving it on my PC" is done through Windows' own mechanisms (loader, API Sets, registry, RoGetActivationFactory) and a lock on the entries with a graph fingerprint: `just msindex` / `just msindex-verify`.
- An agent leaves no .bak files: delete the ones it created.

**Why:** the user asked for a full review and for continuous self-learning, like an autonomous agent.

**How to apply:** reread this file at the start of a task. Update it with every new request or error.

