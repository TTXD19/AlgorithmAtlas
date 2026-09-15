import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { BitmaskDpDemo } from "@/components/lesson/demos/BitmaskDpDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from math import inf


def tsp(dist):
    """從 0 出發、每個城市恰好一次、回到 0 的最短距離與路線。O(2ⁿ·n²)"""
    n = len(dist)
    FULL = 1 << n
    dp = [[inf] * n for _ in range(FULL)]         # dp[mask][j]：走過 mask、目前停在 j 的最小成本
    parent = [[-1] * n for _ in range(FULL)]
    dp[1][0] = 0                                  # 只走過 0，站在 0
    for mask in range(FULL):                      # 由小到大：加入城市只會讓整數變大
        if not mask & 1:
            continue                              # 一定從 0 出發
        for j in range(n):
            if dp[mask][j] == inf:
                continue
            for nxt in range(n):                  # 往外推：從 (mask, j) 走到還沒去過的 nxt
                if mask >> nxt & 1:
                    continue
                new = mask | 1 << nxt
                if dp[mask][j] + dist[j][nxt] < dp[new][nxt]:
                    dp[new][nxt] = dp[mask][j] + dist[j][nxt]
                    parent[new][nxt] = j
    last = min(range(1, n), key=lambda j: dp[FULL - 1][j] + dist[j][0]) if n > 1 else 0
    best = dp[FULL - 1][last] + dist[last][0]
    route, mask, j = [], FULL - 1, last
    while j != -1:                                # 沿 parent 往回走，每走一步把 j 從 mask 拿掉
        route.append(j)
        mask, j = mask ^ (1 << j), parent[mask][j]
    return best, route[::-1] + [0]


def min_assignment(cost):
    """cost[i][j]：第 i 個人做第 j 份工作。依序替第 0、1、2… 人挑工作，mask 是已被挑走的工作"""
    n = len(cost)
    dp = [inf] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        i = bin(mask).count("1")                  # 已經分配了幾個人，下一個就是第 i 個
        if i == n:
            continue
        for j in range(n):
            if not mask >> j & 1:
                dp[mask | 1 << j] = min(dp[mask | 1 << j], dp[mask] + cost[i][j])
    return dp[(1 << n) - 1]


if __name__ == "__main__":
    dist = [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]   # 和互動示範相同
    print(tsp(dist))                              # (80, [0, 2, 3, 1, 0])
    print(min_assignment([[9, 2, 7, 8], [6, 4, 3, 7], [5, 8, 1, 8], [7, 6, 9, 4]]))   # 13（2 + 6 + 1 + 4）`;

