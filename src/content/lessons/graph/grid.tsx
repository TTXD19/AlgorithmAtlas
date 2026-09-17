import { GridDemo } from "@/components/lesson/demos/GridDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `from collections import deque

DIRS = [(-1, 0), (1, 0), (0, -1), (0, 1)]    # up, down, left, right


def island_areas(grid):
    """1s joined in four directions form an island. Returns each area in scan order; the length is the island count."""
    m, n = len(grid), len(grid[0])
    seen = [[False] * n for _ in range(m)]
    areas = []
    for r in range(m):
        for c in range(n):
            if grid[r][c] != 1 or seen[r][c]:
                continue
            seen[r][c] = True                 # unvisited land: the start of a new island
            queue, area = deque([(r, c)]), 0
            while queue:
                cr, cc = queue.popleft()      # queue.pop() makes it the stack version; same areas
                area += 1
                for dr, dc in DIRS:
                    nr, nc = cr + dr, cc + dc
                    # Check bounds first: Python's grid[-1] does not raise, it quietly reads the last row
                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1 and not seen[nr][nc]:
                        seen[nr][nc] = True   # mark on push, so no cell is ever queued twice
                        queue.append((nr, nc))
            areas.append(area)
    return areas


def nearest_exit(floor):
    """Multi-source BFS: steps from each cell to the nearest exit E. Walls # and unreachable cells are -1."""
    m, n = len(floor), len(floor[0])
    dist = [[-1] * n for _ in range(m)]
    queue = deque()
    for r in range(m):
        for c in range(n):
            if floor[r][c] == "E":
                dist[r][c] = 0                # every exit starts in the queue at distance 0
                queue.append((r, c))
    while queue:
        r, c = queue.popleft()
        for dr, dc in DIRS:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and floor[nr][nc] != "#" and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1  # the first time a cell is reached is the fewest steps
                queue.append((nr, nc))
    return dist


if __name__ == "__main__":
    grid = [
        [1, 1, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0],
        [1, 0, 0, 0, 0, 1],
    ]
    areas = island_areas(grid)
    print(len(areas), areas, max(areas))   # 5 [3, 2, 4, 1, 1] 4

    floor = ["E.#...",
             "..#.#.",
             "....#E",
             "##.##.",
             "#.#..."]
    for r, row in enumerate(nearest_exit(floor)):
        print(" ".join(" #" if floor[r][c] == "#" else f"{d:2}" for c, d in enumerate(row)))
    # Output (# is a wall; (4, 1) is fenced in by walls and reaches no exit, hence -1):
    #  0  1  #  4  3  2
    #  1  2  #  5  #  1
    #  2  3  4  5  #  0
    #  #  #  5  #  #  1
    #  # -1  #  4  3  2`;

const cpp = `#include <vector>
#include <string>
#include <queue>
#include <utility>
#include <iostream>

const int DR[] = {-1, 1, 0, 0};   // up, down, left, right
const int DC[] = {0, 0, -1, 1};

// Area of each island (1s joined in four directions), in scan order; size() is the island count
std::vector<int> islandAreas(const std::vector<std::vector<int>>& grid) {
    int m = (int)grid.size(), n = (int)grid[0].size();
    std::vector<std::vector<bool>> seen(m, std::vector<bool>(n, false));
    std::vector<int> areas;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 1 || seen[r][c]) continue;
            seen[r][c] = true;                        // the start of a new island
            std::queue<std::pair<int, int>> q;
            q.push({r, c});
            int area = 0;
            while (!q.empty()) {
                auto [cr, cc] = q.front(); q.pop();
                area++;
                for (int d = 0; d < 4; d++) {
                    int nr = cr + DR[d], nc = cc + DC[d];
                    if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;  // check bounds first
                    if (grid[nr][nc] != 1 || seen[nr][nc]) continue;
                    seen[nr][nc] = true;              // mark on push
                    q.push({nr, nc});
                }
            }
            areas.push_back(area);
        }
    }
    return areas;
}

// Multi-source BFS: steps from each cell to the nearest exit 'E'; walls '#' and unreachable cells are -1
std::vector<std::vector<int>> nearestExit(const std::vector<std::string>& floor) {
    int m = (int)floor.size(), n = (int)floor[0].size();
    std::vector<std::vector<int>> dist(m, std::vector<int>(n, -1));
    std::queue<std::pair<int, int>> q;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (floor[r][c] == 'E') { dist[r][c] = 0; q.push({r, c}); }  // all exits start together
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (floor[nr][nc] == '#' || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;            // first arrival is the fewest steps
            q.push({nr, nc});
        }
    }
    return dist;
}

int main() {
    std::vector<std::vector<int>> grid = {
        {1, 1, 0, 0, 0, 1},
        {1, 0, 0, 1, 0, 1},
        {0, 0, 1, 1, 0, 0},
        {0, 0, 0, 1, 0, 0},
        {1, 0, 0, 0, 0, 1},
    };
    for (int a : islandAreas(grid)) std::cout << a << ' ';
    std::cout << "\\n";                               // 3 2 4 1 1 (5 islands in all)

    std::vector<std::string> floor = {"E.#...", "..#.#.", "....#E", "##.##.", "#.#..."};
    auto dist = nearestExit(floor);
    std::cout << dist[0][3] << ' ' << dist[3][2] << ' ' << dist[4][1] << "\\n";  // 4 5 -1
}`;

export const skeleton: LessonSkeleton = {
  demo: <GridDemo />,
  code: { python, cpp },
};
