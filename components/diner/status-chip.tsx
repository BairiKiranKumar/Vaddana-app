import { Check, ChefHat, CircleDot, Clock, Utensils, X, Wifi, WifiOff } from "lucide-react";

export type OrderStatus = "sent" | "confirmed" | "preparing" | "ready" | "served" | "rejected";
export type ChipStatus = OrderStatus | "live" | "reconnecting";

// Icon + text + colour, so status never relies on colour alone.
const look: Record<ChipStatus, { icon: typeof Check; tone: string }> = {
  sent: { icon: Clock, tone: "text-ink-muted border-line-strong" },
  confirmed: { icon: Check, tone: "text-accent border-accent" },
  preparing: { icon: ChefHat, tone: "text-warn border-warn" },
  ready: { icon: CircleDot, tone: "text-ok border-ok" },
  served: { icon: Utensils, tone: "text-ink-muted border-line" },
  rejected: { icon: X, tone: "text-danger border-danger" },
  live: { icon: Wifi, tone: "text-ok border-ok" },
  reconnecting: { icon: WifiOff, tone: "text-warn border-warn" },
};

export function StatusChip({ status, label }: { status: ChipStatus; label: string }) {
  const { icon: Icon, tone } = look[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-control border bg-surface px-2 py-1 text-sm font-semibold ${tone}`}>
      <Icon aria-hidden className="size-4 shrink-0" />
      {label}
    </span>
  );
}
