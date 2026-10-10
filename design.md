# Vaddana (వడ్డన): Design Document

> QR table ordering for restaurants in Nizamabad, Telangana. Scan, order, pay, manage.
> Stack: Next.js (App Router) + Supabase (Mumbai, `ap-south-1`) + Tailwind + shadcn/ui.
> Status: pre-build. Companion to the build spec (payments, schema, compliance).
> Last updated: 10 Oct 2026.

---

## 1. Name

**Vaddana (వడ్డన)**, Telugu for serving food, the word for serving at a meal or a feast.

Why it works:

- It names exactly what the product does, in the language of the target market.
- Three syllables, easy to say for Telugu, Urdu/Dakhni and English speakers in Nizamabad.
- Reads well as a bilingual wordmark: **వడ్డన** above or beside **Vaddana**.
- Feels local and warm without being a cliché, and does not collide with common restaurant names.

**Confirm with a native speaker before branding.** The meaning above is my understanding of the word, not checked against a dictionary. Kiran, as a Telugu speaker, should confirm the word reads naturally in Telangana usage.

### Conflict check (web search, 10 Oct 2026)

| Candidate | Meaning | Conflict found | Verdict |
| --- | --- | --- | --- |
| **Vaddana (వడ్డన)** | Serving food | None in restaurant software. Unrelated jewellery app "V'DANA" exists | **Recommended** |
| Vindu (విందు) | Feast | None in ordering software | Backup. Short and warm, but generic and likely already a restaurant name locally, which could confuse owners |
| Vistari (విస్తరి) | Leaf plate | Close to "Vista Serve" (a restaurant ordering app) and "Vistify" (a digital menu platform) | Rejected: too close to existing products |
| Vaddinchu (వడ్డించు) | To serve food | None found | Too long for a wordmark |

**Not verified:** domain availability (`vaddana.in`, `vaddana.app`, `getvaddana.com`) and Indian trademark status (classes 9 and 42). Check a registrar and the IP India public search before any branding work.

---

## 2. Product in one paragraph

Each table has a QR code. A diner scans it, browses the menu in Telugu or English, and orders from their phone with no app and no login. A waiter confirms the order, the kitchen gets a KOT, and the bill builds up across rounds in one table session. The owner manages menu, pricing, tables, staff, payments and sales analytics from an admin dashboard. Full functional scope, schema, payment and compliance details live in the build spec.

---

## 3. Telugu-first localisation

Telugu is not a later-phase translation. It shapes the data model, fonts, layout and printing from Phase 0.

### Languages

| Surface | Default | Options | Why |
| --- | --- | --- | --- |
| Diner menu | Restaurant's choice; diner can switch | తెలుగు, English | Diners in Nizamabad mix both; dish names often read better in Telugu |
| Staff and kitchen | Per staff member | తెలుగు, English | Waiters and cooks may be more comfortable in Telugu |
| Admin | English | English, తెలుగు | Owners often run business tools in English; offer Telugu |
| Marketing site | Telugu-led, English alongside | Both | The pitch lands better in the owner's language |

[Unverified] Nizamabad also has a large Urdu/Dakhni-speaking population. Ask pilot restaurants whether an Urdu menu matters; if yes, plan it as a Phase 6 language with right-to-left layout support.

### Data model

- Every diner-facing text field is translatable: item name, description, category name, variant and add-on names, restaurant tagline.
- Store as `name_te`, `name_en` columns or a `translations jsonb` keyed by locale. Pick one in Phase 0 and use it everywhere.
- Never auto-translate dish names. "Natu kodi pulusu" in Telugu script is the dish; a machine translation into English is not. Admin shows both fields side by side and lets the owner leave English as transliteration.
- Search on the diner menu matches both scripts and common transliterations (biryani, బిర్యానీ).

### UI copy

- Write Telangana Telugu as people actually speak it: everyday English loanwords (order, bill, table, waiter) are normal and clearer than formal Sanskrit-heavy words.
- All Telugu strings go through a native review before release. No machine-translated UI copy ships.
- Starting strings (draft, needs native review):

