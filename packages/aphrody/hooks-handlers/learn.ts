#!/usr/bin/env bun
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { spawn } from "node:child_process";
import { homedir, hostname, platform } from "node:os";
import { basename, dirname, join } from "node:path";
import {
  CLAUDE_HOME,
  detectHarness,
  emitContext,
  extractCommand,
  extractCwd,
  extractPrompt,
  extractSessionId,
  extractToolName,
  readHookEvent,
  redactSecrets,
  writeEmpty,
} from "./lib.ts";

interface JournalEntry {
  at: string;
  harness: string;
  session: string;
  cwd: string;
  kind: "error" | "recovery" | "correction";
  tool?: string;
  summary: string;
}

interface LearnState {
  lastDistillAt: number;
  lastLineCount: number;
  lastErrorsBySession: Record<string, string>;
  lastPromptsBySession?: Record<string, string>;
}

const LEARN_DIR = join(CLAUDE_HOME, "learning");
const JOURNAL = join(LEARN_DIR, "journal.jsonl");
const INBOX = join(LEARN_DIR, "inbox");
const STATE_FILE = join(LEARN_DIR, "state.json");

const CORRECTION_RE =
  /\b(always|never|stop doing|do not|don't|instead|remember|toujours|jamais|retiens|arrête|arrete|fais plutot|corrige)\b/i;

function loadState(): LearnState {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8")) as LearnState;
  } catch {
    return { lastDistillAt: 0, lastLineCount: 0, lastErrorsBySession: {} };
  }
}

function saveState(s: LearnState): void {
  mkdirSync(LEARN_DIR, { recursive: true });
  writeFileSync(STATE_FILE, `${JSON.stringify(s, null, 2)}\n`, "utf8");
}

function appendEntry(entry: JournalEntry): number {
  mkdirSync(LEARN_DIR, { recursive: true });
  appendFileSync(JOURNAL, `${JSON.stringify(entry)}\n`, "utf8");
  if (!existsSync(JOURNAL)) return 1;
  return readFileSync(JOURNAL, "utf8").split(/\r?\n/).filter(Boolean).length;
}

function looksFailed(text: string): boolean {
  return (
    /\bCommand exited with code [1-9]\d*|exitCode["']?\s*:\s*[1-9]\d*|stderr["']?\s*:\s*["'][^"']+/i.test(
      text,
    ) || /error:\s|ENOENT|ECONNREFUSED|SyntaxError|ParseError/i.test(text)
  );
}

function responseText(resp: unknown): string {
  if (typeof resp === "string") return resp;
  if (resp === null || resp === undefined) return "";
  try {
    return JSON.stringify(resp);
  } catch {
    return String(resp);
  }
}

function maybeTriggerDistill(lineCount: number, state: LearnState): void {
  const delta = lineCount - state.lastLineCount;
  const elapsedMs = Date.now() - state.lastDistillAt;
  if (delta >= 12 && elapsedMs >= 30 * 60 * 1000) {
    spawn(
      "bun",
      ["--no-install", "--no-env-file", import.meta.path, "distill"],
      {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      },
    ).unref();
  }
}

