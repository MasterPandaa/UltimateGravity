# About Description & Trending Topics Strategy

> Engineering specification for crafting evergreen repository descriptions and algorithmic GitHub topic sets.

---

## 1. The Evergreen About Formula

The repository "About" field is the first hook a developer sees in GitHub search results, Twitter cards, and community links. It must convert interest in $\le 3$ seconds.

### The 4-Part Evergreen Architecture
```
[1. Action Verb & Transformation] + [2. The Curiosity Hook] + [3. The Core Invariant] + [4. Scope]
```

1. **What It Does (Transformation)**: State the transformation immediately.
   - *Good*: *"Turns Google Antigravity into an autonomous software engineer..."*
   - *Bad*: *"A collection of tools and scripts for agents..."*
2. **The Curiosity Hook**: Highlight a counter-intuitive capability that developers wish existed.
   - *Good*: *"...that tests and proves its own code."*
   - *Bad*: *"...that helps you code faster."*
3. **The Core Invariant**: Emphasize the standard that will never change regardless of version evolution.
   - *Good*: *"The uncompromising production harness with zero hallucinations, no assumed fixes..."*
   - *Bad*: *"Packed with 4 specialist roles and 35 tools..."* (Volatile!)
4. **Scope / Grounding**: Ground the target audience in reality.
   - *Good*: *"...and real-world software craft."*

### What to Strictly Avoid (The Volatility Anti-Patterns)
- ❌ **No Version Numbers**: Never include `(v4.7.0)` or `v6.0.0` in the About description.
- ❌ **No Volatile Architecture Names**: Do not mention specific role counts (e.g., *"Quad-Role"* or *"Tri-Role"*) because roles may be added or refactored later.
- ❌ **No Ephemeral Tool/Skill Counts**: Never write *"35+ skills"* or *"18 CLIs"*; inventory numbers drift rapidly.
- ❌ **No Empty Fluff**: Ban generic claims like *"the best AI assistant ever"* or *"blazing fast tool"*.

---

## 2. The 20-Topic Algorithmic Strategy (SEO & Discoverability)

GitHub allows a **maximum of 20 topics** per repository. Exceeding this triggers an HTTP 422 API rejection. Aim for **15–18 curated topics** following this 3-tier distribution:

### The 3-Tier Topic Mix
1. **Tier 1: High-Volume Macro Topics (3–4 tags)**
   - Broad categories indexed on GitHub Explore:
   - Examples: `developer-tools`, `software-engineering`, `fullstack`.
2. **Tier 2: High-Intent Trending AI/Agent Keywords (8–10 tags)**
   - Specific terms developers actively search for:
   - Examples: `coding-agent`, `ai-agents`, `autonomous-agents`, `agentic-workflows`, `harness-engineering`, `mcp`, `code-generation`, `local-first`.
3. **Tier 3: Niche & Differentiating Capabilities (4–5 tags)**
   - Specific keywords highlighting unique engineering superpowers:
   - Examples: `anti-slop`, `appsec`, `playwright`, `clean-code`, `benchmarks`.

---

## 3. Automation via GitHub CLI

To set the description, homepage, and exact topics deterministically:

```powershell
# 1. Update Description and Homepage
gh repo edit <owner>/<repo> `
  --description "Turns Google Antigravity into an autonomous software engineer that tests and proves its own code. The uncompromising production harness with zero hallucinations, no assumed fixes, and real-world craft." `
  --homepage "https://github.com/<owner>/<repo>#readme"

# 2. Set Topics Deterministically (Overwriting Previous List)
$topics = @(
    "coding-agent",
    "ai-agents",
    "autonomous-agents",
    "agentic-workflows",
    "harness-engineering",
    "developer-tools",
    "software-engineering",
    "mcp",
    "appsec",
    "playwright",
    "fullstack",
    "clean-code",
    "anti-slop",
    "local-first",
    "code-generation",
    "benchmarks"
);
$body = @{ names = $topics } | ConvertTo-Json;
$body | gh api -X PUT repos/<owner>/<repo>/topics --input -
```
