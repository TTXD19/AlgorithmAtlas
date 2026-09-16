import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALES, pickLocale } from "@/lib/i18n";

/**
 * 沒有語言前綴的路徑，依瀏覽器的 Accept-Language 導到對應語言。
 *
 * 順帶處理了網址搬遷：舊連結 /graph/bfs 會被導到 /zh-Hant/graph/bfs，
 * 所以改成 [lang] 路由不會讓任何既有連結失效。
 *
 * （Next 16 已把 middleware.ts 改名為 proxy.ts。）
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  const locale = pickLocale(request.headers.get("accept-language"));
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // 跳過 Next 的內部路徑與任何有副檔名的檔案（圖片、favicon、sitemap 等）
  matcher: ["/((?!_next|api|.*\\.).*)"],
};
