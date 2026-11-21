# Contributing to UltimateGravity

Thank you for your interest in improving UltimateGravity! We welcome contributions that uphold high software engineering standards, verifiable correctness, and zero AI slop.

---

## Code of Conduct

All contributors and participants agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all community members with respect and professionalism.

---

## How to Contribute

### 1. Reporting Bugs
- Search existing [Issues](https://github.com/MasterPandaa/UltimateGravity/issues) and [Discussions](https://github.com/MasterPandaa/UltimateGravity/discussions) to ensure the bug has not already been reported.
- Open a new issue using our **Bug Report** template, providing complete reproduction steps, OS details, and terminal output.

### 2. Proposing Features or Improvements
- For major architectural shifts or new tools, please open a thread in [Discussions](https://github.com/MasterPandaa/UltimateGravity/discussions) first to align on design and constraints.
- Keep in mind the project invariants: **Windows-first**, **lean token footprints**, **$\le 150$ active MCP tools**, and **$L_0 \le 60$ lines** for root `SKILL.md` files.

---

## Development Setup

1. **Clone the repository**:
   ```powershell
   git clone https://github.com/MasterPandaa/UltimateGravity.git
   cd UltimateGravity
   ```

2. **Run local benchmark regression suite**:
   ```powershell
   node scripts/bench-runner.js run
   ```

3. **Run token hygiene & rule audit**:
   ```powershell
   node scripts/bench-runner.js audit
   ```

---

## The Iron Law of Contributions

Every Pull Request must strictly satisfy:

1. **Machine Verification**: All 26 benchmark test cases must pass (`100% PASS`, 0 regressions) via `node scripts/bench-runner.js run`.
2. **Minimal Verifiable Blast Radius (MVBR)**: Keep diffs bounded (< 50 lines per file whenever possible). Avoid wholesale rewrites.
3. **100% English Standard**: All code, comments, documentation, and commit messages must be written in English.
4. **Zero AI Slop**: No generic template filler, placeholder `// TODO` comments, or untested assertions.

---

## Pull Request Process

1. Fork the repo and create your branch from `main`:
   ```powershell
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(skills): add new capability`
   - `fix(bin): resolve process leak in agy-exec`
   - `docs: update quickstart instructions`
3. Push to your branch and open a Pull Request against `main`.
4. Ensure CI tests pass on GitHub Actions.
