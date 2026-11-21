## 📋 Summary of Changes

A concise description of what this PR does, what problem it solves, and why this approach was chosen.

---

## 🔍 Context & Architecture Alignment

- **Category**: [Frontend / Backend / Database / QA / Data Pipeline / Security / Harness]
- **Issue Reference**: Fixes #(issue)
- **Blast Radius**: Lines changed and files touched (< 50 lines preferred)

---

## 🧪 Verification & Machine Proof

All PRs must provide fresh verified machine execution proof prior to merge:

- [ ] Ran `node scripts/bench-runner.js run` — 26/26 test cases passed (100.0%, 0 regressions)
- [ ] Ran `node scripts/bench-runner.js audit` — 0 token hygiene / critical rule errors
- [ ] Verified on Windows native PowerShell environment
- [ ] All new code, comments, docstrings, and docs are written in 100% English

### Execution Evidence
```text
<!-- Paste terminal output from 'node scripts/bench-runner.js run' here -->
```

---

## 🛡️ Security & Invariants Checklist

- [ ] No secrets, private API keys, or credentials committed
- [ ] No unbounded memory allocations or subprocess leak points
- [ ] New or modified root `SKILL.md` strictly adheres to $L_0 \le 60$ lines
- [ ] Preserves backward compatibility or provides automated migration
