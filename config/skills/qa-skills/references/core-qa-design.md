# Core QA Test Design Heuristics & Techniques
Source: Awesome QA Skills (`testing-types`) & [inaodeng.com/en/wiki/](https://inaodeng.com/en/wiki/)

Detailed guidance for designing high-coverage, risk-based, and auditable test suites.

---

## 1. Boundary Value Analysis (BVA)

### The 2-Value vs 3-Value Approach
- **2-Value BVA:** For range `[min, max]`:
  - Test: `min - 1`, `min`, `max`, `max + 1`
- **3-Value BVA (Recommended for critical systems):**
  - Test: `min - 1`, `min`, `min + 1`, nominal value, `max - 1`, `max`, `max + 1`
- **Typical Boundaries:**
  - Numbers: 0, negative limits, integer overflows (e.g. 255, 65535, 2^31-1), precision limits (floating point decimals).
  - Strings: Empty string `""`, 1 char, max allowed length, max + 1, whitespace-only, multibyte UTF-8 / emojis.
  - Collections / Arrays: Empty array `[]`, 1 item, max pagination limit, duplicate elements, null/undefined elements.
  - Dates & Time: Leap years (Feb 29), daylight saving switches, midnight 00:00:00 vs 23:59:59, UTC vs local offsets.

---

## 2. Equivalence Partitioning (EP)

Divide input space into subsets where the software is expected to handle all elements of a subset identically:
1. **Identify Dimensions:** Separate inputs, system configurations, and environmental states into distinct dimensions.
2. **Define Partitions:**
   - Valid partitions (expected business paths).
   - Invalid partitions (format errors, range errors, type mismatches, missing values).
3. **Select Test Inputs:** Select at least one representative value from each valid and invalid partition.

---

## 3. Decision Table Testing

Ideal for logic containing multiple conditions driving distinct outcomes (e.g. discount rules, loan approvals, permissions).

### Structure:
| Conditions / Rules | R1 | R2 | R3 | R4 |
| :--- | :---: | :---: | :---: | :---: |
| User is Logged In | T | T | F | F |
| Cart Total > \$100 | T | F | T | F |
| **Actions** | | | | |
| Apply 10% Discount | X | - | - | - |
| Free Shipping | X | - | - | - |
| Prompt Sign In | - | - | X | X |

---

## 4. State Transition Testing

For systems modeled as Finite State Machines (FSMs) (e.g., Order statuses: `Draft` -> `Pending` -> `Paid` -> `Shipped` -> `Delivered` / `Cancelled`).

### Verification Steps:
1. **State Matrix:** List all current states as rows and events/triggers as columns.
2. **Valid Transitions:** Verify each legal state transition along with expected side-effects (notifications, DB updates).
3. **Invalid Transitions:** Explicitly verify illegal transitions (e.g. attempting to cancel an already `Shipped` order); confirm proper error rejection and state immutability.
4. **Guards & Conditions:** Verify conditions required to permit a transition (e.g. payment confirmed before state changes to `Paid`).

---

## 5. Pairwise (Combinatorial) Testing

When an application has multiple configuration parameters or filter options, full combinatorial testing causes combinatorial explosion ($k^n$ tests).
- **Core Principle:** Most software defects are triggered by either a single input parameter or an interaction between at most two parameters.
- **Approach:** Generate test suites that cover every pair of parameter values at least once.
- **Example:** Browser (Chrome, Safari, Firefox) × OS (Windows, macOS, Linux, Android) × Screen (Mobile, Desktop) × Auth (Guest, Member, Admin) -> Full combinations = $3 \times 4 \times 2 \times 3 = 72$ tests; Pairwise reduces this to ~12-14 tests while retaining >90% defect detection capability.
