# GitHub Releases & Semver Tagging Protocol

> Operational standard for cutting verifiable releases, generating release notes, and publishing packages via GitHub CLI.

---

## 1. Pre-Release Verification Gate
Never publish a GitHub release or git tag without verified test proof:
1. **Automated Benchmark Pass**: Run `node scripts/bench-runner.js run` — must achieve 100% pass rate with 0 regressions.
2. **Clean Git Working Tree**: Run `git status` — ensure working tree is clean and up to date with `origin/main`.
3. **Secret Scan**: Run `git diff --cached` — verify zero plaintext secrets, tokens, or environment files.

---

## 2. Release Notes Standard Template

Every release notes payload must be structured for immediate clarity:

```markdown
## [Project Name] vX.Y.Z — [Release Title]

**[Project Name]** is an [evergreen 1-sentence value statement], personally engineered by **[@AuthorHandle](https://github.com/AuthorHandle)**.

### 🌟 What's New in vX.Y.Z
- 📊 **[Feature 1]**: [Concise 1-sentence description of breakthrough].
- ⚡ **[Feature 2]**: [Performance or capability lift].
- 🛡️ **[Feature 3]**: [Security, safety, or reliability enhancement].
- 🚀 **[Installer/Setup]**: [Quick installation update].

### 📦 Quickstart (1 Command)
```powershell
git clone https://github.com/<owner>/<repo>.git
cd <repo>
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

---
*Distributed under the MIT License. Designed for real-world software engineering with zero AI slop.*
```

---

## 3. Automation with GitHub CLI (`gh`)

To create and publish the release seamlessly:

```powershell
cd /path/to/repo

$version = "v6.3.0"
$title = "UltimateGravity v6.3.0 — The Web-Bench & Frontier Harness Release"

$notes = @"
## UltimateGravity v6.3.0 — Canonical Frontier Release

**UltimateGravity** is a production-grade autonomous engineering operating system for AI coding agents, personally engineered by **[@MasterPandaa](https://github.com/MasterPandaa)**.

### 🌟 What's New in v6.3.0
- 📊 **Automated Regression Suite (`bench-runner.js`)**: 25 deterministic test cases running out-of-the-box across 4 suites.
- ⚡ **Lexical-First Grep Hierarchy (PwC Labs, arXiv:2605.15184)**: 100% precision code search saving ~1.5 GB RAM.
- 🧠 **Capacity-Constrained Memory Compaction (Google MaxIM, arXiv:2611.12825)**: Slashing token bloat by up to 80%.
- 🚀 **1-Click Windows Installer**: Complete setup into `~/.gemini` in seconds via `install.ps1`.

### 📦 Quickstart
```powershell
git clone https://github.com/MasterPandaa/UltimateGravity.git
cd UltimateGravity
powershell -ExecutionPolicy Bypass -File .\install.ps1
```
"@

$notes | gh release create $version --repo MasterPandaa/UltimateGravity --title $title --notes-file -
```
