import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Memoization & Tabulation、1-D DP",
  applications: [
    {
      title: "git diff：這次改了哪幾行",
      problem: "一份 1,200 行的設定檔改了幾處，程式碼審查工具要標出哪些行沒變、哪些行被刪、哪些行是新加的，而且「沒變的行」要盡量多，審查的人才不會被一大片紅綠淹沒。",
      why: "把每一行當成一個元素，兩個版本的最長共同子序列就是「沒變的行」，其餘的在舊版標成刪除、在新版標成新增。git 預設的 Myers 演算法算的正是「只用刪除與新增的最短編輯」，它和 LCS 是同一個問題，只是針對差異很小的情況做了加速。",
    },
    {
      title: "兩段基因序列有多相似",
      problem: "研究人員比對兩個物種同一個基因的片段，各約 1 萬個鹼基（A、C、G、T）。演化過程中有些鹼基被插入或刪除，位置整個錯開，逐格比對會完全失準。",
      why: "LCS 允許中間跳過任意個字，只要求保留下來的字前後順序一致，正好容忍插入與刪除造成的錯位。1 萬 × 1 萬的表是一億格，每格 O(1)。生物資訊裡的 Needleman–Wunsch 全域比對就是在同一張表上，把「相同加一」換成可調的得分與罰分。",
    },
    {
      title: "自動摘要與作業抄襲的相似度分數",
      problem: "系統產生了一段摘要，要和人工寫的參考摘要比較像不像；或者兩份報告各 3,000 字，老師想先篩出疑似抄襲的配對。字的順序被稍微打亂或中間插了幾句，都不該讓分數歸零。",
      why: "LCS 長度除以參考文字的長度，就是摘要評分常用的 ROUGE-L。它只看「依序出現」的共同字詞，不要求連續，所以插幾句話、換個說法，分數只會小幅下降；整段照抄則會非常接近 1。",
    },
  ],
  cue: "兩個序列、共同的部分、保持相對順序但可以不連續、diff、比對、刪除與插入最少、相似度、dp[i][j] 看兩個前綴。",
  steps: [
    "開一張 `(m+1) × (n+1)` 的表 `dp`，第 0 列與第 0 行全部是 0，代表和空序列的 LCS。",
    "i 從 1 到 m、j 從 1 到 n 逐格填：`A[i−1] == B[j−1]` 就 `dp[i][j] = dp[i−1][j−1] + 1`，否則取 `max(dp[i−1][j], dp[i][j−1])`。",
    "右下角 `dp[m][n]` 就是 LCS 的長度。",
    "要還原 LCS：從 `(m, n)` 出發，字相同就收下並往左上走；不同就往 dp 值較大的上方或左方走，平手任選一邊。收下的字反轉就是答案；沿路往上是「刪除 A 的字」、往左是「插入 B 的字」，就是 diff。",
    "只要長度時改成滾動兩列，讓短的序列當列寬，空間降到 `O(min(m, n))`。",
  ],
  demoNote:
    "A = PYTHON、B = TYPHOON，P、Y、T 三個字在兩邊的順序顛倒，所以 LCS 不只一種。先逐列填表：藍色是正在填的格子，黃色是它讀取的格子，字相同時讀左上方，不同時比較上方和左方，格子左上角的小箭頭記下答案從哪裡來（平手固定記 ←）。填完後從右下角回溯，綠框是回溯路徑，實心綠色是屬於 LCS 的字；下方同時長出 diff，綠色是保留、黃色 − 是從 A 刪除、藍色 + 是從 B 插入。這條路走出來的 LCS 是 THON，最後一步會列出平手時改走別的方向能得到的另外兩個，長度一樣是 4。",
  codeNote:
    "Python 放完整的表格、還原 LCS 字串，以及把每一行當成元素的 diff，範例輸出就是 git diff 的樣子。C++ 放需要整張表的字串還原版，和只要長度、滾動兩列的省空間版。兩種語言的回溯在平手時都優先往左，和互動示範得到同一個答案。",
  problems: [
    { src: "LeetCode 1143", name: "Longest Common Subsequence", diff: "Medium" },
    { src: "LeetCode 1035", name: "Uncrossed Lines（連線不交叉就是保持順序，換個包裝的 LCS）", diff: "Medium" },
    { src: "LeetCode 583", name: "Delete Operation for Two Strings（答案是 m + n − 2·LCS）", diff: "Medium" },
    { src: "LeetCode 718", name: "Maximum Length of Repeated Subarray（對照：要求連續就是子字串）", diff: "Medium" },
    { src: "LeetCode 712", name: "Minimum ASCII Delete Sum for Two Strings（把「長度」換成字元值的總和）", diff: "Medium" },
    { src: "LeetCode 1092", name: "Shortest Common Supersequence（先求 LCS 表，再沿路把兩邊的字都放進去）", diff: "Hard" },
  ],
};
