"use client";

import { createContext, useContext, useMemo } from "react";
import { createTranslator, type Locale, type Messages, type Translator } from "@/lib/i18n";

const I18nContext = createContext<Translator | null>(null);

export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: React.ReactNode }) {
  const translator = useMemo(() => createTranslator(locale, messages), [locale, messages]);
  return <I18nContext.Provider value={translator}>{children}</I18nContext.Provider>;
}

export function useT() {
  const translator = useContext(I18nContext);
  if (!translator) throw new Error("useT() needs an <I18nProvider> above it");
  return translator;
}
