import type { Locale } from "@/lib/i18n";

/**
 * 已經遷移到新模型（skeleton + text + mdx）的課程。
 *
 * 用明確清單而不是對動態 import 包 try/catch：後者會在建置期為尚未遷移的
 * 課程丟出大量被吞掉的例外，而且會連真正的錯誤一起吞掉。遷移一篇就加一行。
 */
export const MIGRATED: ReadonlySet<string> = new Set([
  "graph/bfs",
]);

/**
 * 每種語言已經翻譯的課程。沒列到的會 fallback 到原始語言並顯示提示。
 * 原始語言不需要列，它依定義全部都有。
 */
export const TRANSLATED: Record<Exclude<Locale, "zh-Hant">, ReadonlySet<string>> = {
  en: new Set([
    "graph/bfs",
  ]),
};

export function isTranslated(key: string, locale: Locale): boolean {
  if (locale === "zh-Hant") return true;
  return TRANSLATED[locale].has(key);
}
