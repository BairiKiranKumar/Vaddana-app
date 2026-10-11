import { Noto_Sans_Telugu } from "next/font/google";

// `subsets` controls preloading only: next/font still emits unicode-ranged @font-face rules for the
// Latin subsets, so Latin text uses Noto Sans Telugu's matching Latin glyphs, fetched only when a page
// has Latin text. Variable names must match WEB_FONTS in scripts/build-tokens.mjs.
// Ramabhadra lives in display-font.ts so a diner import of this file does not register it.

/** Diner routes load this only: two weights, the whole font budget (design.md §10). */
export const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--ff-noto-sans-telugu",
});

export const dinerFontClasses = notoSansTelugu.variable;
