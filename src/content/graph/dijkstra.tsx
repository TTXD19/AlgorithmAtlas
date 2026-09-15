import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { DijkstraDemo } from "@/components/lesson/demos/DijkstraDemo";
import type { Lesson } from "@/lib/lessons";

const python = `import heapq
from math import inf


def dijkstra(adj, src):
    """adj[u] = [(v, w), ...]，所有 w >= 0。回傳 (dist, parent)。O((V + E) log V)"""
    n = len(adj)
    dist = [inf] * n
    parent = [-1] * n
    dist[src] = 0
    heap = [(0, src)]                       # (目前距離, 節點)
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:                     # 舊紀錄：u 早就用更短的距離處理過
            continue
        # 到這裡 dist[u] 已經確定；只要單一終點，可以在這裡 if u == target: break
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:                # 鬆弛成功
                dist[v] = nd
                parent[v] = u
                heapq.heappush(heap, (nd, v))   # 舊的紀錄不刪，取出時再跳過
    return dist, parent


def build_path(dist, parent, target):
    """沿 parent 從終點往回走，再反轉。到不了就回傳空串列"""
    if dist[target] == inf:
        return []
    path = []
    while target != -1:
        path.append(target)
        target = parent[target]
    return path[::-1]


def dijkstra_dense(mat, src):
    """鄰接矩陣版，mat[u][v] = inf 表示沒有邊。每輪線性掃描找最小，O(V²)"""
    n = len(mat)
    dist = [inf] * n
    done = [False] * n
    dist[src] = 0
    for _ in range(n):
        u = min((i for i in range(n) if not done[i]), key=lambda i: dist[i])
        if dist[u] == inf:                  # 剩下的節點都到不了
            break
        done[u] = True
        for v in range(n):
            if dist[u] + mat[u][v] < dist[v]:
                dist[v] = dist[u] + mat[u][v]
    return dist


if __name__ == "__main__":
    names = "ABCDEF"                        # 與互動示範同一張圖
    roads = [(0, 1, 4), (0, 2, 2), (1, 2, 1), (1, 3, 5), (2, 3, 8),
             (2, 4, 10), (3, 4, 2), (3, 5, 6), (4, 5, 5)]
    adj = [[] for _ in names]
    mat = [[inf] * len(names) for _ in names]
    for u, v, w in roads:                   # 無向圖：兩個方向各加一次
        adj[u].append((v, w))
        adj[v].append((u, w))
        mat[u][v] = mat[v][u] = w

    dist, parent = dijkstra(adj, 0)
    print(dist)                             # [0, 3, 2, 8, 10, 14]
    path = build_path(dist, parent, 5)
    print(" → ".join(names[i] for i in path))   # A → C → B → D → F
    print(dijkstra_dense(mat, 0))           # [0, 3, 2, 8, 10, 14]`;

