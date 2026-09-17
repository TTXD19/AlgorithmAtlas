import type { Locale } from "@/lib/i18n";
import { TOPICS } from "@/lib/topics";

/**
 * 每種語言已經翻譯完成的課程。沒列到的會 fallback 到原始語言並顯示提示。
 * 原始語言不需要列，它依定義全部都有。
 *
 * 新增語言時，這裡先給一個空集合，課文就會全部顯示原文加提示；
 * 翻好一篇加一行，可以邊翻邊上線。
 */
export const TRANSLATED: Record<Exclude<Locale, "zh-Hant">, ReadonlySet<string>> = {
  en: new Set(TOPICS.flatMap((t) => t.subs.map((s) => `${t.id}/${s.id}`))),
};

/** 已經寫好內容的課程數。目前每個細項都有課文。 */
export const WRITTEN_COUNT = TOPICS.reduce((n, t) => n + t.subs.length, 0);

export function isTranslated(key: string, locale: Locale): boolean {
  if (locale === "zh-Hant") return true;
  return TRANSLATED[locale].has(key);
}
