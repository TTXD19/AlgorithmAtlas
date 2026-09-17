import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Bellman-Ford、Adjacency List / Matrix",
  applications: [
    {
      title: "遊戲 NPC 的尋路查表",
      problem: "一張遊戲地圖用 300 個路徑點連成導航圖，畫面上同時有上百個 NPC 每一幀都在決定下一步往哪走。每個 NPC 每次都跑一遍最短路徑，運算量會吃掉整個畫面的時間預算。",
      why: "地圖是固定的，可以在載入時用 Floyd-Warshall 一次算好任兩個路徑點之間的距離和「下一步」表，300³ 是兩千七百萬次運算，不到一秒。遊戲進行中每個 NPC 只要查 next[目前位置][目標]，O(1) 就知道往哪走，記憶體是 300 × 300 的兩張表。",
    },
    {
      title: "權限系統的角色繼承",
      problem: "企業的權限系統有 200 個角色，角色可以繼承其他角色，繼承還會一層層傳下去：管理員繼承編輯，編輯又繼承檢視。每次檢查權限都要沿著繼承關係往下追，追到哪一層才停不好說，還可能遇到環狀設定。",
      why: "把「最短距離」換成「走不走得到」，加法換成 AND、取最小換成 OR，同一套三層迴圈就是 Warshall 的遞移閉包。事先算出每個角色實際涵蓋哪些角色，查詢時直接看表；用位元集合一次 OR 一整列，200 個角色只要一瞬間。",
    },
    {
      title: "網路中頻寬最大的路徑",
      problem: "機房之間的專線頻寬各不相同，一條傳輸路徑的可用頻寬取決於沿途最窄的那一段。維運團隊想知道任兩個機房之間，最多能用多大的頻寬傳資料。",
      why: "Floyd-Warshall 的結構不在乎運算是加法：把「經過 k 的路徑長度 = 兩段相加」換成「經過 k 的頻寬 = 兩段取最小」，把「取最短」換成「取最大」，更新式變成 cap[i][j] = max(cap[i][j], min(cap[i][k], cap[k][j]))，一樣 O(V³) 算出所有配對的最大瓶頸頻寬。",
    },
  ],
  cue: "任意兩點之間的最短距離都要、節點數在幾百以內、圖很稠密、有負權邊但沒有負環、可達性或遞移閉包、瓶頸路徑、需要大量兩點查詢。",
  steps: [
    "建 V × V 的矩陣 `dist`：`dist[i][i] = 0`，每條邊 `u → v` 設為 `min(原值, w)`，其餘為 ∞；要還原路徑就同時令 `next[u][v] = v`。",
    "最外層 k 從 0 到 V − 1，代表「現在允許經過 k」。",
    "內兩層枚舉 i、j：若 `dist[i][k]` 和 `dist[k][j]` 都不是 ∞，而且兩者相加小於 `dist[i][j]`，就更新 `dist[i][j]`，並令 `next[i][j] = next[i][k]`。",
    "三層迴圈結束後檢查對角線，任何 `dist[i][i] < 0` 都表示圖中有負環。",
    "查詢距離直接讀 `dist[i][j]`；要路徑就從 i 出發，反覆走到 `next[目前][j]`，直到抵達 j。",
  ],
  demoNote:
    "4 個節點、8 條有向邊，B → C 的權重是 −2。右邊的距離矩陣一開始只有直接相連的邊。每一輪先選定中間點 k（黃色節點，矩陣裡第 k 列和第 k 行加上黃框），接著逐一顯示這一輪有被改小的格子：藍色是正在更新的 dist[i][j]，實心黃色是它用到的 dist[i][k] 和 dist[k][j]，綠色是這一輪已經更新過的格子。k = A 讓 C、D 能經過 A 走到 B；k = B 把負權邊用上，A → C 從 ∞ 變成 2、D → C 從 8 變成 3；k = C 和 k = D 再各改 3 格，其中 B → A 和 C → B 都被改了兩次。最後檢查對角線沒有負數，並用 next 表還原 D 到 C 的最短路徑 D → A → B → C，總長 3。",
  codeNote:
    "Python 放完整版：處理重複邊、記錄 next 還原路徑、檢查負環，另外附上用位元集合做遞移閉包的 Warshall 版本，以角色繼承為例。C++ 放原地更新的最短距離版本，INF 取最大值的四分之一以免相加溢位，並示範把運算換成 min 和 max 的最大頻寬路徑。",
  problems: [
    { src: "LeetCode 1334", name: "Find the City With the Smallest Number of Neighbors at a Threshold Distance", diff: "Medium" },
    { src: "LeetCode 1462", name: "Course Schedule IV（遞移閉包）", diff: "Medium" },
    { src: "LeetCode 399", name: "Evaluate Division（把加法換成乘法的 Floyd-Warshall）", diff: "Medium" },
    { src: "LeetCode 2976", name: "Minimum Cost to Convert String I（26 個字母之間的最短轉換成本）", diff: "Medium" },
    { src: "LeetCode 2959", name: "Number of Possible Sets of Closing Branches（枚舉子集合，每次跑一次 Floyd-Warshall）", diff: "Hard" },
    { src: "LeetCode 2977", name: "Minimum Cost to Convert String II", diff: "Hard" },
  ],
};
