# Research confidence and Claude memo comparison
**Labels:** `Verified primary` = confirmed against original authoritative page. `Agency self-report` = directly claimed by creator/client but not independently audited. `Studio policy` = our chosen default, not externally proven. `Unresolved` = needs first-party verification before public posting.

| Claim / item | Status | Correction or nuance | Reference |
|---|---|---|---|
| LCP 2.5s, INP 200ms, CLS 0.1 at p75 | Verified primary | Field, mobile and desktop separately | https://web.dev/articles/vitals |
| Autoplay moving content >5s parallel needs pause/stop/hide | Verified primary | Nonessential auto-start content; exceptions in criterion | https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html |
| Interaction animation 2.3.3 is Level AAA | Verified primary | Accessibility default can exceed contractual WCAG AA | https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html |
| Five users per usability round | Verified primary | Applies to **qualitative** testing; important exceptions | https://www.nngroup.com/articles/how-many-test-users/ |
| Scroll-triggered main text delays readers | Verified primary | Secondary visual content and one-time animations preferred | https://www.nngroup.com/articles/scroll-animations/ |
| Vercel advocates focus rings/hit targets/reduced motion | Verified primary | Guidance, not necessarily law; some values exceed WCAG | https://vercel.com/design/guidelines |
| DTCG Design Tokens 2025.10 format | Verified primary | Community-group report, NOT W3C Recommendation/Standards Track | https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/ |
| Eames team visited real collection; accessible CMS | Agency self-report | Strong qualitative studio insight | https://www.instrument.com/work/eames-institute/ |
| Pinterest 3 research rounds / refined audience | Agency self-report | Method is clear, outcome not independently measured | https://www.instrument.com/work/pinterest-business |
| Oura post-launch conversion/performance numbers | Agency self-report | Never generalize its metrics to client projects | https://www.instrument.com/work/oura-smart-ring |
| Webby research uncovered category discovery issue | Agency self-report | Useful IA process example | https://www.basicagency.com/case-studies/the-webby-awards-website-design |
| Alireza palm motif and Cartier clock motif | Agency self-report | Strong examples of brand-linked narrative motion | https://immersive-g.com/projects/alireza/ ; https://immersive-g.com/projects/cartier-in-time/ |
| Lusion has discovery, R&D, 3D optimization | Agency self-report | Confirmed studio capabilities, not universal order | https://v2.lusion.co/about/ |
| '1 expensive interaction per page' | Studio policy | Helpful restraint; may have justified exceptions | Internal quality gate |
| '2 fonts only' | Studio policy | Hierarchy matters more than arbitrary font count | Internal brand process |
| '150–250 KB critical JS' and video 1–3 MB | Budget hypothesis | Measure, tune for connection/device/content | Internal performance experiment |
| Under 100 draw calls always | Unresolved / heuristic | Not an absolute, hardware/shaders/scene matter | Must benchmark target devices |
| WebGPU 2026 exact browser coverage | Unresolved | Use feature detection and fallback; re-check Can I Use/MDN | https://developer.mozilla.org/ |
| Agency site awards = commercial success | Not established | Creative recognition and business ROI are different variables | Do not claim otherwise |
| Instagram engagement signal rankings and weightings | Unresolved/time-sensitive | Recheck official creator communications and analytics | Do not present precise weights |
| Metricool/plugin 'connected in this workspace' | Unverified operational claim | Do not assume any connection | Check before use |
| A given AI-font combination 'proves slop' | Opinion, not fact | Distinctive content/strategy is the actual goal | Local critique rule |
| DTCG 2025.10 colour `$value` must be an object (`colorSpace`, `components`, optional `hex`), not a hex string | Verified primary (v1.1) | v1.0 example tokens used hex strings; fixed and now checked by `craft/qa/validate_tokens.py` | https://www.designtokens.org/tr/2025.10/color/ |
| Vercel: *prioritize* `transform`/`opacity` | Verified primary (v1.1) | Claude memo said "only"; corrected to "prefer" | https://vercel.com/design/guidelines |
| Instrument Eames CMS | Agency self-report (v1.1) | Case says "simple to use, highly maintainable" CMS with a scalable component system, not "composable"; wording fixed | https://www.instrument.com/work/eames-institute/ |
| Claude Code reads `AGENTS.md` (v2.1.277+) when no `CLAUDE.md` exists; `CLAUDE.md` can import it with `@AGENTS.md` | Verified primary (v1.1) | Pack ships `CLAUDE.md` importing `AGENTS.md`, which works on all versions | https://code.claude.com/docs/en/memory |
| Codex reads `AGENTS.md` from `~/.codex` and root-to-cwd, 32 KiB combined default limit | Verified primary (v1.1) | Keep `AGENTS.md` short; deep files are read on demand | https://learn.chatgpt.com/docs/agent-configuration/agents-md |
| Vercel Web Interface Guidelines licence | Verified primary (v1.1) | MIT, Copyright (c) 2025 Vercel Labs; vendored unmodified with licence file | https://github.com/vercel-labs/web-interface-guidelines |

## How we publish credible lessons
`Studio states X` → link first-party case. `We infer Y` → label as interpretation. `We tested Z` → show actual code, device, screenshot, benchmark and date. **No fabricated interview quotes, accessibility certifications, client results or agency processes.**

## Open research queue
- Verify Active Theory's individual 2018 Awwwards case if citing implementation minutiae beyond Webby Xbox process.
- Collect **independent** real-device performance tests of selected showcase sites (not just screenshot awards).
- Test three audience groups in Telangana/Andhra business niches, comparing polished but simple vs experimental landing pages. Avoid overclaiming tiny tests.
- Validate the real benefit of 3D for commerce locally rather than presuming it improves enquiries.
- Check platform and browser support before teaching new CSS/WebGPU syntax publicly.
