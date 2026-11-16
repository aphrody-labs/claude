---
name: english-source-multilingual
description: Owner 2026-11-15 - repos are English at the source and multilingual through i18n; no hardcoded French, and no hardcoded locale list or i18n stack either (Aphrody is generalist)
metadata:
  type: feedback
---
Source language of every repository is English (code, comments, docs, CLI text, commits, skills). User-facing text goes through i18n catalogs; locales are whatever catalogs exist (any BCP 47 / CLDR locale can be added), the source locale comes from config, and no code branches on a specific locale. Chat replies to the owner stay French (output style).

The i18n engine is pluggable: MessageFormat 2 (npm `messageformat`, ICU4X on Rust) is the default adapter in src as of 2026-11-15, but projects keep their own format when they have one (ICU MF1, Fluent, gettext, i18next), detected from their files. Translation goes through whatever model the ai-os layer discovers (local-first, any provider); detection rule = "not the project's source locale".

**Why:** owner orders 2026-11-15: "tout en full anglais, multilingue, arrête d'hardcoder en français" then "tes sélections de framework, langage, OS, langue sont hardcodées, Aphrody est généraliste".
**How to apply:** never write a fixed list of locales, frameworks, OSes or languages as THE choice; derive the supported set from registries, manifests or files present, with examples. Resolve versions live. Related: [[assemble-not-reinvent]], [[generalist-no-fixed-picks]].
