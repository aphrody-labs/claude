#!/usr/bin/env bun
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { spawn } from "node:child_process";
import { basename, join } from "node:path";
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
  console.log(`Distilled ${parsed.length} journal entries -> ${digestPath}`);
}

const mode = Bun.argv[2] ?? "capture";
if (mode === "distill") {
  handleDistill();
} else if (mode === "nudge") {
  // Session start: surface undistilled digests so the agent folds them into memory (the self-improvement loop closes here).
  await readHookEvent();
  const digests = existsSync(INBOX)
    ? readdirSync(INBOX).filter((f) => f.endsWith("-digest.md"))
    : [];
  if (digests.length === 0) writeEmpty();
  else
    emitContext(
      detectHarness(Bun.argv[3]),
      "SessionStart",
      `Learning inbox holds ${digests.length} undistilled digest(s) in ${INBOX}. Run the learn skill: merge durable rules into project memory, then delete the digests.`,
    );
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
