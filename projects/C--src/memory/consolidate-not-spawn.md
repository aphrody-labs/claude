---
name: consolidate-not-spawn
description: Owner 2026-11-15 - stop spawning sub-agents; consolidate existing work and deliver through skills and MCP tools
metadata:
  type: feedback
---

Owner (2026-11-15): "arrête de spammer les sub agents, fais-les consolider leur travail et livré via les skills et MCP".

**Why:** too many parallel agents produced scattered, partly finished work, and the owner had to follow too many notifications. Overrides the spawn-heavy reading of [[max-parallel-async]].

**How to apply:**
- Do not launch new agents for side tasks: do small things inline, or resume an existing agent with SendMessage.
- Every deliverable ends as a skill (`.agents/skills/<name>/SKILL.md`) plus an MCP tool behind the relay hub, not as a loose script or doc.
- Relay agent results in one consolidated report, not one message per notification.
