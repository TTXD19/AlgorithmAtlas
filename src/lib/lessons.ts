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
import { singlyLesson } from "@/content/linked-list/singly";
import { doublyLesson } from "@/content/linked-list/doubly";
import { reverseLesson } from "@/content/linked-list/reverse";
import { fastSlowLesson } from "@/content/linked-list/fast-slow";
import { mergeListsLesson } from "@/content/linked-list/merge-lists";
import { stackLesson } from "@/content/stack-queue/stack";
import { queueLesson } from "@/content/stack-queue/queue";
import { monotonicStackLesson } from "@/content/stack-queue/monotonic-stack";
import { monotonicQueueLesson } from "@/content/stack-queue/monotonic-queue";
import { binaryHeapLesson } from "@/content/heap/binary-heap";
import { topKLesson } from "@/content/heap/top-k";
import { twoHeapsLesson } from "@/content/heap/two-heaps";

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
  "linked-list/singly": singlyLesson,
  "linked-list/doubly": doublyLesson,
  "linked-list/reverse": reverseLesson,
  "linked-list/fast-slow": fastSlowLesson,
  "linked-list/merge-lists": mergeListsLesson,
  "stack-queue/stack": stackLesson,
  "stack-queue/queue": queueLesson,
  "stack-queue/monotonic-stack": monotonicStackLesson,
  "stack-queue/monotonic-queue": monotonicQueueLesson,
  "heap/binary-heap": binaryHeapLesson,
  "heap/top-k": topKLesson,
  "heap/two-heaps": twoHeapsLesson,
  "graph/bfs": bfsLesson,
  "graph/dfs": dfsLesson,
};
