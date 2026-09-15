import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { GridDemo } from "@/components/lesson/demos/GridDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from collections import deque

DIRS = [(-1, 0), (1, 0), (0, -1), (0, 1)]    # 上、下、左、右


def island_areas(grid):
    """四方向相連的 1 是一座島。回傳每座島的面積（依掃描順序），長度就是島嶼數。"""
    m, n = len(grid), len(grid[0])
    seen = [[False] * n for _ in range(m)]
    areas = []
    for r in range(m):
        for c in range(n):
            if grid[r][c] != 1 or seen[r][c]:
                continue
            seen[r][c] = True                 # 掃到沒走過的陸地：新島的起點
            queue, area = deque([(r, c)]), 0
            while queue:
                cr, cc = queue.popleft()      # 改成 queue.pop() 就是堆疊版，面積不變
                area += 1
                for dr, dc in DIRS:
                    nr, nc = cr + dr, cc + dc
                    # 先檢查邊界：Python 的 grid[-1] 不會報錯，會悄悄取到最後一列
                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1 and not seen[nr][nc]:
                        seen[nr][nc] = True   # 放入時就標記，同一格才不會被放入兩次
                        queue.append((nr, nc))
            areas.append(area)
    return areas


def nearest_exit(floor):
    """多源 BFS：每格走到最近的出口 E 要幾步。牆 # 與走不到的格子是 -1。"""
    m, n = len(floor), len(floor[0])
    dist = [[-1] * n for _ in range(m)]
    queue = deque()
    for r in range(m):
        for c in range(n):
            if floor[r][c] == "E":
                dist[r][c] = 0                # 所有出口一開始就在佇列裡，距離 0
                queue.append((r, c))
    while queue:
        r, c = queue.popleft()
        for dr, dc in DIRS:
            nr, nc = r + dr, c + dc
            if 0 <= nr < m and 0 <= nc < n and floor[nr][nc] != "#" and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1  # 第一次被走到就是最短步數
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
    # 輸出（# 是牆；(4, 1) 被牆圍住，走不到任何出口，所以是 -1）：
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

const int DR[] = {-1, 1, 0, 0};   // 上、下、左、右
const int DC[] = {0, 0, -1, 1};

// 每座島（四方向相連的 1）的面積，依掃描順序；size() 就是島嶼數
std::vector<int> islandAreas(const std::vector<std::vector<int>>& grid) {
    int m = (int)grid.size(), n = (int)grid[0].size();
    std::vector<std::vector<bool>> seen(m, std::vector<bool>(n, false));
    std::vector<int> areas;
    for (int r = 0; r < m; r++) {
        for (int c = 0; c < n; c++) {
            if (grid[r][c] != 1 || seen[r][c]) continue;
            seen[r][c] = true;                        // 新島的起點
            std::queue<std::pair<int, int>> q;
            q.push({r, c});
            int area = 0;
            while (!q.empty()) {
                auto [cr, cc] = q.front(); q.pop();
                area++;
                for (int d = 0; d < 4; d++) {
                    int nr = cr + DR[d], nc = cc + DC[d];
                    if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;  // 先檢查邊界
                    if (grid[nr][nc] != 1 || seen[nr][nc]) continue;
                    seen[nr][nc] = true;              // 放入時就標記
                    q.push({nr, nc});
                }
            }
            areas.push_back(area);
        }
    }
    return areas;
}

