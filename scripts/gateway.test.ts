import { expect, test } from "bun:test";
import { gatewayArgv } from "./gateway.ts";

test("gatewayArgv adds --channels only when channels are configured", () => {
  expect(gatewayArgv([], "sonnet")).toEqual(["claude", "--model", "sonnet"]);
  expect(
    gatewayArgv(["plugin:telegram@claude-plugins-official"], "haiku"),
  ).toEqual([
    "claude",
    "--model",
    "haiku",
    "--channels",
    "plugin:telegram@claude-plugins-official",
  ]);
});

test("--dry prints the command and exits 0", async () => {
  const p = Bun.spawn(
    [
      "bun",
      "--no-install",
      "--no-env-file",
      `${import.meta.dir}/gateway.ts`,
      "--dry",
    ],
    { stdout: "pipe", stderr: "ignore" },
  );
  expect(
    (await new Response(p.stdout).text()).startsWith("claude --model"),
  ).toBe(true);
  expect(await p.exited).toBe(0);
});
