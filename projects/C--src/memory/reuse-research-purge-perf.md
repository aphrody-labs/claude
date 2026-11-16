---
name: reuse-research-purge-perf
description: Owner directive 2026-11-15 - reuse everything that exists, research first, purge dead/legacy code, consolidate and flatten, use proven modern scientific methods, optimize every action for raw performance (incl. XFS and compression)
metadata:
  type: feedback
---

Owner directive (2026-11-15): use everything that already exists and always research as much as possible. Purge dead code and legacy inconsistencies; consolidate and flatten. Manage the monorepo and its builds with modern algorithms, processes and scientific research that are proven. Orient every action toward raw performance. Research XFS and the best compression, archive and decompression formats for the whole monorepo.

**Why:** the goals have to be met with scientific rigour. Legacy code and duplicates cost build time and LLM context.

**How to apply:**
- Before building anything, search the repo, the forks and upstream ([[verify-before-delegating]]), then research the state of the art and cite the sources.
- Every change carries a before/after measurement (hyperfine, cargo timings, a size diff) run on fr1 or fr2 ([[fleet-roles]]).
- Delete dead code instead of archiving it ([[terse-reports]]; the history is in git).
- Prefer flattening and dedup over new layers, and keep abstractions minimal.
- Run everything in parallel and asynchronously ([[max-parallel-async]]).
