# The 21 Laws of UX: Complete Psychology & Design Architecture (Jon Yablonski / LawsOfUX.com)

Authoritative compendium of the **21 Laws of UX** by Jon Yablonski (synthesizing O'Reilly Media publications and the [LawsOfUX.com](https://lawsofux.com/) library). Integrates cognitive psychology, Gestalt perception, interaction heuristics, and ethical design into modern component engineering (React, Tailwind CSS, shadcn/ui).

---

## 4 Categories Taxonomy

```
                             [ 21 LAWS OF UX ]
                                     │
    ┌────────────────┬───────────────┴───────────────┬────────────────┐
    ▼                ▼                               ▼                ▼
[HEURISTICS]    [GESTALT]                    [COGNITIVE BIAS]     [ETHICS & APPLIED]
- Fitts's Law   - Common Region              - Aesthetic-Usability - Goal-Gradient
- Hick's Law    - Proximity                  - Doherty Threshold   - Humane Friction
- Jakob's Law   - Similarity                 - Occam's Razor
- Miller's Law  - Uniform Connectedness      - Pareto (80/20)
- Parkinson's   - Prägnanz (Simplicity)      - Peak-End Rule
- Postel's Law                               - Serial Position
- Tesler's Law                               - Von Restorff
                                             - Zeigarnik Effect
```

---

## Category 1: Heuristic Interaction Laws (7 Laws)

### 1. Jakob’s Law
- **Principle**: *"Users spend most of their time on other sites."*
- **Explanation**: Users spend 90% of their digital time on external platforms, expecting your application to adopt identical navigational and interaction patterns.
- **Technical Implementation**:
  - Preserve standard conventions: Back button top-left, cart/profile top-right, bottom navigation on mobile, search magnifier glyph.
  - **Golden Axiom**: *"Innovate on product VALUE; adhere to convention on NAVIGATION"* (*Don't make the user think*).

### 2. Fitts’s Law
- **Mathematical Formula**:
  $$T = a + b \log_2 \left( \frac{2D}{W} \right)$$
  Where $T$ is reaction/movement time, $D$ is distance to target, and $W$ is target width.
- **Technical Implementation**:
  - Primary CTA buttons must be generously sized ($h \ge 48\text{–}52\text{px}$, `w-full` on mobile).
  - Place primary CTAs in the thumb zone (lower viewport half).
  - Small icons (16px close glyphs) must expand their hit target to >= 44x44px via `span.absolute -inset-2`.

### 3. Hick’s Law (Hick-Hyman Law)
- **Mathematical Formula**:
  $$RT = a + b \log_2(n + 1)$$
  Where $RT$ is reaction time and $n$ is the number of stimuli/options.
- **Technical Implementation**:
  - Excessive choices trigger *Analysis Paralysis*.
  - Enforce **Progressive Disclosure**: surface 1 dominant primary action, tucking advanced filters and actions behind collapsible accordions, toggles, or secondary tabs.

### 4. Miller’s Law
- **Cognitive Principle**: Human working memory capacity is constrained to $7 \pm 2$ chunks of information.
- **Technical Implementation**:
  - **Information Chunking**: Constrain navbar and primary categories to 5–7 items maximum.
  - Segment long numbers (phone numbers `(0812) 345-6789`, credit cards `4408 6753 0912 3456`) into 4-character chunks.
  - Divide verbose forms into 3–5 field groups per step.

### 5. Parkinson’s Law
- **Principle**: *"Work expands so as to fill the time available for its completion."*
- **Technical Implementation**:
  - Open-ended checkout flows cause abandonment.
  - Deploy time-saving efficiencies: geolocation autofill, 1-click payment (Apple Pay), and verified reservation/promo countdown timers.

### 6. Postel’s Law (Robustness Principle)
- **Principle**: *"Be conservative in what you do, be liberal in what you accept from others."*
- **Technical Implementation**:
  - **Client-Side (Permissive)**: Forms tolerate input variance (auto-trimming email whitespace, accepting phone numbers formatted with dashes or spaces, accepting decimal commas or periods).
  - **Server-Side (Strict)**: Backend normalizes data to strict formats prior to database insertion (phones $\to$ E.164, money $\to$ integer cents, dates $\to$ ISO 8601 UTC).

### 7. Tesler’s Law (Law of Conservation of Complexity)
- **Principle**: Every system possesses an inherent quantum of complexity that cannot be eliminated; the choice is **whether complexity is borne by the user or absorbed by system engineering**.
- **Technical Implementation**:
  - Absorb complexity in software rather than offloading manual tasks to users.
  - Example: Shipping address automatically inherits billing defaults; client pre-populates recurring recipients.

---

## Category 2: Gestalt Perception Principles (5 Laws)

### 8. Law of Common Region
- **Principle**: Elements bounded within a common closed region are perceived as a unified functional group.
- **Technical Implementation**:
  - Wrap related controls inside card containers (`bg-card rounded-lg border p-4`).
  - Use subtle surface contrast or divider lines to demarcate data groupings.

### 9. Law of Proximity
- **Principle**: Elements placed spatially close together are perceived as having a closer relationship than elements positioned farther apart.
- **Technical Implementation**:
  - Internal element spacing (label to input: `gap-1.5` / $4\text{–}6\text{px}$) must be noticeably tighter than inter-group spacing (`space-y-4` / $16\text{px}$).
  - Section headings must sit closer to their associated content than to preceding sections: enforce $\text{Margin-Top} > \text{Margin-Bottom}$ (`mt-8 mb-2`).

### 10. Law of Similarity
- **Principle**: Elements sharing visual attributes (color, shape, scale, typography) are perceived to share functional behavior.
- **Technical Implementation**:
  - Consistent link styling (e.g., brand color with underline on hover).
  - Never style non-clickable status badges as rounded action buttons.

### 11. Law of Uniform Connectedness
- **Principle**: Elements connected by visual lines or contiguous color are perceived as more strongly linked than elements merely positioned in proximity.
- **Technical Implementation**:
  - Stepper & Wizard Timelines: Solid lines connecting step 1 $\to$ 2 $\to$ 3 explicitly denote sequential workflow progression.

### 12. Law of Prägnanz (Law of Simplicity)
- **Principle**: Human perception organizes complex imagery into the simplest, most symmetrical, and stable geometric shapes.
- **Technical Implementation**:
  - Rely on pure geometric primitives (circles, rounded rectangles, squares).
  - Avoid gratuitous asymmetrical polygons without clear functional utility.

---

## Category 3: Cognitive Biases & Psychological Effects (7 Laws)

### 13. Aesthetic–Usability Effect
- **Principle**: Users intuitively perceive aesthetically pleasing interfaces as **easier to use and more reliable** (*halo effect*).
- **Technical Implementation**:
  - Visual craft builds foundational trust; polished aesthetics increase user tolerance of minor technical friction.

### 14. Doherty Threshold
- **Principle**: Human productivity and engagement multiply when computer response feedback occurs in under **400 milliseconds** ($< 400\text{ms}$).
- **Technical Implementation**:
  - Implement **Optimistic UI** (instant feedback in $0\text{–}50\text{ms}$ with rollback upon error).
  - Deploy skeleton screens ($<100\text{ms}$) and route prefetching on hover.

### 15. Occam’s Razor (Law of Parsimony)
- **Principle**: *"Entia non sunt multiplicanda praeter necessitatem"* — When multiple designs solve a problem equally well, **select the design with the fewest assumptions and visual elements**.
- **Technical Implementation**:
  - Strip redundant decoration (superfluous gradients, heavy drop shadows, repetitive explanatory labels).

### 16. Pareto Principle (The 80/20 Rule)
- **Principle**: ~80% of user activity stems from ~20% of core features.
- **Technical Implementation**:
  - Focus performance optimization, micro-interactions, and automated QA suites on the golden paths (onboarding, search, checkout).

### 17. Peak–End Rule
- **Principle**: People judge an experience largely on how they felt at its emotional **peak** and at its **conclusion**, rather than the mathematical average over time.
- **Technical Implementation**:
  - Polish closing moments: celebratory payment confirmation with micro-animations, or annual usage wraps.
  - Mitigate waiting anxiety with operational transparency and motion indicators (Uber idleness aversion).

### 18. Serial Position Effect (Primacy & Recency)
- **Principle**: Users recall items positioned at the **beginning (*Primacy*)** and **end (*Recency*)** of a sequence best; middle items fade fastest.
- **Technical Implementation**:
  - Place critical items far left (Home/Brand) and far right (Profile/Cart/Primary CTA) in navigation bars.
  - Position key feature highlights first and last in promotional tiers.

### 19. Von Restorff Effect (The Isolation Effect)
- **Principle**: When multiple similar items are present, the item that differs visually attracts immediate attention and is best remembered.
- **Technical Implementation**:
  - Distinct visual styling for destructive primary actions (e.g. red for permanent deletion).
  - On pricing tiers, elevate the *"Most Popular"* card ($h + 8\text{px}$) with an accent border and badge.

### 20. Zeigarnik Effect
- **Principle**: Uncompleted tasks induce cognitive tension, maintaining mental retention and motivating resolution.
- **Technical Implementation**:
  - Display progress indicators: *"Profile is 70% complete. Add an avatar to reach 100%"*.
  - Provide interactive onboarding checklists.

---

## Category 4: Applied Design Principles & Ethics (2 Principles)

### 21. Goal-Gradient Effect & Humane Intentional Friction
- **Goal-Gradient Effect (Clark Hull)**: Motivation accelerates exponentially as users near the finish line. Provide artificial initial progress (*Endowed Progress*: initialize progress bars at 25%) and micro-milestones past 80%.
- **Intentional Friction (Ethical Guardrails & Anti-Dark Patterns)**:
  - Introduce deliberate friction on destructive operations (typing database name in confirmation modals) to trigger System 2 deliberation.
  - Reject dark patterns: prohibit confirmshaming, forced continuity, or addictive variable-reward loops.
