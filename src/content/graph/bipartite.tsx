import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { BipartiteDemo } from "@/components/lesson/demos/BipartiteDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from collections import deque


def bipartite_colors(adj):
    """BFS 兩色染色。是二分圖回傳每個節點的顏色（0 或 1），否則回傳 None"""
    n = len(adj)
    color = [-1] * n                          # -1 表示還沒塗色
    for s in range(n):                        # 圖可能不連通：每個連通分量各起一次
        if color[s] != -1:
            continue
        color[s] = 0                          # 新分量的起點塗哪一色都可以
        queue = deque([s])
        while queue:
            u = queue.popleft()
            for v in adj[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]   # 鄰居被逼成相反色，沒有選擇
                    queue.append(v)
                elif color[v] == color[u]:
                    return None               # 兩端同色：圖裡有奇環
    return color


def find_odd_cycle(adj):
    """不是二分圖時回傳一個奇環（依序列出節點）當作證據；是二分圖回傳 None"""
    n = len(adj)
    depth, parent = [-1] * n, [-1] * n
    for s in range(n):
        if depth[s] != -1:
            continue
        depth[s] = 0
        queue = deque([s])
        while queue:
            u = queue.popleft()
            for v in adj[u]:
                if depth[v] == -1:
                    depth[v], parent[v] = depth[u] + 1, u
                    queue.append(v)
                elif depth[v] % 2 == depth[u] % 2:  # 顏色就是 BFS 層數的奇偶
                    a, b = [u], [v]
                    while a[-1] != b[-1]:           # 較深的一端先往上爬，直到會合
                        if depth[a[-1]] >= depth[b[-1]]:
                            a.append(parent[a[-1]])
                        else:
                            b.append(parent[b[-1]])
                    return a + b[-2::-1]            # u → 會合點 → v，再由邊 v–u 閉合
    return None


def first_conflict_edge(n, edges):
    """邊一條一條加入：回傳第一條讓圖不再是二分圖的邊的索引，沒有就回傳 -1"""
    parent = list(range(2 * n))               # x 代表「x 這一側」，x + n 代表「x 的對面」

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]     # 路徑減半
            x = parent[x]
        return x

    for i, (u, v) in enumerate(edges):
        if find(u) == find(v):                # u、v 早就被逼到同一側
            return i
        parent[find(u)] = find(v + n)         # u 和 v 的對面同側
        parent[find(v)] = find(u + n)         # v 和 u 的對面同側
    return -1


