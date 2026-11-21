# Security Policy

UltimateGravity incorporates an autonomous **AppSec Sentinel** (`security-engineer`) to safeguard AI agent workflows, token secrecy, host memory boundaries, and application integrity. We take security vulnerabilities seriously.

---

## Supported Versions

Only the latest canonical release receives active security patches:

| Version | Supported |
|---|---|
| `v6.3.x` | :white_check_mark: |
| `< v6.3.0` | :x: |

---

## Reporting a Vulnerability

If you discover a security vulnerability or sensitive information exposure in UltimateGravity, **please do not open a public issue**.

### Responsible Disclosure Protocol
1. **Private Advisory**: Use the [GitHub Security Advisory](https://github.com/MasterPandaa/UltimateGravity/security/advisories/new) form to submit your report confidentially.
2. **Alternative Contact**: If private advisory is unavailable, email the maintainer at `masterpandaa.dev@gmail.com` (or submit a GPG-encrypted email) with the subject `[SECURITY] UltimateGravity Vulnerability Report`.

### What to Include
To help us triage and remediate quickly, please include:
- A description of the vulnerability, including severity and potential impact.
- Affected component, tool, or script (e.g. `clean-file`, `mcp-profile`, `agy-exec`).
- Step-by-step instructions or minimal reproducible proof-of-concept (PoC).
- Recommended remediation diff if available.

### Remediation Timeline
- **Initial Response**: Within 48 hours of report receipt.
- **Triage & Status**: Updates provided within 5 business days.
- **Surgical Patch & Advisory**: Deployed via patch release after verification.

---

## Scope & Defenses

UltimateGravity actively tests and defends against:
- **Token & Secret Leakage**: Preventing API keys, service role credentials, and bearer tokens from entering context logs or git commits.
- **Shell & AST Injection**: Sanitizing unsanitized commands before execution via `agy-exec` and subagent dispatchers.
- **Host Resource Exhaustion**: Monitoring memory leaks, handle bloat, and runaway loop processes on Windows hosts.
- **Privacy Hygiene**: Sanitizing C2PA provenance and AI steganographic watermarks from local scratch assets.
