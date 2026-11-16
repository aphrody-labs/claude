# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This repository is the user's global Claude Code config directory (`~/.claude`) under git. The root `CLAUDE.md` here is not repo documentation: it is the user's global instruction file, loaded into every session on the machine, so keep repo-specific notes in this file (`.claude/CLAUDE.md`) and in `README.md`.

## Commands

- `bun install` once, then:
- `bun run check` validates the plugin (`claude plugin validate skills/aphrody`) and type-checks all TypeScript (`bun x tsc -p tsconfig.json`). There is no test suite.
- `bun run setup` adds the tracked `gitconfig` (commit identity, `pull.ff only`) as an `include.path` of the global git config, removes global `user.name`/`user.email` so the include wins, runs `gh auth setup-git`, then installs every `enabledPlugins` entry of `settings.json` (`claude plugin install <id> --scope user`) that `claude plugin list` does not already show.
- `bun run sync` commits every whitelisted change and pushes.

## Layout and rules

- `.gitignore` is a whitelist (`/*` then `!` entries). A new top-level file or directory is untracked until it is whitelisted there; never whitelist `.credentials.json`, `history.jsonl`, `plugins/`, `sessions/`, `file-history/`, `backups/` or other runtime state. Under `projects/`, only `projects/*/memory/` is tracked.
- `skills/aphrody/` is the single local plugin, auto-loaded by Claude Code as `aphrody@skills-dir` (any directory under `~/.claude/skills/` with a `.claude-plugin/plugin.json`). Add global skills as `skills/aphrody/skills/<name>/SKILL.md`, subagents in `skills/aphrody/agents/`, output styles in `skills/aphrody/output-styles/`, hooks in `skills/aphrody/hooks/hooks.json` with TypeScript handlers run by `bun` from `skills/aphrody/hooks-handlers/`. Do not create a second local plugin or top-level `agents/`, `commands/` or `output-styles/` directories.
- `skills/aphrody/.mcp.json` declares remote MCP servers shipped with the plugin (OVHcloud official MCP, EU endpoint, OAuth via `/mcp`).
- `skills/aphrody/SKILL.md` is itself a skill (`"skills": ["./"]` in `plugin.json`) describing how to manage this repo.
- `hooks-handlers/config-sync.ts` resolves the repo root as three levels above itself; `pull` (SessionStart) fast-forwards from origin, `push` (SessionEnd) runs `git add -A`, commits and pushes. It must stay non-blocking: report failures on stderr, always exit 0.
- `hooks-handlers/lib.ts` types every hook event and response; handlers import it and must type-check under `bun run check`. `auto-background.ts` (PreToolUse Bash) sets `run_in_background: true` on commands matching its `LONG` patterns (builds, tests, installs, git network, ssh, package managers) unless the call already sets the flag. `typecheck.ts` (PostToolUse Write|Edit, async) runs `tsc --noEmit` on the nearest `tsconfig.json` project, one run per project at a time (lock dir in the OS temp dir), and returns only the edited file's errors as `additionalContext`.
- `settings.json` `env` sets `CLAUDE_AUTO_BACKGROUND_TASKS=1` (long subagents move to the background) and `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=5` (subagents delegate recursively five layers deep).
- Autonomy is configured in three places that must stay aligned: `settings.json` (`bypassPermissions`, `AskUserQuestion` and `EnterPlanMode` denied), the Autonome output style, and the standing-authorization line of the root `CLAUDE.md`.
- `output-styles/autonome.md` has `force-for-plugin: true`, so the style is active whenever the plugin is enabled; `settings.json` `outputStyle` names the same style.
- Third-party plugins are only declared in `settings.json` `enabledPlugins` (plus `extraKnownMarketplaces` for GitHub marketplaces such as `anthropics/claude-plugins-official`, used when the built-in Anthropic Directory lookup fails); `plugins/` is Claude Code's install cache and is rebuilt by `bun run setup`.
- `settings.json` must stay machine-independent: no absolute paths, hostnames or secrets.
