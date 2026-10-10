# The Kiran Craft Principles
**Policy:** Evidence outranks preference; usability outranks spectacle; specificity outranks novelty; quality outranks scope. The following are our design rules, not a claim that every studio follows them.

## Twelve tests before high fidelity
1. **Specificity:** Write what is true of *this client* that no two competitors can claim. If it is a slogan, interview again.
2. **User question:** For every section, identify the unanswered question it resolves. Delete decorative sections that answer none.
3. **One visual thesis:** Choose ONE conceptual device (material, rhythm, camera, motif). The rest supports it.
4. **Content first:** Use verified offerings, addresses, names, pricing policies, testimonials and photos; use explicit placeholders for unknowns.
5. **Purposeful contrast:** Pick a dominant hierarchy, not five competing focus points.
6. **Typography has roles:** Display, reading, label and numbers each have specs (sizes, weights, line length, optical adjustments), not arbitrary choices.
7. **Spacing communicates structure:** Group related things tightly, separate unrelated things consistently; use tokens and visible alignment.
8. **Originality ≠ weirdness:** An unexpected visual serves a real story, product or material. No 3D just to resemble an award website.
9. **Motion explains:** It reveals causality, progression, product properties, or brand personality. Avoid movement that delays basic reading.
10. **Mobile is art directed:** Reframe images and rewrite composition, not only scale every desktop measurement down.
11. **Failure states are designed:** Empty, loading, slow connection, unavailable image, long text, form errors and reduced motion belong to the system.
12. **Test with ordinary devices:** Good creative work respects visitors with older Android phones, limited data and motion sensitivity.

## Measured defaults (start here, change only with a written reason)
| Decision | Default | Source |
|---|---|---|
| Body size | 16–20px on mobile, up to 22px on large screens (web range 15–25px) | [Practical Typography](https://practicaltypography.com/summary-of-key-rules.html) |
| Body line height | 1.4–1.6 (120–145% is the print-derived range; screens usually need the upper end) | [Practical Typography](https://practicaltypography.com/summary-of-key-rules.html) |
| Line length | 45–75 characters for body; `max-width: 66ch` is a safe default (hard limit 90) | [Practical Typography](https://practicaltypography.com/line-length.html) |
| All caps | under one line only, add 5–12% letterspacing | [Practical Typography](https://practicaltypography.com/summary-of-key-rules.html) |
| Type scale | modular scale, ratio ~1.2 on mobile rising to ~1.25–1.333 on desktop, generated as fluid `clamp()` | [Utopia](https://utopia.fyi/blog/css-modular-scales/) |
| Spacing | one scale (4px base); more space between groups than within groups | [Refactoring UI, via summaries — unverified against the book] |
| Hierarchy | size + weight + colour together; check in grayscale and with a squint test | same |
| Families | 1–2; if two, clearly distinct roles | `[Studio rule]` |
| UI motion | feedback ~100ms; larger changes 200–300ms; exits shorter than entrances; default ease-out | [NN/g](https://www.nngroup.com/articles/animation-duration/) |
| Tap targets | ≥ 24px, ≥ 44px on mobile; mobile inputs ≥ 16px font | [Vercel](https://vercel.com/design/guidelines) |
| Alignment | every element aligns to grid, baseline, edge or optical centre; 1px optical nudges allowed | [Vercel](https://vercel.com/design/guidelines) |

These numbers make output *correct*, not distinctive. Distinctiveness comes from the tests above and the brief.

## Anti-template audit
Mark every item present without a brief-specific rationale: oversized center-aligned statement; two indistinguishable hero CTAs; three nearly identical rounded icon cards; purple/pink gradient; excessive glass panels; robotic 'innovative solutions' copy; serif+cream used solely as a premium shortcut; every section animated upward; meaningless random 3D; placeholder testimonials; fake review logos; faux trust stats.

**Important:** No individual font, palette, grid, or motion pattern is forbidden. Slop arises from unexamined combinations and fabricated specificity. A restrained Inter-based editorial site can be excellent when photos, copy and navigation are distinctly the client's.

## Art-direction board (complete in 15 minutes)
| Axis | Decision | Reference evidence |
|---|---|---|
| Meaning | The central idea in one sentence | Quote, product or founder observation |
| Tone | Three traits and their opposites | Audience needs |
| Type | Display/reading families and exact reasons | Material/brand voice |
| Palette | 4–6 named functional colours | Real photo/packaging/environment |
| Layout | Composition rule + one intentional exception | Subject matter and hierarchy |
| Image | Subject, lens/crop/grade, prohibited imagery | Available real assets |
| Motion | One hero/story motif + UI motion rules | What must be demonstrated |
| Copy | Voice example, concrete facts, banned clichés | Customer words |
| Action | Primary CTA and friction to minimize | Business goal |

## Three route rule (new sites, pages and redesigns only)
Before coding a new concept, produce **A: restraint**, **B: expressive**, **C: unexpected but on-brand**. Each should differ in composition *and* original visual idea, not simply fonts or hex colors. Score each 1–5 on brand fit, clarity, distinctiveness, execution cost, mobile resilience. Choose and record why.

## Quick self-critique prompts
- If I remove gradients, custom cursor and animations, does the concept still exist?
- Could the hero image and headline be pasted onto a competitor's page unchanged?
- Which one distinctive detail is based on something a customer actually noticed?
- What would a prospective buyer want to know before they contact this business?
- Which visual device exists mainly because an AI model suggested it?
