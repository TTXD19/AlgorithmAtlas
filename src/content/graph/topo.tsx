import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { TopoDemo } from "@/components/lesson/demos/TopoDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from collections import deque


def topo_kahn(n, edges):
    """Kahn：反覆取出入度為 0 的節點。有環時回傳 []。O(V+E)"""
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:                  # u → v：u 必須排在 v 前面
        adj[u].append(v)
        indeg[v] += 1
    queue = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1               # 移除邊 u → v
            if indeg[v] == 0:           # v 的前置條件全部排好了
                queue.append(v)
    return order if len(order) == n else []   # 少於 n 個代表有環


def topo_dfs(n, edges):
    """DFS：三色標記，完成順序反轉。O(V+E)"""
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * n
    post = []

    def dfs(u):
        color[u] = GRAY                 # 在呼叫堆疊上
        for v in adj[u]:
            if color[v] == GRAY:        # 回邊：有環
                return False
            if color[v] == WHITE and not dfs(v):
                return False
        color[u] = BLACK
        post.append(u)                  # u 能走到的節點都完成了，才輪到 u
        return True

    for i in range(n):                  # 圖不一定連通，每個起點都要試
        if color[i] == WHITE and not dfs(i):
            return []
    return post[::-1]


def topo_layers(n, edges):
    """Kahn 分層：同一層彼此沒有相依，可以平行處理"""
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    layer = [i for i in range(n) if indeg[i] == 0]
    layers, count = [], 0
    while layer:
        layers.append(layer)
        count += len(layer)
        nxt = []
        for u in layer:                 # 整層一起取出，再算下一層
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    nxt.append(v)
        layer = nxt
    return layers if count == n else []


if __name__ == "__main__":
    # 和互動示範同一張圖：0 react、1 ts、2 r-dom、3 lint、4 next、5 app
    edges = [(0, 2), (0, 4), (2, 4), (2, 5), (1, 3), (1, 4), (4, 5), (3, 5)]
    print(topo_kahn(6, edges))                    # [0, 1, 2, 3, 4, 5]
    print(topo_dfs(6, edges))                     # [1, 3, 0, 2, 4, 5]
    print(topo_layers(6, edges))                  # [[0, 1], [2, 3], [4], [5]]
    print(topo_kahn(3, [(0, 1), (1, 2), (2, 0)])) # []（有環）`;

