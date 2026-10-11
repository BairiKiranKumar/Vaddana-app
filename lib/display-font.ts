import { Ramabhadra } from "next/font/google";

/** Display face for headings on admin, marketing and preview. Never import this from diner routes. */
export const ramabhadra = Ramabhadra({
  subsets: ["telugu"],
  weight: "400",
  display: "swap",
  preload: false,
  variable: "--ff-ramabhadra",
});
