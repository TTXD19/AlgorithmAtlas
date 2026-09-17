import { CoinChangeDemo } from "@/components/lesson/demos/CoinChangeDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Greedy change-making: largest denomination first, take as many as possible of each
def coin_change_greedy(coins, amount):
    coins = sorted(coins, reverse=True)
    result = []
    for c in coins:
        count, amount = divmod(amount, c)      # how many of this coin fit, and what is left
        result += [c] * count
    return result if amount == 0 else None    # a non-zero remainder means it cannot be made


# DP change-making (LeetCode 322): correct for any denominations, O(amount × number of coins)
def coin_change_dp(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount                 # dp[a] = fewest coins that make a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] != INF else -1


# Is a set of denominations "canonical" (is greedy always correct)?
# Kozen and Zaks proved that if greedy ever fails, the smallest counterexample is below the sum of the two largest coins
def is_canonical(coins):
    coins = sorted(coins)
    limit = coins[-1] + coins[-2]
    for amount in range(1, limit):
        g = coin_change_greedy(coins, amount)
        if g is None or len(g) != coin_change_dp(coins, amount):
            return False
    return True


if __name__ == "__main__":
    print(coin_change_greedy([1, 5, 10, 50], 63))   # [50, 10, 1, 1, 1]
    print(coin_change_greedy([1, 3, 4], 6))          # [4, 1, 1], but the optimum is [3, 3]
    print(coin_change_dp([1, 3, 4], 6))              # 2
    print(is_canonical([1, 5, 10, 50]), is_canonical([1, 3, 4]))   # True False`;

const cpp = `#include <vector>
#include <algorithm>
#include <climits>
#include <cstdio>

// Greedy change-making: returns the list of coins, or empty if the amount cannot be made
std::vector<int> coinChangeGreedy(std::vector<int> coins, int amount) {
    std::sort(coins.rbegin(), coins.rend());      // largest first
    std::vector<int> result;
    for (int c : coins) {
        int cnt = amount / c;                     // how many of this coin fit
        amount %= c;
        result.insert(result.end(), cnt, c);
    }
    if (amount != 0) result.clear();
    return result;
}

// DP change-making: correct for any denominations
int coinChangeDP(const std::vector<int>& coins, int amount) {
    const int INF = INT_MAX / 2;
    std::vector<int> dp(amount + 1, INF);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins)
            if (c <= a) dp[a] = std::min(dp[a], dp[a - c] + 1);
    return dp[amount] >= INF ? -1 : dp[amount];
}

// Is this set of denominations canonical? Checking up to the sum of the two largest coins is enough
bool isCanonical(std::vector<int> coins) {
    std::sort(coins.begin(), coins.end());
    int limit = coins.back() + coins[coins.size() - 2];
    for (int a = 1; a < limit; a++) {
        auto g = coinChangeGreedy(coins, a);
        if (g.empty() || (int)g.size() != coinChangeDP(coins, a)) return false;
    }
    return true;
}

int main() {
    printf("%d\\n", (int)coinChangeGreedy({1, 5, 10, 50}, 63).size());                    // 5
    printf("%d %d\\n", (int)coinChangeGreedy({1, 3, 4}, 6).size(), coinChangeDP({1, 3, 4}, 6));   // 3 2
    printf("%d %d\\n", isCanonical({1, 5, 10, 50}), isCanonical({1, 3, 4}));               // 1 0
}`;

export const skeleton: LessonSkeleton = {
  demo: <CoinChangeDemo />,
  code: { python, cpp },
};
