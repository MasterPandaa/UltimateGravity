<div align="center">
  <img src="assets/banner.jpg" alt="UltimateGravity Banner" width="100%" />
  <br /><br />
  <h1>UltimateGravity</h1>
  <p><strong>Quad-Role Autonomous Engineering & Frontier Self-Evolving Agent System for Google Antigravity</strong></p>
  <p><em>Anti-AI Slop Humanization, Modern Web & Stageshow Craft, AppSec Sentinel with Unilateral Veto, Universal Context Packets, & Dynamic MCP Profiling</em></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
  [![Platform: Google Antigravity](https://img.shields.io/badge/Platform-Google%20Antigravity-4285F4.svg?style=flat-square)](https://deepmind.google)
  [![Architecture: Quad--Role](https://img.shields.io/badge/Architecture-Quad--Role%20Autonomous-00C853.svg?style=flat-square)](GEMINI.md)
  [![Release: v6.0.0](https://img.shields.io/badge/Release-v6.0.0%20Canonical-FF6D00.svg?style=flat-square)](CHANGELOG.md)
  [![Environment: Windows Native](https://img.shields.io/badge/OS-Windows%2010%2F11-0078D6.svg?style=flat-square)](install.ps1)
</div>

---

## ⚡ The Pain vs. The Fix

| Without UltimateGravity (Standard AI Assistants) | With UltimateGravity v6.0.0 |
|---|---|
| **AI Slop & Generic Tropes**: Verbose boilerplate, empty adjectives (*"blazing fast"*, *"game-changing"*), decorative non-functional gradients, and robotic copy. | **Anti-AI Slop & 10-Pass Refactoring**: 3 diagnostic tests (*Topic-Swap*, *"So What?"*, *Real Reader*) + Pass 0 Design Archetypes (*Corporate Clean*, *Brutalist*, *Playful*, *Dev Minimal*, *Luxury*) and sequential UI refactoring (*Spacing ➔ Color ➔ Icons ➔ Copy ➔ Type ➔ Layout ➔ Details ➔ Visuals ➔ Motion*). |
| **Context Rot & Quadratic Degradation**: Unbounded raw token accumulation in long sessions degrades model attention and skyrockets billing costs. | **Zero-Bleed Context Packets & AST Outlines**: Task DAG `--consumes` routes exact schema/contract slices, AST syntax skeleton pruning for files > 300 lines, and 3-Tier LSM compaction slashing latency by $3\times$ with up to $80\%$ KV-cache discounts. |
| **False-Positive Security Hallucinations**: Single-pass AI audits generate 40–60% false alarms, flagging unreachable vulnerabilities without working PoCs. | **AppSec Sentinel & Adversarial Auditing**: Dedicated `security-engineer` role with unilateral veto power, AST taint analysis (SQLi/RCE/command injection), and two-pass adversarial falsification disproving unexploitable findings. |
| **Telephone Game Bloat & Stale Instructions**: Fragmenting tasks across dozens of uncoordinated subagents causes context bleed, sync drift, and instruction conflicts. | **Solo Direct Primary Loop & Precedence Anchor**: Anthropic Applied AI standard folds 95% of workflows into a single high-speed agent loop with progressive disclosure; §4.B Codebase Precedence Anchor ensures live code overrides stale docs (arXiv:2610.30571). |
| **Tool Sprawl & Assumed Fixes**: Unlimited MCP tools crash 8GB RAM host environments; declaring completion without running verified code causes regressions. | **Dynamic MCP Profiling & Time-Travel Safety**: Dynamic profile switching (`mcp-profile`) maintaining $\le 150$ active tools on Windows 8GB RAM host; mandatory terminal exit code 0, live Edge dev sentinel, continuous shadow copies (`file-rewind`), and milestone snapshots (`step-checkpoint`). |

---

## 🚀 Quickstart (1-Click Setup)

Copy and run in PowerShell to provision the complete v6.0.0 canonical architecture into `~/.gemini`:

```powershell
# 1. Clone the master repository
git clone https://github.com/MasterPandaa/UltimateGravity.git
cd UltimateGravity

# 2. Run automated Windows installer
powershell -ExecutionPolicy Bypass -File .\install.ps1

# 3. Verify terminal tools
workspace-index scan
# => Scanned 37 skills, 4 specialist agents, and 23 CLI tools. Ready!
```

> [!NOTE]
> Restart Google Antigravity IDE or your active PowerShell terminal after installation to load the updated `PATH` and active rules.

---

## 📂 Codebase at a Glance

```text
UltimateGravity/
├── assets/
│   ├── banner.jpg               # Ultra-wide 21:9 official repository banner
│   └── banner.png               # Lossless high-fidelity visual asset
├── bin/                         # 23 cross-directory Windows CLI executables
│   ├── agy-exec.bat             # Persistent PowerShell session engine
│   ├── ast-outline.bat          # Structural skeleton extractor for files >300 lines
│   ├── browser-sentinel.bat     # Edge headless hydration & runtime crash probe
│   ├── compact-log.bat          # Session transcript & JSONL compressor
│   ├── file-rewind.bat          # Shadow-copy rollback engine
│   ├── harness-distiller.bat    # Friction log scanner & L0 <= 60 instruction distiller
│   ├── mcp-profile.bat          # Dynamic MCP profile switcher (<=150 tools)
│   ├── step-checkpoint.bat      # Atomic milestone snapshot engine
│   ├── task-dag.bat             # Dependency DAG engine with --consumes context packets
│   ├── win-memory-profile.bat   # Windows 8GB RAM handle & memory diagnostic probe
│   └── workspace-index.bat      # Sub-350ms incremental repository topology scanner
├── config/
│   ├── agents/                  # 4 Core Specialist autonomous roles
│   │   ├── fullstack-developer  # Modern Web, GSAP motion, Vercel guidelines, SQL
│   │   ├── qa-engineer          # DeepSec 2-pass audit, Playwright E2E, BVA heuristics
│   │   ├── data-engineer        # Scrapling, Firecrawl, ETL pipelines, ERD models
│   │   └── security-engineer    # AppSec Sentinel, AST taint analysis, unilateral veto gate
│   ├── hooks/                   # Deterministic lifecycle hooks (syntax, watermark, cleanup)
│   └── skills/                  # 37 curated Tier 1 engineering SOPs
├── scripts/                     # Node.js & PowerShell background automation engines
│   ├── ast-outline.js           # Structural skeleton extractor for large source files
│   ├── compact-log.js           # JSONL log trimmer & transcript pruner
│   ├── harness2.js              # Google Harness2 8-component open-world engine
│   ├── harness-distiller.js     # L0 prompt distillation & session discovery
│   ├── mcp-profile.js           # Lightweight MCP profile manager
│   ├── token-optimizer.js       # Turn-0 token auditor & progressive disclosure linter
│   ├── win-memory-profile.ps1   # Native Windows process memory analyzer
│   └── workspace-indexer.js     # Incremental project topology mapper
├── tools/watermarks-remover/    # Native C2PA, EXIF, and AI watermark stripper
├── GEMINI.md                    # Canonical Quad-Role governance rules & token budgets
├── CHANGELOG.md                 # Master canonical evolution record (v1.0.0 -> v6.0.0)
└── install.ps1                  # Idempotent 1-click Windows installer (~170 lines)
```

---

## 🏛️ System Topology & Execution Flow

```mermaid
flowchart TD
    User["User Task Request"] --> Gate{"Workload Blast Radius"}
    
    Gate -->|"Light or Medium (under 100 lines)"| Solo["SOLO DIRECT MODE (Main Agent)<br/>Surgical Edits, Bugfixes, UI Craft, Query Tuning<br/>Sub-second latency, zero token waste"]
    Gate -->|"Greenfield, Massive Scope, or Security Gate"| Squad["SUBAGENT SQUAD DELEGATION<br/>Raven Execution Plane & Disjoint Ownership<br/>Mandatory Step 0 Fail-Closed Skill Ingestion"]
    
    Squad -->|"Security Audit / High Blast Radius"| SecGate{"Security Sentinel Veto Gate<br/>AST Taint Analysis & CWE Checks"}
    SecGate -->|"Veto Triggered"| SecReject["Unilateral Veto Halt<br/>Remediation Mandatory before Merge"]
    SecGate -->|"Approved"| ContextPkt["Zero-Bleed Context Packets<br/>task-dag --consumes Schema Routing"]
    
    Solo --> Watchdog["Pre-Emptive Watchdog<br/>PostToolUse Syntax Linter & Edge Sentinel Probe"]
    ContextPkt --> Watchdog
    
    Watchdog --> Verify{"Iron Law: Exit Code 0?"}
    Verify -->|"Failed"| CircuitBreaker{"Failure Count Under Limit?"}
    CircuitBreaker -->|"Retry"| SelfHeal["Scientific Diagnosis Loop<br/>Hypothesis testing & seam regression fix"]
    SelfHeal --> Watchdog
    CircuitBreaker -->|"Exceeded"| Escalate["Circuit Breaker Halt<br/>Escalate via ask_question"]
    
    Verify -->|"Passed"| Deliver["Clean Delivery<br/>Auto-Sanitizer C2PA/EXIF & Master Changelog Entry"]
```

---

## 👥 Roster: 4 Core Specialist Roles

The system operates across **4 Core Specialist Roles** with zero bureaucratic overhead:

### 1. Full Stack Developer (`fullstack-developer`)
- **Frontend Craft & Vercel Standards**: React, Next.js SSR hydration safety, high-contrast `:focus-visible` rings, $44 \times 44\text{px}$ touch targets, hardware notch safe-area insets (`env(safe-area-inset-bottom)`), and `font-variant-numeric: tabular-nums` to eliminate layout jitter.
- **Stageshow & Motion Architecture**: Asymmetric Bento grids (1 dominant Hero Card + 2–3 compact supporting cards), realistic macOS/device window shells, and `@gsap/react` `useGSAP()` lifecycle-safe tweens (zero memory leaks, strict GPU transform compositing).
- **Backend & Systems**: High-performance REST, GraphQL, and gRPC design (`api-contract-design`), clean layered architecture, structured error envelopes, and strict runtime validation (Zod/Pydantic).
- **Data Layer & ORM**: Relational schema design, safe migrations, composite indexes, query profiling via `EXPLAIN ANALYZE` (`sql-optimization`), and ACID transactions.
- **Surgical Precision**: Advanced type contracts (`typescript-pro`), anti-complexity guidelines (`karpathy-guidelines`), and native Windows automation (`powershell-windows-patterns`).

### 2. Quality Assurance & SDET (`qa-engineer`)
- **DeepSec Two-Pass Adversarial Audit**: Pass 1 Taint Source-to-Sink vulnerability tracing paired with Pass 2 Adversarial Falsifier review to eliminate false alarms.
- **Testing Strategy**: Boundary Value Analysis (BVA), Equivalence Partitioning, Decision Tables, and comprehensive test matrices (`qa-skills`).
- **Browser Automation & E2E**: Playwright headless browser suites (`playwright-cli`), layout overflow detection, network request tracing, and visual regression testing.
- **Scientific Diagnosis & TDD**: 4-step hypothesis testing loop (`diagnosing-bugs`) with $\le 3$ attempt circuit breaker (`TokenEconomizer`), and test-first interface seam cycles (`tdd`).
- **Testing Integrity**: Absolute proof enforcement (`verification-before-completion`), flaky test purging (`test-antipatterns`), and desktop memory leak profiler (`memory-leak-detector`).

### 3. Data Engineer (`data-engineer`)
- **Multi-Tier Web Scraping**: Scrapling (stealth browser, anti-bot bypass, headless) and Firecrawl for block-free structured extraction (`agent-reach`).
- **Data Modeling & Warehousing**: Entity-Relationship Diagrams (ERD), OLTP transactional and OLAP analytical schemas, normalization/denormalization.
- **SQL Profiling & Tuning**: Deep composite indexing, analytical query tuning, I/O bottleneck elimination, and query planning (`sql-optimization`).
- **ETL Pipelines & Automation**: Ingestion scripts, data transformation, deduplication, runtime schema validation, and Windows pipeline automation (`powershell-windows-patterns`).

### 4. Security & AppSec Sentinel (`security-engineer`)
- **AppSec Sentinel & Unilateral Veto**: Unilateral veto power over PRs and release builds with zero bypass on unmitigated critical/high vulnerabilities.
- **Multi-Tier Leak Defense**: Memory leaks (Windows handle exhaustion, V8 heap bloat), token leaks (Turn-0 bloat, prompt inflation), data/credential leaks (zero plaintext secrets, regex scans), and injection taint (SQLi, RCE, command injection via AST analysis).
- **Adversarial Security Auditing**: OWASP Top 10, API Security Top 10, CWE standards, live CVE correlation via CISA KEV (`windows-security-audit`), and supply-chain lockfile audits.
- **Runtime Syntax & Watchdog Hooks**: Pre-commit AST linting, deterministic syntax error trapping, and background session sanitization.

---

## 💻 23 Global CLI Commands

After installation, these commands can be called directly from any terminal or PowerShell prompt:

| Command | Subsystem | Function & Architecture | Example Syntax |
|---|---|---|---|
| `file-rewind` | Qoder Engine | Continuous shadow-copy versioning & instant file rollback | `file-rewind list src/index.ts`<br>`file-rewind rollback src/index.ts` |
| `step-checkpoint` | Devin Snapshot | Atomic workspace milestone snapshots & differential diffs | `step-checkpoint create v1`<br>`step-checkpoint diff v1` |
| `task-dag` | DAG State Machine | Dependency-aware execution graph (`blockedBy`) & context packets (`--consumes`) | `task-dag list`<br>`task-dag add T1 "Build API" --consumes "T0:schema"` |
| `ast-outline` | Zed Architecture | Structural AST skeleton extractor for files >300 lines | `ast-outline src/server.ts` |
| `compact-log` | Log Compactor | Session transcript & JSONL pruner to maintain lean context | `compact-log transcript.jsonl` |
| `mcp-profile` | Tool Gatekeeper | Dynamic MCP switcher keeping active tools $\le 150$ on 8GB RAM host | `mcp-profile switch cloud`<br>`mcp-profile status` |
| `win-memory-profile` | Windows Sentinel | Desktop memory, handle leaks, and GDI exhaustion profiler | `win-memory-profile` |
| `workspace-index` | Rust Scanner | Sub-350ms incremental pre-prompt topology scanner | `workspace-index scan` |
| `browser-sentinel` | Devin Sentinel | Edge engine dev-server probe & React hydration crash detector | `browser-sentinel probe http://localhost:3000` |
| `harness-distiller` | Harness-Zero | Friction log scanner & instruction distiller ($L_0 \le 60$ lines) | `harness-distiller scan`<br>`harness-distiller distill` |
| `harness2` | Google Harness² | 8-component open-world tree audit & Persistent Improvement Library | `harness2 tree`<br>`harness2 status` |
| `rrsi-eval` | Google RRSI | 5-Gate mathematical safety floor & cross-model invariant audit | `rrsi-eval gate-check` |
| `raven-dispatch` | Raven DAG | Collision-free subagent DAG partitioning & context barrier | `raven-dispatch plan` |
| `repo-wiki` | Fast Topology | Rust-powered `fd.exe` repository architecture summarizer | `repo-wiki generate` |
| `clean-file` | Watermark Sanitizer | Strips C2PA, EXIF, and AI steganographic artifacts from files | `clean-file "diagram.svg"`<br>`clean-file "report.pdf" -InPlace` |
| `agy-exec` | Persistent Shell | Stateful PowerShell runner preserving CWD, venvs, and variables | `agy-exec "Get-ChildItem"` |
| `skill-usage` | Telemetry | Invocations heatmap & dead skill pruning candidate detector | `skill-usage summary` |
| `tier-manager` | Governance | Archives or activates skills and agent profiles on-demand | `tier-manager list` |
| `token-optimizer` | Token Guard | Turn-0 token auditor & progressive disclosure linter | `token-optimizer audit` |
| `fd` | Native Rust Binary | High-performance filesystem search engine | `fd -e tsx` |

---

## 🔬 Benchmark & Frontier Research Integration

- **Google Research Harness² (arXiv:2610.14224)**: 8-component modular tree (`c1` Prompt, `c2` Rules, `c3` Memory, `c4` Skills, `c5` Tools, `c6` Scripts, `c7` Agents, `c8` Hooks), Propose-Probe-Compose (PPC) cycle for open-world tasks without ground-truth verifiers, and cross-task Persistent Improvement Library.
- **Google Research RRSI & MaD-RSI (arXiv:2610.28201)**: Mathematical safety gates ($S' \ge S^* - \delta$) and cross-model failure matrices ensuring invariant stability across Gemini, Claude, and DeepSeek.
- **Codebase Ground-Truth Precedence (arXiv:2610.30571)**: Grounding principle where live repository source code and verified test suites strictly override stale documentation or outdated instructions.
- **Universal Context Packet Routing (arXiv:2611.06500)**: Subagent task routing utilizing structured context packets to eliminate context bleed and prevent telephone-game information loss.
- **Harness-Zero Distiller (arXiv:2609.24972)**: Dynamic session discovery that prunes prompt bloat into lean $L_0 \le 60$ line specifications.
- **Vercel DeepSec (`vercel-labs/deepsec`)**: Two-pass adversarial security revalidation slashing single-pass false positives by 40–60%.
- **3-Tier LSM Active Context Pruning (`ranxianglei/billion-context`)**: Log-Structured Merge context compaction bounding active token volume to 50,000–150,000 tokens for $3\times$ latency reduction and up to 80% KV-cache cost savings.
- **Microsoft TokenEconomizer (`microsoft/TokenEconomizer`)**: $\le 3$ attempt circuit breaker halting runaway speculative edit loops before token exhaustion.
- **Damir Sokolovsky Unslop (`heydamir/unslop`)**: 10-pass sequential UI refactoring pipeline with Pass 0 Design Archetypes eliminating multi-variable CSS churn.
- **Benji Taylor Stageshow (`benjitaylor/skills`)**: Asymmetric bento grids, window/device shells, and `@gsap/react` `useGSAP()` zero-leak motion choreography.
- **Harness Engineering & Goal Loop (`shareAI-lab/learn-claude-code`)**: Dissected harness mechanisms around the primary loop: 4-tier hierarchical context compaction, task-bound ephemeral git worktrees for parallel subagents, and independent Goal Evaluator termination gating.
- **Skill Judge & Architecture Tracing (`shareAI-lab/lab-skills`)**: 5-dimension diagnostic rubric for agent skill health (Timing, Density, L0 Budget, Freedom, Verification) and source-level architectural investigation.

---

## 🛠️ Optional Heavyweight Extensions

To preserve a featherweight repository footprint (< 15 MB), install specialized tooling on demand:

```powershell
# OWASP Automated Pentesting Scanner
winget install projectdiscovery.nuclei

# High-Performance Web Crawler
go install github.com/projectdiscovery/katana/cmd/katana@latest

# Playwright Headless Browser Automation
npx playwright install

# Scrapling Stealth Anti-Bot Web Scraper
pip install scrapling
```

---

## 📋 System Requirements

- **Operating System**: Windows 10 / Windows 11 (64-bit)
- **Runtimes**: [Node.js](https://nodejs.org) v18+ (LTS) & [Python](https://python.org) 3.10+
- **Shell**: PowerShell 5.1 (Built-in) or PowerShell 7+ (Recommended)
- **Host Platform**: Google Antigravity IDE / AGY CLI

---

## 📄 License & Attribution

Distributed under the [MIT License](LICENSE). Built by the **UltimateGravity Engineering Team** for the Google Antigravity frontier agent ecosystem.
