import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { UnboundedDemo } from "@/components/lesson/demos/UnboundedDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 完全背包：每種物品數量不限。dp[w] = 容量不超過 w 時的最大價值
# 0/1 背包唯一的差別：內層改成 range(cap, wt - 1, -1) 倒序
def unbounded_knapsack(weights, values, cap):
    dp = [0] * (cap + 1)
    for wt, val in zip(weights, values):       # 外層：物品
        for w in range(wt, cap + 1):           # 內層正序：dp[w - wt] 可能已經拿過這個物品
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[cap]


# 最少硬幣數（LeetCode 322）：要剛好湊滿，湊不出來的金額設成 ∞
def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != INF else -1


# 組合數（LeetCode 518）：外層硬幣、內層金額，1+2 和 2+1 只算一種
def count_combinations(coins, amount):
    dp = [1] + [0] * amount                    # 湊出 0 元有一種方法：什麼都不拿
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]


# 排列數（LeetCode 377）：內外迴圈對調，1+2 和 2+1 算兩種
def count_permutations(nums, target):
    dp = [1] + [0] * target
    for a in range(1, target + 1):             # 外層：金額
        for x in nums:                         # 內層：最後一步放哪一個
            if x <= a:
                dp[a] += dp[a - x]
    return dp[target]


if __name__ == "__main__":
    # 10 公尺的料，切成 3、4、5 公尺各賣 260、340、420 元
    print(unbounded_knapsack([3, 4, 5], [260, 340, 420], 10))  # 860（3 + 3 + 4）
    print(coin_change([1, 2, 5], 11))          # 3（5 + 5 + 1）
    print(coin_change([7, 10, 25], 63))        # 6（25 + 10 + 7 × 4）
    print(coin_change([5, 10], 3))             # -1
    print(count_combinations([6, 10, 24], 120))  # 16
    print(count_permutations([6, 10, 24], 120))  # 39614`;

