---
name: rust-crate-docs-tools
description: Context7/gitingest equivalent for Rust - rustdoc-md (docs.rs rustdoc JSON to Markdown, any crate/version), cargo-doc-md (crate + deps locally), Context7 for big crates, gitingest for repos
metadata:
  type: reference
---

Verified 2026-11-16:
- `rustdoc-md --crate-name <c> [--crate-version <v>] --output <c>.md`: pulls the rustdoc JSON from docs.rs (https://docs.rs/crate/<c>/latest/json, zstd) and writes full Markdown docs (taffy: 156 KB in seconds). Installed via cargo binstall.
- `cargo doc-md`: Markdown for a local crate and its dependencies (our workspace).
- Context7 covers the big crates (/tokio-rs/tokio...); `gitingest <repo>` for the whole source.
- MCP alternatives (rust-docs-mcp, docs-rs-mcp, rustdoc-mcp) have almost no users.
