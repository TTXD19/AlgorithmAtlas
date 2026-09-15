import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { DagShortestDemo } from "@/components/lesson/demos/DagShortestDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from collections import deque

INF = float("inf")


def topo_order(n, adj):
    """Kahn 拓撲排序；輸出少於 n 個節點就代表圖裡有環"""
    indeg = [0] * n
    for u in range(n):
        for v, _ in adj[u]:
            indeg[v] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v, _ in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    if len(order) != n:
        raise ValueError("圖裡有環，不是 DAG")
    return order


def dag_shortest(n, edges, src):
    """DAG 單源最短路徑，允許負權。回傳 (dist, parent)，O(V + E)"""
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist, parent = [INF] * n, [-1] * n
    dist[src] = 0
    for u in topo_order(n, adj):
        if dist[u] == INF:                      # 走不到的點不能拿來鬆弛
            continue
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v], parent[v] = dist[u] + w, u
    return dist, parent


def critical_path(durations, deps):
    """專案排程：durations[i] 是工作 i 的天數，deps 是 (前置, 後續) 的清單。
    回傳 (總工期, 每項工作的浮動時間)。浮動時間 0 的工作就在關鍵路徑上"""
    n = len(durations)
    adj = [[] for _ in range(n)]
    for u, v in deps:
        adj[u].append((v, durations[u]))
    order = topo_order(n, adj)
    earliest = [0] * n                          # 最早開始 = 從起點出發的最長路徑
    for u in order:
        for v, w in adj[u]:
            earliest[v] = max(earliest[v], earliest[u] + w)
    total = max(earliest[i] + durations[i] for i in range(n))
    latest = [total - durations[i] for i in range(n)]   # 最晚開始：再晚就會拖到總工期
    for u in reversed(order):                   # 反向拓撲順序，由後往前推
        for v, w in adj[u]:
            latest[u] = min(latest[u], latest[v] - w)
    return total, [latest[i] - earliest[i] for i in range(n)]


if __name__ == "__main__":
    R, S, T, X, Y, Z = range(6)
    edges = [(R, S, 5), (R, T, 3), (S, T, 2), (S, X, 6), (T, X, 7), (T, Y, 4), (T, Z, 2), (X, Y, -1), (X, Z, 1), (Y, Z, -2)]
    dist, parent = dag_shortest(6, edges, S)
    print(dist)                                 # [inf, 0, 2, 6, 5, 3]
    path, v = [], Z
    while v != -1:
        path.append("RSTXYZ"[v])
        v = parent[v]
    print("".join(reversed(path)))              # SXYZ：6 + (-1) + (-2) = 3

    # 開工、規格、後端、前端、文件、測試、上線
    dur = [0, 3, 6, 4, 2, 3, 0]
    deps = [(0, 1), (1, 2), (1, 3), (1, 4), (2, 5), (3, 5), (4, 6), (5, 6)]
    print(critical_path(dur, deps))             # (12, [0, 0, 0, 2, 7, 0, 0])`;

