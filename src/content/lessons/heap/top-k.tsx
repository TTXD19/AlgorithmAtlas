import { TopKDemo } from "@/components/lesson/demos/TopKDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `import heapq
from collections import Counter


def top_k_largest(nums, k):
    """Top K largest: keep a min-heap of size K. O(n log k)"""
    heap = []
    for x in nums:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:                # only beating the threshold earns a place
            heapq.heapreplace(heap, x)   # pop the smallest, then push: one O(log k) step
    return sorted(heap, reverse=True)


def kth_largest(nums, k):
    """Kth largest: the same heap, and at the end the top of it is the answer"""
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]


def top_k_frequent(words, k):
    """Top K by frequency: count first, then run Top-K over (count, word)"""
    count = Counter(words)
    # nlargest is a size-k heap under the hood
    return heapq.nlargest(k, count, key=count.get)


def top_k_frequent_bucket(nums, k):
    """Counts never exceed n, so bucket sort brings this down to O(n)"""
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for x, c in count.items():
        buckets[c].append(x)
    out = []
    for c in range(len(buckets) - 1, 0, -1):
        out.extend(buckets[c])
        if len(out) >= k:
            return out[:k]
    return out`;

const cpp = `#include <vector>
#include <queue>
#include <functional>
#include <unordered_map>
#include <algorithm>

// Top K largest: a min-heap of size K. O(n log k)
std::vector<int> topKLargest(const std::vector<int>& nums, int k) {
    std::priority_queue<int, std::vector<int>, std::greater<int>> heap;
    for (int x : nums) {
        if ((int)heap.size() < k) heap.push(x);
        else if (x > heap.top()) { heap.pop(); heap.push(x); }
    }
    std::vector<int> out;
    while (!heap.empty()) { out.push_back(heap.top()); heap.pop(); }
    std::reverse(out.begin(), out.end());
    return out;
}

// Kth largest: for a single value, nth_element also works (quickselect, O(n) on average)
int kthLargest(std::vector<int> nums, int k) {
    std::nth_element(nums.begin(), nums.begin() + (k - 1), nums.end(), std::greater<int>());
    return nums[k - 1];
}

// Top K by frequency
std::vector<int> topKFrequent(const std::vector<int>& nums, int k) {
    std::unordered_map<int, int> count;
    for (int x : nums) count[x]++;
    using P = std::pair<int, int>;                    // (count, value)
    std::priority_queue<P, std::vector<P>, std::greater<P>> heap;
    for (auto& [val, c] : count) {
        heap.push({c, val});
        if ((int)heap.size() > k) heap.pop();
    }
    std::vector<int> out;
    while (!heap.empty()) { out.push_back(heap.top().second); heap.pop(); }
    return out;
}`;

export const skeleton: LessonSkeleton = {
  demo: <TopKDemo />,
  code: { python, cpp },
};
