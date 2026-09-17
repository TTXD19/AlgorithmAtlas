import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Dijkstra、Adjacency List / Matrix",
  applications: [
    {
      title: "外匯市場的套利偵測",
      problem: "交易系統每秒拿到 150 種貨幣兩兩之間的匯率。如果美元換歐元、歐元換日圓、日圓再換回美元，乘起來大於 1，就是一次無風險套利，要在匯率變動前搶先發現。",
      why: "把匯率 r 轉成邊權 −log r，一連串兌換的「乘積大於 1」就變成「權重總和小於 0」，套利機會正好是圖上的負環。Dijkstra 不接受負權，Bellman-Ford 做完 V − 1 輪後再掃一輪，還能鬆弛就代表有負環，沿著 parent 往回走還能把那一串兌換路徑找出來。",
    },
    {
      title: "路由器只知道鄰居的 RIP 協定",
      problem: "一個園區網路有幾十台路由器，每台只知道自己和直接相連的鄰居距離多遠，沒有任何一台握有整張拓撲，卻要各自算出到每個網段的最短路由。",
      why: "距離向量協定就是分散式的 Bellman-Ford：每台路由器定期把自己的距離表送給鄰居，鄰居用「你到目的地的距離 + 我到你的距離」鬆弛自己的表。每交換一次就像做完一輪，傳個幾輪全網就收斂。RIP 規定超過 15 跳就視為不可達，也是為了避免這種逐輪更新在斷線時無止境地增加。",
    },
    {
      title: "工程排程的時間約束有沒有矛盾",
      problem: "專案有上百條規則：「B 最晚要在 A 開始後 3 天內開始」「C 至少要在 B 開始 2 天後才開始」。專案經理想知道這些規則能不能同時滿足。",
      why: "每條規則都能寫成 x_j − x_i ≤ c 的形式，對應一條從 i 到 j、權重 c 的邊，這叫差分約束系統。規則之間互相矛盾，正好等於圖上有負環；沒有負環時，Bellman-Ford 算出的最短距離就是一組合法的開始日期。",
    },
  ],
  cue: "邊有負權、負環、套利、最多經過 k 條邊、距離向量路由、差分約束 x_j − x_i ≤ c、Dijkstra 不能用的最短路徑、V 和 E 都不大。",
  steps: [
    "`dist` 全部設為 ∞，`dist[src] = 0`。把圖存成邊的列表 `(u, v, w)` 就夠了。",
    "重複 V − 1 輪：對每條邊，若 `dist[u] != ∞` 且 `dist[u] + w < dist[v]`，就更新 `dist[v]`，需要路徑時同時記 `parent[v] = u`。",
    "某一輪完全沒有更新，就代表已經收斂，可以提前結束。",
    "再掃一輪所有邊：還有邊能鬆弛，表示存在從起點走得到的負環，最短路徑沒有定義。",
    "要找出負環：記下這一輪被更新的節點，沿 `parent` 往回走 V 步，再繞一圈收集節點。限制最多 k 條邊時，每一輪只用上一輪的 `dist` 複本來鬆弛。",
  ],
  demoNote:
    "五個節點、十條有向邊，負權的邊權數字標成黃色。「例子 1：有負邊、無負環」：第 1 輪就更新了六次，第 2 輪只剩 A → D 把 D 從 2 壓到 −2，第 3 輪沒有任何更新，提前結束，最後 A = 2、D = −2。「例子 2：有負環」把 C → A 改成 −5，A → D → C → A 繞一圈總和變成 −2：每一輪都還在更新，連起點 S 都被壓到負數，做完 4 輪後的第 5 輪檢查仍能鬆弛，沿 parent 找出的負環 C → A → D → C 以黃色標出。節點方面，藍色是這一步被更新的節點，黃色是已經有距離、但之後可能再變的節點；藍色的邊是本輪鬆弛成功的邊。",
  codeNote:
    "Python 放標準的 Bellman-Ford（含提前結束與負環判斷）、找出負環本身，以及「最多用 k 條邊」的變形，範例用互動示範的同一張圖。C++ 放 Bellman-Ford 與 SPFA 兩種寫法，負環判斷各用一種：Bellman-Ford 看第 V 輪還能不能鬆弛，SPFA 看某條最短路徑是否用到了 V 條邊。",
  problems: [
    { src: "LeetCode 743", name: "Network Delay Time（邊權非負，用 Bellman-Ford 再寫一次和 Dijkstra 對照）", diff: "Medium" },
    { src: "LeetCode 787", name: "Cheapest Flights Within K Stops（最多 k+1 條邊，每輪只用上一輪的距離）", diff: "Medium" },
    { src: "CSES 1197", name: "Cycle Finding（找出並印出一個負環）", diff: "Medium" },
    { src: "LeetCode 1928", name: "Minimum Cost to Reach Destination in Time（依時間分層鬆弛）", diff: "Hard" },
    { src: "CSES 1673", name: "High Score（最長路徑：邊權取負，只看走得到終點的負環）", diff: "Hard" },
  ],
};
