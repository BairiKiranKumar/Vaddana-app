import { annapurnaSeed, knownRestaurantIds } from "@/lib/data/platform/houses";
import { quoteLine } from "@/lib/data/pricing";
import { categories as catalogCategories, items as catalogItems, sampleRestaurant } from "@/lib/data/mock/menu";
import {
  NOTES_MAX,
  type Area,
  type Bill,
  type Cart,
  type Desk,
  type DeskInput,
  type Diet,
  type HouseView,
  type ItemInput,
  type MenuCategory,
  type MenuItem,
  type Offer,
  type OrderRound,
  type OrderStatus,
  type PaymentMode,
  type PaymentStatus,
  type PricedChoice,
  type PricedLine,
  type Quote,
  type QuoteInput,
  type Restaurant,
  type Review,
  type Role,
  type StaffInput,
  type StaffMember,
  type Surface,
  type TableView,
  type TaxLine,
} from "@/lib/data/types";

export type StoredLine = {
  id: string;
  itemId: string;
  variantId: string | null;
  addonIds: string[];
  qty: number;
  notes: string;
};

export type StoredOrder = {
  id: string;
  number: number;
  status: OrderStatus;
  lines: StoredLine[];
  notes: string;
  createdAt: string;
  rejectReason_te: string | null;
  rejectReason_en: string | null;
};

export type Session = {
  lines: StoredLine[];
  notes: string;
  orders: StoredOrder[];
  payment: PaymentStatus;
  paymentMode: PaymentMode;
  prepaid: boolean;
  waiterCalled: boolean;
  billRequested: boolean;
  offerId?: string | null;
};

type Row = { session: Session };

export type Snapshot = {
  revision: number;
  settings: Restaurant;
  categories: MenuCategory[];
  items: MenuItem[];
  areas: Area[];
  desks: Desk[];
  staff: StaffMember[];
  sessions: [string, Session][];
  offers?: Offer[];
  reviews?: Review[];
};

type Memory = Snapshot & {
  tokenListeners: Map<string, Set<(view: TableView) => void>>;
  houseListeners: Set<(house: HouseView) => void>;
  channel: BroadcastChannel | null;
  listening: boolean;
};

type Envelope = { type: "ask" } | { type: "state"; snapshot: Snapshot };

const MEMORY = "__vaddanaHouse";

let activeId = "srinidhi";

export function activeRestaurantId() {
  return activeId;
}

export function storageKeyFor(id: string) {
  return id === "srinidhi" ? "vaddana-house-v1" : `vaddana-house-v1:${id}`;
}

export function activateRestaurant(id: string) {
  if (!id || id === activeId) return;
  activeId = id;
  const g = globalThis as typeof globalThis & { [MEMORY]?: Memory };
  delete g[MEMORY];
}

export function withRestaurant<T>(id: string, read: () => T): T {
  const previous = activeId;
  activateRestaurant(id);
  try {
    return read();
  } finally {
    activateRestaurant(previous);
  }
}

function readStorage(): Snapshot | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKeyFor(activeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Snapshot;
    if (!parsed?.settings || !Array.isArray(parsed.sessions) || !Array.isArray(parsed.items) || !Array.isArray(parsed.staff)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKeyFor(activeId), JSON.stringify(snapshot()));
  } catch {
    // A full local disk should not take the boards down. The tab still has the copy in memory.
  }
}

function emptySession(): Session {
  return {
    lines: [],
    notes: "",
    orders: [],
    payment: "unpaid",
    paymentMode: null,
    prepaid: false,
    waiterCalled: false,
    billRequested: false,
  };
}

/** Stable for a clock hour so server HTML and the browser agree on the seed. Clamped to today. */
function earlier(minutes: number) {
  const hour = Math.floor(Date.now() / 3_600_000) * 3_600_000;
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  return new Date(Math.max(hour - minutes * 60_000, midnight.getTime() + 60_000)).toISOString();
}

function line(id: string, itemId: string, qty: number, variantId: string | null = null, addonIds: string[] = [], notes = ""): StoredLine {
  return { id, itemId, variantId, addonIds, qty, notes };
}

function order(
  id: string,
  number: number,
  status: OrderStatus,
  lines: StoredLine[],
  notes: string,
  minutesAgo: number,
  rejectReason_te: string | null = null,
  rejectReason_en: string | null = null,
): StoredOrder {
  return { id, number, status, lines, notes, createdAt: earlier(minutesAgo), rejectReason_te, rejectReason_en };
}

