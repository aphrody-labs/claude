import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";

export type Harness = "claude" | "agy" | "gemini";

export interface RawHookEvent {
  hook_event_name?: string;
  hookEventName?: string;
  session_id?: string;
  conversationId?: string;
  transcript_path?: string;
  transcriptPath?: string;
  artifactDirectoryPath?: string;
  cwd?: string;
  workspacePaths?: string[];
  modelName?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_response?: unknown;
  toolCall?: {
    id?: string;
    name?: string;
    args?: Record<string, unknown>;
  };
  stepIdx?: number;
  invocationNum?: number;
  initialNumSteps?: number;
  prompt?: string;
  user_prompt?: string;
  lastUserInput?: string;
  source?: string;
  reason?: string;
  error?: string;
  [k: string]: unknown;
}

const SECRET_RE =
  /(sk-[A-Za-z0-9_-]{16,}|ghp_\w{20,}|gho_\w{20,}|github_pat_\w{20,}|AIza[\w-]{30,}|xox[bp]-[\w-]+|eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,}|Bearer\s+\S{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_-]?key|token|secret|passw(?:or)?d)["']?\s*[=:]\s*["']?[^\s"',;]{6,})/gi;

export const HOME = (
  process.env.USERPROFILE ??
  process.env.HOME ??
  homedir()
).replaceAll("\\", "/");
export const CLAUDE_HOME = `${HOME}/.claude`;

export function findRepoRoot(start = import.meta.dir): string {
  let cur = resolve(start);
  for (let i = 0; i < 8; i++) {
    if (existsSync(resolve(cur, ".git"))) return cur;
    const parent = dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return resolve(CLAUDE_HOME);
}

export function detectHarness(arg?: string): Harness {
  if (arg === "agy" || arg === "gemini" || arg === "claude") return arg;
  if (process.env.CLAUDE_PLUGIN_ROOT) return "claude";
  if (process.env.GEMINI_CLI || process.env.extensionPath) return "gemini";
  return "claude";
}

export function redactSecrets(input: string): string {
  return input.replace(SECRET_RE, "[redacted]");
}

export async function readHookEvent(): Promise<RawHookEvent | null> {
  if (process.stdin.isTTY) return null;
  try {
    const text = await new Response(Bun.stdin.stream()).text();
    if (!text.trim()) return null;
    return JSON.parse(text) as RawHookEvent;
  } catch {
    return null;
  }
}

export function extractSessionId(event: RawHookEvent): string {
  const id = event.session_id ?? event.conversationId;
  return typeof id === "string" ? id : "";
}

export function extractCwd(event: RawHookEvent): string {
  if (typeof event.cwd === "string" && event.cwd) return event.cwd;
  if (
    Array.isArray(event.workspacePaths) &&
    typeof event.workspacePaths[0] === "string" &&
    event.workspacePaths[0]
  ) {
    return event.workspacePaths[0];
  }
  return process.cwd();
}

export function extractHookName(event: RawHookEvent, fallback = ""): string {
  const name = event.hook_event_name ?? event.hookEventName;
  return typeof name === "string" && name ? name : fallback;
}

export function extractToolName(event: RawHookEvent): string {
  const name = event.tool_name ?? event.toolCall?.name;
  return typeof name === "string" ? name : "";
}

export function extractToolArgs(event: RawHookEvent): Record<string, unknown> {
  if (event.toolCall?.args && typeof event.toolCall.args === "object") {
    return event.toolCall.args;
  }
  if (event.tool_input && typeof event.tool_input === "object") {
    return event.tool_input;
  }
  return {};
}

export function extractPrompt(event: RawHookEvent): string {
  const p = event.prompt ?? event.user_prompt ?? event.lastUserInput;
  return typeof p === "string" ? p : "";
}

export function extractCommand(event: RawHookEvent): string {
  const input = extractToolArgs(event);
  const cmd = input.command ?? input.CommandLine ?? input.cmd;
  return typeof cmd === "string" ? cmd : "";
}

export function extractFilePath(event: RawHookEvent): string {
  const input = extractToolArgs(event);
  const fp =
    input.file_path ??
    input.Path ??
    input.TargetFile ??
    input.AbsolutePath ??
    input.path;
  return typeof fp === "string" ? fp : "";
}

export function writeEmpty(): void {
  process.stdout.write("{}");
}

export function allowPreTool(
  harness: Harness,
  updatedInput?: Record<string, unknown>,
  note?: string,
): void {
  if (harness === "agy") {
    const payload: Record<string, unknown> = { decision: "allow" };
    if (updatedInput) payload.overwrite = updatedInput;
    if (note) payload.reason = note;
    process.stdout.write(JSON.stringify(payload));
    return;
  }
  if (harness === "gemini") {
    const payload: Record<string, unknown> = { decision: "allow" };
    if (updatedInput) payload.hookSpecificOutput = { tool_input: updatedInput };
    if (note) payload.systemMessage = note;
    process.stdout.write(JSON.stringify(payload));
    return;
  }
  const hookSpecificOutput: Record<string, unknown> = {
    hookEventName: "PreToolUse",
    permissionDecision: "allow",
  };
  if (updatedInput) hookSpecificOutput.updatedInput = updatedInput;
  if (note) hookSpecificOutput.additionalContext = note;
  process.stdout.write(JSON.stringify({ hookSpecificOutput }));
}

export function emitContext(
  harness: Harness,
  hookEventName: "PostToolUse" | "SessionStart" | "UserPromptSubmit",
  text: string,
): void {
  if (harness === "agy") {
    if (hookEventName === "PostToolUse") {
      // Antigravity PostToolUse hooks must return {} on stdout; emit diagnostics to stderr.
      console.error(text);
      writeEmpty();
      return;
    }
    process.stdout.write(
      JSON.stringify({
        injectSteps: [{ systemMessage: { systemMessage: text } }],
      }),
    );
    return;
  }
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName,
        additionalContext: text,
      },
    }),
  );
}
