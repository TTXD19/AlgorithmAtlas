import type { ComponentType } from "react";
import { bfsLesson } from "@/content/graph/bfs";
import { dfsLesson } from "@/content/graph/dfs";
import { bigOLesson } from "@/content/foundations/big-o";
import { recursionLesson } from "@/content/foundations/recursion";
import { amortizedLesson } from "@/content/foundations/amortized";
import { arrayLesson } from "@/content/arrays/array";
import { prefixSumLesson } from "@/content/arrays/prefix-sum";
import { hashTableLesson } from "@/content/arrays/hash-table";
import { hashMapAppsLesson } from "@/content/arrays/hash-map-apps";
import { matrixLesson } from "@/content/arrays/matrix";

export interface Lesson {
  /** 顯示在課程頁「前置知識」欄 */
  prereq: string;
  /** 課程本體：五段固定結構 */
  Body: ComponentType;
}

/** key 為 `${topicId}/${subId}`；沒有登錄的細項會顯示「撰寫中」佔位頁。 */
export const LESSONS: Record<string, Lesson> = {
  "foundations/big-o": bigOLesson,
  "foundations/recursion": recursionLesson,
  "foundations/amortized": amortizedLesson,
  "arrays/array": arrayLesson,
  "arrays/prefix-sum": prefixSumLesson,
  "arrays/hash-table": hashTableLesson,
  "arrays/hash-map-apps": hashMapAppsLesson,
  "arrays/matrix": matrixLesson,
  "graph/bfs": bfsLesson,
  "graph/dfs": dfsLesson,
};
