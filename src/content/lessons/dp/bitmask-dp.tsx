import { BitmaskDpDemo } from "@/components/lesson/demos/BitmaskDpDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `from math import inf


def tsp(dist):
    """Shortest tour from 0 visiting every city once and returning to 0, plus the route. O(2ⁿ·n²)"""
    n = len(dist)
    FULL = 1 << n
    dp = [[inf] * n for _ in range(FULL)]         # dp[mask][j]: min cost to cover mask and stop at j
    parent = [[-1] * n for _ in range(FULL)]
    dp[1][0] = 0                                  # only 0 visited, standing at 0
    for mask in range(FULL):                      # ascending: adding a city only grows the integer
        if not mask & 1:
            continue                              # every tour starts at 0
        for j in range(n):
            if dp[mask][j] == inf:
                continue
            for nxt in range(n):                  # push forward: from (mask, j) to an unvisited nxt
                if mask >> nxt & 1:
                    continue
                new = mask | 1 << nxt
                if dp[mask][j] + dist[j][nxt] < dp[new][nxt]:
                    dp[new][nxt] = dp[mask][j] + dist[j][nxt]
                    parent[new][nxt] = j
    last = min(range(1, n), key=lambda j: dp[FULL - 1][j] + dist[j][0]) if n > 1 else 0
    best = dp[FULL - 1][last] + dist[last][0]
    route, mask, j = [], FULL - 1, last
    while j != -1:                                # walk back along parent, clearing j from mask
        route.append(j)
        mask, j = mask ^ (1 << j), parent[mask][j]
    return best, route[::-1] + [0]


def min_assignment(cost):
    """cost[i][j]: person i doing job j. Pick a job for person 0, 1, 2...; mask holds taken jobs"""
    n = len(cost)
    dp = [inf] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        i = bin(mask).count("1")                  # people assigned so far, so person i comes next
        if i == n:
            continue
        for j in range(n):
            if not mask >> j & 1:
                dp[mask | 1 << j] = min(dp[mask | 1 << j], dp[mask] + cost[i][j])
    return dp[(1 << n) - 1]


if __name__ == "__main__":
    dist = [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]   # same as the demo
    print(tsp(dist))                              # (80, [0, 2, 3, 1, 0])
    print(min_assignment([[9, 2, 7, 8], [6, 4, 3, 7], [5, 8, 1, 8], [7, 6, 9, 4]]))   # 13 (2 + 6 + 1 + 4)`;

const cpp = `#include <algorithm>
#include <climits>
#include <iostream>
#include <vector>

// The "pull" form of TSP (same as the demo): dp[mask][j] comes from dp[mask without j][previous]
int tsp(const std::vector<std::vector<int>>& d) {
    int n = (int)d.size(), FULL = 1 << n;
    const int INF = INT_MAX / 2;                          // adding two INFs still cannot overflow
    std::vector<std::vector<int>> dp(FULL, std::vector<int>(n, INF));
    dp[1][0] = 0;
    for (int mask = 1; mask < FULL; mask += 2)            // only masks containing city 0 (low bit 1)
        for (int j = 1; j < n; j++) {
            if (!(mask & (1 << j))) continue;             // always parenthesise bitwise operations
            int sub = mask ^ (1 << j);
            for (int p = 0; p < n; p++)
                if ((sub & (1 << p)) && dp[sub][p] < INF)
                    dp[mask][j] = std::min(dp[mask][j], dp[sub][p] + d[p][j]);
        }
    int best = n == 1 ? 0 : INF;
    for (int j = 1; j < n; j++) best = std::min(best, dp[FULL - 1][j] + d[j][0]);
    return best;
}

// Fewest hires so that every day in need has someone on shift (each person's days are a bitmask)
int minCover(const std::vector<int>& canWork, int need) {
    std::vector<int> dp(need + 1, INT_MAX);               // dp[covered]: fewest people covering those days
    dp[0] = 0;
    for (int covered = 0; covered <= need; covered++) {
        if (dp[covered] == INT_MAX || (covered & ~need)) continue;
        for (int days : canWork) {
            int next = (covered | days) & need;           // days covered once this person is hired
            dp[next] = std::min(dp[next], dp[covered] + 1);
        }
    }
    return dp[need] == INT_MAX ? -1 : dp[need];
}

int main() {
    std::vector<std::vector<int>> d = {{0, 10, 15, 20}, {10, 0, 35, 25}, {15, 35, 0, 30}, {20, 25, 30, 0}};
    std::cout << tsp(d) << '\\n';                          // 80
    // Seven days in a week (bit 0 is Monday). Four part-timers and the days each can work
    std::vector<int> canWork = {0b0001111, 0b1110000, 0b0101010, 0b1001100};
    std::cout << minCover(canWork, 0b1111111) << '\\n';    // 2 (person 0 + person 1)
}`;

export const skeleton: LessonSkeleton = {
  demo: <BitmaskDpDemo />,
  code: { python, cpp },
};
