#!/usr/bin/env bun
// Mints an account-owned Cloudflare API token for CI (Workers, R2, tunnels read, zones) and stores it, with the account
// id, as GitHub Actions secrets of the given repositories. The token never touches stdout or disk.
//   CLOUDFLARE_API_TOKEN=<token able to create account tokens> bun scripts/cloudflare-ci-token.ts <owner/repo>...
// The account is discovered from the token; permission groups are looked up by name.
const repos = process.argv.slice(2);
const tok = process.env.CLOUDFLARE_API_TOKEN;
if (!tok || !repos.length) {
  console.error(
    "usage: CLOUDFLARE_API_TOKEN=... bun scripts/cloudflare-ci-token.ts <owner/repo>...",
  );
  process.exit(2);
}

interface Envelope<T> {
  success: boolean;
  errors: unknown[];
  result: T;
}
async function cf<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      authorization: `Bearer ${tok}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j = (await r.json()) as Envelope<T>;
  if (!j.success)
    throw new Error(`${method} ${path}: ${JSON.stringify(j.errors)}`);
  return j.result;
}

const [account] = await cf<{ id: string }[]>("GET", "/accounts");
if (!account) throw new Error("the token sees no account");
const groups = await cf<{ id: string; name: string }[]>(
  "GET",
  `/accounts/${account.id}/tokens/permission_groups`,
);
const pick = (names: string[]) =>
  names.map((n) => {
    const g = groups.find((x) => x.name === n);
    if (!g) throw new Error(`missing permission group ${n}`);
    return { id: g.id };
  });
const acct = `com.cloudflare.api.account.${account.id}`;
const minted = await cf<{ value: string }>(
  "POST",
  `/accounts/${account.id}/tokens`,
  {
    name: `github-ci-${new Date().toISOString().slice(0, 10)}`,
    policies: [
      {
        effect: "allow",
        resources: { [acct]: "*" },
        permission_groups: pick([
          "Workers Scripts Write",
          "Workers R2 Storage Write",
          "Cloudflare Tunnel Read",
          "Account Settings Read",
          "Workers KV Storage Write",
          "D1 Write",
        ]),
      },
      {
        effect: "allow",
        resources: { [acct]: { "com.cloudflare.api.account.zone.*": "*" } },
        permission_groups: pick([
          "Zone Read",
          "Workers Routes Write",
          "DNS Read",
        ]),
      },
    ],
  },
);

let failed = 0;
await Promise.all(
  repos.flatMap((repo) =>
    [
      ["CLOUDFLARE_API_TOKEN", minted.value],
      ["CLOUDFLARE_ACCOUNT_ID", account.id],
    ].map(async ([k, v]) => {
      const p = Bun.spawn(["gh", "secret", "set", k!, "-R", repo], {
        stdin: new Blob([v!]),
        stdout: "ignore",
        stderr: "pipe",
      });
      const ok = (await p.exited) === 0;
      if (!ok) failed++;
      console.log(`${ok ? "set   " : "FAILED"} ${repo} ${k}`);
    }),
  ),
);
process.exit(failed ? 1 : 0);

export {};
