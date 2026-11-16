---
name: product-split
description: "rosegriffon = full TypeScript cloud-ready; nie = full Rust self-hostable repo (C:\\nie, aphrody-labs/nie); UI references per product"
metadata:
  node_type: memory
  type: project
  originSessionId: 3e586339-05ce-487a-bc54-5f2fe1de083d
  modified: 2026-11-16T14:40:24.371Z
---

Decided by the user on 2026-11-16:
- `C:\src\rosegriffon` (aphrody-labs/rosegriffon) stays full TypeScript on Bun and cloud ready.
- `C:\nie` (aphrody-labs/nie, formerly the `rust` branch clone `C:\src\rosegriffon-rust`) is full Rust and self-hostable.
- The inazuma.jp replica, subdomains included, is built twice: in Rust (nie) and in Bun (rosegriffon).
- Achillea UI follows the EA FC Ultimate Team web app (Angular), studied from the user's own logged-in account.
- Azalee UI follows the real UI of nie.exe (the game's own menus, read through nie).

**Why:** the user wants one cloud product and one self-hostable binary product.

**How to apply:** Rust work goes in C:\nie, TS work goes in C:\src\rosegriffon, and no Rust is added to rosegriffon. See [[blanket-consent]].
