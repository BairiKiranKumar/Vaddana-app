"use client";

import { useHouse } from "@/components/ops/frame";
import { useT } from "@/components/i18n-provider";
import { formatPrice } from "@/lib/format";
import { pickLocalized } from "@/lib/i18n";

export function AnalyticsView() {
  const { result } = useHouse();
  const { locale, t } = useT();
  if (!result?.ok) return null;
  const { today } = result.house;

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold">{t("admin.analytics")}</h2>
      <section className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold">{t("analytics.payments")}</h3>
        {today.byPayment.length === 0 ? (
          <p className="text-base text-ink-muted">{t("analytics.empty")}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-3">
            {today.byPayment.map((row) => (
              <li key={row.mode} className="rounded-sheet border-t-4 border-t-action bg-surface p-4 shadow-card">
                <p className="text-base text-ink-muted">{t(`payment.${row.mode}`)}</p>
                <p className="text-3xl font-semibold">{formatPrice(row.total)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold">{t("analytics.top")}</h3>
        <ul className="flex flex-col gap-2">
          {today.topItems.map((item) => {
            const name = pickLocalized(locale, item.name_te, item.name_en);
            return (
              <li key={item.itemId} className="flex items-baseline justify-between gap-3 rounded-sheet bg-surface px-4 py-3 shadow-card">
                <span lang={name?.lang} translate="no">{name?.text}</span>
                <span className="font-semibold">{item.qty} · {formatPrice(item.total)}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
