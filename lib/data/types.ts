export const NOTES_MAX = 140;
export const QTY_MAX = 20;

export type Diet = "veg" | "nonveg";

export type PricedChoice = {
  id: string;
  name_te: string | null;
  name_en: string | null;
  price: number;
};

/** What the item sheet needs in order to ask the repo for a total. */
export type SheetItem = {
  id: string;
  name_te: string | null;
  name_en: string | null;
  description_te: string | null;
  description_en: string | null;
  price: number;
  variants?: PricedChoice[];
  addons?: { min?: number; max: number; options: PricedChoice[] };
};

export type MenuItem = SheetItem & {
  categoryId: string;
  diet: Diet;
  available: boolean;
  /** Latin spellings so search matches "biryani" as well as బిర్యానీ. */
  search: string[];
};

export type MenuCategory = {
  id: string;
  name_te: string | null;
  name_en: string | null;
  sort: number;
};

export type Restaurant = {
  id: string;
  name_te: string | null;
  name_en: string | null;
  tagline_te: string | null;
  tagline_en: string | null;
  defaultLocale: "te" | "en";
};

export type TableInfo = {
  token: string;
  number: number;
};

export type QuoteInput = {
  itemId: string;
  variantId: string | null;
  addonIds: string[];
  qty: number;
};

export type Quote = {
  unitPrice: number;
  lineTotal: number;
};

export type LineDraft = QuoteInput & {
  notes: string;
};

/** A cart or order line as the repo presents it. Prices are already totals. */
export type PricedLine = {
  id: string;
  itemId: string;
  variantId: string | null;
  addonIds: string[];
  qty: number;
  notes: string;
  available: boolean;
  unitPrice: number;
  lineTotal: number;
  name_te: string | null;
  name_en: string | null;
  detail_te: string | null;
  detail_en: string | null;
};

export type Cart = {
  lines: PricedLine[];
  notes: string;
  /** Sum of quantities. Not a price. */
  count: number;
  total: number;
  canSend: boolean;
};

export type OrderStatus = "sent" | "confirmed" | "preparing" | "ready" | "served" | "rejected";

export type OrderRound = {
  id: string;
  number: number;
  status: OrderStatus;
  lines: PricedLine[];
  notes: string;
  total: number;
  createdAt: string;
  rejectReason_te: string | null;
  rejectReason_en: string | null;
};

export type TaxLine = {
  id: string;
  name_te: string | null;
  name_en: string | null;
  amount: number;
};

export type PaymentStatus = "unpaid" | "pending" | "failed" | "at_counter";

export type Bill = {
  lines: PricedLine[];
  itemTotal: number;
  taxLines: TaxLine[];
  total: number;
  payment: PaymentStatus;
};

export type TableView = {
  restaurant: Restaurant;
  table: TableInfo;
  categories: MenuCategory[];
  items: MenuItem[];
  cart: Cart;
  orders: OrderRound[];
  bill: Bill;
  waiterCalled: boolean;
  billRequested: boolean;
};

export type DataErrorCode = "denied" | "session_expired" | "failed";

export type OpenResult = { ok: true; view: TableView } | { ok: false; error: DataErrorCode };
