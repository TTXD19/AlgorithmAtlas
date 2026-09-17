import { CycleDemo } from "@/components/lesson/demos/CycleDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `WHITE, GRAY, BLACK = 0, 1, 2


def find_directed_cycle(n, edges):
    """Directed graph: three-colour DFS. Returns the nodes on the cycle (first == last), or None."""
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    color = [WHITE] * n
    path = []                                # the current call stack

    def dfs(u):
        color[u] = GRAY                      # entering: u is on the path
        path.append(u)
        for v in adj[u]:
            if color[v] == GRAY:             # back edge: v is still on the path
                return path[path.index(v):] + [v]
            if color[v] == WHITE:
                cycle = dfs(v)
                if cycle:
                    return cycle
        path.pop()
        color[u] = BLACK                     # leaving: nothing reachable from u comes back
        return None

    for s in range(n):                       # the graph may be disconnected, so start from every white node
        if color[s] == WHITE:
            cycle = dfs(s)
            if cycle:
                return cycle
    return None


def has_undirected_cycle(n, edges):
    """Undirected graph: union-find. If both ends are already in one set, this edge closes a cycle."""
    parent = list(range(n))
    size = [1] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]    # path halving
            x = parent[x]
        return x

    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return True
        if size[ru] < size[rv]:              # hang the smaller tree under the larger one
            ru, rv = rv, ru
        parent[rv] = ru
        size[ru] += size[rv]
    return False


def has_undirected_cycle_dfs(n, edges):
    """Undirected graph, DFS version: a visited neighbour reached by an edge other than the one we came in on means a cycle."""
    adj = [[] for _ in range(n)]
    for i, (u, v) in enumerate(edges):
        adj[u].append((v, i))
        adj[v].append((u, i))
    seen = [False] * n

    def dfs(u, via):                         # via: index of the edge we used to reach u
        seen[u] = True
        for v, i in adj[u]:
            if i == via:                     # compare edge indices, not parents, so parallel edges are not missed
                continue
            if seen[v] or dfs(v, i):
                return True
        return False

    return any(not seen[s] and dfs(s, -1) for s in range(n))


if __name__ == "__main__":
    # the same graph as the interactive demo, with A..F numbered 0..5
    directed = [(0, 1), (0, 5), (1, 2), (1, 3), (3, 4), (4, 1), (5, 4)]
    print(find_directed_cycle(6, directed))                      # [1, 3, 4, 1], i.e. B → D → E → B
    print(find_directed_cycle(4, [(0, 1), (0, 2), (1, 3), (2, 3)]))  # None (diamond: 3 is reached twice, but there is no cycle)
    undirected = [(0, 1), (1, 2), (0, 5), (2, 3), (5, 4), (3, 4), (1, 3)]
    print(has_undirected_cycle(6, undirected))                   # True (the 6th edge, D – E, closes a cycle)
    print(has_undirected_cycle(6, undirected[:5]))               # False (the first 5 edges form a tree)
    print(has_undirected_cycle_dfs(6, undirected[:5]))           # False
    print(has_undirected_cycle_dfs(2, [(0, 1), (0, 1)]))         # True (two parallel edges are a cycle too)`;

const cpp = `#include <algorithm>
#include <iostream>
#include <numeric>
#include <utility>
#include <vector>

using Edges = std::vector<std::pair<int, int>>;
enum Color { WHITE, GRAY, BLACK };

// Directed graph: three-colour DFS. On success it writes the cycle's nodes (first == last) into cycle.
bool dfs(int u, const std::vector<std::vector<int>>& adj, std::vector<Color>& color,
         std::vector<int>& path, std::vector<int>& cycle) {
    color[u] = GRAY;                           // entering: u is on the path
    path.push_back(u);
    for (int v : adj[u]) {
        if (color[v] == GRAY) {                // back edge: v is still on the path
            cycle.assign(std::find(path.begin(), path.end(), v), path.end());
            cycle.push_back(v);
            return true;
        }
        if (color[v] == WHITE && dfs(v, adj, color, path, cycle)) return true;
    }
    path.pop_back();
    color[u] = BLACK;                          // leaving: nothing reachable from u comes back
    return false;
}

std::vector<int> findDirectedCycle(int n, const Edges& edges) {
    std::vector<std::vector<int>> adj(n);
    for (const auto& [u, v] : edges) adj[u].push_back(v);
    std::vector<Color> color(n, WHITE);
    std::vector<int> path, cycle;
    for (int s = 0; s < n; s++)                // start from every white node
        if (color[s] == WHITE && dfs(s, adj, color, path, cycle)) break;
    return cycle;                              // empty means no cycle
}

// Undirected graph: union-find
bool hasUndirectedCycle(int n, const Edges& edges) {
    std::vector<int> parent(n), size(n, 1);
    std::iota(parent.begin(), parent.end(), 0);
    auto find = [&](int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];     // path halving
            x = parent[x];
        }
        return x;
    };
    for (const auto& [u, v] : edges) {
        int ru = find(u), rv = find(v);
        if (ru == rv) return true;             // already connected, so this edge closes a cycle
        if (size[ru] < size[rv]) std::swap(ru, rv);
        parent[rv] = ru;
        size[ru] += size[rv];
    }
    return false;
}

int main() {
    Edges directed = {{0, 1}, {0, 5}, {1, 2}, {1, 3}, {3, 4}, {4, 1}, {5, 4}};
    for (int x : findDirectedCycle(6, directed)) std::cout << x << ' ';  // 1 3 4 1 (B → D → E → B)
    std::cout << "\\n";
    Edges diamond = {{0, 1}, {0, 2}, {1, 3}, {2, 3}};
    std::cout << findDirectedCycle(4, diamond).size() << "\\n";          // 0 (a diamond has no cycle)

    Edges undirected = {{0, 1}, {1, 2}, {0, 5}, {2, 3}, {5, 4}, {3, 4}, {1, 3}};
    std::cout << std::boolalpha << hasUndirectedCycle(6, undirected) << "\\n";  // true
    undirected.resize(5);                                                  // keep only the first 5: a tree
    std::cout << hasUndirectedCycle(6, undirected) << "\\n";               // false
}`;

export const skeleton: LessonSkeleton = {
  demo: <CycleDemo />,
  code: { python, cpp },
};
