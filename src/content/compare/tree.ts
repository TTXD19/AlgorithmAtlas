import type { Comparison } from "@/lib/compare";

export const tree: Comparison = {
  title: { "zh-Hant": "樹狀資料結構比較", en: "Tree data structures compared" },
  description: {
    "zh-Hant": "BST、平衡樹、字典樹、線段樹、Fenwick 樹：各自支援哪些操作、能不能改、什麼問題該用哪一棵。",
    en: "BST, balanced BST, trie, segment tree and Fenwick tree: the operations each supports, whether it handles updates, and which problem calls for which tree.",
  },
  columns: [
    { key: "keyed", label: { "zh-Hant": "鍵", en: "Keyed by" } },
    { key: "ops", label: { "zh-Hant": "核心操作", en: "Core operations" } },
    { key: "update", label: { "zh-Hant": "可修改", en: "Updates" } },
  ],
  rows: [
    {
      sub: "bst",
      cells: {
        keyed: { "zh-Hant": "可比較的值", en: "Comparable values" },
        ops: { "zh-Hant": "查、插、刪、前驅後繼", en: "Search, insert, delete, predecessor / successor" },
        update: "✓",
      },
      pick: { "zh-Hant": "教學與面試：理解「有序 + 動態」怎麼做到 O(h)。實務上不會自己寫不平衡的 BST。", en: "Teaching and interviews: how 'ordered and dynamic' reaches O(h). In practice nobody hand-writes an unbalanced BST." },
    },
    {
      sub: "balanced",
      cells: {
        keyed: { "zh-Hant": "可比較的值", en: "Comparable values" },
        ops: { "zh-Hant": "BST 全部，保證 O(log n)；範圍查詢、第 k 小", en: "Everything a BST does at guaranteed O(log n); range queries, k-th smallest" },
        update: "✓",
      },
      pick: { "zh-Hant": "需要「有序集合」而且會一直增刪：C++ `map`／`set`、Java `TreeMap`。雜湊表做不到「比 k 大的最小值」時就是它。", en: "You need an ordered set that keeps changing: C++ `map` / `set`, Java `TreeMap`. When a hash table cannot answer 'smallest value above k', this can." },
    },
    {
      sub: "trie",
      cells: {
        keyed: { "zh-Hant": "字串的每個字元", en: "Characters of a string" },
        ops: { "zh-Hant": "插入、查詞、查前綴", en: "Insert, lookup, prefix lookup" },
        update: "✓",
      },
      pick: { "zh-Hant": "前綴才是重點：自動補全、以前綴計數、最長公共前綴、位元字典樹求最大 XOR。", en: "When prefixes are the point: autocomplete, counting by prefix, longest common prefix, a bitwise trie for maximum XOR." },
    },
    {
      sub: "segment",
      cells: {
        keyed: { "zh-Hant": "陣列索引", en: "Array index" },
        ops: { "zh-Hant": "區間查詢（和、最大、最小、任何可合併的）、單點或區間更新", en: "Range query (sum, max, min, anything mergeable), point or range update" },
        update: "✓",
      },
      pick: { "zh-Hant": "區間查詢 + 更新，而且查的不只是和（最大值、GCD、區間賦值需要懶標記）。功能最全、程式最長。", en: "Range queries plus updates where the query is more than a sum (max, GCD, range assignment with lazy propagation). The most capable and the most code." },
    },
    {
      sub: "fenwick",
      cells: {
        keyed: { "zh-Hant": "陣列索引", en: "Array index" },
        ops: { "zh-Hant": "前綴和、單點更新", en: "Prefix sum, point update" },
        update: "✓",
      },
      pick: { "zh-Hant": "區間和 + 單點更新，只要這兩樣：十行寫完、常數比線段樹小。逆序對計數、動態排名的首選。", en: "Range sum plus point update and nothing else: ten lines, smaller constants than a segment tree. First choice for inversion counting and dynamic ranking." },
    },
  ],
  guide: [
    { "zh-Hant": "**有序 + 動態增刪** → 平衡樹（用內建的）。**只查在不在** → 雜湊表更快。**資料不變** → 排序陣列 + 二分就夠。", en: "**Ordered and changing** → a balanced tree (use the built-in one). **Only membership** → a hash table is faster. **Static data** → a sorted array with binary search is enough." },
    { "zh-Hant": "**區間和、資料不變** → 前綴和（O(1) 查）。**區間和、會改** → Fenwick。**區間最大／最小、會改** → 線段樹。", en: "**Range sums, static** → prefix sums (O(1) query). **Range sums, with updates** → Fenwick. **Range max / min with updates** → segment tree." },
    { "zh-Hant": "**區間更新**（整段加值、整段賦值）→ 線段樹加懶標記。Fenwick 只能做「區間加、單點查」這一種變形。", en: "**Range updates** (add to or assign a whole range) → segment tree with lazy propagation. Fenwick only manages the 'range add, point query' variant." },
    { "zh-Hant": "**鍵是字串且問前綴** → 字典樹。鍵是字串但只問相等 → 雜湊表，字典樹沒有優勢。", en: "**String keys and prefix questions** → a trie. String keys but only equality → a hash table; a trie has no edge." },
    { "zh-Hant": "**第 k 小、排名** → 平衡樹（帶子樹大小）或值域上的 Fenwick 樹，後者在值域可離散化時更好寫。", en: "**k-th smallest, ranks** → a balanced tree with subtree sizes, or a Fenwick tree over the value domain, which is easier to write once values are compressed." },
  ],
};
