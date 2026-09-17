import { IntervalDpDemo } from "@/components/lesson/demos/IntervalDpDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `from functools import lru_cache


def max_coins(nums):
    """Burst Balloons: pad both ends with 1. dp[i][j] = best score for bursting everything inside (i, j)."""
    a = [1] + nums + [1]
    n = len(a)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n):                    # short intervals first, so every sub-interval is ready
        for i in range(n - length):
            j = i + length
            dp[i][j] = max(dp[i][k] + dp[k][j] + a[i] * a[k] * a[j]   # k is the last one burst
                           for k in range(i + 1, j))
    return dp[0][n - 1]


def matrix_chain(dims):
    """Matrix i is dims[i-1] × dims[i]. Returns (fewest scalar multiplications, best parenthesisation)."""
    n = len(dims) - 1
    cost = [[0] * (n + 1) for _ in range(n + 1)]
    split = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            cost[i][j] = float("inf")
            for k in range(i, j):                 # the final multiply joins A_i..A_k with A_k+1..A_j
                c = cost[i][k] + cost[k + 1][j] + dims[i - 1] * dims[k] * dims[j]
                if c < cost[i][j]:
                    cost[i][j], split[i][j] = c, k

    def paren(i, j):                              # rebuild the parentheses from the recorded splits
        k = split[i][j]
        return f"A{i}" if i == j else f"({paren(i, k)}{paren(k + 1, j)})"

    return cost[1][n], paren(1, n)


def longest_palindrome_subseq(s):
    """The same interval state as memoisation: the arguments are the two ends of the interval."""
    @lru_cache(maxsize=None)
    def go(i, j):
        if i > j:
            return 0
        if i == j:
            return 1
        if s[i] == s[j]:
            return go(i + 1, j - 1) + 2           # ends match, so take both into the palindrome
        return max(go(i + 1, j), go(i, j - 1))    # otherwise drop one end
    return go(0, len(s) - 1)


if __name__ == "__main__":
    print(max_coins([3, 1, 5, 8]))                # 167 (same as the interactive demo)
    print(matrix_chain([10, 30, 5, 60]))          # (4500, '((A1A2)A3)'); the other way costs 27000
    print(longest_palindrome_subseq("character")) # 5 (carac, for one)`;

const cpp = `#include <algorithm>
#include <climits>
#include <iostream>
#include <vector>

// Burst Balloons: short intervals first
int maxCoins(std::vector<int> nums) {
    nums.insert(nums.begin(), 1);
    nums.push_back(1);                               // pad both ends with 1
    int n = (int)nums.size();
    std::vector<std::vector<int>> dp(n, std::vector<int>(n, 0));
    for (int len = 2; len < n; len++)
        for (int i = 0; i + len < n; i++) {
            int j = i + len;
            for (int k = i + 1; k < j; k++)          // k is the last balloon burst inside (i, j)
                dp[i][j] = std::max(dp[i][j], dp[i][k] + dp[k][j] + nums[i] * nums[k] * nums[j]);
        }
    return dp[0][n - 1];
}

// Merging adjacent piles: each merge joins two neighbouring piles and costs their combined size
long long mergeAdjacentPiles(const std::vector<int>& piles) {
    int n = (int)piles.size();
    std::vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + piles[i];
    std::vector<std::vector<long long>> dp(n, std::vector<long long>(n, 0));
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = LLONG_MAX;
            for (int k = i; k < j; k++)              // the final merge: [i..k] with [k+1..j]
                dp[i][j] = std::min(dp[i][j], dp[i][k] + dp[k + 1][j]);
            dp[i][j] += pre[j + 1] - pre[i];         // however you split it, the last merge pays the whole sum
        }
    return dp[0][n - 1];
}

int main() {
    std::cout << maxCoins({3, 1, 5, 8}) << '\\n';                 // 167
    std::cout << mergeAdjacentPiles({4, 1, 1, 4}) << ' '
              << mergeAdjacentPiles({3, 5, 1, 2, 6}) << '\\n';     // 18 37
}`;

export const skeleton: LessonSkeleton = {
  demo: <IntervalDpDemo />,
  code: { python, cpp },
};
