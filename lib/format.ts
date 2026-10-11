// Digits stay Western Arabic in both languages, as on Indian menus and UPI apps (design.md §5.6).
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const formatPrice = (rupees: number) => inr.format(rupees);

/** 12-hour clock, Western digits, in both languages. */
export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
