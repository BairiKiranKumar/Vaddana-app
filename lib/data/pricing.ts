import { QTY_MAX, type Quote, type SheetItem } from "@/lib/data/types";

/**
 * The only place a portion, add-ons and quantity become a price.
 * Mock and, later, the Supabase repo both call this. Screens display the result.
 */
export function quoteLine(item: SheetItem, input: { variantId: string | null; addonIds: string[]; qty: number }): Quote {
  const variant = item.variants?.find((choice) => choice.id === input.variantId);
  const base = variant ? variant.price : item.price;
  const options = item.addons?.options ?? [];
  let extras = 0;
  for (const id of input.addonIds) {
    const addOn = options.find((choice) => choice.id === id);
    if (addOn) extras += addOn.price;
  }
  const unitPrice = base + extras;
  const qty = Math.min(QTY_MAX, Math.max(1, Math.floor(input.qty) || 1));
  return { unitPrice, lineTotal: unitPrice * qty };
}
