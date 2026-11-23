# Anti-AI Slop: Comprehensive Quality Control & Humanization Guide

Authoritative guidelines for detecting, editing, and eliminating generic low-grade synthetic artifacts (*AI Slop*) across technical prose, copywriting, visual design, and multimedia.

Core objective: Deliver deliverables that feel crafted by someone with domain mastery, empathy for readers, and the courage to make specific editorial decisions. Stripping surface artifacts alone is insufficient; prose free of em dashes that remains hollow in substance is still slop.

---

## 🧭 Core Principles

Slop originates from a single root cause: **output generated without specific decisions**. LLM models naturally default to words, structures, and viewpoints that are safest, most generic, and minimize risk. The result appears polished but can be transposed onto any arbitrary topic without modification.

Measure quality through **3 Absolute Diagnostic Tests**:

1. **Topic-Swap Test**: Can this paragraph be transplanted to another topic merely by swapping 1–2 keywords? If yes, it is pure fluff.
2. **"So What?" Test**: After every claim, demand the practical impact or consequence for the reader. If none exists, delete or ground it with facts.
3. **Real Reader Test**: Who is reading, what baseline do they possess, and what concrete capability do they need after reading?

*Density Principle*: Surface markers (em dashes, formal transitions) are symptoms. Human authors also utilize them. Gauge slop by **cluster density and co-occurrence**, avoiding rigid mechanical purges.

---

## 🛠️ Operational Workflows

### Mode A: Editing Existing Content
1. **Read Comprehensively First**: Determine objective, reader profile, and appropriate tonal register.
2. **Diagnosis**: Identify cliché patterns and classify severity (Critical $\to$ Moderate $\to$ Minor).
3. **Refactor from Core to Surface**: Substance first $\to$ paragraph structure $\to$ sentence rhythm $\to$ vocabulary and punctuation last. Swapping synonyms without strengthening substance merely masks hollowness.
4. **Verification**: Run the Section 6 checklist, followed by the read-aloud test.
5. **Report**: Summarize specific modifications and highlight sections requiring real user data inputs.

### Mode B: Drafting from Scratch
1. **Define One Core Thesis**: Formulate a central claim and identify who might reasonably disagree. If no reasonable professional could disagree, the claim is too bland.
2. **Gather Concrete Facts**: Measured numbers, named tools/methods, real case studies. If unavailable, query the user or place explicit placeholders: `[FILL: verified project data]`.
3. **Write Directly to the Point**: Strip introductory throat-clearing, applying Mode A to internal drafts.

### Mode C: Reviewing Visual Design & Assets
Apply Section 3 as an inspection rubric. Provide concrete findings (which element degrades, why it is cliché, and specific alternatives), avoiding subjective feedback like *"looks off"*.

---

## ⚠️ Anti-Hallucination & Provenance Invariants

- **STRICTLY PROHIBITED TO INVENT FAKE ANECDOTES, EXPERIENCES, QUOTES, OR DATA**:
  Instructions to *"inject personal experience"* mean eliciting real material from the user, **NEVER fabricating it**. Inventing fictional case studies is reputation-destroying slop. If verified data is missing, author an objective factual analysis or insert `[FILL: ...]`.
- **Preserve Facts, Meaning, and User Voice**: Editing never means imposing arbitrary personal taste. Respect established brand voices.
- **Do Not Substitute New Tics**: Replacing every em dash with a comma or every "However," with "Yet," merely establishes a new predictable pattern. Vary syntactic solutions.
- **Do Not Sacrifice Precision for Casualness**: Technical, architectural, and legal documentation demands precise terminology; eliminate semantic hollowness, not technical accuracy.
- **Do Not Promise AI Detector Bypasses**: Heuristic AI detectors are brittle and frequently penalize educated human prose. Focus entirely on authentic human substance.

---

## 1. Text Patterns & Linguistic Diagnostics

