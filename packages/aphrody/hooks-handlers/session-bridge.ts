#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  emitContext,
  extractCwd,
  extractHookName,
  extractSessionId,
  readHookEvent,
  writeEmpty,
} from "./lib.ts";
import {
  drainHookMail,
  registerRelaySession,
  aiOsSessionsDir,
} from "./claude-peer.ts";

const mode = Bun.argv[2] ?? "deliver";
const event = await readHookEvent();
const rawSessionId = event ? extractSessionId(event) : "";
if (!event || !rawSessionId) {
  writeEmpty();
  process.exit(0);
}

const sessionId = rawSessionId;
const isAgyPayload =
  typeof event.conversationId === "string" ||
  typeof event.hookEventName === "string";
const hookName = extractHookName(
  event,
  mode === "start" ? "SessionStart" : "PostToolUse",
);
const kind = isAgyPayload ? "antigravity" : "claude-code";

// Fast path: skip opening SQLite during turns when no unread pending flag exists.
if (mode !== "start") {
  const pending = join(aiOsSessionsDir(), `${sessionId}.pending`);
  if (!existsSync(pending)) {
    writeEmpty();
    process.exit(0);
  }
}

if (mode === "start") {
  registerRelaySession(sessionId, kind, extractCwd(event));
}

const mail = drainHookMail(sessionId);
if (mail.length === 0) {
  writeEmpty();
  process.exit(0);
}

const lines = mail.map(
  (m) => `[Live peer message from ${m.from_name}]: ${m.text}`,
);
if (isAgyPayload) {
  const mappedHook =
    hookName === "SessionStart" ? "SessionStart" : "UserPromptSubmit";
  emitContext(
    "agy",
    hookName === "PostToolUse" ? "PostToolUse" : mappedHook,
    lines.join("\n"),
  );
} else {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: hookName,
        additionalContext: lines.join("\n"),
      },
    }),
  );
}
