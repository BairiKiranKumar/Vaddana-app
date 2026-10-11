import type { Metadata, Viewport } from "next";
import tokens from "@/design/tokens.json";
import { ramabhadra } from "@/lib/display-font";
import { dinerFontClasses } from "@/lib/fonts";
import "../globals.css";

// Dev pages (home, component preview). The diner route group has its own root layout.
export const metadata: Metadata = {
  title: "Vaddana",
  description: "QR table ordering for restaurants in Nizamabad. Telugu and English.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: tokens.core.color.paper.$value.hex,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dinerFontClasses} ${ramabhadra.variable}`}>
      <body>{children}</body>
    </html>
  );
}
