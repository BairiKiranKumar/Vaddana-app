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

export type TaxMode = "none" | "gst";

export type Restaurant = {
  id: string;
  name_te: string | null;
  name_en: string | null;
  tagline_te: string | null;
  tagline_en: string | null;
  defaultLocale: "te" | "en";
  gstin: string;
  fssai: string;
  /** `gst` adds a CGST/SGST split in the repo. `none` leaves tax lines empty. */
  taxMode: TaxMode;
  /** Percent the owner typed. The repo applies it. The UI does not. */
  gstRate: number;
  upiId: string;
  autoAccept: boolean;
  payFirst: boolean;
  logoDataUrl: string | null;
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
  /** Restaurant asks for payment before this cart can go to the kitchen. */
  holdForPayment: boolean;
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

export type PaymentStatus = "unpaid" | "pending" | "failed" | "at_counter" | "paid";
export type PaymentMode = "cash" | "upi" | "counter" | null;

export type Bill = {
  lines: PricedLine[];
  itemTotal: number;
  taxLines: TaxLine[];
  total: number;
  payment: PaymentStatus;
  paymentMode: PaymentMode;
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

export type Role = "owner" | "captain" | "waiter" | "cook";
export type Surface = "staff" | "kitchen" | "admin";

export type StaffMember = {
  id: string;
  name: string;
  role: Role;
  locale: "te" | "en";
  active: boolean;
};

export type Area = {
  id: string;
  name_te: string | null;
  name_en: string | null;
};

export type Desk = {
  id: string;
  token: string;
  number: number;
  areaId: string;
  seats: number;
};

export type Ticket = {
  token: string;
  tableNumber: number;
  order: OrderRound;
  minutes: number;
};

export type BillCard = {
  token: string;
  tableNumber: number;
  bill: Bill;
  minutes: number;
};

export type Alert = {
  token: string;
  tableNumber: number;
  kind: "waiter" | "bill";
};

export type TopItem = {
  itemId: string;
  name_te: string | null;
  name_en: string | null;
  qty: number;
  total: number;
};

export type Today = {
  sales: number;
  orderCount: number;
  averageBill: number;
  openTables: number;
  topItems: TopItem[];
  byHour: { hour: number; total: number }[];
  byPayment: { mode: "cash" | "upi" | "counter"; total: number }[];
};

export type OrderRecord = {
  id: string;
  token: string;
  tableNumber: number;
  status: OrderStatus;
  payment: PaymentStatus;
  paymentMode: PaymentMode;
  total: number;
  createdAt: string;
  lines: PricedLine[];
  notes: string;
};

export type HouseView = {
  settings: Restaurant;
  categories: MenuCategory[];
  items: MenuItem[];
  areas: Area[];
  desks: Desk[];
  staff: StaffMember[];
  alerts: Alert[];
  incoming: Ticket[];
  confirmed: Ticket[];
  ready: Ticket[];
  kitchen: Ticket[];
  bills: BillCard[];
  today: Today;
  records: OrderRecord[];
};

export type HouseResult =
  | { ok: true; house: HouseView; member: StaffMember }
  | { ok: false; error: "session_expired"; roster: StaffMember[] }
  | { ok: false; error: "denied" }
  | { ok: false; error: "failed" };

export type ItemInput = {
  id: string | null;
  categoryId: string;
  name_te: string;
  name_en: string;
  description_te: string;
  description_en: string;
  price: number;
  diet: Diet;
  available: boolean;
  variants: PricedChoice[];
  addons: PricedChoice[];
  addonMax: number;
};

export type DeskInput = {
  areaId: string;
  number: number;
  seats: number;
};

export type StaffInput = {
  name: string;
  role: Role;
  locale: "te" | "en";
};
