"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { LanguageSwitch } from "@/components/diner/language-switch";
import { ItemRow } from "@/components/diner/item-row";
import { ItemSheet } from "@/components/diner/item-sheet";
import { StatusChip } from "@/components/diner/status-chip";
import { BlockMessage, EmptyCart, LoadError, MenuSkeleton, OfflineBanner, SlowNotice } from "@/components/diner/states";
import { controlClass, errorClass, hintClass, labelClass } from "@/components/diner/field";
import { I18nProvider, useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { getRepo, type DataSource, type MockMode } from "@/lib/data/repo";
import { NOTES_MAX, type LineDraft, type MenuItem, type OpenResult, type OrderRound, type PricedLine, type TableView } from "@/lib/data/types";
import { formatPrice, formatTime } from "@/lib/format";
import { getMessages, pickLocalized, type Locale, type MessageKey, type Translator } from "@/lib/i18n";
import { setDinerLocale } from "../../locale";

const SLOW_NOTICE_MS = 3000;

function mark(text: string) {
  const first = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)[Symbol.iterator]().next().value;
  return first?.segment ?? "";
}

type ViewName = "menu" | "cart" | "status" | "bill";

type Props = {
  token: string;
  source: DataSource;
  mode: MockMode | null;
  locale: Locale;
  initial: OpenResult | null;
};

export function DinerScreen(props: Props) {
  return (
    <I18nProvider locale={props.locale} messages={getMessages(props.locale)}>
      <Session {...props} />
    </I18nProvider>
  );
}

