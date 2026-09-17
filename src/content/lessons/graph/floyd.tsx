import { FloydDemo } from "@/components/lesson/demos/FloydDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `INF = float("inf")


def floyd_warshall(n, edges):
    """Returns (dist, nxt): dist[i][j] is the shortest distance from i to j, nxt[i][j] the next node after i on that path. O(V³)"""
    dist = [[0 if i == j else INF for j in range(n)] for i in range(n)]
    nxt = [[i if i == j else None for j in range(n)] for i in range(n)]
    for u, v, w in edges:
        if w < dist[u][v]:                      # keep the smallest when a pair has several edges
            dist[u][v] = w
            nxt[u][v] = v
    for k in range(n):                          # k must be the outermost loop
        for i in range(n):
            if dist[i][k] == INF:
                continue
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    nxt[i][j] = nxt[i][k]       # head towards k first
    return dist, nxt


def has_negative_cycle(dist):
    return any(dist[i][i] < 0 for i in range(len(dist)))


def get_path(nxt, u, v):
    if nxt[u][v] is None:                       # unreachable
        return []
    path = [u]
    while u != v:
        u = nxt[u][v]
        path.append(u)
    return path


def transitive_closure(n, edges):
    """Warshall: bit j of reach[i] says whether i can reach j. Integers act as bitsets, so one OR handles a whole row"""
    reach = [1 << i for i in range(n)]
    for u, v in edges:
        reach[u] |= 1 << v
    for k in range(n):
        for i in range(n):
            if reach[i] >> k & 1:               # i reaches k, so i reaches everything k reaches
                reach[i] |= reach[k]
    return reach


if __name__ == "__main__":
    A, B, C, D = range(4)
    edges = [(A, B, 4), (A, D, 9), (D, A, 1), (B, C, -2), (B, D, 5), (C, D, 3), (D, C, 8), (C, A, 6)]
    dist, nxt = floyd_warshall(4, edges)
    for row in dist:
        print(row)                              # [0, 4, 2, 5] / [2, 0, -2, 1] / [4, 8, 0, 3] / [1, 5, 3, 0]
    print("".join("ABCD"[x] for x in get_path(nxt, D, C)))   # DABC
    bad = [(u, v, -9 if (u, v) == (B, C) else w) for u, v, w in edges]
    print(has_negative_cycle(floyd_warshall(4, bad)[0]))      # True: B → C → D → A → B sums to -1

    roles = ["admin", "editor", "viewer", "auditor"]
    reach = transitive_closure(4, [(0, 1), (1, 2), (3, 2)])  # admin inherits editor, editor inherits viewer
    print([roles[j] for j in range(4) if reach[0] >> j & 1])  # ['admin', 'editor', 'viewer']`;

const cpp = `#include <algorithm>
#include <iostream>
#include <limits>
#include <vector>

using Matrix = std::vector<std::vector<long long>>;
const long long INF = std::numeric_limits<long long>::max() / 4;   // headroom, so even INF + INF cannot overflow

// Shortest distances, updating dist in place
void floydWarshall(Matrix& dist) {
    int n = static_cast<int>(dist.size());
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++) {
            if (dist[i][k] == INF) continue;
            for (int j = 0; j < n; j++)
                if (dist[k][j] != INF && dist[i][k] + dist[k][j] < dist[i][j])   // both halves must be reachable
                    dist[i][j] = dist[i][k] + dist[k][j];
        }
}

// The same triple loop with a "bottleneck" operation: a path's bandwidth is its narrowest hop, and we want that as large as possible
Matrix widestPath(Matrix cap) {
    int n = static_cast<int>(cap.size());
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                cap[i][j] = std::max(cap[i][j], std::min(cap[i][k], cap[k][j]));
    return cap;
}

int main() {
    const int A = 0, B = 1, C = 2, D = 3;
    Matrix dist(4, std::vector<long long>(4, INF));
    for (int i = 0; i < 4; i++) dist[i][i] = 0;
    dist[A][B] = 4; dist[A][D] = 9; dist[D][A] = 1; dist[B][C] = -2;
    dist[B][D] = 5; dist[C][D] = 3; dist[D][C] = 8; dist[C][A] = 6;
    floydWarshall(dist);
    for (long long x : dist[D]) std::cout << x << ' ';        // 1 5 3 0
    std::cout << '\\n';

    // Bandwidth of an undirected network in Mbps, where 0 means no direct link; a node to itself is infinite
    Matrix cap(4, std::vector<long long>(4, 0));
    auto link = [&](int u, int v, long long c) { cap[u][v] = cap[v][u] = c; };
    link(A, B, 100); link(B, C, 40); link(A, C, 10); link(C, D, 80); link(B, D, 30);
    for (int i = 0; i < 4; i++) cap[i][i] = INF;
    std::cout << widestPath(cap)[A][D] << '\\n';              // 40: A → B → C → D, narrowest is B–C at 40
}`;

export const skeleton: LessonSkeleton = {
  demo: <FloydDemo />,
  code: { python, cpp },
};
