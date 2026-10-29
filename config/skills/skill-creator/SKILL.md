---
name: skill-creator
description: "[Standardized Agent Skill Architect & Consolidator] Guide to authoring, structuring, and consolidating agent skills (SKILL.md) compliant with the 10 Skill Rules. DO NOT USE for discovering third-party skills (use find-skills)."
---

# Skill Creator

Provides the definitive protocol for creating modular, high-impact skills that integrate smoothly into the Antigravity ecosystem without bloating the context window.

## Skill Structure Standard

A valid Antigravity skill directory requires:
```text
skills/<skill-name>/
├── SKILL.md              # Mandatory: Main instructions + YAML frontmatter
├── references/           # Optional: Bulky manuals, cheat-sheets, deep API specs
├── scripts/              # Optional: Reusable shell or python utility scripts
└── examples/             # Optional: Concrete code snippets and test fixtures
```

## Frontmatter Rules
```markdown
---
name: lowercase-hyphenated-name
description: >-
  Actionable 2-3 sentence description. Clearly state WHAT the skill does and
  EXACTLY WHEN the agent should activate it. Written in third-person.
---
```

## 4 Golden Rules for Skill Authoring

1. **Progressive Disclosure**:
   - The primary prompt only loads `name` and `description`.
   - Keep `SKILL.md` concise (< 200 lines). Put lengthy technical documentation into `references/*.md` and link to them using relative markdown paths.
2. **Deterministic Trigger Conditions**:
   - In the `description`, specify the exact contexts, file types, or user requests that should trigger the skill.
3. **Actionable Procedures over Theory**:
   - Don't lecture the model on basic programming principles it already knows.
   - Provide concrete tables, workflow steps, CLI flags, and checklists.
4. **Verification Gate**:
   - Every skill must conclude with a "Done When" verification checklist that tells the agent how to prove the step succeeded with real evidence.

## 5. Writing for Agents: Context Pointers & Completion Criteria

Core principles for authoring actionable agent instructions (*writing-for-agents*):

1. **Context Pointers (Effective Skill Descriptions)**:
   - The skill description acts as the primary context pointer. Its opening keywords govern when the model loads the skill.
   - **Front-load the leading word**: Begin descriptions with concrete action verbs.
   - **One trigger per branch**: Omit redundant synonyms; specify distinct use-case branches.
2. **Completion Criteria & Demand**:
   - Establish sharp boundaries between *complete* and *incomplete* to prevent **premature completion**.
   - "Every modified model is verified" enforces exhaustive execution; compare with loose instructions like "list changes".
3. **Information Hierarchy**:
   - **In-file steps**: Mandatory sequential actions.
   - **In-file reference**: Operational rules or lookup tables referenced during execution.
   - **Disclosed reference**: Detailed specifications isolated in `references/*.md` loaded only when specific conditions are met.

## 6. Skill Consolidation Protocol (Chef Skills)

Standardized procedure for merging two or more skills sharing overlapping objectives:
1. **Identify Explicit Task Overlap**: Group skills that produce identical deliverables or artifacts.
2. **Preserve Core Value**: Retain tables, specialized rules, and utility scripts without altering functional context.
3. **Clean Single-Responsibility Naming**: Use one canonical skill name representing the primary task.
4. **Archive Deprecated Source Skills**: Relocate merged skills into `_legacy_archive/` to preserve historical integrity.
5. **Normalize & Validate**: Ensure valid YAML frontmatter (UTF-8 without BOM) and update references in `GEMINI.md`.
