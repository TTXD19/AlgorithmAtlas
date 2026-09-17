import { Dp1dDemo } from "@/components/lesson/demos/Dp1dDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `# House Robber (LeetCode 198): no two adjacent houses, maximise the haul
# dp[i] = the most money from houses 0..i = max(dp[i-1], dp[i-2] + nums[i])
def rob(nums):
    prev2, prev1 = 0, 0                    # dp[i-2] and dp[i-1]; both 0 before any house
    for x in nums:
        # Tuple assignment: the right-hand side is evaluated from the old values, so no temp is needed
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1


# To know which houses were robbed you have to keep the whole table and walk back from the end
def rob_with_houses(nums):
    n = len(nums)
    if n == 0:
        return 0, []
    dp = [0] * n
    dp[0] = nums[0]                        # base case: one house, so rob it
    if n > 1:
        dp[1] = max(nums[0], nums[1])      # base case: two adjacent houses, take the bigger
    for i in range(2, n):
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])
    houses, i = [], n - 1
    while i >= 0:
        if i == 0 or dp[i] != dp[i - 1]:   # different from the previous cell: house i had to be robbed
            houses.append(i)
            i -= 2                         # i was robbed, so i-1 was not
        else:                              # same value: house i is not needed to reach it
            i -= 1
    return dp[-1], houses[::-1]


# Decode Ways (LeetCode 91): a counting problem. "1"-"26" map to A-Z; how many readings are there?
# The last chunk is one digit or two; the two cases neither overlap nor miss anything, so add their counts
def num_decodings(s):
    prev2, prev1 = 0, 1                    # prev1 = dp[0] = 1: the empty string has one reading
    for i in range(len(s)):
        cur = 0
        if s[i] != "0":                    # on its own: 1-9
            cur += prev1
        if i > 0 and "10" <= s[i - 1:i + 1] <= "26":   # paired with the previous digit: 10-26
            cur += prev2
        prev2, prev1 = prev1, cur
    return prev1


if __name__ == "__main__":
    nums = [2, 7, 9, 3, 1, 8, 4]
    print(rob(nums))                 # 19
    print(rob_with_houses(nums))     # (19, [0, 2, 5])
    print(rob([2, 1, 1, 2]))         # 4 (robbing every other house only gives 3)
    print(num_decodings("226"))      # 3: 2-2-6, 22-6, 2-26
    print(num_decodings("2101"))     # 1: only 2-10-1
    print(num_decodings("06"))       # 0: a leading 0 cannot be decoded`;

const cpp = `#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

// House Robber: dp[i] = max(dp[i-1], dp[i-2] + nums[i]), kept in two variables
int rob(const std::vector<int>& nums) {
    int prev2 = 0, prev1 = 0;              // dp[i-2] and dp[i-1]
    for (int x : nums) {
        int cur = std::max(prev1, prev2 + x);
        prev2 = prev1;                     // shift prev2 first, then prev1; the order matters
        prev1 = cur;
    }
    return prev1;
}

// Keep the whole table and walk back to recover which houses were robbed
std::vector<int> robHouses(const std::vector<int>& nums) {
    int n = (int)nums.size();
    if (n == 0) return {};
    std::vector<int> dp(n);
    dp[0] = nums[0];
    if (n > 1) dp[1] = std::max(nums[0], nums[1]);
    for (int i = 2; i < n; i++) dp[i] = std::max(dp[i - 1], dp[i - 2] + nums[i]);
    std::vector<int> houses;
    for (int i = n - 1; i >= 0;) {
        if (i == 0 || dp[i] != dp[i - 1]) { houses.push_back(i); i -= 2; }  // house i was robbed
        else i -= 1;                                                        // house i was not
    }
    std::reverse(houses.begin(), houses.end());
    return houses;
}

// Decode Ways: counting; the last chunk is either one digit or two
int numDecodings(const std::string& s) {
    int prev2 = 0, prev1 = 1;              // the empty string has one reading
    for (size_t i = 0; i < s.size(); i++) {
        int cur = 0;
        if (s[i] != '0') cur += prev1;
        if (i > 0) {
            int two = (s[i - 1] - '0') * 10 + (s[i] - '0');
            if (two >= 10 && two <= 26) cur += prev2;
        }
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}

int main() {
    std::vector<int> nums = {2, 7, 9, 3, 1, 8, 4};
    std::cout << rob(nums) << "\\n";                     // 19
    for (int h : robHouses(nums)) std::cout << h << ' ';  // 0 2 5
    std::cout << "\\n" << rob({2, 1, 1, 2}) << "\\n";     // 4
    std::cout << numDecodings("226") << "\\n";           // 3
    std::cout << numDecodings("06") << "\\n";            // 0
}`;

export const skeleton: LessonSkeleton = {
  demo: <Dp1dDemo />,
  code: { python, cpp },
};
