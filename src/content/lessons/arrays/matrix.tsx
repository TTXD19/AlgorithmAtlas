import { MatrixDemo } from "@/components/lesson/demos/MatrixDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Build an m × n matrix. Never write [[0] * n] * m: that makes every row the same list
grid = [[0] * 4 for _ in range(3)]
m, n = len(grid), len(grid[0])       # number of rows, number of columns
grid[r][c]                           # row first, then column

# Moving in four directions: use a direction array, not four separate if branches
DIRS = [(0, 1), (1, 0), (0, -1), (-1, 0)]     # right, down, left, up

def neighbors(r, c):
    for dr, dc in DIRS:
        nr, nc = r + dr, c + dc
        if 0 <= nr < m and 0 <= nc < n:       # the bounds check lives in one place only
            yield nr, nc


# Spiral traversal (LeetCode 54): four bounds shrinking inwards
def spiral_order(matrix):
    out = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):  out.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):  out.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1): out.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1): out.append(matrix[r][left])
            left += 1
    return out


# Rotate 90° clockwise in place (LeetCode 48): transpose, then reverse each row
def rotate(matrix):
    n = len(matrix)
    for r in range(n):
        for c in range(r + 1, n):                  # only swap above the diagonal
            matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
    for row in matrix:
        row.reverse()


# Use the first row and the first column as markers, O(1) extra space (LeetCode 73)
def set_zeroes(matrix):
    m, n = len(matrix), len(matrix[0])
    first_row_zero = any(matrix[0][c] == 0 for c in range(n))
    first_col_zero = any(matrix[r][0] == 0 for r in range(m))
    for r in range(1, m):
        for c in range(1, n):
            if matrix[r][c] == 0:
                matrix[r][0] = matrix[0][c] = 0    # record it on the edges
    for r in range(1, m):
        for c in range(1, n):
            if matrix[r][0] == 0 or matrix[0][c] == 0:
                matrix[r][c] = 0
    if first_row_zero:
        for c in range(n): matrix[0][c] = 0
    if first_col_zero:
        for r in range(m): matrix[r][0] = 0`;

const cpp = `#include <vector>
#include <algorithm>

using Grid = std::vector<std::vector<int>>;

// Build an m × n matrix
Grid make(int m, int n) { return Grid(m, std::vector<int>(n, 0)); }

// The four directions
const int DR[4] = {0, 1, 0, -1};
const int DC[4] = {1, 0, -1, 0};

bool inBounds(const Grid& g, int r, int c) {
    return r >= 0 && r < (int)g.size() && c >= 0 && c < (int)g[0].size();
}

// Spiral traversal
std::vector<int> spiralOrder(const Grid& a) {
    std::vector<int> out;
    int top = 0, bottom = a.size() - 1, left = 0, right = a[0].size() - 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) out.push_back(a[top][c]);
        top++;
        for (int r = top; r <= bottom; r++) out.push_back(a[r][right]);
        right--;
        if (top <= bottom) {
            for (int c = right; c >= left; c--) out.push_back(a[bottom][c]);
            bottom--;
        }
        if (left <= right) {
            for (int r = bottom; r >= top; r--) out.push_back(a[r][left]);
            left++;
        }
    }
    return out;
}

// Rotate 90° clockwise in place: transpose + reverse each row
void rotate(Grid& a) {
    int n = a.size();
    for (int r = 0; r < n; r++)
        for (int c = r + 1; c < n; c++) std::swap(a[r][c], a[c][r]);
    for (auto& row : a) std::reverse(row.begin(), row.end());
}

// A template for visiting every neighbour
void visitNeighbors(const Grid& g, int r, int c) {
    for (int d = 0; d < 4; d++) {
        int nr = r + DR[d], nc = c + DC[d];
        if (!inBounds(g, nr, nc)) continue;
        // handle g[nr][nc]
    }
}`;

const javascript = `// Build an m × n matrix. Never write Array(m).fill(Array(n)): that makes every row the same array
const grid = Array.from({ length: 3 }, () => new Array(4).fill(0));
const m = grid.length, n = grid[0].length;   // number of rows, number of columns
grid[r][c];                                  // row first, then column

// Moving in four directions: use a direction array, not four separate if branches
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];   // right, down, left, up

function* neighbors(r, c) {
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < m && nc >= 0 && nc < n) yield [nr, nc];   // the bounds check lives in one place only
  }
}


// Spiral traversal (LeetCode 54): four bounds shrinking inwards
function spiralOrder(matrix) {
  const out = [];
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) out.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) out.push(matrix[r][right]);
    right--;
    if (top <= bottom) {
      for (let c = right; c >= left; c--) out.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) {
      for (let r = bottom; r >= top; r--) out.push(matrix[r][left]);
      left++;
    }
  }
  return out;
}


// Rotate 90° clockwise in place (LeetCode 48): transpose, then reverse each row
function rotate(matrix) {
  const n = matrix.length;
  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) {          // only swap above the diagonal
      [matrix[r][c], matrix[c][r]] = [matrix[c][r], matrix[r][c]];
    }
  }
  for (const row of matrix) row.reverse();
}


// Use the first row and the first column as markers, O(1) extra space (LeetCode 73)
function setZeroes(matrix) {
  const m = matrix.length, n = matrix[0].length;
  const firstRowZero = matrix[0].some((v) => v === 0);
  const firstColZero = matrix.some((row) => row[0] === 0);
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      if (matrix[r][c] === 0) matrix[r][0] = matrix[0][c] = 0;   // record it on the edges
    }
  }
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0;
    }
  }
  if (firstRowZero) for (let c = 0; c < n; c++) matrix[0][c] = 0;
  if (firstColZero) for (let r = 0; r < m; r++) matrix[r][0] = 0;
}`;

export const skeleton: LessonSkeleton = {
  demo: <MatrixDemo />,
  code: { python, cpp, javascript },
};
