import { KnapsackDemo } from "@/components/lesson/demos/KnapsackDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `def knapsack_table(weights, values, cap):
    """2-D table: dp[i][w] = best value from the first i items with capacity w. O(nW)"""
    n = len(weights)
    dp = [[0] * (cap + 1) for _ in range(n + 1)]   # row 0: no items yet, so all zeros
    for i in range(1, n + 1):
        wt, val = weights[i - 1], values[i - 1]
        for w in range(cap + 1):
            dp[i][w] = dp[i - 1][w]                  # skip item i
            if w >= wt:                              # only consider taking it if it fits
                dp[i][w] = max(dp[i][w], dp[i - 1][w - wt] + val)

    # Traceback: a cell that differs from the row above means item i was taken
    chosen, w = [], cap
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            chosen.append(i - 1)
            w -= weights[i - 1]
    return dp[n][cap], chosen[::-1]


def knapsack(weights, values, cap):
    """Rolled into one row. O(W) space"""
    dp = [0] * (cap + 1)
    for wt, val in zip(weights, values):
        for w in range(cap, wt - 1, -1):             # downward: dp[w - wt] is still the previous row
            dp[w] = max(dp[w], dp[w - wt] + val)     # upward would take the same item twice
    return dp[cap]


def min_split_diff(nums):
    """Two piles with the smallest gap: boolean knapsack, weight is the value, capacity is half the total"""
    total = sum(nums)
    half = total // 2
    can = [True] + [False] * half                    # can[s]: does some subset add up to exactly s?
    for x in nums:
        for s in range(half, x - 1, -1):             # downward again, so each number is used once
            can[s] = can[s] or can[s - x]
    best = max(s for s in range(half + 1) if can[s])
    return total - 2 * best                          # one pile is best, the other is total - best


if __name__ == "__main__":
    weights, values = [1, 3, 4, 5], [1, 4, 5, 7]     # A, B, C, D, same as the interactive demo
    print(knapsack_table(weights, values, 7))  # (9, [1, 2]): take B and C
    print(knapsack(weights, values, 7))        # 9
    print(min_split_diff([2, 7, 4, 1, 8, 1]))  # 1 (11 against 12)
    print(min_split_diff([1, 5, 11, 5]))       # 0 (splits evenly)`;

const cpp = `#include <algorithm>
#include <bitset>
#include <iostream>
#include <numeric>
#include <utility>
#include <vector>

// 2-D table plus traceback: returns (best value, indices of the chosen items). O(nW) time and space
std::pair<int, std::vector<int>> knapsackTable(const std::vector<int>& wt,
                                               const std::vector<int>& val, int cap) {
    int n = (int)wt.size();
    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(cap + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= cap; w++) {
            dp[i][w] = dp[i - 1][w];                                // skip item i
            if (w >= wt[i - 1])                                     // only consider taking it if it fits
                dp[i][w] = std::max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);
        }
    }
    std::vector<int> chosen;
    for (int i = n, w = cap; i >= 1; i--) {
        if (dp[i][w] != dp[i - 1][w]) {                             // differs from the row above: i was taken
            chosen.push_back(i - 1);
            w -= wt[i - 1];
        }
    }
    std::reverse(chosen.begin(), chosen.end());
    return {dp[n][cap], chosen};
}

// Rolled into one row: a single array, w scanned downward. O(W) space
int knapsack(const std::vector<int>& wt, const std::vector<int>& val, int cap) {
    std::vector<int> dp(cap + 1, 0);
    for (int i = 0; i < (int)wt.size(); i++)
        for (int w = cap; w >= wt[i]; w--)          // downward: dp[w - wt[i]] is still the previous round
            dp[w] = std::max(dp[w], dp[w - wt[i]] + val[i]);
    return dp[cap];
}

// Two piles with the smallest gap: boolean knapsack. Bit s is 1 when the sum s is reachable
int minSplitDiff(const std::vector<int>& nums) {
    const int MAX_SUM = 20000;                      // assumes the total stays under 20000
    std::bitset<MAX_SUM + 1> can;
    can[0] = 1;
    for (int x : nums) can |= can << x;             // shift by x: every reachable sum gains x (the shift reads the old bits, so x is used once)
    int total = std::accumulate(nums.begin(), nums.end(), 0);
    for (int s = total / 2; s >= 0; s--)
        if (can[s]) return total - 2 * s;
    return total;
}

int main() {
    std::vector<int> wt = {1, 3, 4, 5}, val = {1, 4, 5, 7};    // A, B, C, D
    auto [best, chosen] = knapsackTable(wt, val, 7);
    std::cout << best << "\\n";                                 // 9
    for (int i : chosen) std::cout << i << ' ';                 // 1 2 (B and C)
    std::cout << "\\n" << knapsack(wt, val, 7) << "\\n";         // 9
    std::cout << minSplitDiff({2, 7, 4, 1, 8, 1}) << "\\n";     // 1
    std::cout << minSplitDiff({1, 5, 11, 5}) << "\\n";          // 0
}`;

export const skeleton: LessonSkeleton = {
  demo: <KnapsackDemo />,
  code: { python, cpp },
};
