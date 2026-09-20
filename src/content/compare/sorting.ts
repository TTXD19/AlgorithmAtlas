import type { Comparison } from "@/lib/compare";

export const sorting: Comparison = {
  title: { "zh-Hant": "排序演算法比較", en: "Sorting algorithms compared" },
  description: {
    "zh-Hant": "八種排序演算法的時間、空間、穩定性、是否原地，以及最重要的：什麼情況該選哪一個。",
    en: "Eight sorting algorithms side by side: time, space, stability, in-place or not, and, most importantly, when to reach for which.",
  },
  columns: [
    { key: "best", label: { "zh-Hant": "最好", en: "Best" } },
    { key: "worst", label: { "zh-Hant": "最壞", en: "Worst" } },
    { key: "stable", label: { "zh-Hant": "穩定", en: "Stable" } },
    { key: "inplace", label: { "zh-Hant": "原地", en: "In place" } },
  ],
  rows: [
    {
      sub: "bubble",
      cells: { best: "O(n)", worst: "O(n²)", stable: "✓", inplace: "✓" },
      pick: { "zh-Hant": "教學、資料只有幾十筆、或想順便數逆序對。實務上幾乎不選。", en: "Teaching, a few dozen items, or counting inversions on the side. Almost never in production." },
    },
    {
      sub: "selection",
      cells: { best: "O(n²)", worst: "O(n²)", stable: "✗", inplace: "✓" },
      pick: { "zh-Hant": "寫入很貴（EEPROM、flash）：交換次數最多 n−1 次，是所有排序裡最少的。", en: "When writes are expensive (EEPROM, flash): at most n−1 swaps, the fewest of any sort." },
    },
    {
      sub: "insertion",
      cells: { best: "O(n)", worst: "O(n²)", stable: "✓", inplace: "✓" },
      pick: { "zh-Hant": "資料幾乎有序、或很小（n < 16）。快速排序與 Timsort 的小段落都交給它收尾。", en: "Nearly sorted or tiny input (n < 16). Quicksort and Timsort hand their small runs to it." },
    },
    {
      sub: "merge",
      cells: { best: "O(n log n)", worst: "O(n log n)", stable: "✓", inplace: "✗" },
      pick: { "zh-Hant": "需要穩定、需要最壞情況保證、或資料放不進記憶體（外部排序）、鏈結串列。", en: "You need stability, a worst-case guarantee, external sorting of data that does not fit in memory, or a linked list." },
    },
    {
      sub: "quick",
      cells: { best: "O(n log n)", worst: "O(n²)", stable: "✗", inplace: "✓" },
      pick: { "zh-Hant": "一般用途的預設：常數最小、cache 友善。記得隨機選 pivot 避免最壞情況。", en: "The general-purpose default: smallest constants, cache friendly. Randomise the pivot to dodge the worst case." },
    },
    {
      sub: "heap-sort",
      cells: { best: "O(n log n)", worst: "O(n log n)", stable: "✗", inplace: "✓" },
      pick: { "zh-Hant": "要 O(n log n) 保證又不能多用記憶體（嵌入式、即時系統）。比快速排序慢 2 到 3 倍。", en: "You need the O(n log n) guarantee with no extra memory (embedded, real-time). Two to three times slower than quicksort in practice." },
    },
    {
      sub: "counting",
      cells: { best: "O(n+k)", worst: "O(n+k)", stable: "✓", inplace: "✗" },
      pick: { "zh-Hant": "鍵是小範圍整數（分數 0–100、字元、年齡）。k 比 n log n 小就贏。", en: "Keys are integers in a small range (scores 0–100, characters, ages). Wins whenever k is smaller than n log n." },
    },
    {
      sub: "radix",
      cells: { best: "O(d·n)", worst: "O(d·n)", stable: "✓", inplace: "✗" },
      pick: { "zh-Hant": "固定位數的整數或字串（電話號碼、ID、日期），n 很大時比 O(n log n) 快。", en: "Fixed-width integers or strings (phone numbers, IDs, dates); beats O(n log n) once n is large." },
    },
  ],
  guide: [
    { "zh-Hant": "**不知道選什麼**：語言內建的 sort。它通常是 Timsort（Python、Java 物件）或 introsort（C++），已經幫你混合了合併、插入、堆積。", en: "**No idea**: the language's built-in sort. It is usually Timsort (Python, Java objects) or introsort (C++), which already blend merge, insertion and heap for you." },
    { "zh-Hant": "**同分要保持原順序**：穩定的那幾個——合併、插入、計數、基數。快速與堆積排序不穩定。", en: "**Ties must keep their order**: the stable ones — merge, insertion, counting, radix. Quick and heap sort are not stable." },
    { "zh-Hant": "**鍵是小整數**：計數排序或基數排序，這是唯一能打破 n log n 下界的方法，因為它們不靠比較。", en: "**Keys are small integers**: counting or radix sort, the only way past the n log n lower bound, because they never compare." },
    { "zh-Hant": "**幾乎已排序**：插入排序 O(n)。氣泡加提前結束也行，但小值在尾端時會退化。", en: "**Nearly sorted**: insertion sort in O(n). Bubble sort with early exit works too, but degrades when a small value sits at the end." },
    { "zh-Hant": "**記憶體很緊**：堆積排序（O(1) 額外空間、保證 n log n）或快速排序（O(log n) 堆疊）。合併排序要多一份 O(n)。", en: "**Memory is tight**: heap sort (O(1) extra, guaranteed n log n) or quicksort (O(log n) stack). Merge sort needs a second O(n) buffer." },
    { "zh-Hant": "**資料放不進記憶體**：合併排序，一次讀一段、排好寫出去、最後多路合併。", en: "**Data does not fit in memory**: merge sort — read a chunk, sort it, write it out, then k-way merge the runs." },
  ],
};
