"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClass, labelClass } from "@/components/diner/field";
import { addReview, currentGuest, listRestaurants, recordVisit, signInGuest, signOutGuest } from "@/lib/data/platform/service";
import { getMessages } from "@/lib/i18n";

export function AccountPanel() {
  const te = getMessages("te");
  const en = getMessages("en");
  const [guest, setGuest] = useState(currentGuest());
  const [sent, setSent] = useState(false);
  const restaurants = listRestaurants().filter((entry) => entry.status === "live");

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 lang="te" className="text-3xl font-semibold leading-heading-te">{te["account.title"]}</h1>
        <p lang="te" className="text-base leading-body-te">{te["account.lede"]}</p>
        <p lang="en" className="text-base text-ink-muted">{en["account.lede"]}</p>
      </header>
      {guest ? (
        <div className="flex flex-col gap-4 rounded-sheet bg-surface p-4 shadow-card">
          <p className="text-lg font-semibold" translate="no">{guest.name}</p>
          <p className="text-base">{te["account.points"].replace("{n}", String(guest.points))}</p>
          <Button type="button" onClick={() => setGuest(recordVisit())}>{te["account.visit"]}</Button>
          <Button type="button" variant="secondary" onClick={() => { signOutGuest(); setGuest(null); }}>{te["account.signOut"]}</Button>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            setGuest(signInGuest(String(data.get("name") ?? ""), String(data.get("phone") ?? "")));
          }}
        >
          <label className="flex flex-col gap-1">
            <span className={labelClass} lang="te">{te["account.name"]}</span>
            <input name="name" required className={controlClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass} lang="te">{te["account.phone"]}</span>
            <input name="phone" required inputMode="tel" autoComplete="tel" className={controlClass} />
          </label>
          <Button type="submit" size="block">{te["account.signIn"]}</Button>
        </form>
      )}
      {guest && (
        <form
          className="flex flex-col gap-3 rounded-sheet bg-surface p-4 shadow-card"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const restaurantId = String(data.get("restaurant") ?? "");
            const body = String(data.get("body") ?? "").trim();
            if (!restaurantId || !body) return;
            addReview(restaurantId, {
              id: `review-${Date.now().toString(36)}`,
              author: guest.name,
              rating: 5,
              body,
              createdAt: new Date().toISOString(),
              sample: true,
            });
            setSent(true);
          }}
        >
          <h2 lang="te" className="text-xl font-semibold">{te["account.review"]}</h2>
          <select name="restaurant" className={controlClass}>
            {restaurants.map((entry) => (
              <option key={entry.id} value={entry.id}>{entry.name_en}</option>
            ))}
          </select>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>{te["account.reviewBody"]}</span>
            <textarea name="body" required rows={3} className={controlClass} />
          </label>
          <Button type="submit">{te["account.reviewSend"]}</Button>
          {sent && <p role="status" lang="te">{te["account.reviewSend"]}</p>}
        </form>
      )}
    </main>
  );
}
