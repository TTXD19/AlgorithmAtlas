import { MemoDemo } from "@/components/lesson/demos/MemoDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `from functools import cache


# 1. Plain recursion: straight from the definition. About 1.618ⁿ calls, so n = 40 needs over 300 million
def fib_naive(n):
    if n <= 1:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)


# 2. Memoisation (top-down): the original recursion plus a cache keyed by the arguments
def fib_memo(n, memo=None):
    if memo is None:                       # never write memo={}: a default is built once and shared by every call
        memo = {}
    if n in memo:                          # check the cache first
        return memo[n]
    if n <= 1:
        result = n                         # base case
    else:
        result = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    memo[n] = result                       # store it before returning
    return result


@cache                                     # the standard library does the same job: the arguments are the cache key
def fib_cached(n):
    return n if n <= 1 else fib_cached(n - 1) + fib_cached(n - 2)


# 3. Tabulation (bottom-up): no recursion, fill upward starting from the base cases
def fib_table(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):              # when dp[i] is computed, dp[i-1] and dp[i-2] are already filled in
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]


# 4. Space compression: dp[i] only reads the previous two cells, so two variables are enough. O(1) space
def fib_rolling(n):
    a, b = 0, 1                            # a = fib(i), b = fib(i+1)
    for _ in range(n):
        a, b = b, a + b
    return a


# Generalised: climbing n stairs where each move is any step size in steps (steps = [1, 2] is LeetCode 70)
def climb_memo(n, steps):
    @cache                                 # the cache lives inside the function: every climb_memo call gets a fresh one
    def ways(i):                           # the state is just i; steps is fixed for this call, so it stays out of the key
        if i == 0:
            return 1                       # already standing on step 0: one way (do nothing)
        return sum(ways(i - s) for s in steps if s <= i)
    return ways(n)


def climb_table(n, steps):
    dp = [1] + [0] * n                     # dp[i] = number of ways to reach step i
    for i in range(1, n + 1):
        dp[i] = sum(dp[i - s] for s in steps if s <= i)
    return dp[n]


if __name__ == "__main__":
    print(fib_naive(20), fib_memo(20), fib_cached(20))    # 6765 6765 6765
    print(fib_table(90), fib_rolling(90))                 # 2880067194370816120 2880067194370816120
    print(climb_memo(10, [1, 2]), climb_table(10, [1, 2]))          # 89 89
    print(climb_memo(10, [1, 3, 5]), climb_table(10, [1, 3, 5]))    # 47 47
    print(len(str(fib_table(5000))))                      # 1045 (fib(5000) has 1045 digits)
    # fib_memo(5000) raises RecursionError: deeper than Python's default limit of 1000`;

const cpp = `#include <iostream>
#include <vector>

// Plain recursion: about 1.618ⁿ calls
long long fibNaive(int n) {
    if (n <= 1) return n;
    return fibNaive(n - 1) + fibNaive(n - 2);
}

// Memoisation (top-down): memo[n] == -1 means "not computed yet"
long long fibMemo(int n, std::vector<long long>& memo) {
    if (memo[n] != -1) return memo[n];                  // cache hit
    memo[n] = n <= 1 ? n : fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];                                     // store it before returning
}

// Tabulation (bottom-up): fill from small to large, so dp[i]'s dependencies are always ready
long long fibTable(int n) {
    if (n <= 1) return n;
    std::vector<long long> dp(n + 1, 0);
    dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}

// Space compression: keep only the previous two cells. long long holds up to fib(92)
long long fibRolling(int n) {
    if (n == 0) return 0;
    long long prev = 0, cur = 1;                        // fib(i-1) and fib(i), starting from i = 1
    for (int i = 2; i <= n; i++) {
        long long next = prev + cur;
        prev = cur;
        cur = next;
    }
    return cur;
}

// Generalised: how many ways to reach step n when each move is any step size in steps
long long climbTable(int n, const std::vector<int>& steps) {
    std::vector<long long> dp(n + 1, 0);
    dp[0] = 1;                                          // standing on step 0: one way
    for (int i = 1; i <= n; i++)
        for (int s : steps)
            if (s <= i) dp[i] += dp[i - s];
    return dp[n];
}

int main() {
    std::vector<long long> memo(91, -1);                // size n + 1, everything marked "not computed"
    std::cout << fibNaive(20) << " " << fibMemo(20, memo) << "\\n";   // 6765 6765
    std::cout << fibMemo(90, memo) << "\\n";            // 2880067194370816120
    std::cout << fibTable(90) << " " << fibRolling(92) << "\\n";      // 2880067194370816120 7540113804746346429
    std::cout << climbTable(10, {1, 2}) << " " << climbTable(10, {1, 3, 5}) << "\\n";  // 89 47
}`;

export const skeleton: LessonSkeleton = {
  demo: <MemoDemo />,
  code: { python, cpp },
};
