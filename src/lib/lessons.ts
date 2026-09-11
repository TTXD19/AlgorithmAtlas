import type { ComponentType } from "react";
import { bfsLesson } from "@/content/graph/bfs";
import { dfsLesson } from "@/content/graph/dfs";

export interface Lesson {
  /** 顯示在課程頁「前置知識」欄 */
  prereq: string;
  /** 課程本體：五段固定結構 */
  Body: ComponentType;
}

/** key 為 `${topicId}/${subId}`；沒有登錄的細項會顯示「撰寫中」佔位頁。 */
export const LESSONS: Record<string, Lesson> = {
  "graph/bfs": bfsLesson,
  "graph/dfs": dfsLesson,
};
