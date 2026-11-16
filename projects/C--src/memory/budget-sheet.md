---
name: budget-sheet
description: Owner's infra budget lives in Google Sheet "Aphrody - Budget infra 2026" (Drive), tabs Lignes + Synthese; append measured cost rows there
metadata:
  type: reference
---

Google Sheet "Aphrody - Budget infra 2026", id 1y5EOYT30gXCEtasrl4V1NfHDS03XRoR-BoSOmXznqiA, created 2026-11-15 at the owner's request ("gère mon budget sur Google Drive").
- Tab `Lignes`: Fournisseur, Ressource, USD/mois avant, USD/mois après, Économie (ARRAYFORMULA), Action, Preuve, Date. Provider values: cloudflare, vercel, gcloud, neon, supabase, ovh, hostinger, plus LLM providers (anthropic, claude-code, openai, openrouter, vercel-ai-gateway, gemini).
- Tab `Synthese`: SUMIF per provider + TOTAL.
**How to apply:** after any cost change, append a row with measured numbers and the proof (command or commit); never invent prices. Pricing sources and the Cloudflare cost notes: docs/infra/FR2-CLOUDFLARE.md section 9. Related: [[vercel-blocked]] (the softBlock was lifted, see that note), [[fleet-roles]].
