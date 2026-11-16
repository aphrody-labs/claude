---
name: language-and-tooling
description: Generalist unrestricted tool/language adoption, Rust/web doc tools, Windows path/regex handling, and isolated sandboxes
type: feedback
---

- **Flexible languages & tools**: use whichever language and tool fits the task (`Rust`, `C`, `C++`, `Go`, `Bun/TypeScript`, `.NET`, `Python`, etc.). No stack or tool dogma (`bun add -g`, `cargo binstall`, `uv tool`, `winget`, `nix`).
- **Crate & repo research**: use `rustdoc-md` (live docs.rs JSON -> Markdown), `cargo doc-md`, `gitingest`, `Context7`, `gh api` (pipe JSON to `jaq`), `ast-grep`, and `rg`/`fd`.
- **Windows shell & path quirks**:
  - Normalize Windows backslashes to forward slashes or pass `-F` (`--fixed-strings`) to `rg`/`fd`/`sd` so paths like `\x86_64` never trigger regex escape errors.
  - Niubash (`niu`) reads `~/.niubashrc` (not `~/.bashrc`).
  - Write multiline or backslash-heavy scripts to `.ts`/script files rather than shell heredocs/inline quoting.
  - Check/stop stale localhost listeners before restarting Bun servers on Windows.
- **Isolated sandboxes**: run third-party doc examples or package tests under `%TEMP%` with separate `package.json`, `HOME`, `BUN_INSTALL`, stripped project bins, and process-tree kill on timeout; never run loose `bun add` inside an app workspace.
- **Clean tree**: leave zero `.bak` files or temp leftovers.
