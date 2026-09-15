import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { BellmanFordDemo } from "@/components/lesson/demos/BellmanFordDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from math import inf


def bellman_ford(n, edges, src):
    """edges 是有向邊 (u, v, w)。回傳 (dist, 是否有從 src 走得到的負環)。O(VE)"""
    dist = [inf] * n
    dist[src] = 0
    for _ in range(n - 1):                    # 沒有負環時，最短路徑最多 n − 1 條邊
        changed = False
        for u, v, w in edges:
            if dist[u] != inf and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:                       # 一整輪都沒更新，已經收斂
            break
    has_neg_cycle = any(dist[u] != inf and dist[u] + w < dist[v] for u, v, w in edges)
    return dist, has_neg_cycle


def find_negative_cycle(n, edges):
    """回傳任一個負環上的節點（依邊的方向），沒有負環回傳 None"""
    dist = [0] * n                            # 全設 0：等於有個虛擬起點連到每個節點
    parent = [-1] * n
    for _ in range(n):
        x = -1
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v], parent[v], x = dist[u] + w, u, v
    if x == -1:
        return None                           # 第 n 輪沒有任何更新：沒有負環
    for _ in range(n):
        x = parent[x]                         # 往回走 n 步，一定已經踩在環上
    cycle, y = [x], parent[x]
    while y != x:
        cycle.append(y)
        y = parent[y]
    return cycle[::-1]


def shortest_with_k_edges(n, edges, src, k):
    """最多只能用 k 條邊（例如最多轉機 k − 1 次）"""
    dist = [inf] * n
    dist[src] = 0
    for _ in range(k):
        prev = dist[:]                        # 只用上一輪的值，同一輪不能連走好幾條邊
        for u, v, w in edges:
            if prev[u] != inf and prev[u] + w < dist[v]:
                dist[v] = prev[u] + w
    return dist


if __name__ == "__main__":
    S, A, B, C, D = range(5)                  # 和互動示範同一張圖
    edges = [(S, A, 6), (S, B, 7), (A, C, 5), (A, B, 8), (A, D, -4),
             (B, C, -3), (B, D, 9), (C, A, -2), (D, C, 7), (D, S, 2)]
    print(bellman_ford(5, edges, S))          # ([0, 2, 7, 4, -2], False)
    print(shortest_with_k_edges(5, edges, S, 2))   # [0, 6, 7, 4, 2]（只准走 2 條邊）

    neg = [(u, v, -5 if (u, v) == (C, A) else w) for u, v, w in edges]
    print(bellman_ford(5, neg, S)[1])         # True
    print(find_negative_cycle(5, neg))        # [4, 0, 2, 3, 1]：D→S→B→C→A→D 總和 −3
    # 示範找到的是 C→A→D→C（−2）：同一張圖可以有好幾個負環，找到哪個取決於掃描順序`;

