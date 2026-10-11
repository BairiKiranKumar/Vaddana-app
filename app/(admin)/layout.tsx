import type { Metadata, Viewport } from "next";
import tokens from "@/design/tokens.json";
import { I18nProvider } from "@/components/i18n-provider";
import { HouseProvider } from "@/components/ops/frame";
import { ramabhadra } from "@/lib/display-font";
import { dinerFontClasses } from "@/lib/fonts";
import { getMessages } from "@/lib/i18n";
import { resolveDataSource } from "@/lib/data/repo";
import { readOpsLocale, readStaffId } from "@/lib/session";
import "../globals.css";

export const metadata: Metadata = { title: "Admin · Vaddana", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: tokens.core.color.paper.$value.hex };

export default async function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await readOpsLocale("en");
  const staffId = await readStaffId();
  return (
    <html lang={locale} className={`${dinerFontClasses} ${ramabhadra.variable}`}>
      <body>
        <I18nProvider locale={locale} messages={getMessages(locale)}>
          <HouseProvider staffId={staffId} surface="admin" source={resolveDataSource()}>
            {children}
          </HouseProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
