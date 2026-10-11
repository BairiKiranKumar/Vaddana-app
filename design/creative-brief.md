# Creative Brief & Approval Record — Vaddana (వడ్డన)
**Project:** Vaddana, QR table ordering  **Client:** own product (Arav Web Studio)  **Decision owner:** Kiran  **Target launch:** pilot at end of Phase 2 (about week 5)
**Scope:** diner menu, staff live board, kitchen board, admin, marketing site
**Business KPI:** PLACEHOLDER — suggested: pilot restaurants live and paying; % of orders placed by QR vs waiter; order-to-kitchen time

> **Source of truth for product detail:** `../design.md` (10 Oct 2026). Read it before any UI, i18n, token or print work. This brief summarises it and records decisions and locks; if the two disagree, ask Kiran.
> **Missing:** the "build spec" that `design.md` cites for payments, schema and compliance is not in this repo. Do not invent schema, payment or GST behaviour; ask for it.

## Existing features that must not change
Status: pre-build, no app code yet. These are **locked decisions**; changing one needs Kiran's written approval in `DECISIONS.md`.
- Stack: Next.js App Router, Supabase in Mumbai (`ap-south-1`), Tailwind + shadcn/ui. Tailwind only, no styled-components.
- Telugu-first from Phase 0: every diner-facing text field translatable; never auto-translate dish names; Telugu fallback to English, never an empty line.
- Veg green and non-veg brown are reserved for food marks. Brand accent is never green, red or brown.
- No WebGL, video backgrounds or scroll effects on diner, staff, kitchen or admin. Rich motion only on the marketing site.
- Diner ordering needs no app and no login.
- Digits stay Western Arabic (0–9) in both languages.
- No machine-translated UI copy ships; native review first.
- Real data only in designs, demos and screenshots (realistic Telangana menu, ₹ prices).

## 1. The one-page strategy
- **Business truth in real words:** PLACEHOLDER — fill from pilot owner interviews (`research-kit.md` section A).
- **Target visitors and situations:**
  - Diner: own phone, seated, possibly poor Wi-Fi/4G, mixes Telugu and English.
  - Waiter/captain: tablet or phone, rushing during peak hour.
  - Cook: wall tablet, reading from 1–2 m away.
  - Owner: laptop, calm, wants sales and menu control; may prefer English for tools.
  - Prospective owner (marketing site): deciding whether to trust and pay.
- **Primary action per surface:** menu = add item; cart = send to kitchen; staff board = confirm order; kitchen = mark ready; admin = keep menu correct; marketing = WhatsApp enquiry.
- **Visitor's main anxiety:** PLACEHOLDER — hypotheses to test: diner "did my order really reach the kitchen?"; owner "will this slow my staff or lose orders at rush hour?"
- **The actual reason to believe us:** Telugu-first menus and Telugu KOTs that print correctly; built locally in Nizamabad. PLACEHOLDER until a pilot proves it.
- **Source evidence:** `../design.md` sections 2–3, 6, 8. No customer evidence yet.
- **One-line concept:** "Vaddana feels like a well-run Telangana restaurant counter because it speaks the diner's language and never makes anyone wait." (draft; confirm after research)
- **Anti-competitor test:** PLACEHOLDER — compare against what pilot restaurants already use (`research-kit.md` section D).

## 2. Three distinct concept routes
Applies to the **marketing site** and the **platform look**. Product surfaces already have their direction (design.md section 5: content is the interface, ink and paper, one accent). Fill after the pilot visits.

| Route | Metaphor | Typography & composition | Photography / original asset | Motion idea | Mobile | Brand fit (1–5) | Risk |
|---|---|---|---|---|---|---:|---|
| A — restrained | | | | | | | |
| B — expressive | | | | | | | |
| C — surprising | | | | | | | |

**Approved:** PLACEHOLDER