const cpp = `#include <algorithm>
#include <iostream>
#include <limits>
#include <map>
#include <string>
#include <utility>
#include <vector>

using Adj = std::vector<std::vector<std::pair<int, long long>>>;
const long long INF = std::numeric_limits<long long>::max() / 4;

// DFS 的完成順序反過來就是拓撲順序（這裡假設輸入保證無環）
void dfs(int u, const Adj& adj, std::vector<char>& seen, std::vector<int>& finished) {
    seen[u] = 1;
    for (const auto& e : adj[u])
        if (!seen[e.first]) dfs(e.first, adj, seen, finished);
    finished.push_back(u);
}

std::vector<long long> dagShortest(const Adj& adj, int src) {
    int n = static_cast<int>(adj.size());
    std::vector<char> seen(n, 0);
    std::vector<int> order;
    for (int i = 0; i < n; i++)
        if (!seen[i]) dfs(i, adj, seen, order);
    std::reverse(order.begin(), order.end());
    std::vector<long long> dist(n, INF);
    dist[src] = 0;
    for (int u : order) {
        if (dist[u] == INF) continue;                   // INF 加上負權會變得「比 INF 小」，一定要先擋
        for (const auto& [v, w] : adj[u]) dist[v] = std::min(dist[v], dist[u] + w);
    }
    return dist;
}

// 斷詞：句子的位置 0 … n 是節點，字典裡的詞 s[i, j) 是邊 i → j，權重是詞的分數。
// 邊一定從小位置指向大位置，節點編號本身就是拓撲順序，不必另外排序
std::pair<long long, std::vector<std::string>> segment(const std::vector<std::string>& chars,
                                                         const std::map<std::string, long long>& dict) {
    const long long NEG = std::numeric_limits<long long>::min() / 4;
    int n = static_cast<int>(chars.size());
    std::vector<long long> best(n + 1, NEG);
    std::vector<int> from(n + 1, -1);
    best[0] = 0;
    for (int i = 0; i < n; i++) {
        if (best[i] == NEG) continue;
        std::string word;
        for (int j = i; j < n; j++) {
            word += chars[j];
            auto it = dict.find(word);
            if (it != dict.end() && best[i] + it->second > best[j + 1]) {
                best[j + 1] = best[i] + it->second;         // 最長路徑：分數總和越大越好
                from[j + 1] = i;
            }
        }
    }
    if (best[n] == NEG) return {NEG, {}};                   // 無法切成字典裡的詞
    std::vector<std::string> words;
    for (int j = n; j > 0; j = from[j]) {
        std::string w;
        for (int t = from[j]; t < j; t++) w += chars[t];
        words.push_back(w);
    }
    std::reverse(words.begin(), words.end());
    return {best[n], words};
}

int main() {
    Adj adj(6);                                             // R S T X Y Z
    auto add = [&](int u, int v, long long w) { adj[u].push_back({v, w}); };
    add(0, 1, 5); add(0, 2, 3); add(1, 2, 2); add(1, 3, 6); add(2, 3, 7);
    add(2, 4, 4); add(2, 5, 2); add(3, 4, -1); add(3, 5, 1); add(4, 5, -2);
    for (long long d : dagShortest(adj, 1)) std::cout << (d == INF ? "INF" : std::to_string(d)) << ' ';
    std::cout << '\\n';                                     // INF 0 2 6 5 3

    std::map<std::string, long long> dict = {{"研究", 5}, {"研究生", 4}, {"生命", 6}, {"起源", 5},
                                             {"研", 1}, {"究", 1}, {"生", 1}, {"命", 1}, {"起", 1}, {"源", 1}};
    auto [score, words] = segment({"研", "究", "生", "命", "起", "源"}, dict);
    for (const std::string& w : words) std::cout << w << ' ';
    std::cout << score << '\\n';                            // 研究 生命 起源 16（研究生 命 起源 只有 10 分）
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "專案排程的關鍵路徑",
              problem: "蓋一棟大樓有上千項工作，每項有預估天數，也有「這項做完另一項才能開始」的前後關係。業主想知道最快多久能完工，以及哪些工作絕對不能延誤、哪些可以晚幾天也沒關係。",
              why: "工作之間的相依關係不能有環，是一張 DAG。依拓撲順序算每項工作的最早開始時間，就是從起點出發的最長路徑；再依反向順序算最晚開始時間，兩者相減是浮動時間，浮動時間為 0 的工作連成「關鍵路徑」。這個方法叫 CPM，1950 年代就用在大型工程管理，整個計算只要 O(V + E)。",
            },
            {
              title: "TeX 的段落斷行",
              problem: "排版一整段文字時，每一行要在哪個字後面換行？一行一行貪心地塞滿，常常讓後面某一行被拉得很稀疏，整段看起來很醜；要考慮所有斷行組合，數量是指數級的。",
              why: "把段落中每個可以斷行的位置當成節點，「從位置 i 斷到位置 j 當成一行」是一條邊，權重是這行被拉伸或壓縮的難看程度。位置只會往後，圖一定無環，整段最好看的排法就是從開頭到結尾的最短路徑。TeX 的斷行演算法就是在這張圖上做動態規劃，只保留可行的斷點，所以長段落也算得很快。",
            },
            {
              title: "注音輸入法挑出整句最通順的字",
              problem: "使用者打了一串注音，每一段注音都對應很多同音字和詞，組合起來有成千上萬種句子。輸入法要即時挑出最像正常中文的一句，而且使用者每多打一個音就要重算。",
              why: "句子的位置是節點，每個候選詞是從它的起點連到終點的一條邊，權重是這個詞出現的機率取對數。所有邊都往後指，這張「詞格」是 DAG，機率最高的整句就是最長路徑，依位置順序做一次 O(V + E) 就找得到。這個做法和語音辨識裡的 Viterbi 解碼是同一個想法。",
            },
          ]}
          cue="圖保證沒有環（相依關係、時間只往前、位置只往後）、有負權邊但沒有環、要求最長路徑或關鍵路徑、DP 狀態之間的轉移、路徑數量計數。"
        />
      </Section>

      <Section id="concept">
        <p>
          一般的圖上，Dijkstra 要求權重不能是負的，Bellman-Ford 允許負權但要 O(VE)，而<strong>最長路徑</strong>在一般圖上甚至是 NP-hard。可是如果圖是 <strong>DAG</strong>（有向無環圖），就能排出<strong>拓撲順序</strong>，讓每一條邊都從前面的節點指向後面的節點。照這個順序處理節點、把每個節點的出邊鬆弛一次，就能在 O(V + E) 時間內得到單源最短路徑，而且負權邊完全沒有問題。
        </p>
        <p>
          為什麼對：輪到節點 u 的時候，所有指向 u 的邊，起點都排在 u 前面，早就處理過了，所以 <Code>dist[u]</Code> 已經是最終答案，不會再被改動。任何一條到 v 的最短路徑，最後一條邊 <Code>u → v</Code> 的 u 一定排在 v 前面；輪到 u 時 <Code>dist[u]</Code> 已經正確，鬆弛這條邊就讓 <Code>dist[v]</Code> 正確。用拓撲順序做歸納就證完了。DAG 沒有環，自然也沒有負環。排在起點前面、或從起點走不到的節點會一直是 ∞，這些節點不能拿來鬆弛。
        </p>
        <p>
          複雜度：拓撲排序 O(V + E)，鬆弛時每個節點、每條邊各看一次，也是 O(V + E)，總共 <strong>O(V + E)</strong> 時間、<strong>O(V)</strong> 額外空間。<strong>最長路徑</strong>只要把初值改成 −∞、比較改成取最大；或把所有權重變號後求最短路徑。專案排程的<strong>關鍵路徑</strong>分兩趟：順著拓撲順序算最早開始時間（最長路徑），再逆著順序算最晚開始時間，兩者的差是浮動時間。同一個順序還能做很多事，例如 <Code>ways[v] += ways[u]</Code> 計算路徑數量。事實上，每一個動態規劃都可以看成「狀態是節點、轉移是邊」的 DAG 上的最短或最長路徑。
        </p>
        <p>
          常見的坑：圖其實有環卻當成 DAG，Kahn 輸出的節點數少於 V 就要報錯；從 ∞ 的節點出發鬆弛，∞ 用大整數表示時加上負權會變得比 ∞ 小，產生假路徑；以為要從起點開始排拓撲順序，其實是對整張圖排序，只是起點以外的前段節點會停在 ∞；最長路徑的初值寫成 0 而不是 −∞，會把走不到的節點算成可達；把這個技巧用到有環的圖上求最長路徑，結果是錯的。和鄰近課程的關係：拓撲順序來自 Topological Sort；圖沒有環時它比 Bellman-Ford 快得多；Dijkstra 可以看成「在執行中動態決定處理順序」，DAG 則是事先就知道正確順序。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認圖沒有環，求出拓撲順序（Kahn 或 DFS 完成順序反轉）；Kahn 輸出的節點數少於 V 就代表有環。</>,
            <><Code>dist</Code> 全部設為 ∞（求最長路徑時設為 −∞），起點設為 0；需要路徑就準備 <Code>parent</Code>。</>,
            <>依拓撲順序取出 u；若 <Code>dist[u]</Code> 仍是 ∞，表示從起點走不到，直接跳過。</>,
            <>對每條出邊 <Code>u → v</Code>（權重 w）：若 <Code>dist[u] + w &lt; dist[v]</Code>（最長路徑用 &gt;），就更新 <Code>dist[v]</Code> 並令 <Code>parent[v] = u</Code>。</>,
            <>全部處理完，<Code>dist</Code> 就是答案，沿 <Code>parent</Code> 往回走得到路徑。關鍵路徑再依反向拓撲順序算最晚開始時間，浮動時間為 0 的工作就在關鍵路徑上。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>上方切換兩個例子，下方那一列是拓撲順序和目前的距離，藍色是正在處理的節點、綠色是處理完的。「最短路徑（含負權）」的起點是 S，R 排在 S 前面、根本走不到，輪到它時直接跳過。之後每條出邊都會變成黃色鬆弛一次，藍色的邊是目前的最短路徑樹：Y 先由 T 更新成 6，再經過負權邊 X → Y 變成 5；Z 先是 4，最後經過 Y → Z 的 −2 變成 3。「最長路徑：專案排程」裡邊上的數字是前一項工作的天數，改成取最大值：測試要等後端（第 9 天）和前端（第 7 天）都完成，所以取 9；上線最早第 12 天。最後一步標出關鍵路徑 開工 → 規格 → 後端 → 測試 → 上線，並算出前端和文件的浮動時間。</p>
        <DagShortestDemo />
      </Section>

      <Section id="code">
        <p>Python 放 Kahn 拓撲排序加鬆弛的最短路徑、還原路徑，以及順逆兩趟算出總工期和浮動時間的關鍵路徑。C++ 放用 DFS 完成順序的版本，另外示範斷詞：位置本身就是拓撲順序，把詞的分數當權重求最長路徑，「研究生命起源」會切成「研究 生命 起源」。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 3243", name: "Shortest Distance After Road Addition Queries I（編號只往後，每次查詢重跑 DAG 最短路徑）", diff: "Medium" },
            { src: "LeetCode 2192", name: "All Ancestors of a Node in a Directed Acyclic Graph（沿拓撲順序傳遞祖先集合）", diff: "Medium" },
            { src: "LeetCode 1786", name: "Number of Restricted Paths From First to Last Node（先 Dijkstra，再依距離排序做路徑計數）", diff: "Medium" },
            { src: "LeetCode 329", name: "Longest Increasing Path in a Matrix（隱含的 DAG 上求最長路徑）", diff: "Hard" },
            { src: "LeetCode 1857", name: "Largest Color Value in a Directed Graph（拓撲順序 DP，順便判斷有沒有環）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const dagShortestLesson: Lesson = { prereq: "Topological Sort、Bellman-Ford", Body };
