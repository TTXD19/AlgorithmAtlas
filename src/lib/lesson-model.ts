import type { ReactNode } from "react";
import type { Lang } from "./highlight";
import type { Problem, Scenario } from "@/components/lesson/parts";

/**
 * 小測驗的一題：單選。answer 是 choices 的索引；why 在對答案後顯示，
 * 不管答對答錯都顯示，讓答對的人也確認自己是對在正確的理由上。
 * q、choices、why 都支援 steps 那兩種行內標記。
 */
export interface QuizItem {
  q: string;
  choices: string[];
  answer: number;
  why: string;
}

/**
 * 一篇課程的「結構」，與語言無關，全站只有一份。
 *
 * 93 篇的段落順序完全一致（why → concept → steps → demo → code → problems，
 * 實測 93/93），所以每篇需要指定的只剩三樣東西。版面要改就改 LessonBody 一個地方。
 */
export interface LessonSkeleton {
  /** 這課專屬的互動示範 */
  demo: ReactNode;
  /** 程式碼範例。註解一律留英文，不隨語言翻譯 */
  code: Partial<Record<Lang, string>>;
}

/**
 * 一篇課程的「文字」，每種語言一份。
 *
 * steps 與 note 支援兩種行內標記，涵蓋現有內容的 100%（實測只用到這兩種）：
 *   `foo`    → 行內程式碼
 *   **foo**  → 粗體
 * concept 那段不在這裡，它在同名的 .mdx 檔案，因為只有它需要完整排版。
 */
export interface LessonText {
  prereq: string;
  applications: Scenario[];
  cue: string;
  steps: string[];
  demoNote: string;
  codeNote: string;
  problemsNote?: string;
  /**
   * 練習題。LeetCode 題號與題名本身是英文，但題名後面常掛著一句提示
   * （「Rotate Array（三次反轉）」），那句必須隨語言走——放在共用的
   * skeleton 會讓中文讀者看到英文提示。521 題裡有 371 題有這種提示。
   */
  problems: Problem[];
  /**
   * 課後小測驗，3 到 5 題。沒有的課程不顯示這一段，Rail 也不列。
   * 逐篇補，從路線圖前面的節點開始。
   */
  quiz?: QuizItem[];
}
