# @kiranbuildswithai — Project Agent Rules (Craft System v1.1)
**Mission:** Build a distinct, accessible, fast, conversion-aware website that belongs to THIS brand. Do not produce a generic template with fancy effects. Ask for missing evidence instead of fabricating facts.

## Folder contract
- `craft/` = shared system, identical in every project. Never edit it inside a client project; update it from the master copy.
- `design/` = this project only: `creative-brief.md`, `brand.md`, `tokens.json`, `motion-spec.md`, `DECISIONS.md`, `qa-output/`.

## Read order
1. `design/creative-brief.md` and `design/brand.md` first. If absent, or still the seeded example (marked "SPEC ONLY" / "SPEC/example only"), treat them as unfilled: for a new site or redesign, prepare them before creative coding.
2. **Locks:** the "Existing features that must not change" list in `design/creative-brief.md` overrides every rule below. Never modify a locked layout, asset, route, form, API or ERP behaviour without written approval.
3. `design/tokens.json` and `design/motion-spec.md`.
4. Deep references, only when relevant: `craft/library/design-principles.md`, `craft/library/motion-scroll-3d.md`, `craft/library/standards-and-budget.md`. For any UI code, also follow `craft/vendor/vercel-web-interface-guidelines.md`.
5. Do not load the whole `craft/` folder into every task.

## Non-negotiable agent directives
1. State **audience, primary action, differentiating insight and one-line visual concept** before proposing a layout.
2. Separate `OBSERVED/CLIENT-CONFIRMED`, `INFERENCE` and `PLACEHOLDER` information. Invent none of the client's facts, ratings, results, people or guarantees.
3. **New site, new page or redesign only (gates G2–G4):** propose three materially different visual directions before selecting one; evaluate brand fit, clarity, distinctiveness, cost and mobile. For fixes and small changes, work inside the approved direction with the smallest change.
4. Show hero heading + value proposition + CTA in the first experience without relying on an entrance animation.
5. Every content section answers a documented visitor question. Remove purposeless feature-card grids.
6. Use tokens for type, colour, spacing, radii and motion (`design/tokens.json`, DTCG 2025.10 format). No one-off raw values unless justified in `design/DECISIONS.md`. Run `python3 craft/qa/validate_tokens.py design/tokens.json` after editing tokens.
7. Body text: 16–20px on mobile, line height 1.4–1.6, line length 45–75 characters (`max-width` in `ch`). Defaults and sources: `craft/library/design-principles.md`.
8. Use original approved client assets, approved licensed assets, or marked placeholders. No unsourced logos, testimonials or fake staff portraits.
9. One high-cost visual treatment per page by default. Prototype any WebGL or large scroll scene separately before committing.
10. Prefer CSS and platform primitives for simple motion; use GSAP/ScrollTrigger only if it improves the result. Do not install heavy libraries reflexively.
11. Prefer `transform`/`opacity` for frequently running animation; never `transition: all`. Profile anything that animates layout or paint.
12. Common UI feedback must be interruptible; never delay clicks, forms or navigation for transitions.
13. Main body copy is visible immediately; never animate it in on scroll. Scroll-triggered decoration is secondary and plays once.
14. Respect `prefers-reduced-motion` with a content-equivalent static rendering and no parallax.
15. Looping video or other auto-moving content beyond 5 seconds beside other content needs a keyboard-usable pause/stop/hide control (WCAG 2.2.2, Level A).
16. Preserve keyboard navigation, real form labels, visible focus, Escape/return focus for overlays, tap targets ≥ 44px on mobile.
17. Mobile is a re-art-directed layout, not a scaled desktop. **Agent:** check 320, 375, 768, 1024, 1440px with `craft/qa/screens.mjs`. **Human (Kiran):** real Android + iPhone Safari check before launch.
18. Keep the LCP image/poster server-rendered and visible. Lazy-load below-fold media and heavy 3D; reserve media dimensions.
19. Targets: field p75 LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. **Agent:** run Lighthouse (lab) and report TBT as the INP proxy. Never claim field results from lab data.
20. No scroll hijack, mandatory sound, full-screen preload gate or cursor-only interactions on commercial pages.
21. Design loading, empty, error, success, reduced-motion and slow-network states.
22. Before final output, run `craft/qa/screens.mjs`, self-audit against `craft/agent/critic-scorecard.md`, and list trade-offs plainly.
23. Critique happens in a **fresh** context that receives only the brief, screenshots, QA report and URL, not the developer's reasoning.
24. Capture real before/after screenshots, source credits and measured results; never invent client outcomes for the portfolio.
25. End every milestone with a short `design/DECISIONS.md`: decisions, alternatives rejected, evidence, known debt, next user-facing experiment.

## Output order for new concepts (G2–G6)
`INSIGHT → THREE DIRECTIONS → SELECTED CONCEPT + WHY → SECTION MAP → ASSET PLAN → TOKENS → MOTION SPEC → RESPONSIVE PROTOTYPE → QA EVIDENCE`.

## Human-only steps (agents must ask, not pretend)
Customer interviews, client approvals at each gate, real-device testing, field Core Web Vitals, permission to publish client work.