const cpp = `#include <functional>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>

using Edges = std::vector<std::pair<int, int>>;   // (u, v)：u 必須排在 v 前面

// Kahn：反覆取出入度為 0 的節點。有環時回傳空陣列。O(V+E)
std::vector<int> topoKahn(int n, const Edges& edges) {
    std::vector<std::vector<int>> adj(n);
    std::vector<int> indeg(n, 0);
    for (auto [u, v] : edges) { adj[u].push_back(v); indeg[v]++; }
    std::queue<int> q;
    for (int i = 0; i < n; i++)
        if (indeg[i] == 0) q.push(i);
    std::vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u])
            if (--indeg[v] == 0) q.push(v);        // 移除邊後 v 沒有前置條件了
    }
    if ((int)order.size() < n) return {};          // 有環
    return order;
}

// DFS：三色標記，完成順序反轉。O(V+E)
std::vector<int> topoDfs(int n, const Edges& edges) {
    std::vector<std::vector<int>> adj(n);
    for (auto [u, v] : edges) adj[u].push_back(v);
    std::vector<int> color(n, 0), post;            // 0 白、1 灰（在堆疊上）、2 黑
    std::function<bool(int)> dfs = [&](int u) {
        color[u] = 1;
        for (int v : adj[u]) {
            if (color[v] == 1) return false;       // 回邊：有環
            if (color[v] == 0 && !dfs(v)) return false;
        }
        color[u] = 2;
        post.push_back(u);                         // 後繼都完成才輪到 u
        return true;
    };
    for (int i = 0; i < n; i++)
        if (color[i] == 0 && !dfs(i)) return {};
    return std::vector<int>(post.rbegin(), post.rend());
}

// 字典序最小的拓撲順序：佇列換成最小堆積。O(V log V + E)
std::vector<int> topoSmallest(int n, const Edges& edges) {
    std::vector<std::vector<int>> adj(n);
    std::vector<int> indeg(n, 0);
    for (auto [u, v] : edges) { adj[u].push_back(v); indeg[v]++; }
    std::priority_queue<int, std::vector<int>, std::greater<int>> pq;
    for (int i = 0; i < n; i++)
        if (indeg[i] == 0) pq.push(i);
    std::vector<int> order;
    while (!pq.empty()) {
        int u = pq.top(); pq.pop();                // 可以排的節點裡挑編號最小的
        order.push_back(u);
        for (int v : adj[u])
            if (--indeg[v] == 0) pq.push(v);
    }
    if ((int)order.size() < n) return {};
    return order;
}

void print(const std::vector<int>& v) {
    for (int x : v) std::cout << x << ' ';
    std::cout << "\\n";
}

int main() {
    // 和互動示範同一張圖：0 react、1 ts、2 r-dom、3 lint、4 next、5 app
    Edges edges = {{0, 2}, {0, 4}, {2, 4}, {2, 5}, {1, 3}, {1, 4}, {4, 5}, {3, 5}};
    print(topoKahn(6, edges));                     // 0 1 2 3 4 5
    print(topoDfs(6, edges));                      // 1 3 0 2 4 5
    print(topoSmallest(4, {{3, 1}, {2, 0}}));      // 2 0 3 1（普通佇列會是 2 3 0 1）
    std::cout << topoKahn(3, {{0, 1}, {1, 2}, {2, 0}}).size() << "\\n";  // 0（有環）
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "monorepo 的平行建置",
              problem: "一個 monorepo 有 40 個套件：web 依賴 ui 和 api-client，ui 又依賴 utils。改完程式要全部重新建置，每個套件都得等它依賴的套件建好才能開始，而 CI 機器有 8 個核心，能同時建的就想同時建。",
              why: "把「A 依賴 B」畫成邊 B → A，合法的建置順序就是拓撲順序。Kahn 演算法的佇列裡，每一刻放的都是「相依已經全部建好、可以立刻開工」的套件，把它們分給不同核心同時跑，就是 Turborepo、Bazel 這類工具排程的核心想法。",
            },
            {
              title: "四年修課規劃與先修檢查",
              problem: "資工系有 45 門必修，「演算法」要先修「資料結構」和「離散數學」，「作業系統」要先修「計算機組織」。系辦改了先修規定後，要確認學生在不限學分的情況下最少幾個學期修得完，也要確認沒有兩門課互相擋住。",
              why: "課程是節點、先修是邊。Kahn 一層一層剝：第一層是沒有先修的課，拿掉之後入度變成 0 的是第二層，層數就是最少學期數。剝到最後若還有課留著，代表先修規定裡有環，那幾門課永遠修不到。",
            },
            {
              title: "每天凌晨的資料管線",
              problem: "資料團隊用 dbt 管理 300 張報表，每張表的 SQL 用 ref() 引用別的表，例如「月營收」要等「訂單明細」和「匯率表」算完。每天凌晨全部重算一次，只要有一張表比它的上游先跑，報表數字就是錯的。",
              why: "表之間的引用構成一張有向無環圖（DAG），dbt 和 Airflow 在執行前都會先排出拓撲順序再照順序跑。有人不小心讓兩張表互相引用時，排序做不下去，工具在開跑之前就能報錯，而不是算到一半才出事。",
            },
          ]}
          cue="相依關係、先後順序、先修課程、A 必須在 B 之前完成、建置／安裝順序、DAG、排程能不能全部完成、有沒有循環相依。"
        />
      </Section>

      <Section id="concept">
        <p>
          有向圖的<strong>拓撲順序</strong>是把所有節點排成一列，讓每一條邊 <Code>u → v</Code> 的 <Code>u</Code> 都排在 <Code>v</Code> 前面。它存在的條件恰好是圖為 <strong>DAG</strong>（有向無環圖），而且通常不只一種。<strong>Kahn 演算法</strong>的直覺是「誰不用等，誰先做」：<strong>入度</strong>為 0 的節點沒有任何前置條件，可以排第一；排出去之後刪掉它的出邊，某些節點的入度降到 0，換它們上場。<strong>DFS 法</strong>從另一頭想：一個節點要等它能走到的節點全部處理完才算<strong>完成</strong>，把完成順序反轉，就是拓撲順序。
        </p>
        <p>
          為什麼對：Kahn 只在 <Code>indeg[v]</Code> 降到 0 時把 <Code>v</Code> 放進佇列，這時每條指向它的邊 <Code>u → v</Code> 都已被刪掉，也就是 <Code>u</Code> 都已輸出，所以每條邊都被遵守。它在 DAG 上不會卡住：非空的 DAG 一定有入度 0 的節點，否則沿著入邊一直往回走，節點有限，終究會走回走過的點，形成環；刪掉節點後剩下的仍是 DAG。反過來，佇列空了卻還有節點沒輸出，剩下的每個節點入度都 ≥ 1，往回走必定繞圈，所以<strong>輸出數少於 V 就代表有環</strong>，這是 Kahn 附帶的環偵測。DFS 法看任一條邊 <Code>u → v</Code>：檢查它時 <Code>v</Code> 若是白色，會在 <Code>u</Code> 之前遞迴完成；若是黑色，早就完成了；若是灰色（還在呼叫堆疊上），那就是環。所以無環時 <Code>v</Code> 一定比 <Code>u</Code> 先完成，反轉後 <Code>u</Code> 就在 <Code>v</Code> 前面。
        </p>
        <p>
          複雜度：Kahn 建入度表掃一次所有邊 O(E)；每個節點進出佇列各一次 O(V)；每條邊只在它的起點被取出時減一次入度 O(E)，合計 <strong>O(V+E)</strong>。DFS 法每個節點進入一次、每條邊檢查一次，也是 <strong>O(V+E)</strong>。兩者沒有最好或最壞情況之分，整張圖一定要跑完。額外空間是入度表、佇列、顏色陣列與輸出，都是 <strong>O(V)</strong>（鄰接串列本身的 O(V+E) 算在輸入裡）。DFS 的遞迴深度最壞是 V（一條長鏈），Python 預設遞迴上限只有 1000，節點多時改用 Kahn。
        </p>
        <p>
          最常見的錯是<strong>邊的方向接反</strong>：LeetCode 207、210 的 <Code>[a, b]</Code> 表示「修 a 之前要先修 b」，邊是 <Code>b → a</Code>。DFS 法常忘了<strong>反轉</strong>完成順序，或只用一個 visited 布林值、不區分灰色，結果圖裡有環也照樣輸出一個錯的順序；外層迴圈也要對每個節點都試，因為圖不一定連通。和相鄰課程的關係：Kahn 的佇列走法就是 BFS 的骨架，DFS 法是 DFS 的後序，三色標記和 Cycle Detection 完全相同，拓撲排序等於「做環偵測時順便記下順序」。要字典序最小的順序，把佇列換成最小堆積，時間變成 <Code>O(V log V + E)</Code>；要知道最少分幾輪平行做完，就讓 Kahn 一次處理一整層。有了拓撲順序，照順序鬆弛每條邊就能在 DAG 上求最短路徑，那是 DAG Shortest Path 的做法。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>把每條相依寫成邊：「<Code>u</Code> 必須在 <Code>v</Code> 之前」就加 <Code>u → v</Code>，同時 <Code>indeg[v] += 1</Code>。先確認題目給的 pair 是哪個方向。</>,
            <>把所有入度為 0 的節點放進佇列，它們沒有任何前置條件。</>,
            <>從佇列取出 <Code>u</Code> 加到答案；對 <Code>u</Code> 的每條出邊 <Code>u → v</Code> 做 <Code>indeg[v] -= 1</Code>，降到 0 就把 <Code>v</Code> 放進佇列。</>,
            <>佇列空了就停。答案長度等於 V 就是拓撲順序；少於 V 代表有環，入度還大於 0 的節點都卡在環上或環的下游。</>,
            <>DFS 寫法：三色標記，外層迴圈對每個白色節點呼叫 <Code>dfs</Code>；碰到灰色鄰居就是環；一個節點的鄰居全部處理完才把它加入 <Code>post</Code>，最後回傳 <Code>post</Code> 反轉。</>,
            <>變形：要分批平行處理，就一次把整層取完再算下一層，層數是最少輪數；要字典序最小，把佇列換成最小堆積。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>6 個前端套件、8 條相依，箭頭 <Code>u → v</Code> 表示裝 <Code>v</Code> 之前要先裝 <Code>u</Code>。「Kahn · 入度」模式看節點下方的 <Code>in=</Code>：每移除一條邊（變成虛線）就減 1，降到 0 的套件變黃色進佇列，藍色是正在處理的，填滿的是已輸出。「DFS · 完成順序」模式裡黃色是還在呼叫堆疊上的套件，節點下方標出它是第幾個完成，右欄同時列出完成順序與它的反轉。留意兩個模式的結果：Kahn 得到 react → ts → r-dom → lint → next → app，DFS 得到 ts → lint → react → r-dom → next → app，順序不同，但每條相依都成立。</p>
        <TopoDemo />
      </Section>

      <Section id="code">
        <p>兩種語言都有 Kahn 與 DFS 兩種寫法，範例圖和互動示範相同，輸出也分別對應兩個模式的結果。Kahn 不用遞迴、順便數出有沒有環，是實務上的預設選擇；DFS 版和環偵測共用三色標記，適合已經在做 DFS 的場合。Python 另外示範分層版本，每一層可以平行處理；C++ 示範把佇列換成最小堆積，得到字典序最小的順序。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1557", name: "Minimum Number of Vertices to Reach All Nodes（入度為 0 的節點）", diff: "Medium" },
            { src: "LeetCode 210", name: "Course Schedule II（注意邊的方向）", diff: "Medium" },
            { src: "LeetCode 2115", name: "Find All Possible Recipes from Given Supplies（字串節點的 Kahn）", diff: "Medium" },
            { src: "LeetCode 802", name: "Find Eventual Safe States（反向圖做 Kahn，或三色 DFS）", diff: "Medium" },
            { src: "LeetCode 2050", name: "Parallel Courses III（拓撲順序上算最早完成時間）", diff: "Hard" },
            { src: "LeetCode 1203", name: "Sort Items by Groups Respecting Dependencies（兩層拓撲排序）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const topoLesson: Lesson = { prereq: "Adjacency List / Matrix、BFS、DFS", Body };
