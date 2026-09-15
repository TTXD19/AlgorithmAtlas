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
import { trieAppsLesson } from "@/content/string/trie-apps";
import { mstLesson } from "@/content/graph/mst";
import { dagShortestLesson } from "@/content/graph/dag-shortest";
import { floydLesson } from "@/content/graph/floyd";
import { combinatoricsLesson } from "@/content/math/combinatorics";
import { modularLesson } from "@/content/math/modular";
import { sieveLesson } from "@/content/math/sieve";
import { manacherLesson } from "@/content/string/manacher";
import { zAlgoLesson } from "@/content/string/z-algo";
import { kmpLesson } from "@/content/string/kmp";
import { rabinKarpLesson } from "@/content/string/rabin-karp";
import { stringHashingLesson } from "@/content/string/hashing";
import { bitmaskDpLesson } from "@/content/dp/bitmask-dp";
import { treeDpLesson } from "@/content/dp/tree-dp";
import { gridDpLesson } from "@/content/dp/grid-dp";
import { intervalDpLesson } from "@/content/dp/interval-dp";
import { lcsLesson } from "@/content/dp/lcs";
import { editDistanceLesson } from "@/content/dp/edit-distance";
import { bellmanFordLesson } from "@/content/graph/bellman-ford";
import { fastPowLesson } from "@/content/divide-conquer/fast-pow";
import { inversionsLesson } from "@/content/divide-conquer/inversions";
import { countingSortLesson } from "@/content/sorting/counting";
import { radixLesson } from "@/content/sorting/radix";
import { lowerBoundLesson } from "@/content/sorting/lower-bound";
import { maxSubarrayLesson } from "@/content/divide-conquer/max-subarray";
import { intervalLesson } from "@/content/greedy/interval";
import { jumpLesson } from "@/content/greedy/jump";
import { huffmanLesson } from "@/content/greedy/huffman";
import { subsetEnumLesson } from "@/content/bits/subset-enum";
import { permutationsLesson } from "@/content/backtracking/permutations";
import { combinationsLesson } from "@/content/backtracking/combinations";
import { nQueensLesson } from "@/content/backtracking/n-queens";
import { wordSearchLesson } from "@/content/backtracking/word-search";
import { masterLesson } from "@/content/divide-conquer/master";
import { principlesLesson } from "@/content/greedy/principles";
import { coinLesson } from "@/content/greedy/coin";
import { bitsBasicsLesson } from "@/content/bits/basics";
import { xorLesson } from "@/content/bits/xor";
import { memoLesson } from "@/content/dp/memo";
import { topoLesson } from "@/content/graph/topo";
import { bipartiteLesson } from "@/content/graph/bipartite";
import { dijkstraLesson } from "@/content/graph/dijkstra";
import { insertionLesson } from "@/content/sorting/insertion";
import { quickSortLesson } from "@/content/sorting/quick";
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
  "sorting/insertion": insertionLesson,
  "sorting/quick": quickSortLesson,
  "backtracking/permutations": permutationsLesson,
  "backtracking/combinations": combinationsLesson,
  "backtracking/n-queens": nQueensLesson,
  "backtracking/word-search": wordSearchLesson,
  "divide-conquer/master": masterLesson,
  "greedy/principles": principlesLesson,
  "greedy/coin": coinLesson,
  "divide-conquer/max-subarray": maxSubarrayLesson,
  "greedy/interval": intervalLesson,
  "greedy/jump": jumpLesson,
  "greedy/huffman": huffmanLesson,
  "sorting/counting": countingSortLesson,
  "sorting/radix": radixLesson,
  "sorting/lower-bound": lowerBoundLesson,
  "divide-conquer/fast-pow": fastPowLesson,
  "divide-conquer/inversions": inversionsLesson,
  "graph/bfs": bfsLesson,
  "graph/dfs": dfsLesson,
  "string/trie-apps": trieAppsLesson,
  "graph/mst": mstLesson,
  "graph/dag-shortest": dagShortestLesson,
  "graph/floyd": floydLesson,
  "math/combinatorics": combinatoricsLesson,
  "math/modular": modularLesson,
  "math/sieve": sieveLesson,
  "string/manacher": manacherLesson,
  "string/z-algo": zAlgoLesson,
  "string/kmp": kmpLesson,
  "string/rabin-karp": rabinKarpLesson,
  "string/hashing": stringHashingLesson,
  "dp/bitmask-dp": bitmaskDpLesson,
  "dp/tree-dp": treeDpLesson,
  "dp/grid-dp": gridDpLesson,
  "dp/interval-dp": intervalDpLesson,
  "dp/lcs": lcsLesson,
  "dp/edit-distance": editDistanceLesson,
  "graph/bellman-ford": bellmanFordLesson,
  "bits/subset-enum": subsetEnumLesson,
  "bits/basics": bitsBasicsLesson,
  "bits/xor": xorLesson,
  "dp/memo": memoLesson,
  "graph/topo": topoLesson,
  "graph/bipartite": bipartiteLesson,
  "graph/dijkstra": dijkstraLesson,
  "graph/grid": gridLesson,
  "graph/cycle": cycleLesson,
  "dp/dp-1d": dp1dLesson,
  "dp/knapsack": knapsackLesson,
  "dp/unbounded": unboundedLesson,
  "dp/lis": lisLesson,
  "bits/counting-bits": countingBitsLesson,
  "math/gcd": gcdLesson,
};
