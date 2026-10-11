import type { DataRepo } from "@/lib/data/repo";
import { quoteLine } from "@/lib/data/pricing";
import { categories, demoRestaurant, demoTable, items } from "@/lib/data/mock/menu";
import {
  NOTES_MAX,
  type Bill,
  type Cart,
  type DataErrorCode,
  type MenuItem,
  type OpenResult,
  type OrderRound,
  type OrderStatus,
  type PaymentStatus,
  type PricedLine,
  type Quote,
  type QuoteInput,
  type TableView,
} from "@/lib/data/types";

type StoredLine = {
  id: string;
  itemId: string;
  variantId: string | null;
  addonIds: string[];
  qty: number;
  notes: string;
};

type StoredOrder = {
  id: string;
  number: number;
  status: OrderStatus;
  lines: StoredLine[];
  notes: string;
  createdAt: string;
  rejectReason_te: string | null;
  rejectReason_en: string | null;
};

type Session = {
  lines: StoredLine[];
  notes: string;
  orders: StoredOrder[];
  payment: PaymentStatus;
  waiterCalled: boolean;
  billRequested: boolean;
};

type Row = { revision: number; session: Session };

type Envelope =
  | { type: "ask"; token: string }
  | { type: "state"; token: string; revision: number; session: Session };

const MEMORY = "__vaddanaMock";
const SLOW_MS = 4000;

type Memory = {
  tables: Map<string, Row>;
  listeners: Map<string, Set<(view: TableView) => void>>;
  channel: BroadcastChannel | null;
  listening: boolean;
};

function memory(): Memory {
  const g = globalThis as typeof globalThis & { [MEMORY]?: Memory };
  g[MEMORY] ??= { tables: new Map(), listeners: new Map(), channel: null, listening: false };
  return g[MEMORY];
}

function channel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  const mem = memory();
  mem.channel ??= new BroadcastChannel("vaddana-tables");
  return mem.channel;
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
      const row = mem.tables.get(msg.token);
      if (row) bus.postMessage({ type: "state", token: msg.token, revision: row.revision, session: row.session } satisfies Envelope);
      return;
    }
    if (msg.type === "state") adopt(msg.token, msg.revision, msg.session);
  };
}

function emit(token: string) {
  const view = present(memory().tables.get(token)?.session ?? emptySession());
  for (const listener of memory().listeners.get(token) ?? []) listener(view);
}

function post(token: string) {
  const row = memory().tables.get(token);
  const bus = channel();
  if (!row || !bus) return;
  bus.postMessage({ type: "state", token, revision: row.revision, session: row.session } satisfies Envelope);
}

function adopt(token: string, revision: number, session: Session) {
  const current = memory().tables.get(token);
  if (current && current.revision >= revision) return;
  memory().tables.set(token, { revision, session });
  emit(token);
}

function emptySession(): Session {
  return { lines: [], notes: "", orders: [], payment: "unpaid", waiterCalled: false, billRequested: false };
}

function ensure(token: string): Row {
  const mem = memory();
  const current = mem.tables.get(token);
  if (current) return current;
  const row = { revision: 1, session: emptySession() };
  mem.tables.set(token, row);
  return row;
}

function save(token: string, session: Session) {
  const mem = memory();
  const revision = (mem.tables.get(token)?.revision ?? 0) + 1;
  mem.tables.set(token, { revision, session });
  emit(token);
  post(token);
}

function itemById(id: string): MenuItem | undefined {
  return items.find((item) => item.id === id);
}

function normalize(item: MenuItem, input: QuoteInput): QuoteInput {
  const variantId = item.variants?.some((choice) => choice.id === input.variantId)
    ? input.variantId
    : (item.variants?.at(-1)?.id ?? null);
  const allowed = new Set(item.addons?.options.map((choice) => choice.id) ?? []);
  const max = item.addons?.max ?? 0;
  const addonIds = input.addonIds.filter((id) => allowed.has(id)).slice(0, max);
  return { itemId: item.id, variantId, addonIds, qty: input.qty };
}

function choiceName(choices: { id: string; name_te: string | null; name_en: string | null }[] | undefined, id: string | null) {
  if (!id || !choices) return null;
  return choices.find((choice) => choice.id === id) ?? null;
}

function detailFor(item: MenuItem, variantId: string | null, addonIds: string[]) {
  const te: string[] = [];
  const en: string[] = [];
  const variant = choiceName(item.variants, variantId);
  if (variant) {
    te.push(variant.name_te ?? variant.name_en ?? "");
    en.push(variant.name_en ?? variant.name_te ?? "");
  }
  for (const id of addonIds) {
    const addOn = choiceName(item.addons?.options, id);
    if (!addOn) continue;
    te.push(addOn.name_te ?? addOn.name_en ?? "");
    en.push(addOn.name_en ?? addOn.name_te ?? "");
  }
  const join = (parts: string[]) => parts.filter(Boolean).join(", ");
  return {
    detail_te: join(te) || null,
    detail_en: join(en) || null,
  };
}

