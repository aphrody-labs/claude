import { expect, test } from "bun:test";
import { TOOLS } from "./memory-mcp.ts";

test("memory MCP exposes search and reindex with schemas", () => {
  expect(TOOLS.map((t) => t.name)).toEqual(["memory_search", "memory_reindex"]);
  expect((TOOLS[0]!.inputSchema as { required: string[] }).required).toEqual([
    "query",
  ]);
});

test("memory_search over stdio answers a JSON-RPC call", async () => {
  const p = Bun.spawn(
    [
      "bun",
      "--no-install",
      "--no-env-file",
      `${import.meta.dir}/memory-mcp.ts`,
    ],
    {
      stdin: new Blob([
        `${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" })}\n`,
      ]),
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  const out = await new Response(p.stdout).text();
  await p.exited;
  expect(out).toContain("memory_search");
});
