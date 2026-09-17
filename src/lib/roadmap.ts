import { TOPICS, getSubtopic, type Subtopic, type Topic } from "./topics";
import { getSubtopicBy } from "./topics-text";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

export interface RoadmapNode {
  id: string;
  label: string;
  zh: string;
  /** 在路線圖上的位置（SVG 座標） */
  x: number;
  y: number;
  /** 這個節點包含的課程，格式 topic/sub，依建議順序排列 */
  lessons: string[];
}

/** [前置節點, 後續節點] */
export type RoadmapEdge = [string, string];

export const NODE_W = 176;
export const NODE_H = 56;
export const CANVAS_W = 1000;
export const CANVAS_H = 920;

/** 節點：把細項依「概念上一起學」分組。每篇課程必須恰好出現在一個節點。 */
export const ROADMAP_NODES: RoadmapNode[] = [
  { id: "foundations",   label: "Foundations",            zh: "複雜度與遞迴",  x: 500, y: 45,  lessons: ["foundations/big-o", "foundations/recursion", "foundations/amortized"] },
  { id: "arrays",        label: "Arrays & Hashing",       zh: "陣列與雜湊",    x: 500, y: 145, lessons: ["arrays/array", "arrays/prefix-sum", "arrays/hash-table", "arrays/hash-map-apps", "arrays/matrix"] },

  { id: "two-pointers",  label: "Two Pointers",           zh: "雙指標",        x: 300, y: 245, lessons: ["searching/two-pointers"] },
  { id: "stack",         label: "Stack & Queue",          zh: "堆疊與佇列",    x: 500, y: 245, lessons: ["stack-queue/stack", "stack-queue/queue", "stack-queue/monotonic-stack", "stack-queue/monotonic-queue"] },
  { id: "sorting",       label: "Sorting",                zh: "排序",          x: 700, y: 245, lessons: ["sorting/bubble", "sorting/selection", "sorting/insertion", "sorting/merge", "sorting/quick", "sorting/heap-sort", "sorting/counting", "sorting/radix", "sorting/lower-bound"] },

  { id: "binary-search", label: "Binary Search",          zh: "搜尋",          x: 160, y: 345, lessons: ["searching/linear", "searching/binary", "searching/binary-answer"] },
  { id: "sliding-window",label: "Sliding Window",         zh: "滑動視窗",      x: 360, y: 345, lessons: ["searching/sliding"] },
  { id: "linked-list",   label: "Linked List",            zh: "鏈結串列",      x: 560, y: 345, lessons: ["linked-list/singly", "linked-list/doubly", "linked-list/reverse", "linked-list/fast-slow", "linked-list/merge-lists"] },
  { id: "divide",        label: "Divide & Conquer",       zh: "分治",          x: 780, y: 345, lessons: ["divide-conquer/master", "divide-conquer/max-subarray", "divide-conquer/fast-pow", "divide-conquer/inversions"] },

  { id: "trees",         label: "Trees",                  zh: "樹",            x: 440, y: 445, lessons: ["tree/binary-tree", "tree/traversal", "tree/bst", "tree/balanced"] },

  { id: "tries",         label: "Tries",                  zh: "字典樹",        x: 160, y: 545, lessons: ["tree/trie", "string/trie-apps"] },
  { id: "heap",          label: "Heap / Priority Queue",  zh: "堆積",          x: 360, y: 545, lessons: ["heap/binary-heap", "heap/top-k", "heap/two-heaps"] },
  { id: "backtracking",  label: "Backtracking",           zh: "遞迴與回溯",    x: 600, y: 545, lessons: ["backtracking/subsets", "backtracking/permutations", "backtracking/combinations", "backtracking/n-queens", "backtracking/word-search"] },
  { id: "range-trees",   label: "Segment & Fenwick Tree", zh: "區間查詢結構",  x: 840, y: 545, lessons: ["tree/segment", "tree/fenwick"] },

  { id: "strings",       label: "Strings",                zh: "字串演算法",    x: 160, y: 645, lessons: ["string/hashing", "string/rabin-karp", "string/kmp", "string/z-algo", "string/manacher"] },
  { id: "greedy",        label: "Greedy",                 zh: "貪婪法",        x: 360, y: 645, lessons: ["greedy/principles", "greedy/coin", "greedy/interval", "greedy/jump", "greedy/huffman"] },
  { id: "graphs",        label: "Graphs",                 zh: "圖的表示與走訪", x: 600, y: 645, lessons: ["graph-ds/adjacency", "graph/bfs", "graph/dfs", "graph/grid", "graph/cycle", "graph/topo", "graph/bipartite", "graph-ds/union-find"] },
  { id: "dp1",           label: "1-D Dynamic Programming", zh: "一維動態規劃", x: 840, y: 645, lessons: ["dp/memo", "dp/dp-1d", "dp/knapsack", "dp/unbounded", "dp/lis"] },

  { id: "adv-graphs",    label: "Advanced Graphs",        zh: "最短路徑與生成樹", x: 480, y: 745, lessons: ["graph/dijkstra", "graph/bellman-ford", "graph/floyd", "graph/dag-shortest", "graph/mst"] },
  { id: "dp2",           label: "2-D Dynamic Programming", zh: "二維與進階 DP", x: 720, y: 745, lessons: ["dp/lcs", "dp/edit-distance", "dp/grid-dp", "dp/interval-dp", "dp/bitmask-dp", "dp/tree-dp"] },
  { id: "bits",          label: "Bit Manipulation",       zh: "位元運算",      x: 920, y: 745, lessons: ["bits/basics", "bits/xor", "bits/counting-bits", "bits/subset-enum"] },

  { id: "math",          label: "Math & Number Theory",   zh: "數學與數論",    x: 820, y: 845, lessons: ["math/gcd", "math/sieve", "math/modular", "math/combinatorics"] },
];

