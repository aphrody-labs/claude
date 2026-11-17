import { expect, test } from "bun:test";
import { TOOLS } from "./bridge-mcp.ts";

test("bridge MCP keeps its two tools", () => {
  expect(TOOLS.map((t) => t.name)).toEqual([
    "claude_sessions",
    "claude_inject",
  ]);
});

test("claude_inject rejects an empty message", () => {
  expect(() => TOOLS[1]!.run({ message: "  " })).toThrow("message is required");
});
