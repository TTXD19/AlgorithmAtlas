import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { MstDemo } from "@/components/lesson/demos/MstDemo";
import type { Lesson } from "@/lib/lessons";

const python = `import heapq


class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # 路徑減半
            x = self.parent[x]
        return x

    def union(self, a, b):
        a, b = self.find(a), self.find(b)
        if a == b:
            return False                        # 早就同一群：這條邊會成環
        if self.size[a] < self.size[b]:
            a, b = b, a
        self.parent[b] = a
        self.size[a] += self.size[b]
        return True


def kruskal(n, edges):
    """edges 是 (u, v, w)。回傳 (總權重, 選中的邊)，圖不連通時回傳 None。O(E log E)"""
    dsu, total, chosen = DSU(n), 0, []
    for w, u, v in sorted((w, u, v) for u, v, w in edges):
        if dsu.union(u, v):
            total += w
            chosen.append((u, v, w))
            if len(chosen) == n - 1:            # 收滿 V - 1 條就可以停
                break
    return (total, chosen) if len(chosen) == n - 1 else None


def prim(n, edges, start=0):
    """lazy Prim：堆積裡可能有兩端都在樹內的舊邊，取出時再丟掉。O(E log E)"""
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((w, v))
        adj[v].append((w, u))
    in_tree, total, count = [False] * n, 0, 0
    heap = [(0, start)]
    while heap and count < n:
        w, u = heapq.heappop(heap)
        if in_tree[u]:
            continue
        in_tree[u] = True
        total += w                              # 注意是邊的權重，不是到起點的距離
        count += 1
        for e in adj[u]:
            if not in_tree[e[1]]:
                heapq.heappush(heap, e)
    return total if count == n else None


def clusters(points, k):
    """單一連結分群：Kruskal 做到剩下 k 群就停，等於把 MST 最長的 k - 1 條邊剪掉"""
    n = len(points)
    edges = sorted((abs(p[0] - q[0]) + abs(p[1] - q[1]), i, j)
                   for i, p in enumerate(points) for j, q in enumerate(points) if i < j)
    dsu, groups = DSU(n), n
    for _, i, j in edges:
        if groups == k:
            break
        if dsu.union(i, j):
            groups -= 1
    out = {}
    for i in range(n):
        out.setdefault(dsu.find(i), []).append(i)
    return sorted(out.values())


if __name__ == "__main__":
    A, B, C, D, E, F = range(6)
    edges = [(A, B, 3), (A, D, 2), (B, D, 4), (B, E, 1), (D, E, 5), (B, C, 7), (C, E, 6), (C, F, 4), (E, F, 8)]
    total, chosen = kruskal(6, edges)
    print(total, ["ABCDEF"[u] + "ABCDEF"[v] for u, v, _ in chosen])   # 16 ['BE', 'AD', 'AB', 'CF', 'CE']
    print(prim(6, edges))                       # 16：兩種方法總權重一定相同
    print(kruskal(4, [(0, 1, 1), (2, 3, 1)]))   # None：圖不連通，沒有生成樹
    pts = [(0, 0), (1, 0), (0, 1), (10, 10), (11, 10), (10, 11), (20, 0)]
    print(clusters(pts, 3))                     # [[0, 1, 2], [3, 4, 5], [6]]`;

