---
name: vercel-blocked
description: Vercel softBlock (2026-06-12) is lifted as of 2026-11-15 - account aphrody-dev hobby deploys again; dragonballfr.com and rpbey.fr stay off Vercel
metadata:
  node_type: memory
  type: project
  originSessionId: a011b3c7-fd06-4420-af19-2f3bf97435cb
  modified: 2026-11-15T00:50:00.000Z
---

- 2026-06-12 to at least 2026-11-12: team aphrody (hobby) under softBlock FAIR_USE_LIMITS_EXCEEDED, deployments 402 DEPLOYMENT_DISABLED.
- 2026-11-15: verified via API, scope aphrody-dev (hobby, team_xCw3WGJLNTrufDRMc53z4rwl), softBlock null, blocked null; project aphrody-open deployed READY. Projects: rg-website, rg-api, rg-discord (Rose Griffon), aphrody-open.
- Vercel MCP (plugin) is not authorized for scope aphrody-dev (403): use the CLI / `vercel api` with teamId.
- dbfr = `shenron-site` container on prd behind Cloudflare; rpbey.fr = nginx on fr1, to migrate to fr2/prd.

**Why:** the block shaped hosting choices; Cloudflare stays primary for cost (see [[budget-sheet]]).
**How to apply:** Vercel is usable again but is a redundant host; prefer Cloudflare or the VPSes and keep Vercel at $0 (hobby). See [[fleet-roles]].