const cpp = `#include <algorithm>
#include <climits>
#include <iostream>
#include <vector>

// TSP 的「拉進來」寫法（和互動示範相同）：dp[mask][j] 由 dp[mask 去掉 j][上一站] 算出
int tsp(const std::vector<std::vector<int>>& d) {
    int n = (int)d.size(), FULL = 1 << n;
    const int INF = INT_MAX / 2;                          // 兩個 INF 相加也不會溢位
    std::vector<std::vector<int>> dp(FULL, std::vector<int>(n, INF));
    dp[1][0] = 0;
    for (int mask = 1; mask < FULL; mask += 2)            // 只看含城市 0 的 mask（最低位是 1）
        for (int j = 1; j < n; j++) {
            if (!(mask & (1 << j))) continue;             // 位元運算一定加括號
            int sub = mask ^ (1 << j);
            for (int p = 0; p < n; p++)
                if ((sub & (1 << p)) && dp[sub][p] < INF)
                    dp[mask][j] = std::min(dp[mask][j], dp[sub][p] + d[p][j]);
        }
    int best = n == 1 ? 0 : INF;
    for (int j = 1; j < n; j++) best = std::min(best, dp[FULL - 1][j] + d[j][0]);
    return best;
}

// 最少要雇幾個人，才能讓 need 裡的每一天都有人上班（每人可上的天是一個位元集合）
int minCover(const std::vector<int>& canWork, int need) {
    std::vector<int> dp(need + 1, INT_MAX);               // dp[covered]：蓋住 covered 這些天最少幾人
    dp[0] = 0;
    for (int covered = 0; covered <= need; covered++) {
        if (dp[covered] == INT_MAX || (covered & ~need)) continue;
        for (int days : canWork) {
            int next = (covered | days) & need;           // 多雇這個人之後蓋住的天
            dp[next] = std::min(dp[next], dp[covered] + 1);
        }
    }
    return dp[need] == INT_MAX ? -1 : dp[need];
}

int main() {
    std::vector<std::vector<int>> d = {{0, 10, 15, 20}, {10, 0, 35, 25}, {15, 35, 0, 30}, {20, 25, 30, 0}};
    std::cout << tsp(d) << '\\n';                          // 80
    // 一週 7 天（第 0 位是週一）。四位工讀生各自可上的天
    std::vector<int> canWork = {0b0001111, 0b1110000, 0b0101010, 0b1001100};
    std::cout << minCover(canWork, 0b1111111) << '\\n';    // 2（第 0 人 + 第 1 人）
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "外送員一趟送 12 個點",
              problem: "外送平台替一位外送員排一趟 12 個地點的配送順序，最後回到店裡，距離矩陣已經由地圖服務算好。暴力列出所有順序是 12! ≈ 4.8 億種，每次派單都要在一秒內回應。",
              why: "決定「接下來去哪」時，重要的只有「哪些點已經送過」和「現在停在哪裡」，至於前面是用什麼順序送的都不影響之後的最短距離。把送過的點存成一個 12 位元的整數 mask，狀態只有 2¹² × 12 = 49,152 個，每個狀態試 12 個下一站，約 59 萬次運算。這是 Held–Karp 演算法。",
            },
            {
              title: "5 位工程師分配 5 個專案",
              problem: "每位工程師對每個專案估了不同的工時，一人負責一個專案，主管想讓總工時最少。全部分法有 5! = 120 種，團隊變成 16 人時就有 2×10¹³ 種。",
              why: "依序替第 0、1、2… 位工程師挑專案，已經被挑走的專案存成 mask，而下一位是第幾個人剛好就是 mask 裡 1 的個數，所以狀態只需要 mask 本身。16 人只有 65,536 個狀態、每個試 16 個專案，約 100 萬次運算。人數再大就改用匈牙利演算法。",
            },
            {
              title: "排班：每天都要有人上班，最少雇幾個人",
              problem: "咖啡店一週 7 天都要有工讀生，應徵的 30 個人各自只能上某幾天。老闆想用最少的人讓每一天都有人顧店。",
              why: "7 天的出勤狀況只有 2⁷ = 128 種「目前哪些天已經有人」。從空集合開始，每多雇一個人就把他能上的天 OR 進去，dp[covered] 記住蓋住這些天最少要幾人，128 個狀態 × 30 個人就算完，比從 30 人裡挑組合快得多。",
            },
          ]}
          cue="n ≤ 20、每個元素用過沒用過、走訪所有點一次（TSP）、指派、覆蓋所有條件、狀態是一個集合、dp[mask]、dp[mask][最後一個]、2ⁿ 個狀態。"
        />
      </Section>

      <Section id="concept">
        <p>
          有些問題的後續決策取決於「<strong>哪些東西已經用過</strong>」，而不只是用了幾個：TSP 要知道哪些城市去過，指派問題要知道哪些工作被挑走了。這個「集合」本身就是狀態。元素少的時候，把集合編碼成一個 n 位元整數 <Code>mask</Code>，第 i 位是 1 代表第 i 個元素在集合裡，2ⁿ 個集合就對應到 0 到 2ⁿ − 1 的整數，可以直接當陣列索引，這就是 <strong>Bitmask DP</strong>。加入元素是 <Code>{"mask | (1 << i)"}</Code>，檢查是 <Code>{"mask >> i & 1"}</Code>，全都是 O(1) 的位元運算（Subset Enumeration 那篇的工具）。
        </p>
        <p>
          以 TSP 為例，<Code>dp[mask][j]</Code> 是「從 0 出發、恰好走過 mask 裡的城市、最後停在 j」的最小成本。為什麼一定要記 j：之後還要走多遠，取決於現在人在哪裡，只記 mask 不夠。但只要 mask 和 j 相同，前面怎麼走到這裡都不影響後面，所以兩條到達同一狀態的路徑只需要留比較短的那條，這就是最佳子結構。轉移是 <Code>{"dp[mask | (1 << k)][k] = min(dp[mask][j] + d[j][k])"}</Code>，k 是還沒去過的城市；全部走完後再加上回到 0 的距離取最小。填表順序：加入元素只會讓整數變大，所以 <strong>mask 由小到大</strong>掃一遍就保證用到的狀態都已算好。
        </p>
        <p>
          複雜度：TSP 有 2ⁿ·n 個狀態、每個試 n 個下一站，<strong>O(2ⁿ·n²)</strong> 時間、<strong>O(2ⁿ·n)</strong> 空間。n = 16 時約 1.7×10⁷ 次運算，n = 20 時約 4.2×10⁸ 次、表格要 2²⁰×20 個整數（80 MB），差不多是極限。指派問題因為「下一個是第幾個人」可以從 mask 裡 1 的個數算出來，狀態只要 mask，<strong>O(2ⁿ·n)</strong>。對照暴力：n = 20 時排列有 20! ≈ 2.4×10¹⁸ 種，所以 Bitmask DP 把「階乘」降成「指數乘多項式」，但仍是指數時間，TSP 本身是 NP-hard，n 再大就只能用近似或啟發式方法。
        </p>
        <p>
          常見的坑：C++ 的比較運算子比 <Code>&amp;</Code> 先算，<Code>{"mask & 1 << j == 0"}</Code> 其實是 <Code>{"mask & ((1 << j) == 0)"}</Code>，位元運算一律加括號；起點限制沒有處理，TSP 不從 0 出發會算出多餘的狀態甚至錯的答案；INF 相加溢位；n 超過 20 還硬開 2ⁿ 的表，記憶體先爆。狀態可以用「推出去」（從 dp[mask] 更新更大的 mask）或「拉進來」（dp[mask] 由拿掉一個元素的子集合算出）兩種方向寫，兩者等價。當轉移需要「把 mask 拆成兩個子集合」時，就要列舉子集合，對所有 mask 加總是 3ⁿ；Shortest Path Visiting All Nodes 則是在 (mask, 節點) 的狀態圖上做 BFS，同一個狀態設計、換成圖論的解法。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認規模很小（n ≤ 20 左右），而且後續決策取決於「哪些元素已經用過」。</>,
            <>定義狀態：<Code>dp[mask]</Code>，或需要知道最後一個元素時用 <Code>dp[mask][j]</Code>；第 i 位代表第 i 個元素。</>,
            <>設 base case，例如 TSP 的 <Code>dp[1][0] = 0</Code>（只走過起點 0），指派問題的 <Code>dp[0] = 0</Code>。</>,
            <>mask 由小到大，對每個可行狀態嘗試加入一個還沒用過的元素 k，用 <Code>{"mask | (1 << k)"}</Code> 更新下一個狀態，需要還原方案時記下 parent。</>,
            <>答案在全集 <Code>(1 &lt;&lt; n) − 1</Code>；TSP 要再加上回到起點的邊取最小，沿 parent 往回走就是路線。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>4 個城市的完整距離圖，從城市 0 出發、每個城市走一次再回到 0。右邊的表格列出含起點的 8 個 mask，每一格 dp[mask][j] 是走過 mask、停在 j 的最小成本，mask 由小到大逐格填。填一格時會一一檢查每個可能的上一站：表格裡藍色是正在填的狀態，黃色是它參考的 dp[mask 去掉 j][上一站]；左邊的圖同步把目前位置標藍、上一站標黃、mask 裡已經走過的城市標綠，藍色的邊是這次考慮的那一段路。全部走完後加上回到 0 的距離，最短是 80，路線 0 → 2 → 3 → 1 → 0，最後一步也說明了 n 變大時為什麼 DP 比暴力列排列好。</p>
        <BitmaskDpDemo />
      </Section>

      <Section id="code">
        <p>Python 放「往外推」寫法的 TSP（含路線還原），以及只需要 mask、不必記最後位置的指派問題。C++ 放和互動示範相同的「拉進來」寫法的 TSP，以及排班的最少人數覆蓋：狀態是「已經有人的天」，每雇一個人就把他能上的天 OR 進去。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 526", name: "Beautiful Arrangement（mask 是用過的數字，下一個位置是 popcount）", diff: "Medium" },
            { src: "LeetCode 1986", name: "Minimum Number of Work Sessions to Finish the Tasks（mask 是做完的工作）", diff: "Medium" },
            { src: "LeetCode 698", name: "Partition to K Equal Sum Subsets（dp[mask] 記目前這一桶裝了多少）", diff: "Medium" },
            { src: "LeetCode 1879", name: "Minimum XOR Sum of Two Arrays（就是指派問題）", diff: "Hard" },
            { src: "LeetCode 847", name: "Shortest Path Visiting All Nodes（在 (mask, 節點) 上做 BFS）", diff: "Hard" },
            { src: "LeetCode 943", name: "Find the Shortest Superstring（重疊長度當距離的 TSP）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const bitmaskDpLesson: Lesson = { prereq: "Subset Enumeration、Memoization & Tabulation", Body };
