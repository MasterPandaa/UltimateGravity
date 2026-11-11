# Zed-Inspired AST Outline Pruning & Zero-Bloat Host Memory Defense

Authoritative reference specification for structural AST outline extraction and zero-bloat runtime management. Inspired by the **Zed Editor** architecture (Tree-sitter structural AST indexing and GPUI resource efficiency).

---

## 1. Problem Statement: The 300+ Line Anti-Pattern

In autonomous agent operations, inspecting source files greater than 300 lines by dumping entire file bodies into the LLM context window causes severe system failure:

1. **Context Window Inflation & Quadratic Self-Attention Cost**: A single 500-line source file consumes $\approx 3,000\text{--}4,500$ tokens. In multi-turn debugging sessions, repetitive reads saturate the working memory and dilute attention sharpness (*needle-in-a-haystack degradation*).
2. **Context Rot**: Large blocks of irrelevant implementation details pollute the conversational working set (Tier 0), evicting critical architecture decisions and active error signatures.
3. **Host Resource Contention (Windows 8GB RAM Constraint)**: Loading massive files in memory while dev servers, Electron IDE shells, and background test runners are active triggers RAM paging/thrashing.

---

## 2. The Zed Architecture Insight: Structural AST Outlines

Zed achieves sub-millisecond responsiveness by prioritizing **Tree-sitter AST syntax outlines** over raw text scanning. Symbols, signatures, and hierarchy are parsed into structural nodes before function bodies are even rendered.

In Antigravity, we adopt this exact principle via **Progressive AST Skeleton Extraction**:

```
┌─────────────────────────────────────────────────────────────┐
│ RAW FILE (> 300 lines / ~4,000 tokens)                      │
│ [Implementation details, loop bodies, internal logic]      │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ast-outline.js / Structural Parser
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ AST SKELETON OUTLINE (~100–150 tokens)                      │
│ L32  | function estimateTokens(text)                        │
│ L79  | function measureSkillsCatalog()                      │
│ L140 | function measureStartupTokens(targetDir)             │
│ L249 | function auditInstructions(targetPath)               │
└──────────────────────────────┬──────────────────────────────┘
                               │
            Targeted read_file (StartLine/EndLine)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ SURGICAL EDIT BUFFER (±10 lines buffer, < 50 lines)         │
│ Edit root-cause directly with edit_file                     │
└─────────────────────────────────────────────────────────────┘
```

**Token Economy**:
$$\text{Savings} = 1 - \frac{\text{Skeleton Tokens} + \text{Target Window Tokens}}{\text{Raw File Tokens}} \approx 1 - \frac{120 + 350}{4000} \ge 88\%$$

---

## 3. Standard Operating Procedure (SOP)

When encountering any source file with more than 300 lines (enforcing `GEMINI.md` §3):

### Step 1: Run AST Outline Extraction
Execute the zero-dependency outline scanner:
```powershell
node C:\Users\Luthfi\.gemini\scripts\ast-outline.js <path-to-source-file>
```
Supported extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, `.rs`.

### Step 2: Identify Target Symbol & Line Boundaries
Examine the output lines (e.g. `L140 | function measureStartupTokens(targetDir)`). Determine the relevant line window.

### Step 3: Targeted Reading with Buffer
Invoke `read_file` with a $\pm 10$ line window:
```json
{
  "Path": "<path-to-source-file>",
  "StartLine": 135,
  "EndLine": 185
}
```

### Step 4: Surgical Mutation
Apply localized modifications using `edit_file`. Never perform full-file rewrites.

---

## 4. Host Memory Defense (8GB RAM Windows Invariants)

Inspired by Zed's zero-bloat runtime ethos, the agent must actively prevent memory exhaustion on Windows development laptops:

1. **Anti-Zombie Process Sweeping**: Terminate orphan Node.js, Chrome headless, or Playwright test runner processes after test suite completion.
2. **Lazy MCP Tool Activation**: Heavy MCP servers (>20 tools, e.g., Cloud suites) must remain inactive or lazy-loaded until explicitly requested.
3. **Subagent Lifecycle Gating**: Always clean up or kill completed subagents once artifacts and deliverables are synced. Do not leave background tasks unmonitored.

---

## 5. Document Structure Augmentation & Hierarchical Addressing (IBM STAIR Protocol)

> Grounded in the empirical research of arXiv:2609.03874 (*STAIR: Structure Aware Information Retriever*, IBM Research).

While AST outlines govern code files (`.ts`, `.py`, `.go`), technical documentation, architectural specifications, markdown guides, and rulebooks exceeding 300 lines suffer from **The Flat-Chunking Fallacy**. Traditional length-based chunking or unanchored keyword searches discard document hierarchy, inducing "lost-in-the-middle" hallucinations and causing agents to misinterpret localized rules as global invariants.

STAIR demonstrates that structuring retrieval via a hierarchical Table of Contents (ToC) addressing scheme raises Recall@1 to 82.6% and drops hallucination rates to **below 0.05%**.

### The 4-Step Document Structural Navigation Protocol

When inspecting any documentation, markdown spec, or rulebook > 300 lines:

#### Step 1: Structural Discovery Scan (ToC Outline)
Extract heading signatures without dumping full paragraph bodies into LLM context:
```powershell
powershell -Command "Select-String -Path '<path-to-doc>' -Pattern '^#{1,3}\s' | ForEach-Object { '{0,5}: {1}' -f $_.LineNumber, $_.Line }"
```

#### Step 2: Hierarchical Address Targeting
Construct the exact hierarchical address before reading:
$$\text{Address} = \text{[Document]} \to \text{[## Section]} \to \text{[### Subsection]}$$
Identify the starting line of the target subsection and the starting line of the next heading at equal or higher level.

#### Step 3: Bounded Context Read
Invoke `read_file` strictly within the target section boundaries with a $\pm 5$ line buffer. Never dump the entire markdown file.

#### Step 4: Parent Breadcrumb Anchor Invariant
- **Strict Prohibition**: Never cite, summarize, or apply a rule from a subsection in isolation.
- **Mandatory Anchor**: Always evaluate constraints within their parent section scope (e.g., verifying whether a testing heuristic applies strictly to unit tests or end-to-end flows).
