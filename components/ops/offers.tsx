"use client";

import { useHouse } from "@/components/ops/frame";
import { useT } from "@/components/i18n-provider";
import { controlClass, labelClass } from "@/components/diner/field";
import { Button } from "@/components/ui/button";
import { pickLocalized } from "@/lib/i18n";

export function OffersEditor() {
  const { result, run } = useHouse();
  const { locale, t } = useT();
  if (!result?.ok) return null;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">{t("admin.offers")}</h2>
      <p className="max-w-measure text-base text-ink-muted">{t("offer.simulated")}</p>
      <form
        className="grid gap-3 rounded-sheet bg-surface p-4 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const percent = Number(data.get("percent"));
          run((repo) => repo.saveOffer({
            id: `offer-${Date.now().toString(36)}`,
            name_te: String(data.get("name_te") ?? ""),
            name_en: String(data.get("name_en") ?? ""),
            percent: Number.isFinite(percent) ? percent : 0,
            active: true,
          }, false));
          event.currentTarget.reset();
        }}
      >
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("offer.nameTe")}</span>
          <input name="name_te" required className={controlClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("offer.nameEn")}</span>
          <input name="name_en" required className={controlClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("offer.percent")}</span>
          <input name="percent" required inputMode="numeric" defaultValue="10" className={controlClass} />
        </label>
        <Button type="submit">{t("offer.add")}</Button>
      </form>
      <ul className="flex flex-col gap-3">
        {result.house.offers.map((offer) => {
          const name = pickLocalized(locale, offer.name_te, offer.name_en);
          return (
            <li key={offer.id} className="flex flex-wrap items-center justify-between gap-2 rounded-sheet bg-surface p-4 shadow-card">
              <p lang={name?.lang} className="text-lg font-semibold" translate="no">{name?.text} · {offer.percent}%</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => run((repo) => repo.saveOffer({ ...offer, active: !offer.active }, false))}
              >
                {offer.active ? t("offer.active") : t("admin.activate")}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
