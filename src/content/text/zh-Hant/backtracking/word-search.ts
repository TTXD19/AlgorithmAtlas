import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "DFS、Matrix",
  applications: [
    {
      title: "文字遊戲的答案檢查",
      problem: "Boggle 這類遊戲給一盤字母，玩家提交一個字，系統要判斷它能不能由相鄰的格子連出來，而且每格只能用一次。",
      why: "從每個字母相同的格子出發，往上下左右延伸比對下一個字母，走過的格子先標記起來，這條路走不通就取消標記換另一條。這就是網格上的回溯，「回復標記」讓別條路徑還能經過同一格。",
    },
    {
      title: "列出迷宮的所有走法",
      problem: "遊戲關卡設計師想知道從入口到出口有幾條不重複經過同一格的路，好判斷關卡是不是太簡單。",
      why: "BFS 只能找最短的一條，要列出全部就得 DFS 加回溯：每走一格標記，到終點就記錄一條路徑，退回來時取消標記。標記不回復，第二條路就找不到了。",
    },
    {
      title: "機器人手臂的可行動作序列",
      problem: "手臂要從初始姿態經過一連串動作到達目標，每一步只能做四種動作之一，有些中間姿態是禁止的。要列出所有合法的動作序列。",
      why: "姿態是格子、動作是四個方向、禁止姿態是牆，問題形狀和網格回溯一模一樣。網格只是最容易畫出來的狀態空間，同樣的程式套在任何「狀態加轉移」的問題上。",
    },
  ],
  cue: "網格、相鄰格子、每格只能用一次、找一條路徑或所有路徑、走過要標記、上下左右四個方向、走不通就回頭。",
  steps: [
    "對棋盤每一格 (r, c) 呼叫 `dfs(r, c, 0)`，任一個回傳 true 就是找到。",
    "在 `dfs(r, c, i)` 裡先剪枝：出界或 `board[r][c] != word[i]` 就 return false。",
    "若 `i == len(word) - 1`，最後一個字母也對上，return true。",
    "做選擇：把 `board[r][c]` 改成 `#`，對上、右、下、左四個鄰格遞迴 `dfs(nr, nc, i + 1)`，任一個 true 就往上回傳 true。",
    "撤銷選擇：不論結果如何，離開前把 `board[r][c]` 改回原字母。找到時也要復原，別把棋盤留成髒的。",
  ],
  demoNote:
    "3×4 的網格裡找「SEE」。從左上開始掃起點，遇到 S 就往四個方向探。留意第一個 S 的三個方向都不通後回復標記，以及從第二個 S 出發時，走上面的 E 是死路、回復後才走下面的 E 成功。",
  codeNote: "Word Search 的原地標記版本，以及列出迷宮所有路徑的變形（用 visited 陣列，到終點不 return 而是記錄後繼續）。",
  problems: [
    { src: "LeetCode 79", name: "Word Search", diff: "Medium" },
    { src: "LeetCode 1219", name: "Path with Maximum Gold（每條路徑走完都要回復標記）", diff: "Medium" },
    { src: "LeetCode 130", name: "Surrounded Regions（DFS 但不回復標記，比較差別）", diff: "Medium" },
    { src: "LeetCode 212", name: "Word Search II（配合 Trie）", diff: "Hard" },
    { src: "LeetCode 980", name: "Unique Paths III（列出所有走遍空格的路徑）", diff: "Hard" },
    { src: "LeetCode 2328", name: "Number of Increasing Paths in a Grid（嚴格遞增不會走回頭路，不必標記，改用記憶化）", diff: "Hard" },
  ],
};
