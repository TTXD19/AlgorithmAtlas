import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { CoinChangeDemo } from "@/components/lesson/demos/CoinChangeDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 貪婪找零：面額由大到小，每種盡量多拿
def coin_change_greedy(coins, amount):
    coins = sorted(coins, reverse=True)
    result = []
    for c in coins:
        count, amount = divmod(amount, c)      # 這種面額最多拿幾枚，剩多少
        result += [c] * count
    return result if amount == 0 else None    # 剩下不是 0 代表湊不出來


# DP 找零（LeetCode 322）：任何幣值都對，O(amount × 面額數)
def coin_change_dp(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount                 # dp[a] = 湊出 a 元最少幾枚
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] != INF else -1


# 判斷一組幣值是不是「標準幣制」（貪婪永遠正確）
# Kozen 與 Zaks 證明：若貪婪會錯，最小的反例一定小於最大兩個面額之和
def is_canonical(coins):
    coins = sorted(coins)
    limit = coins[-1] + coins[-2]
    for amount in range(1, limit):
        g = coin_change_greedy(coins, amount)
        if g is None or len(g) != coin_change_dp(coins, amount):
            return False
    return True


if __name__ == "__main__":
    print(coin_change_greedy([1, 5, 10, 50], 63))   # [50, 10, 1, 1, 1]
    print(coin_change_greedy([1, 3, 4], 6))          # [4, 1, 1]，但最佳是 [3, 3]
    print(coin_change_dp([1, 3, 4], 6))              # 2
    print(is_canonical([1, 5, 10, 50]), is_canonical([1, 3, 4]))   # True False`;

