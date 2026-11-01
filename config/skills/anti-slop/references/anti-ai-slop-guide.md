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
- **Theatrical False Negation**: *"This is not just about X; it is about Y."* Limit to once per document if the contrast imparts real information; otherwise, state Y directly.
- **Sententious Concluding One-Liners**: Ending every paragraph with a pseudo-philosophical aphorism. Remove it; readers already grasp the point.
- **Stale Rhetorical Inquiries**: *"Have you ever wondered...?"* Delete and begin directly with the answer.

### 1.3 Cliché Vocabulary (*AI-isms*)
- **Banned Clichés**: *Delve, tapestry, testament, beacon, symphony, unlock, elevate, realm, game-changer, in today's fast-paced digital world, it's worth noting, foster, bespoke, multifaceted, paradigm shift, holistic synergy, navigate the landscape.*
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

## 7. The 9-Pass Sequential UI Refactoring Pipeline (Damir Sokolovsky / unslop Pattern)

When refactoring generic AI-generated interfaces ("vibecoded" screens characterized by purple/blue neon glows, ambient card gradients, emojis in every header, and arbitrary Tailwind pixel hacks), never attempt to fix all aesthetic dimensions simultaneously. Execute changes across **9 sequential passes in strict dependency order**:

```
[1. Spacing] ──> [2. Color] ──> [3. Icons] ──> [4. Copy] ──> [5. Type] ──> [6. Layout] ──> [7. Details] ──> [8. Visuals] ──> [9. Motion]
```

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
