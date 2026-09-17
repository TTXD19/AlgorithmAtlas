import { UnboundedDemo } from "@/components/lesson/demos/UnboundedDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Unbounded knapsack: unlimited copies of every item. dp[w] = best value for capacity at most w
# The only difference from 0/1: the inner loop becomes range(cap, wt - 1, -1), sweeping backwards
def unbounded_knapsack(weights, values, cap):
    dp = [0] * (cap + 1)
    for wt, val in zip(weights, values):       # outer loop: the items
        for w in range(wt, cap + 1):           # inner loop forwards: dp[w - wt] may already use this item
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[cap]


# Fewest coins (LeetCode 322): the total must be hit exactly, so unreachable amounts start at INF
def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != INF else -1


# Combinations (LeetCode 518): coins outside, amount inside, so 1+2 and 2+1 count as one
def count_combinations(coins, amount):
    dp = [1] + [0] * amount                    # there is one way to make 0: take nothing
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]


# Permutations (LeetCode 377): swap the loops, and 1+2 and 2+1 count as two
def count_permutations(nums, target):
    dp = [1] + [0] * target
    for a in range(1, target + 1):             # outer loop: the amount
        for x in nums:                         # inner loop: which item goes last
            if x <= a:
                dp[a] += dp[a - x]
    return dp[target]


if __name__ == "__main__":
    # A 10 m bar, sold as 3 m, 4 m and 5 m pieces for 260, 340 and 420
    print(unbounded_knapsack([3, 4, 5], [260, 340, 420], 10))  # 860 (3 + 3 + 4)
    print(coin_change([1, 2, 5], 11))          # 3 (5 + 5 + 1)
    print(coin_change([7, 10, 25], 63))        # 6 (25 + 10 + 7 × 4)
    print(coin_change([5, 10], 3))             # -1
    print(count_combinations([6, 10, 24], 120))  # 16
    print(count_permutations([6, 10, 24], 120))  # 39614`;

const cpp = `#include <vector>
#include <algorithm>
#include <climits>
#include <iostream>

// Unbounded knapsack, maximum value. Only the direction of the inner loop differs from 0/1
int unboundedKnapsack(const std::vector<int>& wt, const std::vector<int>& val, int cap) {
    std::vector<int> dp(cap + 1, 0);
    for (std::size_t i = 0; i < wt.size(); i++)
        for (int w = wt[i]; w <= cap; w++)            // forwards: the same item can be taken again
            dp[w] = std::max(dp[w], dp[w - wt[i]] + val[i]);
    return dp[cap];
}

// Fewest coins: INF is INT_MAX / 2, so adding 1 cannot overflow
int coinChange(const std::vector<int>& coins, int amount) {
    const int INF = INT_MAX / 2;
    std::vector<int> dp(amount + 1, INF);
    dp[0] = 0;
    for (int c : coins)
        for (int a = c; a <= amount; a++)
            dp[a] = std::min(dp[a], dp[a - c] + 1);
    return dp[amount] >= INF ? -1 : dp[amount];
}

// Intermediate counts can far exceed the final answer, so unsigned lets the overflow wrap legally
// Only additions happen, so the result is right as long as the final answer fits in 64 bits
unsigned long long countCombinations(const std::vector<int>& coins, int amount) {
    std::vector<unsigned long long> dp(amount + 1, 0);
    dp[0] = 1;
    for (int c : coins)                               // coins outside: combinations
        for (int a = c; a <= amount; a++)
            dp[a] += dp[a - c];
    return dp[amount];
}

unsigned long long countPermutations(const std::vector<int>& nums, int target) {
    std::vector<unsigned long long> dp(target + 1, 0);
    dp[0] = 1;
    for (int a = 1; a <= target; a++)                 // amount outside: permutations
        for (int x : nums)
            if (x <= a) dp[a] += dp[a - x];
    return dp[target];
}

int main() {
    std::cout << unboundedKnapsack({3, 4, 5}, {260, 340, 420}, 10) << "\\n";  // 860
    std::cout << coinChange({1, 2, 5}, 11) << "\\n";                          // 3
    std::cout << coinChange({7, 10, 25}, 63) << "\\n";                        // 6
    std::cout << coinChange({5, 10}, 3) << "\\n";                             // -1
    std::cout << countCombinations({6, 10, 24}, 120) << "\\n";                // 16
    std::cout << countPermutations({6, 10, 24}, 120) << "\\n";                // 39614
}`;

export const skeleton: LessonSkeleton = {
  demo: <UnboundedDemo />,
  code: { python, cpp },
};
