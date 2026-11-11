# Workspace Hygiene & Anti-Pollution Specification

> **Pattern Origin**: Absorbed from DeepakNess *Antigravity 2.0 Critical Analysis* (`deepakness.com/raw/antigravity-2-0`).  
> **Purpose**: Guarantee zero repository clutter, prevent orphaned scratch artifacts, and enforce clean directory boundaries across autonomous sessions.

---

## 1. The Workspace Pollution Anti-Pattern

Unconstrained AI coding assistants frequently litter project roots:
- Writing temporary test scripts (`test.js`, `dummy.html`, `test_api.py`) directly into `src/` or repository roots.
- Leaving untracked logs, scratch archives, and debug dumps in git working trees.
- Forcing users to manually clean up dozens of orphaned files before staging real changes.

---

## 2. The Zero-Pollution Guardrails

Every tool and script in the harness must obey three absolute filesystem invariants:

### Invariant 1: Dedicated Scratch Containment
- Temporary scripts, diagnostic runners, and one-off debug files must **NEVER** be created in the active project directory, `tmp/`, or the desktop.
- All temporary artifacts must reside exclusively inside the session-isolated scratch path:
  ```text
  <appDataDir>/brain/<conversation-id>/scratch/
  ```

### Invariant 2: Ephemeral Lifecycle & Immediate Teardown
- Diagnostic runner scripts (e.g. token testers, temporary push wrappers) must contain `finally { fs.unlinkSync(__filename); }` blocks to self-destruct immediately upon completion.
- Automated hook `session-end-cleanup.js` runs at session termination to purge expired scratch artifacts older than 24 hours.

### Invariant 3: Working Tree Purity
- Before declaring task completion, verify `git status -s` in the target repository.
- No untracked scratch files (`.tmp`, `.bak`, `.log`) are permitted in the git index or working tree.
- Ensure all artifacts embedded in user reports are served from the artifact directory, not left loose in source directories.
