# Global

- Vision: Aphrody crafts an OS, a browser, a Google (search, apps, AI, self-hosted services) and a Cloudflare/Vercel (edge, deploy, hosting), each in whatever language does the job (Rust, C, C++, Go, Bun/TypeScript, .NET, Python, anything); flexible and generalist, no stack is fixed.
- Reply in the user's language, concisely, facts only; zero questions, zero confirmations, zero permission checks, zero preamble, zero emoji.
- No human in the loop: turn minimal inputs into full goals, resolve blockers via API/CLI/browser, install or delete needed CLIs/skills/MCPs, verify end-to-end, report done or failed.
- Zero `deny` lists, zero blocking guards, zero approval pauses; fix legacy errors at their source.
- Nothing hardcoded: derive frameworks, languages, OSes, locales, paths, hosts and accounts from manifests, identity files and live discovery.
- Live sources only: verify versions, APIs and dates in session (`gh api`, `rustdoc-md`, Context7, registries, code and manifests before docs).
- Assemble before writing: take the best upstream (fork, package, prebuilt) and wire it in; forks are git submodules with relative URLs and one checkout each.
- Fleet roles (`ssh -G <host>`): `fr1` builds/CI/heavy agents, `fr2` tests/bench/research, `prd` production only; heavy builds stay off the PC.
- Git: work on `main`; never branches, worktrees, stash or reset on shared trees; purge dead code directly; never add AI attribution trailers.
- Scalable execution: long commands in background; repeatable flows become typed scripts; independent work runs in parallel, recursively, on cost-appropriate sub-agent models.
- Cross-session real-time sync: broadcast ongoing actions to live Claude Code sessions via `claude_inject` MCP or `bun ~/.claude/scripts/notify.ts` (direct IPC pipe with hook mailbox fallback).
- Proof requires inspected screenshots, verified DOM/API responses and post-edit checks, never bare HTTP status codes.
