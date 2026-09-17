import type { Application } from "../topics";
import type { TopicId, SubKey } from "./keys";

/**
 * 某個語言對主題/細項文字的覆寫。
 *
 * 原文（繁體中文）直接寫在 topics.ts 裡，其他語言是覆寫檔。這跟課文的
 * 「每語言一份檔案」不同，是刻意的：topics.ts 的結構被 7 個消費端依賴，
 * 把文字抽出去會牽動全部；覆寫式完全不用動它。
 *
 * Record 的 key 是完整的 union，所以漏掉任何一個主題或細項都是編譯錯誤。
 */
export interface TopicsText {
  topics: Record<TopicId, {
    zh: string;
    desc: string;
    intro?: string;
    prereq?: string[];
    applications: Application[];
  }>;
  subs: Record<SubKey, {
    zh: string;
    desc?: string;
    apply: string;
    /** 複雜度通常是純符號不用翻；只有原文夾了中文（「平均 O(1)」）才需要覆寫 */
    time?: string;
    space?: string;
  }>;
  /** 分類與難度的標籤 */
  kind: { ds: string; algo: string };
  level: { 1: string; 2: string; 3: string };
}
