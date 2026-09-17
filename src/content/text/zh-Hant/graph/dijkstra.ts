import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "BFS、Binary Heap、Adjacency List / Matrix",
  applications: [
    {
      title: "導航 App 的「最快路線」",
      problem: "一座城市有 3 萬個路口、8 萬條路段，每段路依即時車速換算成通過秒數。使用者按下「出發」，要在一秒內算出從家到公司最快的走法。",
      why: "路口是節點、路段是邊、秒數是權重，而且時間不會是負的，這正是 Dijkstra 的前提。BFS 只數經過幾個路口，會挑到路口少但塞車的路；Dijkstra 由近到遠逐一確定每個路口的最快抵達時間，終點一被確定就能停，不必算完整座城市。",
    },
    {
      title: "路由器用 OSPF 算路由表",
      problem: "企業網路有 200 台路由器、600 條鏈路，每條鏈路的成本是「參考頻寬 ÷ 鏈路頻寬」，例如 10 Gbps 記 1、1 Gbps 記 10。任何一條線斷掉，每台路由器都要重新算出到其他 199 台的最佳路徑。",
      why: "OSPF 裡每台路由器都握有整張拓撲，以自己為起點跑一次 Dijkstra，就同時得到到所有目的地的最短路徑樹。路由表只需要每個目的地的「下一跳」，順著 parent 往回找就有。這是「單一起點、所有終點」的典型用法。",
    },
    {
      title: "策略遊戲的地形尋路",
      problem: "地圖是 256 × 256 的格子，走進平地花 1 秒、森林 3 秒、沼澤 8 秒。玩家點選目的地，單位要走總時間最少的路，而不是格數最少的路。",
      why: "每格是節點、上下左右相鄰格是邊、「走進那一格的秒數」是權重。BFS 會直直穿過沼澤；Dijkstra 保證總時間最少。遊戲常用的 A* 就是 Dijkstra 再加上「離終點大約還有多遠」的估計，讓堆積優先展開朝向終點的格子，骨架完全一樣。",
    },
  ],
  cue: "最短／最快／最便宜的路徑、邊有非負權重、成本沿路徑累加、單一起點到所有點、每格代價不同的網格、優先佇列加鬆弛。",
  steps: [
    "建鄰接串列 `adj[u] = [(v, w), …]`，無向圖兩個方向各加一次。確認所有權重都 **≥ 0**，有負權就不能用。",
    "`dist` 全部設為 ∞、`parent` 設為 −1；`dist[src] = 0`，把 `(0, src)` 推入最小堆積。",
    "取出堆頂 `(d, u)`。若 `d > dist[u]`，這是被更新掉的舊紀錄，直接跳過；否則 `dist[u]` 在此確定。只要單一終點時，`u` 就是終點便可結束。",
    "對 `u` 的每條邊 `(v, w)`：若 `d + w < dist[v]`，更新 `dist[v] = d + w`、`parent[v] = u`，並推入 `(dist[v], v)`。堆積裡 `v` 的舊紀錄不必刪。",
    "重複 3–4 直到堆積為空。仍是 ∞ 的節點代表到不了；要路徑就從終點沿 `parent` 走到 −1，再把序列反轉。",
  ],
  demoNote:
    "六個路口 A–F 的無向圖，邊上的數字是通過那段路的分鐘數，從 A 出發，和程式碼的範例是同一張圖。節點顏色依圖例：黃色還在優先佇列裡，藍色是剛取出、正在鬆弛鄰邊的節點，處理完就變成「已確定」的實心圓。正在檢查的邊標成黃色，這次沒有更新就畫成虛線；藍色的邊是目前的最短路徑樹。留意 B：先經 A 直達記為 4，C 確定後改成 2 + 1 = 3，舊的 (4, B) 仍留在佇列裡，輪到它時被劃掉跳過。D、E 也各被改小一次；E 確定後試走 E–F，10 + 5 = 15 不比 14 短，不更新。最後一步用綠色標出 A → C → B → D → F，共 14 分鐘。",
  codeNote:
    "三個函式：延遲刪除的堆積版 Dijkstra（同時記錄 `parent`）、沿 `parent` 還原路徑，以及不用堆積、每輪掃描一遍的 O(V²) 鄰接矩陣版。兩個版本算出的距離相同，放在一起是為了對照：稀疏圖選堆積版，節點不多但邊幾乎兩兩相連時選矩陣版。",
  problems: [
    { src: "LeetCode 743", name: "Network Delay Time（模板題：最遠節點的最短距離）", diff: "Medium" },
    { src: "LeetCode 1514", name: "Path with Maximum Probability（機率相乘，改用最大堆積）", diff: "Medium" },
    { src: "LeetCode 1631", name: "Path With Minimum Effort（網格上，路徑代價取最大值）", diff: "Medium" },
    { src: "LeetCode 1976", name: "Number of Ways to Arrive at Destination（順便計數最短路徑條數）", diff: "Medium" },
    { src: "LeetCode 2290", name: "Minimum Obstacle Removal to Reach Corner（權重只有 0 和 1，可改用 0-1 BFS）", diff: "Hard" },
    { src: "LeetCode 2203", name: "Minimum Weighted Subgraph With the Required Paths（在反向圖上也跑一次）", diff: "Hard" },
  ],
};
