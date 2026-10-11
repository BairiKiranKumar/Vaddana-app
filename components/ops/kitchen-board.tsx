"use client";

import { useState } from "react";
import { useT } from "@/components/i18n-provider";
import { useHouse } from "@/components/ops/frame";
import { TicketBody } from "@/components/ops/staff-board";
import { Button } from "@/components/ui/button";
import type { Ticket } from "@/lib/data/types";
import { pickLocalized } from "@/lib/i18n";

export function KitchenBoard() {
  const { result, offline, run } = useHouse();
  const { locale, t } = useT();
  const [printing, setPrinting] = useState<Ticket | null>(null);
  if (!result?.ok) return null;
  const tickets = result.house.kitchen;

  return (
    <div className="flex flex-col gap-4">
      {tickets.length === 0 ? (
        <p className="text-xl text-ink-muted">{t("kitchen.empty")}</p>
      ) : (
        <ul className="grid items-start gap-4 lg:grid-cols-2">
          {tickets.map((ticket) => (
            <li key={ticket.order.id}>
              <article className="flex flex-col gap-4 rounded-sheet border border-line border-l-4 border-l-action bg-surface p-4 shadow-card">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-3xl font-semibold">{t("table.label", { n: ticket.tableNumber })}</h2>
                  <p className="text-xl text-ink-muted">{t("staff.minutes", { n: ticket.minutes })}</p>
                </div>
                <ul className="flex flex-col gap-3">
                  {ticket.order.lines.map((line) => {
                    const name = pickLocalized(locale, line.name_te, line.name_en);
                    const detail = pickLocalized(locale, line.detail_te, line.detail_en);
                    return (
                      <li key={line.id}>
                        <p className="text-3xl font-semibold" lang={name?.lang} translate="no">{name?.text} · {line.qty}</p>
                        {detail ? <p className="text-xl" lang={detail.lang} translate="no">{detail.text}</p> : null}
                        {line.notes ? <p className="text-xl" translate="no">{line.notes}</p> : null}
                      </li>
                    );
                  })}
                </ul>
                {ticket.order.notes ? <p className="text-2xl break-words" translate="no">{ticket.order.notes}</p> : null}
                <div className="grid gap-2 sm:grid-cols-2">
                  {ticket.order.status === "confirmed" ? (
                    <Button type="button" size="block" disabled={offline} onClick={() => run((repo) => repo.preparing(ticket.token, ticket.order.id, offline))}>{t("kitchen.start")}</Button>
                  ) : (
                    <Button type="button" size="block" disabled={offline} onClick={() => run((repo) => repo.ready(ticket.token, ticket.order.id, offline))}>{t("kitchen.ready")}</Button>
                  )}
                  <Button
                    type="button"
                    size="block"
                    variant="secondary"
                    onClick={() => {
                      setPrinting(ticket);
                      window.setTimeout(() => window.print(), 0);
                    }}
                  >
                    {t("kitchen.print")}
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
      {printing && (
        <article className="print-root">
          <h2>{t("print.kot")} · {t("table.label", { n: printing.tableNumber })}</h2>
          <TicketBody ticket={printing} />
        </article>
      )}
    </div>
  );
}
