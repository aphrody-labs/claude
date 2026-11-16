---
name: windows-paths-in-regex-tools
description: Passing raw Windows backslash paths to regex search tools triggers escape-sequence parse errors like \x86; use -F or forward slashes.
metadata:
  type: reference
---

Passing unescaped Windows backslash paths containing segments like '\x86_64' into regex-based CLI tools fails with 'regex parse error: unrecognized escape sequence' (exit code 1). Why: Regex engines parse backslash-prefixed path segments (\x, \b, \p, \u) as escape sequences instead of path separators. How to apply: Normalize path separators to forward slashes or pass -F (--fixed-strings) when searching literal paths in rg, sd, or fd.

Sources: B2=task output 096be273cf80578e/501be84d-dfaa-4eb8-9684-3b2cd3a9ea41/tasks/b24ixqy3d.output
