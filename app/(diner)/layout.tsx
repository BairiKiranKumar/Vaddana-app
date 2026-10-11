import type { Metadata, Viewport } from "next";
import tokens from "@/design/tokens.json";
import { dinerFontClasses } from "@/lib/fonts";
import { readDinerLocale } from "./locale";
import "../globals.css";

export const metadata: Metadata = {
  title: "Vaddana",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: tokens.core.color.paper.$value.hex,
};

export default async function DinerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = await readDinerLocale();
  return (
    <html lang={lang} className={dinerFontClasses}>
      <body>{children}</body>
    </html>
  );
}