### 1.1 Punctuation & Connectives
| Cliché Pattern | Slop Example | Humanized Alternative |
|---|---|---|
| **Repeated Em Dashes (—)** | *"The core feature—which was engineered for speed—delivers..."* | Split into two sentences, or use commas/parentheses sparingly. |
| **Bold Lead-In + Colon on Every Bullet** | *"**Efficiency:** This system enables..."* | Convert into a flowing narrative paragraph; reserve bullet lists for sequential actions. |
| **Formal Paragraph-Initial Transitions** | *"However,", "Furthermore,", "Consequently,", "Overall,"* | Omit transitions when logical flow between paragraphs is self-evident. Begin with sentence subject. |
| **Throat-Clearing Openers** | *"It is important to remember that...", "It should be noted that..."* | Delete opener; state the core claim directly. |

### 1.2 Rhythm & Sentence Structure (*Burstiness*)
- **Monotonous Cadence**: Every sentence spans 15–20 words. Mix ultra-short sentences (3–5 words for punch) with nuanced multi-clause observations.
- **Compulsive Rule of Three**: Tacking on three adjectives to every noun (*"fast, efficient, and reliable"*). Select the single most accurate descriptor supported by evidence.
- **Participle Clause Overload**: Opening sentences with dangling participle phrases (*"By leveraging X, users can now..."*, *"Utilizing Y, developers achieve..."*). State the actor and direct action immediately.
- **Formulaic Colon Titles**: Cliché subtitles (*"The Power of X: Why Y is Transforming Z"*). Replace with direct, descriptive headings.
- **Sycophantic Hedging**: *"While there are valid arguments on both sides, it could arguably be suggested that..."*. State the concrete engineering condition directly.
- **Theatrical False Negation**: *"This is not just about X; it is about Y."* Limit to once per document if the contrast imparts real information; otherwise, state Y directly.
- **Sententious Concluding One-Liners**: Ending every paragraph with a pseudo-philosophical aphorism. Remove it; readers already grasp the point.
- **Stale Rhetorical Inquiries**: *"Have you ever wondered...?"* Delete and begin directly with the answer.

### 1.3 Cliché Vocabulary (*AI-isms*)
- **Banned Clichés**: *Delve, tapestry, testament, beacon, symphony, unlock, elevate, realm, game-changer, in today's fast-paced digital world, it's worth noting, foster, bespoke, multifaceted, paradigm shift, holistic synergy, navigate the landscape, burgeoning, underscore, vital, robust, pivotal, seamlessly, harness, powerhouse, indispensable.*
- **Remediation**: Do not replace with another hollow synonym. State measurable facts: replace *"significantly enhanced operational velocity"* with *"reduced reconciliation runs from 2 hours to 15 minutes"*.

### 1.4 Chatbot Conversational Leaks
Strip public artifacts of: conversational praise (*"Great question!"*), sycophantic closings (*"I hope this helps! Feel free to ask if you need more details"*), echoing requests before answering, and excessive emoji banners.

---

## 2. Content Structure & Information Density

| Symptom | Why It Is Slop | Production Remedy |
|---|---|---|
| **Long but Hollow** | Rephrasing the same point 5 times without new technical facts. | Count unique insights. Consolidate repetition, add measurable steps. 300 dense words outperform 1,500 bland words. |
| **Dictionary Definition Intro** | Delaying core insights with *"In the modern technological landscape..."*. | Delete the first 2 paragraphs; open immediately on the core finding or failure mode. |
| **Authoritative without Citations** | Supreme confidence backed by hallucinated statistics. | Cite verifiable sources and publication years, or state uncertainty honestly. |
| **Over-Structured Templates** | Rigid pattern: Generic Intro $\to$ H2 $\to$ Bold Bullets $\to$ Cliché Conclusion. | Allow substance to dictate form. Not every short memo requires nested headings or summaries. |
| **Extreme Fence-Sitting** | *"Ultimately, the best choice depends on each team's unique preferences."* | Take an engineering stance conditioned on boundaries: *"For teams < 10, adopt A; beyond that, adopt B because..."* |
| **Absence of Battle Scars** | Lacks concrete failure modes proving the author ever shipped the system. | Query specific edge-case realities from the user (outage post-mortems, crash signatures). |

