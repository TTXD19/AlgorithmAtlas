import { AdjacencyDemo } from "@/components/lesson/demos/AdjacencyDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `from collections import defaultdict

# Edge list: the rawest input format, and usually how a problem hands you the graph
edges = [("A", "B", 4), ("A", "D", 1), ("B", "C", 2), ("B", "E", 5), ("D", "E", 3), ("E", "C", 1)]


# Adjacency list: each node maps to its neighbours (with weights). O(V + E) space
def build_list(edges, directed=False):
    adj = defaultdict(list)
    for u, v, w in edges:
        adj[u].append((v, w))
        if not directed:
            adj[v].append((u, w))       # an undirected edge is recorded on both ends
    return adj

adj = build_list(edges)
for v, w in adj["B"]:                    # walk B's neighbours: only edges that actually exist
    print(v, w)


# Adjacency matrix: a V×V table where matrix[i][j] is the weight (0 or None means no edge). O(V²) space
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
print(m[1][2] != 0)                      # are B and C adjacent? O(1)


# The most common form when nodes are the integers 0..n-1
n = 5
adj_int = [[] for _ in range(n)]
for u, v in [(0, 1), (0, 3), (1, 2), (1, 4), (3, 4), (4, 2)]:
    adj_int[u].append(v)
    adj_int[v].append(u)`;

const cpp = `#include <vector>
#include <utility>

// Nodes numbered 0..n-1; the adjacency list is the form you will use most
int n = 5;
std::vector<std::vector<int>> adj(n);
void addEdge(int u, int v, bool directed = false) {
    adj[u].push_back(v);
    if (!directed) adj[v].push_back(u);
}

// Weighted: store pair<neighbour, weight>
std::vector<std::vector<std::pair<int, int>>> wadj(n);
void addWeighted(int u, int v, int w, bool directed = false) {
    wadj[u].push_back({v, w});
    if (!directed) wadj[v].push_back({u, w});
}

// Adjacency matrix: for dense graphs, or when you need an O(1) adjacency test
std::vector<std::vector<int>> mat(n, std::vector<int>(n, 0));
void addEdgeMat(int u, int v, int w = 1, bool directed = false) {
    mat[u][v] = w;
    if (!directed) mat[v][u] = w;
}

// Walking u's neighbours
// for (int v : adj[u]) { ... }
// for (auto [v, w] : wadj[u]) { ... }`;

export const skeleton: LessonSkeleton = {
  demo: <AdjacencyDemo />,
  code: { python, cpp },
};
