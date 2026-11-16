---
name: bun-crates
description: "Navigate the Rust side of the Aphrody runtime (aphrody-labs/bun): the 243 crates of the Cargo workspace (bun_core, bun_sys, bun_jsc, bun_runtime, js_parser, bundler, install...), Rust idioms, JSC bindings, GC lifetimes, event loop, parser, printer, resolver, bundler and CSS."
---

# The crates of the Aphrody runtime

## Workspace members

| Crate | Path | What |
| --- | --- | --- |
| `aphrody-jev` | `crates/aphrody-jev` | Bun typed decision protocol, validation and optional endpoint clients |
| `bun-plugin-n2b-napi` | `packages/bun-n2b/crates/napi` | Node-API addon behind @aphrody/bun-plugin-n2b. |
| `bun-plugin-oxc-napi` | `packages/bun-oxc/crates/napi` | Node-API addon and native onBeforeParse plugin behind @aphrody/bun-plugin-oxc. |
| `bun_adblock` | `src/adblock` | `adblock-rust` is the engine powering Brave's native adblocker, available as a library for anyone to use. It features: |
| `bun_agent_tools` | `src/agent_tools` | Native agent tools served by `bun mcp`: directory digests and the installed sources and documentation of a project's dependencies. |
| `bun_analytics` | `src/analytics` |  |
| `bun_ast` | `src/ast` | TODO: OWNERSHIP — almost every byte-slice field in this module has mixed/ambiguous ownership. Strings are sometimes literals, sometimes heap copies, sometimes slices into `Source.contents` or a `StringBuilder` arena. The |
| `bun_ast_jsc` | `src/ast_jsc` | JSC bridge for `bun.logger`. Keeps `src/logger/` free of JSC types. |
| `bun_ecma_ast` | `src/ast/ecma` | A collection of JavaScript tools written in Rust. |
| `bun_estree` | `src/ast/estree` | A collection of JavaScript tools written in Rust. |
| `bun_estree_tokens` | `src/ast/estree_tokens` | A collection of JavaScript tools written in Rust. |
| `bun_ecma_ast_macros` | `src/ast/macros` | A collection of JavaScript tools written in Rust. |
| `bun_ecma_span` | `src/ast/span` | A collection of JavaScript tools written in Rust. |
| `bun_ecma_syntax` | `src/ast/syntax` | A collection of JavaScript tools written in Rust. |
| `bun_ecma_traverse` | `src/ast/traverse` | A collection of JavaScript tools written in Rust. |
| `bun_ecma_ast_visit` | `src/ast/visit` | A collection of JavaScript tools written in Rust. |
| `bun_base64` | `src/base64` |  |
| `bun_boringssl` | `src/boringssl` |  |
| `bun_boringssl_sys` | `src/boringssl_sys` |  |
| `bun_brotli` | `src/brotli` |  |
| `bun_brotli_sys` | `src/brotli_sys` |  |
| `bun_browser` | `src/browser/crates/api` | Rust API for the BunBrowser headless browser |
| `bun_browser_browser` | `src/browser/crates/browser` | Bun browser module bun_browser_browser. |
| `bun_browser_cdp` | `src/browser/crates/cdp` | Bun browser module bun_browser_cdp. |
| `bun_browser_crawl` | `src/browser/crates/crawl` | Shared persistent crawl frontier and bounded Rust crawler for Bun. |
| `bun_browser_detect` | `src/browser/crates/detect` | Native technology and challenge detection for Bun |
| `bun_browser_dom` | `src/browser/crates/dom` | Bun browser module bun_browser_dom. |
| `bun_browser_extract` | `src/browser/crates/extract` | Bun content extraction, Markdown, chunking, SimHash, URL metadata, media and embed resolution. |
| `bun_browser_index` | `src/browser/crates/index` | HNSW approximate nearest-neighbour index with scalar int8 quantisation and mmap persistence |
| `bun_browser_js` | `src/browser/crates/js` | Bun browser module bun_browser_js. |
| `bun_browser_layout` | `src/browser/crates/layout` | Aphrody fork of Taffy, a flexible UI layout library (flexbox, grid, block, float), with local layout fixes; the library is still imported as `taffy`. |
| `bun_browser_mcp` | `src/browser/crates/mcp` | Bun browser module bun_browser_mcp. |
| `bun_browser_net` | `src/browser/crates/net` | Bun browser module bun_browser_net. |
| `bun_browser_render` | `src/browser/crates/render` | Optional scoped render layer for BunBrowser: layout (taffy) and, with the paint feature, text and raster output for screenshots. |
| `bun_browser_service` | `src/browser/crates/service` | Canonical web execution contract for Aphrody OS: OXC analysis, Bun tooling and BunBrowser V8 pages. |
| `bun_browser_ssrf` | `src/browser/crates/ssrf` | Shared SSRF deny-set and private-network opt-in for BunBrowser network transports and renderer. |
| `bun_alloc` | `src/bun_alloc` |  |
| `bun_core` | `src/bun_core` |  |
| `bun_core_macros` | `src/bun_core_macros` | Proc-macros for `bun_core`. |
| `bun_ecma_str` | `src/bun_core/ecma_strings` | A collection of JavaScript tools written in Rust. |
| `bun_output_tags` | `src/bun_output_tags` | Single source of truth for Bun's `<tag>` → ANSI colour table **and** the named ANSI escape constants used directly by REPL / diff-printer / multi-run output. Zero-dep `#![no_std]` leaf so both the proc-macro crate and ru |
| `bun_vpn` | `src/bun_vpn` | Bun's native client for the Mullvad VPN daemon. |
| `bun_git` | `src/bun-os/git` | Native Git (gix) and GitHub (octocrab) integration: repository inspection, history, ingest, search and upstream tracking. |
| `bun_native` | `src/bun-os/native` | Host hardware topology (CPU, RAM, CUDA) and monotonic clock probes. |
| `bun_pkg_cli` | `src/bun-os/pkg/cli` | Package store and remote metadata command interface |
| `bun_pkg_core` | `src/bun-os/pkg/core` | I/O-free package contracts and npm, Cargo sparse, NuGet, vcpkg and PyPI metadata parsers |
| `bun_pkg_net` | `src/bun-os/pkg/net` | Bounded resumable HTTP ingestion into the package store |
| `bun_pkg_store` | `src/bun-os/pkg/store` | Verified content-addressed package blob store |
| `bun_bundler` | `src/bundler` |  |
| `bun_bundler_jsc` | `src/bundler_jsc` | JSC bridge for `bun.bundler`. Keeps `src/bundler/` free of JSC types. |
| `bun_bunfig` | `src/bunfig` | `bun_bunfig` — bunfig.toml parser and `Arguments::loadConfig` entrypoints. |
| `bun_cares_sys` | `src/cares_sys` |  |
| `bun_clap` | `src/clap` |  |
| `bun_clap_macros` | `src/clap_macros` | Proc-macro backend for `bun_clap::parse_param!` / `bun_clap::parse_params!`. |
| `bun_ecma_ast_tools` | `src/codegen/ecma_ast_tools` | Generator of code related to AST. |
| `bun_ecma_benchmark` | `src/codegen/ecma_benchmark` | A collection of JavaScript tools written in Rust. |
| `bun_ecma_codegen_conformance` | `src/codegen/ecma_codegen_conformance` | Node API binding around `oxc_parser` + `oxc_codegen`, used as the reference output for the `oxc-codegen` package's conformance tests. |
| `bun_ecma_common` | `src/codegen/ecma_common` |  |
| `bun_ecma_compat_data` | `src/codegen/ecma_compat_data` |  |
| `bun_ecma_coverage` | `src/codegen/ecma_coverage` | A collection of JavaScript tools written in Rust. |
| `bun_ecma_linter_codegen` | `src/codegen/ecma_linter_codegen` |  |
| `bun_ecma_minsize` | `src/codegen/ecma_minsize` |  |
| `bun_ecma_rulegen` | `src/codegen/ecma_rulegen` |  |
| `bun_ecma_track_linter_timings` | `src/codegen/ecma_track_linter_timings` |  |
| `bun_ecma_track_memory_allocations` | `src/codegen/ecma_track_memory_allocations` |  |
| `bun_ecma_transform_checker` | `src/codegen/ecma_transform_checker` | Utility to check correctness of `ScopeTree` and `SymbolTable` after transformer has run. |
| `bun_ecma_transform_conformance` | `src/codegen/ecma_transform_conformance` | A collection of JavaScript tools written in Rust. |
| `bun_ecma_website_common` | `src/codegen/ecma_website_common` |  |
| `bun_ecma_website_formatter` | `src/codegen/ecma_website_formatter` |  |
| `bun_ecma_website_linter` | `src/codegen/ecma_website_linter` |  |
| `bun_collections` | `src/collections` | bun_collections — crate root. Thin re-export hub. |
| `bun_arena` | `src/collections/arena` | A collection of JavaScript tools written in Rust. |
| `bun_ecma_collections` | `src/collections/ecma` | A collection of JavaScript tools written in Rust. |
| `bun_typed_index` | `src/collections/typed_index` | Newtype-style helpers for `Vec` and `usize`. |
| `bun_coreutils` | `src/coreutils` | GNU coreutils from uutils (MIT, vendored by `scripts/build/deps/uutils.ts`), linked into the `bun` binary as a multi-call set: `bun` started under an applet name (`head`, `sort`, ...; a link, a copy or `Bun.spawn({ argv0 |
| `bun_cosmic` | `src/cosmic` | Native side of `bun:cosmic`: COSMIC's text stack (cosmic-text: font discovery, shaping, layout and rasterization) and the freedesktop application index (freedesktop-desktop-entry). |
| `bun_crash_handler` | `src/crash_handler` | This file contains Bun's crash handler. In debug builds, we are able to print backtraces that are mapped to source code. In release builds, we do not have debug symbols in the binary. Bun's solution to this is called a " |
| `bun_csrf` | `src/csrf` | CSRF Token implementation for Bun It provides protection against Cross-Site Request Forgery attacks by generating and validating tokens using HMAC signatures |
| `bun_css` | `src/css` |  |
| `bun_css_jsc` | `src/css_jsc` | `bun_css_jsc` — JSC bridge for `bun_css`. |
| `bun_css_parser` | `src/css/parser` | Parser for CSS, SCSS, Sass, and Less. |
| `bun_dispatch` | `src/dispatch` | Closed-set cross-crate dispatch over link-time symbols. |
| `bun_dns` | `src/dns` |  |
| `bun_docker` | `src/docker` | Docker Engine HTTP client. No Docker executable or Aphrody service is invoked. |
| `bun_dotenv` | `src/dotenv` |  |
| `bun_errno` | `src/errno` |  |
| `bun_event_loop` | `src/event_loop` |  |
| `bun_exe_format` | `src/exe_format` |  |
| `bun_format` | `src/format` | The formatter: prints the syntax of a file the way Prettier does. |
| `bun_format_conformance` | `src/format/conformance` | Runs the tests of Prettier and of oxfmt on `bun fmt`. The tests are in `test/cli/format/{prettier,oxfmt}/bundle.zst`. |
| `bun_glob` | `src/glob` |  |
| `bun_graph` | `src/graph` | Aphrody code-graph algorithms and extractors embedded in Bun. |
| `bun_hash` | `src/hash` | Non-cryptographic hash functions for `Bun.hash` (`HashObject`). |
| `bun_highway` | `src/highway` |  |
| `bun_host` | `src/host` | `bun host`: resource inventory of a machine (CPU, RAM, GPU, disks, kernel, OS, WireGuard IPs) and the shared registry that merges the cards of several machines. The JSON schema in [`schema`] is the single source of truth |
| `bun_http` | `src/http` | HTTP client. |
| `bun_http_jsc` | `src/http_jsc` |  |
| `bun_http_types` | `src/http_types` |  |

See [workspace-members.md](references/workspace-members.md) for the remaining workspace crates.

## References

Read the one that matches the task (`references/<name>.md`):

- [bun-core-classes-ts-bindings](references/bun-core-classes-ts-bindings.md): The .classes.ts → generate-classes.ts → ZigGeneratedClasses.cpp + generated_classes.rs pipeline, #[JsClass] Rust side, generated symbol names, and two end-to-end examples (Glob, CronJob); plus hand-written C++ class pattern
- [bun-core-crate-map](references/bun-core-crate-map.md): Map of Bun's Rust foundation crates (bun_core, bun_alloc, bun_sys, paths, collections, threading, ptr, safety, jsc, event_loop, io, uws_sys), their tiers and the lints and disallowed-std rules that govern them
- [bun-core-event-loop](references/bun-core-event-loop.md): Bun's event loop in Rust — VirtualMachine access, jsc::EventLoop tick/run_callback/Stopped, Task/TaskTag/Taskable/ConcurrentTask, hoisted dispatch in bun_runtime, AnyEventLoop/EventLoopHandle/MiniEventLoop, timers, KeepAlive, uSockets/libuv
- [bun-core-gc-lifetimes](references/bun-core-gc-lifetimes.md): Keeping JS values and native objects alive correctly in Bun Rust — Strong/StrongOptional/Weak/JsRef, refcount types (RefPtr, CellRefCounted, ThreadSafeRefCount), BackRef/JsCell/ThisPtr, JSC GC rules (write barriers, extra memory, pending activity), threading affinity
- [bun-core-idioms](references/bun-core-idioms.md): Zig→Rust port heritage and house idioms in Bun's Rust code — naming, Zig-to-Rust mappings, unsafe/SAFETY discipline, error propagation, review rules from REVIEW.md and src/CLAUDE.md, common traits/macros
- [bun-core-jsc-rust-api](references/bun-core-jsc-rust-api.md): bun_jsc Rust API for touching JavaScriptCore — JSValue, JSGlobalObject, CallFrame, JsResult/JsError, host_fn adapters & ABI, exception scopes, cpp.rs ZIG_EXPORT bindings, ErrorCode/$ERR_* pipeline
- [bun-core-strings-fmt-output](references/bun-core-strings-fmt-output.md): bun_core String/ZStr/Utf8Bytes ownership rules, strings SIMD helpers, fmt helpers, scoped debug logging (declare_scope!/scoped_log!), pretty output macros, env_var and feature flags
- [bun-core-sys-syscalls](references/bun-core-sys-syscalls.md): bun_sys syscall layer (Maybe<T>, sys::Error/Tag, Fd encoding, File RAII, FdExt, platform modules), bun_alloc allocators/arenas, and sys_jsc conversion traits
- [bun-toolchain-bake](references/bun-toolchain-bake.md): Bake (src/runtime/bake) - DevServer for Bun.serve HTML routes/app, IncrementalGraph HMR, HMR websocket protocol, framework API, FrameworkRouter, bun build --app production, client/server HMR runtimes
- [bun-toolchain-bundler](references/bun-toolchain-bundler.md): Bun bundler (src/bundler) - BundleV2 scan/parse phase, LinkerContext link pipeline (esbuild linker.go port), tree shaking, chunking, codegen, plugins, loaders, HTML/CSS, bytecode, Bun.build and --compile
- [bun-toolchain-check-sema](references/bun-toolchain-check-sema.md): bun check / --check type checker - crate bun_sema (typescript-go port in src/sema), driver, standalone bun-sema CLI, baselines, parser SEMA mode (js_parser/sema), CLI check_command.rs, tests test/cli/check
- [bun-toolchain-css-parsers](references/bun-toolchain-css-parsers.md): Bun CSS crate (Lightning CSS port), data-format parsers (src/parsers - SIMD JSON/JSONC, JSON5, TOML, YAML, XML), markdown (src/md), and Bun.FileSystemRouter (src/router)
- [bun-toolchain-parser](references/bun-toolchain-parser.md): Bun JS/TS parser (src/js_parser) — lexer, P struct, parse/visit passes, TS/JSX, macros, lowering, React Refresh/Compiler hooks, sema mode; esbuild js_parser.go heritage
- [bun-toolchain-printer-ast](references/bun-toolchain-printer-ast.md): Bun AST crate (src/ast: Ref packing, Expr/Stmt, Part, Ast, Loader/Target), js_printer + renamer/minifier, and sourcemap crates (VLQ, InternalSourceMap)
- [bun-toolchain-transpiler-resolver](references/bun-toolchain-transpiler-resolver.md): Bun Transpiler struct (runtime single-file transpile path, RuntimeTranspilerCache, Bun.Transpiler) and the module resolver (src/resolver - node_modules, exports/imports, tsconfig paths, browser map, DirInfo caches)
