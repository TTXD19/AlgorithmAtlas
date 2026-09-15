import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { Dp1dDemo } from "@/components/lesson/demos/Dp1dDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# House Robber（LeetCode 198）：相鄰兩間不能都搶，求最多能搶多少
# dp[i] = 只考慮第 0..i 間的最多錢 = max(dp[i-1], dp[i-2] + nums[i])
def rob(nums):
    prev2, prev1 = 0, 0                    # dp[i-2]、dp[i-1]；還沒有房子時都是 0
    for x in nums:
        # 同時指派：右邊全部用舊值算完才寫回，不必另開暫存變數
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1


# 想知道搶了哪幾間，就得保留整張表，再從尾端回溯
def rob_with_houses(nums):
    n = len(nums)
    if n == 0:
        return 0, []
    dp = [0] * n
    dp[0] = nums[0]                        # base case：只有一間就搶它
    if n > 1:
        dp[1] = max(nums[0], nums[1])      # base case：兩間相鄰，取大的
    for i in range(2, n):
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])
    houses, i = [], n - 1
    while i >= 0:
        if i == 0 or dp[i] != dp[i - 1]:   # 和前一格不同：第 i 間非搶不可
            houses.append(i)
            i -= 2                         # 搶了 i，i-1 一定沒搶
        else:                              # 相同：不搶第 i 間也拿得到這麼多
            i -= 1
    return dp[-1], houses[::-1]


# Decode Ways（LeetCode 91）：計數型。"1"~"26" 對應 A~Z，問有幾種解讀
# 最後一塊是 1 位數或 2 位數，兩類不重不漏，所以把兩類的方法數相加
def num_decodings(s):
    prev2, prev1 = 0, 1                    # prev1 = dp[0] = 1：空字串有一種解讀
    for i in range(len(s)):
        cur = 0
        if s[i] != "0":                    # 單獨一位：1~9
            cur += prev1
        if i > 0 and "10" <= s[i - 1:i + 1] <= "26":   # 和前一位合成 10~26
            cur += prev2
        prev2, prev1 = prev1, cur
    return prev1


if __name__ == "__main__":
    nums = [2, 7, 9, 3, 1, 8, 4]
    print(rob(nums))                 # 19
    print(rob_with_houses(nums))     # (19, [0, 2, 5])
    print(rob([2, 1, 1, 2]))         # 4（隔一間搶一間只有 3）
    print(num_decodings("226"))      # 3：2-2-6、22-6、2-26
    print(num_decodings("2101"))     # 1：只有 2-10-1
    print(num_decodings("06"))       # 0：開頭的 0 無法解讀`;

