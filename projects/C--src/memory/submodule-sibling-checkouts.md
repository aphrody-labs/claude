---
name: submodule-sibling-checkouts
description: "2026-11-16 - forks consumed by ay are git submodules with relative URLs; the one working copy lives beside ay (C:\\src\\bun) and ay/third_party/<name> is a junction made by `vcs submodules init`; Git stack is aphrody-labs/aphrody-git"
metadata:
  node_type: memory
  type: project
  originSessionId: aae12588-4a11-4aae-b28f-f3d886683cbb
  modified: 2026-11-16T17:21:34.874Z
---

- Bun fork: the single checkout is `C:\src\bun` (all local branches, PRs and checkouts merged there on 2026-11-16). ay holds it as submodule `third_party/bun`, URL `../bun.git`.
- `bun scripts/vcs.ts submodules init` links any submodule whose repository is already checked out in `AY_CHECKOUTS` (PATH-style list), or else beside the repo. The link is a junction, not a second clone.
- `submodules pin` stages the commit and writes it into src.lock.json and DEPS.
- `ay manifests` (system/xtask) writes own-org URLs as relative paths.
- The installed `ay.exe` is stale (it still uses the old crates/xtask layout), so don't run `ay lock` until it is rebuilt.
- Git stack: `aphrody-labs/aphrody-git` (checked out at `C:\src\aphrody-git`), with `stack.toml` plus `scripts/stack.ts` (forks, sync, modules, pin, lineage).
- One fork per fork network: `aphrody-labs/git` (from microsoft/git) carries the git/git and git-for-windows lineages as remotes.

**Why:** the owner wants one copy per repo, consumers as managed submodules, and nothing hardcoded.
**How to apply:** for a new forked dependency, use a submodule plus a sibling checkout. Never a nested clone or a fixed path.
