#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { join } from "node:path";
import { readHookEvent, writeEmpty } from "./lib.ts";
import {
  drainHookMail,
  registerRelaySession,
  relaySessionsDir,
} from "./claude-peer.ts";

const mode = Bun.argv[2] ?? "deliver";
const event = await readHookEvent();
if (!event || !event.session_id) {
  writeEmpty();
  process.exit(0);
}

const sessionId = event.session_id;
const hookName =
  event.hook_event_name ?? (mode === "start" ? "SessionStart" : "PostToolUse");

// Fast path: skip opening SQLite during turns when no unread pending flag exists.
if (mode !== "start") {
  const pending = join(relaySessionsDir(), `${sessionId}.pending`);
  if (!existsSync(pending)) {
    writeEmpty();
    process.exit(0);
  }
}

if (mode === "start") {
  registerRelaySession(sessionId, "claude-code", event.cwd ?? "");
}

const mail = drainHookMail(sessionId);
if (mail.length === 0) {
  writeEmpty();
  process.exit(0);
}

const lines = mail.map(
  (m) => `[Live peer message from ${m.from_name}]: ${m.text}`,
);
process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: hookName,
      additionalContext: lines.join("\n"),
    },
  }),
);
