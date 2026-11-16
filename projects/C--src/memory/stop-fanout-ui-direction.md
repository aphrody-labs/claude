---
name: stop-fanout-ui-direction
description: 2026-11-15 owner stop order - no more workflows/subagent fan-out, git clones, useless builds, fragmented code; UI = Material 3 + opencode TUI + Rust native UI lib, not generic Figma mockups
metadata:
  type: feedback
---

Owner on 2026-11-15, after a session that launched workflows, 10+ subagents, mass clones (90 anomalyco repos into aphrody-labs/open), builds on saturated fr1 and a generic dark Figma mockup: stop launching workflows, subagents, git clones, useless builds, fragmented code, unscalable plans.
**Why:** cost, fleet saturation, scattered output; the Figma mockup was "not Aphrody at all".
**How to apply:** work inline, small and consolidated; no fan-out unless explicitly asked in that message. UI direction = Google Material Design 3 kit (skill material-3), the opencode TUI style (anomalyco/opentui), and a Rust native UI lib; reuse what exists in src (packages/design, src/ui/kit) before creating. Related: [[max-parallel-async]] (superseded for fan-out), [[subagent-models-cheap]].
