import { expect, test } from "bun:test";
import { handleRequest, type McpTool } from "./mcp-lite.ts";

const info = { name: "t", version: "1" };
const tools: McpTool[] = [
  {
    name: "echo",
    description: "d",
    inputSchema: { type: "object" },
    run: (a) => ({ got: a.x }),
  },
  {
    name: "boom",
    description: "d",
    inputSchema: { type: "object" },
    run: () => {
      throw new Error("nope");
    },
  },
];

test("notifications get no response", async () => {
  expect(
    await handleRequest(info, tools, { method: "notifications/initialized" }),
  ).toBeUndefined();
});

test("initialize and tools/list", async () => {
  const init = (await handleRequest(info, tools, {
    id: 1,
    method: "initialize",
  })) as { result: { serverInfo: unknown } };
  expect(init.result.serverInfo).toEqual(info);
  const list = (await handleRequest(info, tools, {
    id: 2,
    method: "tools/list",
  })) as { result: { tools: Array<{ name: string; run?: unknown }> } };
  expect(list.result.tools.map((t) => t.name)).toEqual(["echo", "boom"]);
  expect(list.result.tools[0]!.run).toBeUndefined();
});

test("tools/call returns JSON text, errors as isError, unknown tools as JSON-RPC errors", async () => {
  const ok = (await handleRequest(info, tools, {
    id: 3,
    method: "tools/call",
    params: { name: "echo", arguments: { x: 7 } },
  })) as { result: { content: Array<{ text: string }> } };
  expect(JSON.parse(ok.result.content[0]!.text)).toEqual({ got: 7 });
  const bad = (await handleRequest(info, tools, {
    id: 4,
    method: "tools/call",
    params: { name: "boom" },
  })) as { result: { isError: boolean } };
  expect(bad.result.isError).toBe(true);
  const unknown = (await handleRequest(info, tools, {
    id: 5,
    method: "tools/call",
    params: { name: "zzz" },
  })) as { error: { code: number } };
  expect(unknown.error.code).toBe(-32601);
});
