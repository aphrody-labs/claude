---
name: english-source-i18n
description: "Owner 2026-11-15 - one source language from config (default English) in every project; user-facing text through each project's own i18n stack; Aphrody is generalist, so there are no fixed picks of framework, OS, language or locale list"
metadata:
  type: feedback
---

Owner directives (2026-11-15):
1. Open entirely in English and multilingual, and the same for all of Aphrody and all of the owner's projects. No hardcoded French.
2. Follow-up the same day: my framework, language, OS and locale selections were themselves hardcoded. Aphrody is generalist.

**Why:** hardcoded natural language blocks a multilingual product. Hardcoded stack picks contradict a generalist platform.

**How to apply:**
- Source language: read it from config (identity or project config), default English. It covers code, identifiers, comments, docs, commits, CLI output and skills.
- User-facing text: route it through the i18n stack the project already uses, detected from its manifests (ICU MF1/FormatJS, MF2 `messageformat`, i18next, gettext, Fluent, ARB, Angular localize, Paraglide/inlang, ...). Per-platform defaults sit behind adapters and are never exclusive picks.
- Locales: the catalogues present (any BCP 47 tag). No fixed locale arrays, and no code branching on a locale.
- Machine translation: whatever model the ai-os model layer discovers at run time, local first. No named model.
- Chat replies follow the user's language.
- Owner of the implementation: session src-8a4291 (packages/i18n and src/i18n adapters, hygiene `non-english` rule, translation of apps/auto and the rest of src). Coordinate with it before touching i18n.

Related: [[definition-of-done]], [[open-owns-ui-ai]], [[generalist-no-fixed-picks]].
