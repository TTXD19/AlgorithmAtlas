import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { AdjacencyDemo } from "@/components/lesson/demos/AdjacencyDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from collections import defaultdict

# 邊列表：最原始的輸入格式，通常題目就長這樣
edges = [("A", "B", 4), ("A", "D", 1), ("B", "C", 2), ("B", "E", 5), ("D", "E", 3), ("E", "C", 1)]


# 鄰接串列：每個節點對應它的鄰居（含權重）。O(V + E) 空間
def build_list(edges, directed=False):
    adj = defaultdict(list)
    for u, v, w in edges:
        adj[u].append((v, w))
        if not directed:
            adj[v].append((u, w))       # 無向圖兩邊都要記
    return adj

adj = build_list(edges)
for v, w in adj["B"]:                    # 走訪 B 的鄰居：只看實際存在的邊
    print(v, w)


# 鄰接矩陣：V×V 的表，matrix[i][j] 是邊的權重（0 或 None 表示沒有邊）。O(V²) 空間
def build_matrix(nodes, edges, directed=False):
    idx = {n: i for i, n in enumerate(nodes)}
    n = len(nodes)
    m = [[0] * n for _ in range(n)]
    for u, v, w in edges:
        m[idx[u]][idx[v]] = w
        if not directed:
            m[idx[v]][idx[u]] = w
    return m

m = build_matrix(["A", "B", "C", "D", "E"], edges)
print(m[1][2] != 0)                      # B 和 C 相鄰嗎？O(1)


# 節點是整數 0..n-1 時，最常見的寫法
n = 5
adj_int = [[] for _ in range(n)]
for u, v in [(0, 1), (0, 3), (1, 2), (1, 4), (3, 4), (4, 2)]:
    adj_int[u].append(v)
    adj_int[v].append(u)`;

const cpp = `#include <vector>
#include <utility>

// 節點編號 0..n-1，鄰接串列是最常用的形式
int n = 5;
std::vector<std::vector<int>> adj(n);
void addEdge(int u, int v, bool directed = false) {
    adj[u].push_back(v);
    if (!directed) adj[v].push_back(u);
}

// 帶權重：存 pair<鄰居, 權重>
std::vector<std::vector<std::pair<int, int>>> wadj(n);
void addWeighted(int u, int v, int w, bool directed = false) {
    wadj[u].push_back({v, w});
    if (!directed) wadj[v].push_back({u, w});
}

// 鄰接矩陣：稠密圖或需要 O(1) 判斷相鄰時用
std::vector<std::vector<int>> mat(n, std::vector<int>(n, 0));
void addEdgeMat(int u, int v, int w = 1, bool directed = false) {
    mat[u][v] = w;
    if (!directed) mat[v][u] = w;
}

