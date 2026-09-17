import { LowerBoundDemo } from "@/components/lesson/demos/LowerBoundDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `import math
from itertools import permutations


def lower_bound(n):
    """Any comparison sort needs at least ⌈log₂ n!⌉ comparisons in the worst case (integer maths, so no float error)"""
    return (math.factorial(n) - 1).bit_length()   # for m ≥ 1, (m − 1).bit_length() = ⌈log₂ m⌉


# Two sorts that may only ask less(x, y), so the comparisons can actually be counted
def merge_sort(a, less):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid], less), merge_sort(a[mid:], less)
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if less(right[j], left[i]):
            out.append(right[j]); j += 1
        else:
            out.append(left[i]); i += 1
    return out + left[i:] + right[j:]


def binary_insertion_sort(a, less):
    out = []
    for x in a:
        lo, hi = 0, len(out)
        while lo < hi:                             # binary search for the slot inside the sorted out
            mid = (lo + hi) // 2
            if less(x, out[mid]):
                hi = mid
            else:
                lo = mid + 1
        out.insert(lo, x)
    return out


def worst_comparisons(sort, n):
    """Run all n! permutations of n distinct elements; return the largest comparison count"""
    worst = 0
    for perm in permutations(range(n)):
        count = 0

        def less(x, y):
            nonlocal count
            count += 1
            return x < y

        sort(list(perm), less)
        worst = max(worst, count)
    return worst


if __name__ == "__main__":
    for n in range(2, 9):
        print(n, lower_bound(n), worst_comparisons(merge_sort, n),
              worst_comparisons(binary_insertion_sort, n))
    # n  bound  merge  binary insertion
    # 2   1    1     1
    # 3   3    3     3
    # 4   5    5     5
    # 5   7    8     8      ← the bound of 7 is reachable (merge insertion); neither of these two gets there
    # 6  10   11    11
    # 7  13   14    14
    # 8  16   17    17
    n = 10**6                                      # estimate log₂ n! with lgamma and compare it against n log₂ n
    print(round(math.lgamma(n + 1) / math.log(2) / (n * math.log2(n)), 3))   # 0.928`;

const cpp = `#include <algorithm>
#include <cmath>
#include <cstdio>
#include <functional>
#include <numeric>
#include <vector>

using Less = std::function<bool(int, int)>;

// ⌈log₂ n!⌉: for n ≤ 20 the factorial fits in unsigned long long, so integer maths has no float error
int lowerBound(int n) {
    unsigned long long f = 1;
    for (int i = 2; i <= n; i++) f *= i;
    int h = 0;
    while ((1ULL << h) < f) h++;                   // the smallest h with 2^h ≥ n!
    return h;
}

std::vector<int> mergeSort(const std::vector<int>& a, const Less& less) {
    if (a.size() <= 1) return a;
    std::size_t mid = a.size() / 2;
    auto l = mergeSort({a.begin(), a.begin() + mid}, less);
    auto r = mergeSort({a.begin() + mid, a.end()}, less);
    std::vector<int> out;
    std::size_t i = 0, j = 0;
    while (i < l.size() && j < r.size()) out.push_back(less(r[j], l[i]) ? r[j++] : l[i++]);
    out.insert(out.end(), l.begin() + i, l.end());
    out.insert(out.end(), r.begin() + j, r.end());
    return out;
}

std::vector<int> binaryInsertionSort(const std::vector<int>& a, const Less& less) {
    std::vector<int> out;
    for (int x : a) {
        std::size_t lo = 0, hi = out.size();
        while (lo < hi) {                          // binary search for the slot inside the sorted out
            std::size_t mid = (lo + hi) / 2;
            if (less(x, out[mid])) hi = mid; else lo = mid + 1;
        }
        out.insert(out.begin() + lo, x);
    }
    return out;
}

// Walk all n! permutations and return the largest comparison count
int worstComparisons(std::vector<int> (*sort)(const std::vector<int>&, const Less&), int n) {
    std::vector<int> perm(n);
    std::iota(perm.begin(), perm.end(), 0);
    int worst = 0;
    do {
        int count = 0;
        sort(perm, [&](int x, int y) { count++; return x < y; });
        worst = std::max(worst, count);
    } while (std::next_permutation(perm.begin(), perm.end()));
    return worst;
}

int main() {
    for (int n = 2; n <= 8; n++)                   // same table as the Python version
        std::printf("%d %d %d %d\\n", n, lowerBound(n),
                    worstComparisons(mergeSort, n), worstComparisons(binaryInsertionSort, n));
    double n = 1e6;                                // lgamma(n + 1) = ln(n!)
    std::printf("%.3f\\n", std::lgamma(n + 1) / std::log(2.0) / (n * std::log2(n)));   // 0.928
}`;

export const skeleton: LessonSkeleton = {
  demo: <LowerBoundDemo />,
  code: { python, cpp },
};
