import { DagShortestDemo } from "@/components/lesson/demos/DagShortestDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `from collections import deque

INF = float("inf")


def topo_order(n, adj):
    """Kahn's topological sort; fewer than n nodes in the output means the graph has a cycle"""
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
        raise ValueError("the graph has a cycle, so it is not a DAG")
    return order


def dag_shortest(n, edges, src):
    """Single-source shortest paths on a DAG, negative weights allowed. Returns (dist, parent), O(V + E)"""
    adj = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))
    dist, parent = [INF] * n, [-1] * n
    dist[src] = 0
    for u in topo_order(n, adj):
        if dist[u] == INF:                      # unreachable nodes must not be relaxed from
            continue
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v], parent[v] = dist[u] + w, u
    return dist, parent


def critical_path(durations, deps):
    """Project scheduling: durations[i] is the number of days task i takes, deps is a list of (before, after).
    Returns (total duration, float of every task). A task with zero float lies on the critical path"""
    n = len(durations)
    adj = [[] for _ in range(n)]
    for u, v in deps:
        adj[u].append((v, durations[u]))
    order = topo_order(n, adj)
    earliest = [0] * n                          # earliest start = longest path from the start
    for u in order:
        for v, w in adj[u]:
            earliest[v] = max(earliest[v], earliest[u] + w)
    total = max(earliest[i] + durations[i] for i in range(n))
    latest = [total - durations[i] for i in range(n)]   # latest start: any later delays the project
    for u in reversed(order):                   # reverse topological order, working backwards
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
    print("".join(reversed(path)))              # SXYZ: 6 + (-1) + (-2) = 3

    # start, spec, backend, frontend, docs, test, ship
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

// Reversing the DFS finishing order gives a topological order (input is assumed acyclic here)
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
        if (dist[u] == INF) continue;                   // INF plus a negative weight lands below INF, so guard first
        for (const auto& [v, w] : adj[u]) dist[v] = std::min(dist[v], dist[u] + w);
    }
    return dist;
}

// Word segmentation: positions 0 ... n in the sentence are the nodes, a dictionary word s[i, j) is an edge i -> j weighted by the word's score.
// Edges always run from a smaller position to a larger one, so the node numbering is already a topological order and needs no separate sort
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
                best[j + 1] = best[i] + it->second;         // longest path: the higher the total score the better
                from[j + 1] = i;
            }
        }
    }
    if (best[n] == NEG) return {NEG, {}};                   // cannot be cut into dictionary words
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
    std::cout << score << '\\n';                            // 研究 生命 起源 16 (研究生 命 起源 would score only 10)
}`;

export const skeleton: LessonSkeleton = {
  demo: <DagShortestDemo />,
  code: { python, cpp },
};
