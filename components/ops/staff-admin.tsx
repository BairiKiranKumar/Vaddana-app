"use client";

import { useState } from "react";
import { controlClass, labelClass } from "@/components/diner/field";
import { useT } from "@/components/i18n-provider";
import { useHouse } from "@/components/ops/frame";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/data/types";
import type { Locale, MessageKey } from "@/lib/i18n";

const roles: Role[] = ["captain", "waiter", "cook", "owner"];

export function StaffAdmin() {
  const { result, offline, run } = useHouse();
  const { t } = useT();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("waiter");
  const [language, setLanguage] = useState<Locale>("te");
  if (!result?.ok) return null;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">{t("admin.staff")}</h2>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          run((repo) => repo.inviteStaff({ name, role, locale: language }, offline));
          setName("");
        }}
      >
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.nameEn")}</span>
          <input required value={name} onChange={(event) => setName(event.target.value)} className={controlClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.role")}</span>
          <select value={role} onChange={(event) => setRole(event.target.value as Role)} className={controlClass}>
            {roles.map((value) => <option key={value} value={value}>{t(`role.${value}` as MessageKey)}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>{t("admin.language")}</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value === "en" ? "en" : "te")} className={controlClass}>
            <option value="te">తెలుగు</option>
            <option value="en">English</option>
          </select>
        </label>
        <Button type="submit" disabled={offline}>{t("admin.invite")}</Button>
      </form>
      <ul className="flex flex-col">
        {result.house.staff.map((person) => (
          <li key={person.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3">
            <div>
              <p className="text-base font-semibold" translate="no">{person.name}</p>
              <p className="text-base text-ink-muted">{t(`role.${person.role}` as MessageKey)} · {person.locale === "te" ? "తెలుగు" : "English"}</p>
            </div>
            {person.role !== "owner" && (
              <Button type="button" variant="secondary" disabled={offline} onClick={() => run((repo) => repo.setStaffActive(person.id, !person.active, offline))}>
                {t(person.active ? "admin.deactivate" : "admin.activate")}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
