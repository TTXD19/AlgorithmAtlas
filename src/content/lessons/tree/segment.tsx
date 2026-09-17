import { SegmentTreeDemo } from "@/components/lesson/demos/SegmentTreeDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `class SegmentTree:
    """Range sum with point updates. The children of tree[i] are 2i and 2i+1 (1-indexed heap layout)"""

    def __init__(self, a):
        self.n = len(a)
        self.tree = [0] * (4 * self.n)       # 4n is always enough
        self._build(1, 0, self.n - 1, a)

    def _build(self, node, lo, hi, a):
        if lo == hi:
            self.tree[node] = a[lo]
            return
        mid = (lo + hi) // 2
        self._build(2 * node, lo, mid, a)
        self._build(2 * node + 1, mid + 1, hi, a)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def query(self, ql, qh):
        return self._query(1, 0, self.n - 1, ql, qh)

    def _query(self, node, lo, hi, ql, qh):
        if qh < lo or hi < ql:                # no overlap at all
            return 0
        if ql <= lo and hi <= qh:             # fully contained: use it as is
            return self.tree[node]
        mid = (lo + hi) // 2                  # partial overlap: split and recurse
        return (self._query(2 * node, lo, mid, ql, qh) +
                self._query(2 * node + 1, mid + 1, hi, ql, qh))

    def update(self, i, value):
        self._update(1, 0, self.n - 1, i, value)

    def _update(self, node, lo, hi, i, value):
        if lo == hi:
            self.tree[node] = value
            return
        mid = (lo + hi) // 2
        if i <= mid:
            self._update(2 * node, lo, mid, i, value)
        else:
            self._update(2 * node + 1, mid + 1, hi, i, value)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]   # refresh the ancestors on the way back up


st = SegmentTree([5, 3, 8, 6, 2, 7, 4, 1])
print(st.query(2, 5))     # 8 + 6 + 2 + 7 = 23
st.update(3, 10)
print(st.query(2, 5))     # 27

# For a range maximum instead: change the three "+" to max and return -inf when the ranges are disjoint`;

const cpp = `#include <vector>
#include <algorithm>

class SegmentTree {
    int n;
    std::vector<long long> tree;

    void build(int node, int lo, int hi, const std::vector<int>& a) {
        if (lo == hi) { tree[node] = a[lo]; return; }
        int mid = (lo + hi) / 2;
        build(2 * node, lo, mid, a);
        build(2 * node + 1, mid + 1, hi, a);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
    long long query(int node, int lo, int hi, int ql, int qh) {
        if (qh < lo || hi < ql) return 0;                 // no overlap
        if (ql <= lo && hi <= qh) return tree[node];      // fully contained
        int mid = (lo + hi) / 2;
        return query(2 * node, lo, mid, ql, qh) + query(2 * node + 1, mid + 1, hi, ql, qh);
    }
    void update(int node, int lo, int hi, int i, int value) {
        if (lo == hi) { tree[node] = value; return; }
        int mid = (lo + hi) / 2;
        if (i <= mid) update(2 * node, lo, mid, i, value);
        else update(2 * node + 1, mid + 1, hi, i, value);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
public:
    SegmentTree(const std::vector<int>& a) : n(a.size()), tree(4 * a.size()) { build(1, 0, n - 1, a); }
    long long query(int ql, int qh) { return query(1, 0, n - 1, ql, qh); }
    void update(int i, int value) { update(1, 0, n - 1, i, value); }
};`;

export const skeleton: LessonSkeleton = {
  demo: <SegmentTreeDemo />,
  code: { python, cpp },
};
