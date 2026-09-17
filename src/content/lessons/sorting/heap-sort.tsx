import { HeapSortDemo } from "@/components/lesson/demos/HeapSortDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `import heapq
from itertools import islice


def sift_down(a, i, size):
    """Sink a[i] until it is no smaller than both children. Only the first size slots count."""
    while True:
        l, r, largest = 2 * i + 1, 2 * i + 2, i
        if l < size and a[l] > a[largest]:     # compare against size, not len(a)
            largest = l
        if r < size and a[r] > a[largest]:
            largest = r
        if largest == i:                       # the max-heap property holds
            return
        a[i], a[largest] = a[largest], a[i]
        i = largest


# Heap sort: in place, O(1) extra space, O(n log n) worst case, not stable
def heap_sort(a):
    n = len(a)
    # Phase 1: heapify. Everything from index n // 2 on is a leaf, so start at the last internal node
    for i in range(n // 2 - 1, -1, -1):
        sift_down(a, i, n)
    # Phase 2: the root is the maximum. Swap it to the end, shrink the heap, then repair the root
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        sift_down(a, 0, end)                   # only the first end slots; the tail is already sorted
    return a


# Variation: emit as you go (not in place). O(n) to build, then O(log n) per item
# Taking only the first k costs O(n + k log n); taking them all is one full heap sort
def iter_largest(nums):
    h = [-x for x in nums]                     # heapq is a min-heap, so negate to get a max-heap
    heapq.heapify(h)
    while h:
        yield -heapq.heappop(h)


if __name__ == "__main__":
    print(heap_sort([5, 2, 9, 1, 7, 3, 8, 4]))     # [1, 2, 3, 4, 5, 7, 8, 9]
    scores = [62, 95, 71, 88, 95, 40, 79]
    print(list(islice(iter_largest(scores), 3)))   # [95, 95, 88] (page one needs only the top 3)`;

const cpp = `#include <algorithm>
#include <functional>
#include <iostream>
#include <utility>
#include <vector>

// Sink a[i] until it is no smaller than both children. Only the first size slots count
void siftDown(std::vector<int>& a, int i, int size) {
    while (true) {
        int l = 2 * i + 1, r = 2 * i + 2, largest = i;
        if (l < size && a[l] > a[largest]) largest = l;
        if (r < size && a[r] > a[largest]) largest = r;
        if (largest == i) return;               // the max-heap property holds
        std::swap(a[i], a[largest]);
        i = largest;
    }
}

// Heap sort: in place, O(1) extra space, O(n log n) worst case
void heapSort(std::vector<int>& a) {
    int n = (int)a.size();
    for (int i = n / 2 - 1; i >= 0; i--)        // phase 1: heapify, O(n)
        siftDown(a, i, n);
    for (int end = n - 1; end > 0; end--) {     // phase 2: extract n - 1 times
        std::swap(a[0], a[end]);                // the maximum lands at the end and stays there
        siftDown(a, 0, end);                    // the heap shrinks to the first end slots
    }
}

// The same algorithm via the STL: make_heap builds it, pop_heap moves the maximum to the last slot of [begin, end)
// The default std::less gives a max-heap and so ascending order; pass std::greater for descending
template <class Cmp = std::less<int>>
void heapSortStl(std::vector<int>& a, Cmp cmp = Cmp()) {
    std::make_heap(a.begin(), a.end(), cmp);
    for (auto end = a.end(); end != a.begin(); --end)
        std::pop_heap(a.begin(), end, cmp);     // the range shrinks by one each time
}

int main() {
    std::vector<int> a = {5, 2, 9, 1, 7, 3, 8, 4};
    heapSort(a);
    for (int x : a) std::cout << x << ' ';      // 1 2 3 4 5 7 8 9
    std::cout << '\\n';

    std::vector<int> scores = {62, 95, 71, 88, 95, 40, 79};
    heapSortStl(scores, std::greater<int>());
    for (int x : scores) std::cout << x << ' '; // 95 95 88 79 71 62 40
    std::cout << '\\n';
}`;

export const skeleton: LessonSkeleton = {
  demo: <HeapSortDemo />,
  code: { python, cpp },
};
