import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { FloydDemo } from "@/components/lesson/demos/FloydDemo";
import type { Lesson } from "@/lib/lessons";

const python = `INF = float("inf")


def floyd_warshall(n, edges):
    """回傳 (dist, nxt)：dist[i][j] 是 i 到 j 的最短距離，nxt[i][j] 是路徑上 i 之後的第一個節點。O(V³)"""
    dist = [[0 if i == j else INF for j in range(n)] for i in range(n)]
    nxt = [[i if i == j else None for j in range(n)] for i in range(n)]
    for u, v, w in edges:
        if w < dist[u][v]:                      # 同一對節點有多條邊時取最小
            dist[u][v] = w
            nxt[u][v] = v
    for k in range(n):                          # k 一定要在最外層
        for i in range(n):
            if dist[i][k] == INF:
                continue
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    nxt[i][j] = nxt[i][k]       # 先往 k 的方向走
    return dist, nxt


def has_negative_cycle(dist):
    return any(dist[i][i] < 0 for i in range(len(dist)))


def get_path(nxt, u, v):
    if nxt[u][v] is None:                       # 走不到
        return []
    path = [u]
    while u != v:
        u = nxt[u][v]
        path.append(u)
    return path


def transitive_closure(n, edges):
    """Warshall：reach[i] 的第 j 個位元表示 i 能不能走到 j。用整數當位元集合，一次 OR 一整列"""
    reach = [1 << i for i in range(n)]
    for u, v in edges:
        reach[u] |= 1 << v
    for k in range(n):
        for i in range(n):
            if reach[i] >> k & 1:               # i 走得到 k，k 走得到的 i 也都走得到
                reach[i] |= reach[k]
    return reach


if __name__ == "__main__":
    A, B, C, D = range(4)
    edges = [(A, B, 4), (A, D, 9), (D, A, 1), (B, C, -2), (B, D, 5), (C, D, 3), (D, C, 8), (C, A, 6)]
    dist, nxt = floyd_warshall(4, edges)
    for row in dist:
        print(row)                              # [0, 4, 2, 5] / [2, 0, -2, 1] / [4, 8, 0, 3] / [1, 5, 3, 0]
    print("".join("ABCD"[x] for x in get_path(nxt, D, C)))   # DABC
    bad = [(u, v, -9 if (u, v) == (B, C) else w) for u, v, w in edges]
    print(has_negative_cycle(floyd_warshall(4, bad)[0]))      # True：B → C → D → A → B 總和 -1

    roles = ["admin", "editor", "viewer", "auditor"]
    reach = transitive_closure(4, [(0, 1), (1, 2), (3, 2)])  # admin 繼承 editor，editor 繼承 viewer
    print([roles[j] for j in range(4) if reach[0] >> j & 1])  # ['admin', 'editor', 'viewer']`;