const cpp = `#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <limits>
#include <utility>
#include <functional>
#include <algorithm>

using Edge = std::pair<int, long long>;                  // (鄰居, 權重)
const long long INF = std::numeric_limits<long long>::max();

// 堆積版：O((V + E) log V)。距離用 long long，權重加總才不會溢位
std::vector<long long> dijkstra(const std::vector<std::vector<Edge>>& adj, int src,
                                std::vector<int>& parent) {
    int n = adj.size();
    std::vector<long long> dist(n, INF);
    parent.assign(n, -1);
    using State = std::pair<long long, int>;             // (目前距離, 節點)
    std::priority_queue<State, std::vector<State>, std::greater<State>> pq;
    dist[src] = 0;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;                        // 舊紀錄，跳過
        for (auto [v, w] : adj[u]) {
            if (d + w < dist[v]) {                        // 鬆弛成功
                dist[v] = d + w;
                parent[v] = u;
                pq.push({dist[v], v});                    // 舊紀錄不刪，取出時再跳過
            }
        }
    }
    return dist;
}

// 沿 parent 往回走再反轉；到不了回傳空的
std::vector<int> buildPath(const std::vector<long long>& dist, const std::vector<int>& parent, int t) {
    std::vector<int> path;
    if (dist[t] == INF) return path;
    for (int v = t; v != -1; v = parent[v]) path.push_back(v);
    std::reverse(path.begin(), path.end());
    return path;
}

// 鄰接矩陣版：mat[u][v] == INF 表示沒有邊。每輪掃一遍找最小，O(V²)
std::vector<long long> dijkstraDense(const std::vector<std::vector<long long>>& mat, int src) {
    int n = mat.size();
    std::vector<long long> dist(n, INF);
    std::vector<bool> done(n, false);
    dist[src] = 0;
    for (int round = 0; round < n; round++) {
        int u = -1;
        for (int i = 0; i < n; i++)
            if (!done[i] && (u == -1 || dist[i] < dist[u])) u = i;
        if (dist[u] == INF) break;                        // 剩下的都到不了
        done[u] = true;
        for (int v = 0; v < n; v++)
            if (mat[u][v] != INF && dist[u] + mat[u][v] < dist[v])
                dist[v] = dist[u] + mat[u][v];
    }
    return dist;
}

int main() {
    const std::string names = "ABCDEF";                   // 與互動示範同一張圖
    int roads[][3] = {{0, 1, 4}, {0, 2, 2}, {1, 2, 1}, {1, 3, 5}, {2, 3, 8},
                      {2, 4, 10}, {3, 4, 2}, {3, 5, 6}, {4, 5, 5}};
    int n = names.size();
    std::vector<std::vector<Edge>> adj(n);
    std::vector<std::vector<long long>> mat(n, std::vector<long long>(n, INF));
    for (auto& r : roads) {                               // 無向圖：兩個方向各加一次
        adj[r[0]].push_back({r[1], r[2]});
        adj[r[1]].push_back({r[0], r[2]});
        mat[r[0]][r[1]] = mat[r[1]][r[0]] = r[2];
    }

    std::vector<int> parent;
    auto dist = dijkstra(adj, 0, parent);
    for (long long d : dist) std::cout << d << ' ';       // 0 3 2 8 10 14
    std::cout << "\\n";
    for (int v : buildPath(dist, parent, 5)) std::cout << names[v] << ' ';  // A C B D F
    std::cout << "\\n";
    for (long long d : dijkstraDense(mat, 0)) std::cout << d << ' ';        // 0 3 2 8 10 14
    std::cout << "\\n";
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
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
          ]}
          cue="最短／最快／最便宜的路徑、邊有非負權重、成本沿路徑累加、單一起點到所有點、每格代價不同的網格、優先佇列加鬆弛。"
        />
      </Section>

      <Section id="concept">
        <p>
          BFS 能在無權圖上找最短路徑，是因為佇列的先進先出剛好等於「距離由小到大」。邊一旦有權重，這個對應就斷了：走兩段短路可能比走一段長路更近。<strong>Dijkstra</strong> 把佇列換成<strong>最小堆積</strong>，為每個節點維護目前已知的最短距離 <Code>dist</Code>（一開始是 ∞）。每一輪取出「還沒確定、而且 <Code>dist</Code> 最小」的節點 <Code>u</Code>，宣告它的距離確定，再用它的每條邊做<strong>鬆弛</strong>：若 <Code>dist[u] + w &lt; dist[v]</Code>，就把 <Code>dist[v]</Code> 改小，並記下 <Code>parent[v] = u</Code>。節點被確定的順序，就是它們離起點由近到遠的順序。
        </p>
        <p>
          為什麼取出的當下就能確定？設 <Code>u</Code> 是未確定節點裡 <Code>dist</Code> 最小的，值為 d。任何一條從起點到 <Code>u</Code> 的路徑，都得在某處第一次踏出「已確定集合」，走到某個未確定的節點 <Code>y</Code>。<Code>y</Code> 的前一個節點已經確定、確定時也用這條邊鬆弛過 <Code>y</Code>，所以走到 <Code>y</Code> 的長度至少是 <Code>dist[y]</Code>，而 <Code>dist[y] ≥ d</Code>；剩下從 <Code>y</Code> 到 <Code>u</Code> 的邊權都<strong>非負</strong>，只會讓總長再變大。因此沒有路徑比 d 更短，這就是這個貪婪選擇正確的原因。證明裡用到了「邊權非負」，負權邊會直接打破它：<Code>A→B = 2</Code>、<Code>A→C = 3</Code>、<Code>C→B = −2</Code>，B 在第二輪就以 2 被確定，但 <Code>A→C→B</Code> 只要 1。
        </p>
        <p>
          每個節點只會被確定一次，確定時掃過它的邊，所以每條邊最多鬆弛一次（無向圖兩個方向各一次）。每次鬆弛成功就 push 一筆，堆積最多 O(E) 筆，每次 push／pop 是 O(log E)，而 E ≤ V² 使得 log E ≤ 2 log V，總時間 <strong>O((V + E) log V)</strong>。空間上 <Code>dist</Code> 與 <Code>parent</Code> 是 O(V)；這裡用的是<strong>延遲刪除</strong>寫法，被更新掉的舊紀錄留在堆積裡，最壞累積到 O(E) 筆，換成支援 decrease-key 的堆積才能壓回 O(V)。不用堆積、每輪線性掃描找最小值則是 <strong>O(V²)</strong>，在 E 接近 V² 的稠密圖上反而比堆積版的 O(V² log V) 快。只問單一終點時，終點被<strong>取出</strong>的那一刻就能結束，實務上常常只看了圖的一小部分，但最壞情況仍要走完整張圖。
        </p>
        <p>
          常見錯誤有三個。第一，沿用 BFS 的習慣在 <strong>push 時</strong>就標記已走訪：Dijkstra 的節點可能先被遠路發現、之後才被近路更新，只能在<strong>取出時</strong>確定。第二，忘了跳過舊紀錄 <Code>if d &gt; dist[u]: continue</Code>：答案不會錯，但同一個節點會被重複展開，稠密圖上會慢很多。第三，C++ 把距離存在 <Code>int</Code>，權重一累加就溢位。怎麼和鄰近的演算法分工：邊權全是 1 用 <strong>BFS</strong>；權重只有 0 和 1 時，用雙端佇列的 0-1 BFS 就有 O(V + E)；有負權邊用 <strong>Bellman-Ford</strong>；圖是 DAG 時先拓撲排序再依序鬆弛，O(V + E) 而且負權也行；要任兩點之間的距離、而且圖不大，用 <strong>Floyd-Warshall</strong>。Prim 的最小生成樹和 Dijkstra 長得幾乎一樣，差別只在堆積裡比的是「單一條邊的權重」，而不是「從起點累加的距離」。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>建鄰接串列 <Code>adj[u] = [(v, w), …]</Code>，無向圖兩個方向各加一次。確認所有權重都 <strong>≥ 0</strong>，有負權就不能用。</>,
            <><Code>dist</Code> 全部設為 ∞、<Code>parent</Code> 設為 −1；<Code>dist[src] = 0</Code>，把 <Code>(0, src)</Code> 推入最小堆積。</>,
            <>取出堆頂 <Code>(d, u)</Code>。若 <Code>d &gt; dist[u]</Code>，這是被更新掉的舊紀錄，直接跳過；否則 <Code>dist[u]</Code> 在此確定。只要單一終點時，<Code>u</Code> 就是終點便可結束。</>,
            <>對 <Code>u</Code> 的每條邊 <Code>(v, w)</Code>：若 <Code>d + w &lt; dist[v]</Code>，更新 <Code>dist[v] = d + w</Code>、<Code>parent[v] = u</Code>，並推入 <Code>(dist[v], v)</Code>。堆積裡 <Code>v</Code> 的舊紀錄不必刪。</>,
            <>重複 3–4 直到堆積為空。仍是 ∞ 的節點代表到不了；要路徑就從終點沿 <Code>parent</Code> 走到 −1，再把序列反轉。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>六個路口 A–F 的無向圖，邊上的數字是通過那段路的分鐘數，從 A 出發，和程式碼的範例是同一張圖。節點顏色依圖例：黃色還在優先佇列裡，藍色是剛取出、正在鬆弛鄰邊的節點，處理完就變成「已確定」的實心圓。正在檢查的邊標成黃色，這次沒有更新就畫成虛線；藍色的邊是目前的最短路徑樹。留意 B：先經 A 直達記為 4，C 確定後改成 2 + 1 = 3，舊的 (4, B) 仍留在佇列裡，輪到它時被劃掉跳過。D、E 也各被改小一次；E 確定後試走 E–F，10 + 5 = 15 不比 14 短，不更新。最後一步用綠色標出 A → C → B → D → F，共 14 分鐘。</p>
        <DijkstraDemo />
      </Section>

      <Section id="code">
        <p>三個函式：延遲刪除的堆積版 Dijkstra（同時記錄 <Code>parent</Code>）、沿 <Code>parent</Code> 還原路徑，以及不用堆積、每輪掃描一遍的 O(V²) 鄰接矩陣版。兩個版本算出的距離相同，放在一起是為了對照：稀疏圖選堆積版，節點不多但邊幾乎兩兩相連時選矩陣版。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 743", name: "Network Delay Time（模板題：最遠節點的最短距離）", diff: "Medium" },
            { src: "LeetCode 1514", name: "Path with Maximum Probability（機率相乘，改用最大堆積）", diff: "Medium" },
            { src: "LeetCode 1631", name: "Path With Minimum Effort（網格上，路徑代價取最大值）", diff: "Medium" },
            { src: "LeetCode 1976", name: "Number of Ways to Arrive at Destination（順便計數最短路徑條數）", diff: "Medium" },
            { src: "LeetCode 2290", name: "Minimum Obstacle Removal to Reach Corner（權重只有 0 和 1，可改用 0-1 BFS）", diff: "Hard" },
            { src: "LeetCode 2203", name: "Minimum Weighted Subgraph With the Required Paths（在反向圖上也跑一次）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const dijkstraLesson: Lesson = { prereq: "BFS、Binary Heap、Adjacency List / Matrix", Body };
