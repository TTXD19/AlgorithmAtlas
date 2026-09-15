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
import { binaryTreeLesson } from "@/content/tree/binary-tree";
import { traversalLesson } from "@/content/tree/traversal";
import { bstLesson } from "@/content/tree/bst";
import { balancedLesson } from "@/content/tree/balanced";
import { trieLesson } from "@/content/tree/trie";
import { segmentLesson } from "@/content/tree/segment";
import { fenwickLesson } from "@/content/tree/fenwick";
import { adjacencyLesson } from "@/content/graph-ds/adjacency";
import { unionFindLesson } from "@/content/graph-ds/union-find";
import { bubbleLesson } from "@/content/sorting/bubble";
import { selectionLesson } from "@/content/sorting/selection";
import { mergeSortLesson } from "@/content/sorting/merge";
import { heapSortLesson } from "@/content/sorting/heap-sort";
import { linearLesson } from "@/content/searching/linear";
import { binaryLesson } from "@/content/searching/binary";
import { binaryAnswerLesson } from "@/content/searching/binary-answer";
import { twoPointersLesson } from "@/content/searching/two-pointers";
import { slidingLesson } from "@/content/searching/sliding";
import { subsetsLesson } from "@/content/backtracking/subsets";
import { gridLesson } from "@/content/graph/grid";
import { cycleLesson } from "@/content/graph/cycle";
import { dp1dLesson } from "@/content/dp/dp-1d";
import { knapsackLesson } from "@/content/dp/knapsack";
import { unboundedLesson } from "@/content/dp/unbounded";
import { lisLesson } from "@/content/dp/lis";
import { countingBitsLesson } from "@/content/bits/counting-bits";
import { gcdLesson } from "@/content/math/gcd";

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
  "tree/binary-tree": binaryTreeLesson,
  "tree/traversal": traversalLesson,
  "tree/bst": bstLesson,
  "tree/balanced": balancedLesson,
  "tree/trie": trieLesson,
  "tree/segment": segmentLesson,
  "tree/fenwick": fenwickLesson,
  "graph-ds/adjacency": adjacencyLesson,
  "graph-ds/union-find": unionFindLesson,
  "sorting/bubble": bubbleLesson,
  "sorting/selection": selectionLesson,
  "sorting/merge": mergeSortLesson,
  "sorting/heap-sort": heapSortLesson,
  "searching/linear": linearLesson,
  "searching/binary": binaryLesson,
  "searching/binary-answer": binaryAnswerLesson,
  "searching/two-pointers": twoPointersLesson,
  "searching/sliding": slidingLesson,
  "backtracking/subsets": subsetsLesson,
  "graph/bfs": bfsLesson,
  "graph/dfs": dfsLesson,
  "graph/grid": gridLesson,
  "graph/cycle": cycleLesson,
  "dp/dp-1d": dp1dLesson,
  "dp/knapsack": knapsackLesson,
  "dp/unbounded": unboundedLesson,
  "dp/lis": lisLesson,
  "bits/counting-bits": countingBitsLesson,
  "math/gcd": gcdLesson,
};
