---
name: subagent-models-cheap
description: Subagents must run on Sonnet 5.5 (effort medium) or Haiku 5.5 by task, never inherit Opus, to save the weekly limit
metadata:
  type: feedback
---

Launch subagents with `model: "sonnet"` + `effort: "medium"` for coding/build work and `model: "haiku"` for translation, search, mechanical edits. Never let them inherit Opus.

**Why:** owner's weekly usage limit was nearly exhausted (2026-11-13); they asked for fast, cheap agents chosen per task.
**How to apply:** set `model` (and `effort: medium` for sonnet) on every Agent call; keep briefs compact. See [[agent-first-nhitl]].
