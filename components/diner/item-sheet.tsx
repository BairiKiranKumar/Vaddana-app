"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { QuantityStepper } from "@/components/diner/quantity-stepper";
import { controlClass, errorClass, hintClass, labelClass } from "@/components/diner/field";
import { useT } from "@/components/i18n-provider";
import { NOTES_MAX, QTY_MAX, type LineDraft, type SheetItem } from "@/lib/data/types";
import { formatPrice } from "@/lib/format";
import { pickLocalized } from "@/lib/i18n";

type QuoteDraft = Pick<LineDraft, "variantId" | "addonIds" | "qty">;

export function ItemSheet({
  item,
  quote,
  onAdd,
  initial,
  trigger,
  editing = false,
}: {
  item: SheetItem;
  /** Repo (or the preview stand-in) returns the line total. This component does not add prices. */
  quote: (draft: QuoteDraft) => { lineTotal: number };
  onAdd?: (draft: LineDraft) => void;
  initial?: LineDraft;
  trigger?: React.ReactNode;
  editing?: boolean;
}) {
  const { locale, t } = useT();
  const id = useId();
  const starting = {
    variantId: initial?.variantId ?? item.variants?.at(-1)?.id ?? null,
    addonIds: initial?.addonIds ?? [],
    qty: initial?.qty ?? 1,
    notes: initial?.notes ?? "",
  };
  const [variantId, setVariantId] = useState<string | null>(starting.variantId);
  const [addonIds, setAddonIds] = useState<string[]>(starting.addonIds);
  const [qty, setQty] = useState(starting.qty);
  const [notes, setNotes] = useState(starting.notes);

  const reset = () => {
    setVariantId(starting.variantId);
    setAddonIds(starting.addonIds);
    setQty(starting.qty);
    setNotes(starting.notes);
  };

  const name = pickLocalized(locale, item.name_te, item.name_en);
  const description = pickLocalized(locale, item.description_te, item.description_en);
  const lineTotal = quote({ variantId, addonIds, qty }).lineTotal;
  const notesTooLong = notes.trim().length > NOTES_MAX;
  const minAddons = item.addons?.min ?? 0;
  const addonsFull = item.addons ? addonIds.length >= item.addons.max : false;
  const belowMin = addonIds.length < minAddons;

  const toggleAddon = (optionId: string) =>
    setAddonIds((current) => (current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]));

  const choiceRow = "flex min-h-touch cursor-pointer items-center gap-3 rounded-control px-2 py-2 hover:bg-wash has-disabled:cursor-not-allowed has-disabled:text-ink-subtle";

  return (
    <Drawer onOpenChange={(open) => { if (!open) reset(); }}>
      <DrawerTrigger asChild>
        {trigger ?? <Button type="button" variant="secondary">{t("menu.add")}</Button>}
      </DrawerTrigger>
      {/* The sheet renders in a portal outside the page's lang fragment, so it declares its own. */}
      <DrawerContent lang={locale}>
        <DrawerHeader>
          <DrawerTitle lang={name?.lang} translate="no">{name?.text}</DrawerTitle>
          {description && <DrawerDescription lang={description.lang} translate="no">{description.text}</DrawerDescription>}
        </DrawerHeader>

        <div className="flex flex-col gap-6 overflow-y-auto px-4 py-6">
          {item.variants && (
            <fieldset className="flex flex-col gap-1">
              <legend className={`${labelClass} mb-2`}>{t("item.portion")}</legend>
              {item.variants.map((choice) => {
                const label = pickLocalized(locale, choice.name_te, choice.name_en);
                return (
                  <label key={choice.id} className={choiceRow}>
                    <input type="radio" name={`${id}-variant`} value={choice.id} checked={variantId === choice.id} onChange={() => setVariantId(choice.id)} className="size-5 accent-accent" />
                    <span lang={label?.lang} translate="no" className="flex-1">{label?.text}</span>
                    <span>{formatPrice(choice.price)}</span>
                  </label>
                );
              })}
            </fieldset>
          )}

          {item.addons && (
            <fieldset className="flex flex-col gap-1">
              <legend className={`${labelClass} mb-2`}>{t("item.addons", { max: item.addons.max })}</legend>
              {item.addons.options.map((choice) => {
                const checked = addonIds.includes(choice.id);
                const label = pickLocalized(locale, choice.name_te, choice.name_en);
                return (
                  <label key={choice.id} className={choiceRow}>
                    <input type="checkbox" checked={checked} disabled={!checked && addonsFull} onChange={() => toggleAddon(choice.id)} className="size-5 accent-accent" />
                    <span lang={label?.lang} translate="no" className="flex-1">{label?.text}</span>
                    <span>+{formatPrice(choice.price)}</span>
                  </label>
                );
              })}
            </fieldset>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-notes`} className={labelClass}>{t("item.notes.label")}</label>
            <textarea
              id={`${id}-notes`}
              name="notes"
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("item.notes.placeholder")}
              aria-invalid={notesTooLong || undefined}
              aria-describedby={`${id}-notes-hint`}
              className={controlClass}
            />
            <p id={`${id}-notes-hint`} aria-live="polite" className={notesTooLong ? errorClass : hintClass}>
              {notesTooLong ? t("item.notes.tooLong", { max: NOTES_MAX }) : `${notes.trim().length}/${NOTES_MAX}`}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span id={`${id}-qty`} className={labelClass}>{t("item.quantity")}</span>
            <QuantityStepper value={qty} onChange={setQty} max={QTY_MAX} labelId={`${id}-qty`} />
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button
              type="button"
              size="block"
              disabled={notesTooLong || belowMin}
              onClick={() => onAdd?.({ itemId: item.id, variantId, addonIds, qty, notes })}
            >
              {t(editing ? "cart.updateWithPrice" : "menu.addWithPrice", { price: formatPrice(lineTotal) })}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
