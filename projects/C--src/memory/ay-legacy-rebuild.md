---
name: ay-legacy-rebuild
description: aphrody-labs/ay was renamed aphrody-labs/legacy and purged from the PC and fr1; C:\src\ay is now aphrody-dev/ay
metadata:
  type: project
---

On 2026-11-16 the owner ordered: rename (not archive) `aphrody-labs/ay` to `aphrody-labs/legacy`, kill everything legacy and purge the PC and fr1 of the legacy vision and setup. Done the same day:

- `C:\src\ay` is the new `aphrody-dev/ay` (formerly the `C:\src\ay-next` checkout); the legacy checkout was deleted.
- Killed: the AphrodyRelay Windows service (deleted), the relay MCP of the aphrody plugin and of the Gemini configs, the LearnLoop scheduled task, the tmux `agents` server.
- fr1: the 6 legacy GitHub runners were unregistered and removed; units third-party-sync, chromium-factory (+timer), fleet-wellknown and fork-sync were removed; `/srv/aphrody`, `/srv/src`, `/srv/ts-ay` and the legacy scratch dirs were deleted. Kept: the shenron runner, VNC, vault, `/srv/chromium` (51 GB source), `/opt/aphrody`, `/srv/depot_tools`.
- Salvage of uncommitted legacy files: `C:/data/salvage/legacy-pc-2026-11-16.{diff,tgz}` and fr1 `/srv/xbuild/salvage/legacy-fr1-srv-aphrody-2026-11-16.{diff,tar.zst}`.
- Anti-regression inventory: `docs/research/legacy-inventory.toml` from `bun tools/legacy.ts` (1021 units, 579 external deps).

**Why:** the legacy tree mirrored AOSP and was replaced by the product-first rebuild.

**How to apply:** never recreate a legacy path, service or runner; port a legacy unit only through the inventory (state `review` → feature matrix row). Old docs or skills that cite `frameworks/`, `system/` or the relay are stale. See [[fleet-and-relay]], [[git-and-workspace-map]].
