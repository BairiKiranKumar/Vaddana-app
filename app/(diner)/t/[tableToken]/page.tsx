import type { Metadata } from "next";
import { getRepo, resolveDataSource, type MockMode } from "@/lib/data/repo";
import { readDinerLocale } from "../../locale";
import { DinerScreen } from "./diner-screen";

type Props = {
  params: Promise<{ tableToken: string }>;
  searchParams: Promise<{ mock?: string }>;
};

function parseMode(value: string | undefined): MockMode | null {
  return value === "slow" || value === "offline" || value === "fail" ? value : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tableToken } = await params;
  const result = await getRepo(resolveDataSource()).openTable(tableToken, null);
  if (!result.ok) return { title: "Vaddana" };
  const name = result.view.restaurant.name_en ?? "Vaddana";
  return { title: `Table ${result.view.table.number} · ${name}` };
}

export default async function TablePage({ params, searchParams }: Props) {
  const { tableToken } = await params;
  const mode = parseMode((await searchParams).mock);
  const source = resolveDataSource();
  const locale = await readDinerLocale();
  // Slow is applied in the browser so the skeleton and the 3s notice can show. Fail and offline render here.
  const initial = mode === "slow" ? null : await getRepo(source).openTable(tableToken, mode);

  return <DinerScreen token={tableToken} source={source} mode={mode} locale={locale} initial={initial} />;
}
