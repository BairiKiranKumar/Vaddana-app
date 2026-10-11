import Image from "next/image";
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
  image?: string;
};

// Photo on the right, name and price on the left, so the dish is the first thing the eye finds.
export function ItemRow({ item, i18n, action, eager = false }: { item: RowItem; i18n: Translator; action?: React.ReactNode; eager?: boolean }) {
  const { locale, t } = i18n;
  const name = pickLocalized(locale, item.name_te, item.name_en);
  const description = pickLocalized(locale, item.description_te, item.description_en);
  const dietLabel = t(item.diet === "veg" ? "item.veg" : "item.nonveg");
  const nameSize = name?.lang === "te" ? "text-xl leading-heading-te" : "text-lg leading-heading";

  return (
    <li className="overflow-hidden rounded-sheet bg-surface shadow-card">
      <div className="flex gap-3 p-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start gap-2">
            <span className="pt-1">
              <VegMark diet={item.diet} label={dietLabel} />
            </span>
            {name && (
              <p lang={name.lang} translate="no" className={`${nameSize} font-semibold break-words ${item.available ? "" : "text-ink-subtle"}`}>
                {name.text}
              </p>
            )}
          </div>
          {description && (
            <p lang={description.lang} translate="no" className={`line-clamp-2 text-base break-words text-ink-muted ${description.lang === "te" ? "leading-body-te" : "leading-body"}`}>
              {description.text}
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-1">
            <span className={`text-lg font-semibold ${item.available ? "" : "text-ink-subtle"}`}>{formatPrice(item.price)}</span>
            {item.available ? action : <span className="text-base font-semibold text-ink-muted">{t("item.unavailable")}</span>}
          </div>
        </div>
        {item.image && (
          <span className={`relative size-24 shrink-0 overflow-hidden rounded-control ${item.available ? "" : "grayscale"}`}>
            <Image src={item.image} alt="" fill sizes="96px" priority={eager} className="object-cover" />
          </span>
        )}
      </div>
    </li>
  );
}
