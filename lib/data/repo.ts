import { createMockRepo } from "@/lib/data/mock/repo";
import type { LineDraft, OpenResult, Quote, QuoteInput, TableView } from "@/lib/data/types";

export type MockMode = "slow" | "offline" | "fail";
export type DataSource = "mock" | "supabase";

/**
 * Screens talk to this interface only. The mock keeps totals, stock and table
 * session in memory. DATA_SOURCE=supabase selects a stub until Phase 1.
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
  /** Fires for this tab's writes and for other tabs via BroadcastChannel. */
  subscribe(token: string, onChange: (view: TableView) => void): () => void;
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
