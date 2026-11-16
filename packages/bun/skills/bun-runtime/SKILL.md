---
name: bun-runtime
description: "How the Aphrody runtime works and is documented: Bun APIs, CLI commands, built-in JS modules, node:* compatibility, Bun.serve, fetch and streams, HTTP/SQL/Valkey, the shell, the test runner and the package manager (bun install, lockfile, linkers)."
---

# The Bun runtime

Use native `bun check`, `bun lint`, `bun fmt` and `bun n2b` directly. Checkout qualification uses `bun bd check`, `bun bd lint`, `bun bd fmt` and `bun bd n2b`; no subprocess or external backend may replace them. Package scripts may expose these native commands but must not wrap or replace them; `bunx` is reserved for unrelated packages.

## Runtime documentation pages (docs/)

| Page | File | About |
| --- | --- | --- |
| bun init | `docs/runtime/templating/init.mdx` | Scaffold an empty Bun project with the interactive `bun init` command |
| bun create | `docs/runtime/templating/create.mdx` | Create a new Bun project from a React component, a `create-<template>` npm package, a GitHub repo, or a local template |
| Bun Runtime | `docs/runtime/index.mdx` | Execute JavaScript/TypeScript files, package.json scripts, and executable packages with Bun's fast runtime. |
| Watch Mode | `docs/runtime/watch-mode.mdx` | Automatic reloading in Bun with --watch and --hot modes |
| Type checking | `docs/runtime/check.mdx` | Type check your TypeScript project with bun check |
| Linting | `docs/runtime/lint.mdx` | Lint JavaScript and TypeScript with Bun's embedded oxlint engine |
| Formatting | `docs/runtime/fmt.mdx` | Format source with Bun's embedded native OXC core |
| Language server | `docs/runtime/lsp.mdx` | One language server for TypeScript, JavaScript, Python, Rust, C, C++ and C# with bun lsp |
| Migrate from Node.js | `docs/runtime/n2b.mdx` | Find and rewrite Node.js APIs that have a Bun equivalent with bun n2b, and migrate a project with bun migrate |
| Recipes with bun just | `docs/runtime/just.mdx` | Run justfile recipes with Bun's embedded task runner. |
| MCP server | `docs/runtime/mcp.mdx` | bun mcp is a Model Context Protocol server built into Bun, for coding agents |
| Host inventory | `docs/runtime/host.mdx` | Collect the CPU, RAM, GPU, disks, kernel and OS of a machine, and share them between machines with bun host |
| Debugging | `docs/runtime/debugger.mdx` | Debug your Bun code with an interactive debugger using WebKit Inspector Protocol |
| REPL | `docs/runtime/repl.mdx` | An interactive JavaScript and TypeScript REPL with syntax highlighting, history, and tab completion |
| bunfig.toml | `docs/runtime/bunfig.mdx` | Configure Bun's behavior using its configuration file bunfig.toml |
| Code generation from strings | `docs/runtime/code-generation-from-strings.mdx` | Make eval(), new Function() and every other way a string becomes code throw, for the whole process, with --disallow-code-generation-from-strings. |
| File Types | `docs/runtime/file-types.mdx` | File types and loaders supported by Bun's bundler and runtime |
| Module Resolution | `docs/runtime/module-resolution.mdx` | How Bun resolves modules and handles imports in JavaScript and TypeScript |
| JSX | `docs/runtime/jsx.mdx` | Built-in JSX and TSX support in Bun with configurable transpilation options |
| Auto-install | `docs/runtime/auto-install.mdx` | Bun's automatic package installation feature for standalone script execution |
| Plugins | `docs/runtime/plugins.mdx` | Universal plugin API for extending Bun's runtime and bundler |
| File System Router | `docs/runtime/file-system-router.mdx` | Bun provides a fast API for resolving routes against file-system paths |
| Server | `docs/runtime/http/server.mdx` | Use `Bun.serve` to start a high-performance HTTP server in Bun |
| Routing | `docs/runtime/http/routing.mdx` | Define routes in `Bun.serve` using static paths, parameters, and wildcards |
| Cookies | `docs/runtime/http/cookies.mdx` | Work with cookies in HTTP requests and responses using Bun's built-in Cookie API. |
| TLS | `docs/runtime/http/tls.mdx` | Enable TLS in Bun.serve |
| Error Handling | `docs/runtime/http/error-handling.mdx` | Learn how to handle errors in Bun's development server |
| Metrics | `docs/runtime/http/metrics.mdx` | Monitor server activity with built-in metrics |
| Fetch | `docs/runtime/networking/fetch.mdx` | Send HTTP requests with Bun's fetch API |
| WebSockets | `docs/runtime/http/websockets.mdx` | Server-side WebSockets in Bun |
| TCP | `docs/runtime/networking/tcp.mdx` | Use Bun's native TCP API to implement performance-sensitive systems like database clients, game servers, or anything that needs to communicate over TCP (instead of HTTP) |
| UDP | `docs/runtime/networking/udp.mdx` | Use Bun's UDP API to implement services with advanced real-time requirements, such as voice chat. |
| DNS | `docs/runtime/networking/dns.mdx` | Use Bun's DNS module to resolve DNS records |
| Cookies | `docs/runtime/cookies.mdx` | Use Bun's native APIs for working with HTTP cookies |
| File I/O | `docs/runtime/file-io.mdx` | Bun provides a set of optimized APIs for reading and writing files. |
| Streams | `docs/runtime/streams.mdx` | Use Bun's streams API to work with binary data without loading it all into memory at once |
| Binary Data | `docs/runtime/binary-data.mdx` | Working with binary data in JavaScript |
| Archive | `docs/runtime/archive.mdx` | Create and extract tar and zip archives with Bun's fast native implementation |
| SQL | `docs/runtime/sql.mdx` | Bun provides native bindings for working with SQL databases through a unified Promise-based API that supports PostgreSQL, MySQL, and SQLite. |
| SQLite | `docs/runtime/sqlite.mdx` | Bun natively implements a high-performance SQLite3 driver. |
| S3 | `docs/runtime/s3.mdx` | Bun provides fast, native bindings for interacting with S3-compatible object storage services. |
| Redis | `docs/runtime/redis.mdx` | Use Bun's native Redis client with a Promise-based API |
| Workers | `docs/runtime/workers.mdx` | Use Bun's Workers API to create and communicate with a new JavaScript instance running on a separate thread while sharing I/O resources with the main thread |
| ModuleGraph | `docs/runtime/module-graph.mdx` | Run many instances of one app in a single process with Bun.ModuleGraph. Each instance gets fresh module state and its own timers and I/O; compiled code is shared. |
| Native code graph | `docs/runtime/graph.mdx` | Extract source graphs and export scoped snapshot evidence |
| Environment Variables | `docs/runtime/environment-variables.mdx` | Read and configure environment variables in Bun, including automatic .env file support |
| Shell | `docs/runtime/shell.mdx` | Use Bun's shell scripting API to run shell commands from JavaScript |
| /runtime/buv | `docs/runtime/buv.mdx` | Native JavaScriptCore and UV runtime with the PyJS language surface |
| Python | `docs/runtime/python.mdx` | Run Python files and the python CLI through a CPython host, embed CPython in the JavaScript process with bun:python, and compile Python with bun compile |
| PyTorch CUDA | `docs/runtime/cuda-torch.mdx` | Install PyTorch with the CUDA build matching the NVIDIA driver in a uv virtual environment and check it from bun python |
| Terminal APIs | `docs/runtime/terminal.mdx` | Run interactive processes with Bun.Terminal or parse terminal output with Bun's headless terminal screens. |
| Spawn | `docs/runtime/child-process.mdx` | Spawn child processes with `Bun.spawn` or `Bun.spawnSync` |
| WebView | `docs/runtime/webview.mdx` | Control a headless browser from Bun for automation, testing, and scraping — zero dependencies on macOS, Chrome DevTools Protocol everywhere else |
| Cron | `docs/runtime/cron.mdx` | Schedule and parse cron jobs with Bun |
| Node-API | `docs/runtime/node-api.mdx` | Use Bun's Node-API module to build native add-ons to Node.js |
| FFI | `docs/runtime/ffi.mdx` | Use Bun's FFI module to efficiently call native libraries from JavaScript |
| Linux | `docs/runtime/linux.mdx` | Call Linux kernel interfaces directly from JavaScript with bun:linux |
| Windows | `docs/runtime/windows.mdx` | Call Windows interfaces directly from JavaScript with bun:windows |
| Windows Runtime | `docs/runtime/winrt.mdx` | Call Windows Runtime (WinRT) APIs from Bun with bun:winrt, with namespaces projected on demand and async operations as Promises |
| WinUI 3 | `docs/runtime/winui.mdx` | Open native WinUI 3 windows from Bun with bun:winui, load XAML, handle control events on the JS thread, and theme them with Fluent 2 tokens |
| MSVC & Windows metadata | `docs/runtime/msvc.mdx` | Resolve, set up and cache Visual Studio, MSVC and the Windows SDK without vswhere or vcvarsall, cross-compile for Windows from Linux and macOS, and generate Rust or bun:ffi bindings from .winmd metadata |
| .NET | `docs/runtime/dotnet.mdx` | Run the .NET SDK inside Bun, install and resolve .NET without scripts, run C# files, and call .NET assemblies from JavaScript with bun:dotnet |
| COSMIC | `docs/runtime/cosmic.mdx` | Use the COSMIC desktop from JavaScript with bun:cosmic |
| C Compiler | `docs/runtime/c-compiler.mdx` | Compile and run C from JavaScript with low overhead |
| Transpiler | `docs/runtime/transpiler.mdx` | Use Bun's transpiler to transpile JavaScript and TypeScript code |
| CSRF Protection | `docs/runtime/csrf.mdx` | Generate and verify CSRF tokens with Bun's built-in API |
| Secrets | `docs/runtime/secrets.mdx` | Use Bun's Secrets API to store and retrieve sensitive credentials securely |
| Console | `docs/runtime/console.mdx` | The console object in Bun |
| TOML | `docs/runtime/toml.mdx` | Use Bun's built-in support for TOML files through both runtime APIs and bundler integration |
| YAML | `docs/runtime/yaml.mdx` | Use Bun's built-in support for YAML files through both runtime APIs and bundler integration |
| Markdown | `docs/runtime/markdown.mdx` | Parse and render Markdown with Bun's built-in Markdown API, supporting GFM extensions and custom rendering callbacks |
| JSON5 | `docs/runtime/json5.mdx` | Use Bun's built-in support for JSON5 files through both runtime APIs and bundler integration |
| XML | `docs/runtime/xml.mdx` | Use Bun's built-in support for XML through both runtime APIs and bundler integration |
| JSONL | `docs/runtime/jsonl.mdx` | Parse newline-delimited JSON (JSONL) with Bun's built-in streaming parser |
| HTMLRewriter | `docs/runtime/html-rewriter.mdx` | Use Bun's HTMLRewriter to transform HTML documents with CSS selectors |
| Readability | `docs/runtime/readability.mdx` | Extract the main article of an HTML page and read attributes with CSS selectors |
| Image | `docs/runtime/image.mdx` | Decode, transform, and encode images with a fast native pipeline |
| Bun.Video | `docs/runtime/video.mdx` | Native video metadata, thumbnails, frame batches, audio, GIF and MP4 remux in TypeScript |
| /runtime/yolo | `docs/runtime/yolo.mdx` | Bun's internal typed decision capability, native Rust validation and explicit application providers |
| /runtime/decisions | `docs/runtime/decisions.mdx` | Bun's native decision validator, confidence, abstention and supervised Python bridge |
| Adblock | `docs/runtime/adblock.mdx` | Match network requests and cosmetic filters with Brave's adblock-rust engine, built into Bun. |
| NGINX | `docs/runtime/nginx.mdx` | Own a native NGINX process and its Rust module with Bun, with explicit source and ABI qualification. |
| Hashing | `docs/runtime/hashing.mdx` | Utility functions for hashing and verifying passwords with various cryptographically secure algorithms |
| Privacy cryptography | `docs/runtime/privacy.mdx` | STAR threshold aggregation, Privacy Pass tokens and OPAQUE password authentication in bun:privacy |
| Glob | `docs/runtime/glob.mdx` | Use Bun's fast native implementation of file globbing |
| Semver | `docs/runtime/semver.mdx` | Use Bun's semantic versioning API |
| Color | `docs/runtime/color.mdx` | Format colors as CSS, ANSI, numbers, hex strings, and more |
| Utils | `docs/runtime/utils.mdx` | Use Bun's utility functions to work with the runtime |
| Globals | `docs/runtime/globals.mdx` | Use Bun's global objects |
| Bun APIs | `docs/runtime/bun-apis.mdx` | Overview of Bun's native APIs available on the Bun global object and built-in modules |
| Web APIs | `docs/runtime/web-apis.mdx` | Web-standard APIs supported by Bun for server-side JavaScript |
| Node.js Compatibility | `docs/runtime/nodejs-compat.mdx` | Bun's compatibility status with Node.js APIs, modules, and globals |

