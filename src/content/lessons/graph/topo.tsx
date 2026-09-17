import { TopoDemo } from "@/components/lesson/demos/TopoDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `from collections import deque


def topo_kahn(n, edges):
    """Kahn: repeatedly take a node with in-degree 0. Returns [] if there is a cycle. O(V+E)"""
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:                  # u → v: u must come before v
        adj[u].append(v)
        indeg[v] += 1
    queue = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1               # remove the edge u → v
            if indeg[v] == 0:           # every prerequisite of v is placed
                queue.append(v)
    return order if len(order) == n else []   # fewer than n means a cycle


def topo_dfs(n, edges):
    """DFS: three-colour marking, finish order reversed. O(V+E)"""
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * n
    post = []

    def dfs(u):
        color[u] = GRAY                 # on the call stack
        for v in adj[u]:
            if color[v] == GRAY:        # back edge: there is a cycle
                return False
            if color[v] == WHITE and not dfs(v):
                return False
        color[u] = BLACK
        post.append(u)                  # u finishes only after everything it reaches
        return True

    for i in range(n):                  # the graph may be disconnected, so try every start
        if color[i] == WHITE and not dfs(i):
            return []
    return post[::-1]


def topo_layers(n, edges):
    """Kahn by layers: nodes in one layer are independent and can run in parallel"""
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v)
        indeg[v] += 1
    layer = [i for i in range(n) if indeg[i] == 0]
    layers, count = [], 0
    while layer:
        layers.append(layer)
        count += len(layer)
        nxt = []
        for u in layer:                 # drain a whole layer, then compute the next one
            for v in adj[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    nxt.append(v)
        layer = nxt
    return layers if count == n else []


if __name__ == "__main__":
    # Same graph as the interactive demo: 0 react, 1 ts, 2 r-dom, 3 lint, 4 next, 5 app
    edges = [(0, 2), (0, 4), (2, 4), (2, 5), (1, 3), (1, 4), (4, 5), (3, 5)]
    print(topo_kahn(6, edges))                    # [0, 1, 2, 3, 4, 5]
    print(topo_dfs(6, edges))                     # [1, 3, 0, 2, 4, 5]
    print(topo_layers(6, edges))                  # [[0, 1], [2, 3], [4], [5]]
    print(topo_kahn(3, [(0, 1), (1, 2), (2, 0)])) # [] (cycle)`;

const cpp = `#include <functional>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>

using Edges = std::vector<std::pair<int, int>>;   // (u, v): u must come before v

// Kahn: repeatedly take a node with in-degree 0. Returns an empty vector if there is a cycle. O(V+E)
std::vector<int> topoKahn(int n, const Edges& edges) {
    std::vector<std::vector<int>> adj(n);
    std::vector<int> indeg(n, 0);
    for (auto [u, v] : edges) { adj[u].push_back(v); indeg[v]++; }
    std::queue<int> q;
    for (int i = 0; i < n; i++)
        if (indeg[i] == 0) q.push(i);
    std::vector<int> order;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u])
            if (--indeg[v] == 0) q.push(v);        // with that edge gone, v has no prerequisites left
    }
    if ((int)order.size() < n) return {};          // cycle
    return order;
}

// DFS: three-colour marking, finish order reversed. O(V+E)
std::vector<int> topoDfs(int n, const Edges& edges) {
    std::vector<std::vector<int>> adj(n);
    for (auto [u, v] : edges) adj[u].push_back(v);
    std::vector<int> color(n, 0), post;            // 0 white, 1 grey (on the stack), 2 black
    std::function<bool(int)> dfs = [&](int u) {
        color[u] = 1;
        for (int v : adj[u]) {
            if (color[v] == 1) return false;       // back edge: there is a cycle
            if (color[v] == 0 && !dfs(v)) return false;
        }
        color[u] = 2;
        post.push_back(u);                         // u finishes only after all its successors
        return true;
    };
    for (int i = 0; i < n; i++)
        if (color[i] == 0 && !dfs(i)) return {};
    return std::vector<int>(post.rbegin(), post.rend());
}

// Lexicographically smallest topological order: swap the queue for a min-heap. O(V log V + E)
std::vector<int> topoSmallest(int n, const Edges& edges) {
    std::vector<std::vector<int>> adj(n);
    std::vector<int> indeg(n, 0);
    for (auto [u, v] : edges) { adj[u].push_back(v); indeg[v]++; }
    std::priority_queue<int, std::vector<int>, std::greater<int>> pq;
    for (int i = 0; i < n; i++)
        if (indeg[i] == 0) pq.push(i);
    std::vector<int> order;
    while (!pq.empty()) {
        int u = pq.top(); pq.pop();                // of the nodes ready to go, take the smallest id
        order.push_back(u);
        for (int v : adj[u])
            if (--indeg[v] == 0) pq.push(v);
    }
    if ((int)order.size() < n) return {};
    return order;
}

void print(const std::vector<int>& v) {
    for (int x : v) std::cout << x << ' ';
    std::cout << "\\n";
}

int main() {
    // Same graph as the interactive demo: 0 react, 1 ts, 2 r-dom, 3 lint, 4 next, 5 app
    Edges edges = {{0, 2}, {0, 4}, {2, 4}, {2, 5}, {1, 3}, {1, 4}, {4, 5}, {3, 5}};
    print(topoKahn(6, edges));                     // 0 1 2 3 4 5
    print(topoDfs(6, edges));                      // 1 3 0 2 4 5
    print(topoSmallest(4, {{3, 1}, {2, 0}}));      // 2 0 3 1 (a plain queue gives 2 3 0 1)
    std::cout << topoKahn(3, {{0, 1}, {1, 2}, {2, 0}}).size() << "\\n";  // 0 (cycle)
}`;

export const skeleton: LessonSkeleton = {
  demo: <TopoDemo />,
  code: { python, cpp },
};
