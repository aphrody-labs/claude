import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SCRIPT = join(import.meta.dir, "typecheck.ts");

let tmp: string;
let project: string;
beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), "claude-typecheck-test-"));
  project = join(tmp, "proj");
  mkdirSync(project);
  writeFileSync(
    join(project, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        noEmit: true,
        target: "esnext",
        module: "esnext",
        moduleResolution: "bundler",
        skipLibCheck: true,
        types: [],
      },
      include: ["*.ts"],
    }),
  );
  writeFileSync(join(project, "bad.ts"), 'export const n: number = "text";\n');
  writeFileSync(join(project, "good.ts"), "export const n: number = 1;\n");
  writeFileSync(join(project, "notes.md"), "# hi\n");
});
afterAll(() => {
  rmSync(tmp, { recursive: true, force: true });
});

const run = (payload: unknown) =>
  Bun.spawnSync(["bun", "--no-install", "--no-env-file", SCRIPT, "claude"], {
    cwd: project,
    env: { ...process.env, HOME: tmp, USERPROFILE: tmp },
    stdin: new TextEncoder().encode(
      typeof payload === "string" ? payload : JSON.stringify(payload),
    ),
    stdout: "pipe",
    stderr: "pipe",
  });

const edit = (file: string) => ({
  tool_name: "Edit",
  tool_input: { file_path: file },
});

describe("typecheck.ts", () => {
  test("non-TypeScript file yields {}", () => {
    const r = run(edit(join(project, "notes.md")));
    expect(r.exitCode).toBe(0);
    expect(r.stdout.toString()).toBe("{}");
  });

  test("vendored paths and missing tsconfig yield {}", () => {
    expect(
      run(edit(join(project, "node_modules", "x", "a.ts"))).stdout.toString(),
    ).toBe("{}");
    const loose = mkdtempSync(join(tmp, "loose-"));
    writeFileSync(join(loose, "a.ts"), "export const n: number = 'x';\n");
    // No tsconfig up to the filesystem root of the temp tree (bounded to six levels).
    const r = run(edit(join(loose, "a.ts")));
    expect(r.exitCode).toBe(0);
    expect(r.stdout.toString()).toBe("{}");
  });

  test("empty and invalid stdin yield {}", () => {
    expect(run("").stdout.toString()).toBe("{}");
    expect(run("nope").stdout.toString()).toBe("{}");
  });

  test("type error produces diagnostics context", () => {
    const r = run(edit(join(project, "bad.ts")));
    expect(r.exitCode).toBe(0);
    const out = JSON.parse(r.stdout.toString());
    expect(out.hookSpecificOutput.hookEventName).toBe("PostToolUse");
    const ctx: string = out.hookSpecificOutput.additionalContext;
    expect(ctx).toContain("TypeScript check diagnostics");
    expect(ctx).toContain("bad.ts");
    expect(ctx).toMatch(/string/);
  });

  test("clean file yields {}", () => {
    const r = run(edit(join(project, "good.ts")));
    expect(r.exitCode).toBe(0);
    expect(r.stdout.toString()).toBe("{}");
  });
});
