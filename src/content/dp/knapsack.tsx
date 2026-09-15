import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { KnapsackDemo } from "@/components/lesson/demos/KnapsackDemo";
import type { Lesson } from "@/lib/lessons";

const python = `def knapsack_table(weights, values, cap):
    """二維表：dp[i][w] = 只考慮前 i 個物品、容量 w 時的最大價值。O(nW)"""
    n = len(weights)
    dp = [[0] * (cap + 1) for _ in range(n + 1)]   # 第 0 列：沒有物品，全是 0
    for i in range(1, n + 1):
        wt, val = weights[i - 1], values[i - 1]
        for w in range(cap + 1):
            dp[i][w] = dp[i - 1][w]                  # 不選第 i 個
            if w >= wt:                              # 放得下才考慮選
                dp[i][w] = max(dp[i][w], dp[i - 1][w - wt] + val)

    # 回溯：和上一列不同，代表第 i 個物品被選了
    chosen, w = [], cap
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            chosen.append(i - 1)
            w -= weights[i - 1]
    return dp[n][cap], chosen[::-1]


def knapsack(weights, values, cap):
    """空間壓縮：只留一列。O(W) 空間"""
    dp = [0] * (cap + 1)
    for wt, val in zip(weights, values):
        for w in range(cap, wt - 1, -1):             # 倒序：dp[w - wt] 還是上一列的值
            dp[w] = max(dp[w], dp[w - wt] + val)     # 正序會重複選同一個物品
    return dp[cap]


def min_split_diff(nums):
    """分成兩堆使總和差最小：布林背包，重量就是價值，容量是總和的一半"""
    total = sum(nums)
    half = total // 2
    can = [True] + [False] * half                    # can[s]：挑一些數能不能剛好湊出 s
    for x in nums:
        for s in range(half, x - 1, -1):             # 同樣倒序，每個數只用一次
            can[s] = can[s] or can[s - x]
    best = max(s for s in range(half + 1) if can[s])
    return total - 2 * best                          # 一堆 best，另一堆 total - best


if __name__ == "__main__":
    weights, values = [1, 3, 4, 5], [1, 4, 5, 7]     # A、B、C、D，和互動示範相同
    print(knapsack_table(weights, values, 7))  # (9, [1, 2])：選 B、C
    print(knapsack(weights, values, 7))        # 9
    print(min_split_diff([2, 7, 4, 1, 8, 1]))  # 1（11 對 12）
    print(min_split_diff([1, 5, 11, 5]))       # 0（剛好等分）`;

