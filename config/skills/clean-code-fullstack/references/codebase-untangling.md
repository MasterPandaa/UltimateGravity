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

### D. Git Churn $\cap$ High LOC Hotspot Audit (Tech Debt Quadrant)
Absorbed from `ksimback/tech-debt-skill`:
1. **The Hotspot Intersection**: Technical debt, architectural bugs, and regression risks concentrate at the intersection of **high change frequency (churn)** and **high code complexity / file size (LOC)**.
2. **Git Churn Heuristic Command**:
   ```bash
   git log --name-only --format=format: -n 200 | grep -v '^$' | sort | uniq -c | sort -nr | head -25
   ```
3. **The 4-Quadrant Tech Debt Prioritization**:
   | Quadrant | Churn Level | LOC / Complexity | Action Protocol |
   |---|---|---|---|
   | **Hotspots (Urgent)** | High Churn | High LOC (> 300 lines) | **Prime refactoring targets**. Break down god-objects into single-responsibility submodules with regression test harnesses. |
   | **Sleeping Giants** | Low Churn | High LOC (> 500 lines) | **Leave alone**. Complex but stable code that rarely changes poses low regression risk. Do not refactor without an explicit feature requirement. |
   | **Active Leaves** | High Churn | Low LOC (< 150 lines) | **Healthy evolution**. Standard day-to-day feature growth and configuration tweaks. |
   | **Quiet Foundation** | Low Churn | Low LOC (< 100 lines) | **Optimal state**. Clean, decoupled utility and pure domain logic. |

### E. Confidence-Graded Dead Code Pruning Protocol (Absorbed from `vulture`)
1. **The 2-Tier Confidence Filter**:
   Static Abstract Syntax Tree (AST) scanning can produce false positives in dynamic languages due to reflection, framework decorators, and plugin systems. Segment candidate dead code into two deterministic tiers before acting:
   - **Tier 1 (100% Confidence - Autonomous Removal)**:
     - Unreachable code branches located after unconditional termination (`return`, `raise`, `throw`, `process.exit()`).
     - Unreferenced private functions, methods, or variables explicitly prefixed with an underscore `_` within their defining module.
     - Orphaned imports with zero AST identifier references in the file.
     - *Action*: Safe for immediate autonomous surgical deletion without human gating.
   - **Tier 2 (60%–90% Confidence - Verification Gate & Whitelist)**:
     - Public class attributes, exported symbols, or interface implementations that appear unreferenced locally.
     - Framework lifecycle handlers (e.g., FastAPI/Express middleware, React lifecycle hooks, Pytest fixtures).
     - *Action*: Require AST call-graph reachability verification across the entire repository or add to an explicit whitelist file before deletion. Never delete Tier 2 candidates solely on single-file analysis.
2. **Size-Prioritized Debt Paydown (`--sort-by-size`)**:
   - Order candidate dead code blocks by Line of Code (LOC) descending.
   - Prioritize pruning one abandoned 150-line legacy module or helper class over deleting ten 1-line variable declarations. Maximizes cognitive clarity and LLM context window ROI per refactoring turn.

---

## 3. Definition of Done for an Untangled Seam
1. **Single Point of Change**: Standard feature adjustments touch a single localized module rather than triggering cascading edits across 5+ directories.
2. **Acyclic Imports**: Zero circular dependencies between packages or modules.
3. **Unbroken Contracts**: All public APIs and caller contracts remain backwards-compatible.
4. **Verified Green State**: Existing test suites execute cleanly with zero regression failures.
