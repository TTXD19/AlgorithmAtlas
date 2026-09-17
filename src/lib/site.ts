import type { Metadata } from "next";
import { LOCALES, type Locale } from "./i18n";

/**
 * 正式站的網址。sitemap、robots 與 canonical 都以它為基準。
 *
 * 寫死而不是讀環境變數：搜尋引擎眼中的網站只能有一個正式網址，
 * 而 preview 部署本來就不該被收錄（Vercel 會自動為 preview 加上 noindex）。
 */
export const SITE_URL = "https://beginalgo.com";

/** Open Graph 用的 locale 格式（底線、含地區），跟 hreflang 的寫法不同。 */
const OG_LOCALE: Record<Locale, string> = { "zh-Hant": "zh_TW", en: "en_US" };

/** 某個語言版本的完整網址。path 不含語言前綴，"" 是首頁。 */
export function localizedUrl(locale: Locale, path: string): string {
  return `${SITE_URL}/${locale}${path}`;
}

/**
 * 同一頁所有語言版本的對照表，sitemap 與每頁的 <head> 共用，兩邊不會漂移。
 *
 * x-default 指向沒有語言前綴的網址：proxy.ts 會依 Accept-Language 決定給哪個版本，
 * 正好就是「沒有更適合的語言時該去哪」的定義。
 */
export function languageAlternates(path: string): Record<Locale | "x-default", string> {
  return Object.fromEntries([
    ...LOCALES.map((l) => [l, localizedUrl(l, path)]),
    ["x-default", `${SITE_URL}${path || "/"}`],
  ]) as Record<Locale | "x-default", string>;
}

/**
 * 一頁完整的 SEO metadata：canonical、hreflang、Open Graph、Twitter card。
 *
 * 做成一個 helper 而不是分散在 layout 與各頁，是因為 Next 的 metadata 是淺層合併：
 * 頁面只要定義了 alternates 或 openGraph 的任何一個欄位，layout 裡的整組就會被蓋掉。
 * 每頁呼叫一次拿到完整的一組，就不會有某一頁少了 canonical 卻沒人發現。
 *
 * title 省略時用 layout 的預設（站名），給首頁用。
 */
export function pageMeta(
  locale: Locale,
  path: string,
  { title, description, siteName }: { title?: string; description: string; siteName: string },
): Metadata {
  const canonical = localizedUrl(locale, path);
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName,
      title: title ? `${title} · ${siteName}` : siteName,
      description,
      url: canonical,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: { card: "summary_large_image" },
  };
}