function seedSessions(): [string, Session][] {
  const session = (orders: StoredOrder[], extra: Partial<Session> = {}): Session => ({
    ...emptySession(),
    orders,
    ...extra,
  });
  return [
    [
      "1",
      session([order("t1-r1", 1, "served", [line("t1-l1", "poori-perugu", 2), line("t1-l2", "chai", 2)], "", 180)], {
        payment: "paid",
        paymentMode: "cash",
      }),
    ],
    [
      "2",
      session([
        order("t2-r1", 1, "confirmed", [line("t2-l1", "natu-kodi-pulusu", 1, "full", ["rice"])], "తక్కువ కారం", 20),
      ]),
    ],
    [
      "3",
      session([order("t3-r1", 1, "served", [line("t3-l1", "telangana-meals", 2), line("t3-l2", "majjiga", 2)], "", 50)], {
        billRequested: true,
      }),
    ],
    [
      "4",
      session([
        order("t4-r1", 1, "rejected", [line("t4-l0", "mutton-biryani", 1)], "", 35, "ఇప్పుడు అయిపోయింది", "Sold out just now"),
        order("t4-r2", 2, "sent", [line("t4-l1", "chicken-biryani", 1, "half", ["egg"])], "తక్కువ కారం", 8),
      ]),
    ],
    ["5", session([order("t5-r1", 1, "confirmed", [line("t5-l1", "chai", 3)], "", 6)], { waiterCalled: true })],
    [
      "6",
      session([order("t6-r1", 1, "served", [line("t6-l1", "mutton-biryani", 1)], "", 40)], {
        payment: "failed",
        billRequested: true,
      }),
    ],
    ["7", emptySession()],
    [
      "8",
      session(
        [order("t8-r1", 1, "served", [line("t8-l1", "gongura-kodi", 1), line("t8-l2", "jonna-rotte", 4)], "", 120)],
        { payment: "paid", paymentMode: "upi" },
      ),
    ],
    ["9", session([order("t9-r1", 1, "ready", [line("t9-l1", "idli", 2), line("t9-l2", "poori-perugu", 1)], "", 30)])],
  ];
}

function seed(): Snapshot {
  if (activeId === "annapurna") return annapurnaSeed();
  if (activeId !== "srinidhi") {
    return {
      revision: 1,
      settings: {
        id: activeId,
        name_te: activeId,
        name_en: activeId,
        tagline_te: null,
        tagline_en: null,
        defaultLocale: "te",
        gstin: "",
        fssai: "",
        taxMode: "none",
        gstRate: 0,
        upiId: "",
        autoAccept: false,
        payFirst: false,
        logoDataUrl: null,
      },
      categories: [],
      items: [],
      areas: [],
      desks: [],
      staff: [],
      sessions: [],
      offers: [],
      reviews: [],
    };
  }
  return {
    revision: 1,
    settings: structuredClone(sampleRestaurant),
    categories: structuredClone(catalogCategories),
    items: structuredClone(catalogItems),
    areas: [
      { id: "ac", name_te: "ఏసీ", name_en: "AC" },
      { id: "family", name_te: "ఫ్యామిలీ", name_en: "Family" },
      { id: "garden", name_te: "గార్డెన్", name_en: "Garden" },
    ],
    desks: [
      { id: "d1", token: "1", number: 1, areaId: "ac", seats: 4 },
      { id: "d2", token: "2", number: 2, areaId: "family", seats: 6 },
      { id: "d3", token: "3", number: 3, areaId: "garden", seats: 4 },
      { id: "d4", token: "4", number: 4, areaId: "ac", seats: 2 },
      { id: "d5", token: "5", number: 5, areaId: "family", seats: 4 },
      { id: "d6", token: "6", number: 6, areaId: "garden", seats: 4 },
      { id: "d7", token: "7", number: 7, areaId: "family", seats: 4 },
      { id: "d8", token: "8", number: 8, areaId: "ac", seats: 2 },
      { id: "d9", token: "9", number: 9, areaId: "garden", seats: 6 },
    ],
    staff: [
      { id: "lakshmi", name: "లక్ష్మి", role: "owner", locale: "en", active: true },
      { id: "ravi", name: "రవి", role: "captain", locale: "te", active: true },
      { id: "suresh", name: "సురేష్", role: "waiter", locale: "te", active: true },
      { id: "anita", name: "అనిత", role: "cook", locale: "te", active: true },
    ],
    sessions: seedSessions(),
    offers: [],
    reviews: [],
  };
}

function fillCatalog(snap: Snapshot): Snapshot {
  const offers = snap.offers ?? [];
  const reviews = snap.reviews ?? [];
  if (snap.settings.id === "annapurna" && offers.length === 0 && reviews.length === 0) {
    const seeded = annapurnaSeed();
    return { ...snap, offers: seeded.offers, reviews: seeded.reviews };
  }
  return { ...snap, offers, reviews };
}

