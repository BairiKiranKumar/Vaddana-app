"use client";

import { useState } from "react";
import { useT } from "@/components/i18n-provider";
import { useHouse } from "@/components/ops/frame";
import { controlClass, labelClass } from "@/components/diner/field";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { pickLocalized } from "@/lib/i18n";

export function CombosEditor() {
  const { result, run } = useHouse();
  const { locale, t } = useT();
  const [diet, setDiet] = useState<"veg" | "nonveg">("veg");
  if (!result?.ok) return null;
  const combos = result.house.items.filter((item) => item.categoryId === "combos");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">{t("admin.combos")}</h2>
      <form
        className="grid gap-3 rounded-sheet bg-surface p-4 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const price = Number(data.get("price"));
          run((repo) => repo.saveCombo({
            name_te: String(data.get("name_te") ?? ""),
            name_en: String(data.get("name_en") ?? ""),
            description_te: String(data.get("includes_te") ?? ""),
            description_en: String(data.get("includes_en") ?? ""),
            price: Number.isFinite(price) ? price : 0,
            diet,
          }, false));
          event.currentTarget.reset();
        }}
      >
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("combo.nameTe")}</span>
          <input name="name_te" required className={controlClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("combo.nameEn")}</span>
          <input name="name_en" required className={controlClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("combo.includesTe")}</span>
          <input name="includes_te" className={controlClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("combo.includesEn")}</span>
          <input name="includes_en" className={controlClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("combo.price")}</span>
          <input name="price" required inputMode="numeric" className={controlClass} />
        </label>
        <div className="flex gap-2">
          <Button type="button" variant={diet === "veg" ? "primary" : "secondary"} onClick={() => setDiet("veg")}>{t("item.veg")}</Button>
          <Button type="button" variant={diet === "nonveg" ? "primary" : "secondary"} onClick={() => setDiet("nonveg")}>{t("item.nonveg")}</Button>
        </div>
        <Button type="submit">{t("combo.add")}</Button>
      </form>
      <ul className="flex flex-col gap-3">
        {combos.map((item) => {
          const name = pickLocalized(locale, item.name_te, item.name_en);
          return (
            <li key={item.id} className="rounded-sheet bg-surface p-4 shadow-card">
              <p lang={name?.lang} className="text-lg font-semibold" translate="no">{name?.text}</p>
              <p>{formatPrice(item.price)}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
