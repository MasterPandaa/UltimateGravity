# GitHub Releases & Semver Tagging Protocol

> Operational standard for cutting verifiable releases, generating clean release notes, and publishing packages via GitHub CLI without shell escaping bugs.

---

## 1. Pre-Release Verification Gates

Never publish a GitHub release or git tag without verified test proof:
1. **Automated Benchmark Pass**: Run `node scripts/bench-runner.js run` — must achieve 100% pass rate with 0 regressions.
2. **Clean Git Working Tree**: Run `git status` — ensure working tree is clean and up to date with `origin/main`.
3. **Secret Scan**: Run `git diff --cached` — verify zero plaintext secrets, tokens, or environment files.
4. **CI Green Status**: Ensure GitHub Actions workflow (`.github/workflows/bench.yml`) has passed on the latest commit.

---

## 2. The Notes-File Invariant (Anti-Shell-Escaping)

> [!CRITICAL]
> **Never pipe multi-line release notes strings directly through PowerShell commands** (e.g. `$notes | gh release create ...`). PowerShell frequently escapes code fences into corrupt literal backslashes (e.g. `\\\powershell`), ruining the release notes appearance on GitHub.
>
> **The Standard**: Always write release notes into an isolated temporary markdown file (`release-notes.md`), pass `--notes-file release-notes.md`, and delete the temporary file after creation.

---

## 3. Release Notes Standard Template

Every release notes payload must be structured for immediate clarity:

```markdown
## [Project Name] vX.Y.Z — [Release Title]

**[Project Name]** is an [evergreen 1-sentence value statement], personally engineered by **[@AuthorHandle](https://github.com/AuthorHandle)**.

### 🌟 What's New in vX.Y.Z
- 📊 **[Feature 1]**: [Concise 1-sentence description of breakthrough].
- ⚡ **[Feature 2]**: [Performance or capability lift].
- 🛡️ **[Feature 3]**: [Security, safety, or reliability enhancement].
- 🚀 **[Installer/Setup]**: [Quick installation update].

### 📦 Quickstart

```powershell
git clone https://github.com/<owner>/<repo>.git
cd <repo>
powershell -ExecutionPolicy Bypass -File .\install.ps1
node ~/.gemini/scripts/bench-runner.js run
```

---
*Distributed under the MIT License. Designed for real-world software engineering with zero AI slop.*
```

---

## 4. Automation with GitHub CLI (`gh`)

```powershell
cd /path/to/repo

$version = "v6.3.0"
$title = "UltimateGravity v6.3.0 — The Web-Bench & Frontier Harness Release"
$notesFile = "release-notes-temp.md"

# 1. Write release notes cleanly to isolated file
@"
## UltimateGravity v6.3.0 — Canonical Frontier Release

**UltimateGravity** is a production-grade autonomous engineering operating system for AI coding agents, personally engineered by **[@MasterPandaa](https://github.com/MasterPandaa)**.

### 🌟 What's New in v6.3.0
- 🛠️ **GitHub Launch & Conversion Architect (`github-craft`)**: Standardized launch framework and reference guides.
- 📊 **Automated Regression Suite (`bench-runner.js`)**: 26 deterministic test cases with 100% pass rate.
- ⚡ **Lexical-First Grep Hierarchy (PwC Labs & Code Search)**: Exact pattern matching eliminating ~1.5 GB RAM overhead.
- 🧠 **Capacity-Constrained Memory Compaction (Google Research & DeepMind)**: Dual-gate memory bounds slashing token bloat.
- 🚀 **1-Click Windows Installer**: Complete setup into `~/.gemini` in seconds via `install.ps1`.

### 📦 Quickstart

```powershell
git clone https://github.com/MasterPandaa/UltimateGravity.git
cd UltimateGravity
powershell -ExecutionPolicy Bypass -File .\install.ps1
node ~/.gemini/scripts/bench-runner.js run
```

---
*Distributed under the MIT License. Designed for real-world software engineering with zero AI slop.*
"@ | Set-Content -Path $notesFile -Encoding UTF8

# 2. Publish release using --notes-file
gh release create $version `
  --repo MasterPandaa/UltimateGravity `
  --title $title `
  --notes-file $notesFile

# 3. Clean up temporary notes file
Remove-Item -Path $notesFile -Force
```
