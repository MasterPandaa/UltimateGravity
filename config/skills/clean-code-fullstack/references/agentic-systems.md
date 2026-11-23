# Agentic Systems & Production LLM Infrastructure

> Engineering standards for AI agent framework selection, dynamic temporal knowledge graphs, and OpenTelemetry observability in backend architectures.  
> Grounded in `PydanticAI`, `Google ADK`, `LangGraph`, `getzep/graphiti`, `topoteretes/cognee`, `langfuse/langfuse`, and `comet-ml/opik`.

---

## 1. Production AI Agent Framework Selection Rubric

### A. The 4 Tier-1 Production Framework Archetypes
| Architecture Need | Recommended SDK | Core Primitives & Strength | When to Choose |
|---|---|---|---|
| **Python Type-Safe & Zero-Bloat** | **`PydanticAI`** (`pydantic-ai`) | `Agent`, `RunContext[Deps]`, native Pydantic schema validation, Logfire tracing | Standard backend Python services requiring strict typing, dependency injection, and zero legacy abstraction overhead. |
| **Gemini & Multi-Language Enterprise** | **Google ADK** (`adk.dev` / `google/adk`) | Code-first agent design, Gemini 2.0/3.0 native optimization, Vertex AI/Cloud Run integration, built-in eval harness | Applications centered on Gemini models, multi-language teams (Python, TypeScript, Go, Java), and enterprise testability. |
| **Cyclical Stateful Workflows** | **`LangGraph`** (`langgraph`) | Directed graph state machine, cyclical node loops, human-in-the-loop, time-travel memory checkpointing | Complex agent workflows with conditional branching, persistent state across user sessions, and recursive self-correction loops. |
| **Lightweight Multi-Agent Handoffs** | **OpenAI Agents SDK** (`openai-agents-python`) | `Agent`, `Handoff`, input/output `Guardrails` | Swarm-style multi-agent delegation where specialized sub-agents pass control directly via function handoffs. |

### B. Core Engineering Invariants for Agent Applications
1. **Schema Validation on All Agent Outputs**:
   - Never trust unparsed raw LLM text in backend services. Every agent response consumed by downstream code must be validated via strict Pydantic (Python) or Zod (TypeScript) schemas.
2. **Explicit Dependency Injection**:
   - Tool functions must not read ambient global variables or hidden state. Inject database connections, HTTP clients, and user auth context explicitly via execution contexts (e.g. `RunContext[Deps]` in PydanticAI or ADK Context).
3. **Bounded Tool Execution SLA**:
   - Every tool call invoked by an agent must specify hard timeouts (default $\le 10$s) and bounded retries with jitter to prevent agent hang conditions.

---

## 2. Agentic Knowledge Graph & Temporal Memory Architecture

> Absorbed from `getzep/graphiti` & `topoteretes/cognee`. Standards for dynamic, temporal, and deterministic agent memory graphs.

### A. Deterministic Ontology Blueprinting (Cognee Pattern)
1. **Schema-Constrained Graph Extraction**:
   - Strictly prohibit unconstrained, free-form LLM entity and relation extraction (which causes ontology hallucination and relation explosion).
   - Enforce explicit Pydantic / Zod schemas defining allowable Node types (`Entity`, `Concept`, `Session`, `User`) and strict Edge predicate types (`AUTHORED`, `DEPENDS_ON`, `REVOKED`, `PREFERS`).
   - Validate LLM extraction through structured output schemas before persisting to graph storage:
     ```python
     class KnowledgeGraphDelta(BaseModel):
         nodes: list[TypedNode]
         edges: list[TypedEdge]
     ```

### B. Bi-Temporal State & Causal Invalidation (Graphiti Pattern)
1. **Bi-Temporal Modeling**:
   - Every graph edge and state assertion must track two independent time dimensions:
     - `valid_time`: The real-world timeframe during which the assertion holds true (`valid_at`, `invalid_at`).
     - `transaction_time`: The system timestamp when the fact was recorded in the database (`recorded_at`).
