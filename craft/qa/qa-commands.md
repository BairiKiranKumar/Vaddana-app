# QA commands an agent can run

Run these from the project root. Paste the output into the milestone's `DECISIONS.md` and give it to the critic.

## 1. One-time setup per project
```bash
npm i -D playwright
npx playwright install chromium
```

## 2. Tokens
```bash
python3 craft/qa/validate_tokens.py design/tokens.json
```
Fails on plain-hex colours, wrong units, broken `{aliases}` and type mismatches.

## 3. Screenshots and automatic checks
Start the dev server first (for example `npm run dev`), then:
```bash
node craft/qa/screens.mjs http://localhost:3000 --out design/qa-output
```
Produces 10 screenshots (320, 375, 768, 1024, 1440px, each with normal and reduced motion) and `design/qa-output/qa-report.json`.

| Check | Fails when |
|---|---|
| horizontal-overflow | page scrolls sideways at any width (lists the offending elements) |
| controls-without-accessible-name | a link or button has no text, label or alt |
| images-missing-alt | an `<img>` has no `alt` attribute (use `alt=""` for decorative images) |
| inputs-without-label | a form field has no label |
| single-h1 | the page does not have exactly one `<h1>` |
| html-lang / page-title | missing |
| autoplay-without-pause-control | an autoplaying looping video exists and no pause/stop button is found (WCAG 2.2.2) |
| content-hidden-under-reduced-motion | the reduced-motion page shows under 90% of the normal text |
| tap targets / image dimensions / console errors | reported as WARN, not FAIL |

These are heuristics. The pause check only looks for a button named "pause" or "stop"; confirm it actually controls every loop and works with the keyboard.

## 4. Lab performance
```bash
npx lighthouse http://localhost:3000 --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate --output=json --output=html --output-path=./design/qa-output/lighthouse --chrome-flags="--headless=new"
```
In a Linux container or CI, add `--no-sandbox` inside `--chrome-flags`. Report LCP, CLS and **Total Blocking Time** (the lab stand-in for INP). Do not write "INP passed" from Lighthouse. Run against a production build (`npm run build && npm run start`), not the dev server, before quoting numbers.

## 5. Human-only (agent must list these as open, never mark them done)
- Keyboard walkthrough: Tab, Shift+Tab, Enter, Escape, focus returns after closing overlays.
- Real Android (mid-range, throttled network) and iPhone Safari.
- Field Core Web Vitals from PageSpeed Insights or RUM once the site has traffic.
- Five-person task test on the primary action.