function Session({ token, source, mode, locale, initial }: Props) {
  const router = useRouter();
  const i18n = useT();
  const [result, setResult] = useState<OpenResult | null>(initial);
  const [loading, setLoading] = useState(initial === null);
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [viewName, setViewName] = useState<ViewName>("menu");
  const [query, setQuery] = useState("");
  const [browserOffline, setBrowserOffline] = useState(false);
  const offline = mode === "offline" || browserOffline;

  useEffect(() => {
    const sync = () => setBrowserOffline(!navigator.onLine);
    window.addEventListener("offline", sync);
    window.addEventListener("online", sync);
    return () => {
      window.removeEventListener("offline", sync);
      window.removeEventListener("online", sync);
    };
  }, []);

  useEffect(() => {
    const repo = getRepo(source);
    let unsub = () => {};
    let cancel = false;
    let timer = 0;

    const follow = () => {
      unsub = repo.subscribe(token, (view) => {
        if (!cancel) setResult({ ok: true, view });
      });
    };

    if (attempt === 0 && initial?.ok) {
      void repo.openTable(token, null).then((next) => {
        if (!cancel && next.ok) setResult(next);
      });
      follow();
      return () => {
        cancel = true;
        unsub();
      };
    }

    if (attempt === 0 && initial && !initial.ok && initial.error === "denied") {
      void repo.openTable(token, null).then((next) => {
        if (cancel) return;
        setLoading(false);
        setResult(next);
        if (next.ok) follow();
      });
      return () => {
        cancel = true;
        unsub();
      };
    }

    timer = window.setTimeout(() => {
      if (!cancel) setSlow(true);
    }, SLOW_NOTICE_MS);
    void repo.openTable(token, mode).then((next) => {
      if (cancel) return;
      window.clearTimeout(timer);
      setSlow(false);
      setLoading(false);
      setResult(next);
      if (next.ok) follow();
    });

    return () => {
      cancel = true;
      window.clearTimeout(timer);
      unsub();
    };
  }, [attempt, initial, mode, source, token]);

  useEffect(() => {
    document.getElementById("main")?.scrollTo(0, 0);
  }, [viewName]);

  const retry = () => {
    setSlow(false);
    setLoading(true);
    setAttempt((n) => n + 1);
  };

  const commit = (view: TableView) => setResult({ ok: true, view });
  const repo = () => getRepo(source);

  if (loading || !result) {
    return (
      <Shell>
        <main id="main" className="min-h-0 flex-1 overflow-y-auto">
          <div role="status" className="flex flex-col gap-3 px-4 pt-4">
            <h1 className="text-xl font-semibold">{i18n.t("state.loading")}</h1>
            {slow && <SlowNotice i18n={i18n} />}
          </div>
          <div className="px-4">
            <MenuSkeleton i18n={i18n} labelled={false} rows={4} />
          </div>
        </main>
      </Shell>
    );
  }

  if (!result.ok) {
    const expired = result.error === "session_expired";
    return (
      <Shell>
        <main id="main" className="px-4 py-8">
          {result.error === "failed" ? (
            <LoadError i18n={i18n} onRetry={retry} titleAs="h1" />
          ) : (
            <BlockMessage
              titleAs="h1"
              title={i18n.t(expired ? "state.session.title" : "state.denied.title")}
              body={i18n.t(expired ? "state.session.body" : "state.denied.body")}
            />
          )}
        </main>
      </Shell>
    );
  }

  const view = result.view;
  const name = pickLocalized(locale, view.restaurant.name_te, view.restaurant.name_en);

  return (
    <Shell>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2">
        {i18n.t("nav.skip")}
      </a>
      <header className="flex shrink-0 items-start justify-between gap-3 bg-linear-to-b from-glow to-paper px-4 pt-4 pb-3">
        <div className="flex min-w-0 items-start gap-3">
          {view.restaurant.logoDataUrl ? (
            // Data URLs from the owner's upload are not a remote image next/image can optimize.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={view.restaurant.logoDataUrl} alt="" className="size-14 shrink-0 rounded-sheet object-cover shadow-card" />
          ) : (
            <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-sheet bg-action text-xl font-semibold text-on-action shadow-card">
              {mark(name?.text ?? "")}
            </span>
          )}
          <div className="min-w-0">
            <h1 lang={name?.lang} translate="no" className={`font-semibold break-words ${name?.lang === "te" ? "text-2xl leading-heading-te" : "text-xl leading-heading"}`}>{name?.text}</h1>
            <p className="mt-1 inline-flex min-h-touch items-center rounded-full bg-surface px-3 text-base font-semibold shadow-card">{i18n.t("table.label", { n: view.table.number })}</p>
          </div>
        </div>
        <div className="shrink-0">
          <LanguageSwitch
            value={locale}
            onChange={(next) => {
              void setDinerLocale(next).then(() => router.refresh());
            }}
          />
        </div>
      </header>

      {viewName === "menu" && <CategoryNav view={view} query={query} />}

      <main id="main" className="min-h-0 flex-1 overflow-y-auto px-4">
        {offline && (
          <div className="pb-3">
            <OfflineBanner i18n={i18n} />
          </div>
        )}
        {viewName === "menu" && (
          <MenuPanel
            view={view}
            i18n={i18n}
            query={query}
            onQuery={setQuery}
            offline={offline}
            onAdd={(draft) => commit(repo().addLine(token, draft, offline))}
            onApplyOffer={(offerId) => commit(repo().applyOffer(token, offerId, offline))}
            quote={(itemId, draft) => repo().quote({ itemId, ...draft })}
          />
        )}
        {viewName === "cart" && (
          <CartPanel
            view={view}
            i18n={i18n}
            offline={offline}
            onMenu={() => setViewName("menu")}
            onNotes={(notes) => commit(repo().setCartNotes(token, notes))}
            onRemove={(lineId) => commit(repo().removeLine(token, lineId))}
            onUpdate={(lineId, draft) => commit(repo().updateLine(token, lineId, draft, offline))}
            onSend={() => {
              const next = repo().sendToKitchen(token, offline);
              commit(next);
              if (next.orders.length > view.orders.length) setViewName("status");
            }}
            onPrepay={() => commit(repo().prepay(token, offline))}
            quote={(itemId, draft) => repo().quote({ itemId, ...draft })}
          />
        )}
        {viewName === "status" && <StatusPanel view={view} i18n={i18n} onMenu={() => setViewName("menu")} />}
        {viewName === "bill" && (
          <BillPanel
            view={view}
            i18n={i18n}
            offline={offline}
            onMenu={() => setViewName("menu")}
            onUpi={() => commit(repo().payUpi(token, offline))}
            onCounter={() => commit(repo().payAtCounter(token, offline))}
          />
        )}
      </main>

      <footer className="flex shrink-0 flex-col gap-2 bg-surface px-4 pt-3 shadow-sheet pb-[max(env(safe-area-inset-bottom),var(--space-3))]">
        {viewName === "menu" && view.cart.count > 0 && (
          <Button type="button" size="block" className="justify-between" onClick={() => setViewName("cart")}>
            <span>{i18n.tn("cart.items", view.cart.count)}</span>
            <span>{formatPrice(view.cart.total)}</span>
          </Button>
        )}
        {view.orders.length > 0 && viewName !== "status" && (
          <Button type="button" variant="quiet" onClick={() => setViewName("status")}>{i18n.t("order.title")}</Button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={offline || view.waiterCalled}
            aria-pressed={view.waiterCalled}
            onClick={() => commit(repo().callWaiter(token, offline))}
          >
            {i18n.t("utility.callWaiter")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={offline}
            onClick={() => {
              if (!view.billRequested) commit(repo().requestBill(token, offline));
              setViewName("bill");
            }}
          >
            {i18n.t(view.billRequested ? "utility.viewBill" : "utility.requestBill")}
          </Button>
        </div>
        {view.waiterCalled && <p role="status" className="text-base text-ink-muted">{i18n.t("utility.waiterCalled")}</p>}
      </footer>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex h-dvh w-full max-w-lg flex-col bg-paper">{children}</div>;
}

function CategoryNav({ view, query }: { view: TableView; query: string }) {
  const { locale, t } = useT();
  return (
    <nav aria-label={t("menu.sections")} className="menu-scroll w-full min-w-0 shrink-0 overflow-x-auto px-4 py-2">
      <ul className="flex w-max gap-2">
        {view.categories.map((category) => {
          const label = pickLocalized(locale, category.name_te, category.name_en);
          if (!view.items.some((item) => item.categoryId === category.id && matches(item, query))) return null;
          return (
            <li key={category.id}>
              <a href={`#cat-${category.id}`} lang={label?.lang} className="inline-flex min-h-touch items-center rounded-full bg-surface px-4 text-base font-semibold whitespace-nowrap shadow-card hover:bg-wash">
                {label?.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MenuPanel({
  view,
  i18n,
  query,
  onQuery,
  offline,
  onAdd,
  onApplyOffer,
  quote,
}: {
  view: TableView;
  i18n: Translator;
  query: string;
  onQuery: (value: string) => void;
  offline: boolean;
  onAdd: (draft: LineDraft) => void;
  onApplyOffer: (offerId: string | null) => void;
  quote: (itemId: string, draft: Pick<LineDraft, "variantId" | "addonIds" | "qty">) => { lineTotal: number };
}) {
  const { locale, t } = i18n;
  const searchId = useId();
  const visible = view.items.filter((item) => matches(item, query));
  const groups = view.categories.filter((category) => visible.some((item) => item.categoryId === category.id));

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div className="flex flex-col gap-2 pt-4">
        <label htmlFor={searchId} className={labelClass}>{t("menu.search.label")}</label>
        <input
          id={searchId}
          type="search"
          name="q"
          autoComplete="off"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={t("menu.search.placeholder")}
          className="min-h-touch w-full rounded-sheet border border-line bg-surface px-4 py-2 text-base text-ink shadow-card placeholder:text-ink-subtle"
        />
      </div>
      {view.offers.filter((offer) => offer.active).map((offer) => {
        const name = pickLocalized(locale, offer.name_te, offer.name_en);
        const applied = view.offerId === offer.id;
        return (
          <div key={offer.id} className="flex flex-col gap-2 rounded-sheet bg-surface p-3 shadow-card">
            <p lang={name?.lang} className="text-base font-semibold" translate="no">{name?.text} · {offer.percent}%</p>
            <p className="text-sm text-ink-muted">{t("offer.simulated")}</p>
            <Button type="button" variant={applied ? "secondary" : "primary"} disabled={offline} onClick={() => onApplyOffer(applied ? null : offer.id)}>
              {t(applied ? "offer.remove" : "offer.apply")}
            </Button>
          </div>
        );
      })}
      {groups.length === 0 ? (
        <BlockMessage title={t("state.emptySearch.title")} body={t("state.emptySearch.body")} />
      ) : (
        groups.map((category) => {
          const heading = pickLocalized(locale, category.name_te, category.name_en);
          const rows = visible.filter((item) => item.categoryId === category.id);
          return (
            <section key={category.id} id={`cat-${category.id}`} aria-labelledby={`cat-${category.id}-title`}>
              <h2 id={`cat-${category.id}-title`} lang={heading?.lang} className={`font-semibold ${heading?.lang === "te" ? "text-xl leading-heading-te" : "text-lg leading-heading"}`}>{heading?.text}</h2>
              <ul className="mt-3 flex flex-col gap-3">
                {rows.map((item, index) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    eager={index === 0 && category.id === groups[0]?.id}
                    i18n={i18n}
                    action={
                      offline ? (
                        <Button type="button" variant="secondary" disabled>{t("menu.add")}</Button>
                      ) : (
                        <ItemSheet item={item} quote={(draft) => quote(item.id, draft)} onAdd={onAdd} />
                      )
                    }
                  />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

function CartPanel({
  view,
  i18n,
  offline,
  onMenu,
  onNotes,
  onRemove,
  onUpdate,
  onSend,
  onPrepay,
  quote,
}: {
  view: TableView;
  i18n: Translator;
  offline: boolean;
  onMenu: () => void;
  onNotes: (notes: string) => void;
  onRemove: (lineId: string) => void;
  onUpdate: (lineId: string, draft: LineDraft) => void;
  onSend: () => void;
  onPrepay: () => void;
  quote: (itemId: string, draft: Pick<LineDraft, "variantId" | "addonIds" | "qty">) => { lineTotal: number };
}) {
  const { t } = i18n;
  const notesId = useId();
  const notesTooLong = view.cart.notes.trim().length > NOTES_MAX;

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{t("cart.title")}</h2>
        <Button type="button" variant="quiet" onClick={onMenu}>{t("cart.empty.action")}</Button>
      </div>
      {view.cart.lines.length === 0 ? (
        <EmptyCart i18n={i18n} onBack={onMenu} />
      ) : (
        <>
          <ul>
            {view.cart.lines.map((line) => (
              <CartLine
                key={line.id}
                line={line}
                item={view.items.find((candidate) => candidate.id === line.itemId)}
                i18n={i18n}
                offline={offline}
                onRemove={() => onRemove(line.id)}
                onUpdate={(draft) => onUpdate(line.id, draft)}
                quote={quote}
              />
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <label htmlFor={notesId} className={labelClass}>{t("item.notes.label")}</label>
            <textarea
              id={notesId}
              name="notes"
              rows={2}
              value={view.cart.notes}
              onChange={(event) => onNotes(event.target.value)}
              placeholder={t("item.notes.placeholder")}
              aria-invalid={notesTooLong || undefined}
              aria-describedby={`${notesId}-hint`}
              className={controlClass}
            />
            <p id={`${notesId}-hint`} aria-live="polite" className={notesTooLong ? errorClass : hintClass}>
              {notesTooLong ? t("item.notes.tooLong", { max: NOTES_MAX }) : `${view.cart.notes.trim().length}/${NOTES_MAX}`}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="flex justify-between text-lg font-semibold">
              <span>{t("cart.total")}</span>
              <span>{formatPrice(view.cart.total)}</span>
            </p>
            {view.cart.holdForPayment ? (
              <>
                <p className="text-base">{t("cart.payFirst")}</p>
                <Button type="button" size="block" disabled={offline} onClick={onPrepay}>{t("bill.payUpi")}</Button>
                <Button type="button" size="block" variant="secondary" disabled={offline} onClick={onPrepay}>{t("bill.payCounter")}</Button>
              </>
            ) : (
              <Button type="button" size="block" disabled={offline || !view.cart.canSend} onClick={onSend}>{t("cart.send")}</Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CartLine({
  line,
  item,
  i18n,
  offline,
  onRemove,
  onUpdate,
  quote,
}: {
  line: PricedLine;
  item: MenuItem | undefined;
  i18n: Translator;
  offline: boolean;
  onRemove: () => void;
  onUpdate: (draft: LineDraft) => void;
  quote: (itemId: string, draft: Pick<LineDraft, "variantId" | "addonIds" | "qty">) => { lineTotal: number };
}) {
  const { locale, t } = i18n;
  const name = pickLocalized(locale, line.name_te, line.name_en);
  const detail = pickLocalized(locale, line.detail_te, line.detail_en);
  return (
    <li className="flex flex-col gap-2 rounded-sheet bg-surface p-3 shadow-card">
      <div className="flex items-start gap-3">
        {item?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="size-16 shrink-0 rounded-control object-cover" />
        )}
        <p lang={name?.lang} translate="no" className={`font-semibold break-words ${name?.lang === "te" ? "text-xl leading-heading-te" : "text-lg leading-heading"}`}>{name?.text}</p>
      </div>
      {detail && <p lang={detail.lang} translate="no" className="text-base text-ink-muted">{detail.text}</p>}
      {line.notes && <p className="text-base text-ink-muted break-words">{line.notes}</p>}
      {!line.available && <p className="text-base font-semibold text-ink-muted">{t("item.unavailable")}</p>}
      <p className="text-lg font-semibold">{formatPrice(line.lineTotal)}</p>
      <p className="text-base text-ink-muted">{line.qty}</p>
      <div className="flex flex-wrap gap-2">
        {item && !offline && (
          <ItemSheet
            key={`${line.id}-${line.qty}-${line.variantId ?? ""}-${line.addonIds.join(".")}-${line.notes}`}
            item={item}
            editing
            initial={{ itemId: line.itemId, variantId: line.variantId, addonIds: line.addonIds, qty: line.qty, notes: line.notes }}
            quote={(draft) => quote(line.itemId, draft)}
            onAdd={onUpdate}
            trigger={<Button type="button" variant="quiet">{t("cart.edit")}</Button>}
          />
        )}
        <Button type="button" variant="quiet" onClick={onRemove}>{t("cart.remove")}</Button>
      </div>
    </li>
  );
}

function StatusPanel({ view, i18n, onMenu }: { view: TableView; i18n: Translator; onMenu: () => void }) {
  const { t } = i18n;
  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{t("order.title")}</h2>
        <Button type="button" variant="quiet" onClick={onMenu}>{t("cart.empty.action")}</Button>
      </div>
      {view.orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-lg font-semibold">{t("order.empty.title")}</p>
          <p className="max-w-measure text-base text-ink-muted">{t("order.empty.body")}</p>
          <Button type="button" variant="secondary" onClick={onMenu}>{t("cart.empty.action")}</Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-6">
          {view.orders.map((order) => (
            <OrderCard key={order.id} order={order} i18n={i18n} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({ order, i18n }: { order: OrderRound; i18n: Translator }) {
  const { locale, t } = i18n;
  const reason = pickLocalized(locale, order.rejectReason_te, order.rejectReason_en);
  return (
    <li className="flex flex-col gap-3 border-b border-line pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{t("order.round", { n: order.number })}</h3>
        <StatusChip status={order.status} label={t(`order.${order.status}` as MessageKey)} />
      </div>
      <time dateTime={order.createdAt} className="text-base text-ink-muted">{formatTime(order.createdAt)}</time>
      <ul>
        {order.lines.map((line) => {
          const name = pickLocalized(locale, line.name_te, line.name_en);
          const detail = pickLocalized(locale, line.detail_te, line.detail_en);
          return (
            <li key={line.id} className="flex items-baseline justify-between gap-3 py-1">
              <span lang={name?.lang} translate="no" className="min-w-0 break-words">
                {name?.text}
                {detail ? <span lang={detail.lang}> · {detail.text}</span> : null}
                <span className="text-ink-muted"> · {line.qty}</span>
              </span>
              <span className="shrink-0 font-semibold">{formatPrice(line.lineTotal)}</span>
            </li>
          );
        })}
      </ul>
      {order.notes && <p className="text-base text-ink-muted break-words">{order.notes}</p>}
      {order.status === "rejected" && (
        <div className="flex flex-col gap-1">
          {reason && (
            <p lang={reason.lang}>
              <span className="font-semibold">{t("order.reason")}: </span>
              {reason.text}
            </p>
          )}
          <p className="text-base text-ink-muted">{t("order.rejectedNext")}</p>
        </div>
      )}
      <p className="text-lg font-semibold">{formatPrice(order.total)}</p>
    </li>
  );
}

function BillPanel({
  view,
  i18n,
  offline,
  onMenu,
  onUpi,
  onCounter,
}: {
  view: TableView;
  i18n: Translator;
  offline: boolean;
  onMenu: () => void;
  onUpi: () => void;
  onCounter: () => void;
}) {
  const { locale, t } = i18n;
  const { bill } = view;
  const canPay = !offline && bill.lines.length > 0 && bill.payment !== "at_counter" && bill.payment !== "paid";
  const paidMode = bill.paymentMode ? t(`payment.${bill.paymentMode}` as "payment.cash") : t("payment.paid");

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{t("bill.title")}</h2>
        <Button type="button" variant="quiet" onClick={onMenu}>{t("cart.empty.action")}</Button>
      </div>
      {bill.lines.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-lg font-semibold">{t("bill.empty.title")}</p>
          <p className="max-w-measure text-base text-ink-muted">{t("bill.empty.body")}</p>
          <Button type="button" variant="secondary" onClick={onMenu}>{t("cart.empty.action")}</Button>
        </div>
      ) : (
        <>
          {(view.restaurant.gstin || view.restaurant.fssai || view.restaurant.upiId) && (
            <div className="flex flex-col gap-1 text-base text-ink-muted">
              {view.restaurant.gstin && <p>{t("bill.gstin", { value: view.restaurant.gstin })}</p>}
              {view.restaurant.fssai && <p>{t("bill.fssai", { value: view.restaurant.fssai })}</p>}
              {view.restaurant.upiId && <p>{t("bill.upi", { value: view.restaurant.upiId })}</p>}
            </div>
          )}
          <ul>
            {bill.lines.map((line) => {
              const name = pickLocalized(locale, line.name_te, line.name_en);
              const detail = pickLocalized(locale, line.detail_te, line.detail_en);
              return (
                <li key={line.id} className="flex items-baseline justify-between gap-3 border-b border-line py-3">
                  <span lang={name?.lang} translate="no" className="min-w-0 break-words">
                    {name?.text}
                    {detail ? <span lang={detail.lang}> · {detail.text}</span> : null}
                    <span className="text-ink-muted"> · {line.qty}</span>
                  </span>
                  <span className="shrink-0 font-semibold">{formatPrice(line.lineTotal)}</span>
                </li>
              );
            })}
          </ul>
          {bill.taxLines.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="flex justify-between text-base">
                <span>{t("bill.itemTotal")}</span>
                <span>{formatPrice(bill.itemTotal)}</span>
              </p>
              {bill.taxLines.map((tax) => {
                const label = pickLocalized(locale, tax.name_te, tax.name_en);
                return (
                  <p key={tax.id} className="flex justify-between text-base">
                    <span lang={label?.lang}>{label?.text}</span>
                    <span>{formatPrice(tax.amount)}</span>
                  </p>
                );
              })}
            </div>
          )}
          <p className="flex justify-between text-lg font-semibold">
            <span>{t("cart.total")}</span>
            <span>{formatPrice(bill.total)}</span>
          </p>
          {bill.payment === "pending" && <p role="status" className="text-base text-warn">{t("bill.pending")}</p>}
          {bill.payment === "failed" && <BlockMessage title={t("bill.failed.title")} body={t("bill.failed.body")} />}
          {bill.payment === "at_counter" && <p role="status" className="text-base">{t("bill.atCounter")}</p>}
          {bill.payment === "paid" && <p role="status" className="text-base text-ok">{t("bill.paid", { mode: paidMode })}</p>}
          {bill.payment !== "at_counter" && bill.payment !== "paid" && (
            <div className="flex flex-col gap-2">
              <Button type="button" size="block" disabled={!canPay || bill.payment === "pending"} onClick={onUpi}>{t("bill.payUpi")}</Button>
              <Button type="button" size="block" variant="secondary" disabled={!canPay} onClick={onCounter}>{t("bill.payCounter")}</Button>
            </div>
          )}
          <p className="text-sm text-ink-muted">{t("payment.simulated")}</p>
        </>
      )}
    </div>
  );
}

function matches(item: MenuItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.name_te, item.name_en, item.description_te, item.description_en, ...item.search].join("\n").toLowerCase().includes(q);
}