2. **Causal Fact Invalidation**:
   - Knowledge in multi-turn agent interactions and codebases changes continuously (e.g. "System used PostgreSQL in v1.0, migrated to SQLite in v2.0").
   - When a contradicting or updating edge arrives, never delete historical edges. Instead, mutate `invalid_at = now()` on the predecessor edge and insert the successor edge with `valid_at = now()`.
   - Anchor graph mutations to an `episode_id` for causal provenance, timeline reconstruction, and deterministic audit trails.

### C. Embedded Zero-Daemon Storage Profile (Host Resource Conservation)
1. **Lightweight Graph Primitives**:
   - For agent local memory on resource-constrained hosts (e.g. 8GB RAM), prohibit persistent external graph database daemons (Neo4j, FalkorDB) that consume 500MB–2GB+ idle RAM.
   - Utilize embedded, zero-daemon storage engines:
     - **Graph Traversal**: In-memory `networkx` or `rustworkx` backed by SQLite adjacency tables (`source_id`, `target_id`, `predicate`, `valid_at`, `invalid_at`).
     - **Embedded Vectors & Relations**: DuckDB (`duckdb-vss`), SQLite (`sqlite-vec`), or embedded LanceDB for co-locating vector embeddings and relational entities in single-file storage.

---

## 3. Production LLM Observability & OpenTelemetry Invariants

> Absorbed from `langfuse/langfuse` & `comet-ml/opik`. Standards for non-blocking telemetry, hierarchical trace trees, and cost governance in AI backend systems.

### A. Hierarchical Trace & Span Trees
Structure agent executions into strict OpenTelemetry (OTel) hierarchical spans:
$$\text{Trace (User Session / Task Run)} \longrightarrow \text{Span (Agent Turn)} \longrightarrow \text{Span (LLM Call)} \longrightarrow \text{Span (Tool Execution)}$$

1. **Root Trace**: Encapsulates the complete user interaction or background job from input to terminal resolution.
2. **Turn Span**: Tracks individual reasoning cycles (input context assembly $\rightarrow$ model response $\rightarrow$ tool dispatches).
3. **LLM Span**: Bounded strictly to model inference time, capturing prompt tokens, completion tokens, model ID, temperature, and finish reason.
4. **Tool Span**: Tracks individual external side effects (HTTP fetch, DB query, shell execution) with execution duration in milliseconds.

### B. Mandatory Span Accounting Attributes
Every LLM and Tool span emitted by backend services must record 4 orthogonal metadata blocks:
1. **Token Accounting**:
   `gen_ai.usage.prompt_tokens`, `gen_ai.usage.completion_tokens`, `gen_ai.usage.total_tokens`, `gen_ai.request.model`.
2. **Financial Cost Attribution**:
   Compute exact monetary cost (USD) for each completion using deterministic pricing matrices per million tokens. Never rely on estimation or untracked invocations.
3. **Execution Latency SLA**:
   Record `duration_ms` per span. Enforce latency alerting if tool execution exceeds $\text{SLA} > 500\text{ms}$ or LLM TTFT (Time-To-First-Token) exceeds $2000\text{ms}$.
4. **Data Sanitization & Privacy**:
   Strip all authorization headers, session cookies, plaintext passwords, and PII before serializing input/output payloads to telemetry collectors.

### C. Non-Blocking Asynchronous Export Invariant
- Tracing and telemetry dispatching must **never** block the primary user-facing request path.
- Dispatch telemetry exclusively through in-memory non-blocking ring buffers or background queues (e.g., OpenTelemetry BatchSpanProcessor).
- Telemetry instrumentation overhead must not exceed $5\text{ms}$ on critical application paths.

---

## 4. Multi-Session Long-Running Agent Harness & Shift-Change Architecture (Absorbed from `anthropics/cwc-long-running-agents`)

When autonomous agents tackle complex multi-hour projects across multiple turns and context windows, they encounter the **Shift-Change Problem**: context rot, loss of working memory across restarts, and premature declaration of victory.

### A. The Two-Agent Lifecycle Pattern
Decompose long-running projects into two distinct agent roles:

