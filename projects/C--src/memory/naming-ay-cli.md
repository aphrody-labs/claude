---
name: naming-ay-cli
description: The owner never chose the current names (CLI, args, subcommands, crates, packages); they are agent-made, incoherent and slop; naming must be derived from goals and upstream conventions, argued, owner choices = identity values only
metadata:
  type: feedback
---

Owner, 2026-11-15: he never chose the naming of the CLIs, arguments, subcommands, crates or packages. It is incoherent, a pile of slop that does not fit the goals. An earlier version of this memory claimed "owner-chosen naming" (`ay`, `@aphrody/*`, `aphrody-*` crates, the subcommand list in docs/ay/NAMING.md). That claim was false.

**Why:** agents invented names one by one (xtk, stack-bench, triforge, sovereign-*, mixed French and English, synonyms) without a scheme tied to the goals.

**How to apply:**
- Treat docs/ay/NAMING.md and the current names as legacy, not as decisions.
- Names come from one argued scheme derived from the goals and the upstream conventions (Bun and Cargo CLI layouts, Rust API naming guidelines, POSIX and GNU option syntax, clig.dev, npm scopes), and are generated from tools/identity.toml.
- The only owner choices are the identity values: product, binary, scope. They stay variables ([[language-by-domain]], [[no-private-data-in-source]]).
- Never invent codenames.
