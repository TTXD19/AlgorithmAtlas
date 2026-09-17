import { BinaryHeapDemo } from "@/components/lesson/demos/BinaryHeapDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `class MinHeap:
    """A min-heap stored in an array. The parent of index i is (i-1)//2, its children 2i+1 and 2i+2."""

    def __init__(self):
        self.a = []

    def push(self, x):
        self.a.append(x)                 # append first, keeping the complete-tree shape
        self._sift_up(len(self.a) - 1)   # then float it up to where it belongs

    def pop(self):
        top = self.a[0]                  # the minimum is always at the root
        last = self.a.pop()
        if self.a:
            self.a[0] = last             # move the last element to the root, then sink it
            self._sift_down(0)
        return top

    def peek(self):
        return self.a[0]

    def _sift_up(self, i):
        while i > 0:
            p = (i - 1) // 2
            if self.a[i] < self.a[p]:
                self.a[i], self.a[p] = self.a[p], self.a[i]
                i = p
            else:
                break

    def _sift_down(self, i):
        n = len(self.a)
        while True:
            l, r, smallest = 2 * i + 1, 2 * i + 2, i
            if l < n and self.a[l] < self.a[smallest]:
                smallest = l
            if r < n and self.a[r] < self.a[smallest]:
                smallest = r
            if smallest == i:
                break
            self.a[i], self.a[smallest] = self.a[smallest], self.a[i]
            i = smallest


# In practice, reach for the standard library: heapq is a min-heap
import heapq

h = []
heapq.heappush(h, 7)
heapq.heappush(h, 3)
heapq.heappush(h, 9)
print(heapq.heappop(h))      # 3

# For a max-heap, negate the values
big = []
heapq.heappush(big, -7)
heapq.heappush(big, -9)
print(-heapq.heappop(big))   # 9

# Building from an existing list is O(n), faster than pushing one at a time at O(n log n)
nums = [7, 3, 9, 1, 4, 8]
heapq.heapify(nums)
print(nums[0])               # 1`;

const cpp = `#include <vector>
#include <queue>
#include <functional>

// A hand-written min-heap
class MinHeap {
    std::vector<int> a;
    void siftUp(int i) {
        while (i > 0) {
            int p = (i - 1) / 2;
            if (a[i] < a[p]) { std::swap(a[i], a[p]); i = p; }
            else break;
        }
    }
    void siftDown(int i) {
        int n = a.size();
        while (true) {
            int l = 2 * i + 1, r = 2 * i + 2, smallest = i;
            if (l < n && a[l] < a[smallest]) smallest = l;
            if (r < n && a[r] < a[smallest]) smallest = r;
            if (smallest == i) break;
            std::swap(a[i], a[smallest]);
            i = smallest;
        }
    }
public:
    void push(int x) { a.push_back(x); siftUp(a.size() - 1); }
    int pop() {
        int top = a[0];
        a[0] = a.back(); a.pop_back();
        if (!a.empty()) siftDown(0);
        return top;
    }
    int peek() const { return a[0]; }
    bool empty() const { return a.empty(); }
};

// In practice use std::priority_queue. It is a max-heap by default
std::priority_queue<int> maxHeap;
// A min-heap takes two extra template arguments
std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;

// Building from existing data: O(n)
std::vector<int> nums = {7, 3, 9, 1, 4, 8};
std::priority_queue<int, std::vector<int>, std::greater<int>> h(nums.begin(), nums.end());
// h.top() == 1`;

export const skeleton: LessonSkeleton = {
  demo: <BinaryHeapDemo />,
  code: { python, cpp },
};
