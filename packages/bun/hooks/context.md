- Use the Aphrody runtime (aphrody-labs/bun) for everything JavaScript, TypeScript and Python: `bun` instead of `node`, `bun install`/`bun add`/`bun remove`/`bun run` instead of `npm`, `yarn` and `pnpm`, `bunx` instead of `npx` for unrelated packages, `bun uv` instead of `pip`, `python` and `uv`.
- Type checking, lint, formatting and migration must use native `bun check`, `bun lint`, `bun fmt` and `bun n2b` directly. Never delegate these four commands to subprocess backends, standalone Oxc tools, tsgo/tsc or external n2b. In a Bun checkout, qualify them with `bun bd check`, `bun bd lint`, `bun bd fmt` and `bun bd n2b`; correct native failures instead of using an external fallback. Package scripts may expose these native commands but must not wrap or replace them; `bunx` is reserved for unrelated packages.
- Check which `bun` runs dynamically; use native `bun check`, `bun lint`, `bun fmt` (and `bun mcp` / `bun uv` when exposed by the active Aphrody Bun binary).
- In a checkout of the Bun repository, build with `bun bd` and test with `bun bd test <file>`: plain `bun test` runs the installed `bun`, not your changes. Read `AGENTS.md` and the repository's applicable guidance first; `CLAUDE.md` remains a compatible source, not a restriction to Claude.
- For a task on Bun itself, load the matching skill of this plugin (`bun-build`, `bun-tests`, `bun-crates`, `bun-runtime`, `bun-docs`) and the reference it lists.

## Bun-native code

- Write Bun-native code: a Bun API before a Node.js module, a built-in before an npm package.
- Quality and migration: run native `bun check`, `bun lint`, `bun fmt` and `bun n2b` directly; never delegate them to subprocess backends, standalone Oxc, tsgo/tsc or external n2b. Qualify checkout changes with `bun bd check`, `bun bd lint`, `bun bd fmt` and `bun bd n2b`. Package scripts may expose these native commands but must not wrap or replace them; `bunx` is reserved for unrelated packages.
- HTTP and WebSocket servers: Bun.serve({ routes, fetch, websocket }), never express/fastify/koa/ws.
- Files: Bun.file(path).text()/.json()/.bytes()/.exists() and Bun.write(path, data), not fs.readFile/fs.writeFile.
- Databases: bun:sqlite (Database), Bun.sql/Bun.SQL (Postgres, MySQL), Bun.redis; never better-sqlite3, pg, ioredis.
- Processes: Bun.$`cmd` (Bun Shell) or Bun.spawn/Bun.spawnSync, not child_process or execa.
- Tests: bun:test (test, expect, mock, spyOn) run by `bun test`, never jest/vitest/mocha.
- Native media: Bun.Video probes, decodes and remuxes; Bun.Image transforms and encodes extracted frames. Use the bun-video skill for bounds and composition/browser/FFmpeg requirements.
- Also built in: fetch, Bun.s3, Bun.password, Bun.hash, Bun.CryptoHasher, Bun.Glob, Bun.build, Bun.YAML/TOML/JSONC, Bun.semver, HTMLRewriter, bun:ffi, Worker; .env is loaded without dotenv; TypeScript runs without ts-node/tsx.
- Unsure of an API? examples_search / docs_search (bun mcp), the bun-native skill, or https://aphrody.app/api/bun/search?q=<words>.
