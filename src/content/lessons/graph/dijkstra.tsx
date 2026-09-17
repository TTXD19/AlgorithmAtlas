import { DijkstraDemo } from "@/components/lesson/demos/DijkstraDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `import heapq
from math import inf


def dijkstra(adj, src):
    """adj[u] = [(v, w), ...] with every w >= 0. Returns (dist, parent). O((V + E) log V)"""
    n = len(adj)
    dist = [inf] * n
    parent = [-1] * n
    dist[src] = 0
    heap = [(0, src)]                       # (distance so far, node)
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:                     # stale entry: u was settled with a shorter distance
            continue
        # dist[u] is final here; for a single target, add if u == target: break
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:                # relaxation succeeded
                dist[v] = nd
                parent[v] = u
                heapq.heappush(heap, (nd, v))   # leave the stale entry in; skip it when it pops
    return dist, parent


def build_path(dist, parent, target):
    """Walk back from the target along parent, then reverse. Returns [] when unreachable"""
    if dist[target] == inf:
        return []
    path = []
    while target != -1:
        path.append(target)
        target = parent[target]
    return path[::-1]


def dijkstra_dense(mat, src):
    """Matrix version; mat[u][v] = inf means no edge. Linear scan for the minimum each round, O(V²)"""
    n = len(mat)
    dist = [inf] * n
    done = [False] * n
    dist[src] = 0
    for _ in range(n):
        u = min((i for i in range(n) if not done[i]), key=lambda i: dist[i])
        if dist[u] == inf:                  # everything left is unreachable
            break
        done[u] = True
        for v in range(n):
            if dist[u] + mat[u][v] < dist[v]:
                dist[v] = dist[u] + mat[u][v]
    return dist


if __name__ == "__main__":
    names = "ABCDEF"                        # the same graph as the interactive demo
    roads = [(0, 1, 4), (0, 2, 2), (1, 2, 1), (1, 3, 5), (2, 3, 8),
             (2, 4, 10), (3, 4, 2), (3, 5, 6), (4, 5, 5)]
    adj = [[] for _ in names]
    mat = [[inf] * len(names) for _ in names]
    for u, v, w in roads:                   # undirected: add each edge in both directions
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

using Edge = std::pair<int, long long>;                  // (neighbour, weight)
const long long INF = std::numeric_limits<long long>::max();

// Heap version: O((V + E) log V). Distances are long long so summed weights cannot overflow
std::vector<long long> dijkstra(const std::vector<std::vector<Edge>>& adj, int src,
                                std::vector<int>& parent) {
    int n = adj.size();
    std::vector<long long> dist(n, INF);
    parent.assign(n, -1);
    using State = std::pair<long long, int>;             // (distance so far, node)
    std::priority_queue<State, std::vector<State>, std::greater<State>> pq;
    dist[src] = 0;
    pq.push({0, src});
    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;                        // stale entry, skip it
        for (auto [v, w] : adj[u]) {
            if (d + w < dist[v]) {                        // relaxation succeeded
                dist[v] = d + w;
                parent[v] = u;
                pq.push({dist[v], v});                    // leave stale entries in; skip on pop
            }
        }
    }
    return dist;
}

// Walk back along parent and reverse; returns empty when unreachable
std::vector<int> buildPath(const std::vector<long long>& dist, const std::vector<int>& parent, int t) {
    std::vector<int> path;
    if (dist[t] == INF) return path;
    for (int v = t; v != -1; v = parent[v]) path.push_back(v);
    std::reverse(path.begin(), path.end());
    return path;
}

// Matrix version: mat[u][v] == INF means no edge. One scan per round to find the minimum, O(V²)
std::vector<long long> dijkstraDense(const std::vector<std::vector<long long>>& mat, int src) {
    int n = mat.size();
    std::vector<long long> dist(n, INF);
    std::vector<bool> done(n, false);
    dist[src] = 0;
    for (int round = 0; round < n; round++) {
        int u = -1;
        for (int i = 0; i < n; i++)
            if (!done[i] && (u == -1 || dist[i] < dist[u])) u = i;
        if (dist[u] == INF) break;                        // everything left is unreachable
        done[u] = true;
        for (int v = 0; v < n; v++)
            if (mat[u][v] != INF && dist[u] + mat[u][v] < dist[v])
                dist[v] = dist[u] + mat[u][v];
    }
    return dist;
}

int main() {
    const std::string names = "ABCDEF";                   // the same graph as the interactive demo
    int roads[][3] = {{0, 1, 4}, {0, 2, 2}, {1, 2, 1}, {1, 3, 5}, {2, 3, 8},
                      {2, 4, 10}, {3, 4, 2}, {3, 5, 6}, {4, 5, 5}};
    int n = names.size();
    std::vector<std::vector<Edge>> adj(n);
    std::vector<std::vector<long long>> mat(n, std::vector<long long>(n, INF));
    for (auto& r : roads) {                               // undirected: add each edge both ways
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

export const skeleton: LessonSkeleton = {
  demo: <DijkstraDemo />,
  code: { python, cpp },
};
