import { CloudOff, ShoppingBag, TriangleAlert, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Translator } from "@/lib/i18n";

export function EmptyCart({ i18n: { t }, onBack }: { i18n: Translator; onBack?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <ShoppingBag aria-hidden className="size-8 text-ink-muted" />
      <p className="text-lg font-semibold">{t("cart.empty.title")}</p>
      <p className="max-w-measure text-base text-ink-muted">{t("cart.empty.body")}</p>
      <Button variant="secondary" type="button" onClick={onBack}>{t("cart.empty.action")}</Button>
    </div>
  );
}

/** Mirrors ItemRow's layout so nothing shifts when the menu arrives. Static: no shimmer loop. */
export function MenuSkeleton({ i18n: { t }, rows = 3, labelled = true }: { i18n: Translator; rows?: number; labelled?: boolean }) {
  return (
    <div role="status">
      {labelled && <span className="sr-only">{t("state.loading")}</span>}
      <ul aria-hidden>
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="mb-3 flex gap-3 rounded-sheet bg-surface p-3 shadow-card last:mb-0">
            <div className="flex flex-1 flex-col gap-2">
              <span className="h-6 w-3/4 rounded-control bg-wash" />
              <span className="h-4 w-full rounded-control bg-wash" />
              <div className="mt-1 flex items-center justify-between">
                <span className="h-6 w-16 rounded-control bg-wash" />
                <span className="h-11 w-24 rounded-control bg-wash" />
              </div>
            </div>
            <span className="size-24 shrink-0 rounded-control bg-wash" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Shown once a request has taken more than 3 s (design.md §10). */
export function SlowNotice({ i18n: { t } }: { i18n: Translator }) {
  return (
    <p role="status" className="flex items-center gap-2 text-base text-ink-muted">
      <CloudOff aria-hidden className="size-5 shrink-0" />
      {t("state.slow")}
    </p>
  );
}

export function LoadError({
  i18n: { t },
  onRetry,
  titleAs = "p",
  title,
  body,
}: {
  i18n: Translator;
  onRetry?: () => void;
  titleAs?: "p" | "h1";
  title?: string;
  body?: string;
}) {
  const Title = titleAs;
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-sheet border border-danger bg-surface p-4">
      <Title className="flex items-center gap-2 text-lg font-semibold text-danger">
        <TriangleAlert aria-hidden className="size-5 shrink-0" />
        {title ?? t("state.error.title")}
      </Title>
      <p className="text-base text-ink-muted">{body ?? t("state.error.body")}</p>
      <Button variant="secondary" type="button" onClick={onRetry}>{t("state.error.retry")}</Button>
    </div>
  );
}

export function BlockMessage({
  title,
  body,
  titleAs = "p",
  action,
}: {
  title: string;
  body: string;
  titleAs?: "p" | "h1";
  action?: React.ReactNode;
}) {
  const Title = titleAs;
  return (
    <div className="flex flex-col items-start gap-3 rounded-sheet border border-line-strong bg-surface p-4">
      <Title className="text-lg font-semibold">{title}</Title>
      <p className="max-w-measure text-base text-ink-muted">{body}</p>
      {action}
    </div>
  );
}

export function OfflineBanner({ i18n: { t }, message }: { i18n: Translator; message?: string }) {
  return (
    <p role="status" className="flex items-start gap-2 rounded-control border border-warn bg-surface px-3 py-2 text-base">
      <WifiOff aria-hidden className="mt-1 size-5 shrink-0 text-warn" />
      {message ?? t("state.offline")}
    </p>
  );
}
