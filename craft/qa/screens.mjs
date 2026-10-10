// Craft System QA: responsive screenshots + automatic checks an agent can run.
// Setup once per project:  npm i -D playwright && npx playwright install chromium
// Run:                     node craft/qa/screens.mjs http://localhost:3000 [--out design/qa-output]
// Output: <out>/<width>-<mode>.png, <out>/qa-report.json. Exit code 1 if any FAIL.
// These are heuristics. A PASS here does not replace a keyboard walkthrough, real devices or field vitals.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const outIdx = args.indexOf('--out');
const out = outIdx >= 0 ? args[outIdx + 1] : 'design/qa-output';
if (!url) {
  console.error('Usage: node craft/qa/screens.mjs <url> [--out dir]');
  process.exit(2);
}
mkdirSync(out, { recursive: true });

const WIDTHS = [320, 375, 768, 1024, 1440];
const report = { url, date: new Date().toISOString(), checks: [], screenshots: [], consoleErrors: [] };
const add = (status, id, detail) => report.checks.push({ status, id, detail });

async function settle(page) {
  // Scroll through once so lazy content and scroll-triggered reveals have a chance to run.
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

const browser = await chromium.launch();
try {
  const textByMode = {};
  for (const mode of ['normal', 'reduced']) {
    for (const width of WIDTHS) {
      const context = await browser.newContext({
        viewport: { width, height: width < 768 ? 800 : 900 },
        reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      if (mode === 'normal' && width === 375) {
        page.on('console', (m) => m.type() === 'error' && report.consoleErrors.push(m.text()));
        page.on('pageerror', (e) => report.consoleErrors.push(String(e)));
      }
      await page.goto(url, { waitUntil: 'load', timeout: 45000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await settle(page);

      const file = join(out, `${width}-${mode}.png`);
      await page.screenshot({ path: file, fullPage: true });
      report.screenshots.push(file);

      if (mode === 'normal') {
        const overflow = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          if (document.documentElement.scrollWidth <= vw + 1) return null;
          const offenders = [...document.querySelectorAll('body *')]
            .filter((el) => el.getBoundingClientRect().right > vw + 1 && getComputedStyle(el).position !== 'fixed')
            .slice(0, 5)
            .map((el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''));
          return { scrollWidth: document.documentElement.scrollWidth, viewport: vw, offenders };
        });
        if (overflow) add('FAIL', `horizontal-overflow-${width}`, overflow);
      }

      if (width === 375) {
        textByMode[mode] = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim().length);
      }

      if (mode === 'normal' && width === 375) {
        const a11y = await page.evaluate(() => {
          const name = (el) =>
            (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').trim() ||
            [...el.querySelectorAll('img[alt]')].map((i) => i.alt).join('').trim() ||
            (el.getAttribute('aria-labelledby') ? 'labelledby' : '');
          const sel = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '');
          const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
          const controls = [...document.querySelectorAll('a[href], button, [role="button"]')].filter(visible);
          const unnamed = controls.filter((el) => !name(el)).map(sel).slice(0, 10);
          const small = controls
            .filter((el) => { const r = el.getBoundingClientRect(); return r.width < 44 || r.height < 44; })
            .filter((el) => !el.closest('p, li') || el.tagName !== 'A') // inline text links are exempt
            .map((el) => `${sel(el)} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`)
            .slice(0, 10);
          const imgsNoAlt = [...document.querySelectorAll('img:not([alt])')].map((i) => i.getAttribute('src')).slice(0, 10);
          const imgsNoSize = [...document.querySelectorAll('img')].filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).length;
          const inputs = [...document.querySelectorAll('input:not([type=hidden]), select, textarea')].filter((el) => {
            const id = el.id;
            return !(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.closest('label') || (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)));
          }).map(sel).slice(0, 10);
          const autoplay = [...document.querySelectorAll('video')].filter((v) => v.autoplay || v.hasAttribute('autoplay'))
            .map((v) => ({ src: v.currentSrc || v.getAttribute('src') || (v.querySelector('source') || {}).src || '', loop: v.loop, duration: Number.isFinite(v.duration) ? v.duration : null }));
          const pauseControl = [...document.querySelectorAll('button, [role="button"]')].some((b) => /pause|stop/i.test(name(b)));
          return {
            unnamed, small, imgsNoAlt, imgsNoSize, inputs, autoplay, pauseControl,
            h1: document.querySelectorAll('h1').length,
            lang: document.documentElement.getAttribute('lang'),
            title: document.title,
          };
        });
        a11y.unnamed.length ? add('FAIL', 'controls-without-accessible-name', a11y.unnamed) : add('PASS', 'controls-without-accessible-name', []);
        a11y.imgsNoAlt.length ? add('FAIL', 'images-missing-alt', a11y.imgsNoAlt) : add('PASS', 'images-missing-alt', []);
        a11y.inputs.length ? add('FAIL', 'inputs-without-label', a11y.inputs) : add('PASS', 'inputs-without-label', []);
        a11y.h1 === 1 ? add('PASS', 'single-h1', 1) : add('FAIL', 'single-h1', a11y.h1);
        a11y.lang ? add('PASS', 'html-lang', a11y.lang) : add('FAIL', 'html-lang', 'missing');
        a11y.title ? add('PASS', 'page-title', a11y.title) : add('FAIL', 'page-title', 'missing');
        if (a11y.small.length) add('WARN', 'tap-targets-under-44px-mobile', a11y.small);
        if (a11y.imgsNoSize) add('WARN', 'images-without-width-height', `${a11y.imgsNoSize} images (layout-shift risk)`);
        const longAuto = a11y.autoplay.filter((v) => v.loop || v.duration === null || v.duration > 5);
        if (longAuto.length && !a11y.pauseControl) add('FAIL', 'autoplay-without-pause-control (WCAG 2.2.2)', longAuto);
        else if (longAuto.length) add('PASS', 'autoplay-without-pause-control (WCAG 2.2.2)', 'pause/stop control found; confirm it controls every loop and works by keyboard');
      }
      await context.close();
    }
  }
  if (textByMode.normal && textByMode.reduced !== undefined) {
    const ratio = textByMode.reduced / textByMode.normal;
    ratio < 0.9
      ? add('FAIL', 'content-hidden-under-reduced-motion', `reduced-motion page shows ${Math.round(ratio * 100)}% of the normal text`)
      : add('PASS', 'content-hidden-under-reduced-motion', `${Math.round(ratio * 100)}% of normal text visible`);
  }
  if (report.consoleErrors.length) add('WARN', 'console-errors', report.consoleErrors.slice(0, 10));
} finally {
  await browser.close();
}

report.needsHuman = [
  'Keyboard walkthrough: Tab/Shift+Tab/Enter/Escape and focus return on overlays',
  'Real Android + iPhone Safari check',
  'Field Core Web Vitals (PageSpeed Insights field data / RUM) once there is traffic',
  'Five-person task test on the primary action',
];
writeFileSync(join(out, 'qa-report.json'), JSON.stringify(report, null, 2));
const fails = report.checks.filter((c) => c.status === 'FAIL');
for (const c of report.checks) console.log(`${c.status.padEnd(4)} ${c.id}${c.status === 'PASS' ? '' : ' -> ' + JSON.stringify(c.detail)}`);
console.log(`\n${fails.length} FAIL, ${report.checks.filter((c) => c.status === 'WARN').length} WARN. Screenshots + qa-report.json in ${out}/`);
process.exit(fails.length ? 1 : 0);
