import type { Comparison } from "@/lib/compare";

export const searching: Comparison = {
  title: { "zh-Hant": "搜尋與雙指標技巧比較", en: "Search and two-pointer techniques compared" },
  description: {
    "zh-Hant": "線性搜尋、二分搜尋、對答案二分、雙指標、滑動視窗：各自要求什麼前提、解決哪種問題。",
    en: "Linear search, binary search, binary search on the answer, two pointers and sliding window: what each one requires and which problem shape it solves.",
  },
  columns: [
    { key: "needs", label: { "zh-Hant": "前提", en: "Requires" } },
    { key: "answers", label: { "zh-Hant": "回答的問題", en: "Answers" } },
  ],
  rows: [
    {
      sub: "linear",
      cells: {
        needs: { "zh-Hant": "沒有", en: "Nothing" },
        answers: { "zh-Hant": "x 在不在、在哪", en: "Is x here, and where" },
      },
      pick: { "zh-Hant": "資料無序、只查一次、或 n 很小。查很多次就先排序或改用雜湊表。", en: "Unsorted data, a single query, or tiny n. For repeated queries sort first or switch to a hash table." },
    },
    {
      sub: "binary",
      cells: {
        needs: { "zh-Hant": "已排序、可隨機存取", en: "Sorted, random access" },
        answers: { "zh-Hant": "x 的位置、第一個 ≥ x 的位置", en: "Position of x, first position ≥ x" },
      },
      pick: { "zh-Hant": "排好序的陣列上找值或找邊界（lower_bound）。鏈結串列不行，沒有 O(1) 的中點。", en: "Finding a value or a boundary (lower_bound) in a sorted array. Not on linked lists — there is no O(1) middle." },
    },
    {
      sub: "binary-answer",
      cells: {
        needs: { "zh-Hant": "答案具單調性", en: "Monotonic answer" },
        answers: { "zh-Hant": "最小可行值／最大可行值", en: "Smallest or largest feasible value" },
      },
      pick: { "zh-Hant": "題目問「最小的 x 使得…成立」，而且 x 越大越容易成立（或越難）。把判定寫成 check(x)，對 x 二分。", en: "The question is 'the smallest x such that …' and feasibility is monotonic in x. Write check(x) and binary search over x." },
    },
    {
      sub: "two-pointers",
      cells: {
        needs: { "zh-Hant": "已排序，或兩端可收斂", en: "Sorted, or ends that converge" },
        answers: { "zh-Hant": "配對、去重、分割", en: "Pairs, dedupe, partition" },
      },
      pick: { "zh-Hant": "有序陣列找和為 k 的兩數、原地去重、把陣列分成兩類。指標各自單向移動，總共 O(n)。", en: "Pair with sum k in a sorted array, in-place dedupe, partitioning into two classes. Each pointer moves one way, O(n) total." },
    },
    {
      sub: "sliding",
      cells: {
        needs: { "zh-Hant": "連續區間、可增量維護", en: "Contiguous range, incrementally maintainable" },
        answers: { "zh-Hant": "最長／最短／計數的子陣列", en: "Longest, shortest or count of subarrays" },
      },
      pick: { "zh-Hant": "「連續子陣列／子字串」滿足某條件的最長或最短。右端擴張、左端收縮，區間狀態能 O(1) 增減。", en: "Longest or shortest contiguous subarray or substring meeting a condition. Right end grows, left end shrinks, and the window state updates in O(1)." },
    },
  ],
  guide: [
    { "zh-Hant": "**有序 + 找一個值或邊界** → 二分搜尋。**有序 + 找一對** → 雙指標。", en: "**Sorted + one value or boundary** → binary search. **Sorted + a pair** → two pointers." },
    { "zh-Hant": "**「連續」兩個字出現** → 滑動視窗。子序列（不連續）不是視窗，通常是 DP。", en: "**The word 'contiguous' appears** → sliding window. A subsequence (non-contiguous) is not a window; it is usually DP." },
    { "zh-Hant": "**問最小／最大的可行值，而不是位置** → 對答案二分。關鍵字：「最少需要多少」「最大能到多少」「最小化最大值」。", en: "**Asks for the smallest or largest feasible value, not a position** → binary search on the answer. Cues: 'minimum needed', 'maximum achievable', 'minimise the maximum'." },
    { "zh-Hant": "**視窗內的條件無法 O(1) 更新**（例如視窗中位數）→ 滑動視窗不夠，要配單調佇列、平衡樹或兩個堆積。", en: "**The window condition cannot be updated in O(1)** (window median, say) → sliding window alone is not enough; add a monotonic deque, a balanced tree or two heaps." },
    { "zh-Hant": "**無序又要常查** → 不是搜尋演算法的問題，先排序（O(n log n) 一次）或改用雜湊表（O(1) 每次）。", en: "**Unsorted but queried often** → not a search-algorithm problem: sort once (O(n log n)) or use a hash table (O(1) per query)." },
  ],
};
