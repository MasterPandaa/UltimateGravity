# Common Playwright-CLI Workflows

## Example: Form submission

```bash
playwright-cli open https://example.com/form
playwright-cli snapshot

playwright-cli fill e1 "user@example.com"
playwright-cli fill e2 "password123"
playwright-cli click e3
playwright-cli snapshot
playwright-cli close
```

## Example: Multi-tab workflow

```bash
playwright-cli open https://example.com
playwright-cli tab-new https://example.com/other
playwright-cli tab-list
playwright-cli tab-select 0
playwright-cli snapshot
playwright-cli close
```

## Example: Debugging with DevTools

```bash
playwright-cli open https://example.com
playwright-cli click e4
playwright-cli fill e7 "test"
playwright-cli console
playwright-cli requests
playwright-cli close
```

```bash
playwright-cli open https://example.com
playwright-cli tracing-start
playwright-cli click e4
playwright-cli fill e7 "test"
playwright-cli tracing-stop
playwright-cli close
```

## Example: Interactive session

Ask the user for UI review or design feedback. The user draws boxes on the live page and types comments; you receive the annotated screenshot, the snapshot of the marked region, and the user's notes. Use this whenever the user asks for "UI review", "design feedback", or to "ask the user what they think / want / mean":

```bash
playwright-cli open https://example.com
playwright-cli show --annotate
```

---

## The Constrained 8-Action Decision Space & Occlusion Pre-flight Invariant (Jev Protocol)

> Grounded in the architectural absorption of `browser-use/jev-ultrafast` into Antigravity.

When autonomous agents interact with web pages, they frequently suffer from **Browser Action Hallucination**—generating fragile, unvalidated CSS selector chains (`div.main > div:nth-child(4) > button`), attempting arbitrary JavaScript evaluations (`page.evaluate(...)`), or clicking blind pixel coordinates (`click(x=340, y=520)`). Furthermore, feeding raw full-page screenshots into multimodal models at every intermediate step causes severe token bloat and latency.

### 1. The Constrained 8-Action Space

Browser interactions must strictly map to exactly **8 deterministic action primitives** operating against an Indexed Element Table (`e1`, `e2`, ...):

| Primitive | Parameter Signature | Operational Rule & Guard |
| :--- | :--- | :--- |
| `CLICK` | `click <id>` | Target must be an indexed element. Pre-flight check must verify the element is visible and unoccluded. |
| `TYPE_TEXT` | `fill <id> "<text>"` | Language generation is isolated strictly to formulating `<text>`. Never type into unindexed elements. |
| `SELECT` | `select <id> "<option>"` | Chooses a value from an accessible dropdown or select control. |
| `SCROLL_UP` | `scroll up` | Shifts viewport upward by 1 page height to reveal prior content. |
| `SCROLL_DOWN` | `scroll down` | Shifts viewport downward by 1 page height to reveal offscreen content. |
| `WAIT` | `wait <ms / condition>` | Pauses execution for transient network or DOM stabilization (e.g. `wait networkidle`). |
| `DONE` | `done "<evidence>"` | Concludes the task with a final verification screenshot or DOM snapshot evidence. |
| `BLOCKED` | `blocked "<reason>"` | Halts and immediately requests user intervention (e.g. CAPTCHA, MFA prompt, payment gate). |

### 2. Operational Invariants for Browser Execution
1. **Zero Raw Vision In The Loop**: Do not feed continuous high-resolution screenshots into vision models for routine form filling or link navigation. Parse the accessibility DOM snapshot (`playwright-cli snapshot`) to retrieve indexed controls (`e1`, `e2`), keeping turn tokens under 500 tokens.
2. **Occlusion & Freshness Pre-flight**: Before executing `CLICK` or `TYPE_TEXT`, verify that the target element is not obscured by an active modal backdrop, sticky header, or floating alert. If occluded, dismiss the modal first or scroll the element into view.
3. **Prohibition of Arbitrary Code Injection**: Never evaluate arbitrary untyped JavaScript strings against the host DOM to simulate user clicks or bypass button disablement. All interactions must proceed through synthetic user-event dispatchers.