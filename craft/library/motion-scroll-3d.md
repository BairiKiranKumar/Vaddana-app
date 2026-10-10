# Motion, Scroll and 3D Decision Library
**Never start from a GSAP effect. Start from the visitor's question and the visual story.** The durations/limits below are studio defaults unless labelled as externally supported research. Sources: [NN/g animation](https://www.nngroup.com/articles/animation-duration/), [NN/g scroll](https://www.nngroup.com/articles/scroll-animations/), [Vercel guidelines](https://vercel.com/design/guidelines), [Chrome scroll-driven](https://developer.chrome.com/docs/css-ui/scroll-driven-animations), [Lenis](https://github.com/darkroomengineering/lenis), [Codrops](https://tympanus.net/codrops/category/tutorials/).

## Decision flow
1. **Is motion necessary?** If no → static composition.
2. **Does it convey UI feedback?** CSS transition / WAAPI; aim ≈100–300ms for common interface actions (NN/g starting range, adjust by size/context).
3. **Does it demonstrate a transformation or brand narrative?** Short video (usually cheapest) or scroll-linked still sequence with poster.
4. **Must users manipulate the object in real time?** Consider WebGL (Three.js/R3F) or Spline; only after prototype and fallback.
5. **Will it delay content, make a user dizzy, or compromise mobile?** Stop, simplify, or use a no-motion variant.

## Technique catalog — implementation briefs
| Technique | Trigger → response | Good use | Cost/escape hatch |
|---|---|---|---|
| Microfeedback | click/hover → CSS transform or opacity, 100–250ms | buttons/forms | low; instantly functional without animation |
| Editorial image reveal | image intersects viewport → masked reveal, once | gallery-led brands | low-medium; image is visible by default |
| Sticky media story | progress through copy → 2–4 media swaps | multi-step process | medium; stack content on mobile |
| Card stack | scrolling into section → successive sticky transforms | 3–5 ordered steps | medium; normal vertical sections on mobile |
| Split display headline | page load → line/word entrance once | ONE major brand moment | low-medium; full text readable on first frame |
| Video atmosphere | load → muted poster-backed clip | real products/places and mood | medium; pause button, no-motion poster |
| Product turntable | scrub scroll → pre-rendered frames | hero showing product shape | heavy media; video/still fallback |
| Pinned horizontal story | wheel/trackpad → horizontal gallery | optional visual exhibit | high UX risk; native vertical on mobile |
| 3D interaction | drag/click → inspect important object | customization/story requires depth | high; poster and equivalent content |
| Page transition | link navigation → short shared transition | creative portfolio with more than one page | medium; navigation must never be blocked |

## Scroll-linked vs scroll-triggered
- **Scroll-triggered** starts a clock-based animation when a point is reached. Use for a small amount of *secondary* supporting content; fire once.
- **Scroll-linked** maps progress to the actual scroll position. Reverse correctly, preserve anchor navigation, and never hide essential content behind a scroll threshold.
- **Scroll hijacking** and forced snapping are default reject for lead-generation websites.
- Native CSS `scroll()` / `view()` are candidates where the browser/feature support meets project needs; otherwise CSS/GSAP with progressive enhancement.

## Motion tokens [Our initial defaults, not standards]
| Layer | Duration | Easing | Constraints |
|---|---|---|---|
| `ui.fast` | 120ms | ease-out | focus, toggle, confirmation |
| `ui.normal` | 220ms | cubic-bezier(.22,1,.36,1) | menus, dialogs; user can interrupt |
| `ui.long` | 300ms | ease-out | substantial layout change, rare |
| `story.reveal` | 600–850ms | ease-out | optional once per major scene, never blocks content |
| `story.stagger` | 40–70ms/element | ease-out | cap the group's total wait |
| `scroll.linked` | 0ms clock time | tied to user progress | reduced-motion alternative required |

## Sample spec: photo-story sticky crossfade
- **Purpose:** Explain 3 real preparation stages of a pickle brand in customer-friendly order.
- **Trigger:** Enter narrative section, scroll 0–100% of section; user-scroll drives progress.
- **Desktop:** Left editorial text (all visible/accessible); right sticky photo stage crossfades at stage boundaries. No pin beyond final content.
- **Mobile:** Standard vertical step cards; each has its own photo. No pinning, no motion-dependent explanation.
- **Accessibility:** Respect `prefers-reduced-motion`; all text visible; photos have meaningful alt text; anchors work.
- **Performance:** Photos AVIF/WebP sized for actual display; next frame prefetched selectively; measure CLS and scroll smoothness on mobile.
- **Fallback:** Plain vertical steps, no script required.

## Medium selection (these are project tradeoffs, not universal rankings)
| Medium | Use for | Avoid if | Verification |
|---|---|---|---|
| CSS/SVG | UI, typography, masks and light illustration | complex photoreal dynamics | 60fps target by profiling on real device |
| Video w/ poster | fixed cinematic camera, atmospheric hero | needs genuine manipulation | LCP poster, file weight, pause, captions when informative |
| Image sequence | exact scroll frame control | asset count blows budget | compressed files, mobile substitute |
| Spline | rapid editable interaction exploration | embed too heavy or limited control | test devices, accessibility and asset loading |
| Three.js/R3F | real interaction with depth, shaders needed | decorative static shot adequate | profiler, code split, quality presets, WebGL fallback |

**3D operating rules [Studio rule]:** no more than one expensive immersive scene per page; no forced loading screen; no essential copy inside a canvas only; suspend offscreen rendering; use compressed glTF and textures when supported; cap pixel ratio experimentally; test GPU/power/battery. A purported universal <100 draw-call limit is too simplistic: profile on target devices.

## Inspiration decomposition file format
```
site / studio / URL / date reviewed:
brand truth + audience:
stated business problem (quote/link):
observed moment:
trigger / element / property / timing / easing:
likely tech [guess, not verified]:
why it serves the message:
content/keyboard/reduced-motion/mobile behavior:
performance cost / possible fallback:
what to learn (not the look):
where it would be harmful:
proof source and confidence:
```
