# Claude Code global config

Versioned `~/.claude`: global instructions, settings, per-project auto-memory and one local plugin, `aphrody` (`skills/aphrody`), which carries every global skill, subagent, hook and output style. Third-party plugins are declared in `settings.json` and reinstalled by a Bun script. `.gitignore` is a whitelist: credentials, history, sessions and caches are never tracked.

## Install on a machine

Requires `git`, `bun`, `gh` (logged in with `gh auth login`) and `claude` on `PATH`.

```sh
# ~/.claude absent
git clone https://github.com/aphrody-labs/claude ~/.claude
# ~/.claude already present (Claude Code ran once)
git -C ~/.claude init -b main
git -C ~/.claude remote add origin https://github.com/aphrody-labs/claude
git -C ~/.claude fetch origin && git -C ~/.claude checkout -f -B main --track origin/main

cd ~/.claude && bun install && bun run setup
```

## Scripts

| Command | Effect |
| --- | --- |
| `bun run setup` | Include `gitconfig` (git identity) in the global git config, run `gh auth setup-git`, install every plugin enabled in `settings.json`, validate `aphrody` |
| `bun run check` | `claude plugin validate` on `aphrody` and `tsc` over all TypeScript |
| `bun run sync` | Commit all whitelisted changes and push |

The `aphrody` plugin's SessionStart hook fast-forwards this repo from `origin`; its SessionEnd hook commits and pushes, so the config stays in sync without manual steps.
