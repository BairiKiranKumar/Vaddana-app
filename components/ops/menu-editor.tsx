"use client";

import { useState } from "react";
import { controlClass, labelClass } from "@/components/diner/field";
import { useT } from "@/components/i18n-provider";
import { useHouse } from "@/components/ops/frame";
import { Button } from "@/components/ui/button";
import type { Diet, ItemInput, MenuItem, PricedChoice } from "@/lib/data/types";
import { formatPrice } from "@/lib/format";
import { pickLocalized } from "@/lib/i18n";

const emptyChoice = (): PricedChoice => ({ id: crypto.randomUUID(), name_te: "", name_en: "", price: 0 });

function toInput(item: MenuItem): ItemInput {
  return {
    id: item.id,
    categoryId: item.categoryId,
    name_te: item.name_te ?? "",
    name_en: item.name_en ?? "",
    description_te: item.description_te ?? "",
    description_en: item.description_en ?? "",
    price: item.price,
    diet: item.diet,
    available: item.available,
    variants: (item.variants ?? []).map((entry) => ({ ...entry, name_te: entry.name_te ?? "", name_en: entry.name_en ?? "" })),
    addons: (item.addons?.options ?? []).map((entry) => ({ ...entry, name_te: entry.name_te ?? "", name_en: entry.name_en ?? "" })),
    addonMax: item.addons?.max ?? 1,
  };
}

