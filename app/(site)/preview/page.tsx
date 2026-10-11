import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { I18nProvider } from "@/components/i18n-provider";
import { StatusChip, type ChipStatus } from "@/components/diner/status-chip";
import { EmptyCart, LoadError, MenuSkeleton, OfflineBanner, SlowNotice } from "@/components/diner/states";
import { controlClass, errorClass, hintClass, labelClass } from "@/components/diner/field";
import { formatPrice } from "@/lib/format";
import { createTranslator, getMessages, locales, type Locale, type MessageKey } from "@/lib/i18n";
import { sampleItems } from "@/lib/sample-menu";
import { LanguageSwitchDemo } from "./language-switch-demo";
import { PreviewItem } from "./preview-item";

export const metadata: Metadata = { title: "Component preview · Vaddana" };

const chips: [ChipStatus, MessageKey][] = [
  ["sent", "order.sent"],
  ["confirmed", "order.confirmed"],
  ["preparing", "order.preparing"],
  ["ready", "order.ready"],
  ["served", "order.served"],
  ["rejected", "order.rejected"],
  ["live", "connection.live"],
  ["reconnecting", "connection.reconnecting"],
];

// Sample notes long enough to trip the 140-character limit in each language.
const longNote: Record<Locale, string> = {
  te: "పిల్లల ప్లేట్‌లో కారం తక్కువ వేయండి, రైతాలో ఉల్లిపాయ వద్దు, సాలన్ విడిగా ఇవ్వండి. కొంచెం ఆలస్యమైనా బిర్యానీ, పులుసు రెండూ ఒకేసారి తీసుకురండి, వేడిగా ఉండాలి.",
  en: "Less spicy for the kids' plate, no onion in the raita, salan on the side. Please bring the biryani and the pulusu together, even if it takes a little longer.",
};

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-ink-muted">{title}</h3>
      {children}
    </section>
  );
}

function PreviewColumn({ locale }: { locale: Locale }) {
  const messages = getMessages(locale);
  const i18n = createTranslator(locale, messages);
  const { t, tn } = i18n;
  const cartTotal = 649 + 220;

  return (
    <I18nProvider locale={locale} messages={messages}>
      <section lang={locale} aria-labelledby={`col-${locale}`} className="mx-auto flex w-full max-w-md flex-col gap-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 id={`col-${locale}`} className="text-2xl font-semibold">{t("preview.column")}</h2>
            <p className="text-base text-ink-muted">{t("table.label", { n: 7 })}</p>
          </div>
          <LanguageSwitchDemo initial={locale} />
        </header>

        <Group title={t("preview.buttons")}>
          <div className="flex flex-col gap-2">
            <p className="flex justify-between text-base text-ink-muted">
              <span>{tn("cart.items", 2)}</span>
              <span>{formatPrice(cartTotal)}</span>
            </p>
            <Button size="block">{t("cart.send")}</Button>
          </div>
          <Button size="block" loading>{t("cart.send")}</Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">{t("utility.callWaiter")}</Button>
            <Button variant="quiet">{t("utility.requestBill")}</Button>
            <Button variant="danger">{t("staff.reject")}</Button>
          </div>
          <Button disabled>{t("bill.payUpi")}</Button>
        </Group>

        <Group title={t("preview.inputs")}>
          <div className="flex flex-col gap-2">
            <label htmlFor={`search-${locale}`} className={labelClass}>{t("menu.search.label")}</label>
            <input id={`search-${locale}`} type="search" name="q" autoComplete="off" placeholder={t("menu.search.placeholder")} className={controlClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={`notes-${locale}`} className={labelClass}>{t("item.notes.label")}</label>
            <textarea
              id={`notes-${locale}`}
              name="notes"
              rows={4}
              defaultValue={longNote[locale]}
              aria-invalid
              aria-describedby={`notes-${locale}-error`}
              className={controlClass}
            />
            <p id={`notes-${locale}-error`} className={errorClass}>{t("item.notes.tooLong", { max: 140 })}</p>
            <p className={hintClass}>{longNote[locale].length}/140</p>
          </div>
        </Group>

        <Group title={t("preview.items")}>
          <ul>
            {sampleItems.map((item) => (
              <PreviewItem key={item.id} item={item} />
            ))}
          </ul>
        </Group>

        <Group title={t("preview.status")}>
          <div className="flex flex-wrap gap-2">
            {chips.map(([status, key]) => (
              <StatusChip key={status} status={status} label={t(key)} />
            ))}
          </div>
        </Group>

        <Group title={t("preview.states")}>
          <OfflineBanner i18n={i18n} />
          <EmptyCart i18n={i18n} />
          <MenuSkeleton i18n={i18n} rows={2} />
          <SlowNotice i18n={i18n} />
          <LoadError i18n={i18n} />
        </Group>
      </section>
    </I18nProvider>
  );
}

export default function PreviewPage() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2">
        Skip to content
      </a>
      <main id="main" className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-8 lg:py-12">
        <header className="flex flex-col gap-2">
          <p lang="te" translate="no" className="font-display text-3xl leading-heading">వడ్డన</p>
          <h1 className="text-xl font-semibold">Component preview</h1>
          <p className="max-w-measure text-base text-ink-muted">
            Diner components in Telugu and English, side by side. The menu is sample data, not a real restaurant, and the
            Telugu strings are drafts waiting for native review.
          </p>
        </header>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          {locales.map((locale) => (
            <PreviewColumn key={locale} locale={locale} />
          ))}
        </div>
      </main>
    </>
  );
}
