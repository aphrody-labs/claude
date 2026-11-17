import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SCRIPT = join(import.meta.dir, "auto-background.ts");

const run = (payload: unknown, harness = "claude") => {
  const cwd = mkdtempSync(join(tmpdir(), "claude-autobg-test-"));
  try {
    const r = Bun.spawnSync(
      ["bun", "--no-install", "--no-env-file", SCRIPT, harness],
      {
        cwd,
        env: { ...process.env, HOME: cwd, USERPROFILE: cwd },
        stdin: new TextEncoder().encode(
          typeof payload === "string" ? payload : JSON.stringify(payload),
        ),
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    return { code: r.exitCode, out: r.stdout.toString() };
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
};

const bash = (command: string, extra: Record<string, unknown> = {}) => ({
  tool_name: "Bash",
  tool_input: { command, ...extra },
});

describe("auto-background.ts (claude)", () => {
  test("heavy command gets run_in_background true", () => {
    const r = run(bash("cargo test -p foo"));
    expect(r.code).toBe(0);
    const out = JSON.parse(r.out);
    expect(out.hookSpecificOutput.hookEventName).toBe("PreToolUse");
    expect(out.hookSpecificOutput.permissionDecision).toBe("allow");
    expect(out.hookSpecificOutput.updatedInput).toEqual({
      command: "cargo test -p foo",
      run_in_background: true,
    });
  });

  test("light command passes through as {}", () => {
    const r = run(bash("ls"));
    expect(r.code).toBe(0);
    expect(r.out).toBe("{}");
  });

  test("already backgrounded heavy command is left alone", () => {
    expect(run(bash("cargo build", { run_in_background: true })).out).toBe(
      "{}",
    );
  });

  test.each(["bun test", "docker build .", "pytest -q", "cmake --build out"])(
    "%s is treated as heavy",
    (cmd) => {
      const out = JSON.parse(run(bash(cmd)).out);
      expect(out.hookSpecificOutput.updatedInput.run_in_background).toBe(true);
    },
  );

  test("empty or invalid stdin and missing command yield {}", () => {
    expect(run("").out).toBe("{}");
    expect(run("not json").out).toBe("{}");
    expect(run({ tool_name: "Bash", tool_input: {} }).out).toBe("{}");
  });
});

describe("auto-background.ts (agy)", () => {
  const agy = (command: string, args: Record<string, unknown> = {}) => ({
    toolCall: { name: "run_command", args: { CommandLine: command, ...args } },
  });

  test("heavy command gets WaitMsBeforeAsync 1500", () => {
    const out = JSON.parse(run(agy("cargo check"), "agy").out);
    expect(out.decision).toBe("allow");
    expect(out.overwrite.WaitMsBeforeAsync).toBe(1500);
    expect(out.overwrite.CommandLine).toBe("cargo check");
  });

  test("daemon and already-async commands are untouched", () => {
    expect(run(agy("cargo build", { IsDaemon: true }), "agy").out).toBe("{}");
    expect(run(agy("cargo build", { WaitMsBeforeAsync: 500 }), "agy").out).toBe(
      "{}",
    );
  });
});
