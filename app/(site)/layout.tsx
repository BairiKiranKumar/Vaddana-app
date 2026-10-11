import type { Metadata, Viewport } from "next";
import tokens from "@/design/tokens.json";
import { ramabhadra } from "@/lib/display-font";
import { dinerFontClasses } from "@/lib/fonts";
import "../globals.css";

// Marketing home. Diner, staff, kitchen and admin each have their own root layout.
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
    <html lang="te" className={`${dinerFontClasses} ${ramabhadra.variable}`}>
      <body>{children}</body>
    </html>
  );
}