function withCatalogPhotos(snap: Snapshot): Snapshot {
  const photos = new Map(catalogItems.map((item) => [item.id, item.image]));
  return {
    ...snap,
    items: snap.items.map((item) => (item.image ? item : { ...item, image: photos.get(item.id) })),
  };
}

function memory(): Memory {
  const g = globalThis as typeof globalThis & { [MEMORY]?: Memory };
  if (!g[MEMORY]) {
    const stored = readStorage();
    g[MEMORY] = {
      ...(stored ? withCatalogPhotos(fillCatalog(stored)) : seed()),
      tokenListeners: new Map(),
      houseListeners: new Set(),
      channel: null,
      listening: false,
    };
  }
  return g[MEMORY];
}

function snapshot(): Snapshot {
  const mem = memory();
  return {
    revision: mem.revision,
    settings: mem.settings,
    categories: mem.categories,
    items: mem.items,
    areas: mem.areas,
    desks: mem.desks,
    staff: mem.staff,
    sessions: mem.sessions,
    offers: mem.offers ?? [],
    reviews: mem.reviews ?? [],
  };
}

function channel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  const mem = memory();
  mem.channel ??= new BroadcastChannel(`vaddana-tables:${activeId}`);
  return mem.channel;
}

function adopt(next: Snapshot) {
  const mem = memory();
  if (next.revision < mem.revision) return;
  mem.revision = next.revision;
  mem.settings = next.settings;
  mem.categories = next.categories;
  mem.items = next.items;
  mem.areas = next.areas;
  mem.desks = next.desks;
  mem.staff = next.staff;
  mem.sessions = next.sessions;
  mem.offers = next.offers ?? [];
  mem.reviews = next.reviews ?? [];
  persist();
  emitAll();
}

function listen() {
  const mem = memory();
  const bus = channel();
  if (!bus || mem.listening) return;
  mem.listening = true;
  bus.onmessage = (event: MessageEvent<Envelope>) => {
    const msg = event.data;
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "ask") {
      bus.postMessage({ type: "state", snapshot: snapshot() } satisfies Envelope);
      return;
    }
    if (msg.type === "state") adopt(msg.snapshot);
  };
}

function post() {
  channel()?.postMessage({ type: "state", snapshot: snapshot() } satisfies Envelope);
}

function emitAll() {
  const mem = memory();
  for (const [token, listeners] of mem.tokenListeners) {
    const view = presentTable(token);
    if (!view) continue;
    for (const listener of listeners) listener(view);
  }
  const house = presentHouse();
  for (const listener of mem.houseListeners) listener(house);
}

function commit() {
  memory().revision += 1;
  persist();
  emitAll();
  post();
}

function sessions(): Map<string, Row> {
  return new Map(memory().sessions.map(([token, session]) => [token, { session }]));
}

function writeSession(token: string, session: Session) {
  const next = memory().sessions.filter(([key]) => key !== token);
  next.push([token, session]);
  memory().sessions = next;
}

export function deskFor(token: string): Desk | undefined {
  return memory().desks.find((desk) => desk.token === token);
}

function itemById(id: string): MenuItem | undefined {
  return memory().items.find((item) => item.id === id);
}

