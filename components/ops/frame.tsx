"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitch } from "@/components/diner/language-switch";
import { BlockMessage, LoadError, OfflineBanner, SlowNotice } from "@/components/diner/states";
import { StatusChip } from "@/components/diner/status-chip";
import { useT } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { getRepo, type DataRepo, type DataSource, type MockMode } from "@/lib/data/repo";
import type { HouseResult, HouseView, StaffMember, Surface } from "@/lib/data/types";
import type { Locale, MessageKey } from "@/lib/i18n";
import { setOpsLocale, setStaffId } from "@/lib/session";

const SLOW_MS = 3000;

type State = {
  result: HouseResult | null;
  loading: boolean;
  slow: boolean;
  offline: boolean;
  retry: () => void;
  run: (change: (repo: DataRepo) => HouseView) => void;
};

const HouseContext = createContext<State | null>(null);

export function useHouse() {
  const value = useContext(HouseContext);
  if (!value) throw new Error("House state is missing");
  return value;
}

function modeFromLocation(): MockMode | null {
  const value = new URLSearchParams(window.location.search).get("mock");
  return value === "slow" || value === "offline" || value === "fail" ? value : null;
}

export function HouseProvider({
  staffId,
  surface,
  source,
  children,
}: {
  staffId: string | null;
  surface: Surface;
  source: DataSource;
  children: React.ReactNode;
}) {
  const [result, setResult] = useState<HouseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [browserOffline, setBrowserOffline] = useState(false);
  const mode = typeof window === "undefined" ? null : modeFromLocation();
  const offline = mode === "offline" || browserOffline;

  useEffect(() => {
    const sync = () => setBrowserOffline(!navigator.onLine);
    sync();
    window.addEventListener("offline", sync);
    window.addEventListener("online", sync);
    return () => {
      window.removeEventListener("offline", sync);
      window.removeEventListener("online", sync);
    };
  }, []);

  useEffect(() => {
    const repo = getRepo(source);
    let cancel = false;
    let unsub = () => {};
    const timer = window.setTimeout(() => {
      if (!cancel) setSlow(true);
    }, SLOW_MS);
    void repo.openHouse(staffId, surface, modeFromLocation()).then((next) => {
      if (cancel) return;
      setResult(next);
      setLoading(false);
      setSlow(false);
      window.clearTimeout(timer);
      if (!next.ok) return;
      unsub = repo.subscribeHouse((house) => {
        if (!cancel) setResult((current) => (current?.ok ? { ...current, house } : current));
      });
    });
    return () => {
      cancel = true;
      unsub();
      window.clearTimeout(timer);
    };
  }, [attempt, source, staffId, surface]);

  useEffect(() => {
    if (!result?.ok) return;
    const timer = window.setInterval(() => {
      const house = getRepo(source).peekHouse();
      setResult((current) => (current?.ok ? { ...current, house } : current));
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [result?.ok, source]);

  const value: State = {
    result,
    loading,
    slow,
    offline,
    retry: () => {
      setLoading(true);
      setSlow(false);
      setAttempt((n) => n + 1);
    },
    run: (change) => {
      const house = change(getRepo(source));
      setResult((current) => (current?.ok ? { ...current, house } : current));
    },
  };

  return <HouseContext.Provider value={value}>{children}</HouseContext.Provider>;
}

const links: [string, MessageKey][] = [
  ["/admin", "admin.today"],
  ["/admin/analytics", "admin.analytics"],
  ["/admin/menu", "admin.menu"],
  ["/admin/combos", "admin.combos"],
  ["/admin/offers", "admin.offers"],
  ["/admin/tables", "admin.tables"],
  ["/admin/orders", "admin.orders"],
  ["/admin/reviews", "admin.reviews"],
  ["/admin/staff", "admin.staff"],
  ["/admin/settings", "admin.settings"],
];

export function OpsFrame({
  children,
  nav = false,
  bare = false,
}: {
  children: React.ReactNode;
  nav?: boolean;
  bare?: boolean;
}) {
  const { result, loading, slow, offline, retry } = useHouse();
  const i18n = useT();
  const { t } = i18n;
  const router = useRouter();
  const path = usePathname();

  const signOut = () => {
    void setStaffId(null).then(() => router.refresh());
  };

  if (loading || !result) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
        <h1 className="text-xl font-semibold">{t("state.loading.board")}</h1>
        {slow && <SlowNotice i18n={i18n} />}
      </main>
    );
  }

  if (!result.ok && result.error === "failed") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
        <LoadError
          titleAs="h1"
          i18n={i18n}
          title={t("state.error.board.title")}
          body={t("state.error.board.body")}
          onRetry={retry}
        />
      </main>
    );
  }

  if (!result.ok && result.error === "denied") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
        <BlockMessage titleAs="h1" title={t("staff.denied.title")} body={t("staff.denied.body")} action={<Button type="button" variant="secondary" onClick={signOut}>{t("staff.signOut")}</Button>} />
      </main>
    );
  }

  if (!result.ok && result.error === "session_expired") {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8">
        <h1 className="text-2xl font-semibold">{t("staff.signIn")}</h1>
        <p className="text-base text-ink-muted">{t("staff.session.body")}</p>
        <ul className="flex flex-col gap-2">
          {result.roster.map((person) => (
            <li key={person.id}>
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-between"
                onClick={() => {
                  void setStaffId(person.id)
                    .then(() => setOpsLocale(person.locale))
                    .then(() => router.refresh());
                }}
              >
                <span className="flex flex-col items-start">
                  <span lang={person.locale === "te" ? "te" : "en"} translate="no">{person.name}</span>
                  {person.restaurantName && <span className="text-sm text-ink-muted" translate="no">{person.restaurantName}</span>}
                </span>
                <span className="text-ink-muted">{t(`role.${person.role}` as MessageKey)}</span>
              </Button>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <FrameBody bare={bare} nav={nav} path={path} member={result.member} offline={offline} onSignOut={signOut}>
      {children}
    </FrameBody>
  );
}

function FrameBody({
  children,
  bare,
  nav,
  path,
  member,
  offline,
  onSignOut,
}: {
  children: React.ReactNode;
  bare: boolean;
  nav: boolean;
  path: string;
  member: StaffMember;
  offline: boolean;
  onSignOut: () => void;
}) {
  const i18n = useT();
  const { t, locale } = i18n;
  const { run } = useHouse();
  const router = useRouter();
  const title = bare ? t("kitchen.title") : nav ? t("admin.today") : t("staff.title");

  return (
    <div className={bare ? "min-h-dvh bg-paper" : "min-h-dvh bg-paper lg:grid lg:grid-cols-[16rem_1fr]"}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2">
        {t("nav.skip")}
      </a>
      {nav && (
        <nav aria-label={t("home.surfaces")} className="app-chrome flex gap-2 overflow-x-auto border-b border-line bg-surface px-2 lg:flex-col lg:border-r lg:border-b-0 lg:bg-surface lg:px-3 lg:py-4">
          {links.map(([href, key]) => {
            const current = href === "/admin" ? path === "/admin" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? "page" : undefined}
                className="inline-flex min-h-touch shrink-0 items-center rounded-control px-3 text-base font-semibold text-ink-muted aria-[current=page]:bg-action aria-[current=page]:text-on-action"
              >
                {t(key)}
              </Link>
            );
          })}
        </nav>
      )}
      <div className="min-w-0">
        <header className="app-chrome flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <h1 className={bare ? "text-3xl font-semibold" : "text-xl font-semibold"}>{nav ? t("home.title") : title}</h1>
            <p className="text-base text-ink-muted" translate="no">{member.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip status={offline ? "reconnecting" : "live"} label={t(offline ? "connection.reconnecting" : "connection.live")} />
            <LanguageSwitch
              value={locale}
              onChange={(next: Locale) => {
                run((repo) => repo.setStaffLocale(member.id, next, offline));
                void setOpsLocale(next).then(() => router.refresh());
              }}
            />
            <Button type="button" variant="quiet" onClick={onSignOut}>{t("staff.signOut")}</Button>
          </div>
        </header>
        <main id="main" className="flex flex-col gap-4 px-4 py-4">
          {offline && <OfflineBanner i18n={i18n} message={t("state.offline.board")} />}
          {children}
        </main>
      </div>
    </div>
  );
}
