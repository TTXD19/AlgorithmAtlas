import { WordSearchDemo } from "@/components/lesson/demos/WordSearchDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Word Search (LeetCode 79): DFS on a grid. A visited cell is temporarily rewritten to '#' and restored on the way back
def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(r, c, i):
        if board[r][c] != word[i]:            # wrong letter in this cell
            return False
        if i == len(word) - 1:                # the last letter matched too
            return True
        ch = board[r][c]
        board[r][c] = "#"                     # make the choice: mark the cell as visited
        for dr, dc in ((-1, 0), (0, 1), (1, 0), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and dfs(nr, nc, i + 1):
                board[r][c] = ch              # restore even on success, do not leave the board dirty
                return True
        board[r][c] = ch                      # undo the choice: clear the mark
        return False

    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))


# Variant: list every path through a maze from start to goal (0 is open, 1 is a wall)
def all_paths(maze, start, goal):
    rows, cols = len(maze), len(maze[0])
    ans = []
    path = []
    visited = [[False] * cols for _ in range(rows)]

    def dfs(r, c):
        path.append((r, c))
        visited[r][c] = True
        if (r, c) == goal:
            ans.append(path[:])
        else:
            for dr, dc in ((-1, 0), (0, 1), (1, 0), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and maze[nr][nc] == 0 and not visited[nr][nc]:
                    dfs(nr, nc)
        visited[r][c] = False                 # clear the mark: another path may still pass through this cell
        path.pop()

    dfs(*start)
    return ans


if __name__ == "__main__":
    board = [list("ABCE"), list("SFCS"), list("ADEE")]
    print(exist(board, "SEE"), exist(board, "ABCCED"), exist(board, "ABCB"))   # True True False
    maze = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
    print(len(all_paths(maze, (0, 0), (2, 2))))                              # 2`;

const cpp = `#include <vector>
#include <string>
#include <utility>

// Word Search: a visited cell is temporarily rewritten to '#' and restored on the way back
bool dfsWord(std::vector<std::vector<char>>& board, const std::string& word, int r, int c, int i) {
    int rows = board.size(), cols = board[0].size();
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (board[r][c] != word[i]) return false;       // wrong letter here ('#' never equals a letter either)
    if (i == (int)word.size() - 1) return true;     // the last letter matched too
    char ch = board[r][c];
    board[r][c] = '#';                              // make the choice: mark the cell as visited
    bool found = dfsWord(board, word, r - 1, c, i + 1) || dfsWord(board, word, r, c + 1, i + 1)
              || dfsWord(board, word, r + 1, c, i + 1) || dfsWord(board, word, r, c - 1, i + 1);
    board[r][c] = ch;                               // undo the choice: clear the mark
    return found;
}

bool exist(std::vector<std::vector<char>>& board, const std::string& word) {
    for (int r = 0; r < (int)board.size(); r++)
        for (int c = 0; c < (int)board[0].size(); c++)
            if (dfsWord(board, word, r, c, 0)) return true;
    return false;
}

// Variant: list every path through a maze from start to goal (0 is open, 1 is a wall)
void dfsMaze(const std::vector<std::vector<int>>& maze, int r, int c, std::pair<int, int> goal,
             std::vector<std::vector<bool>>& visited, std::vector<std::pair<int, int>>& path,
             std::vector<std::vector<std::pair<int, int>>>& ans) {
    int rows = maze.size(), cols = maze[0].size();
    path.push_back({r, c});
    visited[r][c] = true;
    if (std::make_pair(r, c) == goal) {
        ans.push_back(path);
    } else {
        const int dr[4] = {-1, 0, 1, 0}, dc[4] = {0, 1, 0, -1};
        for (int d = 0; d < 4; d++) {
            int nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc] == 0 && !visited[nr][nc])
                dfsMaze(maze, nr, nc, goal, visited, path, ans);
        }
    }
    visited[r][c] = false;                          // clear the mark
    path.pop_back();
}

std::vector<std::vector<std::pair<int, int>>> allPaths(const std::vector<std::vector<int>>& maze, std::pair<int, int> start, std::pair<int, int> goal) {
    std::vector<std::vector<bool>> visited(maze.size(), std::vector<bool>(maze[0].size(), false));
    std::vector<std::pair<int, int>> path;
    std::vector<std::vector<std::pair<int, int>>> ans;
    dfsMaze(maze, start.first, start.second, goal, visited, path, ans);
    return ans;
}`;

export const skeleton: LessonSkeleton = {
  demo: <WordSearchDemo />,
  code: { python, cpp },
};
