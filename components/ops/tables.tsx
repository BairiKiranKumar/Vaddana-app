"use client";

import { useState } from "react";
import Link from "next/link";
import { controlClass, labelClass } from "@/components/diner/field";
import { useT } from "@/components/i18n-provider";
import { useHouse } from "@/components/ops/frame";
import { Button } from "@/components/ui/button";
import { pickLocalized } from "@/lib/i18n";

export function TablesView() {
  const { result, offline, run } = useHouse();
  const { locale, t } = useT();
  const [areaId, setAreaId] = useState("");
  const [number, setNumber] = useState("");
  const [seats, setSeats] = useState("4");
  const [rotated, setRotated] = useState<string | null>(null);
  if (!result?.ok) return null;
  const { house } = result;
  const area = areaId || house.areas[0]?.id || "";

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">{t("admin.tables")}</h2>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          run((repo) => repo.addDesk({ areaId: area, number: Number(number), seats: Number(seats) }, offline));
          setNumber("");
        }}
      >
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.area")}</span>
          <select value={area} onChange={(event) => setAreaId(event.target.value)} className={controlClass}>
            {house.areas.map((entry) => {
              const name = pickLocalized(locale, entry.name_te, entry.name_en);
              return <option key={entry.id} value={entry.id}>{name?.text}</option>;
            })}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.number")}</span>
          <input inputMode="numeric" required value={number} onChange={(event) => setNumber(event.target.value)} className={controlClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.seats")}</span>
          <input inputMode="numeric" required value={seats} onChange={(event) => setSeats(event.target.value)} className={controlClass} />
        </label>
        <Button type="submit" disabled={offline}>{t("admin.addTable")}</Button>
      </form>
      {rotated && <p role="status" className="text-base">{rotated}</p>}
      {house.areas.map((entry) => {
        const name = pickLocalized(locale, entry.name_te, entry.name_en);
        const desks = house.desks.filter((desk) => desk.areaId === entry.id);
        return (
          <section key={entry.id} className="flex flex-col gap-2">
            <h3 lang={name?.lang} translate="no" className="text-lg font-semibold">{name?.text}</h3>
            {desks.length === 0 ? <p className="text-base text-ink-muted">{t("admin.empty")}</p> : (
              <ul className="flex flex-col">
                {desks.map((desk) => (
                  <li key={desk.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3">
                    <div>
                      <p className="text-base font-semibold">{t("table.label", { n: desk.number })}</p>
                      <p className="text-base text-ink-muted">{t("admin.seats")} {desk.seats}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={offline}
                        onClick={() => {
                          let next = "";
                          run((repo) => {
                            const rotatedDesk = repo.rotateDesk(desk.id, offline);
                            next = rotatedDesk.token ?? "";
                            return rotatedDesk.house;
                          });
                          if (next) setRotated(`${t("table.label", { n: desk.number })} · /t/${next}`);
                        }}
                      >
                        {t("admin.rotate")}
                      </Button>
                      <Link href={`/admin/qr/${desk.token}`} className="inline-flex min-h-touch items-center rounded-control border border-line-strong bg-surface px-4 text-base font-semibold">
                        {t("admin.printQr")}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
