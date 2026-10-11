"use client";

import { ItemRow } from "@/components/diner/item-row";
import { ItemSheet } from "@/components/diner/item-sheet";
import { useT } from "@/components/i18n-provider";
import { quoteLine } from "@/lib/data/pricing";
import type { SampleItem } from "@/lib/sample-menu";

// The quote callback has to be created in a client component. A server page cannot pass a function into ItemSheet.
export function PreviewItem({ item }: { item: SampleItem }) {
  const i18n = useT();
  return <ItemRow item={item} i18n={i18n} action={<ItemSheet item={item} quote={(draft) => quoteLine(item, draft)} />} />;
}
