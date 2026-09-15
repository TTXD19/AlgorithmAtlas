import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { IntervalDpDemo } from "@/components/lesson/demos/IntervalDpDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from functools import lru_cache


def max_coins(nums):
    """Burst Balloons：兩端補 1，dp[i][j] = 把開區間 (i, j) 內的氣球全部戳破的最大分數"""
    a = [1] + nums + [1]
    n = len(a)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n):                    # 區間長度由短到長，用到的子區間一定先算好
        for i in range(n - length):
            j = i + length
            dp[i][j] = max(dp[i][k] + dp[k][j] + a[i] * a[k] * a[j]   # k 是最後戳破的那顆
                           for k in range(i + 1, j))
    return dp[0][n - 1]


def matrix_chain(dims):
    """第 i 個矩陣是 dims[i-1] × dims[i]。回傳 (最少純量乘法次數, 最佳括號方式)"""
    n = len(dims) - 1
    cost = [[0] * (n + 1) for _ in range(n + 1)]
    split = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            cost[i][j] = float("inf")
            for k in range(i, j):                 # 最後一次乘法把 A_i..A_k 和 A_k+1..A_j 接起來
                c = cost[i][k] + cost[k + 1][j] + dims[i - 1] * dims[k] * dims[j]
                if c < cost[i][j]:
                    cost[i][j], split[i][j] = c, k

    def paren(i, j):                              # 沿著記下的分割點還原括號
        k = split[i][j]
        return f"A{i}" if i == j else f"({paren(i, k)}{paren(k + 1, j)})"

    return cost[1][n], paren(1, n)


def longest_palindrome_subseq(s):
    """同樣的區間狀態寫成記憶化：參數就是區間的兩端"""
    @lru_cache(maxsize=None)
    def go(i, j):
        if i > j:
            return 0
        if i == j:
            return 1
        if s[i] == s[j]:
            return go(i + 1, j - 1) + 2           # 兩端相同，都收進回文
        return max(go(i + 1, j), go(i, j - 1))    # 否則丟掉其中一端
    return go(0, len(s) - 1)


if __name__ == "__main__":
    print(max_coins([3, 1, 5, 8]))                # 167（和互動示範相同）
    print(matrix_chain([10, 30, 5, 60]))          # (4500, '((A1A2)A3)')，另一種括號要 27000
    print(longest_palindrome_subseq("character")) # 5（例如 carac）`;

