---
name: agy-coordination
description: Never spawn agy (Antigravity) instances or inject turns into its conversation; it is the single owner of aphrody
metadata:
  type: feedback
---

agy (Antigravity CLI, `C:\Users\aphro\AppData\Local\agy\bin\agy.exe`, live process started with -dangerously-skip-permissions) owns $WORKSPACE_ROOT/aphrody. Running `agy -p`, `agy --conversation <id> -p` or an ACP client with `session/load` on its conversation starts a second agy agent on the same work: the owner called it "tu dupliques agy" (2026-11-17).

**Why:** a duplicate agy edits aphrody in parallel with the real one and burns quota.

**How to apply:** do not launch agy.exe at all (print, ACP, continue). Leave coordination notes as plain files the owner or agy reads, or tell the owner; never edit aphrody. Related: [[ay-hub-source-of-truth]], [[push-checks-and-shared-writers]].