| Key | English | Telugu draft |
| --- | --- | --- |
| `menu.add` | Add | యాడ్ చేయండి |
| `cart.send` | Send to kitchen | ఆర్డర్ పంపండి |
| `order.confirmed` | Confirmed by staff | ఆర్డర్ కన్ఫర్మ్ అయింది |
| `order.preparing` | Being prepared | తయారవుతోంది |
| `order.ready` | Ready | రెడీ |
| `utility.callWaiter` | Call waiter | వెయిటర్‌ని పిలవండి |
| `utility.requestBill` | Request bill | బిల్ ఇవ్వండి |
| `bill.payUpi` | Pay with UPI | UPI తో పే చేయండి |
| `item.unavailable` | Not available now | ఇప్పుడు అందుబాటులో లేదు |

### Typography for Telugu

Telugu script has tall stacked conjuncts and vowel signs above and below the line. A layout tuned only for Latin will clip it.

- Line height: at least 1.6 for Telugu body text (Latin can stay near 1.5).
- Buttons and chips: size by padding, never fixed heights, so stacked glyphs never clip.
- Never letter-space Telugu, never apply all-caps styling, never use faux bold.
- Test every screen with the longest real Telugu dish names, not lorem ipsum.

Candidate Telugu typefaces, all free on Google Fonts:

| Typeface | Character | Use |
| --- | --- | --- |
| Noto Sans Telugu | Neutral, many weights and widths | UI and body text |
| Ramabhadra | Round, uniform stroke, built for headlines and posters | Display: restaurant name, marketing headlines |
| Mandali | Designed for news publications | Long text, alternative body face |
| Tiro Telugu | Serif | Editorial accents on the marketing site |

The Latin face is chosen in the design-system step to sit comfortably beside the Telugu face at the same size and weight.

### Font loading

Telugu fonts are larger than Latin ones. Load them with `next/font`, subset to the Telugu Unicode range, ship only the weights used (two at most on the diner menu), and load them only when Telugu is the active locale or the page contains Telugu text.

### Printing Telugu

Telugu on paper changes the printing plan:

- **Browser print (HTML) works.** The page renders Telugu with web fonts, then prints.
- **Raw ESC/POS text does not reliably print Telugu.** Most thermal printers have no Telugu glyphs in their built-in fonts. A silent-print bridge must send the receipt as a rendered image (QZ Tray supports pixel printing), not as raw text.
- Test the pilot restaurant's printer with a Telugu KOT in Phase 2, before committing to a print path.

### Local visual cues (restrained)

- No banana-leaf graphics, temple outlines or festival clipart on product screens. They read as decoration, not design.
- Telangana's own crafts give a quiet, specific reference for the marketing site and printed table stands: Pochampally ikat (indigo and madder), Nirmal paintings. One pattern, used once, done well.

---

## 4. Design and build toolkit

Every tool below has a defined job and a defined surface. A tool used outside its surface is a review failure.

| Tool | What it is (verified) | Job in Vaddana | Surfaces |
| --- | --- | --- | --- |
| **Taste skill** ([Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill), skill `design-taste-frontend`) | Anti-slop frontend skill with adjustable dials for design variance, motion intensity and visual density | Primary design-direction skill. Set dials per surface (section 6). Run its pre-flight before merging any UI | All |
| **UI UX Pro Max** ([nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)) | Design intelligence skill: searchable styles, palettes, font pairings, UX rules; generates a design system from a product brief | Generate the first-pass design system (product type: restaurant ordering / POS), then audit accessibility, touch targets and responsive rules on every screen | All |
| **Lucid GL skill** | **Not verified.** No public skill by this name was found on GitHub or skill registries | Reserved for the one WebGL moment on the marketing site hero, if any. Add the repo link here before use | Marketing site only |
| **motionsites.ai** | Paid prompt library for animated landing pages (prompts, looping video backgrounds, templates). Paid plans from about $149/year | Source prompts and motion patterns for the marketing site. Adapt, never paste whole templates | Marketing site only |
| **21st.dev** | Registry of React + Tailwind components in shadcn registry format; install via "copy prompt" into Claude Code or the shadcn CLI. 2 free copies a day, membership for unlimited | Source individual components (pricing table, hero, number ticker, empty states). Every component is restyled to Vaddana tokens and checked with Telugu text before merge | Marketing site, admin (selectively) |
| **Ponytail** ([DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)) | "Laziest senior dev" skill: before writing code, checks if it needs to exist, if the repo, stdlib or platform already does it. Keeps validation, errors, security and accessibility intact | Gatekeeper against over-building. Run `/ponytail-review` on every PR; run `/ponytail-audit` at the end of each phase | All code |

### How the tools fit together