// 走訪 u 的鄰居
// for (int v : adj[u]) { ... }
// for (auto [v, w] : wadj[u]) { ... }`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "社群網路的好友關係",
              problem: "十億個使用者、每人平均幾百個好友。要存「誰和誰是好友」，並快速列出某人的所有好友。",
              why: "鄰接矩陣要 10¹⁸ 格，宇宙裡的硬碟加起來都不夠；鄰接串列只存實際存在的邊，每個人一份好友清單，空間是 O(V + E)。真實世界的圖幾乎都是稀疏的，所以鄰接串列是預設選擇。",
            },
            {
              title: "路由與地圖",
              problem: "路口是節點，道路是邊，每條路有長度或時間。導航演算法要不斷問「從這個路口能走到哪些路口，各要多久」。",
              why: "鄰接串列每個節點對應 (鄰居, 權重) 的列表，正好回答這個問題。之後的 BFS、DFS、Dijkstra 全部以「走訪某節點的鄰居」為基本動作，資料結構選對了，演算法才寫得順。",
            },
            {
              title: "什麼時候該用矩陣",
              problem: "棋盤上每格和相鄰格都相連、或一個小型完全圖，節點少但邊很多，還要一直問「A 和 B 有直接相連嗎」。",
              why: "鄰接矩陣一格一格查是 O(1)，而且稠密圖裡矩陣沒有浪費。Floyd-Warshall 這類演算法也天生用矩陣。V 小於幾千、或 E 接近 V² 時考慮它。",
            },
          ]}
          cue="誰和誰相連、鄰居有哪些、有向／無向、帶權重、稀疏還是稠密、V 和 E 各多大。"
        />
      </Section>

      <Section id="concept">
        <p>
          圖由<strong>節點</strong>（vertex）和<strong>邊</strong>（edge）組成。邊可以有方向（有向圖：A → B 不代表 B → A）或沒有（無向圖），可以帶權重（距離、成本）或不帶。題目給的通常是<strong>邊列表</strong>，也就是一堆 (u, v) 或 (u, v, w)，那是最原始的格式，演算法幾乎不會直接在上面跑，第一步永遠是轉成下面兩種之一。
        </p>
        <p>
          <strong>鄰接串列</strong>：每個節點對應一個它鄰居的列表。空間 O(V + E)，列出 u 的鄰居只要讀那一列，這是走訪類演算法最常做的事。缺點是問「u 和 v 有沒有邊」要掃 u 的列表。無向圖的每條邊要在兩邊各記一次，所以列表總長是 2E。
        </p>
        <p>
          <strong>鄰接矩陣</strong>：V × V 的表格，matrix[u][v] 是邊的權重或 1。問「有沒有邊」是 O(1)，但列出鄰居要掃整列 O(V)，空間永遠是 O(V²)，不管實際有幾條邊。稠密圖或 V 很小時才划算。
          </p>
        <p>
          怎麼選：看 E 和 V² 的關係。社群網路、地圖、網頁連結這種<strong>稀疏圖</strong>（E ≪ V²）用串列；<strong>稠密圖</strong>或需要 O(1) 判斷相鄰用矩陣。實務上九成以上是串列。節點若是整數 0..n−1，用 <Code>list[list[int]]</Code>；若是字串或物件，用 <Code>dict[node, list]</Code>。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>看清楚題目：<strong>有向還是無向</strong>、<strong>有沒有權重</strong>、節點是整數還是其他東西、V 與 E 的大小。</>,
            <>預設建<strong>鄰接串列</strong>：<Code>adj = [[] for _ in range(n)]</Code> 或 <Code>defaultdict(list)</Code>。</>,
            <>對每條邊 (u, v)：<Code>adj[u].append(v)</Code>；無向圖再加 <Code>adj[v].append(u)</Code>。帶權就存 <Code>(v, w)</Code>。</>,
            <>只有在 E 接近 V²、或需要 O(1) 查「相鄰嗎」時，改用矩陣 <Code>[[0] * n for _ in range(n)]</Code>。</>,
            <>網格題不用真的建圖：把 (row, col) 當節點，四個方向就是邊，直接在陣列上走。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>同一張圖的兩種表示。切換有向／無向、帶不帶權重，點任一節點看它的鄰居在串列的哪一列、在矩陣的哪一行被標出來。注意兩種表示的格子數。</p>
        <AdjacencyDemo />
      </Section>

      <Section id="code">
        <p>從邊列表建鄰接串列與鄰接矩陣，分別處理有向／無向與權重。最後是節點為整數時最常見的寫法，之後的圖論課程都用這個形式。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1557", name: "Minimum Number of Vertices to Reach All Nodes（數入度）", diff: "Medium" },
            { src: "LeetCode 997", name: "Find the Town Judge（入度與出度）", diff: "Easy" },
            { src: "LeetCode 133", name: "Clone Graph", diff: "Medium" },
            { src: "LeetCode 1971", name: "Find if Path Exists in Graph（建圖後走訪）", diff: "Easy" },
            { src: "LeetCode 1436", name: "Destination City", diff: "Easy" },
          ]}
        />
      </Section>
    </>
  );
}

export const adjacencyLesson: Lesson = { prereq: "Array、Hash Table", Body };
