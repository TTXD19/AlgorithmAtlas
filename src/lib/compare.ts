import type { Locale } from "./i18n";

/** 兩種語言各一份的字串 */
export type L = Record<Locale, string>;

/**
 * 一個主題的比較表。
 *
 * 名稱、時間、空間、難度四欄從 topics 拿，不重複寫；這裡只放主題特有的欄位
 * （排序的「穩定」「原地」、最短路徑的「負邊」）、每列的「什麼時候選它」，
 * 以及頁尾的選擇指南。全部人工撰寫：比較表的價值就在判斷，不是複製數字。
 */
export interface Comparison {
  title: L;
  description: L;
  /** 主題特有的欄位 */
  columns: { key: string; label: L }[];
  rows: {
    /** 細項 id（同主題） */
    sub: string;
    /** 對應 columns 的值；純符號（O(1)、✓）可以直接給字串 */
    cells: Record<string, string | L>;
    /** 什麼時候選它 */
    pick: L;
  }[];
  /** 選擇指南：一句話一條，「看到 X 就用 Y」 */
  guide: L[];
}

export function pickL(v: string | L, locale: Locale): string {
  return typeof v === "string" ? v : v[locale];
}
