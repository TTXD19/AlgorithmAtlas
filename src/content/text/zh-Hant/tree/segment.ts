import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion、Prefix Sum、Binary Tree Basics",
  applications: [
    {
      title: "即時排行榜的區間統計",
      problem: "十萬個玩家的分數不斷變動，同時要一直回答「第 1000 到 2000 名的總分」「這個區段的最高分」。前綴和查得快但更新要 O(n)，直接算則查詢要 O(n)。",
      why: "線段樹把陣列切成一層層的區間，每個節點存那段的總和（或最大值）。查詢只要拼幾個現成的區間，更新只要沿一條路徑改，兩者都是 O(log n)。",
    },
    {
      title: "監控系統的時間窗查詢",
      problem: "每秒一個延遲數字，要問「任意時段的最大延遲」，資料還在持續進來。",
      why: "把「和」換成「最大值」就是同一棵樹，程式碼只改三個運算子。任何有結合律的運算（和、最大、最小、GCD）都能用線段樹做區間查詢。",
    },
    {
      title: "計算幾何與掃描線",
      problem: "很多矩形疊在一起要算聯集面積，或一堆線段問哪些互相相交。",
      why: "掃描線從左掃到右，用線段樹維護「目前被覆蓋的 y 區間」。這需要區間更新，會用到懶標記，是線段樹的進階用法。",
    },
  ],
  cue: "區間和／區間最大值、同時要查詢又要更新、O(n) 太慢、有結合律的運算、掃描線。",
  steps: [
    "決定每個節點存什麼（和、最大值……）與「空區間」的值（0、−∞……）。開 `tree = [0] * (4n)`。",
    "**build(node, lo, hi)**：lo == hi 就填入 a[lo]；否則切半遞迴，最後 `tree[node] = 合併(左, 右)`。",
    "**query(node, lo, hi, ql, qh)**：不相交回傳空值；完全包含回傳 `tree[node]`；否則合併左右子節點的查詢結果。",
    "**update(node, lo, hi, i, v)**：走到葉改值，回頭沿路重算祖先。",
    "要區間更新就加懶標記：每個節點多一個 `lazy`，進入子節點前先把標記推下去。",
  ],
  demoNote: "八個元素的區間和。查 [2, 5] 時注意哪些節點被直接採用（綠）、哪些被跳過（灰）、哪些要往下分。接著把索引 3 加 4，看一條路徑上的祖先怎麼被更新。",
  codeNote: "區間和加單點更新的完整實作，用 1-indexed 的堆式陣列存節點。最後一行提醒換成最大值只要改三個地方。",
  problems: [
    { src: "LeetCode 307", name: "Range Sum Query - Mutable", diff: "Medium" },
    { src: "LeetCode 315", name: "Count of Smaller Numbers After Self", diff: "Hard" },
    { src: "LeetCode 2407", name: "Longest Increasing Subsequence II（區間最大值）", diff: "Hard" },
    { src: "LeetCode 218", name: "The Skyline Problem（掃描線思維）", diff: "Hard" },
    { src: "LeetCode 850", name: "Rectangle Area II（掃描線 + 區間覆蓋）", diff: "Hard" },
  ],
};
