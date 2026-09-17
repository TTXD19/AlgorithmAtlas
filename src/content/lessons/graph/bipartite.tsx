import { BipartiteDemo } from "@/components/lesson/demos/BipartiteDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `from collections import deque


def bipartite_colors(adj):
    """Two-colour with BFS. Returns each node's colour (0 or 1), or None if not bipartite."""
    n = len(adj)
    color = [-1] * n                          # -1 means not coloured yet
    for s in range(n):                        # the graph may be disconnected: start once per component
        if color[s] != -1:
            continue
        color[s] = 0                          # either colour works for a new component's start
        queue = deque([s])
        while queue:
            u = queue.popleft()
            for v in adj[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]   # the neighbour is forced to the opposite colour
                    queue.append(v)
                elif color[v] == color[u]:
                    return None               # both ends same colour: the graph has an odd cycle
    return color


def find_odd_cycle(adj):
    """Return an odd cycle (nodes in order) as evidence when not bipartite; None if bipartite."""
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
                elif depth[v] % 2 == depth[u] % 2:  # the colour is the parity of the BFS level
                    a, b = [u], [v]
                    while a[-1] != b[-1]:           # climb from the deeper end until they meet
                        if depth[a[-1]] >= depth[b[-1]]:
                            a.append(parent[a[-1]])
                        else:
                            b.append(parent[b[-1]])
                    return a + b[-2::-1]            # u -> meeting point -> v, closed by edge v-u
    return None


def first_conflict_edge(n, edges):
    """Add edges one at a time: index of the first edge that breaks bipartiteness, else -1."""
    parent = list(range(2 * n))               # x means "x's side", x + n means "the side opposite x"

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]     # path halving
            x = parent[x]
        return x

    for i, (u, v) in enumerate(edges):
        if find(u) == find(v):                # u and v were already forced onto the same side
            return i
        parent[find(u)] = find(v + n)         # u joins the side opposite v
        parent[find(v)] = find(u + n)         # v joins the side opposite u
    return -1


def build(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    return adj


if __name__ == "__main__":
    # The same graphs as the interactive demo: A..F are numbered 0..5
    ok = [(0, 1), (0, 3), (1, 2), (2, 3), (2, 4), (3, 5), (4, 5)]
    odd = [(0, 1), (0, 3), (1, 2), (2, 3), (2, 4), (3, 4), (4, 5)]
    print(bipartite_colors(build(6, ok)))    # [0, 1, 0, 1, 1, 0]
    print(bipartite_colors(build(6, odd)))   # None
    print(["ABCDEF"[x] for x in find_odd_cycle(build(6, odd))])  # ['C', 'B', 'A', 'D', 'E']
    print(first_conflict_edge(6, odd))       # 5: adding D-E turns C-D-E into a triangle`;

const cpp = `#include <iostream>
#include <numeric>
#include <queue>
#include <utility>
#include <vector>

using Graph = std::vector<std::vector<int>>;

// Two-colour with BFS: returns true if bipartite, and color[u] is the group u lands in (0 or 1)
bool bipartiteColors(const Graph& adj, std::vector<int>& color) {
    int n = (int)adj.size();
    color.assign(n, -1);                          // -1 means not coloured yet
    std::queue<int> q;
    for (int s = 0; s < n; ++s) {                 // may be disconnected: start once per component
        if (color[s] != -1) continue;
        color[s] = 0;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) {
                if (color[v] == -1) {
                    color[v] = 1 - color[u];      // the neighbour is forced to the opposite colour
                    q.push(v);
                } else if (color[v] == color[u]) {
                    return false;                 // both ends same colour: there is an odd cycle
                }
            }
        }
    }
    return true;
}

// Union-find version: x means "x's side", x + n means "the side opposite x"
struct SideDSU {
    std::vector<int> parent;
    explicit SideDSU(int n) : parent(2 * n) { std::iota(parent.begin(), parent.end(), 0); }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];        // path halving
            x = parent[x];
        }
        return x;
    }
    void unite(int a, int b) { parent[find(a)] = find(b); }
};

// Add edges one at a time; returns the index of the first edge that breaks bipartiteness, else -1
int firstConflictEdge(int n, const std::vector<std::pair<int, int>>& edges) {
    SideDSU dsu(n);
    for (int i = 0; i < (int)edges.size(); ++i) {
        auto [u, v] = edges[i];
        if (dsu.find(u) == dsu.find(v)) return i;  // already forced onto the same side
        dsu.unite(u, v + n);                       // u joins the side opposite v
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
    // The same graphs as the interactive demo: A..F are numbered 0..5
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

export const skeleton: LessonSkeleton = {
  demo: <BipartiteDemo />,
  code: { python, cpp },
};
