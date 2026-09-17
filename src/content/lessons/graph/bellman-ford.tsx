import { BellmanFordDemo } from "@/components/lesson/demos/BellmanFordDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `from math import inf


def bellman_ford(n, edges, src):
    """edges holds directed edges (u, v, w). Returns (dist, whether a negative cycle is reachable from src). O(VE)"""
    dist = [inf] * n
    dist[src] = 0
    for _ in range(n - 1):                    # with no negative cycle, a shortest path uses at most n − 1 edges
        changed = False
        for u, v, w in edges:
            if dist[u] != inf and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:                       # a whole round with no update means it has converged
            break
    has_neg_cycle = any(dist[u] != inf and dist[u] + w < dist[v] for u, v, w in edges)
    return dist, has_neg_cycle


def find_negative_cycle(n, edges):
    """Returns the nodes of some negative cycle in edge order, or None if there is none"""
    dist = [0] * n                            # all zeros: same as a virtual source joined to every node
    parent = [-1] * n
    for _ in range(n):
        x = -1
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v], parent[v], x = dist[u] + w, u, v
    if x == -1:
        return None                           # round n updated nothing: no negative cycle
    for _ in range(n):
        x = parent[x]                         # n steps back is guaranteed to land on the cycle
    cycle, y = [x], parent[x]
    while y != x:
        cycle.append(y)
        y = parent[y]
    return cycle[::-1]


def shortest_with_k_edges(n, edges, src, k):
    """At most k edges may be used (for example, at most k − 1 layovers)"""
    dist = [inf] * n
    dist[src] = 0
    for _ in range(k):
        prev = dist[:]                        # only last round's values, so one round cannot chain several edges
        for u, v, w in edges:
            if prev[u] != inf and prev[u] + w < dist[v]:
                dist[v] = prev[u] + w
    return dist


if __name__ == "__main__":
    S, A, B, C, D = range(5)                  # the same graph as the interactive demo
    edges = [(S, A, 6), (S, B, 7), (A, C, 5), (A, B, 8), (A, D, -4),
             (B, C, -3), (B, D, 9), (C, A, -2), (D, C, 7), (D, S, 2)]
    print(bellman_ford(5, edges, S))          # ([0, 2, 7, 4, -2], False)
    print(shortest_with_k_edges(5, edges, S, 2))   # [0, 6, 7, 4, 2] (only 2 edges allowed)

    neg = [(u, v, -5 if (u, v) == (C, A) else w) for u, v, w in edges]
    print(bellman_ford(5, neg, S)[1])         # True
    print(find_negative_cycle(5, neg))        # [4, 0, 2, 3, 1]: D→S→B→C→A→D sums to −3
    # The demo finds C→A→D→C (−2) instead: one graph can hold several negative cycles, and which one you land on depends on the scan order`;

const cpp = `#include <iostream>
#include <limits>
#include <queue>
#include <tuple>
#include <utility>
#include <vector>

using Edge = std::tuple<int, int, long long>;          // (u, v, w)
const long long INF = std::numeric_limits<long long>::max() / 4;   // headroom, so arithmetic near INF cannot overflow

// Returns true when no negative cycle is reachable from src, in which case dist is the answer
bool bellmanFord(int n, const std::vector<Edge>& edges, int src, std::vector<long long>& dist) {
    dist.assign(n, INF);
    dist[src] = 0;
    for (int round = 0; round < n - 1; round++) {
        bool changed = false;
        for (auto [u, v, w] : edges)
            if (dist[u] != INF && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; changed = true; }
        if (!changed) break;                           // converged early
    }
    for (auto [u, v, w] : edges)
        if (dist[u] != INF && dist[u] + w < dist[v]) return false;   // still relaxable on round n: negative cycle
    return true;
}

// SPFA: only re-check nodes whose distance just dropped. Much faster on average, still O(VE) in the worst case
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
                if (edgesUsed[v] >= n) return false;   // a path using n edges must have run into a negative cycle
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

    std::get<2>(edges[7]) = -5;                         // C → A becomes −5, creating a negative cycle
    std::vector<std::vector<std::pair<int, long long>>> adj(5);
    for (auto [u, v, w] : edges) adj[u].push_back({v, w});
    std::cout << bellmanFord(5, edges, 0, dist) << ' ' << spfa(5, adj, 0, dist) << '\\n';   // 0 0
}`;

export const skeleton: LessonSkeleton = {
  demo: <BellmanFordDemo />,
  code: { python, cpp },
};
