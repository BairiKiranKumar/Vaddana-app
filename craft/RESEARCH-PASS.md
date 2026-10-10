# Independent GPT research pass: how distinctive digital studios work
**Date:** 11 October 2026  
**Purpose:** Complement and critically compare the attached *Agency-Grade Web Design Research (Claude)*.  
**Method:** Read studio-owned case studies, official guidelines, W3C/web.dev/NN/g, developer documentation; classify case-study interpretations as ours. The included research is selective, not an exhaustive survey or controlled cross-agency study.

## Executive thesis
A premium site is not defined by 3D, serif type, brutalism, sticky cards or WebGL. It is defined by a coherent answer to five questions: **Who is it for? Why should that visitor care? What is unmistakably this brand? What must the visitor do next? What works on a normal phone?** The creative idea comes from evidence, the system repeats it, and the interface makes the action easy. 

## What the extra primary research adds to Claude
1. **Research is visibly embedded in premium art direction.** Instrument's Eames Institute team visited the collection and drew the experience concept from the original object's context, then paired it with a maintainable CMS, a scalable page and component system, and components tested to WCAG 2.1 AA. [Studio account](https://www.instrument.com/work/eames-institute/).
2. **Premium isn't always maximalist.** BASIC/DEPT's Webby Awards work focused on discoverability, navigation and cross-category research. Their Patagonia study similarly emphasizes purposeful, mobile-first product education and design-system utility. [Webby](https://www.basicagency.com/case-studies/the-webby-awards-website-design), [Patagonia](https://www.basicagency.com/case-studies/patagonia-ecommerce-website).
3. **Signature motifs come from the brief.** Immersive Garden's Alireza uses a palm-tree journey to embody heritage, while its Cartier In Time uses a twelve-hour clock structure to organize twelve films. These are different interactions because the *messages* differ. [Alireza](https://immersive-g.com/projects/alireza/), [Cartier](https://immersive-g.com/projects/cartier-in-time/).
4. **Brand, engineering, and operations converge.** Locomotive's studio manifesto explicitly describes an integrated operations/design/development model, and its Structured case uses a simple concept of material transformation rather than miscellaneous movement. [Agency](https://locomotive.ca/en/agency), [Structured](https://locomotive.ca/en/work/structured).
5. **Research also determines whose needs to prioritize.** Instrument describes three rounds of user research/testing for Pinterest Business, leading to focus on smaller retailers and creators. Its Oura case ties content architecture and product demonstrations to the purchase journey. Agency outcome claims are self-reported. [Pinterest](https://www.instrument.com/work/pinterest-business), [Oura](https://www.instrument.com/work/oura-smart-ring).
6. **The technical specialists themselves start with pipeline discovery.** Lusion describes discovery, technical direction and R&D before 3D content production. [Lusion](https://v2.lusion.co/about/).
7. **Navigation and visual drama are not interchangeable.** NN/g's scroll-animation research documents usability friction when the essential body text waits for animation. [NN/g](https://www.nngroup.com/articles/scroll-animations/).

## Nine principles synthesized from the cases (our interpretation, not studios' quoted rules)
| Principle | Observed evidence | Implementation at @kiranbuildswithai |
|---|---|---|
| Start in the world, not Figma | Eames field visit; Pinterest user testing | Collect customer words, product photos, physical references |
| Invent a brand-relevant governing metaphor | Alireza palm; Cartier clock | Write `concept = brand truth → interaction rule` |
| Clear meaning before effects | Webby IA; Patagonia education | Headline, trust and CTA understandable with JS off |
| Single signature moment | Studio projects tie spectacle to narrative | Limit high-cost treatments to one per page [Studio rule] |
| Consistent systems, not repetitive templates | Instrument scalable content; BASIC design systems | Reuse tokens and QA rules; vary structure and art direction |
| Art direction must include original material | Eames collections; Oura CGI/photos | Shoot, scan, document, or commission concrete assets |
| Prototype hardest risk before production | Instrument Nike SNKRS prototype; Lusion pipeline | Test mobile/browser viability before deep build |
| Accessibility is part of the creative brief | Instrument Eames accessibility; W3C | Design no-motion and keyboard variants at concept time |
| Publish the reasoning and the result | Studios explain challenge/approach | Case studies and educational Threads use evidence, not hype |

## Agreement with the Claude research
**Strong agreement (supported by multiple primary sources):** research before UI; user journey dictates page hierarchy; visual discipline and typography matter; purposeful motion; genuine brand assets; design systems; accessible controls; measurable Core Web Vitals; separate high-cost motion from everyday UI; client-side review and documented rationale. See `craft/library/source-audit.md` for exact sources.

**Preserve as tactics, not universal laws:** 2 fonts, 1 costly effect, >3 competitor reviews, 5 testers, 150–250 KB JS, under 100 WebGL draw calls, 3–5 Threads posts a week. Useful starting budgets, not proof of premium quality and not applicable universally.

**Refine / correct:**
- Claude describes interface animation as `transform` and `opacity` only; these are *preferred for performant motion*, not an absolute prohibition on animating other CSS properties. Avoid expensive layout/paint animation in hot paths; verify each effect with profiling. [Vercel](https://vercel.com/design/guidelines).
- Five users is a **qualitative usability-testing** heuristic, not the correct sample for representative quantitative evidence. [NN/g](https://www.nngroup.com/articles/how-many-test-users/).
- W3C SC 2.3.3 is **AAA**; it is not an AA conformance requirement, though supporting reduced motion is our recommended baseline. SC 2.2.2 is **A**. [W3C 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
- Awwwards recognition, agency narratives, and showcase visuals do **not** by themselves establish conversion lifts or independently verified business performance.
- An AR/3D demo might be appropriate for a tech art portfolio, but is usually unjustified for a dentist or school enrollment funnel without a strong client-specific story.
- 'Inter / serif / cream / purple' alone does not establish AI slop. A distinctive *system and content* matters more than policing individual fonts and colours.
- Claimed Instagram algorithm weights, specific 2026 browser support figures and 'Metricool is connected' in Claude's memo should not be treated as verified operational inputs. Always re-check platform metrics/features before public claims.

## The distinctive site algorithm
`Business reality → evidence → visitor's unresolved question → creative concept → art-direction rules → content map → tech choice → responsive prototype → critique → case study → social micro-lessons`.

## Business adaptation: three service levels [Our proposed operating model]
| Service | Best for | Non-negotiables | Signature treatment |
|---|---|---|---|
| Essential | Small local businesses, urgent launch | Interview, clear offer, authentic photos, responsive site, one direct CTA | CSS transitions/visual composition |
| Signature | Portfolio-forward local premium brand | Research notes, 2–3 art routes, content plan, rich bespoke visuals, motion prototype | One scroll narrative or cinematic sequence |
| Experimental | Public spec concept, exceptional brand fit | All Signature gates + measured mobile fallback | WebGL or procedural scene only if justified |

Price these from scoped effort and actual constraints. Do not imply any studio's published fees are comparable to your local client pricing. An experimental spec build is a marketing investment, not a default client deliverable.

## Where to go deeper
`craft/library/studio-atlas.md` documents studio-by-studio patterns; `craft/library/motion-scroll-3d.md` is the motion decision chart; `craft/library/source-audit.md` separates verified facts from heuristics. **This is v1, not a completed research universe**; keep collecting new site decompositions weekly.
