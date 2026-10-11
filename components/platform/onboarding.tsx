"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markLive, listRestaurants } from "@/lib/data/platform/service";
import { setStaffId } from "@/lib/session";
import { getMessages } from "@/lib/i18n";

export function Onboarding() {
  const te = getMessages("te");
  const en = getMessages("en");
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const record = listRestaurants().find((entry) => entry.id === id);
  const [live, setLive] = useState(record?.status === "live");

  if (!record) {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-10">
        <h1 lang="te" className="text-2xl font-semibold">{te["onboard.title"]}</h1>
        <Link href="/join" className="text-base font-semibold text-accent">{te["home.join"]}</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 lang="te" className="text-3xl font-semibold leading-heading-te">{te["onboard.title"]}</h1>
        <p lang="te" className="text-lg font-semibold" translate="no">{record.name_te}</p>
        <p lang="en" className="text-base text-ink-muted" translate="no">{record.name_en}</p>
        <p lang="te" className="text-base leading-body-te">{te["onboard.lede"]}</p>
      </header>
      <ol className="flex flex-col gap-3">
        <li className="rounded-sheet bg-surface p-4 shadow-card">
          <p lang="te" className="font-semibold">{te["onboard.profile"]}</p>
          <p className="text-base text-ink-muted" translate="no">{record.city_en}</p>
        </li>
        <li className="rounded-sheet bg-surface p-4 shadow-card">
          <p lang="te" className="font-semibold">{te["onboard.table"]}</p>
          <p className="text-base">/t/{record.tableToken}</p>
        </li>
        <li className="rounded-sheet bg-surface p-4 shadow-card">
          <p lang="te">{te["onboard.menu"]}</p>
          <p lang="en" className="text-base text-ink-muted">{en["onboard.menu"]}</p>
        </li>
      </ol>
      {!live ? (
        <Button
          type="button"
          size="block"
          onClick={() => {
            markLive(record.id);
            setLive(true);
          }}
        >
          {te["onboard.live"]}
        </Button>
      ) : (
        <Button
          type="button"
          size="block"
          onClick={() => {
            void setStaffId(record.ownerId).then(() => {
              router.push("/admin");
              router.refresh();
            });
          }}
        >
          {te["onboard.signIn"]}
        </Button>
      )}
    </main>
  );
}