const cpp = `#include <algorithm>
#include <bitset>
#include <iostream>
#include <numeric>
#include <utility>
#include <vector>

// 二維表 + 回溯：回傳 (最大價值, 被選物品的索引)。O(nW) 時間與空間
std::pair<int, std::vector<int>> knapsackTable(const std::vector<int>& wt,
                                               const std::vector<int>& val, int cap) {
    int n = (int)wt.size();
    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(cap + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= cap; w++) {
            dp[i][w] = dp[i - 1][w];                                // 不選第 i 個
            if (w >= wt[i - 1])                                     // 放得下才考慮選
                dp[i][w] = std::max(dp[i][w], dp[i - 1][w - wt[i - 1]] + val[i - 1]);
        }
    }
    std::vector<int> chosen;
    for (int i = n, w = cap; i >= 1; i--) {
        if (dp[i][w] != dp[i - 1][w]) {                             // 和上一列不同：選了 i
            chosen.push_back(i - 1);
            w -= wt[i - 1];
        }
    }
    std::reverse(chosen.begin(), chosen.end());
    return {dp[n][cap], chosen};
}

// 空間壓縮：一維陣列，w 倒序。O(W) 空間
int knapsack(const std::vector<int>& wt, const std::vector<int>& val, int cap) {
    std::vector<int> dp(cap + 1, 0);
    for (int i = 0; i < (int)wt.size(); i++)
        for (int w = cap; w >= wt[i]; w--)          // 倒序：dp[w - wt[i]] 還是上一輪的值
            dp[w] = std::max(dp[w], dp[w - wt[i]] + val[i]);
    return dp[cap];
}

// 分兩堆差最小：布林背包。第 s 位是 1 代表「能湊出 s」
int minSplitDiff(const std::vector<int>& nums) {
    const int MAX_SUM = 20000;                      // 假設總和不超過 20000
    std::bitset<MAX_SUM + 1> can;
    can[0] = 1;
    for (int x : nums) can |= can << x;             // 左移 x：每個和都加上 x（右邊先算完，x 只用一次）
    int total = std::accumulate(nums.begin(), nums.end(), 0);
    for (int s = total / 2; s >= 0; s--)
        if (can[s]) return total - 2 * s;
    return total;
}

int main() {
    std::vector<int> wt = {1, 3, 4, 5}, val = {1, 4, 5, 7};    // A、B、C、D
    auto [best, chosen] = knapsackTable(wt, val, 7);
    std::cout << best << "\\n";                                 // 9
    for (int i : chosen) std::cout << i << ' ';                 // 1 2（B、C）
    std::cout << "\\n" << knapsack(wt, val, 7) << "\\n";         // 9
    std::cout << minSplitDiff({2, 7, 4, 1, 8, 1}) << "\\n";     // 1
    std::cout << minSplitDiff({1, 5, 11, 5}) << "\\n";          // 0
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "研發預算要核准哪些提案",
              problem: "年度研發預算 5,000 萬元，收到 40 個提案，每個都有所需經費（以百萬元計）和評估出的預期效益。提案只能整案核准或駁回，不能只給一半的錢。40 個提案的組合有 2⁴⁰ ≈ 1.1 兆種。",
              why: "每個提案選或不選、總經費有上限、要讓總效益最大，正是 0/1 背包。以百萬元為單位時容量只有 50，表格 41 × 51 約兩千格，一瞬間就填完。按「效益／經費比」由高到低挑看似合理，但提案不能拆開，比值最高的大案子可能卡住剩下的預算，貪婪會錯。",
            },
            {
              title: "貨車今天要載哪幾件貨",
              problem: "一台貨車載重上限 1,200 公斤，倉庫有 60 件待運的貨，各有重量和運費收入。每件要嘛整件上車、要嘛留到明天，目標是這一趟的運費收入最高。",
              why: "同樣是 0/1 背包，二維表 61 × 1,201 約 7.3 萬格。但每一列只依賴上一列，壓成一維只要 1,201 個整數。若重量要精確到公克，容量變成 120 萬：二維表要七千多萬格，一維陣列仍只要 120 萬格。這就是空間壓縮的價值，也說明了容量這個數字直接決定成本。",
            },
            {
              title: "把夜間批次工作分給兩台機器",
              problem: "18 個批次工作的執行時間加起來 460 分鐘，要分到兩台一樣快的機器上。兩台都跑完才算結束，所以要讓比較晚完成的那台越早越好，也就是兩台的總時間盡量接近 230 分鐘。",
              why: "把執行時間同時當成重量和價值，問「挑一些工作，總時間最接近但不超過 230 是多少」。這是背包的布林版本：can[s] 表示能不能剛好湊出 s，容量是總和的一半。18 × 231 格就找到最佳分法，不必試 2¹⁸ = 26 萬種分法。",
            },
          ]}
          cue="每個東西選或不選、不能拆開、總重量／預算上限、最大化總價值、湊出剛好等於 target 的和、分成兩堆差最小、容量是不大的整數。"
        />
      </Section>

      <Section id="concept">
        <p>
          n 個物品各自選或不選，組合有 2ⁿ 種，n = 40 就要列舉一兆次。貪婪也不行：互動示範裡 D 的價值重量比 7/5 = 1.4 最高，先拿 D 後只剩 2 的空間，只能再放 A，總價值 8；最佳解卻是比值較低的 B + C = 9。物品<strong>不能拆開</strong>，比值高的物品可能卡住空間，這是 0/1 背包和可以切一部分的<strong>分數背包</strong>（按比值貪婪就對）的根本差別。DP 的做法是定義狀態 <Code>dp[i][w]</Code> = 只考慮前 i 個物品、容量為 w 時的最大價值，然後對第 i 個物品只問一個問題：選還是不選。
        </p>
        <p>
          轉移式是 <Code>dp[i][w] = max(dp[i−1][w], dp[i−1][w−wᵢ] + vᵢ)</Code>，第二項只在 <Code>w ≥ wᵢ</Code> 時存在。為什麼對：看 (i, w) 的任一個最佳解，它要嘛不含物品 i，那它就是前 i−1 個物品在容量 w 下的解，而且必須是最佳的，否則換成更好的那組，(i, w) 也會變好，矛盾；要嘛含物品 i，拿掉 i 之後剩下的必定是前 i−1 個物品在容量 w−wᵢ 下的最佳解，理由相同。這就是<strong>最佳子結構</strong>。每個子集都落在這兩種情況之一，所以取 max 等於比較了全部 2ⁿ 種組合，卻只需要 (n+1)(W+1) 個不同的子問題。表只記最大價值；要知道選了誰，從 <Code>dp[n][W]</Code> 往回走，<Code>dp[i][w] ≠ dp[i−1][w]</Code> 代表這格非選物品 i 不可，記下它、容量扣掉 wᵢ，繼續往上一列。
        </p>
        <p>
          表有 (n+1)(W+1) 格，每格 O(1)，時間 <strong>O(nW)</strong>，不論輸入如何都要填滿整張表。二維表的空間也是 O(nW)，但第 i 列只讀第 i−1 列，所以只留一個長度 W+1 的陣列，並讓 <strong>w 從 W 倒著掃到 wᵢ</strong>：<Code>dp[w] = max(dp[w], dp[w−wᵢ] + vᵢ)</Code>。倒序時 <Code>dp[w−wᵢ]</Code> 在這一輪還沒被改寫，讀到的仍是上一列的值，空間降到 <strong>O(W)</strong>，代價是無法再回溯出選了哪些。要注意 O(nW) 是<strong>偽多項式</strong>：W 是輸入裡的一個數值，不是輸入的長度，W 多一位數表就大十倍，容量到 10⁹ 時這個方法完全不能用。那時如果價值總和不大，可以交換兩個維度，改成 <Code>dp[v]</Code> = 湊出總價值 v 的最小重量。
        </p>
        <p>
          最常見的錯是一維陣列用<strong>正序</strong>掃 w：<Code>dp[w−wᵢ]</Code> 已經是這一輪更新過、含有物品 i 的值，同一個物品就被放了好幾次，演算法悄悄變成下一課的<strong>完全背包</strong>。第二個是初始化：問「容量不超過 W 的最大價值」時全部初始化為 0；問「剛好裝滿 W」時只有 <Code>dp[0] = 0</Code>，其餘設成 −∞ 表示湊不出來。同一張表換掉合併方式就是其他題型：<Code>max</Code> 換成 <Code>or</Code> 是「能不能湊出和 s」的子集和問題，換成加法並令 <Code>dp[0] = 1</Code> 是「有幾種選法」。和 1-D DP 的 House Robber 相比，背包的狀態多了「剩餘容量」這一維，這是描述有限資源時最常用的狀態設計。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認題型：每個物品<strong>最多選一次</strong>、有一個<strong>整數容量</strong> W、目標是最大化總價值（或判斷湊不湊得出、數有幾種選法）。物品可以無限次選就是完全背包。</>,
            <>定義 <Code>dp[i][w]</Code> = 前 i 個物品、容量 w 時的最大價值。base case：第 0 列全是 0（要求剛好裝滿時只有 <Code>dp[0][0] = 0</Code>，其餘 −∞）。</>,
            <>外層 i 從 1 到 n，內層 w 從 0 到 W：先令 <Code>dp[i][w] = dp[i−1][w]</Code>（不選）；若 <Code>w ≥ wᵢ</Code>，再和 <Code>dp[i−1][w−wᵢ] + vᵢ</Code>（選）取大的。</>,
            <>答案是 <Code>dp[n][W]</Code>。要列出選了哪些，從 <Code>(n, W)</Code> 往上走：<Code>dp[i][w] ≠ dp[i−1][w]</Code> 就記下物品 i 並令 <Code>w −= wᵢ</Code>，否則 w 不變，直到第 0 列。</>,
            <>只需要最大價值時做空間壓縮：一維 <Code>dp</Code> 長度 W+1，外層物品，內層 w 從 W <strong>倒序</strong>到 wᵢ，<Code>dp[w] = max(dp[w], dp[w−wᵢ] + vᵢ)</Code>。</>,
            <>換題型只改合併方式和初始化：可行性用 <Code>or</Code> 且 <Code>can[0] = True</Code>，計數用加法且 <Code>ways[0] = 1</Code>，迴圈結構完全不變。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>四個物品 A（重 1、值 1）、B（重 3、值 4）、C（重 4、值 5）、D（重 5、值 7），容量 7。一格一格填 <Code>dp[i][w]</Code>：藍色是正在填的格子，黃色是「不選」的來源 <Code>dp[i−1][w]</Code>，綠色是「選」的來源 <Code>dp[i−1][w−wᵢ]</Code>。填完後從右下角往上回溯，綠色路徑標出走過的格子，物品列裡綠色是選了、刪除線是沒選。留意最後一格 <Code>dp[4][7]</Code>：比值最高的 D 選了只有 8，不選反而保住 B + C = 9。</p>
        <KnapsackDemo />
      </Section>

      <Section id="code">
        <p>三個函式：二維表加回溯（能列出選了哪些物品）、一維倒序的空間壓縮版（只要最大價值時的標準寫法），以及「分成兩堆差最小」的布林背包。二維版好理解也能回溯，一維版是實際寫題時最常用的。C++ 的布林背包用 <Code>std::bitset</Code>，<Code>{"can |= can << x"}</Code> 一行就完成一整輪掃描，而且一次處理 64 個位元。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 416", name: "Partition Equal Subset Sum（布林背包，容量是總和一半）", diff: "Medium" },
            { src: "LeetCode 1049", name: "Last Stone Weight II（其實是分兩堆差最小）", diff: "Medium" },
            { src: "LeetCode 494", name: "Target Sum（轉成子集和計數）", diff: "Medium" },
            { src: "LeetCode 2915", name: "Length of the Longest Subsequence That Sums to Target（剛好裝滿，初始化 −∞）", diff: "Medium" },
            { src: "LeetCode 474", name: "Ones and Zeroes（兩種容量的背包）", diff: "Medium" },
            { src: "LeetCode 879", name: "Profitable Schemes（計數加上利潤下限）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const knapsackLesson: Lesson = { prereq: "Memoization & Tabulation、1-D DP", Body };
