import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Subset Enumeration、Memoization & Tabulation",
  applications: [
    {
      title: "外送員一趟送 12 個點",
      problem: "外送平台替一位外送員排一趟 12 個地點的配送順序，最後回到店裡，距離矩陣已經由地圖服務算好。暴力列出所有順序是 12! ≈ 4.8 億種，每次派單都要在一秒內回應。",
      why: "決定「接下來去哪」時，重要的只有「哪些點已經送過」和「現在停在哪裡」，至於前面是用什麼順序送的都不影響之後的最短距離。把送過的點存成一個 12 位元的整數 mask，狀態只有 2¹² × 12 = 49,152 個，每個狀態試 12 個下一站，約 59 萬次運算。這是 Held–Karp 演算法。",
    },
    {
      title: "5 位工程師分配 5 個專案",
      problem: "每位工程師對每個專案估了不同的工時，一人負責一個專案，主管想讓總工時最少。全部分法有 5! = 120 種，團隊變成 16 人時就有 2×10¹³ 種。",
      why: "依序替第 0、1、2… 位工程師挑專案，已經被挑走的專案存成 mask，而下一位是第幾個人剛好就是 mask 裡 1 的個數，所以狀態只需要 mask 本身。16 人只有 65,536 個狀態、每個試 16 個專案，約 100 萬次運算。人數再大就改用匈牙利演算法。",
    },
    {
      title: "排班：每天都要有人上班，最少雇幾個人",
      problem: "咖啡店一週 7 天都要有工讀生，應徵的 30 個人各自只能上某幾天。老闆想用最少的人讓每一天都有人顧店。",
      why: "7 天的出勤狀況只有 2⁷ = 128 種「目前哪些天已經有人」。從空集合開始，每多雇一個人就把他能上的天 OR 進去，dp[covered] 記住蓋住這些天最少要幾人，128 個狀態 × 30 個人就算完，比從 30 人裡挑組合快得多。",
    },
  ],
  cue: "n ≤ 20、每個元素用過沒用過、走訪所有點一次（TSP）、指派、覆蓋所有條件、狀態是一個集合、dp[mask]、dp[mask][最後一個]、2ⁿ 個狀態。",
  steps: [
    "確認規模很小（n ≤ 20 左右），而且後續決策取決於「哪些元素已經用過」。",
    "定義狀態：`dp[mask]`，或需要知道最後一個元素時用 `dp[mask][j]`；第 i 位代表第 i 個元素。",
    "設 base case，例如 TSP 的 `dp[1][0] = 0`（只走過起點 0），指派問題的 `dp[0] = 0`。",
    "mask 由小到大，對每個可行狀態嘗試加入一個還沒用過的元素 k，用 `mask | (1 << k)` 更新下一個狀態，需要還原方案時記下 parent。",
    "答案在全集 `(1 << n) − 1`；TSP 要再加上回到起點的邊取最小，沿 parent 往回走就是路線。",
  ],
  demoNote:
    "4 個城市的完整距離圖，從城市 0 出發、每個城市走一次再回到 0。右邊的表格列出含起點的 8 個 mask，每一格 dp[mask][j] 是走過 mask、停在 j 的最小成本，mask 由小到大逐格填。填一格時會一一檢查每個可能的上一站：表格裡藍色是正在填的狀態，黃色是它參考的 dp[mask 去掉 j][上一站]；左邊的圖同步把目前位置標藍、上一站標黃、mask 裡已經走過的城市標綠，藍色的邊是這次考慮的那一段路。全部走完後加上回到 0 的距離，最短是 80，路線 0 → 2 → 3 → 1 → 0，最後一步也說明了 n 變大時為什麼 DP 比暴力列排列好。",
  codeNote:
    "Python 放「往外推」寫法的 TSP（含路線還原），以及只需要 mask、不必記最後位置的指派問題。C++ 放和互動示範相同的「拉進來」寫法的 TSP，以及排班的最少人數覆蓋：狀態是「已經有人的天」，每雇一個人就把他能上的天 OR 進去。",
  problems: [
    { src: "LeetCode 526", name: "Beautiful Arrangement（mask 是用過的數字，下一個位置是 popcount）", diff: "Medium" },
    { src: "LeetCode 1986", name: "Minimum Number of Work Sessions to Finish the Tasks（mask 是做完的工作）", diff: "Medium" },
    { src: "LeetCode 698", name: "Partition to K Equal Sum Subsets（dp[mask] 記目前這一桶裝了多少）", diff: "Medium" },
    { src: "LeetCode 1879", name: "Minimum XOR Sum of Two Arrays（就是指派問題）", diff: "Hard" },
    { src: "LeetCode 847", name: "Shortest Path Visiting All Nodes（在 (mask, 節點) 上做 BFS）", diff: "Hard" },
    { src: "LeetCode 943", name: "Find the Shortest Superstring（重疊長度當距離的 TSP）", diff: "Hard" },
  ],
};