const cpp = `#include <algorithm>
#include <iostream>
#include <limits>
#include <vector>

using Matrix = std::vector<std::vector<long long>>;
const long long INF = std::numeric_limits<long long>::max() / 4;   // 留空間，兩個 INF 相加也不會溢位

// 最短距離，dist 直接原地更新
void floydWarshall(Matrix& dist) {
    int n = static_cast<int>(dist.size());
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++) {
            if (dist[i][k] == INF) continue;
            for (int j = 0; j < n; j++)
                if (dist[k][j] != INF && dist[i][k] + dist[k][j] < dist[i][j])   // 兩段都要走得到
                    dist[i][j] = dist[i][k] + dist[k][j];
        }
}

// 同一套三層迴圈換成「瓶頸」運算：路徑的頻寬是沿途最窄的那段，目標是讓它最大
Matrix widestPath(Matrix cap) {
    int n = static_cast<int>(cap.size());
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                cap[i][j] = std::max(cap[i][j], std::min(cap[i][k], cap[k][j]));
    return cap;
}

int main() {
    const int A = 0, B = 1, C = 2, D = 3;
    Matrix dist(4, std::vector<long long>(4, INF));
    for (int i = 0; i < 4; i++) dist[i][i] = 0;
    dist[A][B] = 4; dist[A][D] = 9; dist[D][A] = 1; dist[B][C] = -2;
    dist[B][D] = 5; dist[C][D] = 3; dist[D][C] = 8; dist[C][A] = 6;
    floydWarshall(dist);
    for (long long x : dist[D]) std::cout << x << ' ';        // 1 5 3 0
    std::cout << '\\n';

    // 無向網路的頻寬（Mbps），0 表示沒有直接相連；自己到自己設成無限大
    Matrix cap(4, std::vector<long long>(4, 0));
    auto link = [&](int u, int v, long long c) { cap[u][v] = cap[v][u] = c; };
    link(A, B, 100); link(B, C, 40); link(A, C, 10); link(C, D, 80); link(B, D, 30);
    for (int i = 0; i < 4; i++) cap[i][i] = INF;
    std::cout << widestPath(cap)[A][D] << '\\n';              // 40：A → B → C → D，最窄是 B–C 的 40
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
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
          ]}
          cue="任意兩點之間的最短距離都要、節點數在幾百以內、圖很稠密、有負權邊但沒有負環、可達性或遞移閉包、瓶頸路徑、需要大量兩點查詢。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>全點對最短路徑</strong>要算出每一對 (i, j) 的最短距離。可以從每個點各跑一次 Dijkstra，但遇到負權邊就不行；每個點各跑一次 Bellman-Ford 則是 O(V²E)。<strong>Floyd-Warshall</strong> 用動態規劃一次解決，程式只有三層迴圈。狀態定義為：<Code>d_k[i][j]</Code> 是從 i 到 j、<strong>中間只允許經過前 k 個節點</strong>的最短距離。k = 0 時不能經過任何中間點，就是原始的邊；允許經過全部 V 個節點時，就是真正的答案。
        </p>
        <p>
          從 <Code>d_(k−1)</Code> 推到 <Code>d_k</Code> 只要考慮新加入的節點 k。最短路徑要嘛沒經過 k，距離仍是 <Code>d_(k−1)[i][j]</Code>；要嘛經過 k，而沒有負環時最短路徑不會重複經過同一個點，所以恰好經過一次，拆成 i 到 k、k 到 j 兩段，每段的中間點都只用到前 k − 1 個：<Code>d_k[i][j] = min(d_(k−1)[i][j], d_(k−1)[i][k] + d_(k−1)[k][j])</Code>。k 必須放在<strong>最外層</strong>。三維的表可以壓成一張二維矩陣原地更新，因為第 k 輪裡第 k 列和第 k 行不會改變：<Code>d[i][k] + d[k][k]</Code> 裡的 <Code>d[k][k] = 0</Code>。
        </p>
        <p>
          時間 <strong>O(V³)</strong>，空間 <strong>O(V²)</strong>。V = 500 大約是 1.25 億次簡單運算，C++ 不到一秒；V 到幾千就太慢了，稀疏且沒有負權的圖改用每個點跑一次 Dijkstra 的 O(V·E log V)。算完之後若有某個 <Code>d[i][i] &lt; 0</Code>，表示從 i 出發能繞回自己而且總權重是負的，也就是<strong>負環</strong>。要還原路徑就多存一張 <Code>next[i][j]</Code>，表示從 i 往 j 的第一步，更新時令 <Code>next[i][j] = next[i][k]</Code>。把加法和取最小換成其他運算，同一個骨架還能算遞移閉包（AND、OR）和最大瓶頸路徑（min、max）。
        </p>
        <p>
          常見的坑：把 k 放在內層迴圈，得到的不是最短距離；用 <Code>INT_MAX</Code> 當無限大，兩個相加就溢位，或是 ∞ 加上負權以後看起來比 ∞ 小，產生其實走不到的假路徑，所以兩段都要先確認不是 ∞；忘了把 <Code>d[i][i]</Code> 設為 0；同一對節點有多條邊時沒有取最小；無向圖只設了一個方向。有負環時矩陣的值沒有意義，而且數字會越來越小，嚴重時也會溢位。和鄰近課程的關係：Dijkstra 和 Bellman-Ford 是單源，Floyd-Warshall 是全點對；它用的是 Adjacency Matrix 表示法；狀態「只允許前 k 個中間點」是很典型的 DP 設計。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>建 V × V 的矩陣 <Code>dist</Code>：<Code>dist[i][i] = 0</Code>，每條邊 <Code>u → v</Code> 設為 <Code>min(原值, w)</Code>，其餘為 ∞；要還原路徑就同時令 <Code>next[u][v] = v</Code>。</>,
            <>最外層 k 從 0 到 V − 1，代表「現在允許經過 k」。</>,
            <>內兩層枚舉 i、j：若 <Code>dist[i][k]</Code> 和 <Code>dist[k][j]</Code> 都不是 ∞，而且兩者相加小於 <Code>dist[i][j]</Code>，就更新 <Code>dist[i][j]</Code>，並令 <Code>next[i][j] = next[i][k]</Code>。</>,
            <>三層迴圈結束後檢查對角線，任何 <Code>dist[i][i] &lt; 0</Code> 都表示圖中有負環。</>,
            <>查詢距離直接讀 <Code>dist[i][j]</Code>；要路徑就從 i 出發，反覆走到 <Code>next[目前][j]</Code>，直到抵達 j。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>4 個節點、8 條有向邊，B → C 的權重是 −2。右邊的距離矩陣一開始只有直接相連的邊。每一輪先選定中間點 k（黃色節點，矩陣裡第 k 列和第 k 行加上黃框），接著逐一顯示這一輪有被改小的格子：藍色是正在更新的 dist[i][j]，實心黃色是它用到的 dist[i][k] 和 dist[k][j]，綠色是這一輪已經更新過的格子。k = A 讓 C、D 能經過 A 走到 B；k = B 把負權邊用上，A → C 從 ∞ 變成 2、D → C 從 8 變成 3；k = C 和 k = D 再各改 3 格，其中 B → A 和 C → B 都被改了兩次。最後檢查對角線沒有負數，並用 next 表還原 D 到 C 的最短路徑 D → A → B → C，總長 3。</p>
        <FloydDemo />
      </Section>

      <Section id="code">
        <p>Python 放完整版：處理重複邊、記錄 next 還原路徑、檢查負環，另外附上用位元集合做遞移閉包的 Warshall 版本，以角色繼承為例。C++ 放原地更新的最短距離版本，INF 取最大值的四分之一以免相加溢位，並示範把運算換成 min 和 max 的最大頻寬路徑。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1334", name: "Find the City With the Smallest Number of Neighbors at a Threshold Distance", diff: "Medium" },
            { src: "LeetCode 1462", name: "Course Schedule IV（遞移閉包）", diff: "Medium" },
            { src: "LeetCode 399", name: "Evaluate Division（把加法換成乘法的 Floyd-Warshall）", diff: "Medium" },
            { src: "LeetCode 2976", name: "Minimum Cost to Convert String I（26 個字母之間的最短轉換成本）", diff: "Medium" },
            { src: "LeetCode 2959", name: "Number of Possible Sets of Closing Branches（枚舉子集合，每次跑一次 Floyd-Warshall）", diff: "Hard" },
            { src: "LeetCode 2977", name: "Minimum Cost to Convert String II", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const floydLesson: Lesson = { prereq: "Bellman-Ford、Adjacency List / Matrix", Body };