/**
 * 其他語言的節點副標。跟 topics-text 一樣，欄位名沿用 `zh`，語意上是
 * 「顯示在英文名旁邊的本地化副標」。漏掉任何節點會被 validateRoadmap 抓到。
 */
const NODE_SUBTITLES: Partial<Record<Locale, Record<string, string>>> = {
  en: {
    foundations: "Complexity and recursion",
    arrays: "Access by index and by key",
    "two-pointers": "Two indices, one pass",
    stack: "LIFO, FIFO and monotonic variants",
    sorting: "Comparison and counting sorts",
    "binary-search": "Linear and binary search",
    "sliding-window": "A moving range over a sequence",
    "linked-list": "Nodes joined by pointers",
    divide: "Split, solve, combine",
    trees: "Binary trees and BSTs",
    tries: "Prefix trees",
    heap: "Always know the smallest",
    backtracking: "Try, undo, try again",
    "range-trees": "Range query structures",
    strings: "String matching algorithms",
    greedy: "Take the best choice now",
    graphs: "Representing and traversing graphs",
    dp1: "DP over a single index",
    "adv-graphs": "Shortest paths and spanning trees",
    dp2: "Two-dimensional and advanced DP",
    bits: "Working with bits directly",
    math: "GCD, primes and modular arithmetic",
  },
};

/** 依語言取得節點。原文語言直接回傳 ROADMAP_NODES，其他語言換掉副標。 */
export function getRoadmapNodes(locale: Locale): RoadmapNode[] {
  const o = NODE_SUBTITLES[locale];
  return o ? ROADMAP_NODES.map((n) => ({ ...n, zh: o[n.id] ?? n.zh })) : ROADMAP_NODES;
}

export const ROADMAP_EDGES: RoadmapEdge[] = [
  ["foundations", "arrays"],
  ["arrays", "two-pointers"],
  ["arrays", "stack"],
  ["arrays", "sorting"],
  ["two-pointers", "binary-search"],
  ["two-pointers", "sliding-window"],
  ["stack", "linked-list"],
  ["sorting", "binary-search"],
  ["sorting", "divide"],
  ["binary-search", "trees"],
  ["sliding-window", "trees"],
  ["linked-list", "trees"],
  ["divide", "range-trees"],
  ["trees", "tries"],
  ["trees", "heap"],
  ["trees", "backtracking"],
  ["trees", "range-trees"],
  ["tries", "strings"],
  ["sliding-window", "strings"],
  ["heap", "greedy"],
  ["heap", "adv-graphs"],
  ["backtracking", "graphs"],
  ["backtracking", "dp1"],
  ["greedy", "dp1"],
  ["graphs", "adv-graphs"],
  ["graphs", "dp2"],
  ["dp1", "dp2"],
  ["dp1", "bits"],
  ["dp2", "math"],
  ["bits", "math"],
];

export interface RoadmapLesson {
  key: string;
  topic: Topic;
  sub: Subtopic;
}

/** 把 topic/sub 字串解析成實際資料；指到不存在的課程會直接丟錯。 */
export function resolveLessons(keys: string[], locale: Locale = DEFAULT_LOCALE): RoadmapLesson[] {
  return keys.map((key) => {
    const [t, s] = key.split("/");
    const hit = getSubtopicBy(locale, t, s);
    if (!hit) throw new Error(`Roadmap 指到不存在的課程：${key}`);
    return { key, topic: hit.topic, sub: hit.sub };
  });
}

/** 依拓撲順序（依 y 再依 x）攤平所有課程，用來找「建議下一步」。 */
export function roadmapOrder(locale: Locale = DEFAULT_LOCALE): RoadmapLesson[] {
  return [...ROADMAP_NODES]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .flatMap((n) => resolveLessons(n.lessons, locale));
}

/** 開發時檢查：每篇課程都要恰好出現在一個節點、每條邊都指到存在的節點。 */
export function validateRoadmap() {
  const seen = new Map<string, number>();
  ROADMAP_NODES.forEach((n) => n.lessons.forEach((k) => seen.set(k, (seen.get(k) ?? 0) + 1)));
  const problems: string[] = [];
  TOPICS.forEach((t) =>
    t.subs.forEach((s) => {
      const c = seen.get(`${t.id}/${s.id}`) ?? 0;
      if (c === 0) problems.push(`缺少：${t.id}/${s.id}`);
      if (c > 1) problems.push(`重複：${t.id}/${s.id}`);
    }),
  );
  seen.forEach((_, k) => {
    const [t, s] = k.split("/");
    if (!getSubtopic(t, s)) problems.push(`不存在：${k}`);
  });
  const ids = new Set(ROADMAP_NODES.map((n) => n.id));
  ROADMAP_EDGES.forEach(([a, b]) => {
    if (!ids.has(a) || !ids.has(b)) problems.push(`邊指到不存在的節點：${a} → ${b}`);
  });
  Object.entries(NODE_SUBTITLES).forEach(([locale, subtitles]) => {
    ids.forEach((id) => {
      if (!subtitles[id]) problems.push(`${locale} 缺少節點副標：${id}`);
    });
    Object.keys(subtitles).forEach((id) => {
      if (!ids.has(id)) problems.push(`${locale} 有多餘的節點副標：${id}`);
    });
  });
  return problems;
}
