import { NQueensDemo } from "@/components/lesson/demos/NQueensDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# N-Queens (LeetCode 51): one row at a time, three sets tracking the attacked columns and diagonals
def solve_n_queens(n):
    ans = []
    queens = []                  # queens[r] = the column of the queen in row r
    cols = set()                 # columns already taken
    diag1 = set()                # cells with the same r - c lie on the same "\\" diagonal
    diag2 = set()                # cells with the same r + c lie on the same "/" diagonal

    def dfs(r):
        if r == n:               # every row has its queen
            ans.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
            return
        for c in range(n):
            if c in cols or (r - c) in diag1 or (r + c) in diag2:
                continue         # attacked, so prune it
            queens.append(c)     # make the choice
            cols.add(c); diag1.add(r - c); diag2.add(r + c)
            dfs(r + 1)
            queens.pop()         # undo the choice: all three sets must be restored
            cols.remove(c); diag1.remove(r - c); diag2.remove(r + c)

    dfs(0)
    return ans


# Counting solutions only (LeetCode 52): bitmasks instead of sets
# cols / d1 / d2 are n-bit integers; bit c set means column c of this row is attacked
def total_n_queens(n):
    full = (1 << n) - 1

    def dfs(cols, d1, d2):
        if cols == full:                     # every column holds a queen
            return 1
        count = 0
        free = full & ~(cols | d1 | d2)      # the squares still open in this row
        while free:
            bit = free & -free               # take the lowest set bit
            free ^= bit
            # next row: the \\ diagonals move one column right (<< 1), the / diagonals one column left (>> 1)
            count += dfs(cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1)
        return count

    return dfs(0, 0, 0)


if __name__ == "__main__":
    for row in solve_n_queens(4)[0]:
        print(row)                           # .Q.. / ...Q / Q... / ..Q.
    print(total_n_queens(8))                 # 92`;

const cpp = `#include <vector>
#include <string>
#include <unordered_set>

// N-Queens: one row at a time, three sets tracking the attacked columns and diagonals
class NQueens {
    int n;
    std::vector<int> queens;                 // queens[r] = the column of the queen in row r
    std::unordered_set<int> cols, diag1, diag2;
    std::vector<std::vector<std::string>> ans;

    void dfs(int r) {
        if (r == n) {                        // every row has its queen
            std::vector<std::string> board(n, std::string(n, '.'));
            for (int i = 0; i < n; i++) board[i][queens[i]] = 'Q';
            ans.push_back(board);
            return;
        }
        for (int c = 0; c < n; c++) {
            if (cols.count(c) || diag1.count(r - c) || diag2.count(r + c)) continue;   // attacked
            queens.push_back(c);             // make the choice
            cols.insert(c); diag1.insert(r - c); diag2.insert(r + c);
            dfs(r + 1);
            queens.pop_back();               // undo the choice: all three sets must be restored
            cols.erase(c); diag1.erase(r - c); diag2.erase(r + c);
        }
    }
public:
    std::vector<std::vector<std::string>> solve(int size) {
        n = size; ans.clear(); queens.clear();
        cols.clear(); diag1.clear(); diag2.clear();
        dfs(0);
        return ans;
    }
};

// Counting solutions only: bitmasks, where bit c set means column c of this row is attacked
int countQueens(int cols, int d1, int d2, int full) {
    if (cols == full) return 1;              // every column holds a queen
    int count = 0;
    int free = full & ~(cols | d1 | d2);     // the squares still open in this row
    while (free) {
        int bit = free & -free;              // take the lowest set bit
        free ^= bit;
        // next row: the \\ diagonals move one column right (<< 1), the / diagonals one column left (>> 1)
        count += countQueens(cols | bit, ((d1 | bit) << 1) & full, (d2 | bit) >> 1, full);
    }
    return count;
}

int totalNQueens(int n) {
    return countQueens(0, 0, 0, (1 << n) - 1);   // the low n bits of full are all 1
}`;

export const skeleton: LessonSkeleton = {
  demo: <NQueensDemo />,
  code: { python, cpp },
};
