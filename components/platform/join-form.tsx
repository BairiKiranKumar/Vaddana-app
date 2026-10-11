"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { controlClass, labelClass } from "@/components/diner/field";
import { registerRestaurant } from "@/lib/data/platform/service";
import { getMessages } from "@/lib/i18n";

export function JoinForm() {
  const te = getMessages("te");
  const en = getMessages("en");
  const [done, setDone] = useState<{ token: string; id: string } | null>(null);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 lang="te" className="text-3xl font-semibold leading-heading-te">{te["join.title"]}</h1>
        <p lang="te" className="text-base leading-body-te">{te["join.lede"]}</p>
        <p lang="en" className="text-base text-ink-muted">{en["join.lede"]}</p>
      </header>
      {done ? (
        <div className="flex flex-col gap-3 rounded-sheet bg-surface p-4 shadow-card">
          <p lang="te">{te["join.done"]}</p>
          <p className="text-lg font-semibold">/t/{done.token}</p>
          <Link href={`/onboarding?id=${done.id}`} className="inline-flex min-h-primary items-center justify-center rounded-control bg-action px-4 text-lg font-semibold text-on-action">
            <span lang="te">{te["join.onboarding"]}</span>
          </Link>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const created = registerRestaurant({
              name_te: String(data.get("name_te") ?? ""),
              name_en: String(data.get("name_en") ?? ""),
              city_te: String(data.get("city_te") ?? ""),
              city_en: String(data.get("city_en") ?? ""),
              ownerName: String(data.get("owner") ?? ""),
            });
            setDone({ token: created.tableToken, id: created.id });
          }}
        >
          <Field labelTe={te["join.nameTe"]} labelEn={en["join.nameEn"]} name="name_te" required />
          <Field labelTe={te["join.nameEn"]} labelEn={en["join.nameEn"]} name="name_en" required />
          <Field labelTe={te["join.cityTe"]} labelEn={en["join.cityEn"]} name="city_te" />
          <Field labelTe={te["join.cityEn"]} labelEn={en["join.cityEn"]} name="city_en" />
          <Field labelTe={te["join.owner"]} labelEn={en["join.owner"]} name="owner" required />
          <Button type="submit" size="block">{te["join.submit"]}</Button>
        </form>
      )}
    </main>
  );
}

function Field({ labelTe, labelEn, name, required = false }: { labelTe: string; labelEn: string; name: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1">
      <span className={labelClass} lang="te">{labelTe}</span>
      <span className="text-sm text-ink-muted">{labelEn}</span>
      <input name={name} required={required} className={controlClass} />
    </label>
  );
}
