---
name: no-private-data-in-source
description: Owner 2026-11-15 - no identity, PC, accounts, Windows folders, VPS names/IPs/paths or owner statements in source or config; imports must be verified, purged, reorganized; naming argued
metadata:
  type: feedback
---

Owner complaint (2026-11-15, about apps/open work): hardcoded VPS details in tools/config (ssh aliases, /srv paths, manual bun downloads on fr2, "{home}/.bun/..." paths in toolchain.toml), his identity, PC, accounts, Windows folders, VPS and his own statements ("owner said", quoted decisions) inside source code and configuration; open importing code from src without verifying, purifying, purging and reorganizing it; prefixes, naming, architecture and style not chosen with well-argued reasons.

**Why:** open is a public generalist library; site and personal values make it non-reusable and leak private infrastructure; imported code carried "Sovereign" names, fleet host names (fr1/prd), the private mesh subnet, aphrody.com defaults and Aphrody product modules.

**How to apply:**
- Discovery first (owner rule, 2026-11-15): hosts, addresses, users, services and identity are resolved live, never stored, even in a private file. Sources: `ssh -G <role>` with ~/.ssh/config as the only per-machine input, `wg show`, DNS (A/AAAA, SRV `_svc._tcp`, mesh names), TLS cert SAN, HTTP `/.well-known/aphrody/host`, relay WS peers, git config, `gh api user`, Cloudflare /accounts, and env (USERNAME, USERPROFILE, COMPUTERNAME). The results are cached with a TTL. The single resolver is packages/env-kit/src/discover.ts.
- Residual site values that no protocol answers come from arguments, env or a private file outside the repo; scripts select hosts by role from a fleet file passed in (example: apps/open/apps/bun-m3/remote.ts), runtimes from the host's `ay rt`, tools by package name (`bun x --bun <pkg>`), never by install path.
- Run a private-data gate whose patterns are read from the machine at run time (user, home, host name, git e-mail, ~/.ssh/config, fleet file), never written in the repo.
- Docs state requirements and decisions, not who said them; no quotes of the owner.
- An import into open is verified (tests in open), purged (product/fleet code stays in the source repo), renamed to the naming rules and reviewed before it lands, not after.
- Naming and structure decisions are written with their arguments before renaming (open docs/roadmap/decisions.md).
