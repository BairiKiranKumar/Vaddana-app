"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n-provider";
import { useHouse } from "@/components/ops/frame";
import { Button } from "@/components/ui/button";
import { pickLocalized } from "@/lib/i18n";

export function QrSheet({ token }: { token: string }) {
  const { result } = useHouse();
  const { locale, t } = useT();
  const [svg, setSvg] = useState("");
  const desk = result?.ok ? result.house.desks.find((entry) => entry.token === token) : undefined;
  const name = result?.ok ? pickLocalized(locale, result.house.settings.name_te, result.house.settings.name_en) : null;
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/t/${token}`;

  useEffect(() => {
    if (!url) return;
    let cancel = false;
    void import("qrcode").then((QR) => QR.toString(url, { type: "svg", margin: 1, width: 280 })).then((markup) => {
      if (!cancel) setSvg(markup);
    });
    return () => {
      cancel = true;
    };
  }, [url]);

  if (!result?.ok) return null;
  if (!desk) return <p className="text-base">{t("state.denied.title")}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="app-chrome">
        <Button type="button" onClick={() => window.print()}>{t("admin.printQr")}</Button>
      </div>
      <article className="print-root">
        <div className="flex flex-col items-center gap-3 bg-paper p-4 text-center">
        <h2 lang={name?.lang} translate="no" className="font-display text-3xl">{name?.text}</h2>
        <p className="text-xl font-semibold">{t("table.label", { n: desk.number })}</p>
        {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : null}
        <p lang="te" className="text-xl font-semibold">{t("print.scanTe")}</p>
        <p lang="en" className="text-xl">{t("print.scanEn")}</p>
        </div>
      </article>
      <article className="app-chrome flex flex-col items-center gap-3 rounded-sheet border border-line bg-surface p-6 text-center">
        <h2 lang={name?.lang} translate="no" className="text-3xl font-semibold">{name?.text}</h2>
        <p className="text-xl font-semibold">{t("table.label", { n: desk.number })}</p>
        {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : null}
        <p lang="te" className="text-xl font-semibold">{t("print.scanTe")}</p>
        <p lang="en" className="text-xl">{t("print.scanEn")}</p>
      </article>
    </div>
  );
}
