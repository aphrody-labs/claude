---
name: config
description: Manage the versioned global Claude Code config (~/.claude as a git repo with the aphrody plugin). Use when asked to version, sync, commit, push, restore, bootstrap or reproduce the global Claude config, add a global skill, agent, hook or output style, or install the config on a new machine.
---

# Global config

The global config directory (`~/.claude`) is a git repo; `.gitignore` is a whitelist, so only config is tracked, never credentials, history, caches or sessions.

- Add global skills under `skills/aphrody/skills/<name>/SKILL.md`, subagents under `skills/aphrody/agents/`, hooks in `skills/aphrody/hooks/hooks.json` (handlers in TypeScript on Bun under `hooks-handlers/`), output styles under `skills/aphrody/output-styles/`. Everything ships in this one plugin (`aphrody@skills-dir`); do not create other local plugins.
- Third-party plugins are declared only in `settings.json` `enabledPlugins`; `bun run setup` installs them.
- After a change: `bun run check` (validates the plugin), then `bun run sync` (commit and push). The plugin's SessionStart hook fast-forwards from origin and its SessionEnd hook commits and pushes automatically.
- New machine: follow `README.md` (clone into `~/.claude`, then `bun run setup`).
