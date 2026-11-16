// Typed input and output for Claude Code command hooks (https://code.claude.com/docs/en/hooks).
// Every handler reads one event from stdin and prints at most one JSON response.

interface Base {
  session_id: string
  transcript_path: string
  cwd: string
  permission_mode?: string
}
export interface BashInput { command: string; description?: string; timeout?: number; run_in_background?: boolean; [k: string]: unknown }
export interface FileInput { file_path: string; [k: string]: unknown }
export type PreToolUse = Base & { hook_event_name: "PreToolUse"; tool_name: string; tool_input: Record<string, unknown> }
export type PostToolUse = Base & { hook_event_name: "PostToolUse"; tool_name: string; tool_input: Record<string, unknown>; tool_response: unknown }
export type SessionStart = Base & { hook_event_name: "SessionStart"; source: "startup" | "resume" | "clear" | "compact" | "fork" }
export type SessionEnd = Base & { hook_event_name: "SessionEnd"; reason: string }
export type HookEvent = PreToolUse | PostToolUse | SessionStart | SessionEnd

export type HookOutput = {
  systemMessage?: string
  hookSpecificOutput?:
    | { hookEventName: "PreToolUse"; permissionDecision?: "allow" | "deny" | "ask" | "defer"; permissionDecisionReason?: string; updatedInput?: Record<string, unknown>; additionalContext?: string }
    | { hookEventName: "PostToolUse" | "SessionStart"; additionalContext?: string }
}

/** Reads the hook event; resolves to null when stdin is a terminal or not JSON. */
export async function readEvent<E extends HookEvent>(): Promise<E | null> {
  if (process.stdin.isTTY) return null
  const text = await new Response(Bun.stdin.stream()).text()
  try { return JSON.parse(text) as E } catch { return null }
}

export function respond(out: HookOutput): void {
  process.stdout.write(JSON.stringify(out))
}
