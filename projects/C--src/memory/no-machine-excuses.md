---
name: no-machine-excuses
description: 2026-11-15 owner - never answer "this PC is not configured"; diagnose and fix the setup reproducibly (repo config), then build natively
metadata:
  type: feedback
---

Owner on 2026-11-15, after I moved a C build to fr2 because clang on the PC missed stdio.h: stop saying the PC lacks something; configure it reproducibly end to end.
**Why:** the cause was fixable (partial Windows Kits 10.0.28000 without ucrt shadowed SDK 10.0.26100; clang picks the highest kit).
**How to apply:** on a toolchain gap, find the root cause, install from the repo's declared config (packages/machine/machine.export.dsc.winget, tools.toml), pin it in the build (src/Makefile WINSDK, -Xmicrosoft-windows-sdk-version), commit. Related: [[windows-native-is-the-goal]].