### Diagnostic Severity Tiers
- **Critical (Must Fix First)**: Fabricated facts/quotes, hollow filler, untruthful claims, conceptual errors.
- **Moderate**: Rigid boilerplate templates, fence-sitting neutrality, generic intros, absence of concrete code/examples.
- **Minor (Final Polish)**: Em dashes, formal connectives, monotonous sentence length.

---

## 3. Visual Assets, Illustrations, & Logos

### Visual Slop Indicators
- **Literal Metaphors**: Shields + glowing brains + circuit traces for "AI Security"; soaring rockets for "growth"; robot-human handshakes for "partnership"; glowing lightbulbs for "ideas".
- **Distorted Geometry / Liquid Detail**: Inconsistent vector curves, broken symmetry, distorted alien glyphs inside diagrams.
- **Generic Neon Glows**: Purple-blue-cyan gradients, dramatic rim lighting, cheap futuristic aesthetic decoupled from brand identity.
- **Waxy Plastic Textures**: Poreless human skin, physically inconsistent cast shadows, blank expressions.
- **Anatomical & Physical Failures**: Incorrect finger counts, misaligned pupils, floating objects lacking gravity.

### Remediation
1. **Concept Before Canvas**: Define core communication in one sentence, translating it into grounded visual forms (editorial typography, authentic documentary photography, architectural schematics).
2. **Mandatory Manual Vectorization**: If generative AI is used for logo/icon exploration, manually redraw paths in Illustrator or Figma to guarantee geometric accuracy.
3. **Controlled 60-30-10 Palette**: 60% dominant/neutral, 30% structural secondary, 10% intentional accent. Reject default diffusion model candy palettes.

---

## 4. Short-Form Video & Audio
- **Monotonous TTS Delivery**: Avoid robotic breathing pauses and hyper-enthusiastic infomercial inflection. Adjust cadence manually or deploy human voiceovers for key narratives.
- **Disjointed B-Roll Montage**: Do not switch stock footage every 2 seconds based purely on detached keywords; align cuts to narrative beats.
- **Faulty Automated Captions**: Manually proofread domain terms, acronyms, and proper names in transcription outputs.

---

## 5. Case Studies: Before vs. After

### Example 1: Software Product Copy
- **Before (Slop)**:
  > *"In today's ever-evolving digital era, enterprises must navigate an increasingly complex landscape. Our platform is not just a ledger, but a groundbreaking, bespoke solution that unlocks the full potential of your operational synergy. Through our comprehensive suite—engineered for optimal performance—you can revolutionize your core workflows."*
- **After (Humanized & Grounded)**:
  > *"Independent grocery stores routinely lose margin in two places: stockouts that go unnoticed until a customer leaves, and credit sales recorded on loose receipts that get misplaced. This application tracks inventory and customer balances on a single screen, sending automated WhatsApp reminders for overdue payments. During trial deployments, store owners reduced daily bookkeeping from 60 minutes to 10."*

### Example 2: Extreme Fence-Sitting
- **Before**: *"Ultimately, deciding between Supabase and AWS RDS comes down to your personal workflow preferences and project requirements."*
- **After**: *"If you are bootstrapping with an infrastructure budget below \$50/month, start with Supabase. If you require dedicated VPC peering, HIPAA compliance, and isolated multi-region read replicas, provision AWS RDS."*

### Example 3: Theatrical False Negation
- **Before**: *"This is not just about raw query execution speed; it is about reshaping how we envision the future of enterprise software engineering."*
- **After**: *"Query speed is a baseline benefit. The primary win: developers can deploy schema migrations daily without fearing distributed deadlocks."*

---

## 6. Pre-Handoff Quality Checklist

### Substance & Meaning
- [ ] Passes Topic-Swap Test (cannot be transplanted onto an arbitrary competitor).
- [ ] Passes "So What?" Test (every claim carries measurable consequences for the reader).
- [ ] Takes a clear stance (zero fence-sitting).
- [ ] Zero fabricated anecdotes, metrics, or citations.
- [ ] Opens immediately on the core problem; conclusion provides actionable next steps rather than hollow summaries.

