import type { MetadataRoute } from "next";
import { TOPICS } from "@/lib/topics";
import { LOCALES, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

/**
 * 全站 sitemap。
 *
 * 路徑本身跟語言無關，所以先列出不含語言前綴的清單，再乘上 LOCALES。
 * 新增語言時只要動 LOCALES，這個檔案不用改 —— 跟 i18n.ts 的約定一致。
 *
 * 沒有給 lastModified：每次建置都填 new Date() 等於宣稱全站 224 頁同時改過，
 * Google 遇到這種不可信的值會直接忽略整個欄位。寧可不給。
 * changeFrequency 與 priority 同理，Google 明說不看，就不放了。
 */

/** 不含語言前綴的所有路徑，"" 代表首頁。 */
function paths(): string[] {
  return [
    "",
    "/roadmap",
    ...TOPICS.flatMap((t) => [`/${t.id}`, ...t.subs.map((s) => `/${t.id}/${s.id}`)]),
  ];
}

const localized = (locale: Locale, path: string) => `${SITE_URL}/${locale}${path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  return paths().flatMap((path) => {
    // 同一頁的各語言版本互相指認，Google 才不會把它們當成彼此的重複內容。
    // x-default 指向沒有語言前綴的網址：proxy.ts 會依 Accept-Language 決定給哪個版本，
    // 正好就是「沒有更適合的語言時該去哪」的定義。
    const languages = Object.fromEntries([
      ...LOCALES.map((l) => [l, localized(l, path)]),
      ["x-default", `${SITE_URL}${path || "/"}`],
    ]) as Record<Locale | "x-default", string>;

    return LOCALES.map((locale) => ({
      url: localized(locale, path),
      alternates: { languages },
    }));
  });
}
