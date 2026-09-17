import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle";
import { LOCALES, HTML_LANG, type Locale } from "@/lib/i18n";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getMessages } from "@/lib/messages";
import { ProgressSync } from "@/components/ProgressSync";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
});
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang as Locale;
  const { name, description } = getMessages(locale).site;
  return {
    // 各頁的 canonical、hreflang 與 Open Graph 由 pageMeta() 逐頁給，不放在這裡：
    // metadata 是淺層合併，寫在 layout 只會被第一個定義 alternates 的頁面整組蓋掉。
    metadataBase: new URL(SITE_URL),
    title: { default: name, template: `%s · ${name}` },
    description,
  };
}

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

/** 只接受 LOCALES 裡的語言，其餘 404，不讓任何單段路徑都被當成語言。 */
export const dynamicParams = false;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  const locale = lang as Locale;
  return (
    <html lang={HTML_LANG[locale]} className={`${bricolage.variable} ${plexSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        <LocaleProvider locale={locale}>
          <Header locale={locale} />
          <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 md:grid-cols-[252px_minmax(0,1fr)]">
            <Sidebar />
            <main className="max-w-[1080px] px-5 pt-6 pb-16 md:px-12 md:pt-9 md:pb-20">{children}</main>
          </div>
        </LocaleProvider>
        <ProgressSync />
        <Analytics />
      </body>
    </html>
  );
}
