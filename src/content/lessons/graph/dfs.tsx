import { GraphDemo } from "@/components/lesson/GraphDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `def dfs(adj, start):
    # adj: dict[node, list[node]]. Returns the visit order.
    order = []
    visited = set()

    def go(u):
        visited.add(u)
        order.append(u)
        for v in adj[u]:
            if v not in visited:
                go(v)                # finish the path through v before the next neighbour
        # this is u's "finished" moment (the backtracking point)

    go(start)
    return order


def dfs_iterative(adj, start):
    # An explicit stack instead of recursion; the order may differ slightly from the recursive version
    order, visited = [], set()
    stack = [start]
    while stack:
        u = stack.pop()              # take from the top
        if u in visited:
            continue
        visited.add(u)
        order.append(u)
        for v in reversed(adj[u]):    # push in reverse so the first neighbour comes off first
            if v not in visited:
                stack.append(v)
    return order`;

const cpp = `#include <vector>

// adj[u] lists u's neighbours; order collects the visit order
void dfs(int u, const std::vector<std::vector<int>>& adj,
         std::vector<bool>& visited, std::vector<int>& order) {
    visited[u] = true;
    order.push_back(u);
    for (int v : adj[u]) {
        if (!visited[v]) {
            dfs(v, adj, visited, order);   // go deep into v first
        }
    }
    // every neighbour of u is handled: backtrack
}

std::vector<int> dfsFrom(const std::vector<std::vector<int>>& adj, int start) {
    std::vector<bool> visited(adj.size(), false);
    std::vector<int> order;
    dfs(start, adj, visited, order);
    return order;
}`;

export const skeleton: LessonSkeleton = {
  demo: <GraphDemo algo="dfs" />,
  code: { python, cpp },
};
