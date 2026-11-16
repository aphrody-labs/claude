---
name: owner-low-vision
description: "The owner has low vision; guide him in short numbered steps, one action at a time, and use the fresh skill (large font, speech) when his input is needed"
metadata:
  node_type: memory
  type: user
  originSessionId: 18399a2f-91cb-4d90-b8e6-a1a9d017f9ba
  modified: 2026-11-16T10:29:21.482Z
---

Owner 2026-11-16: "je suis mal voyant".

**How to apply:**
- Instructions: short numbered steps, one action each, and name the exact button or key.
- Open windows and pages for him rather than describing where they are.
- When his input is required, use the `fresh` skill (`~/.claude/skills/fresh`): a large-font window and a spoken request.
- The Notification hook speaks aloud when Claude waits for him.
- Never ask him to read long tables to make a choice.