async function handleCapture(harnessArg?: string): Promise<void> {
  const harness = detectHarness(harnessArg);
  const event = await readHookEvent();
  if (!event) {
    writeEmpty();
    return;
  }

  const session = extractSessionId(event) || "default";
  const cwd = extractCwd(event);
  const state = loadState();
  const tool = extractToolName(event);
  const prompt = extractPrompt(event);

  if (!tool && prompt.trim()) {
    const clean = redactSecrets(prompt.trim())
      .replace(/\s+/g, " ")
      .slice(0, 400);
    state.lastPromptsBySession ??= {};
    if (state.lastPromptsBySession[session] !== clean) {
      state.lastPromptsBySession[session] = clean;
      const pKeys = Object.keys(state.lastPromptsBySession);
      if (pKeys.length > 24) delete state.lastPromptsBySession[pKeys[0]!];
      saveState(state);
      if (CORRECTION_RE.test(clean)) {
        const n = appendEntry({
          at: new Date().toISOString(),
          harness,
          session,
          cwd,
          kind: "correction",
          summary: clean,
        });
        maybeTriggerDistill(n, state);
      }
    }
    writeEmpty();
    return;
  }

  if (!tool) {
    writeEmpty();
    return;
  }

  const rawResp = responseText(event.error ?? event.tool_response);
  const cmd = extractCommand(event);
  // Claude Code reports failed tools through PostToolUseFailure; matching the text of a successful result
  // flags every file or log that merely contains the word "error:". Other harnesses carry no such event.
  const failed =
    event.hook_event_name === "PostToolUseFailure" ||
    (typeof event.error === "string" && event.error !== "");
  const isError = failed || (harness !== "claude" && looksFailed(rawResp));

  const label = redactSecrets((cmd || tool).replace(/\s+/g, " ").slice(0, 180));

  if (isError) {
    state.lastErrorsBySession[session] = label;
    // Bound map size.
    const keys = Object.keys(state.lastErrorsBySession);
    if (keys.length > 24) delete state.lastErrorsBySession[keys[0]!];
    saveState(state);

    const errSnippet = redactSecrets(rawResp.replace(/\s+/g, " ")).slice(
      0,
      320,
    );
    const n = appendEntry({
      at: new Date().toISOString(),
      harness,
      session,
      cwd,
      kind: "error",
      tool,
      summary: `${label} => ${errSnippet}`,
    });
    maybeTriggerDistill(n, state);
  } else if (state.lastErrorsBySession[session]) {
    const prevErr = state.lastErrorsBySession[session];
    delete state.lastErrorsBySession[session];
    saveState(state);

    const n = appendEntry({
      at: new Date().toISOString(),
      harness,
      session,
      cwd,
      kind: "recovery",
      tool,
      summary: `Recovered from [${prevErr}] via [${label}]`,
    });
    maybeTriggerDistill(n, state);
  }

  writeEmpty();
}

