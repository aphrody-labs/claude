---
name: language-and-tooling
description: Any language per task (see vision), unrestricted fast CLI adoption, Rust doc extractors, Windows path/regex handling, and isolated doc sandboxes
type: feedback
---

- **No tool dogma**: install and use the fastest modern CLI/library that fits (`bun add -g`, `cargo binstall`, `uv tool`, `winget`, `nix`).
- **Crate & repo research**: use `rustdoc-md` (live docs.rs JSON -> Markdown), `cargo doc-md`, `gitingest`, `Context7`, `gh api` (pipe JSON to `jaq`), `ast-grep`, and `rg`/`fd`.
- **Windows shell & path quirks**:
  - Always normalize Windows backslashes to forward slashes or pass `-F` (`--fixed-strings`) to `rg`/`fd`/`sd` so paths like `\x86_64` never trigger regex escape errors.
  - Niubash (`niu`) reads `~/.niubashrc` (not `~/.bashrc`).
  - Write multiline or backslash-heavy scripts to `.ts`/script files rather than shell heredocs/inline quoting.
  - Bun on Windows may not fail on duplicate localhost port binds; check/stop stale listeners before restarting local servers.
- **Isolated sandboxes**: run third-party doc examples or package tests under `%TEMP%` with separate `package.json`, `HOME`, `BUN_INSTALL`, stripped project bins, and process-tree kill on timeout; never run loose `bun add` inside an app workspace.
- **Clean tree**: leave zero `.bak` files or temp leftovers.