### Form & Cadence
- [ ] Varied sentence cadence (*burstiness*: includes 4-word punchy sentences alongside compound clauses).
- [ ] Free of banned clichés (*delve, tapestry, beacon, unlock, navigate the landscape*).
- [ ] Em dashes, bold-colon bullets, and formal connectives do not cluster in tight proximity.
- [ ] Stripped of conversational chatbot residue (*"Certainly!", "I hope this helps!"*).

### Code & Visuals (When Applicable)
- [ ] Free of cliché metaphors (glowing brains, pseudo-bento grids).
- [ ] Vector assets cleanly drafted with stroke weights matched to typography.
- [ ] Code is free of comments merely repeating syntax, with zero `// TODO` stubs.


---

## 7. The 10-Pass Sequential UI Refactoring Pipeline (Unslop & Aesthetic Anchoring Pattern)

When refactoring generic AI-generated interfaces ("vibecoded" screens characterized by purple/blue neon glows, ambient card gradients, emojis in every header, and arbitrary Tailwind pixel hacks), never attempt to fix all aesthetic dimensions simultaneously. Execute changes across **10 sequential passes in strict dependency order**:

```
[0. Archetype] ──> [1. Spacing] ──> [2. Color] ──> [3. Icons] ──> [4. Copy] ──> [5. Type] ──> [6. Layout] ──> [7. Details] ──> [8. Visuals] ──> [9. Motion]
```

### 0. Archetype Pass (Aesthetic Anchoring / Anti-Default Slop)
> Grounded in the architectural absorption of Wil Waldon's `claude-code-frontend-design-toolkit`.

Before touching layout or styling, **explicitly anchor to one Visual Aesthetic Archetype**. Never default to the generic "AI SaaS Card" (centered purple/blue gradient card, glowing pill badge, floating stock icons). Choose exactly one archetype and adhere strictly to its rules:

| Aesthetic Archetype | Target Tone & Use Case | Typography Standard | Surface & Palette | Density & Radius |
| :--- | :--- | :--- | :--- | :--- |
| **Technical Dense** | Developer consoles, dashboards, monitoring, data-heavy IDE tools. | Monospace / clean Grotesk (`Geist Mono`, `JetBrains Mono`, `Inter`). | High-contrast monochrome, off-black (`#09090b`), single functional accent (cyan/emerald). | High density, compact padding (`p-2`, `p-3`), sharp borders (`rounded-none` or `rounded-sm`), data tables. |
| **Minimalist Swiss** | Portfolios, luxury consumer apps, minimalist publications, high-end SaaS. | Neutral Neo-Grotesk (`Inter`, `Helvetica Neue`), strong scale ratio. | Stark white or deep black, zero ambient glow, deliberate negative space (60-30-10 rule). | Medium density, generous white space (`p-8`, `p-12`), crisp geometry, hairline dividers (`border-border/40`). |
| **Editorial Publication** | Content platforms, research hubs, blogs, essay readers. | Serif headings (`Newsreader`, `Merriweather`, `Playfair`) paired with clean sans body. | Warm off-white paper (`#fbfbfa`, `#f7f4ee`) or dark slate (`#1c1d21`), muted ink contrast. | Content-first layout, bounded reading column (`max-w-prose`), balanced typography (`text-wrap: balance`). |
| **Warm Craft & Paper** | Indie products, personal knowledge tools, notes, artisan software. | Warm humanist sans or soft rounded grotesk (`Plus Jakarta Sans`, `Cabinet Grotesk`). | Warm earth tones, subtle paper grain, tactile borders (`border-amber-900/10`), cream accents. | Soft corners (`rounded-lg`, `rounded-xl`), subtle tactile inset shadows, authentic non-synthetic depth. |
| **Neo-Brutalist Utility** | High-energy dev tools, creative studios, experimental productivity apps. | Heavy sans bold headings (`Space Grotesk`, `Archivo Black`), mono accents. | High-saturation primary contrasts (electric yellow, deep cobalt), stark black borders (`border-2 border-black`). | Hard drop shadows (`shadow-[4px_4px_0px_0px_#000]`), zero blur, zero gradient, raw functional layout. |

