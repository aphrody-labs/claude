---
name: bun-native
description: "Write Bun-native code for Bun 1.4.5: Bun APIs before Node.js modules and npm packages (Bun.serve, Bun.file/Bun.write, bun:sqlite, Bun.sql, Bun.redis, Bun.s3, Bun.$, Bun.spawn, bun:test, Bun.build, Bun.password, Bun.Glob, HTMLRewriter, bun:ffi). Use whenever writing, reviewing or migrating JavaScript or TypeScript that runs on Bun."
---

# Writing Bun-native code (Bun 1.4.5)

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

## Instead of X, use Y

| Instead of                                                                                | Use                                                                                                                             |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| express, fastify, koa, node:http                                                          | Bun.serve({ routes })                                                                                                           |
| ws, socket.io, uWebSockets.js                                                             | Bun.serve({ websocket })                                                                                                        |
| fs.readFile, fs.writeFile, fs-extra                                                       | Bun.file / Bun.write                                                                                                            |
| better-sqlite3, sqlite3, sqlite                                                           | bun:sqlite                                                                                                                      |
| pg, postgres, mysql2                                                                      | Bun.sql / Bun.SQL                                                                                                               |
| ioredis, redis                                                                            | Bun.redis / Bun.RedisClient                                                                                                     |
| @aws-sdk/client-s3, aws-sdk, minio                                                        | Bun.s3 / Bun.S3Client                                                                                                           |
| execa, shelljs, child_process.exec                                                        | Bun.$ (Bun Shell)                                                                                                               |
| child_process.spawn, cross-spawn                                                          | Bun.spawn / Bun.spawnSync                                                                                                       |
| jest, vitest, mocha, chai, ts-jest                                                        | bun:test                                                                                                                        |
| bcrypt, bcryptjs, argon2                                                                  | Bun.password                                                                                                                    |
| crypto.createHash, xxhash, murmurhash                                                     | Bun.CryptoHasher / Bun.hash                                                                                                     |
| glob, fast-glob, globby, minimatch                                                        | Bun.Glob                                                                                                                        |
| dotenv, dotenv/config, cross-env                                                          | Bun.env (.env loaded automatically)                                                                                             |
| node-fetch, axios, got, cross-fetch, undici                                               | global fetch                                                                                                                    |
| esbuild, webpack, rollup, parcel, tsup                                                    | Bun.build / bun build                                                                                                           |
| ts-node, tsx, nodemon, node --watch                                                       | bun <file>.ts / bun --watch                                                                                                     |
| uuid, nanoid                                                                              | crypto.randomUUID / Bun.randomUUIDv7                                                                                            |
| js-yaml, yaml, @iarna/toml, toml, jsonc-parser, json5                                     | Bun.YAML / Bun.TOML / Bun.JSONC / Bun.JSON5 (or import the file)                                                                |
| semver                                                                                    | Bun.semver                                                                                                                      |
| zlib.gzipSync, pako, node-gzip                                                            | Bun.gzipSync / Bun.zstdCompress                                                                                                 |
| cheerio, jsdom, node-html-parser                                                          | HTMLRewriter                                                                                                                    |
| string-width, escape-html, fast-deep-equal, which, strip-ansi, util.promisify(setTimeout) | Bun.stringWidth / Bun.escapeHTML / Bun.deepEquals / Bun.which / Bun.stripANSI / Bun.sleep                                       |
| cookie, cookie-parser                                                                     | req.cookies / Bun.CookieMap                                                                                                     |
| worker_threads, piscina, threads                                                          | Web Worker (new Worker)                                                                                                         |
| ffi-napi, node-ffi, koffi                                                                 | bun:ffi                                                                                                                         |
| keytar                                                                                    | Bun.secrets                                                                                                                     |
| ffprobe-static, video-thumbnail, fluent-ffmpeg                                            | Bun.Video for native metadata, transformed frames, bounded audio and MP4 remux; composition encoding uses the Bun Video package |
| npm install, npx, yarn, pnpm, npm run                                                     | bun install / bun fmt / bun run; bunx only for commands without a native Bun owner                                              |
| isomorphic-fetch                                                                          | global fetch                                                                                                                    |
| minimist                                                                                  | util.parseArgs                                                                                                                  |
| chalk                                                                                     | natif                                                                                                                           |
| rimraf                                                                                    | fs.rm                                                                                                                           |
| mkdirp                                                                                    | fs.mkdir                                                                                                                        |
| node-cron                                                                                 | Bun.cron                                                                                                                        |
| node-got                                                                                  | global fetch                                                                                                                    |
| superagent                                                                                | global fetch                                                                                                                    |
| make-fetch-happen                                                                         | global fetch                                                                                                                    |
| ky                                                                                        | global fetch                                                                                                                    |
| form-data                                                                                 | FormData                                                                                                                        |
| abort-controller                                                                          | AbortController                                                                                                                 |
| whatwg-url                                                                                | URL                                                                                                                             |
| node-blob                                                                                 | Blob                                                                                                                            |
| web-streams-polyfill                                                                      | global                                                                                                                          |
| @jest/globals                                                                             | bun:test                                                                                                                        |
| jest-circus                                                                               | bun:test                                                                                                                        |
| esm                                                                                       | natif                                                                                                                           |
| concurrently                                                                              | natif                                                                                                                           |
| @types/node                                                                               | @types/bun                                                                                                                      |
| smol-toml                                                                                 | Bun.TOML                                                                                                                        |
| dns-packet                                                                                | bun dns                                                                                                                         |
| mime                                                                                      | natif                                                                                                                           |
| mime-types                                                                                | natif                                                                                                                           |
| tiny-glob                                                                                 | bun (Glob)                                                                                                                      |
| glob-parent                                                                               | bun (Glob)                                                                                                                      |
| deep-equal                                                                                | Bun.deepEquals                                                                                                                  |
| lodash.isequal                                                                            | Bun.deepEquals                                                                                                                  |
| he                                                                                        | Bun.escapeHTML                                                                                                                  |
| lodash.escape                                                                             | Bun.escapeHTML                                                                                                                  |
| csurf                                                                                     | Bun.CSRF                                                                                                                        |
| csrf                                                                                      | Bun.CSRF                                                                                                                        |
| marked                                                                                    | Bun.markdown                                                                                                                    |
| markdown-it                                                                               | Bun.markdown                                                                                                                    |
| ansi-regex                                                                                | Bun.stripANSI                                                                                                                   |
| slice-ansi                                                                                | Bun.sliceAnsi                                                                                                                   |
| kleur                                                                                     | natif                                                                                                                           |
| colorette                                                                                 | natif                                                                                                                           |
| picocolors                                                                                | natif                                                                                                                           |
| eventsource                                                                               | Bun.EventSource                                                                                                                 |
| eslint                                                                                    | @biomejs/biome                                                                                                                  |
| prettier                                                                                  | @biomejs/biome                                                                                                                  |
| @typescript-eslint/parser                                                                 | @biomejs/biome                                                                                                                  |
| @typescript-eslint/eslint-plugin                                                          | @biomejs/biome                                                                                                                  |
| eslint-config-prettier                                                                    | @biomejs/biome                                                                                                                  |

