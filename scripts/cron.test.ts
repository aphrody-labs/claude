import { expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  type AgentConfig,
  isDue,
  loadConfig,
  parseConfig,
  tick,
} from "./cron.ts";

const sample = `
[agent]
name = "t"
model = "haiku"
[gateway]
channels = ["plugin:telegram@claude-plugins-official"]
[[cron]]
id = "a"
schedule = "*/10 * * * *"
kind = "cmd"
argv = ["bun", "-e", "0"]
[[cron]]
id = "b"
schedule = "0 9 * * *"
kind = "agent"
prompt = "hello"
enabled = false
`;

test("parseConfig reads agent, gateway and jobs with defaults", () => {
  const cfg = parseConfig(sample);
  expect(cfg.agent).toEqual({ name: "t", model: "haiku" });
  expect(cfg.gateway.channels).toHaveLength(1);
  expect(cfg.jobs.map((j) => [j.id, j.enabled])).toEqual([
    ["a", true],
    ["b", false],
  ]);
});

test("parseConfig rejects invalid jobs", () => {
  expect(() =>
    parseConfig(
      '[[cron]]\nid="x"\nschedule="not cron"\nkind="cmd"\nargv=["a"]',
    ),
  ).toThrow();
  expect(() =>
    parseConfig('[[cron]]\nid="x"\nschedule="* * * * *"\nkind="cmd"'),
  ).toThrow("argv");
  expect(() =>
    parseConfig('[[cron]]\nid="x"\nschedule="* * * * *"\nkind="agent"'),
  ).toThrow("prompt");
  const dup =
    '[[cron]]\nid="x"\nschedule="* * * * *"\nkind="cmd"\nargv=["a"]\n';
  expect(() => parseConfig(dup + dup)).toThrow("duplicate");
});

test("the shipped agent.toml parses", () => {
  const cfg = loadConfig();
  expect(cfg.jobs.length).toBeGreaterThan(0);
  expect(cfg.jobs.every((j) => j.kind === "cmd" || j.kind === "agent")).toBe(
    true,
  );
});

test("isDue follows the next fire time after the last run", () => {
  const t = (s: string) => new Date(s).getTime();
  expect(
    isDue("*/10 * * * *", t("2026-01-01T10:00:00Z"), t("2026-01-01T10:09:59Z")),
  ).toBe(false);
  expect(
    isDue("*/10 * * * *", t("2026-01-01T10:00:00Z"), t("2026-01-01T10:10:00Z")),
  ).toBe(true);
});

test("tick records new jobs without running them, then runs due enabled jobs", async () => {
  const cfg: AgentConfig = parseConfig(sample);
  const ran: string[] = [];
  const run = async (j: { id: string }) => {
    ran.push(j.id);
    return { ok: true, output: "" };
  };
  const base = Date.parse("2026-01-01T10:00:00Z");
  const dir = mkdtempSync(join(tmpdir(), "cron-state-"));
  process.env.AGENT_STATE_DIR = dir;
  try {
    expect(await tick(cfg, base, run)).toEqual([]);
    expect(await tick(cfg, base + 5 * 60_000, run)).toEqual([]);
    expect(await tick(cfg, base + 11 * 60_000, run)).toEqual(["a"]);
    expect(ran).toEqual(["a"]);
  } finally {
    delete process.env.AGENT_STATE_DIR;
    rmSync(dir, { recursive: true, force: true });
  }
});
