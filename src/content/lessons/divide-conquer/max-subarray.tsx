import { MaxSubarrayDemo } from "@/components/lesson/demos/MaxSubarrayDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Maximum subarray (LeetCode 53): the divide-and-conquer version.
# The answer can only be in one of three places: all in the left half, all in the right half, or across the middle.
def max_subarray_dc(a):
    def solve(lo, hi):
        if lo == hi:
            return a[lo]                          # a single element
        mid = (lo + hi) // 2
        left = solve(lo, mid)                     # all in the left half
        right = solve(mid + 1, hi)                # all in the right half
        # Across the middle: best suffix ending at mid + best prefix starting at mid+1
        s, best_l = 0, float("-inf")
        for i in range(mid, lo - 1, -1):
            s += a[i]
            best_l = max(best_l, s)
        s, best_r = 0, float("-inf")
        for i in range(mid + 1, hi + 1):
            s += a[i]
            best_r = max(best_r, s)
        return max(left, right, best_l + best_r)  # take the best of the three
    return solve(0, len(a) - 1)


# Kadane: cur is the best sum ending at i. Drop it once it goes negative and start over.
def max_subarray_kadane(a):
    cur = best = a[0]
    for x in a[1:]:
        cur = max(x, cur + x)                     # extend the run, or restart from x
        best = max(best, cur)
    return best


# Variant: also return the range [l, r]
def max_subarray_range(a):
    cur, best = a[0], a[0]
    start, l, r = 0, 0, 0
    for i in range(1, len(a)):
        if cur < 0:
            cur, start = a[i], i                  # start over
        else:
            cur += a[i]
        if cur > best:
            best, l, r = cur, start, i
    return best, l, r


if __name__ == "__main__":
    a = [-2, 1, -3, 4, -1, 2, 1, -5]
    print(max_subarray_dc(a), max_subarray_kadane(a), max_subarray_range(a))  # 6 6 (6, 3, 6)`;

const cpp = `#include <vector>
#include <algorithm>
#include <climits>
#include <cstdio>

// Divide and conquer: all in the left half, all in the right half, or across the middle. Take the best.
int solve(const std::vector<int>& a, int lo, int hi) {
    if (lo == hi) return a[lo];
    int mid = (lo + hi) / 2;
    int left = solve(a, lo, mid);
    int right = solve(a, mid + 1, hi);
    int s = 0, bestL = INT_MIN;                   // best suffix running left from mid
    for (int i = mid; i >= lo; i--) { s += a[i]; bestL = std::max(bestL, s); }
    s = 0; int bestR = INT_MIN;                   // best prefix running right from mid+1
    for (int i = mid + 1; i <= hi; i++) { s += a[i]; bestR = std::max(bestR, s); }
    return std::max({left, right, bestL + bestR});
}
int maxSubarrayDC(const std::vector<int>& a) { return solve(a, 0, (int)a.size() - 1); }

// Kadane: cur is the best sum ending at i
int maxSubarrayKadane(const std::vector<int>& a) {
    int cur = a[0], best = a[0];
    for (size_t i = 1; i < a.size(); i++) {
        cur = std::max(a[i], cur + a[i]);         // extend the run, or restart from a[i]
        best = std::max(best, cur);
    }
    return best;
}

// Variant: report the range [l, r]
int maxSubarrayRange(const std::vector<int>& a, int& l, int& r) {
    int cur = a[0], best = a[0], start = 0;
    l = r = 0;
    for (int i = 1; i < (int)a.size(); i++) {
        if (cur < 0) { cur = a[i]; start = i; }
        else cur += a[i];
        if (cur > best) { best = cur; l = start; r = i; }
    }
    return best;
}

int main() {
    std::vector<int> a = {-2, 1, -3, 4, -1, 2, 1, -5};
    int l, r;
    int best = maxSubarrayRange(a, l, r);
    std::printf("%d %d %d [%d, %d]\\n", maxSubarrayDC(a), maxSubarrayKadane(a), best, l, r); // 6 6 6 [3, 6]
}`;

export const skeleton: LessonSkeleton = {
  demo: <MaxSubarrayDemo />,
  code: { python, cpp },
};