**The Anti-Default Invariant**: If a generated view contains a centered card with a purple/blue linear gradient background, glowing pill badge, and generic emoji in the title, it is a critical violation of Pass 0. Refactor immediately to an anchored archetype above.

### 1. Spacing Pass (Geometric Rhythm)
- Replace arbitrary pixel values (`mt-[13px]`, `p-[21px]`) with strict 8pt geometric scales (`p-2`, `p-4`, `p-6`, `p-8` / `8, 16, 24, 32px`).
- Enforce optical proximity: related elements (label + input, card title + body) sit closer than unrelated containers.

### 2. Color Pass (Monochrome-First Hierarchy)
- Purge hue-to-hue gradients (purple-to-blue neon, pink-to-orange glows) and ambient card drop-shadows.
- Establish a monochrome foundation: off-black surfaces (`#09090B`, `#18181B`) for dark mode; off-white (`#F8FAFC`, `#F4F4F5`) for light mode.
- Restrict accents to exactly 1 functional brand color; reserve high-saturation shades exclusively for active statuses or destructive alerts.

### 3. Icons Pass (Semantic Utility)
- Strip decorative emojis from headings, buttons, and badges (`"Settings ⚙️"` &rarr; `"Settings"`).
- Standardize vector icon sets (Lucide / Radix Icons); enforce uniform stroke-width (1.5px or 2.0px) proportional to body typography.

### 4. Copy Pass (Substance & Grounding)
- Eliminate generic greeting banners (*"Welcome back, Alex! 👋 Here is your daily overview"*).
- Strip empty marketing superlatives (*"10x faster"*, *"streamline your workflows"*); replace with concrete metrics or direct functional labels.

### 5. Type Pass (Optical Balance)
- Enforce strict typographic scale (e.g. `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-2xl`); avoid arbitrary micro-sizing.
- Apply `font-variant-numeric: tabular-nums` to financial figures, stats, tables, and counters to eliminate layout jitter.
- Apply `text-wrap: balance` to card titles and primary headers.

### 6. Layout Pass (Single Focus)
- Enforce Single Focus: every screen must have 1 dominant visual focal point and 1 primary CTA.
- Apply bounded max-widths to desktop buttons and inputs (`max-w-xs`, `max-w-md`) rather than stretching full-width across ultrawide viewports.

### 7. Details Pass (Tactile Feedback & Depth)
- Eliminate nested "box-in-a-box" card layouts and superfluous horizontal dividers (`<hr>`).
- Add tactile micro-interactions: `:active { transform: scale(0.97) }` feedback on buttons and subtle surface elevation tokens (`border-border/50`).

### 8. Visuals Pass (Authentic Materiality)
- Replace generic blurred radial gradient blobs with purposeful imagery, subtle CSS grain/noise, or clean flat geometry.

### 9. Motion Pass (Purpose-Driven Micro-Physics)
- Audit all animations against the 4-Question Motion Gate:
  - High-frequency daily actions (>30x) must remain 0ms instant.
  - Micro-interactions capped at 100–200ms; modal transitions capped at 250–350ms.
  - Animate only GPU transforms (`transform`, `opacity`); layout property animation (`width`, `height`, `margin`) without FLIP is strictly banned.
  - Enforce `@media (prefers-reduced-motion: reduce)`.

---

## 8. Anti-Slop UI Refactoring Invariants

- **Zero Fake Entities**: Strictly prohibited to invent fake product names, fictional company brands, or fabricated user accounts when refactoring templates.
- **Anti-Trend-Hopping**: Never replace one generic AI cliché with another (e.g., swapping neon-purple cards for generic glassmorphism or neo-brutalism unless specified by the product design system).
- **Invariance of Well-Crafted Screens**: If a component or view already demonstrates strong typography, harmonious spacing, and semantic hierarchy, leave it untouched.

---

## 9. Calibrated Voice Profiles & Parser Boundaries

> Grounded in the architectural absorption of `conorbronsdon/avoid-ai-writing`.

