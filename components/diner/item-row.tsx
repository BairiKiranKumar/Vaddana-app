import { VegMark } from "@/components/diner/veg-mark";
import type { Diet } from "@/lib/data/types";
import { formatPrice } from "@/lib/format";
import { pickLocalized, type Translator } from "@/lib/i18n";

type RowItem = {
  name_te: string | null;
  name_en: string | null;
  description_te: string | null;
  description_en: string | null;
  price: number;
  diet: Diet;
  available: boolean;
};

// Content is the interface: no card chrome, spacing and one hairline separate rows.
export function ItemRow({ item, i18n, action }: { item: RowItem; i18n: Translator; action?: React.ReactNode }) {
  const { locale, t } = i18n;
  const name = pickLocalized(locale, item.name_te, item.name_en);
  const description = pickLocalized(locale, item.description_te, item.description_en);
  const dietLabel = t(item.diet === "veg" ? "item.veg" : "item.nonveg");

  return (
    <li className="flex gap-3 border-b border-line py-4 last:border-b-0">
      {/* Nudged so the mark centres on the first line of the name, in either script. */}
      <span className="pt-1">
        <VegMark diet={item.diet} label={dietLabel} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {name && (
          <p lang={name.lang} translate="no" className={`text-lg font-semibold leading-heading break-words ${item.available ? "" : "text-ink-subtle"}`}>
            {name.text}
          </p>
        )}
        {description && (
          <p lang={description.lang} translate="no" className="line-clamp-2 text-base text-ink-muted break-words">
            {description.text}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <span className={`text-lg font-semibold ${item.available ? "" : "text-ink-subtle"}`}>{formatPrice(item.price)}</span>
          {item.available ? action : <span className="text-base font-semibold text-ink-muted">{t("item.unavailable")}</span>}
        </div>
      </div>
    </li>
  );
}
