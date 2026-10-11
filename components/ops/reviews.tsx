"use client";

import { useHouse } from "@/components/ops/frame";
import { useT } from "@/components/i18n-provider";

export function ReviewsList() {
  const { result } = useHouse();
  const { t } = useT();
  if (!result?.ok) return null;
  const reviews = result.house.reviews;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">{t("admin.reviews")}</h2>
      {reviews.length === 0 ? (
        <p className="text-base text-ink-muted">{t("reviews.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-sheet bg-surface p-4 shadow-card">
              <p className="text-lg font-semibold" translate="no">{review.author} · {review.rating}/5</p>
              {review.sample && <p className="text-sm font-semibold text-accent">{t("reviews.sample")}</p>}
              <p className="text-base">{review.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
