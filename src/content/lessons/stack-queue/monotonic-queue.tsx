import { MonotonicQueueDemo } from "@/components/lesson/demos/MonotonicQueueDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `from collections import deque

# Sliding window maximum (LeetCode 239).
# The deque holds indices whose values decrease from front to back, so the front is always the window maximum.
def max_sliding_window(nums, k):
    dq = deque()
    out = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:     # anything at the back smaller than x can never be the maximum again
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:                  # the front has left the window
            dq.popleft()
        if i >= k - 1:                      # only emit once the window is full
            out.append(nums[dq[0]])
    return out


# The same skeleton for minimums: swap <= for >=
def min_sliding_window(nums, k):
    dq = deque()
    out = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] >= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out


# Shortest subarray with sum at least k (LeetCode 862): prefix sums plus a monotonic queue
def shortest_subarray(nums, k):
    p = [0]
    for x in nums:
        p.append(p[-1] + x)
    dq = deque()                            # indices whose prefix sums increase
    best = float("inf")
    for j, pj in enumerate(p):
        while dq and pj - p[dq[0]] >= k:    # the front works as a left end, so settle it: it will never be better
            best = min(best, j - dq.popleft())
        while dq and p[dq[-1]] >= pj:       # anything at the back bigger than me always loses to me as a left end
            dq.pop()
        dq.append(j)
    return best if best != float("inf") else -1`;

const cpp = `#include <vector>
#include <deque>
#include <algorithm>

// Sliding window maximum
std::vector<int> maxSlidingWindow(const std::vector<int>& nums, int k) {
    std::deque<int> dq;                    // indices, with decreasing values
    std::vector<int> out;
    for (int i = 0; i < (int)nums.size(); i++) {
        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
        dq.push_back(i);
        if (dq.front() <= i - k) dq.pop_front();
        if (i >= k - 1) out.push_back(nums[dq.front()]);
    }
    return out;
}

// Shortest subarray with sum at least k: prefix sums plus a monotonic queue
int shortestSubarray(const std::vector<int>& nums, int k) {
    int n = nums.size();
    std::vector<long long> p(n + 1, 0);
    for (int i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
    std::deque<int> dq;
    int best = n + 1;
    for (int j = 0; j <= n; j++) {
        while (!dq.empty() && p[j] - p[dq.front()] >= k) {
            best = std::min(best, j - dq.front());
            dq.pop_front();
        }
        while (!dq.empty() && p[dq.back()] >= p[j]) dq.pop_back();
        dq.push_back(j);
    }
    return best == n + 1 ? -1 : best;
}`;

export const skeleton: LessonSkeleton = {
  demo: <MonotonicQueueDemo />,
  code: { python, cpp },
};
