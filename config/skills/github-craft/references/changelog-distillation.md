# Changelog Distillation & Scannability Standard

> Engineering specification for authoring dense, scannable, and transparent release changelogs that respect developer attention and avoid version inflation suspicion.

---

## 1. Core Changelog Philosophy

A changelog is an operational ledger for developers, not a marketing blog post:
- **Respect Attention**: Developers read changelogs to answer two questions: *"What broke?"* and *"What new superpower do I get?"*.
- **Flat-Bullet Density**: Ban nested bullet sprawl. Limit each entry to a single punchy line following the standard verb pattern.
- **Milestone Escalation**: Consolidate multiple commits per calendar day into a single daily release version reflecting the day's highest-magnitude change (Patch $\to$ Minor $\to$ Major).
- **Truthful Research Citations**: Cite legitimate research laboratories and paper concepts directly (e.g. Google Research, PwC Labs); never invent synthetic arXiv numbers (`arXiv:26xx.xxxxx`) that cannot be resolved online.

---

## 2. Standard Release Structure

Every release in `CHANGELOG.md` must follow this structure:

```markdown
## [vX.Y.Z] - YYYY-MM-DD

### 🚀 Highlights
[1-2 sentences summarizing the major theme or architectural breakthrough of the release]

### Added & Optimized
- **[Component Name]**: [Verb in past tense] [exact architectural change] [concrete benefit/impact].
- **[Feature]**: [Verb] [description] [verifiable metric or legitimate paper citation].

### Fixed & Cleaned
- **[Target]**: [Verb] [resolved issue or dead code eliminated] [prevented failure mode].

### Removed (if applicable)
- **[Target]**: [Verb] [deprecated service or dead dependency] [reclaimed disk/RAM footprint].
```

---

## 3. The 4 Invariants of Changelog Hygiene

### A. The One-Line Impact Rule
Every bullet must follow:
$$\text{Entry} = \textbf{[Target/Feature]}: [\text{Action Verb}] + [\text{Exact Change}] + [\text{Concrete Developer Impact}]$$
- *Bad*: *"We read a paper from Google and decided to implement memory compaction because it's good for agents."*
- *Good*: `- **Memory Compaction (Google MaxIM)**: Enforced capacity-constrained dual bounds, slashing token bloat by up to 80% across multi-turn handoffs.`

### B. Pre-Release Version Lineage Note (Anti-Version-Inflation)
When publishing an initial public release with version > 1.0 (e.g., `v6.3.0`) on a fresh repository, always include an explicit lineage note right beneath the milestone diagram:
```markdown
> [!NOTE]
> **Lineage & Versioning Note**: Versions `v1.0.0` through `v6.2.0` document the pre-release architectural research iterations and private laboratory prototypes engineered by [@AuthorHandle](https://github.com/AuthorHandle). Version `v6.3.0` marks the initial canonical public open-source release on GitHub.
```
This eliminates skepticism from visitors who notice a high version number on a low-commit-count repository.

### C. UTF-8 & Windows Encoding Safety
When writing changelogs on Windows hosts:
- Always enforce UTF-8 without BOM (`[System.Text.UTF8Encoding]::new($false)`).
- Avoid non-standard Unicode emoji in Mermaid nodes that break standard CLI parsers or GitHub Markdown renderers.

### D. Clean Milestone Evolution Timeline
Include a top-level Mermaid diagram summarizing major phase transitions:
```mermaid
flowchart LR
    v1["v1.0 - v2.0<br/>Foundations"]
    --> v3["v3.0 - v4.0<br/>Core Architecture"]
    --> v5["v5.0 - v6.0<br/>Production Hardening"]
    --> v63["v6.3.0 (Latest)<br/>Verified Benchmarks"]
```

### E. The Zero Sub-Bullet Invariant (Flat-Bullet Strictness)
Never introduce nested sub-bullets (e.g. `*` or `-` nested under an existing bullet). Sub-bullets degrade scan velocity, break vertical rhythm, and invite verbose narrative sprawl. If a feature contains multiple sub-components:
1. **Synthesize** them into a single high-density flat bullet with precise technical qualifiers.
2. **Shard** distinct milestones into separate top-level flat bullets under `Added & Optimized` or `Fixed & Cleaned`.
- *Strictly Forbidden*:
  ```markdown
  - **Component**: Major overhaul of the engine
    * Sub-feature A: Did something here
    * Sub-feature B: Also changed this other thing
  ```
- *Required Pattern*:
  ```markdown
  - **Component**: Overhauled execution engine, integrating Sub-feature A and Sub-feature B to achieve zero-latency dispatch.
  ```
