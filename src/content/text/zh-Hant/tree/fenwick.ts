import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Prefix Sum、Bitwise Basics、Segment Tree",
  applications: [
    {
      title: "和線段樹同樣的問題，一半的程式碼",
      problem: "前綴和加單點更新是最常見的動態區間問題。線段樹能做，但要寫 build、query、update 三個遞迴，面試時容易寫錯。",
      why: "樹狀陣列用兩個五行的迴圈解決同樣的問題，記憶體只要 n+1 個格子，常數也更小。只要問題能化成「前綴和」，它就是首選。",
    },
    {
      title: "數逆序對、右邊比我小的有幾個",
      problem: "對每個元素問「它右邊有幾個比它小」。這是評分排名相似度、排序「有多亂」的基本量。暴力 O(n²)。",
      why: "從右往左掃，把看過的值當成計數放進樹狀陣列，每個元素查一次「比我小的值目前有幾個」，就是一個前綴和。O(n log n)。",
    },
    {
      title: "即時排名",
      problem: "遊戲分數不斷更新，要隨時查「分數比 x 低的玩家有幾個」，也就是 x 的排名。",
      why: "以分數為索引、人數為值，排名就是前綴和，分數變動就是一次減一、一次加一。兩種操作都是 O(log n)。",
    },
  ],
  cue: "前綴和但資料會變、逆序對、比我小的有幾個、動態排名、想要比線段樹輕的東西。",
  steps: [
    "索引從 **1** 開始（0 的 lowbit 是 0，會無限迴圈）。開 `tree = [0] * (n + 1)`。",
    "**update(i, delta)**：`while i ≤ n: tree[i] += delta; i += i & −i`。",
    "**prefix(i)**：`s = 0; while i > 0: s += tree[i]; i −= i & −i`。",
    "區間和 [l, r] = `prefix(r) − prefix(l − 1)`。",
    "值域很大時先**離散化**（把值對應到 1..m 的排名），再以排名為索引。逆序對、動態排名都是這樣做。",
  ],
  demoNote:
    "上方的橫條是每個 tree[i] 負責的區間。算 prefix(6) 時看 i 怎麼從 6 跳到 4 再跳到 0；update(3) 時看 i 怎麼從 3 跳到 4 再跳到 8。每一步都顯示二進位與 lowbit。",
  codeNote: "完整實作只有兩個迴圈，加上 O(n) 建樹與逆序對的經典應用。注意離散化那一步。",
  problems: [
    { src: "LeetCode 307", name: "Range Sum Query - Mutable（用樹狀陣列再做一次）", diff: "Medium" },
    { src: "LeetCode 315", name: "Count of Smaller Numbers After Self", diff: "Hard" },
    { src: "LeetCode 493", name: "Reverse Pairs", diff: "Hard" },
    { src: "LeetCode 1409", name: "Queries on a Permutation With Key", diff: "Medium" },
    { src: "LeetCode 2179", name: "Count Good Triplets in an Array", diff: "Hard" },
  ],
};
