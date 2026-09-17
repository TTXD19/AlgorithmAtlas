import { MergeSortDemo } from "@/components/lesson/demos/MergeSortDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Merge the sorted runs src[lo:mid] and src[mid:hi] into dst[lo:hi]
def merge(src, dst, lo, mid, hi, key):
    i, j = lo, mid
    for k in range(lo, hi):
        # Take from the left if it still has elements and either the right is done or left <= right; taking the left on ties is what keeps it stable
        if i < mid and (j == hi or key(src[i]) <= key(src[j])):
            dst[k] = src[i]
            i += 1
        else:
            dst[k] = src[j]
            j += 1


# Top-down: split in half, sort each half recursively, merge. Half-open range [lo, hi)
def merge_sort(a, key=lambda x: x):
    buf = a[:]                              # the scratch array is allocated once and shared by every merge

    def sort(lo, hi):
        if hi - lo <= 1:                    # 0 or 1 element is already sorted
            return
        mid = (lo + hi) // 2
        sort(lo, mid)
        sort(mid, hi)
        if key(a[mid - 1]) <= key(a[mid]):  # the two runs already line up, so skip the merge
            return
        merge(a, buf, lo, mid, hi, key)
        for k in range(lo, hi):             # write the merged result back into the array
            a[k] = buf[k]

    sort(0, len(a))
    return a


# Bottom-up: no recursion. Runs of width 1, 2, 4, 8... merged in pairs, one pass at a time
def merge_sort_bottom_up(a, key=lambda x: x):
    n = len(a)
    src, dst = a, [None] * n                # only one extra array is allocated
    width = 1
    while width < n:
        for lo in range(0, n, 2 * width):
            merge(src, dst, lo, min(lo + width, n), min(lo + 2 * width, n), key)
        src, dst = dst, src                 # this pass's output is the next pass's input
        width *= 2
    if src is not a:                        # the result ended up in the scratch array, so copy it back
        a[:] = src
    return a


if __name__ == "__main__":
    print(merge_sort([5, 2, 9, 1, 7, 3, 8, 4]))            # [1, 2, 3, 4, 5, 7, 8, 9]
    print(merge_sort_bottom_up([5, 2, 9, 1, 7, 3, 8, 4]))  # [1, 2, 3, 4, 5, 7, 8, 9]
    # Stability: the orders are already in time order, and after sorting by status each status keeps that order
    orders = [("A01", "shipped"), ("A02", "pending"), ("A03", "shipped"), ("A04", "pending")]
    print(merge_sort(orders, key=lambda o: o[1]))
    # [('A02', 'pending'), ('A04', 'pending'), ('A01', 'shipped'), ('A03', 'shipped')]`;

const cpp = `#include <vector>
#include <string>
#include <utility>
#include <iostream>
#include <algorithm>

// Merge the sorted runs src[lo, mid) and src[mid, hi) into dst[lo, hi)
void mergeInto(const std::vector<int>& src, std::vector<int>& dst, int lo, int mid, int hi) {
    int i = lo, j = mid;
    for (int k = lo; k < hi; k++) {
        if (i < mid && (j == hi || src[i] <= src[j])) dst[k] = src[i++];  // <= takes the left on ties, keeping it stable
        else dst[k] = src[j++];
    }
}

// Top-down: sort the half-open range [lo, hi)
void sortRange(std::vector<int>& a, std::vector<int>& buf, int lo, int hi) {
    if (hi - lo <= 1) return;                       // 0 or 1 element is already sorted
    int mid = lo + (hi - lo) / 2;
    sortRange(a, buf, lo, mid);
    sortRange(a, buf, mid, hi);
    if (a[mid - 1] <= a[mid]) return;               // the two runs already line up, so skip the merge
    mergeInto(a, buf, lo, mid, hi);
    std::copy(buf.begin() + lo, buf.begin() + hi, a.begin() + lo);
}

void mergeSort(std::vector<int>& a) {
    std::vector<int> buf(a.size());                 // the scratch array is allocated once
    sortRange(a, buf, 0, (int)a.size());
}

// Bottom-up: runs of width 1, 2, 4... merged in pairs, src and dst swapping roles each pass
void mergeSortBottomUp(std::vector<int>& a) {
    int n = (int)a.size();
    std::vector<int> buf(n);
    std::vector<int>* src = &a;
    std::vector<int>* dst = &buf;
    for (int width = 1; width < n; width *= 2) {
        for (int lo = 0; lo < n; lo += 2 * width)
            mergeInto(*src, *dst, lo, std::min(lo + width, n), std::min(lo + 2 * width, n));
        std::swap(src, dst);
    }
    if (src != &a) a = *src;                        // the result ended up in buf, so copy it back
}

int main() {
    std::vector<int> a = {5, 2, 9, 1, 7, 3, 8, 4};
    std::vector<int> b = a;
    mergeSort(a);
    mergeSortBottomUp(b);
    for (int x : a) std::cout << x << ' ';          // 1 2 3 4 5 7 8 9
    std::cout << '\\n';
    for (int x : b) std::cout << x << ' ';          // 1 2 3 4 5 7 8 9
    std::cout << '\\n';

    // std::stable_sort from the standard library is guaranteed stable: each status keeps its original time order
    std::vector<std::pair<std::string, std::string>> orders = {
        {"A01", "shipped"}, {"A02", "pending"}, {"A03", "shipped"}, {"A04", "pending"}};
    std::stable_sort(orders.begin(), orders.end(),
                     [](const auto& x, const auto& y) { return x.second < y.second; });
    for (const auto& [id, status] : orders) std::cout << id << ' ';  // A02 A04 A01 A03
    std::cout << '\\n';
}`;

export const skeleton: LessonSkeleton = {
  demo: <MergeSortDemo />,
  code: { python, cpp },
};
