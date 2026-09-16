/**
 * 語言設定。
 *
 * 要新增語言只需要：把代碼加進 LOCALES、在 messages/ 加一個字典檔、
 * 在 content/locales/ 加課文。不需要動任何路由或元件程式碼。
 */
export const LOCALES = ["zh-Hant", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** 原始內容的語言。未翻譯的課文會 fallback 到這個。 */
export const DEFAULT_LOCALE: Locale = "zh-Hant";

/** 語言選單上的顯示名稱，一律用該語言自己的寫法。 */
export const LOCALE_LABEL: Record<Locale, string> = {
  "zh-Hant": "繁體中文",
  en: "English",
};

/** <html lang> 用的值。 */
export const HTML_LANG: Record<Locale, string> = {
  "zh-Hant": "zh-Hant",
  en: "en",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** 從 Accept-Language 挑一個支援的語言，挑不到就用預設。 */
export function pickLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const wanted = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of wanted) {
    // 完全比對優先，再退到語言主標籤（zh-tw / zh-hk 都算繁體中文）
    const exact = LOCALES.find((l) => l.toLowerCase() === tag);
    if (exact) return exact;
    if (tag.startsWith("zh")) return "zh-Hant";
    if (tag.startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
}
