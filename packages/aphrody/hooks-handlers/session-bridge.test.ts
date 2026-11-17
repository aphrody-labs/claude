import { Database } from "bun:sqlite";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SCRIPT = join(import.meta.dir, "session-bridge.ts");

let tmp: string;
let sessionsDir: string;
beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), "claude-bridge-test-"));
  sessionsDir = join(tmp, "relay", "sessions");
});
afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

const run = (payload: unknown, mode?: string) =>
  Bun.spawnSync(
    ["bun", "--no-install", "--no-env-file", SCRIPT, ...(mode ? [mode] : [])],
    {
      cwd: tmp,
      env: {
        ...process.env,
        HOME: tmp,
        USERPROFILE: tmp,
        RELAY_HOME: join(tmp, "relay"),
      },
      stdin: new TextEncoder().encode(
        typeof payload === "string" ? payload : JSON.stringify(payload),
      ),
      stdout: "pipe",
      stderr: "pipe",
    },
  );

const seedMail = (recipient: string, text: string): void => {
  mkdirSync(sessionsDir, { recursive: true });
  const db = new Database(join(sessionsDir, "sessions.db"), { create: true });
  db.exec(`CREATE TABLE sessions (
    id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, kind TEXT NOT NULL, cwd TEXT NOT NULL, seen INTEGER NOT NULL
  )`);
  db.exec(`CREATE TABLE messages (
    id TEXT PRIMARY KEY, sender TEXT NOT NULL, recipient TEXT NOT NULL, thread TEXT NOT NULL,
    reply_to TEXT, text TEXT NOT NULL, created INTEGER NOT NULL, delivered INTEGER
  )`);
  db.query(
    "INSERT INTO sessions VALUES ('peer', 'peer-name', 'claude-code', '/x', 0)",
  ).run();
  db.query(
    "INSERT INTO messages VALUES ('m1', 'peer', ?, 't', NULL, ?, 1, NULL)",
  ).run(recipient, text);
  db.close();
  writeFileSync(join(sessionsDir, `${recipient}.pending`), "1");
};

describe("session-bridge.ts", () => {
  test("no pending flag yields {}", () => {
    const r = run({ session_id: "s1", hook_event_name: "PostToolUse" });
    expect(r.exitCode).toBe(0);
    expect(r.stdout.toString()).toBe("{}");
    expect(existsSync(join(sessionsDir, "sessions.db"))).toBe(false);
  });

  test("empty, invalid or session-less stdin yields {}", () => {
    for (const p of ["", "nope", { foo: 1 }]) {
      const r = run(p);
      expect(r.exitCode).toBe(0);
      expect(r.stdout.toString()).toBe("{}");
    }
  });

  test("pending flag with mail delivers it as additionalContext and drains", () => {
    seedMail("s1", "hello there");
    const r = run({ session_id: "s1", hook_event_name: "PostToolUse" });
    expect(r.exitCode).toBe(0);
    expect(JSON.parse(r.stdout.toString())).toEqual({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: "[Live peer message from peer-name]: hello there",
      },
    });
    expect(existsSync(join(sessionsDir, "s1.pending"))).toBe(false);
    expect(run({ session_id: "s1" }).stdout.toString()).toBe("{}");
  });

  test("start mode registers the session and yields {} without mail", () => {
    const r = run(
      { session_id: "abc123", hook_event_name: "SessionStart", cwd: "/w/proj" },
      "start",
    );
    expect(r.exitCode).toBe(0);
    expect(r.stdout.toString()).toBe("{}");
    const db = new Database(join(sessionsDir, "sessions.db"), {
      readonly: true,
    });
    const row = db
      .query<{ name: string; kind: string; cwd: string }, []>(
        "SELECT name, kind, cwd FROM sessions WHERE id = 'abc123'",
      )
      .get();
    db.close();
    expect(row?.kind).toBe("claude-code");
    expect(row?.cwd).toBe("/w/proj");
    expect(row?.name).toContain("proj");
  });
});