### 9.1 Calibrated Voice Profiles
Select an explicit tonal register before drafting or editing:

| Profile | Target Audience | Syntactic Invariants | Banned Traits |
|---|---|---|---|
| **Technical** | Engineers, Architects | High information density, concrete metrics, code diffs, explicit trade-offs. | Marketing buzzwords, vague adjectives, emotive flourishes. |
| **Blunt** | Incident Commanders, Decision Makers | Active voice, short sentences (5–12 words), immediate findings first, zero hedging. | Politeness filler, throat-clearing, diplomatic qualification. |
| **Professional** | Cross-functional stakeholders | Structured, outcome-focused, clear business impact, neutral tone. | Conversational slang, sycophantic praise, robotic bullet lists. |
| **Casual** | Developer blogs, community updates | Natural human cadence, contractions allowed (*don't, we've*), warm and direct. | Formulaic hooks, excessive emojis, artificial excitement. |

### 9.2 Parser Boundary Defense (Edit-in-Place Protection)
When humanizing or polishing prose in mixed technical documents:
1. **Never Touch Code Blocks**: Blocks delimited by ```` ``` ```` must remain byte-for-byte identical. Do not alter comments inside code unless explicitly directed.
2. **Preserve Frontmatter & Metadata**: YAML/TOML frontmatter blocks (`--- ... ---`) and JSON headers must be bypassed entirely.
3. **Preserve Technical Identifiers**: Never rewrite filenames, terminal commands, environment variables (`$HOME`), API flags (`--verbose`), or symbol names.
4. **Target Pure Prose Only**: Restrict editing passes strictly to body paragraphs, headings, and list descriptions.


---

## 10. The Anti-First-Choice Invariant & Moves Ledger (Absorbed from `mankidev/antialgorithm`)

AI models converge on the top-1 statistically average output (e.g., generic purple gradient cards, "streamline your workflow" copy, or sterile symmetric grids).

### 10.1 The Anti-First-Choice Invariant (Move-Away Protocol)
1. **Explicit Cliché Recognition**: Before generating UI layouts, copy, or variable naming, mentally identify the model's top-1 default choice.
2. **Deliberate Divergence**: Explicitly reject that initial impulse and choose an alternative grounded in the project's unique functional domain.
3. **Organic Materiality**: Avoid sterile digital perfection in UI and SVG assets. Introduce subtle optical balance, dynamic rhythm, or organic character rather than robotic uniformity.

### 10.2 The Moves Ledger (Anti-Counter-Slop)
Counter-slop can easily degenerate into its own cliché (e.g., overusing brutalism, dark mode, or monospace fonts everywhere once learned).
- Maintain an implicit or explicit "Moves Ledger": track the core creative technique applied in the current screen.
- Do not blindly repeat the same creative move across unrelated screens or deliverables.

---

## 11. Frontend Surface Anti-Slop Signatures (Absorbed from `felipebasurto/unslop-ui`)

Specific visual and copy markers characteristic of raw AI-generated interfaces that must be ruthlessly stripped during UI refactoring:

### 11.1 The 6 Frontend Slop Signatures
1. **Eyebrow Label Purge**:
   - *Slop Pattern*: Tiny uppercase tags hovering directly above headings (`FEATURES // 01`, `INTRODUCING PLATFORM`).
   - *Fix*: Delete the eyebrow label. Let semantic typography scale and deliberate optical spacing create visual hierarchy naturally.
2. **Decorative Numbering Elimination**:
   - *Slop Pattern*: Meaningless sequential markers next to feature cards (`01 // Realtime`, `02 // Scalable`, `[03] Analytics`).
   - *Fix*: Strip arbitrary numbers. Reserve numbers exclusively for true chronological step-by-step procedures or rank orders.
3. **Subtitle Reflex Elimination**:
   - *Slop Pattern*: Subtitles that immediately restate the title in passive words (*"Audit Logs: View, inspect, and manage your audit logs"*).
   - *Fix*: Omit the subtitle when the title is self-explanatory, or provide a single concrete domain statement (e.g., *"Immutable record of all tenant mutations over the last 90 days"*).
