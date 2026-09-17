import { UnionFindDemo } from "@/components/lesson/demos/UnionFindDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))     # everyone starts out as their own root
        self.size = [1] * n              # size of each tree, used when merging
        self.count = n                   # how many groups there are right now

    def find(self, x):
        """Find the root. Path compression: on the way back, hang every node on the path straight off the root"""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        """Merge two groups. False means they were already one group (that signal detects cycles)"""
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:    # union by size: hang the smaller tree under the larger
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        self.count -= 1
        return True

    def connected(self, a, b):
        return self.find(a) == self.find(b)


# Usage: counting connected components (the heart of LeetCode 547 Number of Provinces)
uf = UnionFind(8)
for a, b in [(0, 1), (2, 3), (1, 3), (4, 5), (6, 7), (5, 7)]:
    uf.union(a, b)
print(uf.count)                 # 2 groups: {0,1,2,3} and {4,5,6,7}
print(uf.connected(0, 4))       # False

# Cycle detection on an undirected graph: if both ends are already one group, this edge closes a cycle
def has_cycle(n, edges):
    uf = UnionFind(n)
    return any(not uf.union(a, b) for a, b in edges)`;

const cpp = `#include <vector>
#include <numeric>

class UnionFind {
    std::vector<int> parent, sz;
public:
    int count;
    UnionFind(int n) : parent(n), sz(n, 1), count(n) {
        std::iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];   // path halving: re-link upwards as we walk
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (sz[ra] < sz[rb]) std::swap(ra, rb);
        parent[rb] = ra;
        sz[ra] += sz[rb];
        count--;
        return true;
    }
    bool connected(int a, int b) { return find(a) == find(b); }
};`;

export const skeleton: LessonSkeleton = {
  demo: <UnionFindDemo />,
  code: { python, cpp },
};
