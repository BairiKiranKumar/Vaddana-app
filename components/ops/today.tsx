"use client";

import { useT } from "@/components/i18n-provider";
import { useHouse } from "@/components/ops/frame";
import { formatPrice } from "@/lib/format";
import { pickLocalized } from "@/lib/i18n";

export function TodayView() {
  const { result } = useHouse();
  const { locale, t } = useT();
  if (!result?.ok) return null;
  const { today } = result.house;
  const peak = Math.max(1, ...today.byHour.map((row) => row.total));

  const stats: [string, string][] = [
    [t("admin.sales"), formatPrice(today.sales)],
    [t("admin.orderCount"), String(today.orderCount)],
    [t("admin.average"), formatPrice(today.averageBill)],
    [t("admin.openTables"), String(today.openTables)],
  ];

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-semibold">{t("admin.today")}</h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <li key={label} className="rounded-sheet border border-line bg-surface p-4">
            <p className="text-base text-ink-muted">{label}</p>
            <p className="text-3xl font-semibold">{value}</p>
          </li>
        ))}
      </ul>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">{t("admin.top")}</h3>
        {today.topItems.length === 0 ? <p className="text-base text-ink-muted">{t("admin.empty")}</p> : (
          <ol className="flex flex-col">
            {today.topItems.map((item) => {
              const name = pickLocalized(locale, item.name_te, item.name_en);
              return (
                <li key={item.itemId} className="flex items-baseline justify-between gap-3 border-b border-line py-3">
                  <span lang={name?.lang} translate="no">{name?.text}</span>
                  <span className="shrink-0">{item.qty} · {formatPrice(item.total)}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">{t("admin.byHour")}</h3>
        {today.byHour.length === 0 ? <p className="text-base text-ink-muted">{t("admin.empty")}</p> : (
          <ul className="flex flex-col gap-2">
            {today.byHour.map((row) => (
              <li key={row.hour} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3">
                <span>{new Intl.DateTimeFormat("en-IN", { hour: "numeric" }).format(new Date(2000, 0, 1, row.hour))}</span>
                <span className="h-3 overflow-hidden rounded-control bg-wash" aria-hidden>
                  <span className="block h-3 rounded-control bg-accent" style={{ width: `${Math.round((row.total / peak) * 100)}%` }} />
                </span>
                <span>{formatPrice(row.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">{t("admin.byPayment")}</h3>
        {today.byPayment.length === 0 ? <p className="text-base text-ink-muted">{t("admin.empty")}</p> : (
          <ul>
            {today.byPayment.map((row) => (
              <li key={row.mode} className="flex justify-between gap-3 border-b border-line py-3">
                <span>{t(`payment.${row.mode}`)}</span>
                <span>{formatPrice(row.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
