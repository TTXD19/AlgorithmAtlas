import { FenwickDemo } from "@/components/lesson/demos/FenwickDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `class Fenwick:
    """Fenwick tree (binary indexed tree): prefix sums plus point updates, indexed from 1."""

    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)

    def update(self, i, delta):
        """a[i] += delta. Jump upward to every cell that is also responsible for i"""
        while i <= self.n:
            self.tree[i] += delta
            i += i & -i                    # add the lowbit

    def prefix(self, i):
        """a[1] + ... + a[i]. Jump downward, stitching the covered segments together"""
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & -i                    # strip the lowbit
        return s

    def range_sum(self, l, r):
        return self.prefix(r) - self.prefix(l - 1)

    @classmethod
    def from_list(cls, a):
        """O(n) build: every cell adds itself into the cell above that is responsible for it"""
        f = cls(len(a))
        for i, x in enumerate(a, start=1):
            f.tree[i] += x
            j = i + (i & -i)
            if j <= f.n:
                f.tree[j] += f.tree[i]
        return f


f = Fenwick.from_list([5, 3, 8, 6, 2, 7, 4, 1])
print(f.prefix(6))          # 31
f.update(3, 2)
print(f.range_sum(2, 5))    # 3 + 10 + 6 + 2 = 21


# Classic application: inversions, or how many numbers to the right of me are smaller
def count_smaller_to_right(nums):
    ranks = {v: i + 1 for i, v in enumerate(sorted(set(nums)))}   # compress the values into 1..m
    f = Fenwick(len(ranks))
    out = []
    for v in reversed(nums):                # scan from right to left
        out.append(f.prefix(ranks[v] - 1))  # how many already seen are smaller than v
        f.update(ranks[v], 1)
    return out[::-1]`;

const cpp = `#include <vector>

class Fenwick {
    int n;
    std::vector<long long> tree;
public:
    Fenwick(int n) : n(n), tree(n + 1, 0) {}

    void update(int i, long long delta) {
        for (; i <= n; i += i & -i) tree[i] += delta;
    }
    long long prefix(int i) {
        long long s = 0;
        for (; i > 0; i -= i & -i) s += tree[i];
        return s;
    }
    long long rangeSum(int l, int r) { return prefix(r) - prefix(l - 1); }
};

// Usage (1-indexed)
// Fenwick f(8);
// for (int i = 1; i <= 8; i++) f.update(i, a[i]);
// f.prefix(6); f.update(3, 2); f.rangeSum(2, 5);`;

export const skeleton: LessonSkeleton = {
  demo: <FenwickDemo />,
  code: { python, cpp },
};