// 多源 BFS：每格到最近出口 'E' 的步數，牆 '#' 與走不到的格子是 -1
std::vector<std::vector<int>> nearestExit(const std::vector<std::string>& floor) {
    int m = (int)floor.size(), n = (int)floor[0].size();
    std::vector<std::vector<int>> dist(m, std::vector<int>(n, -1));
    std::queue<std::pair<int, int>> q;
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (floor[r][c] == 'E') { dist[r][c] = 0; q.push({r, c}); }  // 所有出口同時出發
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d];
            if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
            if (floor[nr][nc] == '#' || dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;            // 第一次走到就是最短步數
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
    std::cout << "\\n";                               // 3 2 4 1 1（共 5 座島）

    std::vector<std::string> floor = {"E.#...", "..#.#.", "....#E", "##.##.", "#.#..."};
    auto dist = nearestExit(floor);
    std::cout << dist[0][3] << ' ' << dist[3][2] << ' ' << dist[4][1] << "\\n";  // 4 5 -1
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "病理切片裡數細胞核",
              problem: "一張切片掃描成 4000×3000 像素，二值化後細胞核是 1、背景是 0。醫檢系統要數出有幾個細胞核，並標出面積超過 500 像素、可能是病變的大塊。",
              why: "每個像素是節點，上下左右都是 1 就有邊，一個細胞核就是一個連通分量。逐格掃描，碰到沒走過的 1 就把整塊走完、順便累加面積。1200 萬個像素每個只進出佇列一次，而且鄰居用座標算出來，不必真的建一張 1200 萬節點的鄰接串列。",
            },
            {
              title: "海平面上升 2 公尺，哪裡會淹水",
              problem: "一份 2000×2000 格的地形高程圖，每格記錄海拔。低於 2 公尺的格子有幾十萬個，但其中有些窪地被堤防和高地圍住，海水根本進不去。",
              why: "只看海拔會把內陸窪地也算成淹水。反過來從海出發：把所有海洋格同時放進佇列，只往海拔 ≤ 2 公尺的鄰格擴散，走得到的才會淹。一次走訪 O(mn)，不必對每個低窪格各自檢查「通不通海」。",
            },
            {
              title: "賣場每一區的逃生指示牌",
              problem: "一層 200×300 格的賣場平面圖，貨架是牆，共有 6 個逃生出口。消防規定每一區的指示牌要標出走到最近出口的步數。",
              why: "對 6 個出口各跑一次 BFS 再取最小值，要走 6 趟。多源 BFS 把 6 個出口一開始全放進佇列、距離都是 0，一趟走訪就得到每格到「最近」出口的步數，等同於加一個連到所有出口的虛擬起點。",
            },
          ]}
          cue="二維網格、m × n、上下左右相鄰、有幾塊／幾座島、最大的一塊、填色、迷宮最少步數、到最近的某物的距離、從邊界往內走。"
        />
      </Section>

      <Section id="concept">
        <p>
          網格本身就是一張圖：每一格 <Code>(r, c)</Code> 是節點，上下左右相鄰、而且兩格都可以走時，中間就有一條無向邊。這些邊<strong>不需要存下來</strong>：用<strong>方向陣列</strong> <Code>DIRS = [(-1,0), (1,0), (0,-1), (0,1)]</Code> 加上座標就能即時算出鄰居，所以 BFS 與 DFS 可以原封不動搬過來，唯一的差別是「列出 u 的鄰居」從查鄰接串列換成四次邊界檢查。一個 m × n 的網格有 <Code>V = mn</Code> 個節點；全部格子都能走時邊最多，<Code>E = m(n−1) + n(m−1) &lt; 2mn</Code>。
        </p>
        <p>
          網格題大多是兩種問法。<strong>數連通區域</strong>：雙重迴圈逐格掃描，碰到還沒拜訪的可走格就 <Code>count += 1</Code>，從它出發把整塊走完並標記。這樣數出來恰好是分量個數，因為一次走訪會標記起點所在分量的<strong>每一格</strong>（相連的格子一定會被放入），也<strong>只</strong>標記那個分量（不相連的格子沒有邊可以到達）；之後掃描再碰到未拜訪的格子，它必定屬於一個還沒數過的分量。<strong>最少步數</strong>：每走一步代價都是 1，所以用 BFS，一格第一次被標記時的 <Code>dist</Code> 就是最短步數。若起點有很多個，就把它們<strong>同時</strong>以距離 0 放進佇列，這叫<strong>多源 BFS</strong>，得到的是每格到「最近」起點的距離；問「哪些格子碰不到邊界」時，也是把邊界上所有可走的格子當起點反向走一次，沒被走到的就是答案。
        </p>
        <p>
          複雜度：每格最多被標記一次、進出佇列一次，每次檢查 4 個方向，時間 <strong>O(4mn) = O(mn)</strong>，就是 O(V + E) 代入網格的結果。外層掃描本身就要看過每一格，所以數區域沒有更好的最佳情況。空間是 visited 或 <Code>dist</Code> 陣列的 <strong>O(mn)</strong>，佇列或堆疊最壞也可能同時放著 O(mn) 格。DFS 用遞迴寫時，遞迴深度等於目前路徑長，一條蛇形的陸地就能讓它深到 mn 層：1000×1000 的網格是一百萬層，Python 預設遞迴上限只有 1000，C++ 的預設堆疊通常也撐不住，大網格請用 BFS 或明確的堆疊。
        </p>
        <p>
          常見的錯：<strong>先檢查邊界再取值</strong>，Python 的 <Code>grid[-1]</Code> 不會報錯，而是取到最後一列，越界的 <Code>-1</Code> 會悄悄接到對面；<strong>放入佇列時就標記</strong>，等到取出才標記的話，同一格會被好幾個鄰居重複放入；<strong>四方向還是八方向</strong>要看題目，斜走也算一步時 <Code>DIRS</Code> 要有 8 個；直接把走過的陸地改成 0 可以省下 visited，但會破壞輸入。和 Word Search 的網格回溯不同，這裡標記之後<strong>永遠不取消</strong>，每格只走一次才有 O(mn)。格子各有不同的通過代價時改用 Dijkstra；格子會一個一個變成陸地、還要隨時回答島嶼數時，改用併查集。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>定義圖：<Code>m = len(grid)</Code>、<Code>n = len(grid[0])</Code>，決定哪些格子可以走（陸地、非牆），寫好 <Code>DIRS</Code>（四方向或八方向）。不要另外建鄰接串列。</>,
            <>準備標記：<Code>m × n</Code> 的 <Code>seen</Code> 布林陣列；需要步數就用 <Code>dist</Code> 陣列，<Code>-1</Code> 代表還沒走到。</>,
            <>走訪一塊：起點標記後放入佇列。取出 <Code>(r, c)</Code>，對每個 <Code>(dr, dc)</Code> 算出 <Code>(nr, nc)</Code>，依序檢查 <Code>0 ≤ nr &lt; m</Code>、<Code>0 ≤ nc &lt; n</Code>、可以走、還沒標記，全部通過才<strong>標記並放入</strong>。</>,
            <>數區域：雙重迴圈掃每一格，碰到還沒標記的可走格就把區域數加一，從它開始執行步驟 3，要面積就在取出時累加。</>,
            <>最少步數：單一起點直接 BFS，<Code>dist[nr][nc] = dist[r][c] + 1</Code>；多個起點（最近的出口、所有海洋格、所有邊界格）先全部以距離 0 放入佇列，再跑同一個迴圈。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>5×6 的地圖，1 是陸地、0 是水，共有 5 座島。示範逐格掃描，碰到沒走過的陸地就把整座島走完：黃色是在佇列或堆疊裡等待的格子，藍色是正在處理的格子，綠框是這一步找到、可以走的鄰居，被取出處理的格子會換成它所屬島的編號。切換「BFS（佇列）」與「DFS（堆疊）」，程式只差在從前端還是尾端取出：同一座島裡格子完成的順序不同，但最後島嶼數與每座島的格子完全一樣。</p>
        <GridDemo />
      </Section>

      <Section id="code">
        <p>兩個函式對應兩種問法：<Code>island_areas</Code> 用 BFS 數出每座島的面積（用的就是示範的地圖），<Code>nearest_exit</Code> 用多源 BFS 算每格到最近出口的步數，包含一格被牆圍住、走不到的情況。兩者共用同一段「方向陣列 + 邊界檢查 + 放入時標記」的骨架，這段寫熟了，大部分網格題只剩下「哪些格子可以走、起點是誰」要決定。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 733", name: "Flood Fill（最基本的四方向走訪）", diff: "Easy" },
            { src: "LeetCode 1020", name: "Number of Enclaves（從邊界反向走訪）", diff: "Medium" },
            { src: "LeetCode 542", name: "01 Matrix（多源 BFS）", diff: "Medium" },
            { src: "LeetCode 417", name: "Pacific Atlantic Water Flow（從兩個海岸各走一次）", diff: "Medium" },
            { src: "LeetCode 934", name: "Shortest Bridge（先標出一座島，再多源 BFS）", diff: "Medium" },
            { src: "LeetCode 827", name: "Making A Large Island（先標號記面積，再試每個 0）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const gridLesson: Lesson = { prereq: "BFS、DFS、Matrix", Body };
