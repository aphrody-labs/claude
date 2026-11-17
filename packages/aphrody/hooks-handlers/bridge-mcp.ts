#!/usr/bin/env bun
import { deliverRealtime, listLiveClaudeSessions } from "./claude-peer.ts";
import { type McpTool, serveMcp } from "./mcp-lite.ts";

export const TOOLS: McpTool[] = [
  {
    name: "claude_sessions",
    description:
      "List live running Claude Code sessions (sessionId, name, pid, cwd, status, named-pipe capability).",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    run: () =>
      listLiveClaudeSessions().map(
        ({ pid, sessionId, name, cwd, status, messagingSocketPath }) => ({
          pid,
          sessionId,
          name,
          cwd,
          status,
          pipeReady: Boolean(messagingSocketPath),
        }),
      ),
  },
  {
    name: "claude_inject",
    description:
      "Inject real-time context or action updates into active Claude Code sessions immediately via their native IPC pipe (with hook-mailbox fallback).",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description:
            "Update or context to inject into the target Claude session(s).",
        },
        target: {
          type: "string",
          description:
            "Target sessionId, name, pid, cwd basename, or 'all' (default: 'all').",
        },
        sender: {
          type: "string",
          description: "Logical sender identifier (default: 'aphrody-bridge').",
        },
        cwd: {
          type: "string",
          description: "Optional workspace path prefix filter.",
        },
        urgent: {
          type: "boolean",
          description:
            "Set priority='now' on native pipe delivery (default: false -> 'next').",
        },
      },
      required: ["message"],
      additionalProperties: false,
    },
    run: (args) => {
      const message = String(args.message ?? "").trim();
      if (!message) throw new Error("message is required");
      return deliverRealtime({
        message,
        target: typeof args.target === "string" ? args.target : "all",
        sender:
          typeof args.sender === "string" ? args.sender : "aphrody-bridge",
        cwdFilter: typeof args.cwd === "string" ? args.cwd : undefined,
        urgent: args.urgent === true,
      });
    },
  },
];

if (import.meta.main) {
  await serveMcp({ name: "aphrody-claude-bridge", version: "1.0.0" }, TOOLS);
}