1. **UI UX Pro Max** proposes a design system from the brief (include "Telugu-first, bilingual" in the brief).
2. **Taste skill** pushes it away from generic defaults and sets the dials.
3. **21st.dev** and **motionsites.ai** supply candidate components and motion.
4. **Ponytail** asks whether each candidate needs to exist. A native `<input type="date">`, `<dialog>` or `<details>` beats an imported component.
5. **Taste skill pre-flight** plus **UI UX Pro Max** audit before merge, run in both Telugu and English.

### Known tensions, resolved up front

- **21st.dev and motionsites push toward more motion; Ponytail and "not cluttered" push toward less.** Resolution: motion budgets per surface (section 6). Rich motion lives only on the marketing site.
- **21st.dev components and motionsites prompts are designed around Latin text.** Fixed heights, tight line heights and letter-spacing will clip Telugu. Every borrowed component is retested with Telugu.
- **21st.dev components are Tailwind + shadcn.** Do not mix with styled-components. Vaddana is Tailwind-only.
- **WebGL on the diner menu is ruled out.** Diners scan on mid-range Android phones over restaurant Wi-Fi or 4G. A shader hero there costs load time and battery for zero ordering value.
- **motionsites is paid.** Buy only if the marketing site is in scope. A third-party review notes Magic UI, React Bits and 21st.dev's free browsing cover much of the same ground.

---

## 5. Design principles (anti-AI-slop, not cluttered)

Vaddana is a tool people use during the busiest hour of their day. Clarity beats decoration.

### Rules

1. **One primary action per screen.** Menu: add item. Cart: place order. Live board: confirm. If two buttons compete, one is wrong.
2. **Content is the interface.** Dish names, prices and photos carry the menu. No decorative cards around cards.
3. **Whitespace over dividers.** Group with spacing first, borders second, shadows almost never.
4. **Real data only.** No "Jane Doe", "Acme", "99.99% uptime" or invented metrics in any design, demo or screenshot. Use a real or realistic Telangana menu in Telugu and English, with ₹ prices and veg/non-veg marks.
5. **Every state designed.** Empty, loading, error, offline, slow network, item unavailable, order rejected, payment pending. Happy-path-only screens fail review.
6. **Numbers line up.** Prices and totals use tabular numerals, right-aligned in lists. Digits stay Western Arabic (0 to 9) in both languages, as on Indian menus and UPI apps.
7. **Copy is short and human, in both languages.** "Sent to the kitchen", not "Your order has been successfully submitted". No em dashes in UI copy.

### Banned (AI tells)

| Banned | Use instead |
| --- | --- |
| Purple or blue-violet gradients, glow effects | Flat ink and paper surfaces, one accent |
| Gradient text on headings | Solid ink, weight and size for hierarchy |
| Inter as the default for everything | The type pairing in sections 3 and 7 |
| An eyebrow label above every section | Headings that say the point |
| Rows of three identical feature cards with icons | Content-led layouts, screenshots of the real product |
| Emojis as icons | One icon set (Lucide, already in shadcn) |
| Glassmorphism panels | Solid surfaces |
| Floating pills and badges over hero images | Clean hero with one message |
| Hand-drawn fake product screenshots made of divs | Real screenshots or real rendered components |
| Motion with no purpose | Motion only for feedback, continuity or attention |
| Generic "Indian" clipart (leaves, rangoli, temples) | One specific Telangana reference, used once |

---

## 6. Surfaces and motion budgets

Four surfaces, four different jobs. Taste skill dials are set per surface.

| Surface | Route | User and context | Variance | Motion | Density | Motion allowed |
| --- | --- | --- | --- | --- | --- | --- |
| Diner menu | `/t/[tableToken]` | Diner, own phone, seated, possibly poor network | Low | Low | Medium | Add-to-cart feedback, sheet open and close, status change. All under 250 ms |
| Staff live board | `/staff` | Waiter or captain, tablet or phone, rushing | Very low | Very low | Medium | One attention pulse on a new order, nothing else |
| Kitchen board | `/staff/kitchen` | Cook, wall tablet, read from 1 to 2 m away | Very low | None | Low | None. Colour and position carry status |
| Admin | `/admin` | Owner, laptop, calm | Low | Low | High | Chart and panel transitions only |
| Marketing site | `/` (or separate domain) | Restaurant owner deciding to buy | High | Medium to high | Low | Scroll reveals, hero motion, one optional WebGL moment, video backgrounds from motionsites |

