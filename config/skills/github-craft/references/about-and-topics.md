# About Description, Topics Strategy & Indexing Engine

> Engineering specification for crafting evergreen repository descriptions, algorithmic topic sets, and accelerating Googlebot search indexing.

---

## 1. The Evergreen About Formula

The repository "About" field is the first hook a developer sees in GitHub search results, Twitter cards, and Google search snippets. It must convert interest in $\le 3$ seconds.

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
   - *Good*: *"Production harness with verified execution, no assumed fixes..."*
   - *Bad*: *"The uncompromising production harness with zero hallucinations..."* (Unfalsifiable / hyperbolic!)
4. **Scope / Grounding**: Ground the target audience in reality.
   - *Good*: *"...and clean engineering craft."*

### What to Strictly Avoid (The Volatility Anti-Patterns)
- ❌ **No Version Numbers**: Never include `(v4.7.0)` or `v6.0.0` in the About description.
- ❌ **No Volatile Architecture Names**: Do not mention specific role counts (e.g., *"Quad-Role"* or *"Tri-Role"*) because roles may be added or refactored later.
- ❌ **No Ephemeral Tool/Skill Counts**: Never write *"35+ skills"* or *"18 CLIs"*; inventory numbers drift rapidly.
- ❌ **No Unfalsifiable Superlatives**: Ban generic claims like *"zero hallucinations"* or *"the best AI assistant ever"*.
- ❌ **No Circular Homepage Links**: Never set the Homepage field to `#readme` or the repo's own URL; point to external documentation, portfolio, or leave empty (`homepage: null`).

---

## 2. The 20-Topic Algorithmic Strategy (SEO & Discoverability)

GitHub allows a **maximum of 20 topics** per repository. Exceeding this triggers an HTTP 422 API rejection. Aim for **15–18 curated topics** following this 3-tier distribution:

### The 3-Tier Topic Mix
1. **Tier 1: High-Volume Macro & Platform Topics (4–5 tags)**
   - Broad categories indexed heavily by Google and GitHub Explore:
   - Examples: `developer-tools`, `software-engineering`, `fullstack`, `windows`, `gemini`.
2. **Tier 2: High-Intent Trending AI/Agent Keywords (8–10 tags)**
   - Specific terms developers actively search for:
   - Examples: `coding-agent`, `ai-agents`, `autonomous-agents`, `agentic-workflows`, `mcp`, `code-generation`, `local-first`, `powershell`.
3. **Tier 3: Differentiating Capabilities (3–4 tags)**
   - Specific keywords highlighting unique engineering superpowers:
   - Examples: `appsec`, `playwright`, `clean-code`, `benchmarks`.

> [!WARNING]
> Avoid self-coined terms with zero search volume (e.g., `quad-role`, `anti-slop`, `harness-engineering`). Every topic slot must carry measurable search intent.

---

## 3. Googlebot Indexing & Profile Pinning Protocol

### Why Google Search Does Not Index Brand-New Repositories Immediately
- **GitHub Search vs. Google Search**: GitHub searches internal databases in real time. Google Search relies on web crawler queues (*crawl lag*), which take between **3 to 14 days** to discover new URLs without external links.
- **The "Ringkasan AI / AI Overview" Trap**: If Google AI Overview is queried for a new repo before Googlebot crawls it, the AI hallucinates that the repo is *"privat, dihapus, atau salah ketik"*. This is a known search artifact, not a repo defect.

### 3-Step Google Indexing Accelerator
To force Googlebot to discover and index the repository within 24–48 hours:
1. **Pin on GitHub Profile**: Immediately pin the repository on the author's GitHub profile (`https://github.com/<owner>`). The owner's profile is already indexed and regularly recrawled by Googlebot.
2. **Link in Profile README**: Add a flagship card linking to the repository in the special `owner/owner` profile README.
3. **Seed External Backlinks**: Post a single announcement link on high-crawl-frequency developer platforms (Twitter/X, Reddit `r/ChatGPTCoding` or `r/LocalLLaMA`, LinkedIn, Dev.to). Googlebot follows social links within hours.

---

## 4. Automation via GitHub CLI

```powershell
# 1. Update Description and Clear Circular Homepage
gh repo edit <owner>/<repo> `
  --description "Turns Google Antigravity into an autonomous software engineer that tests and proves its own code. Production harness with verified execution, no assumed fixes, and clean engineering craft." `
  --homepage ""

# 2. Set Topics Deterministically (Overwriting Previous List)
$topics = @(
    "agentic-workflows",
    "ai-agents",
    "appsec",
    "autonomous-agents",
    "benchmarks",
    "clean-code",
    "code-generation",
    "coding-agent",
    "developer-tools",
    "fullstack",
    "gemini",
    "google-antigravity",
    "local-first",
    "mcp",
    "playwright",
    "powershell",
    "software-engineering",
    "windows"
);
$body = @{ names = $topics } | ConvertTo-Json;
$body | gh api -X PUT repos/<owner>/<repo>/topics --input -
```
