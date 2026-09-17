import { QuickSortDemo } from "@/components/lesson/demos/QuickSortDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `import random


def partition(a, lo, hi):
    """Lomuto partition: a[hi] is the pivot. Returns where the pivot ends up."""
    pivot = a[hi]
    i = lo - 1                              # everything in a[lo..i] is <= pivot
    for j in range(lo, hi):
        if a[j] <= pivot:
            i += 1
            a[i], a[j] = a[j], a[i]
    a[i + 1], a[hi] = a[hi], a[i + 1]       # pivot moves between the two parts and never moves again
    return i + 1


def quick_sort(a, lo=0, hi=None):
    """Random pivot + recurse into the shorter side: O(n log n) average, O(log n) stack depth"""
    if hi is None:
        hi = len(a) - 1
    while lo < hi:
        r = random.randint(lo, hi)          # pick a random pivot, swap it to the end, then partition
        a[r], a[hi] = a[hi], a[r]
        p = partition(a, lo, hi)
        if p - lo < hi - p:                 # left side is shorter: recurse left, let the loop take the right
            quick_sort(a, lo, p - 1)
            lo = p + 1
        else:
            quick_sort(a, p + 1, hi)
            hi = p - 1
    return a


def partition3(a, lo, hi):
    """Three-way partition: a[lo..lt-1] < pivot, a[lt..gt] == pivot, a[gt+1..hi] > pivot"""
    pivot = a[random.randint(lo, hi)]
    lt, i, gt = lo, lo, hi
    while i <= gt:
        if a[i] < pivot:
            a[lt], a[i] = a[i], a[lt]
            lt += 1
            i += 1
        elif a[i] > pivot:
            a[i], a[gt] = a[gt], a[i]
            gt -= 1                         # the swapped-in element is unseen, so i stays put
        else:
            i += 1
    return lt, gt


def quick_sort_3way(a, lo=0, hi=None):
    """No degradation on heavy duplicates: the whole == pivot block is placed at once"""
    if hi is None:
        hi = len(a) - 1
    if lo >= hi:
        return a
    lt, gt = partition3(a, lo, hi)
    quick_sort_3way(a, lo, lt - 1)
    quick_sort_3way(a, gt + 1, hi)
    return a


def quick_select(a, k):
    """The k-th smallest value (k is 0-based), O(n) average; reorders a"""
    lo, hi = 0, len(a) - 1
    while True:
        lt, gt = partition3(a, lo, hi)
        if k < lt:
            hi = lt - 1                     # the answer is on the left, throw the whole right away
        elif k > gt:
            lo = gt + 1
        else:
            return a[k]                     # k lands inside the "== pivot" block


if __name__ == "__main__":
    b = [5, 2, 9, 1, 7, 3, 8, 4]
    print(partition(b, 0, len(b) - 1), b)   # 3 [2, 1, 3, 4, 7, 9, 8, 5] (the demo's first partition)
    print(quick_sort([5, 2, 9, 1, 7, 3, 8, 4]))           # [1, 2, 3, 4, 5, 7, 8, 9]
    print(quick_sort_3way([3, 1, 3, 3, 2, 1, 3, 2]))      # [1, 1, 2, 2, 3, 3, 3, 3]
    nums = [5, 2, 9, 1, 7, 3, 8, 4]
    print(quick_select(nums[:], 3))                       # 4 (4th smallest)
    print(quick_select(nums[:], len(nums) - 2))           # 8 (2nd largest)`;

const cpp = `#include <vector>
#include <random>
#include <utility>
#include <iostream>

std::mt19937 rng(std::random_device{}());
int randomIndex(int lo, int hi) { return std::uniform_int_distribution<int>(lo, hi)(rng); }

// Lomuto partition: a[hi] is the pivot. Returns where the pivot ends up.
int partition(std::vector<int>& a, int lo, int hi) {
    int pivot = a[hi], i = lo - 1;          // everything in a[lo..i] is <= pivot
    for (int j = lo; j < hi; j++)
        if (a[j] <= pivot) std::swap(a[++i], a[j]);
    std::swap(a[i + 1], a[hi]);             // pivot moves between the two parts
    return i + 1;
}

// Random pivot + recurse into the shorter side: O(log n) stack depth
void quickSort(std::vector<int>& a, int lo, int hi) {
    while (lo < hi) {
        std::swap(a[randomIndex(lo, hi)], a[hi]);
        int p = partition(a, lo, hi);
        if (p - lo < hi - p) { quickSort(a, lo, p - 1); lo = p + 1; }
        else                 { quickSort(a, p + 1, hi); hi = p - 1; }
    }
}

// Three-way partition: a[lo..lt-1] < pivot, a[lt..gt] == pivot, a[gt+1..hi] > pivot
std::pair<int, int> partition3(std::vector<int>& a, int lo, int hi) {
    int pivot = a[randomIndex(lo, hi)];
    int lt = lo, i = lo, gt = hi;
    while (i <= gt) {
        if (a[i] < pivot) std::swap(a[lt++], a[i++]);
        else if (a[i] > pivot) std::swap(a[i], a[gt--]);   // swapped-in element unseen, i stays put
        else i++;
    }
    return {lt, gt};
}

void quickSort3(std::vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    auto [lt, gt] = partition3(a, lo, hi);
    quickSort3(a, lo, lt - 1);              // the == pivot block needs no further sorting
    quickSort3(a, gt + 1, hi);
}

// Quick Select: the k-th smallest (k is 0-based), O(n) average
int quickSelect(std::vector<int> a, int k) {
    int lo = 0, hi = (int)a.size() - 1;
    while (true) {
        auto [lt, gt] = partition3(a, lo, hi);
        if (k < lt) hi = lt - 1;            // the answer is on the left
        else if (k > gt) lo = gt + 1;       // the answer is on the right
        else return a[k];
    }
}

int main() {
    std::vector<int> a = {5, 2, 9, 1, 7, 3, 8, 4};
    quickSort(a, 0, (int)a.size() - 1);
    for (int x : a) std::cout << x << ' ';  // 1 2 3 4 5 7 8 9
    std::cout << '\\n';

    std::vector<int> b = {3, 1, 3, 3, 2, 1, 3, 2};
    quickSort3(b, 0, (int)b.size() - 1);
    for (int x : b) std::cout << x << ' ';  // 1 1 2 2 3 3 3 3
    std::cout << '\\n';

    std::cout << quickSelect({5, 2, 9, 1, 7, 3, 8, 4}, 3) << '\\n';   // 4 (4th smallest)
    // Standard library: std::nth_element is exactly Quick Select
}`;

export const skeleton: LessonSkeleton = {
  demo: <QuickSortDemo />,
  code: { python, cpp },
};
