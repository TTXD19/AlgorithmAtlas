import { SlidingWindowDemo } from "@/components/lesson/demos/SlidingWindowDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Variable window: longest substring without repeating characters (LeetCode 3)
# r takes in one more character each step; while the window is invalid (a repeat), l shrinks right until it is valid
def length_of_longest_substring(s):
    seen = set()                           # characters in the window
    l = 0
    best = 0
    for r, c in enumerate(s):
        while c in seen:                   # the window is invalid
            seen.remove(s[l])
            l += 1
        seen.add(c)
        best = max(best, r - l + 1)
    return best


# Fixed window: maximum average over a subarray of length k (LeetCode 643), assuming 1 <= k <= len(nums)
# Each slide: add the new element, drop the old one, never recompute the whole window
def max_average(nums, k):
    total = sum(nums[:k])
    best = total
    for r in range(k, len(nums)):
        total += nums[r] - nums[r - k]     # one in, one out
        best = max(best, total)
    return best / k


# Another shape of variable window: shortest subarray with sum >= target (LeetCode 209)
# The moment the condition holds, shrink as far as you can, updating the answer as you shrink
# Precondition: nums is all positive. With negatives, shrinking the left end need not lower the sum, so the window breaks down
def min_subarray_len(target, nums):
    l = 0
    total = 0
    best = float("inf")
    for r, x in enumerate(nums):
        total += x
        while total >= target:             # valid, try to shrink it further
            best = min(best, r - l + 1)
            total -= nums[l]
            l += 1
    return 0 if best == float("inf") else best


# Rate limiting: at most limit requests within the last window seconds
# The queue is the window; expired entries are dropped from the left
from collections import deque

class RateLimiter:
    def __init__(self, limit, window):
        self.limit, self.window = limit, window
        self.q = deque()                   # request timestamps, increasing

    def allow(self, now):
        while self.q and self.q[0] <= now - self.window:
            self.q.popleft()               # the left end of the window has expired
        if len(self.q) < self.limit:
            self.q.append(now)
            return True
        return False


if __name__ == "__main__":
    print(length_of_longest_substring("abcadbcxab"))   # 5
    print(max_average([1, 12, -5, -6, 50, 3], 4))      # 12.75
    print(min_subarray_len(7, [2, 3, 1, 2, 4, 3]))     # 2
    rl = RateLimiter(3, 10)
    print([rl.allow(t) for t in (1, 2, 3, 4, 12)])     # [True, True, True, False, True]`;

const cpp = `#include <string>
#include <vector>
#include <deque>
#include <iostream>
#include <algorithm>
#include <climits>

// Variable window: longest substring without repeating characters
int lengthOfLongestSubstring(const std::string& s) {
    std::vector<int> cnt(256, 0);          // how many of each byte are in the window
    int l = 0, best = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        unsigned char c = s[r];            // char may be negative; convert to 0..255 to index with it
        cnt[c]++;
        while (cnt[c] > 1) {               // the window is invalid, shrink
            cnt[(unsigned char)s[l]]--;
            l++;
        }
        best = std::max(best, r - l + 1);
    }
    return best;
}

// Fixed window: maximum average over length k (1 <= k <= n)
double maxAverage(const std::vector<int>& nums, int k) {
    long long total = 0;
    for (int i = 0; i < k; i++) total += nums[i];
    long long best = total;
    for (int r = k; r < (int)nums.size(); r++) {
        total += (long long)nums[r] - nums[r - k];  // one in, one out; cast first so the subtraction cannot overflow
        best = std::max(best, total);
    }
    return (double)best / k;
}

// Variable window: shortest subarray with sum >= target (nums is all positive)
int minSubarrayLen(int target, const std::vector<int>& nums) {
    int l = 0, best = INT_MAX;
    long long total = 0;
    for (int r = 0; r < (int)nums.size(); r++) {
        total += nums[r];
        while (total >= target) {          // valid, shrink as far as possible
            best = std::min(best, r - l + 1);
            total -= nums[l++];
        }
    }
    return best == INT_MAX ? 0 : best;
}

// Rate limiting: at most limit requests in the last window seconds
class RateLimiter {
    int limit, window;
    std::deque<int> q;                     // timestamps, increasing
public:
    RateLimiter(int limit, int window) : limit(limit), window(window) {}
    bool allow(int now) {
        while (!q.empty() && q.front() <= now - window) q.pop_front();
        if ((int)q.size() < limit) { q.push_back(now); return true; }
        return false;
    }
};

int main() {
    std::cout << lengthOfLongestSubstring("abcadbcxab") << "\\n";   // 5
    std::cout << maxAverage({1, 12, -5, -6, 50, 3}, 4) << "\\n";     // 12.75
    std::cout << minSubarrayLen(7, {2, 3, 1, 2, 4, 3}) << "\\n";     // 2
    RateLimiter rl(3, 10);
    for (int t : {1, 2, 3, 4, 12}) std::cout << rl.allow(t) << " "; // 1 1 1 0 1
    std::cout << "\\n";
}`;

export const skeleton: LessonSkeleton = {
  demo: <SlidingWindowDemo />,
  code: { python, cpp },
};
