---
name: orgs-labs-vs-dev
description: "C:\\aphrody is the monorepo; its GitHub repo is aphrody-labs/aphrody (aphrody-labs/src and aphrody-dev/src redirect there, verified 2026-11-15); gitlab aphrody-dev/src is a push mirror. Never call it aphrody-dev/src"
metadata:
  type: project
---

Verified 2026-11-15 with `gh api repos/aphrody-dev/src` and `repos/aphrody-labs/src`: both resolve to `aphrody-labs/aphrody`, which is the `origin`/`aphrody` remote of `C:\src\ay` (formerly C:\src). `gitlab.com/aphrody-dev/src` and Google Source `aphrody/r/src` are push mirrors (remote `all`). Forks live in the `aphrody-labs` org. C:\labs, nt and tv were folded into C:\src on 2026-11-13.

**Why:** the owner rejected "aphrody-dev/src" as the repo name (2026-11-15); the old note said C:\src = aphrody-dev.
**How to apply:** say `C:\src\ay` (GitHub `aphrody-labs/aphrody`) in docs, messages and handoffs; check `git -C C:/src/ay remote -v` before naming a repo. Related: [[fleet-roles]].
