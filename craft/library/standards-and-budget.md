# Engineering, Quality and Accessibility Standards
**Primary sources:** [web.dev Web Vitals](https://web.dev/articles/vitals), [W3C Pause/Stop/Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [W3C Motion](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [Vercel Guidelines](https://vercel.com/design/guidelines).

## Non-negotiable real-world outcomes
- **LCP ≤ 2.5s**, **INP ≤ 200ms**, **CLS ≤ 0.1** at the **75th percentile** of real page loads, segment mobile/desktop; these are Google's published *good* Core Web Vitals thresholds.
- Do not declare INP passed based on Lighthouse lab alone. Record lab Total Blocking Time as a proxy, and use CrUX/RUM for field INP when there is enough traffic.
- Implement semantic landmarks, labelled forms, focus-visible rings, skip-link where appropriate, keyboard-accessible navigation, errors that explain recovery, and logical tab order.
- WCAG 2.2 SC **2.2.2 Level A:** automatically starting moving/blinking/scrolling content that continues beyond 5s **in parallel with other content** requires a way to pause/stop/hide unless essential. This applies to typical looping background hero videos. Make the pause button usable by keyboard.
- WCAG 2.2 SC **2.3.3 Level AAA:** nonessential interaction-triggered animations can be disabled. Adopt `prefers-reduced-motion` as an internal default even if contract requires AA, and provide static alternatives.
- Make sure motion does not hide meaningful content, force scrolling, or prevent ordinary browser behavior.
- Avoid `transition: all`; prefer compositor-friendly properties for *frequently running* transitions. Test other animated properties based on actual paint costs.

## Initial asset budget [Hypothesis: adjust by project]
| Asset | Baseline budget, not a universal rule | What to do if it fails |
|---|---|---|
| Critical JS | aspire to ≤ 200–250 KB compressed transfer before interaction (measure!) | split third-party/3D bundles; reduce client components |
| LCP/poster image | aspire to 150–250 KB mobile variant | responsive sources, AVIF/WebP and art-directed crop |
| Cinematic hero video | strive for 1–3 MB mobile when viable | short loop, better codec/compression, disable on mobile |
| Fonts | 1–2 families, subset needed languages/weights | system fallback, avoid loading unused styles |
| WebGL scene | separate lazy-loaded chunk | poster equivalent, low-power downgrade |

The source memo contains similar asset budgets; they are **starting experiments**, not claims from web.dev. Distinctive brand imagery may legitimately exceed them if the real-device experience remains good.

## QA matrix
| Test | Method | Fail condition |
|---|---|---|
| Real-device first view | Mid-range Android with network throttling, iPhone Safari | blank frame, invisible headline, unreadable CTA |
| Browser/responsive | 320, 375, 768, 1024, 1440 CSS px plus real device | overflow, broken crops, inaccessible modal |
| Keyboard | Tab, Shift+Tab, Enter, Escape, focus restoration | trap, missing focus ring, unreachable CTA |
| Reduced motion | Enable OS preference then reload | text missing, auto-parallax, unavoidable WebGL journey |
| Autoplay | Hero loops over 5s with surrounding content | no user control, control inaccessible |
| Media fallback | Disable JS / slow load / video failure | essential offer inaccessible |
| Data + copy | Verify every name, quote, metric, policy, address | invented testimonial or unapproved statement |
| Main task | Ask someone new to enquire/book/buy | confusion or abandonment caused by design |
| Performance | Lighthouse lab + Chrome DevTools + field vitals when available | knowingly misses vital without documented tradeoff |
| SEO baseline | unique title, proper h1, indexable content, metadata, sitemap as needed | important content only in a JS canvas |

## Who runs each check
| Check | Agent can run | Command / tool | Human must run |
|---|---|---|---|
| Responsive screenshots 320–1440px, normal + reduced motion | Yes | `node craft/qa/screens.mjs <url>` | Final visual sign-off |
| Horizontal overflow, missing alt, unnamed buttons, h1 count, autoplay-without-pause heuristic | Yes | same script, `qa-report.json` | Fix judgement on edge cases |
| Lab performance (LCP, TBT, CLS) | Yes | `npx lighthouse <url> --form-factor=mobile` (see `craft/qa/qa-commands.md`) | — |
| Token file validity | Yes | `python3 craft/qa/validate_tokens.py tokens.json` | — |
| Keyboard walkthrough | Partly (scripted Tab order) | Playwright | Yes, by hand |
| Real Android + iPhone Safari | No | — | Yes |
| Field Core Web Vitals (CrUX/RUM) | No, needs real traffic | PageSpeed Insights field section | Yes |
| Five-person task test | No | — | Yes |

## Contrast notes for tokens
- Text: 4.5:1 minimum for body text, 3:1 for large text (WCAG 1.4.3).
- Input borders, focus rings and other UI boundaries people must see: 3:1 against the adjacent colour (WCAG 1.4.11). Decorative divider lines are exempt; keep a separate `borderStrong` token for inputs.

## Project-specific locks
Locks for a particular project (for example an approved hero video or a booking section) belong in that project's `creative-brief.md` under "Existing features that must not change", never in this shared library.
