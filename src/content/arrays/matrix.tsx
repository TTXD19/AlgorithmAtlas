import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { MatrixDemo } from "@/components/lesson/demos/MatrixDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 建立 m × n 的矩陣：注意不能寫 [[0] * n] * m，那會讓每一列是同一個 list
grid = [[0] * 4 for _ in range(3)]
m, n = len(grid), len(grid[0])       # 列數、行數
grid[r][c]                           # 先列後行

# 四方向移動：用方向陣列，不要寫四段 if
DIRS = [(0, 1), (1, 0), (0, -1), (-1, 0)]     # 右、下、左、上

def neighbors(r, c):
    for dr, dc in DIRS:
        nr, nc = r + dr, c + dc
        if 0 <= nr < m and 0 <= nc < n:       # 邊界檢查放在同一個地方
            yield nr, nc


# 螺旋走訪（LeetCode 54）：四個邊界往內縮
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


# 原地順時針旋轉 90°（LeetCode 48）：轉置，再每列反轉
def rotate(matrix):
    n = len(matrix)
    for r in range(n):
        for c in range(r + 1, n):                  # 只換對角線上方
            matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
    for row in matrix:
        row.reverse()


# 用第一列、第一行當標記，O(1) 額外空間（LeetCode 73）
def set_zeroes(matrix):
    m, n = len(matrix), len(matrix[0])
    first_row_zero = any(matrix[0][c] == 0 for c in range(n))
    first_col_zero = any(matrix[r][0] == 0 for r in range(m))
    for r in range(1, m):
        for c in range(1, n):
            if matrix[r][c] == 0:
                matrix[r][0] = matrix[0][c] = 0    # 記在邊上
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

// 建立 m × n 矩陣
Grid make(int m, int n) { return Grid(m, std::vector<int>(n, 0)); }

// 四方向
const int DR[4] = {0, 1, 0, -1};
const int DC[4] = {1, 0, -1, 0};

bool inBounds(const Grid& g, int r, int c) {
    return r >= 0 && r < (int)g.size() && c >= 0 && c < (int)g[0].size();
}

// 螺旋走訪
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

// 原地順時針旋轉 90°：轉置 + 每列反轉
void rotate(Grid& a) {
    int n = a.size();
    for (int r = 0; r < n; r++)
        for (int c = r + 1; c < n; c++) std::swap(a[r][c], a[c][r]);
    for (auto& row : a) std::reverse(row.begin(), row.end());
}

// 走訪所有鄰居的樣板
void visitNeighbors(const Grid& g, int r, int c) {
    for (int d = 0; d < 4; d++) {
        int nr = r + DR[d], nc = c + DC[d];
        if (!inBounds(g, nr, nc)) continue;
        // 處理 g[nr][nc]
    }
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "把照片轉 90 度",
              problem: "手機拍的照片方向不對，要旋轉。圖片就是一個「高 × 寬」的像素矩陣，記憶體有限，不想再開一張一樣大的圖。",
              why: "旋轉 90° 可以拆成「轉置」加「每列反轉」兩個原地操作，O(1) 額外空間。這種把幾何變換拆成簡單步驟的思路，影像處理裡到處都是。",
            },
            {
              title: "棋盤遊戲與地圖",
              problem: "井字遊戲判斷連線、掃雷算周圍幾顆雷、遊戲地圖上找從 A 到 B 的路，都是在二維格子上「看鄰居」。",
              why: "用方向陣列 [(0,1),(1,0),(0,-1),(-1,0)] 表示上下左右，一個迴圈搞定四方向加邊界檢查。之後圖論的網格 BFS / DFS 都用這個寫法。",
            },
            {
              title: "試算表與矩陣運算",
              problem: "Excel 的一張表、機器學習的一批資料、線性代數的矩陣，都是二維陣列。要取某一行、轉置、對一整塊區域做運算。",
              why: "理解「先列後行」的索引、記憶體是一列一列連續放的，就知道為什麼按列走比按行走快（快取友善），也知道怎麼正確建立與走訪。",
            },
          ]}
          cue="grid、二維、m × n、上下左右、鄰居、旋轉／轉置、螺旋、棋盤、影像。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>二維陣列</strong>就是「陣列的陣列」：<Code>grid[r][c]</Code> 先選第 r 列，再選那一列裡的第 c 格。慣例是 <strong>r 是列（row，垂直方向）、c 是行（column，水平方向）</strong>，<Code>m = len(grid)</Code> 是列數、<Code>n = len(grid[0])</Code> 是行數。把 r 和 c 弄反是這類題最常見的 bug。
        </p>
        <p>
          記憶體裡它其實是一維的：一列接著一列連續放（row-major），所以 <Code>grid[r][c]</Code> 也可以寫成一維的 <Code>flat[r × n + c]</Code>。反過來，一維索引 k 對應 <Code>(k ÷ n, k mod n)</Code>。這個轉換讓「在 m × n 矩陣上二分搜尋」變成普通的一維二分搜尋。
        </p>
        <p>
          矩陣題有三個固定工具。<strong>方向陣列</strong>：把四個（或八個）方向寫成 (dr, dc) 列表，一個迴圈走完所有鄰居，邊界檢查只寫一次。<strong>邊界收縮</strong>：螺旋走訪用 top / bottom / left / right 四條邊往內縮，比記方向轉彎乾淨。<strong>原地變換</strong>：旋轉 = 轉置 + 反轉；標記資訊可以借用第一列和第一行存，省下 O(mn) 的額外空間。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>先確認 <Code>m</Code>、<Code>n</Code> 與索引順序：<Code>grid[r][c]</Code>，0 ≤ r &lt; m，0 ≤ c &lt; n。空矩陣要特判。</>,
            <>要看鄰居時用<strong>方向陣列</strong>：<Code>for dr, dc in DIRS</Code>，算出 <Code>(nr, nc)</Code> 後做邊界檢查再處理。</>,
            <><strong>螺旋走訪</strong>：右→下→左→上各走一邊，走完一邊就把對應的邊界往內縮一格；每一輪走「左」與「上」之前要再檢查邊界沒交叉，否則單列或單行會重複。</>,
            <><strong>旋轉 90°</strong>（順時針）：對角線上方逐對 <Code>swap(a[r][c], a[c][r])</Code> 完成轉置，再把每一列反轉。逆時針則改成每一行上下反轉。</>,
            <>需要「標記某列某行」又不能開新空間時，把標記寫在<strong>第一列與第一行</strong>，但要先另外記下它們本身原本有沒有被標記。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>「螺旋走訪」逐格顯示走訪順序與四條邊界怎麼收縮；「旋轉 90°」逐步展示轉置的每一次交換，再看每一列反轉。</p>
        <MatrixDemo />
      </Section>

      <Section id="code">
        <p>從建立矩陣與方向陣列開始，接著是螺旋走訪、原地旋轉，以及用邊列邊行當標記的 Set Matrix Zeroes。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 54", name: "Spiral Matrix", diff: "Medium" },
            { src: "LeetCode 48", name: "Rotate Image", diff: "Medium" },
            { src: "LeetCode 73", name: "Set Matrix Zeroes", diff: "Medium" },
            { src: "LeetCode 36", name: "Valid Sudoku", diff: "Medium" },
            { src: "LeetCode 74", name: "Search a 2D Matrix（二維當一維二分）", diff: "Medium" },
            { src: "LeetCode 200", name: "Number of Islands（先用方向陣列 + DFS 試試）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const matrixLesson: Lesson = { prereq: "Array & Dynamic Array", Body };
