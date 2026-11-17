// Minimal MCP stdio server (newline-delimited JSON-RPC): initialize, tools/list, tools/call. Shared by the plugin's servers.

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run: (args: Record<string, unknown>) => unknown | Promise<unknown>;
}

interface JsonRpcReq {
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

export function text(value: unknown): {
  content: Array<{ type: "text"; text: string }>;
} {
  return {
    content: [
      {
        type: "text",
        text:
          typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

/** Handles one request; returns the response, or undefined for notifications. Pure, so it is testable without stdio. */
export async function handleRequest(
  info: { name: string; version: string },
  tools: McpTool[],
  req: JsonRpcReq,
): Promise<unknown | undefined> {
  if (req.id === undefined || req.id === null) return undefined;
  const reply = (result: unknown) => ({ jsonrpc: "2.0", id: req.id, result });
  if (req.method === "initialize") {
    return reply({
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: info,
    });
  }
  if (req.method === "tools/list") {
    return reply({
      tools: tools.map(({ name, description, inputSchema }) => ({
        name,
        description,
        inputSchema,
      })),
    });
  }
  if (req.method === "tools/call") {
    const name = String(req.params?.name ?? "");
    const tool = tools.find((t) => t.name === name);
    if (!tool)
      return {
        jsonrpc: "2.0",
        id: req.id,
        error: { code: -32601, message: `Unknown tool: ${name}` },
      };
    try {
      return reply(
        text(
          await tool.run(
            (req.params?.arguments ?? {}) as Record<string, unknown>,
          ),
        ),
      );
    } catch (err) {
      return reply({
        isError: true,
        content: [{ type: "text", text: (err as Error).message }],
      });
    }
  }
  return reply({});
}

export async function serveMcp(
  info: { name: string; version: string },
  tools: McpTool[],
): Promise<void> {
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
      const res = await handleRequest(info, tools, req);
      if (res !== undefined) process.stdout.write(`${JSON.stringify(res)}\n`);
    }
  }
}
