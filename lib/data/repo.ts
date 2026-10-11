import { createMockRepo } from "@/lib/data/mock/repo";
import type {
  DeskInput,
  HouseResult,
  HouseView,
  ItemInput,
  LineDraft,
  OpenResult,
  Quote,
  QuoteInput,
  Restaurant,
  StaffInput,
  Surface,
  TableView,
} from "@/lib/data/types";

export type MockMode = "slow" | "offline" | "fail";
export type DataSource = "mock" | "supabase";

/**
 * Screens talk to this interface only. The mock keeps the restaurant in memory.
 * DATA_SOURCE=supabase throws until a schema exists.
 */
export interface DataRepo {
  openTable(token: string, mode: MockMode | null): Promise<OpenResult>;
  /** Portion + add-ons + quantity. The item sheet displays this and does not add prices itself. */
  quote(input: QuoteInput): Quote;
  addLine(token: string, draft: LineDraft, offline?: boolean): TableView;
  updateLine(token: string, lineId: string, draft: LineDraft, offline?: boolean): TableView;
  removeLine(token: string, lineId: string): TableView;
  setCartNotes(token: string, notes: string): TableView;
  sendToKitchen(token: string, offline?: boolean): TableView;
  callWaiter(token: string, offline?: boolean): TableView;
  requestBill(token: string, offline?: boolean): TableView;
  payUpi(token: string, offline?: boolean): TableView;
  payAtCounter(token: string, offline?: boolean): TableView;
  /** Lets a pay-first cart go to the kitchen. Does not mark the bill paid. */
  prepay(token: string, offline?: boolean): TableView;
  subscribe(token: string, onChange: (view: TableView) => void): () => void;

  openHouse(staffId: string | null, surface: Surface, mode: MockMode | null): Promise<HouseResult>;
  peekHouse(): HouseView;
  subscribeHouse(onChange: (house: HouseView) => void): () => void;
  confirm(token: string, orderId: string, offline?: boolean): HouseView;
  reject(token: string, orderId: string, reason: string, offline?: boolean): HouseView;
  preparing(token: string, orderId: string, offline?: boolean): HouseView;
  ready(token: string, orderId: string, offline?: boolean): HouseView;
  served(token: string, orderId: string, offline?: boolean): HouseView;
  clearWaiter(token: string, offline?: boolean): HouseView;
  clearBill(token: string, offline?: boolean): HouseView;
  markPaid(token: string, mode: "cash" | "upi", offline?: boolean): HouseView;
  saveSettings(patch: Partial<Restaurant>, offline?: boolean): HouseView;
  saveItem(input: ItemInput, offline?: boolean): HouseView;
  setAvailable(id: string, available: boolean, offline?: boolean): HouseView;
  moveItem(id: string, direction: -1 | 1, offline?: boolean): HouseView;
  moveCategory(id: string, direction: -1 | 1, offline?: boolean): HouseView;
  bulkPrice(ids: string[], kind: "percent" | "rupees", amount: number, offline?: boolean): HouseView;
  addCategory(name_te: string, name_en: string, offline?: boolean): HouseView;
  addDesk(input: DeskInput, offline?: boolean): HouseView;
  rotateDesk(id: string, offline?: boolean): { token: string | null; house: HouseView };
  inviteStaff(input: StaffInput, offline?: boolean): HouseView;
  setStaffActive(id: string, active: boolean, offline?: boolean): HouseView;
  setStaffLocale(id: string, locale: "te" | "en", offline?: boolean): HouseView;
}

export function resolveDataSource(): DataSource {
  const value = process.env.DATA_SOURCE ?? "mock";
  if (value === "mock" || value === "supabase") return value;
  throw new Error(`DATA_SOURCE must be mock or supabase, received ${value}`);
}

export function getRepo(source: DataSource = resolveDataSource()): DataRepo {
  if (source === "supabase") return createSupabaseRepo();
  return createMockRepo();
}

function createSupabaseRepo(): DataRepo {
  throw new Error("Supabase is not connected. Keep DATA_SOURCE=mock until the schema exists.");
}