const cpp = `#include <algorithm>
#include <climits>
#include <iostream>
#include <vector>

// Burst Balloons：區間長度由短到長
int maxCoins(std::vector<int> nums) {
    nums.insert(nums.begin(), 1);
    nums.push_back(1);                               // 兩端補 1
    int n = (int)nums.size();
    std::vector<std::vector<int>> dp(n, std::vector<int>(n, 0));
    for (int len = 2; len < n; len++)
        for (int i = 0; i + len < n; i++) {
            int j = i + len;
            for (int k = i + 1; k < j; k++)          // k 是 (i, j) 裡最後戳破的
                dp[i][j] = std::max(dp[i][j], dp[i][k] + dp[k][j] + nums[i] * nums[k] * nums[j]);
        }
    return dp[0][n - 1];
}

// 相鄰石堆合併：每次把相鄰兩堆合成一堆，成本是兩堆的總和
long long mergeAdjacentPiles(const std::vector<int>& piles) {
    int n = (int)piles.size();
    std::vector<long long> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + piles[i];
    std::vector<std::vector<long long>> dp(n, std::vector<long long>(n, 0));
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = LLONG_MAX;
            for (int k = i; k < j; k++)              // 最後一次合併：[i..k] 和 [k+1..j]
                dp[i][j] = std::min(dp[i][j], dp[i][k] + dp[k + 1][j]);
            dp[i][j] += pre[j + 1] - pre[i];         // 不論怎麼切，最後一次都要付整段總和
        }
    return dp[0][n - 1];
}

int main() {
    std::cout << maxCoins({3, 1, 5, 8}) << '\\n';                 // 167
    std::cout << mergeAdjacentPiles({4, 1, 1, 4}) << ' '
              << mergeAdjacentPiles({3, 5, 1, 2, 6}) << '\\n';     // 18 37
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "一串矩陣先乘哪兩個",
              problem: "數值計算裡要算 A·B·C，A 是 10×30、B 是 30×5、C 是 5×60。矩陣乘法有結合律，先算 (AB)C 或 A(BC) 結果一樣，但計算量天差地遠；實際的模型裡這樣的矩陣有十幾個。",
              why: "(AB)C 要 10·30·5 + 10·5·60 = 4,500 次純量乘法，A(BC) 要 27,000 次，差了六倍。一段連續矩陣的最佳成本，由「最後一次乘法切在哪裡」決定：左邊一段、右邊一段各自最佳，再加上把兩個結果相乘的成本。枚舉切點、由短區間算到長區間，十幾個矩陣瞬間算完。",
            },
            {
              title: "日誌系統合併相鄰的小檔案",
              problem: "日誌服務每小時產生一個檔案，一天 24 個大小不一。為了減少小檔案，要把它們合併成一個大檔，每次只能合併時間上相鄰的兩個（才能保持時間順序），合併的成本是兩個檔案的大小總和。",
              why: "如果任兩個都能合併，每次挑最小的兩個就是 Huffman 的貪婪法；但「只能合併相鄰的」讓貪婪失效。區間 [i, j] 的最後一次合併，一定是把 [i, k] 和 [k+1, j] 兩個已經合好的檔案接起來，成本是整段大小總和，所以 dp[i][j] = min over k 的 dp[i][k] + dp[k+1][j] + 區間總和。",
            },
            {
              title: "RNA 會怎麼摺疊",
              problem: "一條 RNA 由 A、U、G、C 組成，A 會和 U 配對、G 會和 C 配對，而且配對的連線不能交叉。生物學家想預測一條幾百個鹼基的 RNA 最多能形成幾對，當作穩定結構的第一步估計。",
              why: "看區間 [i, j] 的第 j 個鹼基：它不配對，答案就是 [i, j−1]；它和中間某個 k 配對，因為連線不能交叉，就把問題切成 [i, k−1] 和 [k+1, j−1] 兩段各自獨立。這是 Nussinov 演算法，一個 O(n³) 的區間 DP。",
            },
          ]}
          cue="一段連續的東西、合併相鄰的兩段、最後一步切在哪裡、括號化、戳氣球、回文、三角剖分、dp[i][j] 看一個區間、依區間長度由短到長。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>區間 DP</strong> 的狀態是一段連續的區間：<Code>dp[i][j]</Code> 是只考慮第 i 到第 j 個元素時的最佳答案。它適用於「整段的答案，可以拆成左右兩段的答案再合起來」的問題，而拆法就是<strong>枚舉分割點 k</strong>：<Code>dp[i][j] = best over k of (dp[i][k] ⊕ dp[k+1][j] + 合併這兩段的成本)</Code>。長度為 1 的區間通常是 base case，答案在 <Code>dp[0][n−1]</Code>。
        </p>
        <p>
          關鍵是替每個區間挑一個讓左右兩邊<strong>互不影響</strong>的「決定」。以戳氣球為例，戳破一顆氣球得到「左鄰 × 自己 × 右鄰」分，鄰居會隨著戳破的順序改變。若枚舉「第一顆戳哪一顆」，戳完之後左右兩邊的氣球變成彼此的鄰居，子問題不獨立；改成枚舉「<strong>最後</strong>戳哪一顆 k」，在 (i, j) 裡 k 之前被戳破的都在它左邊或右邊，戳 k 的時候它的鄰居一定正好是 i 和 j，左右兩段完全獨立：<Code>dp[i][j] = max(dp[i][k] + dp[k][j] + a[i]·a[k]·a[j])</Code>。每一種戳法都有唯一的「最後一顆」，所以枚舉 k 不會漏掉任何方案。
        </p>
        <p>
          填表順序很重要：<Code>dp[i][j]</Code> 用到的都是比它<strong>短</strong>的區間，所以外層迴圈跑區間長度、由短到長，內層枚舉起點 i；另一種寫法是 i 由大到小、j 由小到大。狀態有 O(n²) 個、每個枚舉 O(n) 個分割點，總共 <strong>O(n³)</strong> 時間、<strong>O(n²)</strong> 空間，大約 n ≤ 500 時可行。部分問題（例如最佳二元搜尋樹、滿足四邊形不等式的合併）可以用 Knuth 優化限制 k 的範圍，降到 O(n²)。
        </p>
        <p>
          常見的坑：用「i 從小到大、j 從小到大」的雙迴圈直接填，<Code>dp[k+1][j]</Code> 還沒算就被拿去用；區間的開閉搞混，戳氣球用開區間 (i, j) 並在兩端補 1，矩陣鏈乘用閉區間 [i, j]，兩種寫法的邊界和 k 的範圍都不同；忘了合併成本要看<strong>整段</strong>，例如相鄰合併的成本是區間總和，要先建前綴和才能 O(1) 取得。和其他課程的關係：任兩堆都能合併時，貪婪的 Huffman Coding 就是最佳解，限制只能合併相鄰的，才需要區間 DP；最長回文子序列也可以看成字串和自己反轉的 LCS，但直接用區間狀態寫更自然，而且記憶化的遞迴版本和表格版是同一回事。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>定義 <Code>dp[i][j]</Code> 為區間的最佳答案，決定用開區間還是閉區間，需要時在兩端補上哨兵（戳氣球補 1）。</>,
            <>填好 base case：長度 1（閉區間）或相鄰兩端之間沒有元素（開區間）的區間。</>,
            <>外層 <Code>length</Code> 由小到大，內層枚舉起點 <Code>i</Code>，算出 <Code>j</Code>。</>,
            <>枚舉分割點或「最後一步」k，<Code>dp[i][j] = best(dp[i][k] ⊕ dp[k+1][j] + 合併成本)</Code>；要還原方案就記下最佳的 k。區間總和這類成本先用前綴和備好。</>,
            <>答案在 <Code>dp[0][n−1]</Code>，沿著記下的 k 遞迴，就能還原括號方式或操作順序。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>戳氣球 nums = [3, 1, 5, 8]，兩端補 1 變成 [1, 3, 1, 5, 8, 1]。表格裡的 dp[i][j] 是「把 i 和 j 之間的氣球全部戳破」的最大分數，依區間長度由短到長填。每一步假設某顆氣球 k 是這個區間裡最後被戳破的：上方的氣球列中藍色是 k，黃色是區間兩端，也就是戳 k 時的左右鄰居，灰色是在它之前已經被子問題戳掉的；表格裡藍色是正在填的格子，黃色是它用到的兩個子區間，格子右下角的小字記下選中的 k。最後 dp[0][5] = 167。</p>
        <IntervalDpDemo />
      </Section>

      <Section id="code">
        <p>Python 放戳氣球、會還原括號方式的矩陣鏈乘，以及用記憶化遞迴寫的最長回文子序列，對照同一個區間狀態的兩種寫法。C++ 放戳氣球與「相鄰石堆合併」：後者的合併成本是整段總和，示範怎麼用前綴和在 O(1) 取得。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 516", name: "Longest Palindromic Subsequence（兩端相同就收進去）", diff: "Medium" },
            { src: "LeetCode 877", name: "Stone Game（區間上的兩人博弈）", diff: "Medium" },
            { src: "LeetCode 1039", name: "Minimum Score Triangulation of Polygon（枚舉和兩端點組成三角形的頂點）", diff: "Medium" },
            { src: "LeetCode 312", name: "Burst Balloons（枚舉最後戳的那一顆）", diff: "Hard" },
            { src: "LeetCode 1547", name: "Minimum Cost to Cut a Stick（切點排序後就是區間 DP）", diff: "Hard" },
            { src: "LeetCode 1000", name: "Minimum Cost to Merge Stones（每次合併 K 堆，狀態多一維）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const intervalDpLesson: Lesson = { prereq: "Memoization & Tabulation、1-D DP", Body };
