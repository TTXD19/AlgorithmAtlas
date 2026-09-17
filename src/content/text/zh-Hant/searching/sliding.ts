import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Two Pointers、Hash Table",
  applications: [
    {
      title: "監控系統的「過去 5 分鐘平均延遲」",
      problem: "延遲資料每秒進來，儀表板每秒要更新「過去 300 秒的平均」。每秒重新加總 300 筆，資料量一大就跟不上。",
      why: "視窗每秒只變動兩筆：新的一筆進來、最舊的一筆出去。維護一個總和，加一筆減一筆就是新的平均，每秒 O(1)。這是固定長度的滑動視窗。",
    },
    {
      title: "API 限流：每 10 秒最多 100 次",
      problem: "每個請求進來要判斷「這個用戶過去 10 秒內是否已經打了 100 次」。存所有歷史再每次過濾，太慢也太占空間。",
      why: "只保留視窗內的請求時間戳，新請求進來時先把左端過期的丟掉，再看剩多少。每個時間戳進一次、出一次，攤銷 O(1)。視窗的時間跨度固定，但裡面有幾筆請求不固定，所以要用佇列而不是固定大小的陣列。",
    },
    {
      title: "最長不重複子字串、最短滿足條件的子陣列",
      problem: "字串裡最長的一段沒有重複字元；或陣列裡和至少為 S 的最短一段。暴力枚舉所有區間是 O(n²) 甚至 O(n³)。",
      why: "右端往右擴、條件被破壞時左端往右縮，兩端都只往右走。每個元素進出視窗各一次，O(n)。認出「連續區間」加「單調的合法性」，就是可變視窗。",
    },
  ],
  cue: "連續子陣列／子字串、過去 k 個、過去 t 秒、最長／最短滿足條件的區間、串流統計、限流、加一個減一個。",
  steps: [
    "確認問的是**連續**區間，且合法性對區間的伸縮是單調的（求最長：縮小仍合法；求最短：放大仍合法）。決定視窗上要維護什麼統計量，必須能 O(1) 加入與移除。",
    "`l = 0`，統計量清空。`for r in range(n)`：把 `a[r]` 加進統計量。",
    "`while 視窗不合法`：把 `a[l]` 從統計量移除，`l += 1`。這個內層迴圈總共最多跑 n 次，不是每步 n 次。",
    "視窗現在合法，用 `r − l + 1` 更新答案（最長）。找最短時把更新放在縮的迴圈裡，條件改成「合法時縮」。",
    "固定長度時省掉合法性判斷：`r ≥ k` 後每步移除 `a[r − k]`，視窗長度恆為 k。",
  ],
  demoNote:
    "最長不重複子字串。藍色格子是目前視窗，下方是視窗裡的字元集合。r 指到一個已經在集合裡的字元（黃色）時，它先不加入，l 往右縮到那個字元離開為止，再把它加進來。綠線是目前最佳區間。",
  codeNote:
    "四段：可變視窗的最長不重複子字串、固定視窗的最大平均、找最短區間的可變視窗，以及用佇列當視窗的限流器。留意最長和最短兩種可變視窗，更新答案的位置不同。",
  problems: [
    { src: "LeetCode 3", name: "Longest Substring Without Repeating Characters", diff: "Medium" },
    { src: "LeetCode 643", name: "Maximum Average Subarray I（固定視窗）", diff: "Easy" },
    { src: "LeetCode 209", name: "Minimum Size Subarray Sum（最短合法區間）", diff: "Medium" },
    { src: "LeetCode 424", name: "Longest Repeating Character Replacement", diff: "Medium" },
    { src: "LeetCode 567", name: "Permutation in String（固定視窗 + 計數）", diff: "Medium" },
    { src: "LeetCode 76", name: "Minimum Window Substring", diff: "Hard" },
  ],
};