4. **Botsplaining Captions & AI Adjective Purge**:
   - *Slop Pattern*: Instructional micro-copy telling users how to click basic UI (*"Click the button above to get started"*, *"Enter your email in the field below"*), and hollow buzzwords (*seamless, robust, effortlessly, empower, streamlined, revolutionize*).
   - *Fix*: Delete instructional filler. Use direct action verbs and measurable performance statements.
5. **Fake Status Badges**:
   - *Slop Pattern*: Unwired green pulsing dots or decorative badges labeled `"LIVE"` or `"SYNCED"` that do not map to an active WebSocket, SSE stream, or polling cycle.
   - *Fix*: Ban decorative status badges. Every badge must be bound to a real verified healthcheck or telemetry state.
6. **Chart Clutter & Metric Over-Explanation**:
   - *Slop Pattern*: Excessive explanatory captions above data visualizations (*"Hover over bars to inspect values"*, *"This chart shows your monthly revenue over time"*), redundant legends that echo visible axis labels, and cluttered decorative borders.
   - *Fix*: Strip reading instructions. Let clean axis scales, tabular figures (`tabular-nums`), and direct data point tooltips deliver clarity.

---

## 🏛️ The 7 Design Craft Pillars & Anti-Slop Heuristics

> **Pattern Origin**: Absorbed from `avivgerz-hue/unslop` (§8 External Proposal Protocol).

Transforms subjective visual critique into measurable, deterministic engineering gates across 7 pillars:

1. **Color & Contrast (`SLOP-COLOR-*`)**:
   - Ban muddy gray-on-gray text. Maintain $\ge 4.5:1$ contrast for standard text and $\ge 3:1$ for large text/icons (WCAG AA).
   - Eliminate harsh 100% black on white; use optical darks (`zinc-900`, `slate-950`).
   - Never exchange hardcoded hexes for another hardcoded hex; enforce semantic token abstraction.
2. **Typography & Measure (`SLOP-TYPE-*`)**:
   - Enforce line-length limits: 45–75 characters per measure (`max-w-prose` / `65ch`).
   - Mandate tabular figures (`tnum` / `font-mono`) for all tabular data, prices, and metrics to prevent horizontal jitter.
   - Purposeful hierarchy: limit to 3 font sizes and 2 font weights per view.
3. **Layout & Rhythm (`SLOP-LAYOUT-*`)**:
   - Ban generic three-card clones and nested cards-inside-cards.
   - Stick strictly to an 8px or 4px spacing rhythm (never arbitrary values like `13px`, `19px`).
   - Structure before surface: solve content grouping, reading flow, and grid alignment before tweaking colors or shadows.
4. **Surface & Elevation (`SLOP-SURFACE-*`)**:
   - Ban decorative blurred background blobs and frosted glass overuse (`backdrop-blur-md` without purpose).
   - Dark mode elevation: lighter surface luminance replaces shadows (`bg-zinc-900` elevated to `bg-zinc-800`), since shadows are invisible against dark canvas.
5. **Copy & Microcopy (`SLOP-COPY-*`)**:
   - Ban AI marketing clichés (*"supercharge"*, *"unleash"*, *"effortless"*, *"seamless"*).
   - Require real product facts and domain-specific verbs.
