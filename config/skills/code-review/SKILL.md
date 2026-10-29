---
name: code-review
description: "[Dual-Axis Git PR & Diff Review] Review code changes along two axes: Standards (adherence to repo patterns) and Spec (verifying acceptance criteria compliance). Use when reviewing PRs, commits, or branch diffs. DO NOT USE for deep OWASP vulnerability penetration testing (use security-audit)."
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards**: does the code conform to this repo's documented coding standards and modern software craft?
- **Spec**: does the code faithfully implement the originating issue / spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings.

The issue tracker should have been provided to you. If not, tell the user to run `/setup-matt-pocock-skills`.

## Table of Contents

- [Process](#process)
- [Why two axes](#why-two-axes)
- [6. PR Feedback Resolution & Pre-Push Quality Gate](#6-pr-feedback-resolution-pre-push-quality-gate)

---

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point (a commit SHA, branch name, tag, `main`, `HEAD~5`, etc.). If they didn't specify one, ask for it.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline`.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. A bad ref or empty diff should fail here, not inside two parallel sub-agents.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.), fetched via the workflow in the tracker doc.
2. A path the user passed as an argument.
3. A spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

### 3. Identify the standards sources & Anti-Anchor Baseline

Search the repo for every file that documents how code should be written. When `CODING_STANDARDS.md` or `CONTRIBUTING.md` exists, it must be on the list.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below: a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies across all codebases. Two rules bind it:

- **Anti-Anchor & Technical Debt Gate**: Documented repo conventions guide naming and style, but **THEY DO NOT SANCTIFY ROTTEN ARCHITECTURE OR DANGEROUS CODE SMELLS**. If a repo convention endorses anti-patterns, security risks, or silent technical debt, DO NOT suppress the smell. Flag it as an architectural warning with an elevated recommendation. Legacy code is a baseline, NOT ground truth.
- **Calibrated Judgement**: Each smell is a labelled heuristic ("possible Feature Envy"), accompanied by concrete rationale and impact assessment.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Spawn both sub-agents in parallel

Issue both sub-agent calls together, in the foreground, and aggregate the reports they return.

**Standards sub-agent prompt** should include:

- The full diff command and commit list.
- The list of standards-source files you found in step 3, **plus the smell baseline from step 3** pasted in full.
- The brief: "Report, per file/hunk where relevant, (a) every place the diff violates a documented standard; and (b) any baseline smell or architectural technical debt you spot: name it and quote the hunk. Do NOT suppress smells simply because legacy code had them. Skip anything tooling enforces."

**Spec sub-agent prompt** should include:

- The diff command and commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings, because the two axes are deliberately separate (see _Why two axes_).

End with a summary: total findings per axis, worst issue within each axis, and any latent architectural risks discovered.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.

---

## 6. PR Feedback Resolution & Pre-Push Quality Gate

Standardized workflow for addressing review comments and resolving PR conflicts (*pr-feedback-quality-gate*):

1. **Inspect PR Status & Working Branch**:
   - Review incoming comments, CI/CD checks, mergeability, and local worktree state.
   - Ensure unrelated local changes do not pollute the pull request.
2. **Use Isolated Worktrees**:
   - If the local branch is dirty or behind `main`, spawn an isolated git worktree for conflict resolution or review fixes.
3. **Surgical Fixes with Root Cause Resolution**:
   - Fixes must be targeted to prevent regressions, but must resolve the root cause rather than adding superficial band-aids.
4. **Read-Only Cross-Review Before Push**:
   - Before committing or pushing, perform a read-only cross-review against staged diffs.
   - Forbid file modification commands during cross-review.
5. **PR Follow-up Report**:
   - Provide a clear summary: PR status, fixes applied, validation verdict, pushed commit SHA, and residual risks.