const cpp = `#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

// House Robber：dp[i] = max(dp[i-1], dp[i-2] + nums[i])，只留兩個變數
int rob(const std::vector<int>& nums) {
    int prev2 = 0, prev1 = 0;              // dp[i-2]、dp[i-1]
    for (int x : nums) {
        int cur = std::max(prev1, prev2 + x);
        prev2 = prev1;                     // 先挪 prev2 再寫 prev1，順序不能反
        prev1 = cur;
    }
    return prev1;
}

// 保留整張表，回溯出搶了哪幾間
std::vector<int> robHouses(const std::vector<int>& nums) {
    int n = (int)nums.size();
    if (n == 0) return {};
    std::vector<int> dp(n);
    dp[0] = nums[0];
    if (n > 1) dp[1] = std::max(nums[0], nums[1]);
    for (int i = 2; i < n; i++) dp[i] = std::max(dp[i - 1], dp[i - 2] + nums[i]);
    std::vector<int> houses;
    for (int i = n - 1; i >= 0;) {
        if (i == 0 || dp[i] != dp[i - 1]) { houses.push_back(i); i -= 2; }  // 第 i 間有搶
        else i -= 1;                                                        // 第 i 間沒搶
    }
    std::reverse(houses.begin(), houses.end());
    return houses;
}

// Decode Ways：計數型，最後一塊是 1 位數或 2 位數
int numDecodings(const std::string& s) {
    int prev2 = 0, prev1 = 1;              // 空字串有一種解讀
    for (size_t i = 0; i < s.size(); i++) {
        int cur = 0;
        if (s[i] != '0') cur += prev1;
        if (i > 0) {
            int two = (s[i - 1] - '0') * 10 + (s[i] - '0');
            if (two >= 10 && two <= 26) cur += prev2;
        }
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}

int main() {
    std::vector<int> nums = {2, 7, 9, 3, 1, 8, 4};
    std::cout << rob(nums) << "\\n";                     // 19
    for (int h : robHouses(nums)) std::cout << h << ' ';  // 0 2 5
    std::cout << "\\n" << rob({2, 1, 1, 2}) << "\\n";     // 4
    std::cout << numDecodings("226") << "\\n";           // 3
    std::cout << numDecodings("06") << "\\n";            // 0
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "醫院夜班：不能連值兩晚",
              problem: "一位住院醫師這個月有 30 個晚上可以排夜班，津貼依日子不同：平日 2,000 元、週末 3,500 元、國定假日 5,000 元。規定不能連續兩晚值班。挑哪幾晚津貼最多？光是合法的排法就超過兩百萬種。",
              why: "每一晚只有「值」或「不值」，值了就不能接前一晚，這正是 House Robber。dp[i] 記前 i 晚的最多津貼：今晚不值就等於 dp[i−1]，值就是 dp[i−2] 加上今晚。30 格、每格一次 max。「先挑最貴的晚上」會錯：連續三晚是 3,500、5,000、3,500 時，挑中間只有 5,000，挑兩側卻有 7,000。",
            },
            {
              title: "中文斷詞：一句話有幾種切法",
              problem: "搜尋引擎收到「研究生命起源」，字典裡有「研究」「研究生」「生命」「生」「命」「起源」，可以切成「研究／生命／起源」，也可以切成「研究生／命／起源」。20 個字的句子有 19 個縫，每個縫切或不切，要檢查的切法有 2¹⁹ ≈ 52 萬種。",
              why: "令 dp[i] 為前 i 個字的切法數。最後一個詞是哪一個字典詞，就把切法分成互不重疊、合起來又涵蓋全部的幾類，所以 dp[i] 是這幾類的 dp 相加。詞最長 4 個字時每格只往回看 4 格，整句約 4n 次查字典。Decode Ways 是同一個形狀：最後一塊是 1 位數或 2 位數。把相加換成取最大（例如詞頻相乘），就能挑出最可能的那一種切法。",
            },
            {
              title: "通勤票券：單日票、週票還是月票",
              problem: "明年要進辦公室的日子不固定，大約 150 天，有時連續一整週、有時隔好幾天才一次。單日往返 60 元、7 日票 300 元、30 日票 1,200 元，怎麼買最省？",
              why: "令 dp[d] 為撐過第 d 天的最少花費。第 d 天不出門，dp[d] = dp[d−1]；要出門，就看涵蓋今天的是哪一種票：單日票接在 dp[d−1] 後面、7 日票接在 dp[d−7]、30 日票接在 dp[d−30]，三者取最小。365 格、每格 3 個選項。「這週出門超過 5 天就買週票」這種規則說不準週票該從哪天開始買，DP 則把每個起點都比過了。",
            },
          ]}
          cue="相鄰不能同時選、每一步只有少數幾種選擇、前 i 項的最佳值、有幾種方法、最少花費、答案只跟前一兩項有關、掃一遍 O(n)。"
        />
      </Section>

      <Section id="concept">
        <p>
          一維 DP 的狀態只有一個索引：<Code>dp[i]</Code> 代表「只看前 i 項」（或「以第 i 項結尾」）時的答案。算 <Code>dp[i]</Code> 只要問一件事：<strong>最後一步做了什麼</strong>。House Robber 的最後一間房子不是搶就是不搶；Decode Ways 的最後一塊不是 1 位數就是 2 位數。每一種選擇都把問題縮成一個更短的前綴，而那個前綴的答案已經填在表裡。「記憶化與表格法」那一課是先寫出遞迴再加快取；這一課直接由小到大填一排格子，重點變成怎麼<strong>定義狀態</strong>、怎麼寫出<strong>轉移式</strong>。
        </p>
        <p>
          為什麼 <Code>dp[i] = max(dp[i−1], dp[i−2] + nums[i])</Code> 是對的：取第 0..i 間的任一個最佳方案。若它沒搶第 i 間，它就是第 0..i−1 間的合法方案，錢不會超過 <Code>dp[i−1]</Code>；若它搶了第 i 間，第 i−1 間一定沒搶，其餘部分是第 0..i−2 間的合法方案，錢不會超過 <Code>dp[i−2] + nums[i]</Code>。反過來，這兩個值都真的做得到。所以最佳值恰好是兩者取大。這就是<strong>最佳子結構</strong>：拿掉最後一步，剩下的部分也必須是子問題的最佳解，否則換成更好的就矛盾。計數題靠的是另一個性質：分類要<strong>不重不漏</strong>。Decode Ways 依最後一塊的長度分類，最後一塊長度不同的兩種解讀不可能相同，所有解讀又一定落在其中一類，所以兩類的方法數直接相加，不會多算也不會少算。
        </p>
        <p>
          複雜度：狀態有 n 個，每個狀態只看固定幾格、做一次 O(1) 的 max 或加法，時間 <strong>O(n)</strong>。每一格都得填，所以最好、最壞都一樣。整張表是 O(n) 空間；但 <Code>dp[i]</Code> 只讀 <Code>dp[i−1]</Code> 和 <Code>dp[i−2]</Code>，更早的格子填完就不會再被讀，只留 <Code>prev2</Code>、<Code>prev1</Code> 兩個變數往前滾，空間降到 <strong>O(1)</strong>。代價是表不見了：要回答「搶了哪幾間」就得保留整張表，從最後一格往回比對每格是從哪個來源轉移來的，空間回到 O(n)。若轉移要往回看 k 格（票券看 30 天、斷詞看最長詞長），時間是 O(nk)，滾動時要保留最近 k 格，空間 O(k)。
        </p>
        <p>
          常見的錯有三個。一是<strong>邊界與 base case</strong>：<Code>i−2</Code> 在 i 為 0、1 時越界，要嘛先填好前兩格，要嘛讓表多一格、以 <Code>dp[0]</Code> 代表空前綴；Decode Ways 的空字串是 1 種解讀，不是 0，否則之後全部是 0。二是<strong>滾動更新的順序</strong>：先改掉 <Code>prev1</Code> 再挪給 <Code>prev2</Code>，挪過去的就是新值，Python 用同時指派、C++ 先把新值存進 <Code>cur</Code>。三是<strong>拿貪婪代替 DP</strong>：「隔一間搶一間」在 <Code>[2, 1, 1, 2]</Code> 只拿到 3，最佳是頭尾兩間的 4。狀態也不一定是「前 i 項」：Maximum Subarray 的 Kadane 用「以第 i 項結尾」，因為子陣列必須連續。當 <Code>dp[i]</Code> 要看前面所有格子時（LIS）時間變成 O(n²)；當狀態需要第二個維度（剩餘容量）時就是 0/1 Knapsack。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>用一句話<strong>定義狀態</strong>：<Code>dp[i]</Code> 是「只看前 i 項」還是「以第 i 項結尾」的答案，並確認最終答案是最後一格還是所有格子的最大值。</>,
            <>看<strong>最後一步</strong>有哪些選擇、每個選擇退回哪個較小的狀態，寫出<strong>轉移式</strong>。求最大取 <Code>max</Code>、求最少取 <Code>min</Code>，數方法數就把不重不漏的各類<strong>相加</strong>。</>,
            <>填 <strong>base case</strong>：轉移式會用到、但自己沒有來源的最小幾格。表開成 n+1 格、讓 <Code>dp[0]</Code> 代表空前綴，通常能省掉特判。</>,
            <><Code>dp[i]</Code> 只依賴較小的索引，所以 i 由小到大用一個迴圈填完。</>,
            <><strong>壓縮空間</strong>：若只讀前 k 格，改用 k 個變數滾動，注意更新順序。需要還原選法時保留整張表，從最後一格比對它等於哪個來源，沿著來源往回走。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>七間房子 <Code>nums = [2, 7, 9, 3, 1, 8, 4]</Code>。定義完狀態先填兩格 base case，之後每一間分兩步：先看兩個來源，黃色是「不搶」的 <Code>dp[i−1]</Code>，綠色是「搶」的 <Code>dp[i−2]</Code>，要再加上藍色的 <Code>nums[i]</Code>；下一步把大的那個填進藍色的 <Code>dp[i]</Code>。表格下方的 prev2、prev1 是滾動寫法算這一格時手上的兩個值。留意 i = 6：搶的話是 12 + 4 = 16，不如不搶的 19。最後一步從尾端回溯，綠色的第 0、2、5 間就是搶的房子，2 + 9 + 8 = 19。</p>
        <Dp1dDemo />
      </Section>

      <Section id="code">
        <p>三個函式：只留兩個變數的 House Robber、保留整張表並回溯出搶了哪幾間的版本，以及計數型的 Decode Ways。前兩個並列是為了對照空間壓縮的代價：O(1) 空間只剩最大值，想知道選法就得留表。範例資料和互動示範相同。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 198", name: "House Robber", diff: "Medium" },
            { src: "LeetCode 740", name: "Delete and Earn（把數值排成一排，就是 House Robber）", diff: "Medium" },
            { src: "LeetCode 213", name: "House Robber II（環狀：拆成去頭、去尾兩段）", diff: "Medium" },
            { src: "LeetCode 91", name: "Decode Ways（計數型，小心 0）", diff: "Medium" },
            { src: "LeetCode 139", name: "Word Break（往回看每個字典詞的長度）", diff: "Medium" },
            { src: "LeetCode 983", name: "Minimum Cost For Tickets（往回看 1、7、30 天）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const dp1dLesson: Lesson = { prereq: "Memoization & Tabulation", Body };