const cpp = `#include <iostream>
#include <limits>
#include <queue>
#include <tuple>
#include <utility>
#include <vector>

using Edge = std::tuple<int, int, long long>;          // (u, v, w)
const long long INF = std::numeric_limits<long long>::max() / 4;   // 留空間，INF 附近加減不會溢位

// 回傳 true 代表沒有從 src 走得到的負環，dist 就是答案
bool bellmanFord(int n, const std::vector<Edge>& edges, int src, std::vector<long long>& dist) {
    dist.assign(n, INF);
    dist[src] = 0;
    for (int round = 0; round < n - 1; round++) {
        bool changed = false;
        for (auto [u, v, w] : edges)
            if (dist[u] != INF && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; changed = true; }
        if (!changed) break;                           // 提早收斂
    }
    for (auto [u, v, w] : edges)
        if (dist[u] != INF && dist[u] + w < dist[v]) return false;   // 第 n 輪還能鬆弛：有負環
    return true;
}

// SPFA：只重新檢查距離剛變小的節點。平均快很多，最壞仍是 O(VE)
bool spfa(int n, const std::vector<std::vector<std::pair<int, long long>>>& adj, int src,
          std::vector<long long>& dist) {
    dist.assign(n, INF);
    std::vector<int> edgesUsed(n, 0);
    std::vector<bool> inQueue(n, false);
    std::queue<int> q;
    dist[src] = 0; q.push(src); inQueue[src] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop(); inQueue[u] = false;
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                edgesUsed[v] = edgesUsed[u] + 1;
                if (edgesUsed[v] >= n) return false;   // 路徑用了 n 條邊，一定繞進了負環
                if (!inQueue[v]) { q.push(v); inQueue[v] = true; }
            }
        }
    }
    return true;
}

int main() {
    std::vector<Edge> edges = {{0, 1, 6}, {0, 2, 7}, {1, 3, 5}, {1, 2, 8}, {1, 4, -4},
                               {2, 3, -3}, {2, 4, 9}, {3, 1, -2}, {4, 3, 7}, {4, 0, 2}};   // S=0 A=1 B=2 C=3 D=4
    std::vector<long long> dist;
    std::cout << bellmanFord(5, edges, 0, dist) << ':';
    for (long long d : dist) std::cout << ' ' << d;
    std::cout << '\\n';                                  // 1: 0 2 7 4 -2

    std::get<2>(edges[7]) = -5;                         // C → A 改成 −5，出現負環
    std::vector<std::vector<std::pair<int, long long>>> adj(5);
    for (auto [u, v, w] : edges) adj[u].push_back({v, w});
    std::cout << bellmanFord(5, edges, 0, dist) << ' ' << spfa(5, adj, 0, dist) << '\\n';   // 0 0
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
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
          ]}
          cue="邊有負權、負環、套利、最多經過 k 條邊、距離向量路由、差分約束 x_j − x_i ≤ c、Dijkstra 不能用的最短路徑、V 和 E 都不大。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>Bellman-Ford</strong> 不挑順序，也不確定任何節點，只做一件事：把<strong>所有邊</strong>全部鬆弛一遍，稱為一輪，然後重複。dist 一開始除了起點都是 ∞，每一輪對每條邊 <Code>u → v</Code> 檢查 <Code>dist[u] + w &lt; dist[v]</Code>，成立就更新。它的保證是：<strong>做完第 k 輪，dist[v] 不超過「最多用 k 條邊」到 v 的最短距離</strong>。用歸納法看：最多 k+1 條邊的最短路徑，前 k 條邊到達的節點 u 在第 k 輪結束時 dist 已經不超過那段的長度，第 k+1 輪掃到最後那條邊 <Code>u → v</Code> 時就會把 dist[v] 壓下來。
        </p>
        <p>
          沒有負環時，最短路徑一定是<strong>簡單路徑</strong>（繞圈只會變長或不變），最多 V − 1 條邊，所以 V − 1 輪之後 dist 就是正確答案。這個論證完全沒用到「邊權非負」，因此負權邊沒有問題。Dijkstra 不行，是因為它在節點取出時就把距離定案，假設之後不可能出現更短的路；有負權邊時，晚一點才走到的路可能反而更短。以示範的圖為例，取出即定案的 Dijkstra 會把 A 定在 6、D 定在 2，實際最短是 2 和 −2。
        </p>
        <p>
          <strong>負環偵測</strong>：若從起點走得到一個總權重為負的環，就能繞著它無限變短，最短路徑沒有定義。這時第 V − 1 輪之後一定還有邊能鬆弛（否則沿著環把不等式加起來會得到環的總權重 ≥ 0，矛盾），所以<strong>多掃第 V 輪，還能更新就是有負環</strong>。要找出環本身，記下第 V 輪被更新的節點，沿 parent 往回走 V 步，保證已經踩在環上，再走一圈就能收集環上的節點。複雜度是 V 輪乘上每輪 E 條邊，<strong>O(VE)</strong> 時間、<strong>O(V)</strong> 空間；一整輪都沒有更新時可以提前結束，實務上常常遠少於 V − 1 輪。SPFA 用佇列只重新檢查距離剛變小的節點，平均快很多，但最壞情況一樣 O(VE)，也有專門讓它變慢的輸入。
        </p>
        <p>
          常見的坑：從 dist = ∞ 的節點出發鬆弛，∞ 加上負權仍然是很大的數，卻可能被當成「更短」，所以一定要先檢查 <Code>dist[u] != ∞</Code>，C++ 的 INF 也要留空間避免溢位；<strong>無向圖</strong>裡的一條負權邊本身就是負環（u → v → u）；只想偵測「任何地方」的負環，就把所有 dist 設成 0（等於加一個連到每個節點的虛擬起點）；限制「最多 k 條邊」（LeetCode 787）時，每一輪必須只用<strong>上一輪</strong>的距離，否則同一輪裡可能連走好幾條邊。怎麼選：邊權非負用 Dijkstra；圖是 DAG 時先拓撲排序再鬆弛，O(V + E) 而且負權也行；要任兩點的距離而且 V 不大，用 Floyd-Warshall。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <><Code>dist</Code> 全部設為 ∞，<Code>dist[src] = 0</Code>。把圖存成邊的列表 <Code>(u, v, w)</Code> 就夠了。</>,
            <>重複 V − 1 輪：對每條邊，若 <Code>dist[u] != ∞</Code> 且 <Code>dist[u] + w &lt; dist[v]</Code>，就更新 <Code>dist[v]</Code>，需要路徑時同時記 <Code>parent[v] = u</Code>。</>,
            <>某一輪完全沒有更新，就代表已經收斂，可以提前結束。</>,
            <>再掃一輪所有邊：還有邊能鬆弛，表示存在從起點走得到的負環，最短路徑沒有定義。</>,
            <>要找出負環：記下這一輪被更新的節點，沿 <Code>parent</Code> 往回走 V 步，再繞一圈收集節點。限制最多 k 條邊時，每一輪只用上一輪的 <Code>dist</Code> 複本來鬆弛。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>五個節點、十條有向邊，負權的邊權數字標成黃色。「例子 1：有負邊、無負環」：第 1 輪就更新了六次，第 2 輪只剩 A → D 把 D 從 2 壓到 −2，第 3 輪沒有任何更新，提前結束，最後 A = 2、D = −2。「例子 2：有負環」把 C → A 改成 −5，A → D → C → A 繞一圈總和變成 −2：每一輪都還在更新，連起點 S 都被壓到負數，做完 4 輪後的第 5 輪檢查仍能鬆弛，沿 parent 找出的負環 C → A → D → C 以黃色標出。節點方面，藍色是這一步被更新的節點，黃色是已經有距離、但之後可能再變的節點；藍色的邊是本輪鬆弛成功的邊。</p>
        <BellmanFordDemo />
      </Section>

      <Section id="code">
        <p>Python 放標準的 Bellman-Ford（含提前結束與負環判斷）、找出負環本身，以及「最多用 k 條邊」的變形，範例用互動示範的同一張圖。C++ 放 Bellman-Ford 與 SPFA 兩種寫法，負環判斷各用一種：Bellman-Ford 看第 V 輪還能不能鬆弛，SPFA 看某條最短路徑是否用到了 V 條邊。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 743", name: "Network Delay Time（邊權非負，用 Bellman-Ford 再寫一次和 Dijkstra 對照）", diff: "Medium" },
            { src: "LeetCode 787", name: "Cheapest Flights Within K Stops（最多 k+1 條邊，每輪只用上一輪的距離）", diff: "Medium" },
            { src: "CSES 1197", name: "Cycle Finding（找出並印出一個負環）", diff: "Medium" },
            { src: "LeetCode 1928", name: "Minimum Cost to Reach Destination in Time（依時間分層鬆弛）", diff: "Hard" },
            { src: "CSES 1673", name: "High Score（最長路徑：邊權取負，只看走得到終點的負環）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const bellmanFordLesson: Lesson = { prereq: "Dijkstra、Adjacency List / Matrix", Body };
