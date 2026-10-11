"use client";

import type { Locale } from "@/lib/i18n";
import { useT } from "@/components/i18n-provider";

const options: { value: Locale; label: string }[] = [
  { value: "te", label: "తెలుగు" },
  { value: "en", label: "EN" },
];

// Two native buttons, not a tab library. Each label is in its own language and marked up as such.
export function LanguageSwitch({ value, onChange }: { value: Locale; onChange: (locale: Locale) => void }) {
  const { t } = useT();
  return (
    <div role="group" aria-label={t("lang.label")} className="inline-flex rounded-control border border-line-strong bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          lang={o.value}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className="min-h-touch min-w-touch rounded-control px-3 text-base font-semibold text-ink-muted transition-[background-color,color] duration-(--duration-fast) ease-out aria-pressed:bg-action aria-pressed:text-on-action"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
