---
name: never-stash-shared-tree
description: Never run git stash, stash pop or reset in C:\src while other agents work; pull --rebase fails on a dirty tree and stash pop can apply another session's old stash
metadata:
  type: feedback
---

On 2026-11-13 a `git stash -q` that did not create a stash was followed by `git stash pop`, which applied a 5-hour-old stash ("autostash sites (filet)") from another session into the shared tree (conflicts in Cargo.lock, Cargo.toml and others). It was undone by `git reset` plus `git checkout HEAD --` of every file listed by `git stash show --name-only`.

**Why:** the working tree in C:\src is shared by many agents with uncommitted edits; stashes there belong to other sessions; `git pull --rebase` refuses a dirty tree.
**How to apply:** never stash, pop, reset --hard or checkout the shared tree; commit path-scoped and push; if the push is non-fast-forward let the agent that owns the dirty files push (it carries your commit) or ask it to rebase. Check `git stash list` before any pop and never pop a stash you did not create. See [[repo-search-and-push-traps]].
