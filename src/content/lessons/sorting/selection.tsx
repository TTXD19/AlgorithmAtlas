import { SelectionSortDemo } from "@/components/lesson/demos/SelectionSortDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Selection sort: each pass finds the smallest value in the unsorted region and swaps it into that region's first slot.
# Returns the swap count, so it is easy to compare against the other sorts.
def selection_sort(a, key=lambda x: x):
    n = len(a)
    swaps = 0
    for i in range(n - 1):                  # the last slot never needs a pass
        m = i                               # only track the index of the minimum, do not swap yet
        for j in range(i + 1, n):
            if key(a[j]) < key(a[m]):
                m = j
        if m != i:
            a[i], a[m] = a[m], a[i]         # at most one swap per pass, and a[i] is final from here on
            swaps += 1
    return swaps


# Variant 1: run only the first k passes and a[:k] holds the k smallest, already sorted. O(kn)
def smallest_k(a, k):
    n = len(a)
    for i in range(min(k, n)):
        m = min(range(i, n), key=a.__getitem__)   # index of the first minimum in the unsorted region
        a[i], a[m] = a[m], a[i]
    return a[:k]


# Variant 2: the stable version. Instead of swapping, shift a[i..m-1] right by one and drop the minimum into a[i].
# Equal elements keep their relative order, but writes become O(n²), which costs selection sort its best feature.
def stable_selection_sort(a, key=lambda x: x):
    n = len(a)
    for i in range(n - 1):
        m = i
        for j in range(i + 1, n):
            if key(a[j]) < key(a[m]):       # strictly less: on a tie, keep the earlier element
                m = j
        x = a[m]
        while m > i:                        # shift right, never stepping over an equal element
            a[m] = a[m - 1]
            m -= 1
        a[i] = x
    return a


if __name__ == "__main__":
    a = [5, 2, 9, 1, 7, 3, 8, 4]
    swaps = selection_sort(a)
    print(a, swaps)                         # [1, 2, 3, 4, 5, 7, 8, 9] 5
    print(smallest_k([5, 2, 9, 1, 7, 3, 8, 4], 3))   # [1, 2, 3]

    # Sort by score; A originally sits before B at the same score
    recs = [(3, "A"), (3, "B"), (1, "C")]
    selection_sort(recs, key=lambda r: r[0])
    print(recs)          # [(1, 'C'), (3, 'B'), (3, 'A')]  A and B came out reordered
    recs = [(3, "A"), (3, "B"), (1, "C")]
    stable_selection_sort(recs, key=lambda r: r[0])
    print(recs)          # [(1, 'C'), (3, 'A'), (3, 'B')]`;

const cpp = `#include <vector>
#include <utility>
#include <algorithm>
#include <functional>
#include <iostream>

// Selection sort: each pass finds the minimum of the unsorted region and swaps it into the first slot. Returns the swap count.
template <typename T, typename Less = std::less<T>>
int selectionSort(std::vector<T>& a, Less less = Less()) {
    int n = (int)a.size(), swaps = 0;
    for (int i = 0; i < n - 1; i++) {           // the last slot never needs a pass
        int m = i;                              // only track the index, do not swap yet
        for (int j = i + 1; j < n; j++)
            if (less(a[j], a[m])) m = j;
        if (m != i) {
            std::swap(a[i], a[m]);              // at most one swap per pass
            swaps++;
        }
    }
    return swaps;
}

// Variant 1: run only the first k passes, and the first k slots hold the k smallest. O(kn)
void partialSelection(std::vector<int>& a, int k) {
    int n = (int)a.size();
    for (int i = 0; i < std::min(k, n); i++) {
        auto it = std::min_element(a.begin() + i, a.end());   // the first minimum
        std::swap(a[i], *it);
    }
}

// Variant 2: the stable version. Move the minimum forward instead of swapping, which makes writes O(n²).
template <typename T, typename Less = std::less<T>>
void stableSelectionSort(std::vector<T>& a, Less less = Less()) {
    int n = (int)a.size();
    for (int i = 0; i < n - 1; i++) {
        int m = i;
        for (int j = i + 1; j < n; j++)
            if (less(a[j], a[m])) m = j;        // strictly less: on a tie, keep the earlier element
        T x = a[m];
        for (; m > i; m--) a[m] = a[m - 1];     // shift right by one, never over an equal element
        a[i] = x;
    }
}

int main() {
    std::vector<int> a = {5, 2, 9, 1, 7, 3, 8, 4};
    int swaps = selectionSort(a);
    for (int x : a) std::cout << x << ' ';
    std::cout << "| swaps = " << swaps << '\\n';          // 1 2 3 4 5 7 8 9 | swaps = 5

    std::vector<int> b = {5, 2, 9, 1, 7, 3, 8, 4};
    partialSelection(b, 3);
    std::cout << b[0] << ' ' << b[1] << ' ' << b[2] << '\\n';   // 1 2 3

    using Rec = std::pair<int, char>;                    // (score, name)
    auto byScore = [](const Rec& x, const Rec& y) { return x.first < y.first; };
    std::vector<Rec> r1 = {{3, 'A'}, {3, 'B'}, {1, 'C'}}, r2 = r1;
    selectionSort(r1, byScore);
    stableSelectionSort(r2, byScore);
    for (auto& [score, name] : r1) std::cout << name << score << ' ';
    std::cout << '\\n';                                   // C1 B3 A3 (A and B came out reordered)
    for (auto& [score, name] : r2) std::cout << name << score << ' ';
    std::cout << '\\n';                                   // C1 A3 B3
}`;

export const skeleton: LessonSkeleton = {
  demo: <SelectionSortDemo />,
  code: { python, cpp },
};
