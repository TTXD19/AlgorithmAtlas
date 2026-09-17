import { TreeDpDemo } from "@/components/lesson/demos/TreeDpDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `from collections import defaultdict


class Node:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right


def diameter(root):
    """Diameter of a binary tree, in edges: return the longest downward chain, and use "left chain + right chain" to update the answer on the way"""
    best = 0

    def down(node):
        nonlocal best
        if node is None:
            return -1                          # an empty tree is -1, so a leaf's chain comes out as 0
        dl, dr = down(node.left) + 1, down(node.right) + 1
        best = max(best, dl + dr)              # the path that turns at node: only used to update the answer
        return max(dl, dr)                     # the parent can only be handed a single straight chain

    down(root)
    return best


def max_path_sum(root):
    """LeetCode 124: node values can be negative, so a chain that does not help is simply left out"""
    best = float("-inf")

    def gain(node):
        nonlocal best
        if node is None:
            return 0
        gl, gr = max(gain(node.left), 0), max(gain(node.right), 0)
        best = max(best, node.val + gl + gr)
        return node.val + max(gl, gr)

    gain(root)
    return best


def max_independent_set(n, edges, weight):
    """Maximum weight independent set on a general tree: two nodes joined by an edge cannot both be picked. An iterative order keeps recursion shallow"""
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    order, parent, seen, stack = [], [-1] * n, [False] * n, [0]
    seen[0] = True
    while stack:                               # first lay out an order where a parent always precedes its children
        u = stack.pop()
        order.append(u)
        for v in adj[u]:
            if not seen[v]:
                seen[v], parent[v] = True, u
                stack.append(v)
    take, skip = weight[:], [0] * n            # take[u]: best for u's subtree when u is picked; skip[u]: when it is not
    for u in reversed(order):                  # go backwards, so every child is already done
        p = parent[u]
        if p != -1:
            take[p] += skip[u]                 # the parent was picked, so this child cannot be
            skip[p] += max(take[u], skip[u])   # the parent was skipped, so the child is free either way
    return max(take[0], skip[0])


if __name__ == "__main__":
    N = Node                                   # the same tree as the interactive demo
    tree = N("A", N("B", N("D", N("F"), N("G", None, N("H"))), N("E", None, N("I", None, N("J")))), N("C"))
    print(diameter(tree))                      # 6 (H-G-D-B-E-I-J, which never touches the root A)
    print(max_path_sum(N(-10, N(9), N(20, N(15), N(7)))))   # 42 (15 -> 20 -> 7)
    # Org chart: 0 is the CEO. A manager and a direct report are never both invited; maximise the total willingness score
    print(max_independent_set(7, [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)], [5, 3, 6, 4, 2, 3, 3]))   # 17`;

const cpp = `#include <algorithm>
#include <functional>
#include <iostream>
#include <utility>
#include <vector>

// Diameter of a general tree: at every node, combine the longest and second-longest downward chains
int treeDiameter(const std::vector<std::vector<int>>& adj) {
    int best = 0;
    std::function<int(int, int)> down = [&](int u, int parent) {
        int first = 0, second = 0;
        for (int v : adj[u]) {
            if (v == parent) continue;                  // undirected edge: do not walk back to the parent
            int d = down(v, u) + 1;
            if (d > first) { second = first; first = d; }
            else if (d > second) second = d;
        }
        best = std::max(best, first + second);          // the longest path that turns at u
        return first;                                   // only one chain is handed upwards
    };
    down(0, -1);
    return best;
}

// Rerooting DP (LeetCode 834): the sum of distances from every node to all others, in two O(n) passes
std::vector<long long> sumOfDistances(int n, const std::vector<std::pair<int, int>>& edges) {
    std::vector<std::vector<int>> adj(n);
    for (auto [u, v] : edges) { adj[u].push_back(v); adj[v].push_back(u); }
    std::vector<int> order, parent(n, -1), size(n, 1), depth(n, 0), stack = {0};
    std::vector<bool> seen(n, false);
    seen[0] = true;
    while (!stack.empty()) {                            // an order where parents come before their children
        int u = stack.back(); stack.pop_back();
        order.push_back(u);
        for (int v : adj[u])
            if (!seen[v]) { seen[v] = true; parent[v] = u; depth[v] = depth[u] + 1; stack.push_back(v); }
    }
    std::vector<long long> ans(n, 0);
    for (int i = n - 1; i > 0; i--) size[parent[order[i]]] += size[order[i]];   // pass 1: subtree sizes, bottom-up
    for (int u = 0; u < n; u++) ans[0] += depth[u];     // the sum of distances with 0 as the root
    for (int i = 1; i < n; i++) {                       // pass 2: reroot, top-down
        int u = order[i];                               // moving the root from the parent to u: u's subtree gets 1 closer, the rest 1 further
        ans[u] = ans[parent[u]] - size[u] + (n - size[u]);
    }
    return ans;
}

int main() {
    std::vector<std::pair<int, int>> edges = {{0, 1}, {0, 2}, {2, 3}, {2, 4}, {2, 5}};
    std::vector<std::vector<int>> adj(6);
    for (auto [u, v] : edges) { adj[u].push_back(v); adj[v].push_back(u); }
    std::cout << treeDiameter(adj) << '\\n';            // 3 (1-0-2-3, for instance)
    for (long long s : sumOfDistances(6, edges)) std::cout << s << ' ';
    std::cout << '\\n';                                 // 8 12 6 10 10 10
}`;

export const skeleton: LessonSkeleton = {
  demo: <TreeDpDemo />,
  code: { python, cpp },
};
