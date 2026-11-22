# High-Conversion README Architecture & Documentation Engine

> Comprehensive engineering standard for authoring developer READMEs that communicate technical value in 5 seconds, eliminate AI slop, and survive adversarial peer review. Integrates principles from **Andrej Karpathy**, **Matt Pocock**, **Anthropic**, **DeepSeek**, and **Google PaperOrchestra**.

---

## 1. The 7-Layer High-Conversion Anatomy

```
┌────────────────────────────────────────────────────────┐
│ 1. Hero & Visual Craft (21:9 Banner, Dynamic Badges)   │
├────────────────────────────────────────────────────────┤
│ 2. The 3-Second Elevator Pitch (The Problem vs Fix)    │
├────────────────────────────────────────────────────────┤
│ 3. Audience Segmentation Matrix (Who is This For?)     │
├────────────────────────────────────────────────────────┤
│ 4. The 5 Pains We Solve Table (Before vs After Diff)   │
├────────────────────────────────────────────────────────┤
│ 5. 1-Click Quickstart & Verified Runnable MWE (<15 l)  │
├────────────────────────────────────────────────────────┤
│ 6. Visual Topology & Codebase at a Glance (Mermaid/Map)│
├────────────────────────────────────────────────────────┤
│ 7. Machine-Verified Benchmarks & Author Attribution    │
└────────────────────────────────────────────────────────┘
```

---

## 2. The 5 Signatures of Mastery (Absorbed from `readme-craft`)

### 1. The Matt Pocock Principle (Pain vs. The Fix)
Begin with the developer's exact daily frustration, not an abstract list of features:
- Show a tangible *Before vs. After* contrast: what bug, cognitive friction, or safety flaw does this solve?
- *Example*: *"Without this: AI claims completion while tests are red. With this: Completion strictly requires exit code 0."*

### 2. The Andrej Karpathy Principle (Codebase at a Glance)
Demystify repository architecture in 10 seconds by presenting primary file maps and estimated line counts:
```markdown
## 📂 Codebase at a Glance
- `core/engine.ts` (~280 lines): Main state machine execution logic.
- `parsers/manifest.ts` (~90 lines): Dependency and config parser.
- `cli.ts` (~50 lines): Terminal entry point and flag parsing.
```

### 3. The Anthropic Principle (Runnable Minimal Working Example)
Provide a runnable MWE (< 15 lines) that can be copied directly, with inline comments indicating expected output:
```powershell
# 3. Verify your system benchmarks
node ~/.gemini/scripts/bench-runner.js run
# => 26 / 26 Test Cases Passed (100.0%)! System ready.
```

### 4. The DeepSeek Principle (Grounded Numbers & Hardware Specs)
Replace subjective adjectives (*"blazing fast"*, *"lightweight"*) with concrete metric data:
- Bundle size / dependencies: `1.8 KB (0 external dependencies)`.
- Hardware requirements: Memory footprint (e.g. `Optimized for standard 8GB RAM Windows machines`).
- Quantitative SLAs: Execution latency, test pass rates, or AST outline compression ratios.

### 5. The Scope & Gotchas Guard (Anti-Overpromising)
Transparently state what is **NOT** supported or scope boundaries (e.g., *"Windows-native; macOS/Linux community contributions welcome"*).

---

## 3. Adaptive Archetype Classification (3 Blueprints)

### Archetype A: Library / Developer CLI / SDK
- **Focus**: 1-line installation, instant runnable MWE, argument/options table, and zero fluff.
- **Layout**: Left-aligned technical header, dynamic CI/version status badges, quickstart within the first 10 seconds of reading.

### Archetype B: Fullstack & Enterprise Backend
- **Focus**: Mermaid architecture flowcharts (`flowchart LR`), environment variable matrix (`.env.example`), container walkthrough, and test suite verification.
- **Layout**: System overview, prerequisite dependencies, 3-command setup (`clone -> env -> run`), configuration matrix, and testing commands.

### Archetype C: Open-Source SaaS & Agent OS Showcase
- **Focus**: Value proposition, 21:9 hero banner, audience segmentation table, "5 Pains" comparison, and collapsible FAQ.
- **Layout**: Centered elegant header (`<div align="center">`), prominent dynamic badges, and `<details>` accordions for deep topics.

---

## 4. Log-to-Spec Ingestion & Peer-Review Refinement (Google PaperOrchestra)

When drafting technical sections, benchmark scorecards, or capability tables:

1. **Parser-Bound Log Ingestion**:
   - Every performance metric, throughput figure, or benchmark comparison **MUST** be extracted directly from physical execution logs (`history.json`, CI logs, or test runner terminal traces).
   - Prohibit hallucinated or ungrounded claims (e.g., claiming 100% precision without machine verification).
2. **Outline-First Spec Formulation**:
   - Draft a structured outline defining section headers, evidence anchors, and mapped artifact paths before generating prose.
3. **Simulated Peer-Review Refinement**:
   - Run an internal adversarial critique pass:
     - *Check*: Are all quantitative statements backed by file or command references?
     - *Check*: Are negative results, limitations, and scope boundaries explicitly stated?
     - *Action*: Purge unevidenced marketing superlatives before declaring the document complete.

---

## 5. Multi-AI Audit Hardening Rules (Lessons from Independent LLM Audits)

### Rule 1: The Machine Proof Invariant (Dynamic CI Required)
- Claiming automated tests or verification strictly mandates an active **GitHub Actions CI workflow** with a live status badge:
  `[![CI](https://github.com/<owner>/<repo>/actions/workflows/<workflow>.yml/badge.svg)](...)`
- Never rely solely on static Shields.io badges for benchmark claims. External reviewers immediately test if a CI pipeline exists.

### Rule 2: The 100% Numerical Consistency Rule
- Every metric, test case count, tool count, and version number must be identical across every surface:
  - If the benchmark scorecard says `26 / 26`, the quickstart code comment must say `26 / 26`, and the badge must say `26/26`.
  - Discrepancies (e.g. 25 vs 26) destroy credibility in 30 seconds.

### Rule 3: The Complete Tool/Feature Table Rule
- If the section heading promises *"26 Global CLI Tools Included"*, the table must list all 26 tools.
- Never list a truncated subset (e.g., 11 rows) under an absolute heading without explicitly stating: *"Key tools highlighted below (see bin/ for full list)"*.

### Rule 4: Ban on Unfalsifiable & Superlative Claims
- ❌ **Strictly Banned**: *"zero hallucinations"*, *"100% precision"*, *"battle-tested"* without case studies, and synthetic/unverified `arXiv:26xx` citations.
- ✅ **Required Grounding**: *"verified machine execution"*, *"no assumed fixes — exit code 0 required"*, *"exact lexical match"*, and authentic lab study names.

### Rule 5: Platform Non-Affiliation Disclaimer
- When building tools on top of commercial or third-party platforms (Google, OpenAI, Anthropic, Vercel), include an explicit non-affiliation disclaimer at the bottom of the README:
  `*Disclaimer: [Project] is an independent open-source project by [Author] and is not officially affiliated with or endorsed by [Vendor].*`

### Rule 6: Anti-Star-Begging Standard
- Open-source communities frown upon explicit solicitation (*"star badges are warmly welcome"*).
- Conclude with a professional contribution invitation: *"Contributions, feedback, and issue reports are warmly welcome!"*.
