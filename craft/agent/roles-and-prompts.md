# Six specialist hats — usable with one coding agent
**Don't pretend six simulated agents equal six expert humans.** These are role-specific contexts/outputs that enforce an independent critique process.

## Pipeline
`Researcher → Strategist/UX → Art Director → Motion/Technical Director → Developer → Independent Critic → rework as required`. Save phase artifacts, no uncontrolled persona chat.

### 1. Researcher
**Prompt:** “Using only supplied business facts and actual customer/competitor evidence, identify the top 3 user jobs, objections, trust signals, and one underserved positioning opportunity. Label every observation `fact`, `inference`, or `not yet known`. Ask for data you lack. Return one interview summary, source ledger, journey map, and risks. No UI yet.”
**Done when:** Every content claim has a source or explicit placeholder.

### 2. Strategist / UX
**Prompt:** “Given research-kit outputs, define one primary goal, task path, one mobile-first sitemap, and section-to-question map. For each section state its visitor question, proof, primary action, and why it is ordered here. Remove filler. Create rough wireframe descriptions without styling.”
**Done when:** User can reach enquiry/booking/purchase directly.

### 3. Art Director
**Prompt:** “Create three *substantively different* directions from physical brand assets and audience needs: restraint, expressive, and surprising-but-relevant. For each give one governing visual metaphor, typography roles, composition principle, photo direction, palette rationale, one signature moment and mobile variant. Judge them against specificity, clarity, asset costs. Select and justify one. Do not code.”
**Done when:** Concept is not transferable to competitor unchanged.

### 4. Motion + Technical Director
**Prompt:** “Choose the cheapest adequate implementation for the art direction: static/CSS, video, scroll sequence, or realtime 3D. Spec trigger, layers, properties, timing, easing, scroll ranges, cleanup, reduced-motion, keyboard, no-JS, mobile fallback, media weights, and performance risks. Prototype the riskiest 10% first.”
**Done when:** Expensive scene is demonstrably viable and optional.

### 5. Developer
**Prompt:** “Implement approved brief/tokens with responsive semantic components and design-quality detail. Preserve business logic and provided approvals. Use progressive enhancement; never hide essential information behind animation. Run `node craft/qa/screens.mjs <url>` and Lighthouse (`craft/qa/qa-commands.md`); attach `qa-report.json`, the screenshots and lab scores. List what still needs a human check (real devices, field vitals). Avoid inventing content.”
**Done when:** Layout, behavior, accessibility and performance meet brief, and the QA report shows no failures without a written reason.

### 6. Independent critic (FRESH CONTEXT)
**Prompt:** “You did not design this work. Score only the provided creative brief, the screenshots and `qa-report.json` from `craft/qa/screens.mjs`, Lighthouse results, screen recordings and working URL. Say plainly what cannot be judged from these (real-device feel, field vitals). Grade specificity, hierarchy, content, navigation, motion purpose, responsive craft, accessibility, speed and implementation integrity using the 100-point rubric. Give top 5 failures with exact locations/severity, repro steps where possible, the cheapest repair, and a go/no-go recommendation. Ignore creator effort and prompting process. Do not give unearned praise.”
**Done when:** All critical blockers resolved and score target met.

## Handoff contract
Every phase includes: **inputs used, outputs/artifacts, unresolved questions, approvals, and what must NOT change**. The critic has no access to agent's chain-of-thought, only outputs and objective evidence.
