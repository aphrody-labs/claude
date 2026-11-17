#!/usr/bin/env bun
// MCP server `memory`: full-text search over project memory, learning digests, research docs and past sessions.
import {
  defaultSources,
  indexAll,
  type Kind,
  openIndex,
  search,
} from "./memory.ts";
import { type McpTool, serveMcp } from "./mcp-lite.ts";

export const TOOLS: McpTool[] = [
  {
    name: "memory_search",
    description:
      "Full-text search (FTS5, ranked) over durable memory, instructions, learning digests, docs and past sessions. Use before asking the user something already decided.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Words to look for." },
        kind: {
          type: "string",
          enum: ["memory", "instructions", "digest", "doc", "session"],
          description: "Restrict to one source kind.",
        },
        limit: { type: "number", description: "Maximum hits (default 8)." },
      },
      required: ["query"],
      additionalProperties: false,
    },
    run: (args) => {
      const db = openIndex();
      try {
        indexAll(db, defaultSources());
        return search(db, String(args.query ?? ""), {
          kind: typeof args.kind === "string" ? (args.kind as Kind) : undefined,
          limit: typeof args.limit === "number" ? args.limit : undefined,
        });
      } finally {
        db.close();
      }
    },
  },
  {
    name: "memory_reindex",
    description:
      "Rebuild the memory index incrementally, optionally including past session transcripts (slower).",
    inputSchema: {
      type: "object",
      properties: {
        sessions: {
          type: "boolean",
          description: "Include session transcripts.",
        },
      },
      additionalProperties: false,
    },
    run: (args) => {
      const db = openIndex();
      try {
        return indexAll(db, defaultSources(undefined, args.sessions === true));
      } finally {
        db.close();
      }
    },
  },
];

if (import.meta.main) {
  await serveMcp({ name: "aphrody-memory", version: "1.0.0" }, TOOLS);
}
