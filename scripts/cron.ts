#!/usr/bin/env bun
// Scheduler for the agent layer (agent.toml). One OS-level tick (Bun.cron) runs every due job, headless.
//   bun scripts/cron.ts list | run <id> | tick | install | uninstall
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deliverRealtime } from "../packages/aphrody/hooks-handlers/claude-peer.ts";
import { REPO_ROOT } from "./lib.ts";

export interface Job {
  id: string;
  schedule: string;
  kind: "cmd" | "agent";
  argv?: string[];
  prompt?: string;
  model?: string;
  deliver?: "inject" | "log";
  enabled: boolean;
}

export interface AgentConfig {
  agent: { name: string; model: string };
  gateway: { channels: string[] };
  jobs: Job[];
}

export const TICK_TITLE = "aphrody-agent-tick";
const stateDir = () =>
  process.env.AGENT_STATE_DIR ?? join(REPO_ROOT, "learning", "cron");

export function parseConfig(toml: string): AgentConfig {
  const raw = Bun.TOML.parse(toml) as {
    agent?: { name?: string; model?: string };
    gateway?: { channels?: string[] };
    cron?: Array<Partial<Job>>;
  };
  const jobs = (raw.cron ?? []).map((j): Job => {
    if (!j.id || !j.schedule || (j.kind !== "cmd" && j.kind !== "agent"))
      throw new Error(`invalid cron job: ${JSON.stringify(j)}`);
    if (Bun.cron.parse(j.schedule) === null)
      throw new Error(
        `job ${j.id}: schedule has no future fire time: ${j.schedule}`,
      );
    if (j.kind === "cmd" && !j.argv?.length)
      throw new Error(`job ${j.id}: cmd job needs argv`);
    if (j.kind === "agent" && !j.prompt)
      throw new Error(`job ${j.id}: agent job needs prompt`);
    return {
      ...j,
      id: j.id,
      schedule: j.schedule,
      kind: j.kind,
      enabled: j.enabled ?? true,
    } as Job;
  });
  const ids = new Set(jobs.map((j) => j.id));
  if (ids.size !== jobs.length) throw new Error("duplicate cron job id");
  return {
    agent: {
      name: raw.agent?.name ?? "agent",
      model: raw.agent?.model ?? "sonnet",
    },
    gateway: { channels: raw.gateway?.channels ?? [] },
    jobs,
  };
}

export function loadConfig(file = join(REPO_ROOT, "agent.toml")): AgentConfig {
  return parseConfig(readFileSync(file, "utf8"));
}

/** A job is due when its next fire time after the last run is already in the past. */
export function isDue(
  schedule: string,
  lastRunMs: number,
  nowMs: number,
): boolean {
  const next = Bun.cron.parse(schedule, new Date(lastRunMs));
  return next !== null && next.getTime() <= nowMs;
}

type State = Record<string, number>;

function readState(): State {
  try {
    return JSON.parse(
      readFileSync(join(stateDir(), "state.json"), "utf8"),
    ) as State;
  } catch {
    return {};
  }
}

function writeState(s: State): void {
  mkdirSync(stateDir(), { recursive: true });
  writeFileSync(
    join(stateDir(), "state.json"),
    `${JSON.stringify(s, null, 2)}\n`,
  );
}

export async function runJob(
  job: Job,
  cfg: AgentConfig,
): Promise<{ ok: boolean; output: string }> {
  const argv =
    job.kind === "cmd"
      ? job.argv!
      : [
          "claude",
          "-p",
          job.prompt!,
          "--model",
          job.model ?? cfg.agent.model,
          "--output-format",
          "text",
        ];
  const p = Bun.spawn(argv, {
    cwd: REPO_ROOT,
    stdout: "pipe",
    stderr: "pipe",
    stdin: "ignore",
  });
  const [out, err, code] = await Promise.all([
    new Response(p.stdout).text(),
    new Response(p.stderr).text(),
    p.exited,
  ]);
  const output = (out + err).trim();
  const dir = join(REPO_ROOT, "learning", "cron", job.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${new Date().toISOString().replace(/[:.]/g, "-")}.md`),
    `${output}\n`,
  );
  if (job.deliver === "inject" && output)
    await deliverRealtime({
      message: `[cron ${job.id}] ${output.slice(0, 1500)}`,
      target: "all",
      sender: cfg.agent.name,
    });
  return { ok: code === 0, output };
}

export async function tick(
  cfg: AgentConfig,
  now = Date.now(),
  run = runJob,
): Promise<string[]> {
  const state = readState();
  const ran: string[] = [];
  for (const job of cfg.jobs.filter((j) => j.enabled)) {
    const last = state[job.id] ?? now;
    if (!(job.id in state)) state[job.id] = now;
    else if (isDue(job.schedule, last, now)) {
      await run(job, cfg);
      state[job.id] = now;
      ran.push(job.id);
    }
  }
  writeState(state);
  return ran;
}

/** OS-level entry point: Bun.cron(path, schedule, title) calls this export. */
export default {
  async scheduled(): Promise<void> {
    await tick(loadConfig());
  },
};

if (import.meta.main) {
  const [cmd, id] = Bun.argv.slice(2);
  const cfg = loadConfig();
  if (cmd === "list") {
    for (const j of cfg.jobs) {
      const next = Bun.cron.parse(j.schedule)?.toISOString() ?? "-";
      console.log(
        `${j.enabled ? "on " : "off"} ${j.id.padEnd(16)} ${j.schedule.padEnd(14)} ${j.kind.padEnd(5)} next ${next}`,
      );
    }
  } else if (cmd === "run" && id) {
    const job = cfg.jobs.find((j) => j.id === id);
    if (!job) throw new Error(`unknown job ${id}`);
    const r = await runJob(job, cfg);
    console.log(r.output);
    process.exit(r.ok ? 0 : 1);
  } else if (cmd === "tick") {
    console.log(JSON.stringify(await tick(cfg)));
  } else if (cmd === "install") {
    await Bun.cron(import.meta.path, "*/5 * * * *", TICK_TITLE);
    console.log(`registered ${TICK_TITLE} (every 5 minutes)`);
  } else if (cmd === "uninstall") {
    await Bun.cron.remove(TICK_TITLE);
    console.log(`removed ${TICK_TITLE}`);
  } else {
    console.error(
      "usage: bun scripts/cron.ts list | run <id> | tick | install | uninstall",
    );
    process.exit(1);
  }
}