## Idioms

### HTTP server with JSON routes

Instead of express, fastify, koa, node:http:

```ts
const server = Bun.serve({
  port: 3000,
  routes: {
    "/users/:id": (req) => Response.json({ id: req.params.id }),
    "/users": {
      POST: async (req) => Response.json(await req.json(), { status: 201 }),
    },
  },
  fetch: () => new Response("Not found", { status: 404 }),
});
console.log(`listening on ${server.url}`);
```

### WebSocket server

Instead of ws, socket.io, uWebSockets.js:

```ts
Bun.serve({
  port: 8080,
  fetch(req, server) {
    if (server.upgrade(req)) return;
    return new Response("Upgrade failed", { status: 400 });
  },
  websocket: {
    open(ws) {
      ws.subscribe("chat");
    },
    message(ws, message) {
      ws.publish("chat", message);
    },
  },
});
```

### Read and write files

Instead of fs.readFile, fs.writeFile, fs-extra:

```ts
const text = await Bun.file("input.txt").text();
const config = await Bun.file("config.json").json();
await Bun.write("output.txt", text.toUpperCase());
console.log(config, await Bun.file("output.txt").exists());
```

### SQLite database

Instead of better-sqlite3, sqlite3, sqlite:

```ts
import { Database } from "bun:sqlite";
const db = new Database("app.db", { strict: true });
db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)");
db.query("INSERT INTO users (name) VALUES ($name)").run({ name: "Ada" });
const user = db
  .query<{ id: number; name: string }, [number]>(
    "SELECT * FROM users WHERE id = ?",
  )
  .get(1);
console.log(user);
```

