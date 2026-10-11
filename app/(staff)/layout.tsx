import type { Metadata, Viewport } from "next";
import tokens from "@/design/tokens.json";
import { I18nProvider } from "@/components/i18n-provider";
import { HouseProvider, OpsFrame } from "@/components/ops/frame";
import { dinerFontClasses } from "@/lib/fonts";
import { getMessages } from "@/lib/i18n";
import { resolveDataSource } from "@/lib/data/repo";
import { readOpsLocale, readStaffId } from "@/lib/session";
import "../globals.css";

export const metadata: Metadata = { title: "Staff · Vaddana", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: tokens.core.color.paper.$value.hex };

export default async function StaffLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await readOpsLocale("te");
  const staffId = await readStaffId();
  return (
    <html lang={locale} className={dinerFontClasses}>
      <body>
        <I18nProvider locale={locale} messages={getMessages(locale)}>
          <HouseProvider staffId={staffId} surface="staff" source={resolveDataSource()}>
            <OpsFrame>{children}</OpsFrame>
          </HouseProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
