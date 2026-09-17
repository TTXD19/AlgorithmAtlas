import { InversionsDemo } from "@/components/lesson/demos/InversionsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Merge sort counting inversions on the side: when a right element comes out first, every left element still waiting is bigger
def count_inversions(a):
    a = a[:]                                 # sort a copy, leave the input untouched
    buf = [0] * len(a)

    def sort(lo, hi):                        # sort a[lo:hi] and return the inversions inside it
        if hi - lo <= 1:
            return 0
        mid = (lo + hi) // 2
        cnt = sort(lo, mid) + sort(mid, hi)  # inside the left half + inside the right half
        i, j = lo, mid
        for k in range(lo, hi):
            if j == hi or (i < mid and a[i] <= a[j]):
                buf[k] = a[i]                # ties are not inversions, so take the left one first
                i += 1
            else:
                buf[k] = a[j]
                j += 1
                cnt += mid - i               # across the halves: the mid - i left elements left over all beat a[j]
        a[lo:hi] = buf[lo:hi]
        return cnt

    return sort(0, len(a))


def count_inversions_brute(a):               # O(n²) version to check against
    return sum(1 for i in range(len(a)) for j in range(i + 1, len(a)) if a[i] > a[j])


# Kendall tau distance between two rankings: how many pairs the two rankings order the opposite way
def kendall_tau_distance(rank_a, rank_b):
    pos = {item: i for i, item in enumerate(rank_b)}
    return count_inversions([pos[item] for item in rank_a])   # write down B's ranks in A's order


if __name__ == "__main__":
    judge_b = [3, 1, 4, 7, 2, 8, 5, 6]                       # the same data as the demo
    print(count_inversions(judge_b), count_inversions_brute(judge_b))   # 8 8
    print(kendall_tau_distance(["A", "B", "C", "D"], ["B", "A", "D", "C"]))   # 2
    print(count_inversions(list(range(5000, 0, -1))))       # 12497500 = 5000 × 4999 / 2`;

const cpp = `#include <algorithm>
#include <iostream>
#include <vector>

// Merge sort counting inversions on the side. At n = 10⁵ the answer reaches 5×10⁹, so long long is mandatory
long long sortCount(std::vector<int>& a, std::vector<int>& buf, int lo, int hi) {
    if (hi - lo <= 1) return 0;
    int mid = lo + (hi - lo) / 2;
    long long cnt = sortCount(a, buf, lo, mid) + sortCount(a, buf, mid, hi);
    int i = lo, j = mid;
    for (int k = lo; k < hi; k++) {
        if (j == hi || (i < mid && a[i] <= a[j])) buf[k] = a[i++];   // ties take the left one first
        else { buf[k] = a[j++]; cnt += mid - i; }   // the mid - i left elements left over all beat it
    }
    std::copy(buf.begin() + lo, buf.begin() + hi, a.begin() + lo);
    return cnt;
}

long long countInversions(std::vector<int> a) {   // by value: sorts a copy
    std::vector<int> buf(a.size());
    return sortCount(a, buf, 0, (int)a.size());
}

// The other O(n log n): scan left to right and use a Fenwick tree to count "how many earlier ones are bigger than me"
long long countInversionsBIT(const std::vector<int>& a) {
    std::vector<int> vals(a);                     // coordinate compression: values become ranks 1..m
    std::sort(vals.begin(), vals.end());
    vals.erase(std::unique(vals.begin(), vals.end()), vals.end());
    int m = (int)vals.size();
    std::vector<int> tree(m + 1, 0);
    long long cnt = 0;
    for (int i = 0; i < (int)a.size(); i++) {
        int r = int(std::lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin()) + 1;
        int notGreater = 0;                       // how many earlier values are <= a[i]
        for (int x = r; x > 0; x -= x & -x) notGreater += tree[x];
        cnt += i - notGreater;                    // all the other earlier values are bigger than a[i]
        for (int x = r; x <= m; x += x & -x) tree[x]++;
    }
    return cnt;
}

int main() {
    std::vector<int> judgeB = {3, 1, 4, 7, 2, 8, 5, 6};
    std::cout << countInversions(judgeB) << ' ' << countInversionsBIT(judgeB) << '\\n';   // 8 8
    std::vector<int> desc(100000);
    for (int i = 0; i < 100000; i++) desc[i] = 100000 - i;
    std::cout << countInversions(desc) << '\\n';   // 4999950000 (fully reversed is n(n−1)/2, past the range of int)
}`;

export const skeleton: LessonSkeleton = {
  demo: <InversionsDemo />,
  code: { python, cpp },
};
