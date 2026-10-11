import type { Diet } from "@/lib/data/types";

// The Indian food-safety mark: a square outline with a dot (veg) or a triangle (non-veg).
// Shape plus label, never colour alone.
export function VegMark({ diet, label }: { diet: Diet; label: string }) {
  const color = diet === "veg" ? "text-veg" : "text-nonveg";
  return (
    <svg viewBox="0 0 16 16" role="img" aria-label={label} className={`size-4 shrink-0 ${color}`}>
      <title>{label}</title>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {diet === "veg" ? <circle cx="8" cy="8" r="3.5" fill="currentColor" /> : <path d="M8 4 12 11.5H4Z" fill="currentColor" />}
    </svg>
  );
}
