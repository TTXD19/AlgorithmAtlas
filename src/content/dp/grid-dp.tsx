import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { GridDpDemo } from "@/components/lesson/demos/GridDpDemo";
import type { Lesson } from "@/lib/lessons";

const python = `def unique_paths(m, n, blocked=frozenset()):
    """m×n 網格從左上走到右下、只能往右或往下的路徑數；blocked 是障礙格"""
    dp = [0] * n                     # 只留一列：更新前 dp[c] 是上面，dp[c-1] 已經是左邊
    dp[0] = 1
    for r in range(m):
        for c in range(n):
            if (r, c) in blocked:
                dp[c] = 0                # 障礙格走不到
            elif c > 0:
                dp[c] += dp[c - 1]       # 上面的路數 + 左邊的路數
    return dp[-1]


def min_path_sum(grid):
    """回傳 (最小成本, 路徑)。要還原路徑，所以保留整張表"""
    R, C = len(grid), len(grid[0])
    dp = [[0] * C for _ in range(R)]
    for r in range(R):
        for c in range(C):
            if r == 0 and c == 0:
                best = 0
            elif r == 0:
                best = dp[r][c - 1]      # 第一列只能從左邊來
            elif c == 0:
                best = dp[r - 1][c]      # 第一行只能從上面來
            else:
                best = min(dp[r - 1][c], dp[r][c - 1])
            dp[r][c] = best + grid[r][c]
    path, r, c = [], R - 1, C - 1
    while (r, c) != (0, 0):              # 從終點往回選較小的來源
        path.append((r, c))
        if c == 0 or (r > 0 and dp[r - 1][c] <= dp[r][c - 1]):
            r -= 1
        else:
            c -= 1
    return dp[-1][-1], [(0, 0)] + path[::-1]


def min_seam(energy):
    """影像接縫：每列選一個像素，下一列只能選正下方或左右斜下方，總能量最小"""
    prev = energy[0][:]
    for row in energy[1:]:
        prev = [row[c] + min(prev[max(c - 1, 0):c + 2]) for c in range(len(row))]
    return min(prev)


if __name__ == "__main__":
    print(unique_paths(4, 4), unique_paths(3, 3, {(1, 1)}), unique_paths(20, 20))   # 20 2 35345263800
    grid = [[1, 3, 1, 2], [1, 5, 1, 3], [4, 2, 1, 1], [2, 1, 3, 1]]   # 和互動示範同一張
    print(min_path_sum(grid))
    # (9, [(0, 0), (0, 1), (0, 2), (1, 2), (2, 2), (2, 3), (3, 3)])
    print(min_seam([[3, 1, 4, 2], [5, 9, 2, 6], [5, 3, 5, 8], [9, 7, 1, 3]]))   # 7（1 → 2 → 3 → 1）`;

