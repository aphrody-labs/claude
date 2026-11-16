---
name: generalist-no-fixed-picks
description: Owner 2026-11-15 - Aphrody is generalist; never hardcode a framework, language, OS, locale, provider or engine as the choice; supported sets come from registries/manifests/detection
metadata:
  type: feedback
---
Aphrody supports every framework, programming language, OS, locale, model provider and engine that a registry or manifest can describe. A "choice" in code or docs is a default adapter behind a registry row or detection, never an exclusive pick (no "web = X", "Windows only", "French UI", "the provider is Y"). Owner preferences (e.g. per-platform Material: web Angular Material, Android Compose, multiplatform Flutter) are defaults and examples, not limits.

**Why:** owner, 2026-11-15: "tes sélections de framework, langage, OS, langue sont hardcodées, aphrody est généraliste".
**How to apply:** model each axis as a registry (like packages/chromium-bun/src/engines/registry.ts) plus detection from the project; write docs as "supported: <derived set>, examples: ...". Related: [[english-source-multilingual]], [[material-platform-choice]], [[assemble-not-reinvent]].