### PostgreSQL queries

Instead of pg, postgres, mysql2:

```ts
import { sql, SQL } from "bun";
const rows = await sql`SELECT * FROM users WHERE id = ${1}`;
const mysql = new SQL("mysql://user:pass@localhost:3306/app");
const [one] = await mysql`SELECT 1 AS x`;
console.log(rows, one);
```

### Redis client

Instead of ioredis, redis:

```ts
import { redis, RedisClient } from "bun";
await redis.set("key", "value");
const value = await redis.get("key");
const other = new RedisClient("redis://localhost:6379");
await other.incr("visits");
console.log(value);
```

### S3 / R2 object storage

Instead of @aws-sdk/client-s3, aws-sdk, minio:

```ts
import { S3Client } from "bun";
const s3 = new S3Client({
  bucket: "b",
  endpoint: "https://<account>.r2.cloudflarestorage.com",
});
await s3.write("k.txt", "hi");
const text = await s3.file("k.txt").text();
const url = s3.presign("k.txt", { expiresIn: 3600 });
console.log(text, url);
```

### Run a shell command

Instead of execa, shelljs, child_process.exec:

```ts
import { $ } from "bun";
const branch = (await $`git branch --show-current`.text()).trim();
await $`ls -la ${"some dir"}`.quiet();
const { exitCode } = await $`false`.nothrow();
console.log(branch, exitCode);
```

### Spawn a subprocess

Instead of child_process.spawn, cross-spawn:

```ts
const proc = Bun.spawn(["bun", "--version"], {
  stdout: "pipe",
  stderr: "pipe",
});
const [stdout, exitCode] = await Promise.all([proc.stdout.text(), proc.exited]);
const sync = Bun.spawnSync(["git", "status"]);
console.log(stdout, exitCode, sync.success);
```

### Unit tests

Instead of jest, vitest, mocha, chai, ts-jest:

```ts
import { describe, test, expect, mock, beforeEach } from "bun:test";
const fn = mock((x: number) => x * 2);
beforeEach(() => fn.mockClear());
describe("sum", () => {
  test("adds", () => {
    expect(1 + 1).toBe(2);
    expect(fn(2)).toBe(4);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
```

### Hash passwords

Instead of bcrypt, bcryptjs, argon2:

```ts
const hash = await Bun.password.hash("secret", { algorithm: "argon2id" });
const ok = await Bun.password.verify("secret", hash);
console.log(ok);
```

### Hash data

Instead of crypto.createHash, xxhash, murmurhash:

```ts
const hex = new Bun.CryptoHasher("sha256").update("data").digest("hex");
const fast = Bun.hash("data");
const xx = Bun.hash.xxHash3("data");
console.log(hex, fast, xx);
```

### Glob files

Instead of glob, fast-glob, globby, minimatch:

```ts
const glob = new Bun.Glob("src/**/*.ts");
const files: string[] = [];
for await (const file of glob.scan(".")) files.push(file);
console.log(files, glob.match("src/index.ts"));
```

### Environment variables

Instead of dotenv, dotenv/config, cross-env:

```ts
// .env, .env.local and .env.<NODE_ENV> are loaded by Bun before the script runs.
const port = Bun.env.PORT ?? "3000";
console.log(port);
```

### HTTP requests

Instead of node-fetch, axios, got, cross-fetch, undici:

```ts
const res = await fetch("https://example.com/api", {
  headers: { Accept: "application/json" },
  signal: AbortSignal.timeout(5000),
});
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();
console.log(data);
```

### Bundle for production

Instead of esbuild, webpack, rollup, parcel, tsup:

```ts
const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  target: "bun",
  minify: true,
  sourcemap: "linked",
});
if (!result.success) for (const log of result.logs) console.error(log);
```

### Run TypeScript directly

Instead of ts-node, tsx, nodemon, node --watch:

```ts
// package.json: "dev": "bun --watch src/index.ts", "start": "bun src/index.ts"
console.log(import.meta.path, import.meta.dir, import.meta.main);
```

### UUIDs

Instead of uuid, nanoid:

```ts
const id = crypto.randomUUID();
const sortable = Bun.randomUUIDv7();
console.log(id, sortable);
```

