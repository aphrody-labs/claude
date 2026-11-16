---
name: git-and-workspace-map
description: Checkouts under workspace root, GitHub repos, shared-tree git discipline, relative submodule junctions, and product repository split
type: project
---

- **Active checkouts under `C:\src`** (derive dynamically via `SRC_ROOT` / discovery):
  - `ay` -> `aphrody-labs/ay` (monorepo, formerly `C:\aphrody`; mirrors on GitLab/Google Source)
  - `aphrody` -> `aphrody-dev/aphrody` (unified Zed/GPUI/taffy/wgpu OS UI fork)
  - `aphrody-git` -> `aphrody-labs/aphrody-git` (Git stack, `aphrody-labs/git` lineage)
  - `browser` -> `aphrody-labs/browser` (Bun + Servo + Obscura + agent-browser)
  - `bun` -> `aphrody-labs/bun` (single checkout linked into `ay/third_party/bun` via `vcs.ts submodules init` junction)
  - `nie` -> `aphrody-labs/nie` (Rust self-hostable Inazuma Eleven UI/replica; Azalee mirrors `nie.exe`)
  - `rosegriffon` -> `aphrody-labs/rosegriffon` (full-TypeScript Bun cloud app; Achillea web UI)
  - `shenron` -> `aphrody-labs/shenron`
- **Product & monorepo ownership**:
  - `aphrody.com` (`apps/web`) = marketing/vitrine; `aphrody.app` (`aphrody-app`) = full-Rust apps & Bevy/wgpu game launcher.
  - Submodules use relative URLs and sibling checkouts via directory junctions (never duplicate nested clones).
- **Shared-tree git safety**: always work on `main`; never run `git stash`, `git stash pop`, `git reset --hard`, or branch switches on shared `C:\src` trees; make path-scoped commits (`scripts/commit.ts` in `ay`) and push directly.
