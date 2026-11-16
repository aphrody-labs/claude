---
name: os-family-ay-aynt-aydroid
description: Owner 2026-11-16 - the OS family - ay = Aphrody YOLO (CLI), ANU = Aphrody's Not Unix (uutils org + GNU + Linux, Arch family), ayNT (Windows 11 NT, LiberNT fork), aydroid (AOSP with Aphrody in place of Android), aphrody monorepo = userland per OS, Nix as package manager everywhere
metadata:
  type: project
---

Owner 2026-11-16, the product map:
- **ay** = "Aphrody YOLO", the CLI and runner. **ANU** = "Aphrody's Not Unix", the Unix-like OS. ANU forks the whole uutils org and the complete ecosystem described in its READMEs and site, plus GNU and Linux.
- **ayNT** = Windows 11 NT, built against his SDK and Insider build. Its own monorepo, a fork of LiberNT (Rust, C, .NET, MSVC C++, Bun for tooling). Bidirectional Linux and Windows from boot.
- **aydroid** = AOSP with Aphrody in place of Android.
- **aphrody monorepo** = the userland, per OS.
- **Linux base:** Arch family only (CachyOS, Omarchy, Arch Linux), rolling release, on the pre-release closest to Linux stable and rc.
- **Package manager:** Nix everywhere.

**How to apply:** place every unit by this map before moving it. kernel and OS work goes to ANU, ayNT or aydroid; cross-OS userland stays in aphrody. See [[sources-of-truth]], [[ai-os-google-self-hosted]].
