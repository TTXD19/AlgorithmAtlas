import { MstDemo } from "@/components/lesson/demos/MstDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `import heapq


class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path halving
            x = self.parent[x]
        return x

    def union(self, a, b):
        a, b = self.find(a), self.find(b)
        if a == b:
            return False                        # already one group: this edge would close a cycle
        if self.size[a] < self.size[b]:
            a, b = b, a
        self.parent[b] = a
        self.size[a] += self.size[b]
        return True


def kruskal(n, edges):
    """edges are (u, v, w). Returns (total weight, chosen edges), or None if disconnected. O(E log E)"""
    dsu, total, chosen = DSU(n), 0, []
    for w, u, v in sorted((w, u, v) for u, v, w in edges):
        if dsu.union(u, v):
            total += w
            chosen.append((u, v, w))
            if len(chosen) == n - 1:            # V - 1 edges is a whole tree, so stop
                break
    return (total, chosen) if len(chosen) == n - 1 else None


def prim(n, edges, start=0):
    """Lazy Prim: the heap may hold stale edges with both ends in the tree; drop them on pop. O(E log E)"""
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
        total += w                              # the edge's weight, not the distance from the start
        count += 1
        for e in adj[u]:
            if not in_tree[e[1]]:
                heapq.heappush(heap, e)
    return total if count == n else None


def clusters(points, k):
    """Single-linkage clustering: stopping Kruskal at k groups cuts the MST's k - 1 longest edges"""
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
    print(prim(6, edges))                       # 16: both methods always total the same
    print(kruskal(4, [(0, 1, 1), (2, 3, 1)]))   # None: disconnected, so there is no spanning tree
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

// Kruskal: best for sparse graphs whose edge list you already have. -1 means disconnected
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

// Array Prim: on a complete graph, where E ≈ V²/2, skipping the heap is actually fastest, O(V²)
long long primDense(const std::vector<std::pair<int, int>>& pts) {
    int n = static_cast<int>(pts.size());
    const long long INF = std::numeric_limits<long long>::max();
    std::vector<long long> key(n, INF);                     // key[v]: cheapest edge from v to the tree
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
    std::cout << primDense(pts) << '\\n';                   // 42: cheapest way to link all 7 points by Manhattan distance
}`;

export const skeleton: LessonSkeleton = {
  demo: <MstDemo />,
  code: { python, cpp },
};
