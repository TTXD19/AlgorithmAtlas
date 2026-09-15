import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { LisDemo } from "@/components/lesson/demos/LisDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from bisect import bisect_left


def lis_dp(nums):
    """O(n²)：dp[i] = 以 nums[i] 結尾的 LIS 長度，順便還原一條 LIS"""
    n = len(nums)
    if n == 0:
        return []
    dp = [1] * n
    prev = [-1] * n                          # prev[i]：nums[i] 接在哪個索引後面
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
                prev[i] = j
    k = max(range(n), key=dp.__getitem__)    # 答案是 dp 的最大值，不一定是 dp[-1]
    seq = []
    while k != -1:
        seq.append(nums[k])
        k = prev[k]
    return seq[::-1]


def lis_length(nums):
    """O(n log n)：tails[k] = 長度 k+1 的遞增子序列中最小的結尾"""
    tails = []
    for x in nums:
        pos = bisect_left(tails, x)          # 第一個 >= x；非遞減改用 bisect_right
        if pos == len(tails):
            tails.append(x)                  # 比所有結尾都大：LIS 變長
        else:
            tails[pos] = x                   # 同樣長度，結尾換成更小的
    return len(tails)


def lis_sequence(nums):
    """O(n log n) 並還原序列：tails 改存索引，另記每個元素的前驅"""
    tails = []                               # tails[k]：長度 k+1 的最小結尾在 nums 的索引
    parent = [-1] * len(nums)
    for i, x in enumerate(nums):
        pos = bisect_left(tails, x, key=lambda t: nums[t])  # key 參數需 Python 3.10+
        if pos > 0:
            parent[i] = tails[pos - 1]       # 接在長度 pos 的最小結尾後面
        if pos == len(tails):
            tails.append(i)
        else:
            tails[pos] = i
    seq, k = [], tails[-1] if tails else -1
    while k != -1:
        seq.append(nums[k])
        k = parent[k]
    return seq[::-1]


def max_envelopes(envelopes):
    """俄羅斯套娃信封：寬遞增、同寬時高遞減，再對高求 LIS"""
    order = sorted(envelopes, key=lambda e: (e[0], -e[1]))
    return lis_length([h for _, h in order])


if __name__ == "__main__":
    prices = [3, 1, 4, 1, 5, 9, 2, 6]
    print(lis_dp(prices))          # [3, 4, 5, 9]
    print(lis_length(prices))      # 4
    print(lis_sequence(prices))    # [1, 4, 5, 6]（另一條同樣長的 LIS）
    print(max_envelopes([[5, 4], [6, 4], [6, 7], [2, 3]]))  # 3
    shelf = [4, 2, 5, 1, 3, 6]     # 書架上的索書號
    print(len(shelf) - lis_length(shelf))  # 3（最少搬 3 本）`;

