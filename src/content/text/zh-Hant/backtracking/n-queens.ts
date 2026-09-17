import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Combinations & Combination Sum、Hash Table",
  applications: [
    {
      title: "自動排課",
      problem: "每門課要選一個時段和教室，同一位老師不能同時上兩門課、同一間教室不能同時有兩班、某些課不能排在同一天。一百多門課，手排要花幾個星期。",
      why: "一次處理一門課，從可用的時段裡挑一個不衝突的，往下排下一門；全部時段都衝突就退回上一門課換一個時段。N 皇后是這種「約束滿足問題」最小的教科書版本：每一列放一個皇后，不能和已放的同欄、同對角線。",
    },
    {
      title: "值班表與座位安排",
      problem: "護理站每天要排三班，每個人有不能值的日子、連續值班的上限、和某些人不能同班的限制。要找出一份滿足所有規則的班表。",
      why: "逐格填、每填一格就檢查所有規則、違反就回頭改上一格，這正是回溯。關鍵在「檢查衝突要快」：N 皇后用三個集合把每次檢查壓到 O(1)，排班則用同樣的思路預先建立每個人、每一天的佔用表。",
    },
    {
      title: "數獨與填字遊戲的求解器",
      problem: "手機上的數獨 app 要能驗證任何一盤有解，還要能給提示。人腦解法是「填一格、看看有沒有矛盾、有就擦掉重填」。",
      why: "程式解法和人腦一模一樣：逐格嘗試 1 到 9，用列、欄、宮三組集合檢查衝突，走不通就回溯。數獨是 N 皇后的直接延伸，差別只在約束的形狀。",
    },
  ],
  cue: "不能衝突、每列每欄只能一個、排課排班、約束滿足、放置後要檢查、走不通就換上一步、數獨。",
  steps: [
    "準備 `queens`（每列的欄）和三個集合 `cols`、`diag1`（r−c）、`diag2`（r+c）。`dfs(r)` 表示「正在放第 r 列」。",
    "終止條件：`r == n`，n 列都放好了，把 `queens` 轉成棋盤收進答案。",
    "對每個欄 c：若 `c in cols` 或 `r-c in diag1` 或 `r+c in diag2`，被攻擊，跳過。",
    "做選擇：`queens.append(c)`，三個集合各加一個值，遞迴 `dfs(r + 1)`。",
    "撤銷選擇：`queens.pop()`，三個集合各移除一個值。這一列所有欄試完仍無解，就自然返回到上一列，也就是回溯。",
  ],
  demoNote:
    "4 皇后。一列一列放，淺黃格是被現有皇后攻擊的位置，每次試到被攻擊的格子會標出原因。當某一列每一欄都被攻擊，就拿掉上一列的皇后換下一欄，直到找到第一組解。",
  codeNote: "列出所有解的集合版本，以及只數解數量的位元遮罩版本。",
  problems: [
    { src: "LeetCode 36", name: "Valid Sudoku（先練衝突檢查）", diff: "Medium" },
    { src: "LeetCode 473", name: "Matchsticks to Square（每根火柴放進四條邊之一，排序後剪枝）", diff: "Medium" },
    { src: "LeetCode 51", name: "N-Queens", diff: "Hard" },
    { src: "LeetCode 52", name: "N-Queens II（位元遮罩）", diff: "Hard" },
    { src: "LeetCode 37", name: "Sudoku Solver（列、欄、宮三組集合）", diff: "Hard" },
    { src: "LeetCode 1655", name: "Distribute Repeating Integers（約束滿足加剪枝）", diff: "Hard" },
  ],
};