const cpp = `#include <vector>
#include <algorithm>
#include <climits>
#include <cstdio>

// 貪婪找零：回傳硬幣列表，湊不出來回傳空
std::vector<int> coinChangeGreedy(std::vector<int> coins, int amount) {
    std::sort(coins.rbegin(), coins.rend());      // 由大到小
    std::vector<int> result;
    for (int c : coins) {
        int cnt = amount / c;                     // 這種面額最多拿幾枚
        amount %= c;
        result.insert(result.end(), cnt, c);
    }
    if (amount != 0) result.clear();
    return result;
}

// DP 找零：任何幣值都對
int coinChangeDP(const std::vector<int>& coins, int amount) {
    const int INF = INT_MAX / 2;
    std::vector<int> dp(amount + 1, INF);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins)
            if (c <= a) dp[a] = std::min(dp[a], dp[a - c] + 1);
    return dp[amount] >= INF ? -1 : dp[amount];
}

// 幣值是不是標準幣制：只要檢查到最大兩個面額之和
bool isCanonical(std::vector<int> coins) {
    std::sort(coins.begin(), coins.end());
    int limit = coins.back() + coins[coins.size() - 2];
    for (int a = 1; a < limit; a++) {
        auto g = coinChangeGreedy(coins, a);
        if (g.empty() || (int)g.size() != coinChangeDP(coins, a)) return false;
    }
    return true;
}

int main() {
    printf("%d\\n", (int)coinChangeGreedy({1, 5, 10, 50}, 63).size());                    // 5
    printf("%d %d\\n", (int)coinChangeGreedy({1, 3, 4}, 6).size(), coinChangeDP({1, 3, 4}, 6));   // 3 2
    printf("%d %d\\n", isCanonical({1, 5, 10, 50}), isCanonical({1, 3, 4}));               // 1 0
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "收銀機找零",
              problem: "客人付了 100 元買 37 元的東西，要找 63 元。收銀員不會列舉所有組合，而是從最大的面額開始拿：50、10、1、1、1，五個硬幣。這個做法在台幣、美金、歐元上都對。",
              why: "這正是貪婪：每次拿不超過剩餘金額的最大面額。它對，是因為這些幣制設計成「大面額是小面額的整數倍或接近整數倍」，拿大的永遠不會比拿小的差。這一課先確認它為什麼對，再看它什麼時候會錯。",
            },
            {
              title: "自動販賣機的硬幣槽",
              problem: "某台販賣機只裝了 1、3、4 元三種硬幣。要找 6 元，貪婪會給 4+1+1 三枚，但其實 3+3 兩枚就夠。硬幣槽會提早用光。",
              why: "同一個貪婪演算法，換一組幣值就錯了。這是貪婪法最重要的教訓：正確性來自輸入的結構，不是來自演算法本身。判斷幣值能不能貪，有一個明確的檢查方法。",
            },
            {
              title: "任意幣值的最少硬幣數",
              problem: "面試題給你任意面額陣列和金額，問最少幾枚。看起來像找零，但幣值沒有保證，貪婪會在某些測資上錯。",
              why: "這時候要用 DP：dp[a] 是湊出 a 元最少幾枚，對每個面額 c 試 dp[a − c] + 1。貪婪是 DP 的特例，當幣制是標準幣制時，DP 每一步的最佳轉移剛好就是「拿最大的」。",
            },
          ]}
          cue="找零、最少硬幣、面額由大到小、標準幣制、貪婪會錯就轉 DP。"
        />
      </Section>

      <Section id="concept">
        <p>
          找零的<strong>貪婪解</strong>只有一個規則：面額由大到小，每一種都拿到剩餘金額不夠為止。實作是一個迴圈，每種面額做一次整數除法和取餘數，<strong>O(k)</strong>，k 是面額種類數。它不看其他組合，所以快到幾乎沒有成本。
        </p>
        <p>
          它在 <Code>[1, 5, 10, 50]</Code> 這類幣制上是對的，直覺理由是：任何最佳解裡，小面額硬幣的數量都有上限（1 元最多 4 枚、5 元最多 1 枚、10 元最多 4 枚），超過上限就能換成更少枚的大面額。這些上限加起來湊不到下一個大面額，所以只要剩餘金額夠大，最佳解一定含有那個大面額，貪婪拿它不會錯。這就是交換論證：把最佳解裡「幾枚小的」換成「一枚大的」，枚數只會更少。
        </p>
        <p>
          <Code>[1, 3, 4]</Code> 找 6 元時貪婪錯了：拿 4 之後剩 2，只能用兩個 1，共三枚，但 3+3 只要兩枚。交換論證在這裡失敗，因為兩枚 3 元不能換成一枚更大的。這種幣制叫<strong>非標準幣制</strong>。判斷一組幣值是不是標準幣制，Kozen 與 Zaks 證明<strong>最小的反例一定小於最大兩個面額之和</strong>，所以只要在那個範圍內把貪婪和 DP 比一遍就能確定，不需要無窮檢查。
        </p>
        <p>
          貪婪錯的時候，正確解是 <strong>DP</strong>：<Code>dp[a] = min(dp[a − c] + 1)</Code>，對所有面額 c ≤ a。時間 O(amount × k)，空間 O(amount)。常見誤區是在 LeetCode 322 這種「任意面額」的題目上寫貪婪，測資裡就有 <Code>[1, 3, 4]</Code> 型的反例。反過來，若題目明說是標準幣制，或者面額彼此是倍數關係（<Code>[1, 2, 4, 8]</Code>），貪婪就是正確而且最快的解。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>把面額<strong>由大到小</strong>排序。</>,
            <>對每種面額 c：<Code>count = amount // c</Code>，拿 count 枚，<Code>amount %= c</Code>。</>,
            <>迴圈結束時 amount 應該是 0；不是 0 代表這組面額湊不出這個金額（有 1 元時不會發生）。</>,
            <>要確認這組幣值能不能貪：對 1 到「最大兩個面額之和」的每個金額，比較貪婪和 DP 的枚數，全部相同就是標準幣制。</>,
            <>不是標準幣制，就改用 DP：<Code>dp[0] = 0</Code>，<Code>dp[a] = min(dp[a − c] + 1)</Code>，最後看 <Code>dp[amount]</Code>。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>切換兩組幣值和四個金額。貪婪每一步拿一種面額，右側是 DP 算出的最佳解。留意 <Code>[1, 3, 4]</Code> 找 6 元和 10 元的結果，以及 27 元為什麼又剛好對了：反例不是每個金額都出現，所以幾筆測資通過不代表演算法正確。</p>
        <CoinChangeDemo />
      </Section>

      <Section id="code">
        <p>貪婪版、DP 版，以及判斷幣值是否為標準幣制的檢查函式。三個函式合起來就是這一課的結論：能貪就貪，不能貪就 DP，而且有辦法事先知道能不能貪。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 860", name: "Lemonade Change（找零時先拿大的）", diff: "Easy" },
            { src: "LeetCode 1710", name: "Maximum Units on a Truck（按單位價值排序）", diff: "Easy" },
            { src: "LeetCode 322", name: "Coin Change（任意面額，要用 DP）", diff: "Medium" },
            { src: "LeetCode 518", name: "Coin Change II（方法數，DP）", diff: "Medium" },
            { src: "LeetCode 279", name: "Perfect Squares（貪婪會錯的另一個例子）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const coinLesson: Lesson = { prereq: "Greedy Principles", Body };
