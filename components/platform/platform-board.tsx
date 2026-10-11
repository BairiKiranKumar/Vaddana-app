"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { listRestaurants, setRestaurantStatus } from "@/lib/data/platform/service";
import { getMessages } from "@/lib/i18n";

export function PlatformBoard() {
  const te = getMessages("te");
  const en = getMessages("en");
  const [rows, setRows] = useState(listRestaurants());
  const reload = () => setRows(listRestaurants());

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 lang="te" className="font-display text-4xl leading-heading">{te["platform.title"]}</h1>
        <p lang="te" className="max-w-measure text-base leading-body-te">{te["platform.lede"]}</p>
        <p lang="en" className="max-w-measure text-base text-ink-muted">{en["platform.lede"]}</p>
      </header>
      <ul className="grid gap-3">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-col gap-3 rounded-sheet bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 lang="te" className="text-xl font-semibold leading-heading-te" translate="no">{row.name_te}</h2>
                <p lang="en" className="text-base text-ink-muted" translate="no">{row.name_en}</p>
              </div>
              <p className="text-base font-semibold">{te[row.status === "live" ? "platform.live" : row.status === "onboarding" ? "platform.onboarding" : "platform.suspended"]}</p>
            </div>
            <p className="text-base">{te["platform.sales"]} {formatPrice(row.sales)} · {row.reviewCount}</p>
            {row.sample && <p className="text-sm font-semibold text-accent">{te["platform.sample"]}</p>}
            <div className="flex flex-wrap gap-2">
              <Link href={`/t/${row.tableToken}`} className="inline-flex min-h-touch items-center rounded-control border border-line-strong bg-surface px-4 font-semibold">
                /t/{row.tableToken}
              </Link>
              {row.status === "suspended" ? (
                <Button type="button" variant="secondary" onClick={() => { setRestaurantStatus(row.id, "live"); reload(); }}>{te["platform.restore"]}</Button>
              ) : (
                <Button type="button" variant="danger" onClick={() => { setRestaurantStatus(row.id, "suspended"); reload(); }}>{te["platform.suspend"]}</Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
