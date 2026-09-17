import { GridDpDemo } from "@/components/lesson/demos/GridDpDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `def unique_paths(m, n, blocked=frozenset()):
    """Paths across an m×n grid from top-left to bottom-right moving only right or down; blocked holds the obstacles"""
    dp = [0] * n                     # one row is enough: before the update dp[c] is the cell above, dp[c-1] is already the cell to the left
    dp[0] = 1
    for r in range(m):
        for c in range(n):
            if (r, c) in blocked:
                dp[c] = 0                # an obstacle can never be reached
            elif c > 0:
                dp[c] += dp[c - 1]       # paths from above + paths from the left
    return dp[-1]


def min_path_sum(grid):
    """Returns (minimum cost, path). Rebuilding the path means keeping the whole table"""
    R, C = len(grid), len(grid[0])
    dp = [[0] * C for _ in range(R)]
    for r in range(R):
        for c in range(C):
            if r == 0 and c == 0:
                best = 0
            elif r == 0:
                best = dp[r][c - 1]      # the first row can only come from the left
            elif c == 0:
                best = dp[r - 1][c]      # the first column can only come from above
            else:
                best = min(dp[r - 1][c], dp[r][c - 1])
            dp[r][c] = best + grid[r][c]
    path, r, c = [], R - 1, C - 1
    while (r, c) != (0, 0):              # walk back from the end, always taking the cheaper source
        path.append((r, c))
        if c == 0 or (r > 0 and dp[r - 1][c] <= dp[r][c - 1]):
            r -= 1
        else:
            c -= 1
    return dp[-1][-1], [(0, 0)] + path[::-1]


def min_seam(energy):
    """Image seam: pick one pixel per row; the next row may only pick directly below or diagonally below. Minimise total energy"""
    prev = energy[0][:]
    for row in energy[1:]:
        prev = [row[c] + min(prev[max(c - 1, 0):c + 2]) for c in range(len(row))]
    return min(prev)


if __name__ == "__main__":
    print(unique_paths(4, 4), unique_paths(3, 3, {(1, 1)}), unique_paths(20, 20))   # 20 2 35345263800
    grid = [[1, 3, 1, 2], [1, 5, 1, 3], [4, 2, 1, 1], [2, 1, 3, 1]]   # the same grid as the interactive demo
    print(min_path_sum(grid))
    # (9, [(0, 0), (0, 1), (0, 2), (1, 2), (2, 2), (2, 3), (3, 3)])
    print(min_seam([[3, 1, 4, 2], [5, 9, 2, 6], [5, 3, 5, 8], [9, 7, 1, 3]]))   # 7 (1 → 2 → 3 → 1)`;

const cpp = `#include <algorithm>
#include <iostream>
#include <vector>

// Unique Paths II: 1 marks an obstacle. The path count can get large, so use long long
long long uniquePathsWithObstacles(const std::vector<std::vector<int>>& g) {
    int n = (int)g[0].size();
    std::vector<long long> dp(n, 0);
    dp[0] = 1;
    for (const auto& row : g)
        for (int c = 0; c < n; c++) {
            if (row[c] == 1) dp[c] = 0;             // an obstacle resets the cell to zero
            else if (c > 0) dp[c] += dp[c - 1];     // above (the old value) + left (the new value)
        }
    return dp[n - 1];
}

// Minimum Path Sum: rolling one row, for when you want the cost but not the path
int minPathSum(const std::vector<std::vector<int>>& g) {
    int n = (int)g[0].size();
    std::vector<int> dp(n);
    for (std::size_t r = 0; r < g.size(); r++)
        for (int c = 0; c < n; c++) {
            if (r == 0 && c == 0) dp[c] = g[0][0];
            else if (r == 0) dp[c] = dp[c - 1] + g[r][c];
            else if (c == 0) dp[c] += g[r][c];
            else dp[c] = std::min(dp[c], dp[c - 1]) + g[r][c];
        }
    return dp[n - 1];
}

int main() {
    std::vector<std::vector<int>> maze = {{0, 0, 0}, {0, 1, 0}, {0, 0, 0}};
    std::cout << uniquePathsWithObstacles(maze) << '\\n';   // 2
    std::vector<std::vector<int>> grid = {{1, 3, 1, 2}, {1, 5, 1, 3}, {4, 2, 1, 1}, {2, 1, 3, 1}};
    std::cout << minPathSum(grid) << '\\n';                 // 9
    std::vector<std::vector<int>> open(20, std::vector<int>(20, 0));
    std::cout << uniquePathsWithObstacles(open) << '\\n';   // 35345263800 = C(38, 19)
}`;

export const skeleton: LessonSkeleton = {
  demo: <GridDpDemo />,
  code: { python, cpp },
};