function handleDistill(): void {
  if (!existsSync(JOURNAL)) {
    console.log("No learning journal yet.");
    return;
  }
  const lines = readFileSync(JOURNAL, "utf8").split(/\r?\n/).filter(Boolean);
  const state = loadState();
  const startIdx = Math.min(state.lastLineCount, lines.length);
  const slice = lines.slice(startIdx);
  if (slice.length === 0) {
    console.log("Journal already distilled.");
    return;
  }

  const parsed: JournalEntry[] = [];
  for (const line of slice) {
    try {
      parsed.push(JSON.parse(line) as JournalEntry);
    } catch {
      // Skip malformed line.
    }
  }

  const counts = new Map<string, { count: number; sample: JournalEntry }>();
  for (const e of parsed) {
    const key = `${e.kind}:${e.tool ?? "prompt"}:${e.summary.slice(0, 80)}`;
    const prev = counts.get(key);
    counts.set(key, { count: (prev?.count ?? 0) + 1, sample: e });
  }

  mkdirSync(INBOX, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const digestPath = join(INBOX, `${stamp}-digest.md`);
  const rows = [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)
    .map(
      ({ count, sample }) =>
        `- [${sample.kind} x${count}] (${basename(sample.cwd) || sample.harness}) ${sample.summary}`,
    );

  writeFileSync(
    digestPath,
    `# Learning Digest (${new Date().toISOString()})\n\nEntries processed: ${parsed.length}\n\n${rows.join("\n")}\n`,
    "utf8",
  );

  // Retain at most the newest 400 lines so journal never grows unbounded.
  const kept = lines.length > 400 ? lines.slice(lines.length - 400) : lines;
  if (kept.length !== lines.length) {
    writeFileSync(JOURNAL, `${kept.join("\n")}\n`, "utf8");
  }

  state.lastDistillAt = Date.now();
  state.lastLineCount = kept.length;
  saveState(state);
  const promoted = autoPromoteDigests();
  console.log(`Distilled ${parsed.length} journal entries -> ${digestPath} (auto-promoted ${promoted.promoted})`);
}

function resolveCloudConfig(): { url: string; token?: string; pcId: string } {
  const url = (process.env.APHRODY_LEARN_URL?.trim() || "https://learn.aphrody.com").replace(/\/$/, "");
  const tokenFile = join(homedir(), ".config", "aphrody", "learn.token");
  const token =
    process.env.APHRODY_LEARN_TOKEN?.trim() ||
    process.env.APHRODY_FLEET_TOKEN?.trim() ||
    (existsSync(tokenFile) ? readFileSync(tokenFile, "utf8").trim() : undefined);
  const pcId = `${platform()}-${hostname().replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 32)}`;
  return { url, token, pcId };
}

function autoPromoteDigests(): { promoted: number; filesRemoved: number } {
  if (!existsSync(INBOX)) return { promoted: 0, filesRemoved: 0 };
  const digests = readdirSync(INBOX).filter((f) => f.endsWith("-digest.md"));
  if (digests.length === 0) return { promoted: 0, filesRemoved: 0 };
  const memDir = join(CLAUDE_HOME, "projects", "shared", "memory");
  const memFile = join(memDir, "learned-auto.md");
  const cur = existsSync(memFile) ? readFileSync(memFile, "utf8") : "# Autonomous Shared Learnings\n";
  const seen = new Set(cur.split(/\r?\n/).map((l) => l.trim()));
  const adds: string[] = [];
  for (const f of digests) {
    const p = join(INBOX, f);
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = /^- \[(correction|recovery|error) x(\d+)\]\s+\([^)]+\)\s+(.+)$/.exec(line.trim());
      if (!m) continue;
      if (m[1] === "correction" || m[1] === "recovery" || Number(m[2]) >= 2) {
        const entry = `- [${m[1]}] ${redactSecrets(m[3]).slice(0, 220)}`;
        if (!seen.has(entry)) {
          seen.add(entry);
          adds.push(entry);
        }
      }
    }
    rmSync(p, { force: true });
  }
  if (adds.length > 0) {
    mkdirSync(memDir, { recursive: true });
    writeFileSync(memFile, `${cur.trimEnd()}\n${adds.join("\n")}\n`, "utf8");
    const idx = join(memDir, "MEMORY.md");
    const curIdx = existsSync(idx) ? readFileSync(idx, "utf8") : "# Shared Memory\n";
    if (!curIdx.includes("(learned-auto.md)")) {
      writeFileSync(idx, `${curIdx.trimEnd()}\n- [learned-auto](learned-auto.md) — Autonomous cross-session rules.\n`, "utf8");
    }
  }
  return { promoted: adds.length, filesRemoved: digests.length };
}

