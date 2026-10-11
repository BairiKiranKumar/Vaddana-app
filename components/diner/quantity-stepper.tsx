"use client";

import { Minus, Plus } from "lucide-react";
import { useT } from "@/components/i18n-provider";

export function QuantityStepper({ value, onChange, min = 1, max = 20, labelId }: { value: number; onChange: (n: number) => void; min?: number; max?: number; labelId: string }) {
  const { t } = useT();
  const step = "grid size-touch place-items-center rounded-control border text-ink transition-[background-color,border-color,color,transform] duration-(--duration-fast) ease-out motion-safe:active:translate-y-px disabled:text-ink-subtle";
  return (
    <div role="group" aria-labelledby={labelId} className="inline-flex items-center gap-3">
      <button type="button" className={`${step} border-line-strong bg-surface hover:bg-wash disabled:hover:bg-surface`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={t("qty.decrease")}>
        <Minus aria-hidden className="size-5" />
      </button>
      <output aria-live="polite" className="min-w-8 text-center text-lg font-semibold">{value}</output>
      <button type="button" className={`${step} border-transparent bg-action text-on-action hover:brightness-95 disabled:border-line-strong disabled:bg-surface disabled:hover:brightness-100`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={t("qty.increase")}>
        <Plus aria-hidden className="size-5" />
      </button>
    </div>
  );
}
