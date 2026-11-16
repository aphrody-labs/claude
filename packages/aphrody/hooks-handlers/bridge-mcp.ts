#!/usr/bin/env bun
import { deliverRealtime, listLiveClaudeSessions } from "./claude-peer.ts";

interface JsonRpcReq {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

const TOOLS = [
  {
    name: "claude_sessions",
    description:
      "List live running Claude Code sessions (sessionId, name, pid, cwd, status, named-pipe capability).",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
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
  },
];

function send(msg: unknown): void {
  process.stdout.write(`${JSON.stringify(msg)}\n`);
}

let buf = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) {
  buf += chunk;
  let nl: number;
  while ((nl = buf.indexOf("\n")) !== -1) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let req: JsonRpcReq;
    try {
      req = JSON.parse(line) as JsonRpcReq;
    } catch {
      continue;
    }
    if (req.id === undefined || req.id === null) continue;

    if (req.method === "initialize") {
      send({
        jsonrpc: "2.0",
        id: req.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "aphrody-claude-bridge", version: "1.0.0" },
        },
      });
    } else if (req.method === "tools/list") {
      send({ jsonrpc: "2.0", id: req.id, result: { tools: TOOLS } });
    } else if (req.method === "tools/call") {
      const params = req.params ?? {};
      const name = String(params.name ?? "");
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      try {
        if (name === "claude_sessions") {
          const rows = listLiveClaudeSessions().map(
            ({
              pid,
              sessionId,
              name: sName,
              cwd,
              status,
              messagingSocketPath,
            }) => ({
              pid,
              sessionId,
              name: sName,
              cwd,
              status,
              pipeReady: Boolean(messagingSocketPath),
            }),
          );
          send({
            jsonrpc: "2.0",
            id: req.id,
            result: {
              content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
            },
          });
        } else if (name === "claude_inject") {
          const message = String(args.message ?? "").trim();
          if (!message) throw new Error("message is required");
          const res = await deliverRealtime({
            message,
            target: typeof args.target === "string" ? args.target : "all",
            sender:
              typeof args.sender === "string" ? args.sender : "aphrody-bridge",
            cwdFilter: typeof args.cwd === "string" ? args.cwd : undefined,
            urgent: args.urgent === true,
          });
          send({
            jsonrpc: "2.0",
            id: req.id,
            result: {
              content: [{ type: "text", text: JSON.stringify(res, null, 2) }],
            },
          });
        } else {
          send({
            jsonrpc: "2.0",
            id: req.id,
            error: { code: -32601, message: `Unknown tool: ${name}` },
          });
        }
      } catch (err) {
        send({
          jsonrpc: "2.0",
          id: req.id,
          result: {
            isError: true,
            content: [{ type: "text", text: (err as Error).message }],
          },
        });
      }
    } else {
      send({ jsonrpc: "2.0", id: req.id, result: {} });
    }
  }
}