Every surface respects `prefers-reduced-motion`: motion drops to opacity fades or none.

---

## 7. Design tokens (proposal)

Proposal only. Run UI UX Pro Max's design system generator with this brief, then let Taste skill critique it before locking.

### Colour

Restaurant menus already use green (veg) and brown/red (non-veg) marks on every item. **Vaddana's brand accent must not be green, red or brown**, or it competes with food-safety meaning. Indigo also ties to Pochampally ikat, a Telangana weave.

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#16130F` | Text, primary buttons |
| `--ink-2` | `#5C564E` | Secondary text |
| `--ink-3` | `#8C857B` | Placeholder, disabled |
| `--paper` | `#FBF9F5` | App background |
| `--surface` | `#FFFFFF` | Sheets, inputs, cards when needed |
| `--line` | `rgba(22,19,15,0.10)` | Borders, dividers |
| `--accent` | `#1F4E8C` (indigo) | Focus rings, links, selected state, the platform brand |
| `--veg` | `#1B8A3A` | Veg mark only |
| `--nonveg` | `#8A3B12` | Non-veg mark only |
| `--ok` / `--warn` / `--danger` | `#1F7A4D` / `#B7791F` / `#B42318` | Order and payment status |

Contrast: every text token on `--paper` must pass WCAG AA (4.5:1). Verify in the audit step.

**Per-restaurant theming:** the diner menu shows the restaurant's brand, not Vaddana's. A restaurant sets one accent colour and a logo; the app checks contrast and falls back to `--ink` if their colour fails AA. Staff and admin surfaces stay in Vaddana's theme.

### Type

| Role | Telugu | Latin | Notes |
| --- | --- | --- | --- |
| Display (restaurant name, marketing headlines) | Ramabhadra | Chosen in the design-system step to match | Headings only |
| UI and body | Noto Sans Telugu | A neutral grotesk with tabular numerals, not Inter by default | Test against real bilingual menus |
| Editorial accents (marketing only) | Tiro Telugu | Matching serif | Optional |

Scale (rem): 0.75, 0.875, 1, 1.125, 1.375, 1.75, 2.25, 3. Body text on the diner menu is never below 1rem; Telugu body text uses the next size up if it looks smaller than the Latin at the same size. Kitchen board item names are at least 1.75rem.

### Space, shape, depth

- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px. Default gap between groups: 24.
- Radius: 8 for inputs and buttons, 12 for sheets and cards, full only for avatars and toggles. Not pill-shaped everything.
- Shadow: one level, used only for bottom sheets and popovers.
- Touch targets: minimum 44 x 44 px. Primary buttons on mobile are full width, at least 52 px tall, padding-sized so Telugu never clips.

---

## 8. Screens

### Diner (mobile first, 360 to 430 px)

1. **Menu home.** Restaurant logo and name, table label ("టేబుల్ 7 / Table 7"), language switch (తెలుగు | EN) in the header, sticky category tabs, item list. Each item: veg mark, name, one-line description, price, photo on the right if available, an Add button. Unavailable items stay visible, greyed, with "Not available now".
2. **Item sheet.** Bottom sheet: photo, description, variants (radio), add-ons (checkboxes with min/max), notes, quantity, "Add · ₹240".
3. **Cart.** Line items with edit and remove, notes for the kitchen, total, one button: "Send to kitchen".
4. **Order status.** Per-round status: sent, confirmed by staff, preparing, ready, served. Rejected orders show the reason and what to do.
5. **Bill.** Itemised, tax split, total. "Pay with UPI" and "Pay at counter". No default service charge line.
6. **Utility row** (persistent, small): Call waiter, Request bill.

Item names show in the active language; when a Telugu name is missing, fall back to English, never to an empty line.

### Staff live board (tablet and phone)

- Columns or grouped list by status: New (needs confirm), Confirmed, Ready, Bill requested.
- New order card: table, items, notes, time waiting. Two buttons: Confirm, Reject (with reason).
- Persistent banner for waiter calls and bill requests until cleared.
- Connection indicator always visible: "Live" or "Reconnecting".
- Language follows each staff member's setting.

### Kitchen board (wall tablet)

- Large tickets, oldest first, time since confirmed. Tap to mark Preparing, then Ready.
- Item names in the kitchen's chosen language; notes shown exactly as the diner typed them.
- No navigation chrome. Full screen.

### Admin (laptop first, works on tablet)