def build(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    return adj


if __name__ == "__main__":
    # 與互動示範同一張圖：A..F 編號為 0..5
    ok = [(0, 1), (0, 3), (1, 2), (2, 3), (2, 4), (3, 5), (4, 5)]
    odd = [(0, 1), (0, 3), (1, 2), (2, 3), (2, 4), (3, 4), (4, 5)]
    print(bipartite_colors(build(6, ok)))    # [0, 1, 0, 1, 1, 0]
    print(bipartite_colors(build(6, odd)))   # None
    print(["ABCDEF"[x] for x in find_odd_cycle(build(6, odd))])  # ['C', 'B', 'A', 'D', 'E']
    print(first_conflict_edge(6, odd))       # 5：加入 D–E 時，C–D–E 成了三角形`;

const cpp = `#include <iostream>
#include <numeric>
#include <queue>
#include <utility>
#include <vector>

using Graph = std::vector<std::vector<int>>;

// BFS 兩色染色：是二分圖回傳 true，color[u] 就是 u 被分到的組（0 或 1）
bool bipartiteColors(const Graph& adj, std::vector<int>& color) {
    int n = (int)adj.size();
    color.assign(n, -1);                          // -1 表示還沒塗色
    std::queue<int> q;
    for (int s = 0; s < n; ++s) {                 // 圖可能不連通：每個分量各起一次
        if (color[s] != -1) continue;
        color[s] = 0;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) {
                if (color[v] == -1) {
                    color[v] = 1 - color[u];      // 鄰居被逼成相反色
                    q.push(v);
                } else if (color[v] == color[u]) {
                    return false;                 // 兩端同色：圖裡有奇環
                }
            }
        }
    }
    return true;
}

// 併查集版：x 代表「x 這一側」，x + n 代表「x 的對面」
struct SideDSU {
    std::vector<int> parent;
    explicit SideDSU(int n) : parent(2 * n) { std::iota(parent.begin(), parent.end(), 0); }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];        // 路徑減半
            x = parent[x];
        }
        return x;
    }
    void unite(int a, int b) { parent[find(a)] = find(b); }
};

// 邊一條一條加入，回傳第一條讓圖不再是二分圖的邊的索引，沒有就回傳 -1
int firstConflictEdge(int n, const std::vector<std::pair<int, int>>& edges) {
    SideDSU dsu(n);
    for (int i = 0; i < (int)edges.size(); ++i) {
        auto [u, v] = edges[i];
        if (dsu.find(u) == dsu.find(v)) return i;  // 早就被逼到同一側
        dsu.unite(u, v + n);                       // u 和 v 的對面同側
        dsu.unite(v, u + n);
    }
    return -1;
}

int main() {
    auto build = [](int n, const std::vector<std::pair<int, int>>& edges) {
        Graph adj(n);
        for (auto [u, v] : edges) {
            adj[u].push_back(v);
            adj[v].push_back(u);
        }
        return adj;
    };
    // 與互動示範同一張圖：A..F 編號為 0..5
    std::vector<std::pair<int, int>> ok = {{0, 1}, {0, 3}, {1, 2}, {2, 3}, {2, 4}, {3, 5}, {4, 5}};
    std::vector<std::pair<int, int>> odd = {{0, 1}, {0, 3}, {1, 2}, {2, 3}, {2, 4}, {3, 4}, {4, 5}};
    std::vector<int> color;
    if (bipartiteColors(build(6, ok), color)) {
        for (int c : color) std::cout << c << ' ';  // 0 1 0 1 1 0
        std::cout << '\\n';
    }
    std::cout << std::boolalpha << bipartiteColors(build(6, odd), color) << '\\n';  // false
    std::cout << firstConflictEdge(6, odd) << '\\n';                                // 5
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "期末考只借到兩個時段",
              problem: "系辦只借到上午、下午兩個考場時段，要排 60 門課的期末考。只要有學生同時修兩門課，那兩門就不能排在同一個時段，選課資料裡這樣的課程組合有 400 組。",
              why: "課程當節點、衝突當邊，問題就變成「能不能用兩種顏色塗、相鄰不同色」。任選一門課放上午，和它衝突的課只能放下午，顏色一路被逼出來，一次 BFS 就有答案。排不下時，演算法找到的奇環（例如三門課兩兩衝突）就是「為什麼排不下」的具體證據，知道該把哪幾門移到補考時段。",
            },
            {
              title: "雙層電路板的走線分層",
              problem: "一塊雙層板上有 90 條走線，畫在同一個平面時有 140 對會交叉。交叉的兩條不能在同一層，只能一條走正面、一條走背面。",
              why: "把「會交叉」建成衝突圖，二分圖判定直接給出每條線走哪一層，O(V+E) 的成本在設計工具裡可以每改一次線就重跑。判定失敗時，奇環指出是哪幾條線互相卡住，工程師只要針對這一小群線加導通孔（via）或改道。",
            },
            {
              title: "跑配對演算法之前先分出兩邊",
              problem: "家教媒合平台要匯入舊系統的 8,000 個帳號與 25,000 筆「上過課」紀錄，再用二分匹配自動排下學期的課。但舊資料每筆只有兩個帳號 ID，沒有欄位標出誰是老師、誰是學生。",
              why: "二分匹配（例如 Hopcroft–Karp）要先知道左右兩邊。BFS 染色一遍就把帳號分成兩組，順便抓出髒資料：某個連通分量染色失敗代表紀錄裡有奇環，例如三個帳號兩兩上過課，這群帳號要先人工檢查。染色只能確定兩組「彼此對立」，哪組是老師，要看分量裡任一個已知身分的帳號。",
            },
          ]}
          cue="分成兩組、兩兩衝突不能同組、只有兩個時段／兩層／兩隊、相鄰不同色、奇數長度的環、二分匹配的前置、敵人的敵人是朋友。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>二分圖</strong>是節點能分成兩組、每條邊都橫跨兩組、同組之間沒有邊的圖。換個說法：能不能用兩種顏色塗每個節點，讓<strong>相鄰的節點不同色</strong>。判定的關鍵是顏色<strong>沒有選擇空間</strong>：起點塗 0，它的鄰居只能是 1，鄰居的鄰居只能是 0，整個連通分量的顏色都被起點這一個決定逼出來。所以不需要試誤或回溯，用 BFS（或 DFS）走一遍，邊走邊塗，檢查每條邊兩端是否同色就好。在 BFS 裡，節點的顏色其實就是它到起點距離的奇偶 <Code>dist % 2</Code>。
        </p>
        <p>
          正確性靠一個定理：<strong>圖是二分圖，若且唯若圖裡沒有奇數長度的環</strong>。一個方向很直接：沿著環走，顏色必須 0、1、0、1 交替，走奇數步回到起點時顏色對不上，所以有奇環一定塗不出來。另一個方向正是演算法的保證：若發現邊 <Code>(u, v)</Code> 兩端同色，表示 <Code>depth[u]</Code> 和 <Code>depth[v]</Code> 奇偶相同；從 <Code>u</Code>、<Code>v</Code> 各自沿 BFS 樹往上走到會合點 <Code>w</Code>，兩段長度 <Code>depth[u] − depth[w]</Code> 與 <Code>depth[v] − depth[w]</Code> 相加是偶數，再加上邊 <Code>(u, v)</Code> 就是一個<strong>奇環</strong>。因此衝突不是「起點塗錯色」造成的假警報，換任何塗法都救不回來；反過來，走完沒有衝突，手上的顏色本身就是一組合法的分法。
        </p>
        <p>
          每個節點只會被塗色、進出佇列各一次，O(V)；無向圖的每條邊在鄰接串列裡出現兩次，各檢查一次，O(E)；外層迴圈掃過所有節點找未塗色的起點，再加 O(V)。總時間 <strong>O(V + E)</strong>。遇到衝突可以立刻停，所以「不是」可能很快就知道，但要確認「是」一定得看完每條邊。額外空間是顏色陣列加佇列 <strong>O(V)</strong>（不含圖本身）；遞迴 DFS 也是 O(V)，但一條長鏈就讓遞迴深度到 V，Python 容易超過遞迴上限。如果邊是一條一條加進來、每加一條就要回答，改用<strong>併查集</strong>：每個節點拆成「自己這一側」和「對面」兩份，每次加邊幾乎是常數時間（範例只做路徑減半；再加上按大小合併，就是嚴格的 O(E·α(V))）。
        </p>
        <p>
          最常見的錯是<strong>只從節點 0 開始</strong>：圖不連通時其他分量完全沒檢查，外層一定要對每個還沒塗色的節點各起一次（LeetCode 785 題目就明說圖可能不連通）。每個連通分量的 0 和 1 可以整組對調，有 c 個分量就有 <Code>2^c</Code> 種塗法，題目若要某一組盡量大，要逐個分量決定。自環 <Code>(u, u)</Code> 讓節點和自己同色，直接判定不是二分圖；有向邊當成無向看。和<strong>環偵測</strong>不同，這裡有環沒關係，只怕奇環，正方形這種偶環照樣是二分圖。和一般的<strong>圖著色</strong>相比，兩色能在線性時間判定，但「能不能用三色塗」是 NP 完全問題，沒有已知的多項式演算法，兩色是特別好做的特例。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>建無向鄰接串列（有向邊也當成無向），開 <Code>color</Code> 陣列全部設為 <Code>-1</Code>，代表還沒塗色。</>,
            <>依序掃每個節點 <Code>s</Code>：若 <Code>color[s] == -1</Code>，它是新連通分量的起點，塗 <Code>0</Code> 並放入佇列。</>,
            <>從佇列取出 <Code>u</Code>，看每個鄰居 <Code>v</Code>：還沒塗色就塗 <Code>1 − color[u]</Code> 並放入佇列；已塗色且 <Code>color[v] == color[u]</Code> 就<strong>立刻回傳「不是二分圖」</strong>；顏色不同則略過。</>,
            <>佇列清空後回到步驟 2 找下一個起點。全部跑完都沒有衝突就是二分圖，<Code>color</Code> 為 0 與 1 的節點各是一組。</>,
            <>要奇環當證據：多記 <Code>parent</Code> 與 <Code>depth</Code>，從衝突邊 <Code>(u, v)</Code> 兩端讓較深的一端先往上爬，直到會合，兩段路徑接起來再加上這條邊。</>,
            <>邊是動態加入時改用併查集，開 <Code>2n</Code> 個節點：加邊 <Code>(u, v)</Code> 前若 <Code>find(u) == find(v)</Code> 就衝突，否則合併 <Code>u</Code> 與 <Code>v + n</Code>、<Code>v</Code> 與 <Code>u + n</Code>。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>兩個例子都是 A 到 F 六個節點、七條邊，從 A 開始 BFS，鄰居按字母順序處理。「例子 1：可二分」由 A–B–C–D 和 C–E–F–D 兩個四邊形組成，全是偶環，最後藍色（顏色 0）是 A、C、F，綠色（顏色 1）是 B、D、E。「例子 2：含奇環」把 D–F 換成 D–E，多了三角形 C–D–E：處理 C 時發現鄰居 E 和它同為顏色 0，演算法立刻停下，黃線標出兩條染色路徑加上衝突邊圍成的奇環 C–B–A–D–E，最粗的那條是衝突邊。黃框是還在佇列裡的節點，粗框是正在處理的節點；藍色實線是塗色時走過的邊，正在檢查的其他邊以虛線標出。留意找到的奇環不一定是最短的，但任何一個都足以證明塗不出來。</p>
        <BipartiteDemo />
      </Section>

      <Section id="code">
        <p>BFS 兩色染色是本體，外層迴圈處理不連通的圖。併查集版把每個節點拆成「這一側」與「對面」，適合邊一條一條加入、每次都要回答的情況，LeetCode 886 也能這樣寫。Python 另外示範在衝突時找出奇環，把「不是二分圖」變成看得見的證據。範例用的就是互動示範的兩張圖，A 到 F 編號為 0 到 5。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 785", name: "Is Graph Bipartite?（圖可能不連通）", diff: "Medium" },
            { src: "LeetCode 886", name: "Possible Bipartition（討厭關係建圖，也能用併查集）", diff: "Medium" },
            { src: "LeetCode 1042", name: "Flower Planting With No Adjacent（對照：四色且度數不超過 3，貪婪就夠）", diff: "Medium" },
            { src: "LeetCode 1129", name: "Shortest Path with Alternating Colors（每個節點拆成兩種狀態）", diff: "Medium" },
            { src: "LeetCode 2493", name: "Divide Nodes Into the Maximum Number of Groups（先判二分，再算每個分量的最多層數）", diff: "Hard" },
            { src: "LeetCode 2608", name: "Shortest Cycle in a Graph（非樹邊加兩條 BFS 路徑就是環）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const bipartiteLesson: Lesson = { prereq: "BFS、DFS、Union-Find", Body };