async function syncCloudLearn(mode: "push" | "pull" | "cycle" = "cycle"): Promise<Record<string, unknown>> {
  const { url, token, pcId } = resolveCloudConfig();
  const csPath = join(LEARN_DIR, "cloud-state.json");
  let cs = { lastRevision: -1, lastPushLine: 0, lastCheckAt: 0 };
  try {
    cs = JSON.parse(readFileSync(csPath, "utf8")) as typeof cs;
  } catch {
    // Use defaults.
  }
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
  let pushed = 0;
  try {
    if ((mode === "push" || mode === "cycle") && existsSync(JOURNAL)) {
      const lines = readFileSync(JOURNAL, "utf8").split(/\r?\n/).filter(Boolean);
      const start = Math.min(cs.lastPushLine, lines.length);
      const batch = lines
        .slice(start, start + 60)
        .map((l) => {
          try {
            return JSON.parse(l) as JournalEntry;
          } catch {
            return null;
          }
        })
        .filter((x): x is JournalEntry => x !== null && !!x.summary);
      if (batch.length > 0) {
        const res = await fetch(`${url}/api/learn/events?distill=1`, {
          method: "POST",
          headers,
          body: JSON.stringify({ harness: "claude", pcId, entries: batch }),
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) {
          pushed = batch.length;
          cs.lastPushLine = Math.min(lines.length, start + 60);
        }
      } else {
        cs.lastPushLine = lines.length;
      }
    }
    if (mode === "pull" || mode === "cycle") {
      const mUrl = cs.lastRevision >= 0 ? `${url}/api/learn/manifest.json?since=${cs.lastRevision}` : `${url}/api/learn/manifest.json`;
      const man = await fetch(mUrl, { headers, signal: AbortSignal.timeout(3500) });
      if (man.status === 200) {
        const bRes = await fetch(`${url}/api/learn/bundle.json`, { headers, signal: AbortSignal.timeout(4500) });
        if (bRes.ok) {
          const bundle = (await bRes.json()) as {
            revision: number;
            memory?: { topics?: Record<string, { title: string; summary: string; bullets: string[] }> };
            brain?: { docs?: Record<string, { path: string; content: string }> };
          };
          const memDir = join(CLAUDE_HOME, "projects", "shared", "memory");
          mkdirSync(memDir, { recursive: true });
          const outLines = [`# Aphrody Cloud Memory (rev ${bundle.revision})`, ""];
          for (const t of Object.values(bundle.memory?.topics ?? {})) {
            outLines.push(`## ${t.title}`, t.summary || "", ...t.bullets.slice(0, 10).map((b) => `- ${b}`), "");
          }
          writeFileSync(join(memDir, "learned-cloud.md"), `${outLines.join("\n").trim()}\n`, "utf8");
          const idx = join(memDir, "MEMORY.md");
          const curIdx = existsSync(idx) ? readFileSync(idx, "utf8") : "# Shared Memory\n";
          if (!curIdx.includes("(learned-cloud.md)")) {
            writeFileSync(idx, `${curIdx.trimEnd()}\n- [learned-cloud](learned-cloud.md) — Autonomous serverless unified memory.\n`, "utf8");
          }
          for (const doc of Object.values(bundle.brain?.docs ?? {})) {
            const dst = join(LEARN_DIR, "brain-cloud", doc.path.replace(/^\/+/, ""));
            mkdirSync(dirname(dst), { recursive: true });
            writeFileSync(dst, doc.content, "utf8");
          }
          cs.lastRevision = bundle.revision;
        }
      }
    }
  } catch {
    // Non-blocking offline resilience.
  }
  cs.lastCheckAt = Date.now();
  mkdirSync(LEARN_DIR, { recursive: true });
  writeFileSync(csPath, `${JSON.stringify(cs, null, 2)}\n`, "utf8");
  return { ok: true, pushed, revision: cs.lastRevision };
}

const mode = Bun.argv[2] ?? "capture";
if (mode === "distill") {
  handleDistill();
} else if (mode === "distill-quiet") {
  await readHookEvent();
  handleDistill();
  await syncCloudLearn("cycle");
  writeEmpty();
} else if (mode === "cloud-sync") {
  await readHookEvent();
  console.log(JSON.stringify(await syncCloudLearn("cycle")));
} else if (mode === "nudge") {
  await readHookEvent();
  const promoted = autoPromoteDigests();
  if (promoted.promoted > 0) {
    spawn("bun", ["--no-install", join(CLAUDE_HOME, "scripts", "memory.ts"), "index"], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    }).unref();
  }
  spawn("bun", ["--no-install", "--no-env-file", import.meta.path, "cloud-sync"], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  }).unref();
  writeEmpty();
} else if (mode === "status") {
  const lines = existsSync(JOURNAL)
    ? readFileSync(JOURNAL, "utf8").split(/\r?\n/).filter(Boolean).length
    : 0;
  const s = loadState();
  console.log(
    JSON.stringify({
      totalLines: lines,
      pendingLines: Math.max(0, lines - s.lastLineCount),
      lastDistillAt: s.lastDistillAt,
    }),
  );
} else {
  await handleCapture(Bun.argv[3]);
}
