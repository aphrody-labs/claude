---
name: bun-build
description: "Build, run and lint the Aphrody runtime (aphrody-labs/bun) from a checkout: `bun bd`, the 92 package.json scripts (gn, gn:vendor, vendor:audit, vendor:setup, depots_tools, depot_tools, chromium, factory, ...), build profiles, Windows/Linux toolchains, codegen and vendored dependencies."
---

# Building the Aphrody runtime

- VPS factory layout (Google style, see `docs/project/vps-factory.md`):
  `~/depot_tools` (daily `depot-tools-update.timer`), checkouts in
  `~/src/<project>` (chromium, chromiumos, cef, brave-core, bun), GN outputs in
  `~/build/out/<project>/<config>`, shared caches in
  `~/build/google/cache`, services in `~/apps`. Drive it with
  `bun factory sync|gen|build|all <target>`, which takes free build slots
  (multi-build mode, `bun factory slots`); `bun factory run -- <command>` runs
  any other heavy command, such as `bun bd`, in a slot.
- `/home` on `vps` is a single btrfs volume (subvolume `@home`, about 805 GiB
  over two disks); `/` stays on its own disk. Put heavy outputs, caches,
  downloads, toolchains and transient files under `~/build`, never
  on `/`. Check free space on `/` and `/home` before a large build.
- The existing Bun checkout is `~/src/bun`; do not resurrect the
  absent `~/builds/bun-os-factory/sources/bun` checkout. The factory
  policy lives in `tools/config/fusion-factory.json` and uses directories under `~/build`.
- Run `aphrody infra ssh exec` from `~` with
  `APHRODY_INFRA_ROOT=~` so `var/runs` receipts use the root
  filesystem. Changing the working directory alone does not relocate receipts.
  This root override is qualified for SSH execution; do not apply it globally
  to unrelated Infra commands. Plan before apply and verify the host through
  the native Infra catalog each time.
- Host budgets are independent: `dbfr` has 6 CPUs and about 11.40 GiB RAM and
  serves production. Never apply the VPS's 45.93 GiB budget to it.
- Use the Aphrody Bun fork for JavaScript, TypeScript and Python tooling.
  Check provenance with `bun agent-plugin doctor --json`.
- Build and execute checkout changes with `bun bd [command]`; test with
  `bun bd test <file>`. Installed Bun does not include checkout changes.
- Run type checking, lint, formatting and migration through the native commands
  `bun check`, `bun lint`, `bun fmt` and `bun n2b`. Do not delegate these commands
  to subprocess backends, `bunx`, standalone Oxc tools, tsgo/tsc or external n2b.
  Qualify checkout changes with `bun bd check`, `bun bd lint`, `bun bd fmt` and
  `bun bd n2b`; fix native failures instead of selecting an external fallback.
  Package scripts may expose these native commands, but must not replace them
  with wrappers or external backends.
- Build scripts accept trailing execution arguments. Put build flags before them;
  see `scripts/build.ts`. Do not invoke the debug executable directly.
- Run long builds asynchronously; keep user updates responsive. Do not impose
  a build timeout on `bun bd`.
- Declaration-only changes need no native build:
  `bun test test/integration/bun-types/bun-types.test.ts`.
- For platform changes, use `bun run rust:check-all`; gated code needs its target built.
- Debug logging: `BUN_DEBUG_QUIET_LOGS=1` or `BUN_DEBUG_<SCOPE>=1`.
- JSC exception checks: `BUN_JSC_validateExceptionChecks=1` and
  `BUN_JSC_dumpSimulatedThrows=1`.

## package.json scripts

