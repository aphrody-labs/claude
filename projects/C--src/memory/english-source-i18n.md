---
name: english-source-i18n
description: "Owner 2026-11-15 - English source from config in every repo, user-facing text through the project's own pluggable i18n, locales = catalogs present, no hardcoded French or fixed locale lists"
metadata:
  node_type: memory
  type: feedback
  originSessionId: aae12588-4a11-4aae-b28f-f3d886683cbb
  modified: 2026-11-16T17:21:28.798Z
---

Every repository's source language comes from config and defaults to English. It covers code, identifiers, comments, docs, commits, CLI output and skills. Chat replies to the owner follow the output style and the user's language.

- **User-facing text** goes through the i18n stack the project already has, detected from its manifests (ICU MF1/FormatJS, MF2 `messageformat` / ICU4X, i18next, gettext, Fluent, ARB, Angular localize, Paraglide...). MF2 is the default adapter only where nothing exists.
- **Locales** are the catalogs present (any BCP 47 tag). No fixed locale arrays, and no code that branches on a locale.
- **Machine translation** uses whatever model the ai-os layer discovers, local first. Never a named model.

**Why:** the owner ordered on 2026-11-15 "tout en full anglais, multilingue, arrête d'hardcoder en français", then the same day "tes sélections de framework, langage, OS, langue sont hardcodées, Aphrody est généraliste".

**How to apply:** never write a fixed list of locales, frameworks, OSes or languages as THE choice. Derive the set from registries, manifests or the files present. See [[generalist-no-fixed-picks]].
