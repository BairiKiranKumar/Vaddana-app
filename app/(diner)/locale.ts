"use server";

import { cookies } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n";

const COOKIE = "vaddana-locale";

/** Cookie, or Telugu when the diner has not chosen yet. */
export async function readDinerLocale(): Promise<Locale> {
  const value = (await cookies()).get(COOKIE)?.value;
  return isLocale(value) ? value : "te";
}

export async function setDinerLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  const jar = await cookies();
  jar.set(COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