const cpp = `#include <vector>
#include <algorithm>
#include <climits>
#include <iostream>

// 完全背包：最大價值。和 0/1 背包只差內層迴圈的方向
int unboundedKnapsack(const std::vector<int>& wt, const std::vector<int>& val, int cap) {
    std::vector<int> dp(cap + 1, 0);
    for (std::size_t i = 0; i < wt.size(); i++)
        for (int w = wt[i]; w <= cap; w++)            // 正序：同一個物品可以再拿
            dp[w] = std::max(dp[w], dp[w - wt[i]] + val[i]);
    return dp[cap];
}

// 最少硬幣數：INF 取 INT_MAX / 2，加 1 不會溢位
int coinChange(const std::vector<int>& coins, int amount) {
    const int INF = INT_MAX / 2;
    std::vector<int> dp(amount + 1, INF);
    dp[0] = 0;
    for (int c : coins)
        for (int a = c; a <= amount; a++)
            dp[a] = std::min(dp[a], dp[a - c] + 1);
    return dp[amount] >= INF ? -1 : dp[amount];
}

// 方法數的中間值可能遠超過最後答案，用 unsigned 讓溢位合法地回繞
// 只做加法，所以只要最後答案放得進 64 位元，結果就是對的
unsigned long long countCombinations(const std::vector<int>& coins, int amount) {
    std::vector<unsigned long long> dp(amount + 1, 0);
    dp[0] = 1;
    for (int c : coins)                               // 外層硬幣：組合數
        for (int a = c; a <= amount; a++)
            dp[a] += dp[a - c];
    return dp[amount];
}

unsigned long long countPermutations(const std::vector<int>& nums, int target) {
    std::vector<unsigned long long> dp(target + 1, 0);
    dp[0] = 1;
    for (int a = 1; a <= target; a++)                 // 外層金額：排列數
        for (int x : nums)
            if (x <= a) dp[a] += dp[a - x];
    return dp[target];
}

int main() {
    std::cout << unboundedKnapsack({3, 4, 5}, {260, 340, 420}, 10) << "\\n";  // 860
    std::cout << coinChange({1, 2, 5}, 11) << "\\n";                          // 3
    std::cout << coinChange({7, 10, 25}, 63) << "\\n";                        // 6
    std::cout << coinChange({5, 10}, 3) << "\\n";                             // -1
    std::cout << countCombinations({6, 10, 24}, 120) << "\\n";                // 16
    std::cout << countPermutations({6, 10, 24}, 120) << "\\n";                // 39614
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "型材切割：一根料怎麼切最賺",
              problem: "一根 10 公尺的鋁擠型料，客戶收購 3、4、5 公尺三種長度，分別 260、340、420 元，每種要多少都收。按每公尺單價最高的 3 公尺一直切，切三段賣 780 元，還剩 1 公尺廢料。",
              why: "長度是重量、售價是價值、料長是背包容量，而每種長度可以切任意多段，這就是完全背包。dp[w] 記住「w 公尺最多賣多少」，算出 3 + 3 + 4 賣 860 元。按單價貪婪會留下湊不滿的零頭，DP 把每種長度的每一種剩餘都比過。",
            },
            {
              title: "郵資剛好貼滿：最少幾張郵票",
              problem: "包裹郵資 63 元，櫃台只剩 7、10、25 元三種郵票，數量不限。先貼大面額：25、25、10 之後剩 3 元，沒有郵票補得了，貪婪直接卡死。",
              why: "要求「剛好湊滿」而且「張數最少」，是完全背包的最小值版本，也就是 Coin Change。dp[a] 是湊出 a 元的最少張數，湊不出來的金額設成 ∞，算出 25 + 10 + 7×4 共 6 張。幣值沒有倍數結構時貪婪靠不住，DP 對任何幣值都正確。",
            },
            {
              title: "出貨裝箱：剛好裝滿有幾種裝法",
              problem: "一筆訂單 120 罐飲料，紙箱有 6 入、10 入、24 入三種，箱子不限量，每箱都要裝滿。業務想知道總共有幾種「各用幾箱」的組合可以選。",
              why: "這是完全背包的計數版本：dp[a] += dp[a − 箱型]，答案 16 種。關鍵在迴圈順序：外層箱型、內層罐數，同一組箱子只會算一次；兩層寫反就變成「箱子的先後順序不同也算不同」，算出 39614，這是最常見的錯。",
            },
          ]}
          cue="每種物品無限供應、可以重複選、湊出某個總額、最少個數、最多價值、有幾種組合、找零、切割、Coin Change。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>0/1 背包</strong>每個物品只有選或不選；<strong>完全背包</strong>每種物品可以拿任意多件。最直接的想法是對每種物品列舉拿幾件：<Code>dp[i][w] = max(dp[i−1][w − k·wᵢ] + k·vᵢ)</Code>，k 從 0 到 <Code>⌊w / wᵢ⌋</Code>，多了一層迴圈。關鍵觀察是「拿 k 件」等於「先拿 k−1 件，再拿一件」，而拿完一件之後<strong>第 i 種物品還能繼續拿</strong>，所以轉移式可以寫成 <Code>dp[i][w] = max(dp[i−1][w], dp[i][w−wᵢ] + vᵢ)</Code>。和 0/1 背包比，唯一的差別是「拿」那一項用的是 <Code>dp[i]</Code> 而不是 <Code>dp[i−1]</Code>。
        </p>
        <p>
          壓成一維陣列時，這個差別就變成<strong>內層迴圈的方向</strong>。外層跑物品、內層 <Code>w</Code> 由小到大：算 <Code>dp[w]</Code> 時，<Code>dp[w−wᵢ]</Code> 在這一輪已經更新過，代表的正是 <Code>dp[i][w−wᵢ]</Code>，裡面可能已經放了物品 i，再加一件就是重複使用。為什麼正確：對 w 做歸納，容量 w 的最佳解要嘛完全不用物品 i（就是這一輪還沒改之前的舊值），要嘛至少用一件；拿掉其中一件，剩下的一定是容量 <Code>w−wᵢ</Code> 在同樣物品下的最佳解，而那一格比 w 小，已經算好了。0/1 背包倒序掃，是為了讓 <Code>dp[w−wᵢ]</Code> 保持上一輪的舊值，避免同一件被拿兩次。
        </p>
        <p>
          複雜度：n 種物品、容量 W，每種物品掃一遍 W，時間 <strong>O(nW)</strong>，一維陣列空間 <strong>O(W)</strong>，沒有好壞情況之分。求最少個數、求方法數只換掉轉移裡的運算，複雜度不變。要注意這是<strong>偽多項式</strong>：時間跟 W 的數值成正比，不是跟輸入的位元數成正比，W 是 10⁹ 時連陣列都開不出來。要還原選了哪些物品，多開一個 <Code>O(W)</Code> 陣列記下每一格是由哪個物品轉移來的。
        </p>
        <p>
          三個常見錯誤。第一是<strong>初值</strong>：容量「不超過 W」求最大價值，全部設 0；「剛好湊滿」求最少個數，<Code>dp[0] = 0</Code>、其餘設 ∞，否則湊不出來的金額會被當成 0；求方法數則 <Code>dp[0] = 1</Code>。第二是<strong>計數時的迴圈順序</strong>：外層物品、內層金額算的是<strong>組合數</strong>（LeetCode 518），因為每種物品只在自己那一輪被考慮，順序被固定了；外層金額、內層物品算的是<strong>排列數</strong>（LeetCode 377）。求最大值或最小值時兩種順序答案一樣，只有計數會不同。第三是 C++ 的<strong>溢位</strong>：方法數的中間值可能遠大於最後答案。和 <strong>Coin Change (Greedy)</strong> 那一課的關係是：貪婪只在標準幣制下正確，完全背包是任何幣值都對的一般解；每種物品有數量上限的<strong>多重背包</strong>，則把數量拆成 1、2、4、… 件一包加上剩下的零頭，轉回 0/1 背包。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認題型：每種物品<strong>可以重複使用</strong>，要湊出或不超過某個總量 W。定義 <Code>dp[w]</Code> 為總量 w 時的最佳值或方法數。</>,
            <>依目標設初值：不超過 W 求最大價值，全部 0；剛好湊滿求最少個數，<Code>dp[0] = 0</Code>、其餘 ∞；求方法數，<Code>dp[0] = 1</Code>、其餘 0。</>,
            <>外層跑物品，內層 w 從 <Code>wᵢ</Code> <strong>由小到大</strong>跑到 W：最大價值用 <Code>dp[w] = max(dp[w], dp[w−wᵢ] + vᵢ)</Code>，最少個數用 <Code>min(dp[w], dp[w−wᵢ] + 1)</Code>，方法數用 <Code>dp[w] += dp[w−wᵢ]</Code>。</>,
            <>若題目要的是<strong>排列數</strong>（順序不同算不同），把兩層對調：外層 w 從 1 到 W，內層跑物品，<Code>wᵢ ≤ w</Code> 才轉移。</>,
            <>答案在 <Code>dp[W]</Code>。剛好湊滿的版本若 <Code>dp[W]</Code> 仍是 ∞，代表湊不出來，回傳 −1。C++ 計數時改用 <Code>unsigned long long</Code>。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>硬幣 <Code>[1, 2, 5]</Code>、金額 11，求最少硬幣數。「完全背包（正序）」每種硬幣一輪、金額由小到大掃；「0/1 背包（倒序）」用同一條轉移式，只把金額改成由大到小，等於每種硬幣只有一枚。藍色是正在填的格子，灰色的 ∞ 是還湊不出來的金額，來源格 <Code>dp[w−coin]</Code> 若是綠色代表還是上一輪的值，黃色代表這一輪剛更新過，也就是同一種硬幣被再用了一次。留意正序模式裡黃色出現的地方，以及兩個模式最後 <Code>dp[11]</Code> 一個是 3、一個是 ∞。</p>
        <UnboundedDemo />
      </Section>

      <Section id="code">
        <p>最大價值的完全背包，加上兩個最常考的變形：最少硬幣數，以及方法數的組合版與排列版。組合與排列放在一起，是為了看清楚兩層迴圈對調之後算的是不同的東西。C++ 的計數版本用 <Code>unsigned long long</Code>，處理中間值溢位。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 322", name: "Coin Change（最少個數，初值設 ∞）", diff: "Medium" },
            { src: "LeetCode 518", name: "Coin Change II（組合數，外層硬幣）", diff: "Medium" },
            { src: "LeetCode 279", name: "Perfect Squares（物品是 1、4、9、…）", diff: "Medium" },
            { src: "LeetCode 377", name: "Combination Sum IV（排列數，迴圈對調）", diff: "Medium" },
            { src: "LeetCode 139", name: "Word Break（字可以重複用，順序有關）", diff: "Medium" },
            { src: "LeetCode 1449", name: "Form Largest Integer With Digits That Add up to Target（剛好湊滿，再比位數）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const unboundedLesson: Lesson = { prereq: "0/1 Knapsack、Memoization & Tabulation", Body };
