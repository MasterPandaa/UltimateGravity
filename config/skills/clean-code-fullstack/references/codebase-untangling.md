# Codebase Untangling & Structural Refactoring Heuristics

> Architectural reference adapted from `caldoai/skills` (`untangle-codebase`). Governs deep codebase untangling, architectural boundary repair, and dependency cleanup without high-risk big-bang rewrites.

---

## 1. Core Invariant: Bounded Surgical Refactoring over Big-Bang Rewrites
* **Anti-Big-Bang Rule**: Never rewrite or rearrange an entire codebase in a single massive pass. Global rewrites cause merge conflicts, destroy git history clarity, and introduce silent contract breaks.
* **Module-by-Module Progression**: Untangle one architectural seam at a time. Each step must remain runnable, with automated tests passing before moving to the next module.
* **Documentation Integrity**: In accordance with Antigravity system rules, preserve all existing business comments and docstrings. Only remove dead, unreachable code or orphaned imports resulting from the refactor.

---

## 2. The 3 Core Diagnostic Heuristics

### A. Skeleton AST Probing (Token-Efficient Macro Mapping)
Before loading thousands of lines of implementation code into the context window:
1. Inspect the "skeleton" first: exported functions, class headers, type definitions, and interface signatures without reading complete function bodies.
2. Build a mental dependency graph of what components exist and how they interface across layers before touching implementation details.

### B. The Volatility Dependency Direction (Stable Dependencies Principle)
Enforce unidirectional, acyclic dependency flows:
$$\text{Volatile Modules (UI / Adapters / Plugins)} \longrightarrow \text{Stable Modules (Core Domain / Shared Types)}$$
* **Rule**: Nothing should import anything more volatile (more prone to frequent changes) than itself.
* Core domain entities, database schemas, and shared contracts must remain at the center and have zero imports from volatile presentation components or experimental features.
* If a stable utility depends on a specific high-churn UI feature, invert the dependency via interfaces or dependency injection.

### C. Temporal Co-Change Git Mining (Revealing Hidden Coupling)
Code that looks structurally separated in folder trees may still be tightly coupled in reality:
1. Run git log mining to identify files that frequently commit together:
```bash
git log --name-only --pretty=format: -n 100 | grep -v '^$' | sort | uniq -c | sort -nr | head -20
```
2. If File A (e.g. `billing.ts`) and File B (e.g. `user-profile.tsx`) change together in >70% of commits, they share hidden temporal coupling.
3. **Resolution**:
   * Either co-locate them into the same domain feature folder ("pieces that change together end up together").
   * Or extract a shared type/event contract that decouples their lifecycles.

---

## 3. Definition of Done for an Untangled Seam
1. **Single Point of Change**: Standard feature adjustments touch a single localized module rather than triggering cascading edits across 5+ directories.
2. **Acyclic Imports**: Zero circular dependencies between packages or modules.
3. **Unbroken Contracts**: All public APIs and caller contracts remain backwards-compatible.
4. **Verified Green State**: Existing test suites execute cleanly with zero regression failures.
