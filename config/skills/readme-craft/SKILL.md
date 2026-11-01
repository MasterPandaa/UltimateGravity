---
name: readme-craft
description: World-class README and documentation architect. Audits manifests, scripts, and codebase to craft iconic, scannable READMEs inspired by Karpathy, Matt Pocock, Anthropic, and DeepSeek with Before/After diffs, codebase line-count map, runnable MWEs, grounded benchmarks, and zero AI slop.
---

# readme-craft: World-Class Developer Documentation Engine

High-grade documentation engineering standard for auditing repositories and crafting industry-standard `README.md` files that are scannable, credible, and respectful of developer attention. Adopts design principles from **Andrej Karpathy**, **Matt Pocock**, **Anthropic**, and **DeepSeek**.

---

## 1. The 5 Signatures of Mastery

Every README created or updated must apply the following principles when relevant to the repository context:

### 1. The Matt Pocock Principle (The Pain vs. The Fix)
Begin with the **developer's pain point**, not an abstract feature list:
- Show a tangible *Before vs. After* contrast: what bug, friction, or type-safety flaw does this solve?
- Example: *"Without this: `JSON.parse` returns `any`. With this: `JSON.parse` returns `unknown` (type-safe)."*

### 2. The Andrej Karpathy Principle (Files & Mental Model Breakdown)
Demystify repository architecture in 10 seconds by presenting primary file maps and estimated line counts:
```markdown
## 📂 Codebase at a Glance
- `core/engine.ts` (~280 lines): Main state machine execution logic.
- `parsers/manifest.ts` (~90 lines): Dependency and config parser.
- `cli.ts` (~50 lines): Terminal entry point and flag parsing.
```

### 3. The Anthropic Principle (Runnable Minimal Working Example)
Provide a runnable MWE (< 15 lines) that can be copied directly, with inline comments indicating expected output:
```typescript
import { analyze } from "readme-craft";

const report = analyze("./my-project");
console.log(report.archetype); // => "Fullstack / Enterprise"
```

### 4. The DeepSeek Principle (Grounded Numbers & Hardware Specs)
Replace subjective adjectives (*"blazing fast"*, *"lightweight"*) with concrete metric data:
- Bundle size / dependencies: `1.8 KB (0 external dependencies)`.
- Measured benchmarks: execution latency, QPS throughput, or comparative industry tables.
- Hardware requirements (for AI/compute projects): estimated VRAM or minimum runtime versions.

### 5. The Scope & Gotchas Guard (Anti-Overpromising)
Transparently state what is **NOT** supported or scope constraints (e.g., *"Designed for standalone applications; do not use within shared component libraries"*).

---

## 2. Repository Audit Protocol (Pre-Draft Inspection)
Before drafting a single line, the agent **MUST** directly audit the project files:
1. **Manifest & Stack Scanner**:
   - Node: `package.json` (read `name`, `version`, `scripts`, `dependencies`).
   - Python: `pyproject.toml`, `requirements.txt`.
   - Rust: `Cargo.toml`.
   - Go: `go.mod`.
2. **Environment & Secrets Safety**:
   - Inspect `.env.example` to construct the configuration matrix. Never read or expose plaintext secret values from `.env`.
3. **Verified Command Discovery**:
   - Use only terminal commands verified in `package.json` / `Makefile` (e.g., verify whether the project uses `pnpm`, `npm`, or `bun`).

---

## 3. Adaptive Archetype Classification (3 Blueprints)

### Archetype A: Library / Developer CLI / SDK
- **Focus**: 1-line installation, instant MWE, Before/After snippet, argument/API options table, and zero fluff.
- **Layout**: Left-aligned technical header, CI/version status badges, quickstart within the first 10 seconds of reading.

### Archetype B: Fullstack & Enterprise Backend
- **Focus**: Mermaid architecture flowcharts (`flowchart LR`), `.env` table, Docker Compose walkthrough, and test suite verification.
- **Layout**: System overview, prerequisite dependencies, 3-command setup (`clone -> .env -> run`), configuration matrix, and testing commands.

### Archetype C: Open-Source SaaS & Web Showcase
- **Focus**: Solution-oriented value proposition, hero preview/demo GIF, benefit-driven feature highlights, and collapsible FAQ.
- **Layout**: Centered elegant header (`<div align="center">`), prominent live demo links, and `<details>` accordions for advanced topics.

---

## 4. Invariants & Zero AI Slop
1. **Prohibit AI Cliches**: Strip all generic filler openings (*"Welcome to..."*, *"In today's fast-paced tech landscape..."*, *"This powerful, game-changing tool..."*). Go straight to technical value.
2. **Standardized Badges**: Use consistent Shields.io formatting (`style=flat-square`), avoiding low-contrast color combinations.
3. **Scannability First**: Use `<details>` tags for error codes, troubleshooting, or verbose logs to keep the document readable.
4. **Non-Destructive Principle**: Always inspect whether an existing `README.md` exists; offer diffs or confirmation before overwriting critical documentation.
