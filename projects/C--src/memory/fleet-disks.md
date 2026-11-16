---
name: fleet-disks
description: "2026-11-16 measured - fr1 /srv/xbuild is an 805 GB XFS LVM volume (~740 GB free) also NFS-mounted on fr2 at /srv/xbuild/shared; roots are small (fr1 ~50 GB, fr2 ~15 GB free); prd btrfs ~253 GB free; inventory with ay-next tools/disks.ts"
metadata:
  node_type: memory
  type: project
  originSessionId: aae12588-4a11-4aae-b28f-f3d886683cbb
  modified: 2026-11-16T19:40:37.277Z
---

- **fr1**: the root is ext4, about 50 GB free.
  - Its build volume `/srv/xbuild` is XFS on LVM, spanning sdb (500 GB) and sdc (305 GB): 805 GB total, about 740 GB free.
  - The same volume is also mounted at `/home/nativelink` and `/var/lib/private/nativelink`.
- **fr2**: the root is ext4, about 15 GB free.
  - It mounts fr1's volume over NFS at `/srv/xbuild/shared` (about 740 GB free).
  - Its local `/srv/xbuild` is a 4 GB loop file.
- **prd**: btrfs on `/`, about 253 GB free.

**Why:** on 2026-11-16 I judged disk space from `df -h /` alone. That made Chromium look blocked and filled fr1's root, while 740 GB sat free on `/srv/xbuild`. The owner called it a bad scan.

**How to apply:** run `bun tools/disks.ts` (in the aphrody-dev/ay checkout) before any large build, clone or mirror. Put work under the `→ large work` mount it names. The `disks` skill in ay covers grow and cleanup procedures.