const cpp = `#include <algorithm>
#include <iostream>
#include <vector>

// O(n²)：dp[i] = 以 nums[i] 結尾的 LIS 長度
int lisDp(const std::vector<int>& nums) {
    int n = (int)nums.size(), best = 0;
    std::vector<int> dp(n, 1);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i]) dp[i] = std::max(dp[i], dp[j] + 1);
        best = std::max(best, dp[i]);          // 答案是最大值，不一定是 dp[n-1]
    }
    return best;
}

// O(n log n)：tails[k] = 長度 k+1 的遞增子序列中最小的結尾
int lengthOfLIS(const std::vector<int>& nums) {
    std::vector<int> tails;
    for (int x : nums) {
        auto it = std::lower_bound(tails.begin(), tails.end(), x);  // 非遞減改 upper_bound
        if (it == tails.end()) tails.push_back(x);  // 比所有結尾都大：LIS 變長
        else *it = x;                               // 同樣長度，結尾換成更小的
    }
    return (int)tails.size();
}

// O(n log n) 並還原一條 LIS：tails 存索引，parent 記前驅
std::vector<int> lisSequence(const std::vector<int>& nums) {
    int n = (int)nums.size();
    std::vector<int> tails, parent(n, -1);
    for (int i = 0; i < n; i++) {
        auto it = std::lower_bound(tails.begin(), tails.end(), nums[i],
                                   [&](int t, int x) { return nums[t] < x; });
        int pos = (int)(it - tails.begin());
        if (pos > 0) parent[i] = tails[pos - 1];
        if (it == tails.end()) tails.push_back(i);
        else *it = i;
    }
    std::vector<int> seq;
    for (int k = tails.empty() ? -1 : tails.back(); k != -1; k = parent[k]) seq.push_back(nums[k]);
    std::reverse(seq.begin(), seq.end());
    return seq;
}

// 俄羅斯套娃信封：寬遞增、同寬時高遞減，再對高求 LIS
int maxEnvelopes(std::vector<std::vector<int>> env) {
    std::sort(env.begin(), env.end(), [](const auto& a, const auto& b) {
        return a[0] != b[0] ? a[0] < b[0] : a[1] > b[1];
    });
    std::vector<int> h;
    for (const auto& e : env) h.push_back(e[1]);
    return lengthOfLIS(h);
}

int main() {
    std::vector<int> prices = {3, 1, 4, 1, 5, 9, 2, 6};
    std::cout << lisDp(prices) << "\\n";        // 4
    std::cout << lengthOfLIS(prices) << "\\n";  // 4
    for (int v : lisSequence(prices)) std::cout << v << ' ';  // 1 4 5 6
    std::cout << "\\n" << maxEnvelopes({{5, 4}, {6, 4}, {6, 7}, {2, 3}}) << "\\n";  // 3
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "股價趨勢：挑出最長的一路上漲",
              problem: "想衡量一檔股票十年（約 2,500 個交易日）的上漲趨勢有多強：從收盤價裡挑出若干天，價格必須一天比一天高，中間的日子可以跳過，最多能挑幾天？全市場 1,800 檔股票每天收盤後都要重算。",
              why: "「可以跳過」代表要的是子序列而不是連續區段，這就是 LIS。O(n²) 的 DP 每檔要比約 300 萬次，全市場超過 50 億次；換成 tails 加二分搜尋，每檔約 2,500 × 12 次比較，全市場幾千萬次就算完。",
            },
            {
              title: "倉儲紙箱套疊：最多能套幾層",
              problem: "倉庫有 3,000 個尺寸各異的紙箱，一個箱子要放進另一個，長和寬都必須嚴格比較小（不能旋轉）。想把最多的箱子一層套一層收起來。",
              why: "兩個維度都要遞增，先依長遞增排序，長相同時寬「遞減」，再對寬求 LIS。遞減那一步讓同樣長的箱子不可能同時被選進一條遞增序列，二維問題就退化成一維，O(n log n) 解決。這就是 Russian Doll Envelopes。",
            },
            {
              title: "書架整理：最少搬動幾本",
              problem: "圖書館一排書架上有 1,200 本書，索書號順序被打亂了。每次可以抽出一本插到任何位置，最少要搬幾本才能排好？",
              why: "沒被搬動的書，彼此的相對順序本來就得是對的，也就是一條遞增子序列；其他的書各搬一次就能插回正確位置。留下的越多、搬的越少，所以答案是 n − LIS。「最少刪除或移動幾個才會有序」的題目幾乎都是這個轉換。",
            },
          ]}
          cue="子序列（可以不連續）、一路遞增、最長鏈、一個套一個、兩個維度都要更大、最少刪除或搬動幾個才有序、n 到 10⁵ 需要 O(n log n)。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>最長遞增子序列</strong>（LIS）：從陣列挑出若干元素，保持原本的先後順序且嚴格遞增，最多能挑幾個。子序列可以不連續，這是它和「最長連續遞增子陣列」的差別，後者掃一遍就好。直覺的狀態是 <Code>dp[i]</Code> = <strong>以 nums[i] 結尾</strong>的 LIS 長度。一定要「以它結尾」，因為要把 <Code>nums[i]</Code> 接到某條子序列後面，得知道那條子序列的最後一個值比它小。轉移式是 <Code>dp[i] = 1 + max(dp[j])</Code>，其中 <Code>j &lt; i</Code> 且 <Code>nums[j] &lt; nums[i]</Code>，找不到這樣的 j 就是 1。LIS 可能在任何位置結束，所以答案是 <Code>max(dp)</Code>，不是最後一格。
        </p>
        <p>
          <strong>tails 版本</strong>換一個狀態：<Code>tails[k]</Code> = 所有長度為 <Code>k+1</Code> 的遞增子序列中<strong>最小的結尾值</strong>。同樣長度的子序列，結尾越小，之後越容易接上新元素，所以每個長度只要記最好的那一個。關鍵不變量是 <strong>tails 嚴格遞增</strong>：若 <Code>tails[k] ≥ tails[k+1]</Code>，取結尾為 <Code>tails[k+1]</Code> 的那條長度 k+2 子序列，它的第 k+1 個元素比 <Code>tails[k+1]</Code> 小，也就比 <Code>tails[k]</Code> 小，和「<Code>tails[k]</Code> 是最小結尾」矛盾。既然有序，處理新元素 <Code>x</Code> 時用 <strong>lower_bound</strong> 找第一個 <Code>≥ x</Code> 的位置 <Code>pos</Code>：<Code>tails[pos-1] &lt; x</Code>，x 能接在長度 pos 的子序列後面，形成長度 pos+1、結尾是 x 的子序列；又因為 <Code>x ≤ tails[pos]</Code>，把 <Code>tails[pos]</Code> 換成 x 只會更好，其他格都不受影響。<Code>pos</Code> 等於 tails 長度時就 append，LIS 變長一格。這個做法也叫<strong>耐心排序</strong>（patience sorting），tails 的每一格就是一疊牌最上面那張。
        </p>
        <p>
          複雜度：O(n²) 版本不論資料長怎樣，內層迴圈都要把前面看完，最好、最壞都是 <strong>Θ(n²)</strong>，空間 <strong>O(n)</strong>。tails 版本每個元素做一次二分搜尋，tails 的長度最多是 LIS 長度 L，所以是 <strong>O(n log L)</strong>：完全遞減的資料 L = 1，接近 O(n)；完全遞增時 L = n，就是最壞的 <strong>O(n log n)</strong>。空間是 tails 的 O(L)，要還原序列再加一個 O(n) 的 <Code>parent</Code> 陣列，合計 <strong>O(n)</strong>。n = 10⁵ 時 n² 是 10¹⁰，只有 n log n（約 1.7 × 10⁶）跑得動。
        </p>
        <p>
          常見的坑：<strong>tails 不是 LIS 本身</strong>，它的每一格可能來自不同的子序列，只有長度是對的，要序列就改存索引並記下每個元素接在誰後面。<strong>嚴格或非嚴格</strong>：嚴格遞增用 <Code>lower_bound</Code>（<Code>bisect_left</Code>），允許相等的非遞減用 <Code>upper_bound</Code>（<Code>bisect_right</Code>），用錯時重複元素會被多算或少算。<strong>二維</strong>要先排序，第一維相同時第二維遞減，否則同寬的信封會被當成能互套。要<strong>計數</strong>（有幾條 LIS）時 tails 做不到，得回到 O(n²) DP 另外記 <Code>count[i]</Code>。和相鄰課程比：<strong>1-D DP</strong> 的狀態只依賴前一兩項，LIS 的 <Code>dp[i]</Code> 依賴前面所有項，才會是 O(n²)；<strong>LCS</strong> 是兩個序列的 O(mn) 二維表，LIS 其實等於「nums 和排序去重後的 nums 的 LCS」，反過來當其中一個序列元素互不重複時，LCS 也能轉成 LIS 做到 O(n log n)。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認要的是<strong>子序列</strong>（可跳過）還是連續子陣列、<strong>嚴格遞增</strong>還是允許相等。若是二維（信封、箱子），先依第一維遞增、同值時第二維遞減排序，只留第二維。</>,
            <>n 在幾千以內或需要計數：<Code>dp = [1] * n</Code>，對每個 i 掃所有 <Code>j &lt; i</Code>，<Code>nums[j] &lt; nums[i]</Code> 時 <Code>dp[i] = max(dp[i], dp[j] + 1)</Code>，答案取 <Code>max(dp)</Code>。</>,
            <>要 O(n log n)：開一個空的 <Code>tails</Code>，對每個 <Code>x</Code> 求 <Code>pos = lower_bound(tails, x)</Code>（非遞減改用 upper_bound）。</>,
            <><Code>pos == len(tails)</Code> 就 append，否則 <Code>tails[pos] = x</Code>。全部處理完，<Code>len(tails)</Code> 就是 LIS 長度。</>,
            <>需要序列本身：tails 改存索引，處理第 i 個元素時記 <Code>parent[i] = tails[pos-1]</Code>（pos 為 0 時是 −1），最後從 tails 的最後一格沿 parent 往回走，再反轉。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>八天的股價 <Code>[3, 1, 4, 1, 5, 9, 2, 6]</Code>，兩個模式跑同一份資料。「O(n²) DP 表」逐格填 <Code>dp[i]</Code>：藍色是目前的 i，綠色是比它小、可以接在後面的 j，黃色是其中 dp 最大的那個；注意 i = 3 的 1 接不到前面的 1，因為要嚴格遞增。最後一步用綠色標出沿前驅回溯得到的 3 → 4 → 5 → 9。「O(n log n) tails」每個元素先二分搜尋（黃色是找到的位置，黃色虛線 + 代表接在尾端），再取代或 append（藍色）。看最後一步：tails 是 [1, 2, 5, 6]，長度 4 是對的，但「來自」的索引 3、6、4、7 並不遞增，它不是一條真正的子序列。</p>
        <LisDemo />
      </Section>

      <Section id="code">
        <p>四個函式：O(n²) DP（Python 版順便用 <Code>prev</Code> 還原序列，C++ 版只回傳長度）、只求長度的 tails 版、存索引加 <Code>parent</Code> 還原序列的 O(n log n) 版，以及用排序把俄羅斯套娃信封降成一維 LIS。兩種做法都放，是因為 O(n²) 版好理解、能延伸到計數，tails 版才應付得了大資料。範例用的就是互動示範的八天股價，兩個版本還原出的 LIS 不同但一樣長。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 300", name: "Longest Increasing Subsequence（兩種做法都寫一次）", diff: "Medium" },
            { src: "LeetCode 334", name: "Increasing Triplet Subsequence（長度只到 3 的 tails）", diff: "Medium" },
            { src: "LeetCode 673", name: "Number of Longest Increasing Subsequence（O(n²) DP 加計數）", diff: "Medium" },
            { src: "LeetCode 354", name: "Russian Doll Envelopes（排序降成一維）", diff: "Hard" },
            { src: "LeetCode 1964", name: "Find the Longest Valid Obstacle Course at Each Position（非遞減用 upper_bound）", diff: "Hard" },
            { src: "LeetCode 1713", name: "Minimum Operations to Make a Subsequence（LCS 轉 LIS）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const lisLesson: Lesson = { prereq: "1-D DP、Binary Search", Body };
