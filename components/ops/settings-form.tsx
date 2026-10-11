"use client";

import { useState } from "react";
import { controlClass, labelClass } from "@/components/diner/field";
import { useT } from "@/components/i18n-provider";
import { useHouse } from "@/components/ops/frame";
import { Button } from "@/components/ui/button";
import type { Restaurant, TaxMode } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n";

export function SettingsForm() {
  const { result, offline, run } = useHouse();
  const { t } = useT();
  const [saved, setSaved] = useState(false);
  if (!result?.ok) return null;
  return <Form settings={result.house.settings} offline={offline} saved={saved} onSave={(patch) => {
    run((repo) => repo.saveSettings(patch, offline));
    setSaved(true);
  }} t={t} />;
}

function Form({
  settings,
  offline,
  saved,
  onSave,
  t,
}: {
  settings: Restaurant;
  offline: boolean;
  saved: boolean;
  onSave: (patch: Partial<Restaurant>) => void;
  t: (key: "admin.save", vars?: Record<string, string | number>) => string;
}) {
  const i18n = useT();
  const [form, setForm] = useState(settings);
  const set = <K extends keyof Restaurant>(key: K, value: Restaurant[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="flex max-w-measure flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <h2 className="text-2xl font-semibold">{i18n.t("admin.settings")}</h2>
      <Field label={i18n.t("admin.nameTe")} value={form.name_te ?? ""} onChange={(value) => set("name_te", value)} />
      <Field label={i18n.t("admin.nameEn")} value={form.name_en ?? ""} onChange={(value) => set("name_en", value)} />
      <Field label={i18n.t("admin.taglineTe")} value={form.tagline_te ?? ""} onChange={(value) => set("tagline_te", value)} />
      <Field label={i18n.t("admin.taglineEn")} value={form.tagline_en ?? ""} onChange={(value) => set("tagline_en", value)} />
      <Field label={i18n.t("admin.gstin")} value={form.gstin} onChange={(value) => set("gstin", value)} />
      <Field label={i18n.t("admin.fssai")} value={form.fssai} onChange={(value) => set("fssai", value)} />
      <label className="flex flex-col gap-1">
        <span className={labelClass}>{i18n.t("admin.taxMode")}</span>
        <select value={form.taxMode} onChange={(event) => set("taxMode", event.target.value as TaxMode)} className={controlClass}>
          <option value="none">{i18n.t("admin.taxNone")}</option>
          <option value="gst">{i18n.t("admin.taxGst")}</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>{i18n.t("admin.gstRate")}</span>
        <input inputMode="decimal" value={form.gstRate} onChange={(event) => set("gstRate", Number(event.target.value))} className={controlClass} />
      </label>
      <Field label={i18n.t("admin.upi")} value={form.upiId} onChange={(value) => set("upiId", value)} />
      <label className="flex min-h-touch items-center gap-2">
        <input type="checkbox" checked={form.autoAccept} onChange={(event) => set("autoAccept", event.target.checked)} />
        {i18n.t("admin.autoAccept")}
      </label>
      <label className="flex min-h-touch items-center gap-2">
        <input type="checkbox" checked={form.payFirst} onChange={(event) => set("payFirst", event.target.checked)} />
        {i18n.t("admin.payFirst")}
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>{i18n.t("admin.defaultLang")}</span>
        <select value={form.defaultLocale} onChange={(event) => set("defaultLocale", event.target.value as Locale)} className={controlClass}>
          <option value="te">తెలుగు</option>
          <option value="en">English</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>{i18n.t("admin.logo")}</span>
        <input
          type="file"
          accept="image/*"
          className={controlClass}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file || file.size > 400_000) return;
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") set("logoDataUrl", reader.result);
            };
            reader.readAsDataURL(file);
          }}
        />
        {form.logoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.logoDataUrl} alt="" className="size-16 rounded-control object-cover" />
        )}
      </label>
      <div className="flex flex-col gap-1">
        <span className={labelClass}>{i18n.t("admin.brand")}</span>
        <span className="inline-flex size-11 rounded-control bg-accent" aria-hidden />
        <p className="text-base text-ink-muted">{i18n.t("admin.brandLocked")}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={offline}>{t("admin.save")}</Button>
        {saved && <p role="status">{i18n.t("admin.saved")}</p>}
      </div>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className={labelClass}>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className={controlClass} />
    </label>
  );
}
