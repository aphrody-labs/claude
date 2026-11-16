---
name: assemble-not-reinvent
description: Owner 2026-11-15 - src reinvents nothing; it assembles, absorbs, optimizes, dedups and redistributes upstream AI/agent stacks into one autonomous agent OS
metadata:
  type: feedback
---
Upstream first: take the best existing open project for any need before writing ours. The owner's names (anomalyco, vercel-labs, Google/DeepMind, OpenAI, Anthropic, OpenRouter, LiteLLM, mistral.rs, llama.cpp, vLLM, Zed, DeepSeek, Microsoft...) are EXAMPLES, not a fixed list: choose by quality and freshness, never freeze a list in code or docs.

**Why:** the only goal is an autonomous agent OS; first-party code exists only as glue, optimization or dedup.
**How to apply:** before any new feature in packages/ai-os, src/* or ay, find the upstream that does it (researcher agent, gh api), absorb or wire it ([[licenses-go-to-human]], [[deps-always-latest]]), delete our duplicate. Bun crates first ([[ay-is-bun-without-jsc]]).
