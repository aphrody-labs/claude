---
name: agent-first-nhitl
description: "aphrody agent-first, no human in the loop : sous-agents, workflows dynamiques, Agent SDK, tous providers/CLI en parallèle sur tous les hôtes (tmux, tunnels, auto-switch/fix) ; src codé, testé, jugé, déployé, commercialisé par des agents"
metadata:
  type: project
---

Directive 2026-11-13 : tout aphrody est agent-first, sans humain dans la boucle (seule exception : le clic de connexion du propriétaire). Sous-agents, workflows dynamiques, Agent SDK, tous les providers et CLI d'agents en parallèle sur PC + fr1/fr2/prd, sessions tmux persistantes, tunnels, bascule automatique de provider/hôte en cas d'échec ou quota, auto-réparation. src doit être optimisé pour être entièrement codé, maintenu, testé, corrigé, jugé, designé, linté, formaté, vérifié, hébergé, optimisé, dockerisé, commercialisé et marketé par des agents.

**Why:** aphrody = plateforme ; voir [[products-vs-platform]], [[src-llm-factory-vision]].
**How to apply:** assembler l'upstream (Claude Agent SDK, CLIs officiels, tmux, cloudflared, litellm) ; packages/ai-os est la couche IA unique (session nt) ; validation Gemini [[gemini-carbon-validation]] ; tout sur main [[main-only]].
