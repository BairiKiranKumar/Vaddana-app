"use client";

import { useMemo, useState } from "react";
import { controlClass, labelClass } from "@/components/diner/field";
import { StatusChip } from "@/components/diner/status-chip";
import { useT } from "@/components/i18n-provider";
import { useHouse } from "@/components/ops/frame";
import type { OrderStatus, PaymentStatus } from "@/lib/data/types";
import { formatPrice, formatTime } from "@/lib/format";
import { pickLocalized, type MessageKey } from "@/lib/i18n";

const statuses: OrderStatus[] = ["sent", "confirmed", "preparing", "ready", "served", "rejected"];
const payments: PaymentStatus[] = ["unpaid", "pending", "failed", "at_counter", "paid"];

const statusKey: Record<OrderStatus, MessageKey> = {
  sent: "order.sent",
  confirmed: "order.confirmed",
  preparing: "order.preparing",
  ready: "order.ready",
  served: "order.served",
  rejected: "order.rejected",
};

function dayKey(iso: string) {
  const date = new Date(iso);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function OrdersView() {
  const { result } = useHouse();
  const { locale, t } = useT();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [table, setTable] = useState("all");
  const [status, setStatus] = useState("all");
  const [payment, setPayment] = useState("all");
  const rows = useMemo(() => {
    if (!result?.ok) return [];
    return result.house.records.filter((record) => {
    if (date && dayKey(record.createdAt) !== date) return false;
    if (table !== "all" && record.token !== table) return false;
    if (status !== "all" && record.status !== status) return false;
    if (payment !== "all" && record.payment !== payment) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const names = record.lines.map((line) => `${line.name_te ?? ""} ${line.name_en ?? ""}`).join(" ");
    return `${record.tableNumber} ${names}`.toLowerCase().includes(q);
  });
  }, [date, payment, query, result, status, table]);

  if (!result?.ok) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">{t("admin.orders")}</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.search")}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("admin.searchPlaceholder")} className={controlClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.date")}</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={controlClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.filterTable")}</span>
          <select value={table} onChange={(event) => setTable(event.target.value)} className={controlClass}>
            <option value="all">{t("admin.all")}</option>
            {result.house.desks.map((desk) => <option key={desk.id} value={desk.token}>{t("table.label", { n: desk.number })}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.filterStatus")}</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={controlClass}>
            <option value="all">{t("admin.all")}</option>
            {statuses.map((value) => <option key={value} value={value}>{t(statusKey[value])}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.filterPayment")}</span>
          <select value={payment} onChange={(event) => setPayment(event.target.value)} className={controlClass}>
            <option value="all">{t("admin.all")}</option>
            {payments.map((value) => <option key={value} value={value}>{t(`payment.${value}` as MessageKey)}</option>)}
          </select>
        </label>
      </div>
      {rows.length === 0 ? <p className="text-base text-ink-muted">{t("admin.empty")}</p> : (
        <ul className="flex flex-col">
          {rows.map((record) => (
            <li key={record.id} className="flex flex-col gap-2 border-b border-line py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-semibold">{t("table.label", { n: record.tableNumber })} · {formatTime(record.createdAt)}</p>
                <StatusChip status={record.status} label={t(statusKey[record.status])} />
              </div>
              <p className="text-base text-ink-muted">{t(`payment.${record.payment}` as MessageKey)}</p>
              <ul>
                {record.lines.map((line) => {
                  const name = pickLocalized(locale, line.name_te, line.name_en);
                  return <li key={line.id} lang={name?.lang} translate="no">{name?.text} · {line.qty}</li>;
                })}
              </ul>
              {record.notes ? <p translate="no">{record.notes}</p> : null}
              <p className="font-semibold">{formatPrice(record.total)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
