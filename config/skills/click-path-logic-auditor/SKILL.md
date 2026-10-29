---
name: click-path-logic-auditor
description: "[UI Click-Path & State Machine Auditor] Deep interaction call stack tracing, async race condition detection across stores, and UI terminal state verification. DO NOT USE for visual CSS styling (use impeccable) or headless browser runners (use playwright-cli)."
---

# Click Path Logic Auditor

The specialized interaction debugging and UI state verification suite. Designed to catch subtle state machine errors, async race conditions, and hidden side-effects that unit tests and static linters miss when users click through web interfaces.

---

## Non-Negotiable Audit Rules & Interaction Principles

### 1. Full Click-to-State Traceability
- **Trace the Complete Call Chain**: Never inspect an event handler (`onClick`) in isolation. Trace the full execution path:
  $$\text{DOM Event} \longrightarrow \text{Handler} \longrightarrow \text{State Action/Reducer} \longrightarrow \text{Side Effect (API/Store)} \longrightarrow \text{Terminal DOM State}$$
- **State Store Side Effect Mapping**: Explicitly audit all listeners, subscriptions, or middleware triggered as secondary consequences of a user action.

### 2. Guard Against Asynchronous Race Conditions
- **Double-Click & Debounce Defense**: Verify that async mutation buttons (e.g. "Pay Now", "Submit Order") immediately transition to a disabled or loading state to prevent duplicate submissions.
- **Out-of-Order Resolution**: In search inputs or filters, verify that stale promises from previous keystrokes cannot overwrite newer server responses (`AbortController` or cancellation tokens).

---

## Operating Modes

| Mode | Target Scope | Output Deliverable | Audit Focus |
|---|---|---|---|
| **Mode 1: Single Interaction Debug** | Broken button or disabled state | Step-by-step handler trace with state snapshots. | Event propagation, disabled logic, unhandled rejections. |
| **Mode 2: Multi-Step Flow Audit** | Checkouts, wizards, onboarding flows | Flow transition matrix and edge-case map. | Form state persistence across back/forward navigation, draft saving. |
| **Mode 3: Store Refactor Verification** | Redux/Zustand migration or refactoring | Before/After state mutation audit table. | Accidental state resets, selector memoization regressions, extra renders. |

---

## Standard Audit Workflow & Checklist

### Step 1: Sequential Call Path Extraction
When auditing an interactive element:
1. Locate the JSX/HTML trigger element:
   ```tsx
   <Button onClick={handleCheckout} disabled={isSubmitting || !isValid}>
     Confirm Order
   </Button>
   ```
2. Inspect the handler function:
   - Does it call `event.preventDefault()` if inside a form?
   - Does it wrap asynchronous operations in `try/catch/finally`?
   - Does it guarantee that loading flags are cleared in the `finally` block?

### Step 2: State Store Mutation Inspection
Check for store mutations:
- *Are related stores synchronized, or can an error in Store B leave Store A in a dirty state?*
- *Are optimistic UI updates rolled back cleanly if the server rejects the request?*

### Step 3: Interaction Audit Scorecard
Format all audit findings in a standard table:

| Step / Action | Expected State Transition | Actual Observed Transition | Status | Remediation |
|---|---|---|---|---|
| Click "Submit" | `isSubmitting = true`, Button disabled | Button remained enabled for 200ms | ⚠️ Race Hazard | Disable button synchronously before `await`. |
| Network 500 error | Show toast error, re-enable button | Infinite spinner, UI frozen | ❌ Bug | Clear loading state in `finally` block. |
| Click "Back" | Form inputs preserved from cache | Form fields reset to empty | ⚠️ State Loss | Persist wizard state in parent store. |
