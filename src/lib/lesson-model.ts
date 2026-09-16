import type { ReactNode } from "react";
import type { Lang } from "./highlight";
import type { Problem, Scenario } from "@/components/lesson/parts";

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
  /** 練習題。LeetCode 題號與題名本來就是英文，不需要翻譯 */
  problems: Problem[];
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
}
