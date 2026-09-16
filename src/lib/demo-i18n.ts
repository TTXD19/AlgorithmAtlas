import type { Locale } from "./i18n";

/**
 * 互動示範的文字表。
 *
 * 用法：demoText({ 中文… }, { en: { 英文… } })
 *
 * 形狀由中文那份決定，其餘語言必須完全吻合，所以漏翻一個鍵是編譯錯誤。
 * 之後新增語言時，每個示範都會在補完前一直報錯——這是刻意的，避免半套語言上線。
 *
 * 文字與邏輯放在同一個檔案是刻意的取捨：示範有 95 個，集中式字典要改型別檔、
 * 兩份字典、再改元件共四處；同檔只要改一處，而邏輯仍然只有一份。
 */
export function demoText<T extends Record<string, string | ((...args: never[]) => string)>>(
  zhHant: T,
  others: Record<Exclude<Locale, "zh-Hant">, NoInfer<T>>,
): Record<Locale, T> {
  return { "zh-Hant": zhHant, ...others };
}