const cpp = `#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <limits>
#include <numeric>
#include <utility>
#include <vector>

struct DSU {
    std::vector<int> parent, size;
    explicit DSU(int n) : parent(n), size(n, 1) { std::iota(parent.begin(), parent.end(), 0); }
    int find(int x) { return parent[x] == x ? x : parent[x] = find(parent[x]); }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (size[a] < size[b]) std::swap(a, b);
        parent[b] = a;
        size[a] += size[b];
        return true;
    }
};

struct Edge { int u, v; long long w; };

// Kruskal：適合邊的清單已經給好的稀疏圖。回傳 -1 表示圖不連通
long long kruskal(int n, std::vector<Edge> edges) {
    std::sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) { return a.w < b.w; });
    DSU dsu(n);
    long long total = 0;
    int used = 0;
    for (const Edge& e : edges)
        if (dsu.unite(e.u, e.v)) {
            total += e.w;
            if (++used == n - 1) break;
        }
    return used == n - 1 ? total : -1;
}

// 陣列版 Prim：任兩點都有邊的完全圖，E ≈ V²/2，不用堆積反而最快，O(V²)
long long primDense(const std::vector<std::pair<int, int>>& pts) {
    int n = static_cast<int>(pts.size());
    const long long INF = std::numeric_limits<long long>::max();
    std::vector<long long> key(n, INF);                     // key[v]：v 連到目前這棵樹最便宜的邊
    std::vector<char> inTree(n, 0);
    key[0] = 0;
    long long total = 0;
    for (int it = 0; it < n; it++) {
        int u = -1;
        for (int v = 0; v < n; v++)
            if (!inTree[v] && (u == -1 || key[v] < key[u])) u = v;
        inTree[u] = 1;
        total += key[u];
        for (int v = 0; v < n; v++) {
            long long d = std::abs(pts[u].first - pts[v].first) + std::abs(pts[u].second - pts[v].second);
            if (!inTree[v] && d < key[v]) key[v] = d;
        }
    }
    return total;
}

int main() {
    std::vector<Edge> edges = {{0, 1, 3}, {0, 3, 2}, {1, 3, 4}, {1, 4, 1}, {3, 4, 5}, {1, 2, 7}, {2, 4, 6}, {2, 5, 4}, {4, 5, 8}};
    std::cout << kruskal(6, edges) << ' ' << kruskal(4, {{0, 1, 1}, {2, 3, 1}}) << '\\n';   // 16 -1

    std::vector<std::pair<int, int>> pts = {{0, 0}, {1, 0}, {0, 1}, {10, 10}, {11, 10}, {10, 11}, {20, 0}};
    std::cout << primDense(pts) << '\\n';                   // 42：用曼哈頓距離把 7 個點全部連起來的最小成本
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "規劃電網與光纖網路",
              problem: "電力公司要把 40 個村落接上電網，任兩個村落之間拉線的成本不同，取決於距離和地形。每個村落都要通電，但不必兩兩直接相連，只要彼此之間有路可通，而總施工成本要最低。",
              why: "「全部連通、總成本最低」的網路一定沒有環，否則拿掉環上最貴的那段線仍然連通、成本更低，所以答案就是最小生成樹。1926 年捷克數學家 Borůvka 正是為了替摩拉維亞地區規劃電網，提出了第一個最小生成樹演算法。",
            },
            {
              title: "資料的單一連結分群",
              problem: "有 5,000 筆客戶資料，每筆是一個特徵向量。行銷團隊想把客戶分成 8 群，同一群的客戶要彼此相似，不同群之間的差距要盡量大，但沒有人知道群的形狀，不一定是圓的。",
              why: "把每筆資料當節點、兩兩距離當邊權，跑 Kruskal 但不做到最後：每收一條邊就少一群，剩下 8 群時停下來。這等於把最小生成樹最長的 7 條邊剪掉，結果就是單一連結的階層式分群。它能分出細長或彎曲形狀的群，這是只看群中心的 k-means 做不到的。",
            },
            {
              title: "電路板鑽孔的路線",
              problem: "數控機台要在電路板上鑽 2,000 個孔，鑽頭要走遍所有孔位再回到原點，移動路線越短，生產越快。要找出真正最短的路線是旅行推銷員問題，數量大到算不出來。",
              why: "先求出孔位之間的最小生成樹，再用深度優先走訪這棵樹，依第一次拜訪的順序去鑽孔，已經走過的點直接跳過。只要距離滿足三角不等式，這條路線的長度保證不超過最佳解的 2 倍，而最小生成樹 O(V²) 就算得出來，是最經典的近似演算法之一。",
            },
          ]}
          cue="把所有點連起來而且總成本最低、沒有指定起點終點、任兩點之間的連線成本、拿掉最長的邊來分群、路徑上最大的邊要最小（瓶頸路徑）、併查集。"
        />
      </Section>

      <Section id="concept">
        <p>
          連通的無向圖裡，<strong>生成樹</strong>是挑出 V − 1 條邊，讓所有節點連通而且沒有環；<strong>最小生成樹</strong>（MST）是總權重最小的那一棵。它和最短路徑樹不一樣：Dijkstra 讓每個點到起點的距離最短，MST 只在乎所有邊的總和。兩個主要演算法都建立在<strong>切割性質</strong>上：把節點任意分成兩邊，橫跨兩邊的邊裡最輕的那一條，一定屬於某棵最小生成樹。理由是交換論證：如果某棵 MST 沒用它，把它加進去會形成一個環，環上一定還有另一條橫跨兩邊的邊，換掉那條，總權重不會變大。
        </p>
        <p>
          <strong>Kruskal</strong> 從全域角度貪心：把所有邊依權重由小到大排序，一條一條看，兩端屬於不同連通塊就收下並合併，同一塊就丟掉，因為兩端之間早就有路，加上去會成環。收下的每條邊，都是「它所在的連通塊和其他節點之間」最輕的邊，符合切割性質。判斷兩端是否同塊用 <strong>Union-Find</strong>，幾乎是常數時間，所以總成本由排序決定：<strong>O(E log E)</strong> 時間、<strong>O(V)</strong> 額外空間。它適合邊的清單已經給好的稀疏圖，收滿 V − 1 條就可以提早停。
        </p>
        <p>
          <strong>Prim</strong> 從一個節點長出一棵樹：每一步都挑「一端在樹內、一端在樹外」最輕的邊，把樹外那端加進來，切割就是「樹」和「其他節點」。用最小堆積存候選邊，取出時若另一端已經在樹裡就丟掉（lazy 版本），時間 <strong>O(E log E)</strong>。如果圖很稠密，例如平面上任兩點都有邊，E 約是 V²/2，改用陣列記錄每個樹外節點到樹的最小邊權 <Code>key[v]</Code>，每輪線性掃描挑最小的，<strong>O(V²)</strong> 反而比用堆積快。
        </p>
        <p>
          常見的坑：圖不連通時沒有生成樹，Kruskal 收不滿 V − 1 條邊，要檢查並回報；Prim 把 <Code>key[v]</Code> 寫成 <Code>dist[u] + w</Code>，就變成 Dijkstra 了，MST 看的是單一條邊的權重；把有向圖丟給這兩個演算法，有向圖的最小樹形圖要用 Chu–Liu/Edmonds；併查集沒做路徑壓縮或按大小合併，最壞會退化成 O(V)。負權邊完全沒問題；要最大生成樹就改成由大到小排序。一個好用的性質是：MST 上任兩點之間的路徑，同時也讓「路徑上最大的邊」最小，所以瓶頸路徑問題也能用 Kruskal 解。和鄰近課程的關係：Kruskal 是 Union-Find 最經典的應用；Prim 的堆積寫法和 Dijkstra 幾乎一樣，只差比較的值；切割性質則是 Greedy Principles 裡交換論證的標準範例。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認是連通的無向圖。Kruskal：把所有邊依權重由小到大排序，併查集讓每個節點自成一群。</>,
            <>依序看每條邊 <Code>(u, v, w)</Code>：<Code>find(u) ≠ find(v)</Code> 就收下並 <Code>union</Code> 兩群；相同就跳過，它會成環。</>,
            <>收滿 V − 1 條邊就停止；看完所有邊還不到 V − 1 條，表示圖不連通。</>,
            <>Prim：從任一節點出發，把它的鄰邊放進最小堆積。每次取出最輕的邊，另一端已在樹裡就丟掉，否則把它加進樹，再放入它連到樹外的邊，直到 V 個節點都在樹裡。</>,
            <>稠密圖改用陣列版 Prim：維護每個樹外節點到樹的最小邊權 <Code>key[v]</Code>，每輪挑 key 最小的節點加入，再用它更新其他節點的 key，O(V²)。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>同一張 6 個節點、9 條邊的圖，上方切換兩種演算法。「Kruskal」模式右側是排序好的邊和目前的分群：B–E、A–D、A–B 依序收下，A、B、D、E 合成一群；接著 B–D（4）的兩端已經同群，變成虛線丟掉；C–F 收下；D–E（5）也同群丟掉；C–E（6）把兩群接起來，收滿 5 條邊，剩下 B–C 和 E–F 不用再看。「Prim」模式從 A 出發，右側是最小堆積：先取 A–D、A–B、B–E，之後取出的 D–B 和 D–E 另一端已經在樹裡，只能丟掉，再取 E–C、C–F 完成。藍色是選進生成樹的邊，黃色是這一步處理的邊。兩種方法選出的邊相同，總權重都是 16。</p>
        <MstDemo />
      </Section>

      <Section id="code">
        <p>Python 放併查集、Kruskal、lazy Prim，以及 Kruskal 做到剩 k 群就停的單一連結分群。C++ 放用排序加併查集的 Kruskal，並用 O(V²) 的陣列版 Prim 處理平面上任兩點都能相連的完全圖，這種圖邊太多，不值得先把所有邊列出來排序。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1584", name: "Min Cost to Connect All Points（完全圖，陣列版 Prim 最適合）", diff: "Medium" },
            { src: "LeetCode 778", name: "Swim in Rising Water（瓶頸路徑：依高度由低到高加入格子）", diff: "Hard" },
            { src: "LeetCode 1697", name: "Checking Existence of Edge Length Limited Paths（離線查詢，邊和查詢一起排序）", diff: "Hard" },
            { src: "LeetCode 1579", name: "Remove Max Number of Edges to Keep Graph Fully Traversable（兩份併查集）", diff: "Hard" },
            { src: "LeetCode 1489", name: "Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const mstLesson: Lesson = { prereq: "Union-Find、Binary Heap、Greedy Principles", Body };