### Parse YAML and TOML

Instead of js-yaml, yaml, @iarna/toml, toml, jsonc-parser, json5:

```ts
const config = Bun.YAML.parse(await Bun.file("config.yaml").text());
const cargo = Bun.TOML.parse(await Bun.file("Cargo.toml").text());
const tsconfig = Bun.JSONC.parse(await Bun.file("tsconfig.json").text());
console.log(config, cargo, tsconfig);
```

### Compare semver versions

Instead of semver:

```ts
const ok = Bun.semver.satisfies("1.2.3", "^1.0.0");
const order = Bun.semver.order("1.2.3", "1.10.0");
console.log(ok, order);
```

### Compression

Instead of zlib.gzipSync, pako, node-gzip:

```ts
const packed = Bun.gzipSync("hello");
const text = new TextDecoder().decode(Bun.gunzipSync(packed));
const zstd = await Bun.zstdCompress("hello");
console.log(text, zstd.byteLength);
```

### HTML rewriting and scraping

Instead of cheerio, jsdom, node-html-parser:

```ts
const links: string[] = [];
const rewriter = new HTMLRewriter().on("a[href]", {
  element(el) {
    links.push(el.getAttribute("href")!);
  },
});
await rewriter.transform(new Response("<a href='/x'>x</a>")).text();
console.log(links);
```

### Utilities

Instead of string-width, escape-html, fast-deep-equal, which, strip-ansi, util.promisify(setTimeout):

```ts
await Bun.sleep(10);
console.log(
  Bun.stringWidth("héllo"),
  Bun.escapeHTML("<b>"),
  Bun.deepEquals({ a: 1 }, { a: 1 }),
  Bun.which("git"),
  Bun.stripANSI("\u001b[31mred\u001b[0m"),
);
```

### Cookies

Instead of cookie, cookie-parser:

```ts
Bun.serve({
  routes: {
    "/": (req) => {
      const session = req.cookies.get("session");
      req.cookies.set("seen", "1", { httpOnly: true, sameSite: "lax" });
      return new Response(session ?? "anonymous");
    },
  },
});
const jar = new Bun.CookieMap("a=1; b=2");
console.log(jar.get("a"));
```

### Worker threads

Instead of worker_threads, piscina, threads:

```ts
const worker = new Worker(new URL("./worker.ts", import.meta.url).href);
worker.onmessage = (event) => console.log(event.data);
worker.postMessage({ n: 42 });
```

### Call a C library

Instead of ffi-napi, node-ffi, koffi:

```ts
import { dlopen, FFIType, suffix } from "bun:ffi";
const lib = dlopen(`libm.${suffix}`, {
  cos: { args: [FFIType.f64], returns: FFIType.f64 },
});
console.log(lib.symbols.cos(0));
lib.close();
```

### Store secrets in the OS keychain

Instead of keytar:

```ts
await Bun.secrets.set({ service: "my-app", name: "token", value: "s3cr3t" });
const token = await Bun.secrets.get({ service: "my-app", name: "token" });
console.log(token !== null);
```

### Native video metadata and transformed still frames

Instead of ffprobe-static, video-thumbnail, fluent-ffmpeg:

```ts
if (!Bun.Video.available) throw new Error("Native video provider unavailable");
const video = new Bun.Video("input.mp4");
const metadata = await video.metadata();
await video.frame(1).resize(640).png().write("preview.png");
console.log(metadata.width, metadata.height, metadata.codec);
```

### Package scripts and CLI

Instead of npm install, npx, yarn, pnpm, npm run:

```ts
// bun install, bun add <pkg>, bun add -d <pkg>, bun fmt ., bun run build
console.log(Bun.version);
```

## More examples

The bun-native dataset has thousands of working snippets from the docs, the exact signatures of bun-types, short tests and the n2b migration rules of this Bun version:

- `examples_search` of `bun mcp` (`{"query": "Bun.serve websocket"}`, `kind`: example, signature, test, migration, cli, config), from `~/.bun/agent/datasets/bun-native.jsonl`;
- hosted semantic search: `https://aphrody.app/api/bun/search?q=<words>` (JSON, `k` and `kind` parameters);
- the dataset itself: `https://dist.aphrody.app/datasets/bun-native/latest.json` (JSONL, one entry per line: instruction, code, api, source, version).
