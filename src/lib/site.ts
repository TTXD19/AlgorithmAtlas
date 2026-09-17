/**
 * 正式站的網址。sitemap、robots 與往後的 canonical 都以它為基準。
 *
 * 寫死而不是讀環境變數：搜尋引擎眼中的網站只能有一個正式網址，
 * 而 preview 部署本來就不該被收錄（Vercel 會自動為 preview 加上 noindex）。
 */
export const SITE_URL = "https://beginalgo.com";
