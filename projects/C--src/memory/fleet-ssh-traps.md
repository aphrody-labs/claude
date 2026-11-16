---
name: fleet-ssh-traps
description: "ssh to vps/prd/cdn - always `timeout N ssh`, kill gitleaks/lighthouse-chrome that saturate vps, exit 255 = overloaded host"
metadata:
  node_type: memory
  type: reference
  originSessionId: a011b3c7-fd06-4420-af19-2f3bf97435cb
  modified: 2026-11-13T07:27:25.992Z
---

Observed 2026-11-12: `ssh vps` without a timeout hung; exit 255 when gitleaks and lighthouse Chrome (`user-data-dir=/tmp/lighthouse`) saturated vps.
**Why:** a blocked ssh freezes the whole session.
**How to apply:** `timeout 60 ssh <host> '...'`; if 255, `pkill -f gitleaks; pkill -u ubuntu -f user-data-dir=/tmp/lighthouse` then retry. Full procedure: skill `fleet`.