- **Today:** sales, orders, average bill, open tables, top items, sales by hour.
- **Menu:** categories and items with Telugu and English fields side by side, inline availability toggle, drag to reorder, bulk price edit. Flags items missing a Telugu name.
- **Tables:** list and floor areas, QR sheet download and print (bilingual "Scan to order / ఆర్డర్ చేయడానికి స్కాన్ చేయండి"), rotate QR.
- **Orders and bills:** search, filter by date, table, status, payment mode.
- **Staff:** invite, roles, language preference.
- **Settings:** restaurant profile (GSTIN, FSSAI number, tax mode, GST rate), UPI ID, ordering rules (auto-accept, pay first or later), default diner language, brand colour and logo.

### Marketing site

- One page to start, Telugu-led: hero with a real phone recording of the ordering flow in Telugu, how it works in three steps with real screens, pricing, FAQ, contact on WhatsApp.
- This is the only surface where motionsites prompts, 21st.dev animated sections and a possible Lucid GL hero are allowed.

---

## 9. Components

Base: shadcn/ui primitives, restyled with Vaddana tokens. Ponytail rule: native element first, shadcn second, 21st.dev third, custom last.

| Need | First choice | Notes |
| --- | --- | --- |
| Translations | `next-intl` or Next.js built-in i18n routing, whichever the Phase 0 spike shows is simpler | One message file per locale; no strings hard-coded in components |
| Bottom sheet (item, cart) | shadcn Drawer | Must trap focus and close on back gesture |
| Dialogs | shadcn Dialog | |
| Language switch | Native segmented control (two buttons) | Remembers choice per device |
| Category tabs | Native scroll container + anchor links | No tab library needed |
| Quantity stepper | Custom, small | Two buttons and a number |
| Toasts | shadcn Sonner | One at a time on mobile |
| Tables (admin) | shadcn Table + TanStack Table only if sorting and filtering are needed | Cards on mobile |
| Charts (admin) | shadcn Charts (Recharts) | Max 4 charts on the Today view |
| Date picker | Native `<input type="date">` | Ponytail's canonical example |
| Marketing hero, pricing, FAQ | 21st.dev candidates, restyled | Pick one source per section, not a collage |

---

## 10. States, accessibility, performance

### States (every data view)

Empty, loading (skeleton matching the final layout), error with retry, offline (cached menu still browsable, ordering disabled with a clear message), slow network (after 3 s show "Still working"), permission denied, session expired (staff), item unavailable, order rejected, payment pending, payment failed. Every state has Telugu and English copy.

### Accessibility

- WCAG 2.2 AA contrast for all text and controls.
- Visible focus ring using `--accent` on every interactive element.
- Veg/non-veg is never colour alone: the mark shape plus an accessible label.
- Status on staff boards uses text labels as well as colour.
- `lang="te"` or `lang="en"` set correctly on the page and on mixed-language fragments, so screen readers pronounce them properly.
- All motion respects `prefers-reduced-motion`.

### Performance budgets (targets, to be measured)

| Surface | Target |
| --- | --- |
| Diner menu, first load on a mid-range Android over 4G | LCP under 2.5 s, interaction ready under 3.5 s, with Telugu fonts loaded |
| Diner menu JavaScript | Under 150 KB gzipped for the route |
| Fonts on the diner menu | Two Telugu weights at most, subset |
| Menu images | Responsive sizes, WebP/AVIF, lazy below the fold |
| Staff board | New order visible within 2 s of placement |

---

## 11. Phase-wise development

Each phase ends with a demo, a Taste skill pre-flight, a UI UX Pro Max audit and a `/ponytail-audit`, run in both Telugu and English. Nothing moves to the next phase with failing tests or open accessibility issues.

### Phase 0: Design system, i18n and setup (week 1)

- Confirm the name with a native speaker; check domain and trademark.
- Install skills: Taste skill, UI UX Pro Max, Ponytail. Add Lucid GL only once its source is confirmed.
- Run UI UX Pro Max's design-system generator with a Telugu-first brief; refine with Taste skill; lock tokens and the Telugu + Latin font pairing.
- Next.js app, Tailwind, shadcn/ui init, tokens as CSS variables, fonts via `next/font` with Telugu subsetting.
- i18n spike: pick the library, locale routing and message file structure; decide `name_te`/`name_en` vs `translations jsonb`.
- Supabase project in Mumbai, migrations, typed client.
- Component preview page in both languages: buttons, inputs, sheet, item row with long Telugu names, veg mark, status chip, empty/loading/error states.
- **Exit:** tokens locked, preview page passes AA and shows no Telugu clipping, CI runs lint, typecheck and tests.