## 3. Asset plan
| Asset | Why this asset earns its place | Origin / permission | Mobile crop | Target size | Status |
|---|---|---|---|---|---|
| Phone recording of a real Telugu order flow | Marketing hero; proof the product works | Pilot restaurant, with permission | 9:16 | under 3 MB, poster under 200 KB | Not started (Phase 5) |
| Real menu photos from pilot | Diner menu demo, screenshots | Pilot restaurant | 1:1 | WebP/AVIF, responsive | Not started |
| One Telangana reference (Pochampally ikat or Nirmal) | Marketing site and printed table stands only, used once | Licensed or commissioned | — | SVG | Not started |
| Bilingual table QR stand | "Scan to order / ఆర్డర్ చేయడానికి స్కాన్ చేయండి" | Own design | print | PDF | Not started (Phase 1) |

## 4. Section blueprint
See `../design.md` section 8 for each surface's screens. Marketing site (Phase 5):

| Order | Visitor question answered | Key truthful copy/proof | Layout motif | One action |
|---|---|---|---|---|
| 1 Hero | What is this and is it for my restaurant? | Real phone recording in Telugu | PLACEHOLDER | WhatsApp |
| 2 How it works | How hard is it for my staff? | Three real screens | | |
| 3 Proof | Does anyone nearby use it? | Pilot restaurant, with permission | | |
| 4 Pricing | What does it cost? | Real pricing | | |
| 5 FAQ / objections | Printer, UPI, Telugu, internet failure | Answers from pilot | | |
| 6 Action | How do I start? | WhatsApp | | WhatsApp |

## 5. System decisions
**Type roles:** UI/body Noto Sans Telugu + Latin grotesk TBD (tabular numerals, not Inter by default); display Ramabhadra; editorial Tiro Telugu (marketing only). Telugu line height ≥ 1.6. No letter-spacing, all-caps or faux bold on Telugu.
**Colour roles:** in `tokens.json` (from design.md section 7, contrast-fixed: ink-3 and warn darkened to pass AA; input borders use opaque `lineStrong`; see `DECISIONS.md`).
**Visual motif:** ink and paper, one indigo accent; one Telangana craft reference on marketing and print only.
**Image direction:** real dishes and real restaurants; no clipart, leaves, rangoli, temples.
**Voice:** short, human, Telangana Telugu as spoken (English loanwords fine); no em dashes in UI copy.
**Signature moment:** marketing site only; PLACEHOLDER until Phase 5 (`motion-spec.md`).
**Reduced motion/mobile:** every surface drops to opacity fades or none (design.md section 6 budgets).

## 6. Technical contract
**Stack:** Next.js App Router, Supabase (`ap-south-1`), Tailwind v4, shadcn/ui, Next.js dictionary i18n (`lib/i18n.ts`; recommended over next-intl, see `DECISIONS.md`).
**CMS/content owner:** restaurant owners via admin.  **Hosting/domain owner:** PLACEHOLDER (domain not yet checked).
**Baseline:** WCAG 2.2 AA, server-rendered menu text, `lang="te"`/`"en"` on page and mixed fragments, every state designed (design.md section 10).
**Performance budget:** diner menu LCP < 2.5 s on mid-range Android over 4G with Telugu fonts; route JS < 150 KB gzipped; max two Telugu font weights, subset; staff board shows new order within 2 s.
**Testing:** E2E tests guard diner order, kitchen live order, UPI states and menu edit once built. Test runs use a separate Supabase project and mocked/sandbox payments, never production. No agent may skip, delete or weaken assertions in those tests without approval.

## 7. Three signoffs
- [ ] Content/truth approval — native Telugu review of name and UI strings — Kiran/date
- [ ] Creative route + tokens approval (Phase 0 exit) — Kiran/date
- [ ] Responsive prototype/CTA acceptance (Phase 2 exit, real phones, throttled) — Kiran/date

**Unresolved:** see `../design.md` section 12 (name sign-off, domain/trademark, Lucid GL source, marketing scope, pilot details, Latin typeface) plus the missing build spec.
**Next owner:** Kiran (pilot visits).  **No-go items:** WebGL or video on product surfaces; machine-translated UI copy; invented testimonials or metrics.