function priceLine(line: StoredLine): PricedLine | null {
  const item = itemById(line.itemId);
  if (!item) return null;
  const quote = quoteLine(item, line);
  const detail = detailFor(item, line.variantId, line.addonIds);
  return {
    ...line,
    ...detail,
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

function present(session: Session): TableView {
  const lines = session.lines.map(priceLine).filter((line): line is PricedLine => line !== null);
  const notesOk = session.notes.trim().length <= NOTES_MAX;
  const cart: Cart = {
    lines,
    notes: session.notes,
    count: lines.reduce((count, line) => count + line.qty, 0),
    total: sum(lines),
    canSend: lines.length > 0 && lines.every((line) => line.available) && notesOk,
  };
  const orders: OrderRound[] = session.orders.map((order) => {
    const priced = order.lines.map(priceLine).filter((line): line is PricedLine => line !== null);
    return { ...order, lines: priced, total: sum(priced) };
  });
  const billLines = orders.filter((order) => order.status !== "rejected").flatMap((order) => order.lines);
  const itemTotal = sum(billLines);
  // No tax lines until the build spec says how GST works. The bill UI already renders taxLines.
  const taxLines: Bill["taxLines"] = [];
  const bill: Bill = {
    lines: billLines,
    itemTotal,
    taxLines,
    total: itemTotal + taxLines.reduce((total, line) => total + line.amount, 0),
    payment: session.payment,
  };
  return {
    restaurant: demoRestaurant,
    table: demoTable,
    categories,
    items,
    cart,
    orders,
    bill,
    waiterCalled: session.waiterCalled,
    billRequested: session.billRequested,
  };
}

function viewOf(token: string): TableView {
  return present(ensure(token).session);
}

function gate(token: string): OpenResult | null {
  if (token === "expired") return { ok: false, error: "session_expired" };
  if (token !== demoTable.token) return { ok: false, error: "denied" };
  return null;
}

function blocked(session: Session, offline: boolean): TableView | null {
  if (offline) return present(session);
  return null;
}

function update(token: string, recipe: (session: Session) => Session, offline: boolean): TableView {
  const session = ensure(token).session;
  const frozen = blocked(session, offline);
  if (frozen) return frozen;
  save(token, recipe(structuredClone(session)));
  return viewOf(token);
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createMockRepo(): DataRepo {
  return {
    async openTable(token, mode): Promise<OpenResult> {
      if (mode === "fail") return { ok: false, error: "failed" satisfies DataErrorCode };
      if (mode === "slow") await delay(SLOW_MS);
      const blocked = gate(token);
      if (blocked) return blocked;
      listen();
      return { ok: true, view: viewOf(token) };
    },

    quote(input: QuoteInput): Quote {
      const item = itemById(input.itemId);
      if (!item) throw new Error(`Unknown item ${input.itemId}`);
      return quoteLine(item, normalize(item, input));
    },

    addLine(token, draft, offline = false) {
      return update(
        token,
        (session) => {
          const item = itemById(draft.itemId);
          if (!item?.available) return session;
          const notes = draft.notes.trim();
          if (notes.length > NOTES_MAX) return session;
          const next = normalize(item, draft);
          session.lines.push({ id: crypto.randomUUID(), ...next, notes });
          return session;
        },
        offline,
      );
    },

    updateLine(token, lineId, draft, offline = false) {
      return update(
        token,
        (session) => {
          const item = itemById(draft.itemId);
          if (!item) return session;
          const notes = draft.notes.trim();
          if (notes.length > NOTES_MAX) return session;
          const next = normalize(item, draft);
          session.lines = session.lines.map((line) => (line.id === lineId ? { ...line, ...next, notes } : line));
          return session;
        },
        offline,
      );
    },

    removeLine(token, lineId) {
      const session = structuredClone(ensure(token).session);
      session.lines = session.lines.filter((line) => line.id !== lineId);
      save(token, session);
      return viewOf(token);
    },

    setCartNotes(token, notes) {
      const session = structuredClone(ensure(token).session);
      session.notes = notes;
      save(token, session);
      return viewOf(token);
    },

    sendToKitchen(token, offline = false) {
      return update(
        token,
        (session) => {
          const view = present(session);
          if (!view.cart.canSend) return session;
          const order: StoredOrder = {
            id: crypto.randomUUID(),
            number: session.orders.length + 1,
            status: "sent",
            lines: session.lines.map((line) => ({ ...line })),
            notes: session.notes.trim(),
            createdAt: new Date().toISOString(),
            rejectReason_te: null,
            rejectReason_en: null,
          };
          session.orders.push(order);
          session.lines = [];
          session.notes = "";
          session.payment = "unpaid";
          return session;
        },
        offline,
      );
    },

    callWaiter(token, offline = false) {
      return update(
        token,
        (session) => {
          session.waiterCalled = true;
          return session;
        },
        offline,
      );
    },

    requestBill(token, offline = false) {
      return update(
        token,
        (session) => {
          session.billRequested = true;
          return session;
        },
        offline,
      );
    },

    payUpi(token, offline = false) {
      return update(
        token,
        (session) => {
          if (present(session).bill.lines.length === 0) return session;
          session.payment = "pending";
          session.billRequested = true;
          return session;
        },
        offline,
      );
    },

    payAtCounter(token, offline = false) {
      return update(
        token,
        (session) => {
          if (present(session).bill.lines.length === 0) return session;
          session.payment = "at_counter";
          session.billRequested = true;
          return session;
        },
        offline,
      );
    },

    subscribe(token, onChange) {
      listen();
      const mem = memory();
      const set = mem.listeners.get(token) ?? new Set<(view: TableView) => void>();
      set.add(onChange);
      mem.listeners.set(token, set);
      channel()?.postMessage({ type: "ask", token } satisfies Envelope);
      return () => {
        set.delete(onChange);
      };
    },
  };
}
