"use server";

import { cookies } from "next/headers";
import { isLocale, type Locale } from "@/lib/i18n";

const STAFF = "vaddana-staff";
const LOCALE = "vaddana-ops-locale";

export async function readStaffId(): Promise<string | null> {
  return (await cookies()).get(STAFF)?.value ?? null;
}

export async function setStaffId(id: string | null) {
  const jar = await cookies();
  if (!id) {
    jar.delete(STAFF);
    return;
  }
  jar.set(STAFF, id, { path: "/", maxAge: 60 * 60 * 12, sameSite: "lax" });
}

export async function readOpsLocale(fallback: Locale): Promise<Locale> {
  const value = (await cookies()).get(LOCALE)?.value;
  return isLocale(value) ? value : fallback;
}

export async function setOpsLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  const jar = await cookies();
  jar.set(LOCALE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
