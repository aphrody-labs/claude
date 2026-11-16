---
name: sandbox-doc-examples-outside-projects
description: Running third-party doc examples (bun add, bun x, dev servers) must happen in sandboxes outside any project tree, with tree-kill on timeout
metadata:
  type: feedback
---

Running Bun doc examples from a sandbox under C:\src\apps\open\apps\bun-m3\.data (2026-11-15) let `bun add` walk up to the app's package.json and add 9 unrelated dependencies, `bun run --bun vite` resolve C:\src\node_modules\vite and leave an orphan node process, and a prisma example start `prisma auth login` from the user's global install.

**Why:** package managers and runners search parent directories for package.json, workspaces and node_modules; on Windows a timeout kill only kills the direct child.

**How to apply:** put sandboxes in the OS temp dir and refuse any data dir with a package.json/.git/bunfig ancestor; give each sandbox its own package.json, HOME and BUN_INSTALL; strip global package bin dirs from PATH; kill the process tree (taskkill /T or process group) on timeout; skip examples that log in, publish, upgrade, install globally or touch the credential store, clipboard or editor. Implemented in apps/open/apps/bun-m3/runner.ts.
