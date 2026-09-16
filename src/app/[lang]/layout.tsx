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

const DESCRIPTION: Record<Locale, string> = {
  "zh-Hant": "主題式的演算法學習網站：每個主題底下是一組相關演算法，每一篇都有概念、步驟、互動示範、程式碼與練習題。",
  en: "A topic-based guide to algorithms. Every lesson has the same shape: the concept, the steps, an interactive demo, the code, and practice problems.",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang as Locale;
  const name = getMessages(locale).site.name;
  return {
    title: { default: name, template: `%s · ${name}` },
    description: DESCRIPTION[locale],
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