| Script                          | Runs                                                                                                                                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run gn`                    | `bun scripts/aphrody/gn.ts`                                                                                                                                                                                                                       |
| `bun run gn:vendor`             | `bun scripts/aphrody/vendor-gn.ts`                                                                                                                                                                                                                |
| `bun run vendor:audit`          | `bun scripts/aphrody/vendor-audit.ts`                                                                                                                                                                                                             |
| `bun run vendor:setup`          | `bun scripts/aphrody/vendor-setup.ts`                                                                                                                                                                                                             |
| `bun run depots_tools`          | `bun scripts/aphrody/chromium.ts --depot-tools`                                                                                                                                                                                                   |
| `bun run depot_tools`           | `bun scripts/aphrody/chromium.ts --depot-tools`                                                                                                                                                                                                   |
| `bun run chromium`              | `bun scripts/aphrody/chromium.ts`                                                                                                                                                                                                                 |
| `bun run factory`               | `bun scripts/factory/factory.ts`                                                                                                                                                                                                                  |
| `bun run cef`                   | `bun scripts/aphrody/cef.ts`                                                                                                                                                                                                                      |
| `bun run chrome`                | `bun scripts/aphrody/browser.ts chrome`                                                                                                                                                                                                           |
| `bun run obscura`               | `bun scripts/aphrody/browser.ts obscura`                                                                                                                                                                                                          |
| `bun run bun:windows`           | `bun scripts/aphrody/win/version-sync.ts`                                                                                                                                                                                                         |
| `bun run build`                 | `bun --silent run build:debug`                                                                                                                                                                                                                    |
| `bun run ci:find`               | `bun scripts/find-build.ts`                                                                                                                                                                                                                       |
| `bun run ci:status`             | `bun scripts/find-build.ts --status`                                                                                                                                                                                                              |
| `bun run ci:errors`             | `bun scripts/find-build.ts --errors`                                                                                                                                                                                                              |
| `bun run ci:logs`               | `bun scripts/find-build.ts --logs`                                                                                                                                                                                                                |
| `bun run ci:watch`              | `bun scripts/find-build.ts --watch`                                                                                                                                                                                                               |
| `bun run ci:images`             | `bun scripts/build/ci-images/spec.ts`                                                                                                                                                                                                             |
| `bun run ci:slowest`            | `bun scripts/ci-slowest-tests.ts`                                                                                                                                                                                                                 |
| `bun run ci:parallel-allowlist` | `bun scripts/update-parallel-allowlist.mjs`                                                                                                                                                                                                       |
| `bun run pr:comments`           | `bun scripts/pr-comments.ts`                                                                                                                                                                                                                      |
| `bun run watch`                 | `cargo watch -x 'check --workspace --message-format=short'`                                                                                                                                                                                       |
| `bun run watch-windows`         | `cargo watch -x "check --workspace --target x86_64-pc-windows-msvc --message-format=short"`                                                                                                                                                       |
| `bun run bd:v`                  | `bun scripts/build.ts --profile=debug`                                                                                                                                                                                                            |
| `bun run bd`                    | `BUN_DEBUG_QUIET_LOGS=1 bun scripts/build.ts --profile=debug --quiet`                                                                                                                                                                             |
| `bun run agent-plugin`          | `bun scripts/aphrody/agent-plugin.ts`                                                                                                                                                                                                             |
| `bun run release:surfaces`      | `bun scripts/aphrody/release-surfaces.ts`                                                                                                                                                                                                         |
| `bun run delivery`              | `bun scripts/aphrody/monorepo-delivery.ts`                                                                                                                                                                                                        |
| `bun run verify:fusion`         | `bun scripts/aphrody/verify-fusion.ts`                                                                                                                                                                                                            |
| `bun run delivery:native`       | `bun scripts/aphrody/delivery-native.ts`                                                                                                                                                                                                          |
| `bun run build:debug`           | `bun scripts/build.ts --profile=debug`                                                                                                                                                                                                            |
| `bun run build:debug:fuzzilli`  | `bun scripts/build.ts --profile=debug --fuzzilli=on --build-dir=build/debug-fuzz`                                                                                                                                                                 |
| `bun run build:debug:noasan`    | `bun scripts/build.ts --profile=debug-no-asan`                                                                                                                                                                                                    |
| `bun run build:release`         | `bun scripts/build.ts --profile=release`                                                                                                                                                                                                          |
| `bun run build:ci`              | `bun scripts/build.ts --profile=release --ci=on --buildkite=on --build-dir=build/release-ci`                                                                                                                                                      |
| `bun run build:assert`          | `bun scripts/build.ts --profile=release-assertions --build-dir=build/release-assert`                                                                                                                                                              |
| `bun run build:asan`            | `bun scripts/build.ts --profile=release-asan --build-dir=build/release-asan`                                                                                                                                                                      |
| `bun run build:logs`            | `bun scripts/build.ts --profile=release --logs=on --build-dir=build/release-logs`                                                                                                                                                                 |
| `bun run build:smol`            | `bun scripts/build.ts --profile=release --build-type=MinSizeRel --build-dir=build/release-smol`                                                                                                                                                   |
| `bun run build:local`           | `bun scripts/build.ts --profile=debug-local --build-dir=build/debug-local`                                                                                                                                                                        |
| `bun run build:types`           | `bun scripts/build.ts --mode=codegen --target=generated-types`                                                                                                                                                                                    |
| `bun run build:release:local`   | `bun scripts/build.ts --profile=release-local --build-dir=build/release-local`                                                                                                                                                                    |
| `bun run run:linux`             | `docker run --rm  -v "$PWD:/root/bun/" -w /root/bun ghcr.io/oven-sh/bun-development-docker-image`                                                                                                                                                 |
| `bun run uv-posix-stubs`        | `bun run src/jsc/bindings/libuv/generate_uv_posix_stubs.ts`                                                                                                                                                                                       |
| `bun run orderfile`             | `bun scripts/orderfile/generate.ts`                                                                                                                                                                                                               |
| `bun run jsc:build`             | `bun scripts/build.ts --profile=release-local --build-dir=build/release-local --target=WebKit`                                                                                                                                                    |
| `bun run jsc:build:debug`       | `bun scripts/build.ts --profile=debug-local --build-dir=build/debug-local --target=WebKit`                                                                                                                                                        |
| `bun run jsc:build:lto`         | `bun scripts/build.ts --profile=release-local --lto=on --build-dir=build/release-local-lto --target=WebKit`                                                                                                                                       |
| `bun run typecheck`             | `bun run typecheck:prepare && bun check --noEmit && bun check --noEmit --project test/tsconfig.json`                                                                                                                                              |
| `bun run fmt`                   | `bun fmt`                                                                                                                                                                                                                                         |
| `bun run fmt:cpp`               | `bun run clang-format`                                                                                                                                                                                                                            |
| `bun run fmt:rust`              | `cargo fmt --all`                                                                                                                                                                                                                                 |
| `bun run lint`                  | `bun lint`                                                                                                                                                                                                                                        |
| `bun run lint:fix`              | `bun lint --config oxlint.json --fix src/js`                                                                                                                                                                                                      |
| `bun run test`                  | `bun scripts/runner.node.ts --exec-path ./build/debug/bun-debug`                                                                                                                                                                                  |
| `bun run testleak`              | `BUN_DESTRUCT_VM_ON_EXIT=1 ASAN_OPTIONS=detect_leaks=1 LSAN_OPTIONS=malloc_context_size=100:print_suppressions=1:suppressions=$npm_config_local_prefix/test/leaksan.supp ./build/debug/bun-debug`                                                 |
| `bun run test:release`          | `bun scripts/runner.node.ts --exec-path ./build/release/bun`                                                                                                                                                                                      |
| `bun run rust:check`            | `cargo check --workspace --keep-going`                                                                                                                                                                                                            |
| `bun run rust:check-all`        | `bun scripts/rust-check-all.ts`                                                                                                                                                                                                                   |
| `bun run rust:check-wasm`       | `cargo check --target wasm32-wasip1-threads -p bun_wasm --profile wasm`                                                                                                                                                                           |
| `bun run rust:clippy`           | `cargo clippy --workspace --no-deps --keep-going`                                                                                                                                                                                                 |
| `bun run rust:mordant`          | `bun scripts/rust-mordant.ts`                                                                                                                                                                                                                     |
| `bun run rust:mordant:baseline` | `bun scripts/rust-mordant.ts --baseline`                                                                                                                                                                                                          |
| `bun run rust:miri`             | `bun scripts/rust-miri.ts`                                                                                                                                                                                                                        |
| `bun run rust:nextest`          | `bun scripts/rust-nextest.ts`                                                                                                                                                                                                                     |
| `bun run rust:deny`             | `cargo deny --workspace check`                                                                                                                                                                                                                    |
| `bun run codegen:string-maps`   | `for f in src/**/*.string-map.ts; do bun src/codegen/generate-string-map.ts "$f" "${f%.string-map.ts}.generated.rs"; done`                                                                                                                        |
| `bun run codegen:agent-tools`   | `bun src/codegen/generate-agent-tools.ts`                                                                                                                                                                                                         |
| `bun run codegen:verify`        | `bun src/codegen/generate-agent-tools.ts --check && (bun run codegen:string-maps && git diff --exit-code 'src/**/*.generated.rs' \|\| (echo '\n*.generated.rs is stale — run `bun run codegen:string-maps` and commit the result.' >&2; exit 1))` |
| `bun run clang-format`          | `./scripts/run-clang-format.sh format`                                                                                                                                                                                                            |
| `bun run clang-format:check`    | `./scripts/run-clang-format.sh check`                                                                                                                                                                                                             |
| `bun run clang-format:diff`     | `./scripts/run-clang-format.sh diff`                                                                                                                                                                                                              |
| `bun run node:test`             | `bun ./scripts/runner.node.ts --quiet --exec-path=$npm_execpath --node-tests `                                                                                                                                                                    |
| `bun run node:test:cp`          | `bun ./scripts/fetch-node-test.ts `                                                                                                                                                                                                               |
| `bun run clean`                 | `bun scripts/build/clean.ts`                                                                                                                                                                                                                      |
| `bun run sync-webkit-source`    | `bun ./scripts/sync-webkit-source.ts`                                                                                                                                                                                                             |
| `bun run pyjs`                  | `bun scripts/aphrody/pyjs.ts`                                                                                                                                                                                                                     |
| `bun run buv:check`             | `bun scripts/aphrody/buv.ts check`                                                                                                                                                                                                                |
| `bun run buv:test`              | `bun scripts/aphrody/buv.ts test`                                                                                                                                                                                                                 |
| `bun run buv:lint`              | `bun scripts/aphrody/buv.ts lint`                                                                                                                                                                                                                 |
| `bun run buv:fmt`               | `bun scripts/aphrody/buv.ts fmt`                                                                                                                                                                                                                  |
| `bun run buv:metadata`          | `bun scripts/aphrody/buv.ts metadata`                                                                                                                                                                                                             |
| `bun run buv:docs`              | `bun scripts/aphrody/buv.ts docs`                                                                                                                                                                                                                 |
| `bun run buv:embedded`          | `bun scripts/aphrody/buv.ts embedded`                                                                                                                                                                                                             |
| `bun run buv:bench`             | `bun scripts/aphrody/bench.ts`                                                                                                                                                                                                                    |
| `bun run buv:formats`           | `bun scripts/aphrody/formats.ts`                                                                                                                                                                                                                  |
| `bun run typecheck:prepare`     | `bun run --cwd packages/bun-plugin-tailwind types:prepare`                                                                                                                                                                                        |
| `bun run libmpv`                | `bun scripts/aphrody/libmpv.ts`                                                                                                                                                                                                                   |
| `bun run ffmpeg`                | `bun scripts/aphrody/ffmpeg.ts`                                                                                                                                                                                                                   |
| `bun run libplacebo`            | `bun scripts/aphrody/libplacebo.ts`                                                                                                                                                                                                               |
| `bun run media:stage`           | `bun scripts/aphrody/media-stage.ts`                                                                                                                                                                                                              |

See also `scripts/build/CLAUDE.md` (build system internals and gotchas).

## References

Read the one that matches the task (`references/<name>.md`):

- [bun-build-alpine](references/bun-build-alpine.md): Bun OS native Linux build owners, GNU and musl targets, pinned toolchains and separate release gates
- [bun-build-ci](references/bun-build-ci.md): Bun CI — Buildkite pipeline (.buildkite/ci.ts), build/test platforms, commit-subject tags, artifacts, test runner, ci:* / pr:comments scripts, GitHub Actions workflows
- [bun-build-codegen](references/bun-build-codegen.md): Every Bun codegen step (src/codegen/*) — inputs, scripts, outputs in build/<profile>/codegen, how Rust/C++ consume them (.classes.ts.bind.ts.bindv2.ts, ErrorCode.ts, src/js, LUTs, cppbind, HOST_EXPORT, string maps)
- [bun-build-commands](references/bun-build-commands.md): How to build/run/test Bun from <bun> — package.json scripts, `bun bd` arg routing, profiles, build dirs, exe names, ninja passthrough, clean
- [bun-build-deps-vendor](references/bun-build-deps-vendor.md): Vendored native deps (scripts/build/deps/*.ts, vendor/), allDeps order, BuildSpec kinds, WebKit prebuilt/local, version pins (LLVM, nightly, node), --local-deps, bump workflows
- [bun-build-lint-format](references/bun-build-lint-format.md): Rust workspace layout (Cargo.toml, rust-toolchain, profiles, workspace lints, clippy.toml bans), rustfmt, mordant, hawk, miri, rust:check-all, oxlint, prettier, clang-format, source-lints
- [bun-build-system-internals](references/bun-build-system-internals.md): Architecture of scripts/build/** (TS → build.ninja): phases, module inventory, Rust-per-crate ninja graph, flags tables, toolchain checks, how to add a flag/profile/config field/rule/workaround
- [bun-build-tooling-misc](references/bun-build-tooling-misc.md): Bun auxiliary tooling — tools/dev (lldb printers, completions, unicode tables), bench/, packages/, tools/hawk, and the scripts/ helpers (orderfile, verify-baseline, binary-size, debug-coredump, gamble, trace, sync-_, update-_)
- [bun-build-windows](references/bun-build-windows.md): Building Bun natively on this Windows machine (<bun>) — prerequisites, MSVC env via `bun msvc sync` (ex vs-shell.ps1), tool discovery, local state (build/debug/bun-debug.exe, caches), Windows-specific gotchas, cross-compiling Windows from Linux