export function MenuEditor() {
  const { result, offline, run } = useHouse();
  const { locale, t } = useT();
  const [draft, setDraft] = useState<ItemInput | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkKind, setBulkKind] = useState<"percent" | "rupees">("percent");
  const [bulkAmount, setBulkAmount] = useState("10");
  const [categoryTe, setCategoryTe] = useState("");
  const [categoryEn, setCategoryEn] = useState("");
  if (!result?.ok) return null;
  const { house } = result;

  const save = () => {
    if (!draft) return;
    run((repo) => repo.saveItem(draft, offline));
    setDraft(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <h2 className="text-2xl font-semibold">{t("admin.menu")}</h2>
        <Button type="button" disabled={offline || house.categories.length === 0} onClick={() => setDraft({
          id: null,
          categoryId: house.categories[0]?.id ?? "",
          name_te: "",
          name_en: "",
          description_te: "",
          description_en: "",
          price: 0,
          diet: "veg",
          available: true,
          variants: [],
          addons: [],
          addonMax: 1,
        })}
        >
          {t("admin.addItem")}
        </Button>
      </div>

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          run((repo) => repo.addCategory(categoryTe, categoryEn, offline));
          setCategoryTe("");
          setCategoryEn("");
        }}
      >
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.categoryTe")}</span>
          <input value={categoryTe} onChange={(event) => setCategoryTe(event.target.value)} className={controlClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.categoryEn")}</span>
          <input value={categoryEn} onChange={(event) => setCategoryEn(event.target.value)} className={controlClass} />
        </label>
        <Button type="submit" variant="secondary" disabled={offline}>{t("admin.addCategory")}</Button>
      </form>

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          run((repo) => repo.bulkPrice(selected, bulkKind, Number(bulkAmount), offline));
        }}
      >
        <p className={labelClass}>{t("admin.bulk")}</p>
        <select value={bulkKind} onChange={(event) => setBulkKind(event.target.value === "rupees" ? "rupees" : "percent")} className={controlClass} aria-label={t("admin.bulk")}>
          <option value="percent">{t("admin.percent")}</option>
          <option value="rupees">{t("admin.rupees")}</option>
        </select>
        <input inputMode="decimal" value={bulkAmount} onChange={(event) => setBulkAmount(event.target.value)} className={controlClass} aria-label={t("admin.price")} />
        <Button type="submit" variant="secondary" disabled={offline || selected.length === 0}>{t("admin.bulkApply")}</Button>
      </form>

      {house.categories.map((category) => {
        const heading = pickLocalized(locale, category.name_te, category.name_en);
        const rows = house.items.filter((item) => item.categoryId === category.id);
        return (
          <section key={category.id} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 lang={heading?.lang} translate="no" className="text-lg font-semibold">{heading?.text}</h3>
              <Button type="button" variant="quiet" disabled={offline} onClick={() => run((repo) => repo.moveCategory(category.id, -1, offline))}>{t("admin.moveUp")}</Button>
              <Button type="button" variant="quiet" disabled={offline} onClick={() => run((repo) => repo.moveCategory(category.id, 1, offline))}>{t("admin.moveDown")}</Button>
            </div>
            <ul className="flex flex-col">
              {rows.map((item) => {
                const name = pickLocalized(locale, item.name_te, item.name_en);
                return (
                  <li key={item.id} className="flex flex-wrap items-center gap-3 border-b border-line py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={() => setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])}
                      aria-label={name?.text}
                      className="size-5"
                    />
                    <div className="min-w-0 flex-1">
                      <p lang={name?.lang} translate="no" className="text-base font-semibold">{name?.text}</p>
                      {!item.name_te && <p className="text-sm font-semibold text-warn">{t("admin.missingTelugu")}</p>}
                      <p>{formatPrice(item.price)}</p>
                    </div>
                    <label className="inline-flex min-h-touch items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.available}
                        disabled={offline}
                        onChange={() => run((repo) => repo.setAvailable(item.id, !item.available, offline))}
                      />
                      {t("admin.available")}
                    </label>
                    <Button type="button" variant="quiet" disabled={offline} onClick={() => run((repo) => repo.moveItem(item.id, -1, offline))}>{t("admin.moveUp")}</Button>
                    <Button type="button" variant="quiet" disabled={offline} onClick={() => run((repo) => repo.moveItem(item.id, 1, offline))}>{t("admin.moveDown")}</Button>
                    <Button type="button" variant="secondary" onClick={() => setDraft(toInput(item))}>{t("admin.editItem")}</Button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {draft && (
        <form
          className="flex flex-col gap-3 rounded-sheet border border-line-strong bg-surface p-4"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <h3 className="text-lg font-semibold">{draft.id ? t("admin.editItem") : t("admin.addItem")}</h3>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>{t("admin.category")}</span>
            <select value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })} className={controlClass}>
              {house.categories.map((category) => {
                const name = pickLocalized(locale, category.name_te, category.name_en);
                return <option key={category.id} value={category.id}>{name?.text}</option>;
              })}
            </select>
          </label>
          <Field label={t("admin.nameTe")} value={draft.name_te} onChange={(name_te) => setDraft({ ...draft, name_te })} />
          <Field label={t("admin.nameEn")} value={draft.name_en} onChange={(name_en) => setDraft({ ...draft, name_en })} />
          <Field label={t("admin.descriptionTe")} value={draft.description_te} onChange={(description_te) => setDraft({ ...draft, description_te })} />
          <Field label={t("admin.descriptionEn")} value={draft.description_en} onChange={(description_en) => setDraft({ ...draft, description_en })} />
          <label className="flex flex-col gap-1">
            <span className={labelClass}>{t("admin.price")}</span>
            <input inputMode="numeric" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} className={controlClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>{t("admin.diet")}</span>
            <select value={draft.diet} onChange={(event) => setDraft({ ...draft, diet: event.target.value as Diet })} className={controlClass}>
              <option value="veg">{t("item.veg")}</option>
              <option value="nonveg">{t("item.nonveg")}</option>
            </select>
          </label>
          <Choices
            title={t("admin.portions")}
            addLabel={t("admin.addPortion")}
            rows={draft.variants}
            onChange={(variants) => setDraft({ ...draft, variants })}
          />
          <Choices
            title={t("admin.addons")}
            addLabel={t("admin.addAddon")}
            rows={draft.addons}
            onChange={(addons) => setDraft({ ...draft, addons })}
          />
          <label className="flex flex-col gap-1">
            <span className={labelClass}>{t("admin.addonMax")}</span>
            <input inputMode="numeric" value={draft.addonMax} onChange={(event) => setDraft({ ...draft, addonMax: Number(event.target.value) })} className={controlClass} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={offline}>{t("admin.save")}</Button>
            <Button type="button" variant="secondary" onClick={() => setDraft(null)}>{t("staff.cancel")}</Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className={labelClass}>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className={controlClass} />
    </label>
  );
}

function Choices({
  title,
  addLabel,
  rows,
  onChange,
}: {
  title: string;
  addLabel: string;
  rows: PricedChoice[];
  onChange: (rows: PricedChoice[]) => void;
}) {
  const { t } = useT();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={labelClass}>{title}</legend>
      {rows.map((row, index) => (
        <div key={row.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_8rem_auto]">
          <input aria-label={t("admin.nameTe")} value={row.name_te ?? ""} onChange={(event) => onChange(rows.map((entry, i) => i === index ? { ...entry, name_te: event.target.value } : entry))} className={controlClass} />
          <input aria-label={t("admin.nameEn")} value={row.name_en ?? ""} onChange={(event) => onChange(rows.map((entry, i) => i === index ? { ...entry, name_en: event.target.value } : entry))} className={controlClass} />
          <input aria-label={t("admin.price")} inputMode="numeric" value={row.price} onChange={(event) => onChange(rows.map((entry, i) => i === index ? { ...entry, price: Number(event.target.value) } : entry))} className={controlClass} />
          <Button type="button" variant="quiet" onClick={() => onChange(rows.filter((_, i) => i !== index))}>{t("admin.remove")}</Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={() => onChange([...rows, emptyChoice()])}>{addLabel}</Button>
    </fieldset>
  );
}
