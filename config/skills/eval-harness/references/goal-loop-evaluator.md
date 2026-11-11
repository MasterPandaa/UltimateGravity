# Goal Loop Evaluator & Autonomous Continuation Architecture

> **Pattern Origin**: Absorbed from `shareAI-lab/learn-claude-code` (Lesson s17 *Goal Loop*).  
> **Purpose**: Prevent premature session termination and enforce independent goal closure verification before returning control to the user.

---

## 1. The Core Problem: Premature Termination

Standard LLM agent loops follow a passive heuristic: when the model emits no `tool_use` blocks, the loop terminates and outputs final text.

This creates widespread **premature exit anomalies**:
- The agent writes code, encounters a compilation error, apologizes in text, and terminates without fixing it.
- The agent implements 2 out of 3 requested endpoints, declares "done", and stops.
- The agent assumes a bug fix works without running tests.

**The Goal Loop principle**: *The model decides what actions to take; the Goal Evaluator decides when the agent is allowed to stop.*

```
                 Agent Primary Loop
                         │
           Has tool_use? ├─── Yes ──► Execute Tool ──► Append Result ──┐
                         │                                              │
                         └─── No                                        │
                               │                                        │
                               ▼                                        │
                 [Goal Evaluation Gate]                                 │
                               │                                        │
             All Acceptance Criteria Met?                               │
                    /             \                                     │
                  Yes              No                                   │
                   │                │                                   │
                   ▼                ▼ (k < MaxRetries)                  │
             [Clean Exit]    Inject Evaluator Feedback                  │
                             "Goal incomplete: tests not run"           │
                                    │                                   │
                                    └───────────────────────────────────┘
```

---

## 2. Evaluation Criteria Matrix

Before allowing the session to terminate, the Goal Evaluator checks three mandatory invariants:

| Check Item | Validation Rule | Failure Action |
|---|---|---|
| **Subgoal Exhaustion** | Every deliverable listed in the initial user request or DAG must have a corresponding verification status. | Inject missing item reminder; prompt continuation. |
| **Evidence Grounding** | Every code change must have a corresponding fresh terminal execution with exit code 0. | Force execution of test/linter command. |
| **Silent Error Scan** | Response text must not contain unaddressed error logs, syntax warnings, or unresolved TODOs. | Instruct agent to isolate and remediate the error. |

---

## 3. Circuit Breaker & Escalation Policy

To prevent runaway infinite loops when a goal is mathematically or environmentally impossible:

1. **Maximum Auto-Continuations**: The Goal Evaluator permits at most $k = 3$ autonomous continuation injections per user instruction.
2. **Deterministic Failure Detection**: If the same command produces identical error hashes across 2 consecutive loops, the continuation is aborted.
3. **Escalation Trigger**: When the circuit breaker trips, the harness halts autonomous retries and invokes the `ask_question` tool with:
   - Root failure hypothesis.
   - Exact terminal log snippet.
   - Recommended alternative approaches for user selection.