function blank(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function money(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function choice(input: PricedChoice): PricedChoice {
  return {
    id: input.id || crypto.randomUUID(),
    name_te: blank(input.name_te ?? ""),
    name_en: blank(input.name_en ?? ""),
    price: money(input.price),
  };
}

function normalize(item: MenuItem, input: QuoteInput): QuoteInput {
  const variantId = item.variants?.some((entry) => entry.id === input.variantId)
    ? input.variantId
    : (item.variants?.at(-1)?.id ?? null);
  const allowed = new Set(item.addons?.options.map((entry) => entry.id) ?? []);
  const max = item.addons?.max ?? 0;
  return { itemId: item.id, variantId, addonIds: input.addonIds.filter((id) => allowed.has(id)).slice(0, max), qty: input.qty };
}

function detailFor(item: MenuItem, variantId: string | null, addonIds: string[]) {
  const te: string[] = [];
  const en: string[] = [];
  const variant = item.variants?.find((entry) => entry.id === variantId);
  if (variant) {
    te.push(variant.name_te ?? variant.name_en ?? "");
    en.push(variant.name_en ?? variant.name_te ?? "");
  }
  for (const id of addonIds) {
    const addOn = item.addons?.options.find((entry) => entry.id === id);
    if (!addOn) continue;
    te.push(addOn.name_te ?? addOn.name_en ?? "");
    en.push(addOn.name_en ?? addOn.name_te ?? "");
  }
  const join = (parts: string[]) => parts.filter(Boolean).join(", ") || null;
  return { detail_te: join(te), detail_en: join(en) };
}

function priceLine(stored: StoredLine): PricedLine | null {
  const item = itemById(stored.itemId);
  if (!item) return null;
  const quote = quoteLine(item, stored);
  return {
    ...stored,
    ...detailFor(item, stored.variantId, stored.addonIds),
    available: item.available,
    unitPrice: quote.unitPrice,
    lineTotal: quote.lineTotal,
    name_te: item.name_te,
    name_en: item.name_en,
  };
}

function sum(lines: PricedLine[]) {
  return lines.reduce((total, line) => total + line.lineTotal, 0);
}

function taxFor(itemTotal: number, settings: Restaurant): TaxLine[] {
  if (settings.taxMode !== "gst" || settings.gstRate <= 0 || itemTotal <= 0) return [];
  const tax = Math.round((itemTotal * settings.gstRate) / 100);
  const cgst = Math.round(tax / 2);
  const sgst = tax - cgst;
  const half = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(settings.gstRate / 2);
  return [
    { id: "cgst", name_te: `సీజీఎస్టీ ${half}%`, name_en: `CGST ${half}%`, amount: cgst },
    { id: "sgst", name_te: `ఎస్జీఎస్టీ ${half}%`, name_en: `SGST ${half}%`, amount: sgst },
  ];
}

function minutesSince(iso: string) {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
}

function presentSession(token: string, session: Session): { view: TableView; orders: OrderRound[]; bill: Bill } {
  const desk = deskFor(token);
  const lines = session.lines.map(priceLine).filter((entry): entry is PricedLine => entry !== null);
  const notesOk = session.notes.trim().length <= NOTES_MAX;
  const holdForPayment = memory().settings.payFirst && !session.prepaid && lines.length > 0;
  const cart: Cart = {
    lines,
    notes: session.notes,
    count: lines.reduce((count, entry) => count + entry.qty, 0),
    total: sum(lines),
    canSend: lines.length > 0 && lines.every((entry) => entry.available) && notesOk && !holdForPayment,
    holdForPayment,
  };
  const orders: OrderRound[] = session.orders.map((entry) => {
    const priced = entry.lines.map(priceLine).filter((line): line is PricedLine => line !== null);
    return { ...entry, lines: priced, total: sum(priced) };
  });
  const billLines = orders.filter((entry) => entry.status !== "rejected").flatMap((entry) => entry.lines);
  const itemTotal = sum(billLines);
  const offer = (memory().offers ?? []).find((entry) => entry.active && entry.id === session.offerId);
  const discount = offer ? Math.min(itemTotal, Math.round((itemTotal * Math.min(30, offer.percent)) / 100)) : 0;
  const taxLines = taxFor(itemTotal, memory().settings);
  if (offer && discount > 0) taxLines.push({ id: `offer-${offer.id}`, name_te: offer.name_te, name_en: offer.name_en, amount: -discount });
  const bill: Bill = {
    lines: billLines,
    itemTotal,
    taxLines,
    total: itemTotal + taxLines.reduce((total, entry) => total + entry.amount, 0),
    payment: session.payment,
    paymentMode: session.paymentMode,
  };
  const view: TableView = {
    restaurant: memory().settings,
    table: { token, number: desk?.number ?? 0 },
    categories: [...memory().categories].sort((a, b) => a.sort - b.sort),
    items: memory().items,
    cart,
    orders,
    bill,
    waiterCalled: session.waiterCalled,
    billRequested: session.billRequested,
    offers: memory().offers ?? [],
    offerId: session.offerId ?? null,
  };
  return { view, orders, bill };
}

export function presentTable(token: string): TableView | null {
  const row = sessions().get(token);
  if (!row || !deskFor(token)) return null;
  return presentSession(token, row.session).view;
}

export function presentHouse(): HouseView {
  const mem = memory();
  const incoming: HouseView["incoming"] = [];
  const confirmed: HouseView["confirmed"] = [];
  const ready: HouseView["ready"] = [];
  const kitchen: HouseView["kitchen"] = [];
  const bills: HouseView["bills"] = [];
  const alerts: HouseView["alerts"] = [];
  const records: HouseView["records"] = [];
  let openTables = 0;
  const paidBills: Bill[] = [];
  const itemQty = new Map<string, { qty: number; total: number; name_te: string | null; name_en: string | null }>();

  for (const desk of mem.desks) {
    const session = sessions().get(desk.token)?.session;
    if (!session) continue;
    const presented = presentSession(desk.token, session);
    const active = presented.orders.some((entry) => entry.status !== "served" && entry.status !== "rejected");
    if (active || presented.view.cart.lines.length > 0 || (presented.bill.lines.length > 0 && presented.bill.payment !== "paid")) {
      openTables += 1;
    }
    if (session.waiterCalled) alerts.push({ token: desk.token, tableNumber: desk.number, kind: "waiter" as const });
    if (session.billRequested && presented.bill.payment !== "paid") {
      alerts.push({ token: desk.token, tableNumber: desk.number, kind: "bill" as const });
      const newest = presented.orders.at(-1);
      bills.push({
        token: desk.token,
        tableNumber: desk.number,
        bill: presented.bill,
        minutes: newest ? minutesSince(newest.createdAt) : 0,
      });
    }
    if (presented.bill.payment === "paid") paidBills.push(presented.bill);
    for (const entry of presented.orders) {
      records.push({
        id: entry.id,
        token: desk.token,
        tableNumber: desk.number,
        status: entry.status,
        payment: presented.bill.payment,
        paymentMode: presented.bill.paymentMode,
        total: entry.total,
        createdAt: entry.createdAt,
        lines: entry.lines,
        notes: entry.notes,
      });
      const ticket = { token: desk.token, tableNumber: desk.number, order: entry, minutes: minutesSince(entry.createdAt) };
      if (entry.status === "sent") incoming.push(ticket);
      if (entry.status === "confirmed" || entry.status === "preparing") confirmed.push(ticket);
      if (entry.status === "confirmed" || entry.status === "preparing") kitchen.push(ticket);
      if (entry.status === "ready") ready.push(ticket);
      if (entry.status === "rejected") continue;
      for (const item of entry.lines) {
        const current = itemQty.get(item.itemId) ?? { qty: 0, total: 0, name_te: item.name_te, name_en: item.name_en };
        current.qty += item.qty;
        current.total += item.lineTotal;
        itemQty.set(item.itemId, current);
      }
    }
  }

  const byTime = (a: { order: OrderRound }, b: { order: OrderRound }) => a.order.createdAt.localeCompare(b.order.createdAt);
  kitchen.sort(byTime);
  const sales = paidBills.reduce((total, bill) => total + bill.total, 0);
  const byHourMap = new Map<number, number>();
  const byPayment = new Map<"cash" | "upi" | "counter", number>();
  for (const desk of mem.desks) {
    const session = sessions().get(desk.token)?.session;
    if (!session || session.payment !== "paid" || !session.paymentMode) continue;
    const presented = presentSession(desk.token, session);
    const hour = new Date(presented.orders.at(-1)?.createdAt ?? 0).getHours();
    byHourMap.set(hour, (byHourMap.get(hour) ?? 0) + presented.bill.total);
    if (session.paymentMode === "cash" || session.paymentMode === "upi" || session.paymentMode === "counter") {
      byPayment.set(session.paymentMode, (byPayment.get(session.paymentMode) ?? 0) + presented.bill.total);
    }
  }

  return {
    settings: mem.settings,
    categories: [...mem.categories].sort((a, b) => a.sort - b.sort),
    items: mem.items,
    areas: mem.areas,
    desks: [...mem.desks].sort((a, b) => a.number - b.number),
    staff: mem.staff,
    alerts,
    incoming,
    confirmed: confirmed.sort(byTime),
    ready,
    kitchen,
    bills,
    today: {
      sales,
      orderCount: records.filter((entry) => entry.status !== "rejected").length,
      averageBill: paidBills.length ? Math.round(sales / paidBills.length) : 0,
      openTables,
      topItems: [...itemQty.entries()]
        .map(([itemId, row]) => ({ itemId, ...row }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5),
      byHour: [...byHourMap.entries()].map(([hour, total]) => ({ hour, total })).sort((a, b) => a.hour - b.hour),
      byPayment: [...byPayment.entries()].map(([mode, total]) => ({ mode, total })),
    },
    records: records.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    offers: mem.offers ?? [],
    reviews: mem.reviews ?? [],
  };
}

export function quote(input: QuoteInput): Quote {
  const item = itemById(input.itemId) ?? itemFromAnyHouse(input.itemId);
  if (!item) throw new Error(`Unknown item ${input.itemId}`);
  return quoteLine(item, normalize(item, input));
}

function itemFromAnyHouse(id: string): MenuItem | undefined {
  for (const restaurantId of knownRestaurantIds()) {
    const found = peekSnapshot(restaurantId).items.find((entry) => entry.id === id);
    if (found) return found;
  }
  return undefined;
}

function sessionOf(token: string): Session {
  return sessions().get(token)?.session ?? emptySession();
}

export function changeTable(token: string, recipe: (session: Session) => Session, offline: boolean): TableView {
  const current = sessionOf(token);
  if (offline) return presentSession(token, current).view;
  writeSession(token, recipe(structuredClone(current)));
  commit();
  return presentTable(token) ?? presentSession(token, emptySession()).view;
}

export function changeHouse(recipe: () => void, offline: boolean): HouseView {
  if (offline) return presentHouse();
  recipe();
  commit();
  return presentHouse();
}

export function allowed(role: Role, surface: Surface) {
  if (surface === "admin") return role === "owner";
  if (surface === "staff") return role === "owner" || role === "captain" || role === "waiter";
  return role === "owner" || role === "captain" || role === "waiter" || role === "cook";
}

export function memberById(id: string | null) {
  if (!id) return undefined;
  return memory().staff.find((person) => person.id === id && person.active);
}

export function subscribe(token: string, onChange: (view: TableView) => void) {
  listen();
  const mem = memory();
  const set = mem.tokenListeners.get(token) ?? new Set<(view: TableView) => void>();
  set.add(onChange);
  mem.tokenListeners.set(token, set);
  channel()?.postMessage({ type: "ask" } satisfies Envelope);
  return () => set.delete(onChange);
}

export function subscribeHouse(onChange: (house: HouseView) => void) {
  listen();
  memory().houseListeners.add(onChange);
  channel()?.postMessage({ type: "ask" } satisfies Envelope);
  return () => memory().houseListeners.delete(onChange);
}

export function ensureTable(token: string) {
  if (!sessions().has(token)) writeSession(token, emptySession());
}

function patchOrder(token: string, orderId: string, recipe: (order: StoredOrder) => void) {
  const session = structuredClone(sessionOf(token));
  const target = session.orders.find((entry) => entry.id === orderId);
  if (!target) return;
  recipe(target);
  writeSession(token, session);
}

export function confirmOrder(token: string, orderId: string) {
  patchOrder(token, orderId, (entry) => {
    if (entry.status === "sent") entry.status = "confirmed";
  });
}

export function rejectOrder(token: string, orderId: string, reason: string) {
  const text = reason.trim().slice(0, NOTES_MAX);
  if (!text) return;
  patchOrder(token, orderId, (entry) => {
    if (entry.status !== "sent") return;
    entry.status = "rejected";
    entry.rejectReason_te = text;
    entry.rejectReason_en = text;
  });
}

export function markPreparing(token: string, orderId: string) {
  patchOrder(token, orderId, (entry) => {
    if (entry.status === "confirmed") entry.status = "preparing";
  });
}

export function markReady(token: string, orderId: string) {
  patchOrder(token, orderId, (entry) => {
    if (entry.status === "preparing") entry.status = "ready";
  });
}

export function markServed(token: string, orderId: string) {
  patchOrder(token, orderId, (entry) => {
    if (entry.status === "ready") entry.status = "served";
  });
}

export function markPaid(token: string, mode: "cash" | "upi") {
  const session = structuredClone(sessionOf(token));
  if (presentSession(token, session).bill.lines.length === 0) return;
  session.payment = "paid";
  session.paymentMode = mode;
  session.billRequested = false;
  writeSession(token, session);
}

export function saveItem(input: ItemInput) {
  const name_te = blank(input.name_te);
  const name_en = blank(input.name_en);
  if (!name_te && !name_en) return;
  const variants = input.variants.map(choice).filter((entry) => entry.name_te || entry.name_en);
  const addons = input.addons.map(choice).filter((entry) => entry.name_te || entry.name_en);
  const next: MenuItem = {
    id: input.id ?? crypto.randomUUID(),
    categoryId: input.categoryId,
    name_te,
    name_en,
    description_te: blank(input.description_te),
    description_en: blank(input.description_en),
    price: money(input.price),
    diet: input.diet,
    available: input.available,
    search: [name_en, name_te].filter((value): value is string => Boolean(value)).map((value) => value.toLowerCase()),
    ...(variants.length ? { variants } : {}),
    ...(addons.length ? { addons: { max: Math.max(1, Math.round(input.addonMax) || addons.length), options: addons } } : {}),
  };
  const items = memory().items;
  const index = items.findIndex((item) => item.id === next.id);
  if (index === -1) items.push(next);
  else items[index] = next;
}

export function setAvailable(id: string, available: boolean) {
  const item = itemById(id);
  if (item) item.available = available;
}

export function moveItem(id: string, direction: -1 | 1) {
  const items = memory().items;
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  const siblings = items.filter((entry) => entry.categoryId === item.categoryId);
  const index = siblings.findIndex((entry) => entry.id === id);
  const swap = siblings[index + direction];
  if (!swap) return;
  const a = items.indexOf(item);
  const b = items.indexOf(swap);
  [items[a], items[b]] = [items[b]!, items[a]!];
}

export function moveCategory(id: string, direction: -1 | 1) {
  const list = [...memory().categories].sort((a, b) => a.sort - b.sort);
  const index = list.findIndex((entry) => entry.id === id);
  const swap = list[index + direction];
  const current = list[index];
  if (!current || !swap) return;
  const sort = current.sort;
  current.sort = swap.sort;
  swap.sort = sort;
}

export function bulkPrice(ids: string[], kind: "percent" | "rupees", amount: number) {
  if (!Number.isFinite(amount) || amount === 0) return;
  const selected = new Set(ids);
  const apply = (price: number) => {
    const next = kind === "percent" ? price * (1 + amount / 100) : price + amount;
    return money(next);
  };
  for (const item of memory().items) {
    if (!selected.has(item.id)) continue;
    item.price = apply(item.price);
    item.variants?.forEach((entry) => {
      entry.price = apply(entry.price);
    });
  }
}

export function addCategory(name_te: string, name_en: string) {
  const te = blank(name_te);
  const en = blank(name_en);
  if (!te && !en) return;
  const sort = Math.max(0, ...memory().categories.map((entry) => entry.sort)) + 1;
  memory().categories.push({ id: crypto.randomUUID(), name_te: te, name_en: en, sort });
}

export function addDesk(input: DeskInput) {
  const number = Math.round(input.number);
  const seats = Math.round(input.seats);
  if (!memory().areas.some((area) => area.id === input.areaId)) return;
  if (!Number.isFinite(number) || number < 1) return;
  if (memory().desks.some((desk) => desk.number === number)) return;
  const token = memory().desks.some((desk) => desk.token === String(number)) ? `t${number}${crypto.randomUUID().slice(0, 4)}` : String(number);
  memory().desks.push({ id: crypto.randomUUID(), token, number, areaId: input.areaId, seats: Math.max(1, seats || 1) });
  writeSession(token, emptySession());
}

export function rotateDesk(id: string): string | null {
  const desk = memory().desks.find((entry) => entry.id === id);
  if (!desk) return null;
  const previous = desk.token;
  const next = `t${desk.number}${crypto.randomUUID().slice(0, 4)}`;
  const session = sessionOf(previous);
  desk.token = next;
  memory().sessions = memory().sessions.filter(([token]) => token !== previous);
  writeSession(next, session);
  return next;
}

export function inviteStaff(input: StaffInput) {
  const name = input.name.trim();
  if (!name) return;
  memory().staff.push({ id: crypto.randomUUID(), name, role: input.role, locale: input.locale, active: true });
}

export function setStaffActive(id: string, active: boolean) {
  const person = memory().staff.find((entry) => entry.id === id);
  if (person && person.role !== "owner") person.active = active;
}

export function setStaffLocale(id: string, locale: "te" | "en") {
  const person = memory().staff.find((entry) => entry.id === id);
  if (person) person.locale = locale;
}

export function saveSettings(patch: Partial<Restaurant>) {
  const settings = memory().settings;
  if (patch.name_te !== undefined) settings.name_te = blank(patch.name_te ?? "");
  if (patch.name_en !== undefined) settings.name_en = blank(patch.name_en ?? "");
  if (patch.tagline_te !== undefined) settings.tagline_te = blank(patch.tagline_te ?? "");
  if (patch.tagline_en !== undefined) settings.tagline_en = blank(patch.tagline_en ?? "");
  if (patch.gstin !== undefined) settings.gstin = patch.gstin.trim();
  if (patch.fssai !== undefined) settings.fssai = patch.fssai.trim();
  if (patch.taxMode === "none" || patch.taxMode === "gst") settings.taxMode = patch.taxMode;
  if (patch.gstRate !== undefined && Number.isFinite(patch.gstRate)) settings.gstRate = Math.min(28, Math.max(0, patch.gstRate));
  if (patch.upiId !== undefined) settings.upiId = patch.upiId.trim();
  if (patch.autoAccept !== undefined) settings.autoAccept = patch.autoAccept;
  if (patch.payFirst !== undefined) settings.payFirst = patch.payFirst;
  if (patch.defaultLocale === "te" || patch.defaultLocale === "en") settings.defaultLocale = patch.defaultLocale;
  if (patch.logoDataUrl !== undefined) settings.logoDataUrl = patch.logoDataUrl;
}

export function addLine(session: Session, draft: QuoteInput & { notes: string }) {
  const item = itemById(draft.itemId);
  if (!item?.available) return;
  const notes = draft.notes.trim();
  if (notes.length > NOTES_MAX) return;
  session.lines.push({ id: crypto.randomUUID(), ...normalize(item, draft), notes });
}

export function updateLine(session: Session, lineId: string, draft: QuoteInput & { notes: string }) {
  const item = itemById(draft.itemId);
  if (!item) return;
  const notes = draft.notes.trim();
  if (notes.length > NOTES_MAX) return;
  const next = normalize(item, draft);
  session.lines = session.lines.map((entry) => (entry.id === lineId ? { ...entry, ...next, notes } : entry));
}

export function sendCart(token: string, session: Session) {
  const view = presentSession(token, session).view;
  if (!view.cart.canSend) return;
  session.orders.push({
    id: crypto.randomUUID(),
    number: session.orders.length + 1,
    status: memory().settings.autoAccept ? "confirmed" : "sent",
    lines: session.lines.map((entry) => ({ ...entry })),
    notes: session.notes.trim(),
    createdAt: new Date().toISOString(),
    rejectReason_te: null,
    rejectReason_en: null,
  });
  session.lines = [];
  session.notes = "";
  session.prepaid = false;
  if (session.payment === "paid") {
    session.payment = "unpaid";
    session.paymentMode = null;
  }
}

export function isDiet(value: string): value is Diet {
  return value === "veg" || value === "nonveg";
}

export function peekSnapshot(id: string): Snapshot {
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(storageKeyFor(id));
      if (raw) {
        const parsed = JSON.parse(raw) as Snapshot;
        if (parsed?.settings && Array.isArray(parsed.sessions) && Array.isArray(parsed.items)) {
          return id === "srinidhi" ? withCatalogPhotos(fillCatalog(parsed)) : fillCatalog(parsed);
        }
      }
    } catch {
      // Fall through to the code seed.
    }
  }
  const previous = activeId;
  activeId = id;
  const seeded = id === "srinidhi" ? withCatalogPhotos(seed()) : seed();
  activeId = previous;
  return seeded;
}

export function writeSnapshot(id: string, snap: Snapshot) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(storageKeyFor(id), JSON.stringify(snap));
  if (id === activeId) {
    const g = globalThis as typeof globalThis & { [MEMORY]?: Memory };
    delete g[MEMORY];
  }
}

