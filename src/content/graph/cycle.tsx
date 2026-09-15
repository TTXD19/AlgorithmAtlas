import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { CycleDemo } from "@/components/lesson/demos/CycleDemo";
import type { Lesson } from "@/lib/lessons";

const python = `WHITE, GRAY, BLACK = 0, 1, 2


def find_directed_cycle(n, edges):
    """有向圖：三色 DFS。回傳環上的節點（頭尾相同），沒有環回傳 None"""
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    color = [WHITE] * n
    path = []                                # 目前的呼叫堆疊

    def dfs(u):
        color[u] = GRAY                      # 進入：u 在路徑上
        path.append(u)
        for v in adj[u]:
            if color[v] == GRAY:             # 回邊：v 還在路徑上
                return path[path.index(v):] + [v]
            if color[v] == WHITE:
                cycle = dfs(v)
                if cycle:
                    return cycle
        path.pop()
        color[u] = BLACK                     # 離開：從 u 出發回不到路徑上
        return None

    for s in range(n):                       # 圖可能不連通，每個白色節點都要當起點
        if color[s] == WHITE:
            cycle = dfs(s)
            if cycle:
                return cycle
    return None


def has_undirected_cycle(n, edges):
    """無向圖：併查集。邊的兩端已經同群，這條邊就會閉合成環"""
    parent = list(range(n))
    size = [1] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]    # 路徑減半
            x = parent[x]
        return x

    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return True
        if size[ru] < size[rv]:              # 小樹接到大樹底下
            ru, rv = rv, ru
        parent[rv] = ru
        size[ru] += size[rv]
    return False


def has_undirected_cycle_dfs(n, edges):
    """無向圖的 DFS 版：已拜訪的鄰居、而且不是剛走過來的那條邊，就是環"""
    adj = [[] for _ in range(n)]
    for i, (u, v) in enumerate(edges):
        adj[u].append((v, i))
        adj[v].append((u, i))
    seen = [False] * n

    def dfs(u, via):                         # via：走到 u 用的邊編號
        seen[u] = True
        for v, i in adj[u]:
            if i == via:                     # 比對邊編號而不是父節點，平行邊才不會漏
                continue
            if seen[v] or dfs(v, i):
                return True
        return False

    return any(not seen[s] and dfs(s, -1) for s in range(n))


if __name__ == "__main__":
    # 與互動示範相同的圖，A..F 編號成 0..5
    directed = [(0, 1), (0, 5), (1, 2), (1, 3), (3, 4), (4, 1), (5, 4)]
    print(find_directed_cycle(6, directed))                      # [1, 3, 4, 1]，即 B → D → E → B
    print(find_directed_cycle(4, [(0, 1), (0, 2), (1, 3), (2, 3)]))  # None（菱形：3 被走到兩次，但沒有環）
    undirected = [(0, 1), (1, 2), (0, 5), (2, 3), (5, 4), (3, 4), (1, 3)]
    print(has_undirected_cycle(6, undirected))                   # True（第 6 條 D – E 閉合成環）
    print(has_undirected_cycle(6, undirected[:5]))               # False（前 5 條邊是一棵樹）
    print(has_undirected_cycle_dfs(6, undirected[:5]))           # False
    print(has_undirected_cycle_dfs(2, [(0, 1), (0, 1)]))         # True（兩條平行邊也是環）`;

