---
name: google-quality-criteria
description: Google eng-practices review criteria and the Google developer style highlights, read live on 2026-11-15; this is the bar for hardcoding and slop purges
metadata:
  type: reference
---

Sources read live on 2026-11-15:
- https://google.github.io/eng-practices/review/reviewer/looking-for.html
- https://developers.google.com/style/highlights

Code (eng-practices):
- Review criteria: design, functionality, complexity, tests, naming, comments, style, consistency, docs, every line.
- Too complex means it can't be understood quickly. Be especially vigilant about over-engineering: solve the problem needed now, not a speculative future one.
- Comments explain why, not what. If code needs a comment to be understood, simplify it first.
- Tests come in the same change, would fail if the code broke, and use simple assertions. No complexity in tests.

Docs (style highlights):
- Active voice, "you", conversational but not frivolous.
- No pre-announcing features.
- Conditions before instructions, sentence-case headings, code font for code.
- Unambiguous dates, descriptive link text.

Applied by [[requirements-ledger]] (no hardcoding, no slop) and [[reuse-research-purge-perf]].
