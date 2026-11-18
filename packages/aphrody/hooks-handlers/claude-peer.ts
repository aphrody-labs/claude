import { Database } from "bun:sqlite";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { connect } from "node:net";
import { basename, join } from "node:path";
import { CLAUDE_HOME, HOME } from "./lib.ts";

export interface ClaudeSessionRecord {
  pid: number;
  sessionId: string;
  cwd: string;
  name?: string;
  kind?: string;
  status?: string;
  messagingSocketPath?: string;
  peerToken?: string;
  updatedAt?: number;
}

export interface DeliveryResult {
  target: string;
  sessionId: string;
  channel: "pipe" | "hook";
  ok: boolean;
  error?: string;
}

export function aiOsSessionsDir(): string {
  const aiOsHome =
    process.env.AI_OS_HOME ??
    (process.platform === "win32"
      ? join(
          process.env.LOCALAPPDATA ?? join(HOME, "AppData", "Local"),
          "aphrody",
          "ai-os",
        )
      : join(HOME, ".local", "share", "aphrody", "ai-os"));
  return join(aiOsHome, "sessions");
}

function openSessionsDb(): Database {
  const dir = aiOsSessionsDir();
  mkdirSync(dir, { recursive: true });
  const db = new Database(join(dir, "sessions.db"), { create: true });
  db.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 3000;");
  db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, kind TEXT NOT NULL, cwd TEXT NOT NULL, seen INTEGER NOT NULL
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, sender TEXT NOT NULL, recipient TEXT NOT NULL, thread TEXT NOT NULL,
    reply_to TEXT, text TEXT NOT NULL, created INTEGER NOT NULL, delivered INTEGER
  )`);
  db.exec(
    "CREATE INDEX IF NOT EXISTS messages_inbox ON messages (recipient, delivered)",
  );
  return db;
}

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function listLiveClaudeSessions(): ClaudeSessionRecord[] {
  const dir = join(CLAUDE_HOME, "sessions");
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir);
  const out: ClaudeSessionRecord[] = [];
  for (const f of files) {
    if (!/^\d+\.json$/.test(f)) continue;
    try {
      const rec = JSON.parse(
        readFileSync(join(dir, f), "utf8"),
      ) as ClaudeSessionRecord;
      if (!rec.pid || !rec.sessionId || !isPidAlive(rec.pid)) continue;
      const keyFile = files.find(
        (k) => k.startsWith(`${rec.pid}.`) && k.endsWith(".key"),
      );
      let peerToken: string | undefined;
      if (keyFile) {
        try {
          const key = JSON.parse(readFileSync(join(dir, keyFile), "utf8")) as {
            peerToken?: string;
          };
          peerToken = key.peerToken;
        } catch {
          // Ignore malformed key file.
        }
      }
      out.push({ ...rec, peerToken });
    } catch {
      // Ignore torn/unreadable record.
    }
  }
  return out.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export async function pushPipeMessage(
  session: ClaudeSessionRecord,
  text: string,
  opts: { sender?: string; urgent?: boolean } = {},
): Promise<{ ok: boolean; error?: string }> {
  const socketPath = session.messagingSocketPath;
  if (!socketPath) {
    return { ok: false, error: "no messagingSocketPath on session" };
  }
  const fromName = (opts.sender ?? "aphrody-bridge").replace(/["<>]/g, "");
  const xml = `<cross-session-message from-name="${fromName}">\n${text.trim()}\n</cross-session-message>`;

  const authLine = session.peerToken
    ? `${JSON.stringify({ type: "auth", token: session.peerToken })}\n`
    : "";
  const msgLine = `${JSON.stringify({
    msgV: 1,
    msg_id: crypto.randomUUID(),
    type: "user",
    message: { role: "user", content: xml },
    priority: opts.urgent ? "now" : "next",
    from: fromName,
  })}\n`;

  return await new Promise((resolve) => {
    let settled = false;
    const done = (ok: boolean, error?: string) => {
      if (settled) return;
      settled = true;
      resolve(error ? { ok, error } : { ok });
    };
    const sock = connect({ path: socketPath });
    sock.setTimeout(3000, () => {
      sock.destroy();
      done(false, "pipe timeout");
    });
    sock.on("error", (err) => done(false, err.message));
    sock.on("connect", () => {
      sock.write(authLine + msgLine);
      sock.end();
    });
    sock.on("close", () => done(true));
  });
}

export function registerRelaySession(
  id: string,
  kind: string,
  cwd: string,
  preferredName?: string,
): { id: string; name: string } {
  const db = openSessionsDb();
  try {
    const now = Date.now();
    const prev = db
      .query<{ name: string }, [string]>(
        "SELECT name FROM sessions WHERE id = ?",
      )
      .get(id);
    const base = (
      cwd.split(/[\\/]/).filter(Boolean).pop() ?? "session"
    ).toLowerCase();
    const shortId = id.replace(/[^A-Za-z0-9]/g, "").slice(0, 6);
    let want = preferredName ?? prev?.name ?? `${kind}-${base}-${shortId}`;
    const conflict = db
      .query<{ id: string }, [string]>("SELECT id FROM sessions WHERE name = ?")
      .get(want);
    if (conflict && conflict.id !== id) want = `${want}-${shortId}`;
    db.query(
      `INSERT INTO sessions (id, name, kind, cwd, seen) VALUES (?1, ?2, ?3, ?4, ?5)
       ON CONFLICT(id) DO UPDATE SET name = ?2, kind = ?3, cwd = CASE WHEN ?4 = '' THEN cwd ELSE ?4 END, seen = ?5`,
    ).run(id, want, kind, cwd, now);
    return { id, name: want };
  } finally {
    db.close();
  }
}

export function queueHookMail(
  recipientId: string,
  senderName: string,
  text: string,
): void {
  const db = openSessionsDb();
  try {
    const now = Date.now();
    const senderId = `bridge-${senderName.toLowerCase().replace(/[^a-z0-9_-]/g, "") || "agent"}`;
    db.query(
      `INSERT INTO sessions (id, name, kind, cwd, seen) VALUES (?1, ?2, 'bridge', '', ?3)
       ON CONFLICT(id) DO UPDATE SET seen = ?3`,
    ).run(senderId, senderName, now);
    db.query(
      `INSERT INTO sessions (id, name, kind, cwd, seen) VALUES (?1, ?2, 'claude-code', '', ?3)
       ON CONFLICT(id) DO NOTHING`,
    ).run(recipientId, `claude-${recipientId.slice(0, 8)}`, now);
    db.query(
      "INSERT INTO messages (id, sender, recipient, thread, reply_to, text, created, delivered) VALUES (?, ?, ?, ?, NULL, ?, ?, NULL)",
    ).run(
      crypto.randomUUID(),
      senderId,
      recipientId,
      crypto.randomUUID(),
      text,
      now,
    );
    const pendingPath = join(aiOsSessionsDir(), `${recipientId}.pending`);
    writeFileSync(pendingPath, String(now), "utf8");
  } finally {
    db.close();
  }
}

export function drainHookMail(
  sessionId: string,
): Array<{ from_name: string; text: string; created: number }> {
  const dir = aiOsSessionsDir();
  const pendingPath = join(dir, `${sessionId}.pending`);
  const db = openSessionsDb();
  try {
    const rows = db
      .query<
        { id: string; from_name: string; text: string; created: number },
        [string]
      >(
        `SELECT m.id, COALESCE(s.name, m.sender) AS from_name, m.text, m.created
         FROM messages m LEFT JOIN sessions s ON s.id = m.sender
         WHERE m.recipient = ? AND m.delivered IS NULL ORDER BY m.created`,
      )
      .all(sessionId);
    if (rows.length > 0) {
      const now = Date.now();
      const mark = db.query("UPDATE messages SET delivered = ? WHERE id = ?");
      db.transaction(() => {
        for (const r of rows) mark.run(now, r.id);
      })();
    }
    db.query("UPDATE sessions SET seen = ? WHERE id = ?").run(
      Date.now(),
      sessionId,
    );
    if (existsSync(pendingPath)) rmSync(pendingPath, { force: true });
    return rows.map(({ from_name, text, created }) => ({
      from_name,
      text,
      created,
    }));
  } finally {
    db.close();
  }
}

function logLiveEvent(sender: string, target: string, text: string): void {
  const dir = join(CLAUDE_HOME, "learning");
  const file = join(dir, "live-events.jsonl");
  try {
    mkdirSync(dir, { recursive: true });
    appendFileSync(
      file,
      `${JSON.stringify({ at: new Date().toISOString(), sender, target, text: text.slice(0, 500) })}\n`,
      "utf8",
    );
  } catch {
    // Non-fatal logging failure.
  }
}

export async function deliverRealtime(opts: {
  target?: string;
  cwdFilter?: string;
  sender?: string;
  message: string;
  urgent?: boolean;
  alsoQueueHook?: boolean;
}): Promise<DeliveryResult[]> {
  const sender = opts.sender ?? "agy";
  const target = (opts.target ?? "all").trim();
  const sessions = listLiveClaudeSessions();

  const matches = sessions.filter((s) => {
    if (opts.cwdFilter) {
      const wantCwd = opts.cwdFilter.replaceAll("\\", "/").toLowerCase();
      const gotCwd = s.cwd.replaceAll("\\", "/").toLowerCase();
      if (!gotCwd.startsWith(wantCwd)) return false;
    }
    if (target === "all" || target === "*" || target === "workspace") {
      // A broadcast never loops back to the session that sent it.
      const self = process.env.CLAUDE_SESSION_ID ?? process.env.CLAUDE_CODE_SESSION_ID;
      return s.name !== sender && s.sessionId !== sender && s.sessionId !== self;
    }
    if (String(s.pid) === target) return true;
    if (s.sessionId === target || s.sessionId.startsWith(target)) return true;
    if (
      s.name &&
      (s.name === target || s.name.toLowerCase().includes(target.toLowerCase()))
    )
      return true;
    if (basename(s.cwd).toLowerCase() === target.toLowerCase()) return true;
    return false;
  });

  // The native pipe only carries messages from real Claude Code sessions: Claude Code holds a pipe message whose
  // from-name is not a live session ("unidentified session"). Any other sender (agy, gemini, scripts) goes through the
  // ai-os mailbox, which names the sender and is drained by the session-bridge hook.
  const senderIsSession = sessions.some(
    (x) => x.name === sender || x.sessionId === sender,
  );
  const results: DeliveryResult[] = [];
  for (const s of matches) {
    const label = s.name ?? `${basename(s.cwd)}-${s.sessionId.slice(0, 6)}`;
    let piped = false;
    if (s.messagingSocketPath && senderIsSession) {
      const r = await pushPipeMessage(s, opts.message, {
        sender,
        urgent: opts.urgent,
      });
      piped = r.ok;
      results.push({
        target: label,
        sessionId: s.sessionId,
        channel: "pipe",
        ok: r.ok,
        error: r.error,
      });
    }
    if (!piped || opts.alsoQueueHook) {
      queueHookMail(s.sessionId, sender, opts.message);
      results.push({
        target: label,
        sessionId: s.sessionId,
        channel: "hook",
        ok: true,
      });
    }
  }

  // Fallback for direct UUID target even if session file isn't present yet.
  if (matches.length === 0 && /^[0-9a-f-]{8,}$/i.test(target)) {
    queueHookMail(target, sender, opts.message);
    results.push({ target, sessionId: target, channel: "hook", ok: true });
  }

  logLiveEvent(sender, target, opts.message);
  return results;
}
