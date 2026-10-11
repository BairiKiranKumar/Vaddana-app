"use client";

import { useRef, useState } from "react";
import { StatusChip } from "@/components/diner/status-chip";
import { useT } from "@/components/i18n-provider";
import { useHouse } from "@/components/ops/frame";
import { Button } from "@/components/ui/button";
import { controlClass, labelClass } from "@/components/diner/field";
import { NOTES_MAX, type BillCard, type OrderStatus, type Ticket } from "@/lib/data/types";
import { formatPrice } from "@/lib/format";
import { pickLocalized, type MessageKey } from "@/lib/i18n";

const statusKey: Record<OrderStatus, MessageKey> = {
  sent: "order.sent",
  confirmed: "order.confirmed",
  preparing: "order.preparing",
  ready: "order.ready",
  served: "order.served",
  rejected: "order.rejected",
};

export function StaffBoard() {
  const { result, offline, run } = useHouse();
  const { locale, t } = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const [rejecting, setRejecting] = useState<Ticket | null>(null);
  const [reason, setReason] = useState("");
  const [printing, setPrinting] = useState<BillCard | null>(null);
  if (!result?.ok) return null;
  const { house } = result;

  const openReject = (ticket: Ticket) => {
    setRejecting(ticket);
    setReason("");
    dialog.current?.showModal();
  };

  const columns: [string, Ticket[]][] = [
    [t("staff.new"), house.incoming],
    [t("staff.confirmed"), house.confirmed],
    [t("staff.readyCol"), house.ready],
  ];

  return (
    <div className="flex flex-col gap-4">
      {house.alerts.length > 0 && (
        <section aria-label={t("staff.calls")} className="flex flex-col gap-2">
          {house.alerts.map((alert) => (
            <div key={`${alert.kind}-${alert.token}`} className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-warn bg-surface px-3 py-2">
              <p className="text-base font-semibold">
                {t("table.label", { n: alert.tableNumber })}
                <span className="font-normal text-ink-muted"> · {t(alert.kind === "waiter" ? "utility.callWaiter" : "utility.requestBill")}</span>
              </p>
              <Button
                type="button"
                variant="secondary"
                disabled={offline}
                onClick={() => run((repo) => (alert.kind === "waiter" ? repo.clearWaiter(alert.token, offline) : repo.clearBill(alert.token, offline)))}
              >
                {t(alert.kind === "waiter" ? "staff.clearCall" : "staff.clearBill")}
              </Button>
            </div>
          ))}
        </section>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-4">
        {columns.map(([title, tickets]) => (
          <section key={title} aria-label={title} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            {tickets.length === 0 ? <p className="text-base text-ink-muted">{t("staff.empty")}</p> : tickets.map((ticket) => (
              <article key={ticket.order.id} className="flex flex-col gap-3 rounded-sheet border border-line bg-surface p-3 shadow-card">
                <TicketBody ticket={ticket} />
                {ticket.order.status === "sent" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" disabled={offline} onClick={() => run((repo) => repo.confirm(ticket.token, ticket.order.id, offline))}>{t("staff.confirm")}</Button>
                    <Button type="button" variant="danger" disabled={offline} onClick={() => openReject(ticket)}>{t("staff.reject")}</Button>
                  </div>
                )}
                {ticket.order.status === "ready" && (
                  <Button type="button" disabled={offline} onClick={() => run((repo) => repo.served(ticket.token, ticket.order.id, offline))}>{t("staff.served")}</Button>
                )}
              </article>
            ))}
          </section>
        ))}

        <section aria-label={t("staff.bills")} className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">{t("staff.bills")}</h2>
          {house.bills.length === 0 ? <p className="text-base text-ink-muted">{t("staff.empty")}</p> : house.bills.map((card) => (
            <article key={card.token} className="flex flex-col gap-3 rounded-sheet border border-line bg-surface p-3 shadow-card">
              <p className="text-lg font-semibold">{t("table.label", { n: card.tableNumber })}</p>
              <p className="text-base text-ink-muted">{t(`payment.${card.bill.payment}` as MessageKey)}</p>
              <ul>
                {card.bill.lines.map((line) => {
                  const name = pickLocalized(locale, line.name_te, line.name_en);
                  return (
                    <li key={line.id} className="flex justify-between gap-3 py-1">
                      <span lang={name?.lang} translate="no">{name?.text} · {line.qty}</span>
                      <span>{formatPrice(line.lineTotal)}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-lg font-semibold">{formatPrice(card.bill.total)}</p>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" disabled={offline || card.bill.payment === "paid"} onClick={() => run((repo) => repo.markPaid(card.token, "cash", offline))}>{t("staff.paidCash")}</Button>
                <Button type="button" variant="secondary" disabled={offline || card.bill.payment === "paid"} onClick={() => run((repo) => repo.markPaid(card.token, "upi", offline))}>{t("staff.paidUpi")}</Button>
              </div>
              <Button
                type="button"
                variant="quiet"
                onClick={() => {
                  setPrinting(card);
                  window.setTimeout(() => window.print(), 0);
                }}
              >
                {t("print.bill")}
              </Button>
            </article>
          ))}
        </section>
      </div>

      <dialog ref={dialog} className="w-[min(100%,28rem)] rounded-sheet border border-line-strong bg-paper p-4 text-ink backdrop:bg-scrim">
        <form
          method="dialog"
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!rejecting || reason.trim().length === 0) return;
            run((repo) => repo.reject(rejecting.token, rejecting.order.id, reason, offline));
            dialog.current?.close();
          }}
        >
          <h2 className="text-lg font-semibold">{t("staff.reject")}</h2>
          <label htmlFor="reject-reason" className={labelClass}>{t("staff.rejectReason")}</label>
          <textarea id="reject-reason" required maxLength={NOTES_MAX} value={reason} onChange={(event) => setReason(event.target.value)} className={controlClass} />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" onClick={() => dialog.current?.close()}>{t("staff.cancel")}</Button>
            <Button type="submit" variant="danger">{t("staff.rejectSend")}</Button>
          </div>
        </form>
      </dialog>

      {printing && (
        <article className="print-root">
          <h2 className="text-xl font-semibold">{t("print.bill")} · {t("table.label", { n: printing.tableNumber })}</h2>
          <ul>
            {printing.bill.lines.map((line) => {
              const name = pickLocalized(locale, line.name_te, line.name_en);
              return <li key={line.id} lang={name?.lang} translate="no">{name?.text} · {line.qty} · {formatPrice(line.lineTotal)}</li>;
            })}
          </ul>
          <p className="text-lg font-semibold">{formatPrice(printing.bill.total)}</p>
        </article>
      )}
    </div>
  );
}

export function TicketBody({ ticket }: { ticket: Ticket }) {
  const { locale, t } = useT();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-semibold">{t("table.label", { n: ticket.tableNumber })}</p>
        <StatusChip status={ticket.order.status} label={t(statusKey[ticket.order.status])} />
      </div>
      <p className="text-base text-ink-muted">{t("staff.minutes", { n: ticket.minutes })}</p>
      <ul>
        {ticket.order.lines.map((line) => {
          const name = pickLocalized(locale, line.name_te, line.name_en);
          const detail = pickLocalized(locale, line.detail_te, line.detail_en);
          return (
            <li key={line.id} className="text-base">
              <span lang={name?.lang} translate="no">{name?.text}</span>
              {detail ? <span lang={detail.lang} translate="no"> · {detail.text}</span> : null}
              <span> · {line.qty}</span>
              {line.notes ? <span translate="no" className="block text-ink-muted">{line.notes}</span> : null}
            </li>
          );
        })}
      </ul>
      {ticket.order.notes ? <p translate="no" className="text-base break-words">{ticket.order.notes}</p> : null}
      <p className="text-base font-semibold">{formatPrice(ticket.order.total)}</p>
    </div>
  );
}
