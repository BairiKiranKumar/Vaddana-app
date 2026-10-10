# Motion Spec — one interaction per file
**Feature:** [ ] **Author/date:** [ ] **Brand meaning:** [ ] **Visitor question it serves:** [ ]

## Moment description
“When the user [specific trigger], [element] [specific response], expressing [brand/UX purpose].”

| Field | Exact decision |
|---|---|
| Entry condition | load / click / hover / element visibility / scroll progress |
| Elements | selectors and semantics |
| Properties | transform / opacity / clip path / shader / camera |
| Start and end values | e.g., y=24px → 0px, opacity=.6 → 1 |
| UI duration/ease | ms and named curve; scroll-linked has no clock duration |
| Stagger | ms per element, max wait |
| Scroll range | start/end relative to section, pin yes/no |
| Repeat behavior | once / reversible; stop/reset semantics |
| User interruption | clicks, Escape, scroll reversal, navigation |
| Responsive variant | mobile composition, no hover dependency |
| Reduced-motion | static content, which parts disappear or become crossfade |
| No-JS and slow network | fully readable fallback / poster |
| Performance | expected assets, GPU work, cleanup, device check |
| Accessibility | focus, pause control, alt text, reading order |

## Prototype acceptance
- [ ] Animation communicates something meaningful, rather than simply proving tech skill.
- [ ] No main copy or action waits for reveal.
- [ ] Tested keyboard, mobile, reduced motion, performance, pause.
- [ ] Any autoplaying >5s moving beside content has usable user control.
- [ ] Recorded 10–15s desktop and mobile demo with credited source if inspired by studio work.

## Implementation ticket
**Tech selected:** [CSS / WAAPI / GSAP / video / sequences / WebGL]  
**Why lighter option failed:** [ ]  
**Owned by:** [ ]  **Fallback approved by:** [ ]  **Risk status:** [ ]