6. **Interaction & Motion (`SLOP-UX-*`)**:
   - Explicit focus rings (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`) on all interactive controls.
   - Mandatory `prefers-reduced-motion` fallbacks for all transitions and animations.
7. **Theme & Token Parity (`SLOP-TOKEN-*`)**:
   - Dark theme parity: every UI view must be verified in both light and dark modes. Never leave dark-mode contrast untested.

---

## 🧹 Code Comment Hygiene & AI-Slop Purge

> **Pattern Origin**: Absorbed from `miqdadbadjuber/anti-slop` (§8 External Proposal Protocol).

AI agents frequently generate excessive, performative, and distracting comments that clutter production codebases. Enforce surgical comment hygiene across all generated and edited files:

### 1. Forbidden Comment Anti-Patterns (`SLOP-COMMENT-*`)
- **Banner / Separator Lines (`SLOP-COMMENT-BANNER`)**:
  - Prohibit decorative comment ASCII lines (`// ==========================================`, `/* ----------------- */`, `// ####################`).
  - Use modular file separation, whitespace, or clean function scoping instead of decorative dividers.
- **Obvious Restatements (`SLOP-COMMENT-ECHO`)**:
  - Prohibit restating what the code syntax already says:
    - *Anti-pattern*: `const user = fetchUser(); // Fetch user from database`
    - *Anti-pattern*: `if (!isValid) return; // If not valid, return early`
    - *Anti-pattern*: `let total = 0; // Initialize total to zero`
  - Let self-documenting variable and function names express intent.
- **Workflow & Step Numbering (`SLOP-COMMENT-STEPS`)**:
  - Prohibit step-by-step procedural numbering in code (`// Step 1: Validate payload`, `// Step 2: Query DB`, `// Step 3: Transform response`).
  - Decompose linear procedures into clean helper functions or idiomatic pipelines.
- **Generic Section Labels (`SLOP-COMMENT-LABELS`)**:
  - Prohibit empty categorical headers (`// Variables`, `// Main logic`, `// Helper functions`, `// Event listeners`, `// Imports`).
- **Vague Placeholders & Fake TODOs (`SLOP-COMMENT-VAGUE`)**:
  - Prohibit lazy AI placeholders (`// TODO: Handle this properly`, `// TODO: Add more validation here`, `// Logic goes here`).
  - Either implement the production-grade handling or define an explicit, typed error contract.
- **JSDoc / TSDoc Signature Echoes (`SLOP-COMMENT-TYPEDUP`)**:
  - Prohibit duplicating TypeScript types in JSDoc comments (`@param {string} id - The id of the user`).
  - Document only: units of measurement (e.g., milliseconds), boundary conditions, invariant requirements, or non-obvious failure modes.
- **Decorative Emojis in Code (`SLOP-COMMENT-EMOJI`)**:
  - Prohibit decorative emojis in production source comments (`// 🚀 Launch rocket!`, `// ⚠️ Be careful here`). Emojis are reserved exclusively for structured user-facing CLI logs if explicitly configured.

### 2. Permitted & Mandated Comments
- **The "Why", Not the "What"**: Document non-obvious architectural choices, upstream bug workarounds, mathematical formulas, or business rule constraints.
- **Safety & Invariants**: Document preconditions, thread-safety boundaries, or database lock ordering.
- **External Citations**: Link to specific issue tickets, RFC numbers, or CVE advisories explaining why a pattern was chosen.

---

## ✍️ Copywriting De-Slop & Human Prose Standard

> **Pattern Origin**: Absorbed from `miqdadbadjuber/anti-slop` (§8 External Proposal Protocol).

Transforms generic AI copy into high-signal, human-crafted product prose:

1. **Purge AI Cliché Vocabulary**:
   - Prohibit tired AI vocabulary: *"supercharge"*, *"seamless"*, *"effortless"*, *"unleash"*, *"dive into"*, *"delve"*, *"testament"*, *"tapestry"*, *"game-changer"*, *"in today's fast-paced world"*, *"beacon"*, *"plethora"*.
   - Replace with plain, domain-specific verbs: *"build"*, *"run"*, *"deploy"*, *"filter"*, *"export"*, *"connect"*.
2. **Eliminate False Urgency & Marketing Fluff**:
   - Ban manufactured urgency badges and empty promotional chips (*"Action required!"*, *"Limited availability"*, *"Exclusive offer"*) unless tied to genuine transactional domain state.
3. **Eliminate Botsplaining & Instructional Over-Explanation**:
   - Never explain standard UI affordances to users (e.g., *"Click here to submit the form"*, *"Enter your text in the box above"*).
   - Use concise placeholder text and clear semantic button labels (`"Save Changes"`, `"Delete Workspace"`).
4. **Concrete Over Abstract**:
   - Replace vague claims (*"High-performance database caching"*) with concrete technical metrics or outcomes (*"Sub-millisecond Redis response caching"*).

