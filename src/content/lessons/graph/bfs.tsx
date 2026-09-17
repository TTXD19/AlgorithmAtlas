import { GraphDemo } from "@/components/lesson/GraphDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `from collections import deque

def bfs(adj, start):
    # adj: dict[node, list[node]]. Returns each node's distance from start.
    dist = {start: 0}
    queue = deque([start])
    while queue:
        u = queue.popleft()          # take from the front
        for v in adj[u]:
            if v not in dist:        # not discovered yet
                dist[v] = dist[u] + 1
                queue.append(v)      # push to the back
    return dist`;

const cpp = `#include <vector>
#include <queue>

// adj[u] lists u's neighbours. Returns each node's distance from start (-1 = unreachable).
std::vector<int> bfs(const std::vector<std::vector<int>>& adj, int start) {
    std::vector<int> dist(adj.size(), -1);
    std::queue<int> q;
    dist[start] = 0;
    q.push(start);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) {     // not discovered yet
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return dist;
}`;

export const skeleton: LessonSkeleton = {
  demo: <GraphDemo algo="bfs" />,
  code: { python, cpp },
};