### Phase 1: Foundation and admin basics (weeks 2 to 3)

- Schema with translatable fields, RLS, and seed data for one realistic Nizamabad restaurant menu in Telugu and English.
- Staff auth, roles and language preference.
- Admin: restaurant profile, menu with bilingual fields, tables, bilingual QR sheet generation and print.
- **Exit:** an owner can set up a full bilingual menu and print table QRs without help.

### Phase 2: Ordering loop (weeks 4 to 5)

- Diner menu with language switch, item sheet, cart, `place_order` with server-side pricing.
- Staff live board with confirm and reject; kitchen board.
- Realtime Broadcast channels; reconnect handling.
- KOT printing via 80 mm print stylesheet; test a Telugu KOT on the pilot's printer.
- Native review of all Telugu UI strings.
- **Exit:** a full round trip (scan, order, confirm, cook, serve) works in both languages on real phones over a throttled connection, and a Telugu KOT prints legibly. Pilot restaurant in Nizamabad starts here.

### Phase 3: Billing and manual payments (week 6)

- Bill generation with GST split and FSSAI number, sequential bill numbers, bilingual bill.
- Cash and restaurant-UPI payments marked paid by staff.
- Bill print, request-bill and call-waiter flows.
- Admin "Today" view: sales, orders, top items, by hour, by payment mode.
- **Exit:** the pilot closes a full day of service and its totals match their cash and UPI records.

### Phase 4: Gateway and silent printing (weeks 7 to 8)

- Gateway checkout on the restaurant's own Razorpay or Cashfree account; signed webhook auto-confirms payment.
- QZ Tray on the counter PC, printing KOTs as rendered images so Telugu prints correctly.
- Payment failure and pending states.
- **Exit:** a gateway payment marks the bill paid with no staff action; webhook retries are harmless; silent Telugu KOTs print.

### Phase 5: Marketing site (week 9, parallel once Phase 2 is stable)

- Telugu-led single-page site with real product recordings from the pilot.
- motionsites prompts and 21st.dev sections adapted to tokens and retested with Telugu; optional Lucid GL hero with a static fallback.
- Lighthouse performance 90+ on mobile despite motion.
- **Exit:** site live, WhatsApp enquiry flow works, no banned patterns from section 5.

### Phase 6: Analytics, more languages and polish (week 10 onward)

- Deeper analytics: item trends, table turnover, exports.
- Urdu menu if pilots ask for it (right-to-left support).
- Split bill, multi-printer routing, multi-outlet if a client needs it.
- **Exit:** driven by pilot feedback, not by this list.

Week estimates assume one developer with AI assistance and are rough; adjust after Phase 1.

---

## 12. Open questions

- [ ] Native-speaker sign-off on "Vaddana" and on the draft Telugu UI strings.
- [ ] Domain and trademark status for Vaddana.
- [ ] Lucid GL skill: which repository or source? It could not be verified.
- [ ] Is the marketing site in scope now? This decides whether to buy motionsites.
- [ ] Pilot restaurant in Nizamabad: printer model, POS already in use, GST registration type, preferred menu language, whether Urdu matters.
- [ ] Latin typeface: final pick after the design-system step, tested beside Noto Sans Telugu and Ramabhadra.

## 13. Sources

- [Taste skill (Leonxlnx)](https://github.com/Leonxlnx/taste-skill)
- [UI UX Pro Max skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
- [Ponytail (DietrichGebert)](https://github.com/DietrichGebert/ponytail)
- [21st.dev](https://21st.dev)
- [motionsites.ai review and pricing (Stork)](https://www.stork.ai/reviews/motionsites-ai)
- [Anti-slop frontend AI-tell catalog](https://pi.dev/packages/@blackbelt-technology/anti-slop-frontend)
- [Ramabhadra on Google Fonts](https://fonts.google.com/specimen/Ramabhadra/about)
- [Telugu font designers, Mandali and Ramabhadra background (Luc Devroye)](https://luc.devroye.org/fonts-78907.html)
- [Vista Serve, existing restaurant ordering app (name conflict for Vistari)](https://apps.apple.com/us/app/-/id1437595738)
- [Vistify, existing digital menu platform (name conflict for Vistari)](https://www.olo.com/partners/vistify)