const cpp = `#include <algorithm>
#include <iostream>
#include <numeric>
#include <utility>
#include <vector>

using Edges = std::vector<std::pair<int, int>>;
enum Color { WHITE, GRAY, BLACK };

// 有向圖：三色 DFS。找到環時把環上的節點（頭尾相同）寫進 cycle
bool dfs(int u, const std::vector<std::vector<int>>& adj, std::vector<Color>& color,
         std::vector<int>& path, std::vector<int>& cycle) {
    color[u] = GRAY;                           // 進入：u 在路徑上
    path.push_back(u);
    for (int v : adj[u]) {
        if (color[v] == GRAY) {                // 回邊：v 還在路徑上
            cycle.assign(std::find(path.begin(), path.end(), v), path.end());
            cycle.push_back(v);
            return true;
        }
        if (color[v] == WHITE && dfs(v, adj, color, path, cycle)) return true;
    }
    path.pop_back();
    color[u] = BLACK;                          // 離開：從 u 出發回不到路徑上
    return false;
}

std::vector<int> findDirectedCycle(int n, const Edges& edges) {
    std::vector<std::vector<int>> adj(n);
    for (const auto& [u, v] : edges) adj[u].push_back(v);
    std::vector<Color> color(n, WHITE);
    std::vector<int> path, cycle;
    for (int s = 0; s < n; s++)                // 每個白色節點都要當起點
        if (color[s] == WHITE && dfs(s, adj, color, path, cycle)) break;
    return cycle;                              // 空的表示沒有環
}

// 無向圖：併查集
bool hasUndirectedCycle(int n, const Edges& edges) {
    std::vector<int> parent(n), size(n, 1);
    std::iota(parent.begin(), parent.end(), 0);
    auto find = [&](int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];     // 路徑減半
            x = parent[x];
        }
        return x;
    };
    for (const auto& [u, v] : edges) {
        int ru = find(u), rv = find(v);
        if (ru == rv) return true;             // 早就連通，這條邊閉合成環
        if (size[ru] < size[rv]) std::swap(ru, rv);
        parent[rv] = ru;
        size[ru] += size[rv];
    }
    return false;
}

int main() {
    Edges directed = {{0, 1}, {0, 5}, {1, 2}, {1, 3}, {3, 4}, {4, 1}, {5, 4}};
    for (int x : findDirectedCycle(6, directed)) std::cout << x << ' ';  // 1 3 4 1（B → D → E → B）
    std::cout << "\\n";
    Edges diamond = {{0, 1}, {0, 2}, {1, 3}, {2, 3}};
    std::cout << findDirectedCycle(4, diamond).size() << "\\n";          // 0（菱形沒有環）

    Edges undirected = {{0, 1}, {1, 2}, {0, 5}, {2, 3}, {5, 4}, {3, 4}, {1, 3}};
    std::cout << std::boolalpha << hasUndirectedCycle(6, undirected) << "\\n";  // true
    undirected.resize(5);                                                  // 只留前 5 條：一棵樹
    std::cout << hasUndirectedCycle(6, undirected) << "\\n";               // false
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "資料庫的死鎖偵測",
              problem: "交易 T1 鎖住訂單表、在等庫存表；T2 鎖住庫存表、在等付款表；T3 鎖住付款表、又在等訂單表。三個都在等別人放手，永遠等不到。尖峰時段同時有上百個交易在排隊等鎖。",
              why: "把「T1 在等 T2 手上的鎖」畫成有向邊 T1 → T2，得到一張等待圖，死鎖就是這張圖上的有向環。PostgreSQL 在交易等鎖超過 deadlock_timeout（預設 1 秒）時做這個檢查，找到環就中止其中一個交易。三色 DFS 不只回答有沒有環，還能從呼叫堆疊直接讀出是哪幾個交易卡在一起。",
            },
            {
              title: "排程系統拒絕有環的工作流程",
              problem: "資料團隊在 Airflow 上排了 300 個任務，每個任務宣告要等哪些任務先跑完。有人讓「匯出報表」等「清理暫存」，但「清理暫存」原本就間接在等「匯出報表」。這個設定一旦上線，整串任務會永遠停在等待狀態。",
              why: "任務相依是有向圖，合法的設定必須是 DAG（有向無環圖）。載入設定時跑一次三色 DFS，O(V+E) 就能判定；而且碰到灰色節點的那一刻，堆疊上那一段就是完整的環，可以直接印在錯誤訊息裡，比一句「有循環相依」好除錯得多。",
            },
            {
              title: "辦公室交換器接出迴圈",
              problem: "一棟辦公室有 40 台網路交換器，IT 人員照著清單一條一條接線。只要某條線讓兩台原本就連得通的交換器多出第二條路，廣播封包就會在迴圈裡繞個不停，幾秒內塞爆整個網路，也就是廣播風暴。",
              why: "線路是無向邊，問題是「這條線接上去會不會成環」。併查集逐條加入：兩端已經同群，代表之間早有一條路，這條線就是多出來的迴圈。每條線近乎 O(1)，不必每接一條就重新走訪整張圖。交換器上的生成樹協定（STP）會自動封鎖多餘的連接埠，要排除的就是這種環。",
            },
          ]}
          cue="循環相依、死鎖、互相等待、驗證是不是 DAG、加這條邊會不會成環、是不是一棵樹、繞回自己。"
        />
      </Section>

      <Section id="concept">
        <p>
          環就是從某個節點出發沿著邊走，最後又回到它。DFS 很適合找環，因為<strong>呼叫堆疊就是從起點走到目前節點的那條路徑</strong>。有向圖用<strong>三色標記</strong>：<strong>白色</strong>還沒拜訪，<strong>灰色</strong>已經進入但還沒離開（在堆疊上），<strong>黑色</strong>出邊全部查完。在 <Code>u</Code> 看到邊 <Code>u → v</Code> 時，若 <Code>v</Code> 是灰色，<Code>v</Code> 就在目前的路徑上，沿路徑從 <Code>v</Code> 走到 <Code>u</Code> 再走 <Code>u → v</Code> 就繞回來了，這條邊叫<strong>回邊</strong>（back edge）。只用一個 <Code>visited</Code> 不夠：在 <Code>A → B → D</Code>、<Code>A → C → D</Code> 這種菱形裡，D 第二次被碰到時已經拜訪過，但圖裡沒有環。黑色和灰色的區別就是用來排除這種誤判。
        </p>
        <p>
          為什麼「有環」等價於「DFS 會碰到灰色節點」。碰到灰色的 <Code>v</Code> 時，堆疊上從 <Code>v</Code> 到 <Code>u</Code> 每一步都是真的邊，加上 <Code>u → v</Code> 就是一個環，所以不會誤報。反過來，假設圖裡有環，令 <Code>v</Code> 是環上<strong>第一個</strong>被拜訪的節點：那一刻環上其他節點都是白色，而且沿著環走得到，所以它們都會在 <Code>dfs(v)</Code> 返回之前被拜訪；其中 <Code>v</Code> 在環上的前一個節點 <Code>u</Code> 檢查 <Code>u → v</Code> 時，<Code>v</Code> 還在堆疊上，一定是灰色，所以不會漏報。這個論證也說明碰到黑色節點可以直接略過：任何環都會在它的第一個節點還是灰色時被抓到。
        </p>
        <p>
          無向圖不能照搬：每條邊都是雙向的，從 <Code>u</Code> 走到 <Code>v</Code> 之後，<Code>v</Code> 馬上會看到來時的 <Code>u</Code>。<strong>DFS 版</strong>要略過「剛走過來的那條邊」，其餘已拜訪的鄰居都代表環；排除時要比對<strong>邊的編號</strong>而不是父節點，否則兩條平行邊 <Code>u – v</Code> 構成的環會被漏掉。<strong>併查集版</strong>逐條加邊，兩端 <Code>find</Code> 相同表示之間早有一條路，這條邊一加就閉合成環；它只需要邊的清單，適合邊一條條到來的情境。但併查集<strong>不能用在有向圖</strong>：<Code>A → B</Code>、<Code>A → C</Code>、<Code>B → C</Code> 加到第三條時 B、C 已經同群，這張圖卻沒有有向環。無向圖還有一個計數檢查：森林的邊數恰好是 <Code>V − 連通分量數</Code>，邊數比這個多就一定有環。
        </p>
        <p>
          複雜度：三色 DFS 裡每個節點白變灰、灰變黑各一次，每條有向邊檢查一次，時間 <strong>O(V+E)</strong>；顏色陣列 O(V)，遞迴深度最壞 O(V)（一條長鏈），空間 <strong>O(V)</strong>，不算輸入的鄰接串列。無向 DFS 每條邊從兩端各看一次，仍是 O(V+E)。併查集版搭配路徑壓縮與按大小合併是 <Code>O(V + E·α(V))</Code>，實務上就是線性。只問有沒有環時，找到第一個就能停。常見的錯有三個：只從節點 0 開始 DFS，漏掉不連通的部分；Python 遞迴上限預設 1000，節點多時要改成迭代，或改用 Topological Sort 的 Kahn 入度法，排完的節點少於 V 就有環；每個節點<strong>只有一條出邊</strong>時（鏈結串列、<Code>x → f(x)</Code> 的序列），用 Fast &amp; Slow Pointers 就能以 O(1) 空間找環。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>先分清楚是<strong>有向</strong>還是<strong>無向</strong>圖。DFS 版把輸入轉成鄰接串列；併查集版只要邊的清單。</>,
            <>有向圖：<Code>color</Code> 全部設為白色，對<strong>每個</strong>還是白色的節點 <Code>s</Code> 呼叫 <Code>dfs(s)</Code>，不要只從 0 開始。</>,
            <><Code>dfs(u)</Code>：把 <Code>u</Code> 塗灰並推入路徑。看每條 <Code>u → v</Code>：灰色就找到環；白色就遞迴，子呼叫找到環就一路回傳；黑色略過。出邊看完後把 <Code>u</Code> 塗黑、彈出路徑。</>,
            <>要列出環：碰到灰色的 <Code>v</Code> 時，路徑上從 <Code>v</Code> 到尾端的那一段再接回 <Code>v</Code>，就是環上的節點。</>,
            <>無向圖：<Code>parent[i] = i</Code>，逐條處理 <Code>(u, v)</Code>，<Code>find(u) == find(v)</Code> 就有環，否則合併。改用 DFS 時記下走到每個節點用的邊編號，略過它，其餘已拜訪的鄰居都是環。</>,
            <>節點數上萬時避免深遞迴：改用明確的堆疊模擬，或用 Kahn 入度法檢查拓撲排序能不能排完所有節點。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>兩個模式用同樣六個節點 A–F、各七條邊。「有向圖 · 三色 DFS」從 A 開始、依加入順序檢查出邊：黃框節點是灰色（在呼叫堆疊上，右側同步列出），藍色實心是正在處理的節點。看 E → B 碰到灰色的 B，B → D → E → B 整圈變黃；稍後 F → E 碰到已完成的黑色 E（虛線），卻不算環。「無向圖 · 併查集」逐條加邊，藍線是併入森林的邊，parent 陣列裡藍底格是根；D – E 和 B – D 加入時兩端已經同群，只有這兩條讓環閉合的邊標成黃色。</p>
        <CycleDemo />
      </Section>

      <Section id="code">
        <p>Python 有三個函式：三色 DFS 找出有向環並回傳環上的節點、併查集判斷無向圖有沒有環，以及用邊編號排除來時路的無向 DFS 版，它能正確處理平行邊。範例用的圖和互動示範相同，A–F 編號成 0–5。C++ 版實作前兩個。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 207", name: "Course Schedule（改用三色 DFS，並印出環）", diff: "Medium" },
            { src: "LeetCode 802", name: "Find Eventual Safe States（能塗成黑色的就是安全節點）", diff: "Medium" },
            { src: "LeetCode 1559", name: "Detect Cycles in 2D Grid（無向 DFS 略過來時路）", diff: "Medium" },
            { src: "LeetCode 457", name: "Circular Array Loop（每個點只有一條出邊）", diff: "Medium" },
            { src: "LeetCode 685", name: "Redundant Connection II（有向版：入度 2 或有環）", diff: "Hard" },
            { src: "LeetCode 2360", name: "Longest Cycle in a Graph（量出環的長度）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const cycleLesson: Lesson = { prereq: "DFS、Union-Find", Body };
