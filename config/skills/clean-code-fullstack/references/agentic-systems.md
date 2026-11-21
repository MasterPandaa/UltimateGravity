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
