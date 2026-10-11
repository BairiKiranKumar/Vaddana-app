import en from "@/messages/en.json";
import te from "@/messages/te.json";

export const locales = ["te", "en"] as const;
export type Locale = (typeof locales)[number];

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;
type PluralBase<K> = K extends `${infer B}.other` ? B : never;
export type PluralKey = PluralBase<MessageKey>;

// Typed as Messages so a key missing from te.json fails `npm run typecheck`.
const dictionaries: Record<Locale, Messages> = { en, te };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

type Vars = Record<string, string | number>;
const fill = (template: string, vars?: Vars) =>
  vars ? template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`)) : template;

export function createTranslator(locale: Locale, messages: Messages = getMessages(locale)) {
  const rules = new Intl.PluralRules(locale);
  const t = (key: MessageKey, vars?: Vars) => fill(messages[key], vars);
  /** Plural strings live under `<key>.one` / `<key>.other`; `{count}` is filled in. */
  const tn = (key: PluralKey, count: number) => {
    const form = `${key}.${rules.select(count)}` as MessageKey;
    return fill(messages[form] ?? messages[`${key}.other` as MessageKey], { count });
  };
  return { locale, t, tn };
}

export type Translator = ReturnType<typeof createTranslator>;

/**
 * Picks the diner-facing text for the active locale. A missing Telugu name falls back to English
 * (never an empty line), and `lang` reports the language actually shown so the fragment is marked up correctly.
 */
export function pickLocalized(locale: Locale, te: string | null | undefined, en: string | null | undefined) {
  const preferred = locale === "te" ? te : en;
  if (preferred) return { text: preferred, lang: locale };
  if (locale === "te" && en) return { text: en, lang: "en" as Locale };
  if (locale === "en" && te) return { text: te, lang: "te" as Locale };
  return null;
}
