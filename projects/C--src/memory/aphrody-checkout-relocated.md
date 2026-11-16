---
name: aphrody-checkout-relocated
description: Monorepo checkout moved C:\src -> C:\src\ay on 2026-11-15; apps/aphrody -> apps/web; Claude projects merged into C--aphrody via junctions
metadata:
  node_type: memory
  type: project
  originSessionId: 240441f3-5fc5-4a25-a986-92449965a697
  modified: 2026-11-15T11:44:22.970Z
---

On 2026-11-15 the monorepo checkout moved from `C:\src` to `C:\src\ay` (commit b9a768638 on aphrody-labs/aphrody main), and `apps/aphrody` became `apps/web` (Angular app now `apps/web/web`, package `@aphrody/site-ng`).

- Tool: `bun C:\src\ay\scripts\identity-relocate.ts --from <old> --to <new> --force` (service AphrodyRelay, 15 scheduled tasks, user env vars, Claude project folders, agents-sync). It does NOT rewrite file contents, node_modules junctions (absolute targets), or Claude Desktop session files; those needed separate passes.
- Before a move: `git fsmonitor--daemon` and DevHome `FileExplorerGitIntegration.exe` hold directory handles; `handle.exe` (winget Microsoft.Sysinternals.Handle) finds them.
- Claude Code projects `C--aphrody-agent`, `C--aphrody-apps*`, `C--labs`, `C--Users-aphro-nt` are junctions to `~/.claude/projects/C--aphrody` (single project; conflicting memories were prefixed `labs-` / `nt-`).
- Shells started before the move keep `SRC_ROOT=C:\src`; export `SRC_ROOT='C:\src\ay'` or open a new shell.

**Why:** the user asked for one location named after the identity and one Claude Code project.
**How to apply:** use `C:\src\ay` paths; for future renames reuse the relocate script plus a content rewrite and a junction retarget, excluding upstream trees (`third_party/`, `apps/open/ecosystem`, `apps/open/packages/openclaw`). See [[bash-tool-backslash-quirk]].
