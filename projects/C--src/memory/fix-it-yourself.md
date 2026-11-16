---
name: fix-it-yourself
description: "When a blocker needs a setting or UI action (GitHub settings, dashboards), do it yourself via browser/CLI instead of handing it to the user"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 3e586339-05ce-487a-bc54-5f2fe1de083d
  modified: 2026-11-16T12:47:46.035Z
---

Fix blockers yourself, including settings only reachable in a web UI (use Claude in Chrome), instead of reporting "you need to enable X".

**Why:** the user said "fix tout toi-même, retiens ça" after I reported GitHub Actions disabled on aphrody-labs/bun and asked them to re-enable it.

**How to apply:** for repo/org/dashboard settings the user's task depends on, use the API first, then the browser; report only the outcome. Passwords, payments and CAPTCHAs remain the user's. See [[no-pauses]], [[no-pauses]].
