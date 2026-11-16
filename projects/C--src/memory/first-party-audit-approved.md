---
name: first-party-audit-approved
description: Owner 2026-11-15 approved every recommendation of docs/audit/first-party.md (95 first-party units: 6 delete, 16 merge, 1 replace, 4 move to open, keeps with conditions)
metadata:
  type: project
---
The owner validated all decisions of `docs/audit/first-party.md` / `first-party.jsonl` (commit 39a51cafcd) on 2026-11-15, plus the pending `ay env`, craft-libs rev bump and test/assets dedupe. Execution is split by theme across agents; moves to aphrody-labs/open are done by the open session with history.

**Why:** owner: "je valide tes décisions pour les 95 unités internes".
**How to apply:** treat each row's `recommendation` as an approved work item; verify consumers before deleting; keep the jsonl updated (status) as items land. Related: [[auto-saas-of-open]], [[open-repo-ownership]], [[assemble-not-reinvent]].
