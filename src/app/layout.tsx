import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

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

export const metadata: Metadata = {
  title: { default: "演算法圖鑑", template: "%s · 演算法圖鑑" },
  description: "主題式的演算法學習網站：每個主題底下是一組相關演算法，每一篇都有概念、步驟、互動示範、程式碼與練習題。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${bricolage.variable} ${plexSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen">
        <Header />
        <div className="grid min-h-[calc(100vh-56px)] grid-cols-1 md:grid-cols-[252px_minmax(0,1fr)]">
          <Sidebar />
          <main className="max-w-[1080px] px-5 pt-6 pb-16 md:px-12 md:pt-9 md:pb-20">{children}</main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
