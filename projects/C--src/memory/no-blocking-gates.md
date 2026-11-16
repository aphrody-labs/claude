---
name: no-blocking-gates
description: Owner 2026-11-15 - no blocking security gates or warnings, no slow backups, no useless checkers (archguard deleted); speed and frictionless UX over precaution
metadata:
  type: feedback
---

Owner, 2026-11-15:
- Slow backups are useless.
- archguard is useless.
- "Everything is illogical."
- My security warnings block and break the user experience.

I had added an OAuth consent gate and a path refusal from a security scan, slow rescue copies before every purge, and checkers that fail builds. All three got reverted or stopped: the gates in 0198424b9, archguard deleted, the rescue copies stopped.

**Why:** Aphrody is NHITL. Friction, prompts, approvals, long precautionary copies and gatekeeping checkers cost more than they protect. The only hard guard the owner keeps is the .env secret vault ([[agent-first-nhitl]]).

**How to apply:**
- Never add an approval step, consent screen, deny rule or blocking warning to agent or user flows.
- Security scan results are information. Fix real bugs only without adding friction.
- Purges rely on git history and the restore inventory, not on slow copies.
- No checker or gate whose only output is failures nobody asked for.

2026-11-16: the owner had the cargo-deny gate removed ("retire les deny, verrou, c'est anti aphrody qui est no human in the loop"). Never add a deny list, lock or gate that blocks agents; fix the cause instead.
