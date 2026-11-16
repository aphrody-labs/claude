import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

export const REPO_ROOT = resolve(import.meta.dir, "..");
export const HOME = (
  process.env.USERPROFILE ??
  process.env.HOME ??
  homedir()
).replaceAll("\\", "/");
export const ACTIVE_AGY_SESSION = "5c753f13-dd89-43ae-ae12-7c332bb1e98c";

export function toSlash(p: string): string {
  return p.replaceAll("\\", "/");
}

export function discoverSrcRoot(): string {
  const candidates = [
    process.env.SRC_ROOT,
    join(HOME, "src", "ay"),
    "C:/src/ay",
    join(HOME, "ay"),
  ].filter((x): x is string => Boolean(x));

  for (const c of candidates) {
    const norm = toSlash(c);
    if (
      existsSync(join(norm, "tools", "identity.toml")) ||
      existsSync(join(norm, "frameworks", "ai-os"))
    ) {
      return norm;
    }
  }
  const srcParent = existsSync("C:/src") ? "C:/src" : join(HOME, "src");
  return toSlash(join(srcParent, "ay"));
}

export function discoverWorkspaceRoot(): string {
  const srcRoot = discoverSrcRoot();
  return toSlash(resolve(srcRoot, ".."));
}

export function writeIfChanged(path: string, content: string): boolean {
  const normalized = content;
  if (existsSync(path)) {
    try {
      if (readFileSync(path, "utf8") === normalized) return false;
    } catch {
      // Rewrite if unreadable.
    }
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, normalized, "utf8");
  return true;
}

export function ensureDirLink(target: string, linkPath: string): void {
  const absTarget = resolve(target);
  const absLink = resolve(linkPath);
  mkdirSync(dirname(absLink), { recursive: true });
  try {
    const st = lstatSync(absLink);
    if (st.isSymbolicLink()) {
      rmSync(absLink, { recursive: true, force: true });
    } else if (st.isDirectory()) {
      rmSync(absLink, { recursive: true, force: true });
    } else {
      rmSync(absLink, { force: true });
    }
  } catch {
    // Not present yet.
  }
  symlinkSync(
    absTarget,
    absLink,
    process.platform === "win32" ? "junction" : "dir",
  );
}

export function runCmd(
  cmd: string[],
  cwd = REPO_ROOT,
): { ok: boolean; code: number; out: string; err: string } {
  const r = Bun.spawnSync(cmd, {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    stdin: "ignore",
  });
  return {
    ok: r.exitCode === 0,
    code: r.exitCode,
    out: r.stdout.toString().trim(),
    err: r.stderr.toString().trim(),
  };
}

export function templateVars(): Record<string, string> {
  const srcRoot = discoverSrcRoot();
  const wsRoot = discoverWorkspaceRoot();
  return {
    HOME,
    HOME_WIN: HOME.replaceAll("/", "\\"),
    REPO_ROOT: toSlash(REPO_ROOT),
    SRC_ROOT: srcRoot,
    SRC_ROOT_WIN: srcRoot.replaceAll("/", "\\"),
    WORKSPACE_ROOT: wsRoot,
    WORKSPACE_ROOT_WIN: wsRoot.replaceAll("/", "\\"),
    RELAY_URL: process.env.RELAY_URL ?? "http://127.0.0.1:8790",
  };
}

export function renderTemplate(
  raw: string,
  vars = templateVars(),
  jsonEscape = false,
): string {
  let out = raw;
  for (const [k, v] of Object.entries(vars)) {
    const val = jsonEscape ? v.replaceAll("\\", "\\\\") : v;
    out = out.replaceAll(`\${${k}}`, val);
  }
  return out;
}