const cpp = `#include <algorithm>
#include <iostream>
#include <vector>

// Unique Paths II：1 是障礙。路徑數可能很大，用 long long
long long uniquePathsWithObstacles(const std::vector<std::vector<int>>& g) {
    int n = (int)g[0].size();
    std::vector<long long> dp(n, 0);
    dp[0] = 1;
    for (const auto& row : g)
        for (int c = 0; c < n; c++) {
            if (row[c] == 1) dp[c] = 0;             // 障礙格歸零
            else if (c > 0) dp[c] += dp[c - 1];     // 上面（舊值）+ 左邊（新值）
        }
    return dp[n - 1];
}

// Minimum Path Sum：一維滾動，只要最小成本不要路徑
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

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "倉儲機器人有幾條路可以走",
              problem: "倉庫地板是 20×20 的格子，搬運機器人從入口（左上）到出貨區（右下），為了不和其他機器人對撞，規定只能往東或往南走，有些格子放著貨架不能進。系統要知道路線有多少種，好評估塞車時還有沒有替代路線。",
              why: "沒有貨架時答案是組合數 C(38, 19) ≈ 353 億，但只要有一格擋住，公式就不能用了。每一格的路數等於「從上面來的路數 + 從左邊來的路數」，貨架格直接歸零，逐列填完 400 格就有答案，障礙怎麼擺都一樣。",
            },
            {
              title: "影像接縫裁切：把照片變窄而不壓扁主角",
              problem: "一張 1920×1080 的風景照要裁成 1720 寬放進版面，直接縮放會把人物壓扁，直接切邊又會切掉重要的東西。",
              why: "接縫裁切每次移除一條「能量最低」的垂直接縫：從上到下每列選一個像素，下一列只能選正下方或左右斜下方。dp[r][c] 是走到這個像素的最低累計能量，只依賴上一列的三格，一條接縫只要掃一遍 1920×1080 的表，重複 200 次就少了 200 欄，而天空、草地這些平淡的地方先被移除。",
            },
            {
              title: "無人機的最低風險航線",
              problem: "巡檢無人機把轄區切成網格，每格依照風速、禁航區距離算出風險分數。任務規定只能往東或往北推進，要找一條從起點到終點總風險最低的航線。",
              why: "這就是 Minimum Path Sum：每格的最低累計風險是「上一格與左一格較小的那個」加上本格風險。填完表之後從終點往回，每次走向較小的來源，就還原出整條航線，時間與格子數成正比。",
            },
          ]}
          cue="網格、只能往右或往下（移動方向不會繞回來）、路徑數、最小路徑和、障礙格、每一格只依賴上面和左邊、滾動一列省空間。"
        />
      </Section>

      <Section id="concept">
        <p>
          當網格上只能<strong>往右或往下</strong>移動，路徑永遠不會繞回走過的格子，整張網格就是一張有向無環圖，而「逐列由上到下、每列由左到右」正好是它的一個拓撲順序。定義 <Code>dp[r][c]</Code> 為「從左上角走到 (r, c)」的答案，填到 (r, c) 時，它唯一可能的兩個來源，上面 <Code>(r−1, c)</Code> 與左邊 <Code>(r, c−1)</Code>，都已經算好。
        </p>
        <p>
          轉移式只看<strong>最後一步</strong>從哪裡來。<strong>計數</strong>（Unique Paths）：走進 (r, c) 的路，最後一步不是從上面就是從左邊，兩類互不重疊又涵蓋全部，所以 <Code>dp[r][c] = dp[r−1][c] + dp[r][c−1]</Code>，這是加法原理；障礙格沒有任何路能停在上面，設為 0。<strong>最小成本</strong>（Minimum Path Sum）：最便宜的路徑在最後一步之前的那一段，也必須是到那一格最便宜的路徑，否則換成更便宜的就能更好，所以 <Code>dp[r][c] = min(dp[r−1][c], dp[r][c−1]) + grid[r][c]</Code>。第一列只能從左邊來、第一行只能從上面來，要單獨處理。
        </p>
        <p>
          複雜度是每格 O(1)，<strong>O(mn)</strong> 時間。每一列只依賴上一列，所以可以只留<strong>一列</strong>：由左到右掃，更新 <Code>dp[c]</Code> 之前它還是上一列的值（上面），<Code>dp[c−1]</Code> 則已經是這一列的新值（左邊），空間降到 <strong>O(n)</strong>，如果行比列多可以轉 90 度，用較短的那一邊。要還原路徑就得保留整張表，從終點往回每次走向較小的來源。沒有障礙時 Unique Paths 有公式 <Code>C(m+n−2, m−1)</Code>，這張表其實就是轉了 45 度的巴斯卡三角形；但一有障礙，公式就失效，DP 照樣成立。
        </p>
        <p>
          常見的坑：允許<strong>往上或往左</strong>之後路徑會繞圈，網格不再是 DAG，「最小路徑」就變成最短路徑問題，要用 BFS 或 Dijkstra（Grid as Graph 那篇）；滾動一列時掃描方向必須由左到右，否則 <Code>dp[c−1]</Code> 還是舊值；起點本身是障礙時答案是 0；路徑數成長很快，20×20 就超過 32 位元。變形：只能從下一列三個相鄰格走來就是接縫裁切與 Minimum Falling Path Sum；Dungeon Game 要求「沿途生命值不能掉到 0」，得從終點<strong>反著</strong>填；兩個人同時走（Cherry Pickup）則要把兩人的位置一起放進狀態。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認移動方向不會繞回來（只能右、下，或只能從上一列來），於是逐列由左到右填就是合法順序。</>,
            <>定義 <Code>dp[r][c]</Code> 為走到 (r, c) 的答案；起點 <Code>dp[0][0]</Code> 設為 1（計數）或 <Code>grid[0][0]</Code>（成本）。</>,
            <>第一列只看左邊、第一行只看上面；其他格計數用 <Code>上 + 左</Code>，最小成本用 <Code>min(上, 左) + grid[r][c]</Code>，障礙格設 0 或 ∞。</>,
            <>答案在 <Code>dp[m−1][n−1]</Code>。要路徑就從終點往回，每次走向 dp 值較小的來源，最後反轉。</>,
            <>只要答案時滾動一列：<Code>dp[c] = f(dp[c], dp[c−1])</Code>，更新前的 <Code>dp[c]</Code> 是上面、<Code>dp[c−1]</Code> 是左邊。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>同一張 4×4 網格，兩種模式。「Min Path Sum」：格子右下角的小字是走進這一格的成本，藍色是正在填的格子，黃色是它選用的來源，也就是上面與左邊較小的那一個；填完後綠色標出從終點往回找到的最便宜路徑，總成本 9。「Unique Paths」：黃色同時標出上面和左邊兩格，因為兩邊的路數要相加，邊上的格子都是 1，右下角是 20，正好等於 C(6, 3)。</p>
        <GridDpDemo />
      </Section>

      <Section id="code">
        <p>Python 放滾動一列的路徑計數（可加障礙）、保留整張表並還原路徑的最小路徑和，以及每列從三格轉移而來的接縫裁切。C++ 放 LeetCode 63 與 64 的一維寫法，並用 20×20 的空網格驗證答案確實是 C(38, 19)，需要 64 位元整數。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 62", name: "Unique Paths（先寫二維表，再改成一列）", diff: "Medium" },
            { src: "LeetCode 63", name: "Unique Paths II（障礙格歸零）", diff: "Medium" },
            { src: "LeetCode 64", name: "Minimum Path Sum", diff: "Medium" },
            { src: "LeetCode 931", name: "Minimum Falling Path Sum（從上一列的三格轉移，就是接縫裁切）", diff: "Medium" },
            { src: "LeetCode 221", name: "Maximal Square（dp 是以這格為右下角的最大正方形邊長）", diff: "Medium" },
            { src: "LeetCode 174", name: "Dungeon Game（從終點反著填）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const gridDpLesson: Lesson = { prereq: "1-D DP、Matrix", Body };