1. **Initializer Agent (Session 1 Only)**:
   - *Scope Assessment*: Reads the master PRD/specification and maps external dependencies.
   - *Scaffolding & Baseline*: Creates directory structures, basic boilerplate, and initial deterministic scripts (`init.sh` / `init.ps1`).
   - *Granular Feature Decomposition*: Decomposes requirements into an exhaustive, checkable feature list (`feature-checklist.json` or Markdown checklist) with 100% testable acceptance criteria.
   - *Base Commit*: Takes an initial git commit establishing the verified starting baseline.
2. **Coding Agent (Sessions 2..N)**:
   - *Context Priming*: At the start of each new session, reads only the durable state artifacts (`progress.md`, git log, feature checklist) rather than re-reading the entire codebase.
   - *Environment Verification*: Runs the initialization script to ensure local daemons, test suites, and compilers are ready.
   - *Incremental Feature Implementation*: Picks the next uncompleted feature from the checklist, executes surgical edits (< 50 LOC/step), verifies via live test suites, and captures a clean atomic git commit.
   - *Anti-Premature-Completion Gate*: Prohibited from claiming completion until 100% of checklist items pass automated verification.

### B. Durable State Artifact Invariants
To preserve state across context resets without token bloating:
1. **`progress.md`**:
   - Updated at the end of every agent turn/session. Contains: (1) what was completed, (2) current blockers or error traces, (3) immediate next target task.
2. **`feature-checklist.json`**:
   - Machine-readable status of every functional requirement (`status: pending | in_progress | completed`, `testCommand`, `verifiedExitCode`).
3. **Atomic Git Commit Cadence**:
   - Every successfully verified feature produces exactly one atomic git commit. If a coding agent gets stuck or introduces regressions, rollback to the previous commit is instantaneous.

### C. Single-Feature Bounding & Automated Rollback Protocol (Anthropic March 2026 Research)
1. **Strict Single-Feature Bounding**:
   - Each coding agent session is hard-capped to implementing and verifying **exactly one feature** from the checklist.
   - Batching multiple features in a single session is strictly prohibited: it inflates git diff size, obscures root-cause attribution when tests fail, and accelerates context rot.
2. **Automated Rollback on Verification Failure**:
   - If unit, integration, or visual tests fail, forward-patching on the corrupted workspace is strictly prohibited.
   - The agent must immediately execute git checkout / revert to the pre-turn commit, formulate an inverted counterfactual hypothesis, and retry clean from the baseline.
3. **Visual Playwright Assertion Gate**:
   - For UI-facing features, running compilers (`tsc`) is insufficient. The evaluator agent must spin up a headless browser, execute user interaction steps via Playwright, and capture screenshot evidence to guarantee visual and functional correctness before taking the atomic git commit.

---

## 4. Multi-Agent Deliberation: Blind Cross-Examination Protocol

> **Pattern Origin**: Absorbed from `gaidar/agent-committee` (§8 External Proposal Protocol).

When complex architectural, trade-off, or high-blast-radius decisions require consensus among multiple agent perspectives or subagents:

### A. The 3-Round Deliberation Sequence
1. **Round 1: Blind Independent Proposals (Turn 1)**:
   - Each specialist or reviewer agent evaluates the problem statement independently in parallel isolation.
   - Outputs a structured position: `PROPOSAL`, `RATIONALE`, `CONFIDENCE` (0-100), and `RISKS`.
   - No agent sees the thoughts or arguments of the others during this round.
2. **Round 2: Anonymized Cross-Examination (Turn 2)**:
   - Proposals are aggregated and shuffled into anonymized labels (`Perspective A`, `Perspective B`, etc.), stripping vendor names, model identities, or agent roles to eliminate halo and authority biases.
   - Each agent reviews the anonymized pool and must explicitly:
     - **Attack**: Challenge tacit assumptions, unhandled edge cases, or cost/latency bottlenecks in competing proposals.
     - **Revise / Hold**: Update confidence score and defend or modify their initial stance based on new counterarguments.
3. **Round 3: Synthesized Decision Memo & Veto Gate (Turn 3)**:
   - The coordinator synthesizes points of consensus and divergent trade-offs into a single decision memo.
   - **Veto Gate**: Security and AppSec roles evaluate irreversible risks (data loss, auth bypass, legal exposure). A veto with a named failure mechanism halts execution and forces safer alternatives.

