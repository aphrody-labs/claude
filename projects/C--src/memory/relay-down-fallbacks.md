---
name: relay-down-fallbacks
description: When the relay MCP is disconnected in a session - call the hub, mailbox and peers directly from bun; ListAgents/SendMessage for live peer names
metadata:
  type: reference
---

The relay MCP often fails to connect at session start (ECONNREFUSED) while the AphrodyRelay service is fine. The same calls work from bun, checked on 2026-11-15:
- Hub tools: `bun -e 'import { hubCall, closeHub } from "./packages/ai-os/src/relay/mcp-hub.ts"; console.log(await hubCall("<server>__<tool>", {...})); await closeHub(); process.exit(0)'`. This works for context7, registry and gnu. hub.json is reread on every listing, so a new [[hub.mcp]] entry needs only `just agents-sync`, not a restart.
- Mailbox: `send(from, to, text)` from packages/ai-os/src/relay/sessions.ts. The target must be a live relay name (claude-code-<dir>-<id>); `list()` shows them.
- Peer Claude sessions on the same machine have short names (apps-20, shenron-94) that change when a session restarts. Get the current ones with ListAgents and reach them with SendMessage; apps-3f became apps-20 while still owning open.