## References

Read the one that matches the task (`references/<name>.md`):

- [bun-graph-call-paths](references/bun-graph-call-paths.md): Verified end-to-end call chains (file:line) for bun run, Bun.serve, bun install and bun build, found via the aphrody graph + source, plus the graph node ids to explain them
- [bun-install-architecture](references/bun-install-architecture.md): Bun package manager core architecture — crates, PackageManager singleton, install pipeline, tasks/threads, registry/manifest cache, global cache dirs
- [bun-install-cli-map](references/bun-install-cli-map.md): Map of bun package-manager CLI subcommands (install/add/remove/update/pm/publish/pack/audit/why/link/patch/info/bunx...) to source files, plus bunfig [install] keys.npmrc, flags
- [bun-install-linkers-workspaces](references/bun-install-linkers-workspaces.md): Bun install node_modules linkers (hoisted vs isolated), workspaces, catalogs, overrides, patches, lifecycle scripts/trust, security scanner, minimum release age
- [bun-install-lockfile](references/bun-install-lockfile.md): Bun lockfile internals — Lockfile struct, text bun.lock (v0..v3) format/parser, binary bun.lockb, migration from npm/yarn/pnpm, load/save paths
- [bun-runtime-builtin-js-modules](references/bun-runtime-builtin-js-modules.md): src/js builtin modules — directory layout, preprocessor special syntax ($ intrinsics, $ERR_*, $rust/$cpp/$newRustFunction/$bindgenFn, $debug/$assert), require/export rules, numeric module IDs, codegen pipeline
- [bun-runtime-bun-apis](references/bun-runtime-bun-apis.md): globalThis.Bun object — full property table, C++ vs Rust owners, lazy-prop/callback export macros.classes.ts codegen classes and where each Bun.* API lives
- [bun-runtime-cli-commands](references/bun-runtime-cli-commands.md): Bun CLI dispatch — argv[0]/first-arg routing to Command Tag, every subcommand + alias and the Rust file implementing it
- [bun-runtime-http-sql-valkey](references/bun-runtime-http-sql-valkey.md): Network/database crates — bun_http client (HTTP/1.1, h2_client, h3_client, proxy, TLS session cache), WebSocket client (http_jsc), Bun.SQL (postgres/mysql/sqlite adapters), Valkey/Redis, DNS, S3 signing
- [bun-runtime-node-compat](references/bun-runtime-node-compat.md): Node.js compatibility layer map — which node:* modules are JS (src/js/node), native C++ (src/jsc/modules), or Rust bindings (src/runtime/node); fs/path/process/Buffer/net/http/crypto/child_process owners and compat review rules
- [bun-runtime-server](references/bun-runtime-server.md): Bun.serve internals — NewServer<SSL,DEBUG>, ServerConfig, routes (AnyRoute), RequestContext, ServerWebSocket, node:http bridge (NodeHTTPResponse), H2/H3, HTML bundles and Bun.listen sockets
- [bun-runtime-shell](references/bun-runtime-shell.md): Bun Shell ($ template) — JS wrapper builtins/shell.ts, bun_shell_parser lexer/parser/AST, runtime interpreter (NodeId arena state machine, builtins), plus process spawning (Bun.spawn, bun_spawn/bun_spawn_sys, Subprocess, Terminal PTY)
- [bun-runtime-test-runner](references/bun-runtime-test-runner.md): bun test implementation — CLI driver (test_command.rs, scanner, --parallel workers, sharding, --changed, reporters, coverage) and bun:test runtime (Collection/Order/Execution phases, ScopeFunctions, expect matchers, snapshots, mocks, fake timers)
- [bun-runtime-webcore-fetch-streams](references/bun-runtime-webcore-fetch-streams.md): Web APIs in src/runtime/webcore — fetch pipeline (fetch_impl -> FetchTasklet -> AsyncHTTP), Request/Response/Body.Value, Blob/Bun.file Store, ReadableStream native sources, JSSink sinks, S3, encoding
