import { LisDemo } from "@/components/lesson/demos/LisDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `from bisect import bisect_left


def lis_dp(nums):
    """O(n²): dp[i] = length of the LIS ending at nums[i]; also reconstructs one LIS"""
    n = len(nums)
    if n == 0:
        return []
    dp = [1] * n
    prev = [-1] * n                          # prev[i]: which index nums[i] is appended after
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
                prev[i] = j
    k = max(range(n), key=dp.__getitem__)    # the answer is the maximum of dp, not necessarily dp[-1]
    seq = []
    while k != -1:
        seq.append(nums[k])
        k = prev[k]
    return seq[::-1]


def lis_length(nums):
    """O(n log n): tails[k] = the smallest tail among increasing subsequences of length k+1"""
    tails = []
    for x in nums:
        pos = bisect_left(tails, x)          # first entry >= x; use bisect_right for non-decreasing
        if pos == len(tails):
            tails.append(x)                  # larger than every tail: the LIS gets longer
        else:
            tails[pos] = x                   # same length, smaller tail
    return len(tails)


def lis_sequence(nums):
    """O(n log n) with reconstruction: tails holds indices, plus a predecessor per element"""
    tails = []                               # tails[k]: index in nums of the smallest tail of length k+1
    parent = [-1] * len(nums)
    for i, x in enumerate(nums):
        pos = bisect_left(tails, x, key=lambda t: nums[t])  # the key parameter needs Python 3.10+
        if pos > 0:
            parent[i] = tails[pos - 1]       # appended after the smallest tail of length pos
        if pos == len(tails):
            tails.append(i)
        else:
            tails[pos] = i
    seq, k = [], tails[-1] if tails else -1
    while k != -1:
        seq.append(nums[k])
        k = parent[k]
    return seq[::-1]


def max_envelopes(envelopes):
    """Russian doll envelopes: widths ascending, heights descending on ties, then LIS on the heights"""
    order = sorted(envelopes, key=lambda e: (e[0], -e[1]))
    return lis_length([h for _, h in order])


if __name__ == "__main__":
    prices = [3, 1, 4, 1, 5, 9, 2, 6]
    print(lis_dp(prices))          # [3, 4, 5, 9]
    print(lis_length(prices))      # 4
    print(lis_sequence(prices))    # [1, 4, 5, 6] (a different LIS of the same length)
    print(max_envelopes([[5, 4], [6, 4], [6, 7], [2, 3]]))  # 3
    shelf = [4, 2, 5, 1, 3, 6]     # the call numbers on the shelf
    print(len(shelf) - lis_length(shelf))  # 3 (at least 3 books have to move)`;

const cpp = `#include <algorithm>
#include <iostream>
#include <vector>

// O(n²): dp[i] = length of the LIS ending at nums[i]
int lisDp(const std::vector<int>& nums) {
    int n = (int)nums.size(), best = 0;
    std::vector<int> dp(n, 1);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i]) dp[i] = std::max(dp[i], dp[j] + 1);
        best = std::max(best, dp[i]);          // the answer is the maximum, not necessarily dp[n-1]
    }
    return best;
}

// O(n log n): tails[k] = the smallest tail among increasing subsequences of length k+1
int lengthOfLIS(const std::vector<int>& nums) {
    std::vector<int> tails;
    for (int x : nums) {
        auto it = std::lower_bound(tails.begin(), tails.end(), x);  // upper_bound for non-decreasing
        if (it == tails.end()) tails.push_back(x);  // larger than every tail: the LIS gets longer
        else *it = x;                               // same length, smaller tail
    }
    return (int)tails.size();
}

// O(n log n) with reconstruction: tails holds indices, parent holds predecessors
std::vector<int> lisSequence(const std::vector<int>& nums) {
    int n = (int)nums.size();
    std::vector<int> tails, parent(n, -1);
    for (int i = 0; i < n; i++) {
        auto it = std::lower_bound(tails.begin(), tails.end(), nums[i],
                                   [&](int t, int x) { return nums[t] < x; });
        int pos = (int)(it - tails.begin());
        if (pos > 0) parent[i] = tails[pos - 1];
        if (it == tails.end()) tails.push_back(i);
        else *it = i;
    }
    std::vector<int> seq;
    for (int k = tails.empty() ? -1 : tails.back(); k != -1; k = parent[k]) seq.push_back(nums[k]);
    std::reverse(seq.begin(), seq.end());
    return seq;
}

// Russian doll envelopes: widths ascending, heights descending on ties, then LIS on the heights
int maxEnvelopes(std::vector<std::vector<int>> env) {
    std::sort(env.begin(), env.end(), [](const auto& a, const auto& b) {
        return a[0] != b[0] ? a[0] < b[0] : a[1] > b[1];
    });
    std::vector<int> h;
    for (const auto& e : env) h.push_back(e[1]);
    return lengthOfLIS(h);
}

int main() {
    std::vector<int> prices = {3, 1, 4, 1, 5, 9, 2, 6};
    std::cout << lisDp(prices) << "\\n";        // 4
    std::cout << lengthOfLIS(prices) << "\\n";  // 4
    for (int v : lisSequence(prices)) std::cout << v << ' ';  // 1 4 5 6
    std::cout << "\\n" << maxEnvelopes({{5, 4}, {6, 4}, {6, 7}, {2, 3}}) << "\\n";  // 3
}`;

export const skeleton: LessonSkeleton = {
  demo: <LisDemo />,
  code: { python, cpp },
};