export function restaurantForToken(token: string): string | null {
  if (!token || token === "expired") return null;
  for (const id of knownRestaurantIds()) {
    if (peekSnapshot(id).desks.some((desk) => desk.token === token)) return id;
  }
  return null;
}

export function restaurantForStaff(id: string): string | null {
  for (const restaurantId of knownRestaurantIds()) {
    if (peekSnapshot(restaurantId).staff.some((person) => person.id === id && person.active)) return restaurantId;
  }
  return null;
}

export function rosterAll(): StaffMember[] {
  return knownRestaurantIds().flatMap((id) => {
    const snap = peekSnapshot(id);
    const restaurantName = snap.settings.name_en ?? snap.settings.name_te ?? id;
    return snap.staff.filter((person) => person.active).map((person) => ({ ...person, restaurantName }));
  });
}

export function saveOffer(offer: Offer) {
  const mem = memory();
  const offers = mem.offers ?? [];
  const index = offers.findIndex((entry) => entry.id === offer.id);
  const next = { ...offer, percent: Math.min(30, Math.max(0, Math.round(offer.percent))) };
  if (index >= 0) offers[index] = next;
  else offers.push(next);
  mem.offers = offers;
}

export function applyOffer(session: Session, offerId: string | null) {
  if (!offerId) {
    session.offerId = null;
    return;
  }
  const offer = (memory().offers ?? []).find((entry) => entry.id === offerId && entry.active);
  if (offer) session.offerId = offer.id;
}

export function saveReview(review: Review) {
  const mem = memory();
  mem.reviews = [...(mem.reviews ?? []), review];
}

export function saveCombo(input: { name_te: string; name_en: string; description_te: string; description_en: string; price: number; diet: Diet }) {
  const mem = memory();
  if (!mem.categories.some((entry) => entry.id === "combos")) {
    mem.categories.push({ id: "combos", name_te: "కాంబోలు", name_en: "Combos", sort: 0 });
  }
  mem.items.push({
    id: `combo-${crypto.randomUUID().slice(0, 8)}`,
    categoryId: "combos",
    name_te: input.name_te.trim() || null,
    name_en: input.name_en.trim() || null,
    description_te: input.description_te.trim() || null,
    description_en: input.description_en.trim() || null,
    search: [input.name_en.trim().toLowerCase()].filter(Boolean),
    price: Math.max(0, Math.round(input.price)),
    diet: input.diet,
    available: true,
  });
}
