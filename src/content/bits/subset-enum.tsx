import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { SubsetEnumDemo } from "@/components/lesson/demos/SubsetEnumDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 第 i 位是 1 代表選了第 i 個元素：0 到 2ⁿ−1 每個整數恰好是一個子集
def subsets(items):
    n = len(items)
    out = []
    for mask in range(1 << n):                   # 2ⁿ 個 mask
        out.append([items[i] for i in range(n) if mask >> i & 1])
    return out


# 應用：skills[i] 是第 i 個人會的技能（位元集合），找人數最少、技能涵蓋 need 的小組
def smallest_team(skills, need):
    n = len(skills)
    best = -1
    for mask in range(1 << n):
        have = 0
        for i in range(n):
            if mask >> i & 1:
                have |= skills[i]                # 聯集就是 OR
        if (have & need) == need and (best == -1 or mask.bit_count() < best.bit_count()):
            best = mask                          # bit_count() 就是小組人數
    if best == -1:
        return None                              # 所有人加起來也湊不齊
    return [i for i in range(n) if best >> i & 1]


# 所有子集的總和，O(2ⁿ)：mask 加上第 i 位之前，mask 的總和已經算好
def subset_sums(nums):
    sums = [0] * (1 << len(nums))
    for i, x in enumerate(nums):
        for mask in range(1 << i):               # 只用到前 i 個元素的子集
            sums[mask | 1 << i] = sums[mask] + x
    return sums


# mask 的所有子集合，由大到小，包含 mask 本身和 0
def submasks(mask):
    sub = mask
    while True:
        yield sub
        if sub == 0:                             # 0 處理完才停，否則 (0 - 1) & mask 又回到 mask
            break
        sub = (sub - 1) & mask                   # 減 1 再 AND 回 mask，跳到下一個子集合


if __name__ == "__main__":
    print(subsets(["A", "B", "C"]))
    # [[], ['A'], ['B'], ['A', 'B'], ['C'], ['A', 'C'], ['B', 'C'], ['A', 'B', 'C']]

    # bit 0 前端、bit 1 後端、bit 2 資料庫、bit 3 DevOps
    skills = [0b0011, 0b0100, 0b1100, 0b0001, 0b1010]
    print(smallest_team(skills, 0b1111))         # [0, 2]

    print(subset_sums([3, 5, 9]))                # [0, 3, 5, 8, 9, 12, 14, 17]
    print([format(s, "04b") for s in submasks(0b1011)])
    # ['1011', '1010', '1001', '1000', '0011', '0010', '0001', '0000']

    n = 5                                        # 對每個 mask 各列一次子集合，總共 3ⁿ 次
    print(sum(1 for mask in range(1 << n) for _ in submasks(mask)), 3 ** n)   # 243 243`;

const cpp = `#include <bitset>
#include <iostream>
#include <string>
#include <vector>

// 第 i 位是 1 代表選了第 i 個元素：0 到 2ⁿ−1 每個整數恰好是一個子集
std::vector<std::string> subsets(const std::string& items) {
    int n = static_cast<int>(items.size());
    std::vector<std::string> out;
    for (int mask = 0; mask < (1 << n); mask++) {        // n ≥ 31 時要改用 1LL << n
        std::string s;
        for (int i = 0; i < n; i++)
            if ((mask >> i) & 1) s += items[i];
        out.push_back(s);
    }
    return out;
}

// 應用：找人數最少、技能涵蓋 need 的小組，回傳小組的 mask（-1 表示湊不齊）
int smallestTeam(const std::vector<int>& skills, int need) {
    int n = static_cast<int>(skills.size()), best = -1;
    auto size = [](int m) { return std::bitset<32>(m).count(); };   // 1 的個數 = 人數
    for (int mask = 0; mask < (1 << n); mask++) {
        int have = 0;
        for (int i = 0; i < n; i++)
            if ((mask >> i) & 1) have |= skills[i];       // 聯集就是 OR
        // 括號不能省：C++ 的 == 比 & 先算
        if ((have & need) == need && (best == -1 || size(mask) < size(best))) best = mask;
    }
    return best;
}

// 所有子集的總和，O(2ⁿ)：mask 加上第 i 位之前，mask 的總和已經算好
std::vector<long long> subsetSums(const std::vector<int>& nums) {
    int n = static_cast<int>(nums.size());
    std::vector<long long> sums(1 << n, 0);
    for (int i = 0; i < n; i++)
        for (int mask = 0; mask < (1 << i); mask++)      // 只用到前 i 個元素的子集
            sums[mask | (1 << i)] = sums[mask] + nums[i];
    return sums;
}

// mask 的所有子集合，由大到小，包含 mask 本身和 0
std::vector<int> submasks(int mask) {
    std::vector<int> out;
    for (int sub = mask; ; sub = (sub - 1) & mask) {     // 減 1 再 AND 回 mask
        out.push_back(sub);
        if (sub == 0) break;                            // 0 處理完才停，否則又回到 mask
    }
    return out;
}

int main() {
    for (const std::string& s : subsets("ABC")) std::cout << '{' << s << "} ";
    std::cout << "\\n";                                  // {} {A} {B} {AB} {C} {AC} {BC} {ABC}

    // bit 0 前端、bit 1 後端、bit 2 資料庫、bit 3 DevOps
    std::vector<int> skills = {0b0011, 0b0100, 0b1100, 0b0001, 0b1010};
    std::cout << std::bitset<5>(smallestTeam(skills, 0b1111)) << "\\n";   // 00101（第 0、2 人）

    for (long long s : subsetSums({3, 5, 9})) std::cout << s << ' ';
    std::cout << "\\n";                                  // 0 3 5 8 9 12 14 17

    for (int sub : submasks(0b1011)) std::cout << std::bitset<4>(sub) << ' ';
    std::cout << "\\n";                                  // 1011 1010 1001 1000 0011 0010 0001 0000

    int n = 5, total = 0;                               // 對每個 mask 各列一次子集合
    for (int mask = 0; mask < (1 << n); mask++) total += static_cast<int>(submasks(mask).size());
    std::cout << total << "\\n";                         // 243 = 3⁵
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "組一支技能全包、人數最少的專案小組",
              problem: "新專案需要前端、後端、資料庫、DevOps、設計、測試 6 種技能，部門裡 10 位工程師各會其中幾種。主管想挑出人數最少、而且 6 種技能都有人會的小組。",
              why: "每位工程師會的技能存成一個 6 位元整數，一個小組就是一個 10 位元的 mask。從 0 數到 1023，把 mask 裡每個人的技能 OR 起來，等於 111111₂ 就是全包，mask 裡 1 的個數就是人數。1024 種小組、每種最多 10 次 OR，一萬次運算以內，不用遞迴，也不用另外存一份名單。",
            },
            {
              title: "36 箱貨分給兩台貨車，載重要盡量平均",
              problem: "倉庫有 36 箱重量不一的貨要分給兩台貨車，兩車總重的差距越小越好。每箱只有上 A 車或上 B 車兩種選擇，全部試一遍是 2³⁶ ≈ 687 億種，跑不完。",
              why: "把箱子拆成前後各 18 箱，各自用 mask 列出 2¹⁸ = 262,144 種子集重量，每個子集由「少一箱的子集」再加一箱遞推，O(1) 就算好。排序其中一半，對另一半的每個重量二分搜尋最接近「總重的一半」的搭配，一千萬次左右的運算就找到最佳分法。這叫折半列舉，是 n 在 40 左右時的標準做法。",
            },
            {
              title: "拼字遊戲：七個字母能拼出哪些單字",
              problem: "拼字遊戲每題給 7 個不同字母，玩家要找出只用這些字母、而且一定用到中間那個字母的單字。題庫有 1 萬題、字典有 10 萬個單字，逐題逐字比對要 10 億次。",
              why: "單字只在乎「用了哪些字母」，把它壓成 26 位元的 mask，先用雜湊表數好每個 mask 對應幾個單字。一題除了中間字母以外的 6 個字母只有 2⁶ = 64 個子集合，用 sub = (sub − 1) & mask 一個不漏地列出來、各自加上中間字母去查表，1 萬題總共 64 萬次查詢。",
            },
          ]}
          cue="n ≤ 20、每個元素選或不選、把集合存成一個整數、所有組合都試一遍、集合的聯集與交集、列出某個集合的所有子集合、3ⁿ、n 在 40 左右（折半列舉）、Bitmask DP 的狀態。"
        />
      </Section>

      <Section id="concept">
        <p>
          子集和二進位天生對得上：n 個元素，每個只有<strong>選</strong>或<strong>不選</strong>兩種狀態，剛好是一個位元的 1 或 0。約定<strong>第 i 位對應第 i 個元素</strong>，一個 n 位元的整數 <Code>mask</Code> 就代表一個子集。每個子集的二進位寫法唯一，所以 <Code>0</Code> 到 <Code>2ⁿ − 1</Code> 這 2ⁿ 個整數和 2ⁿ 個子集<strong>一一對應</strong>，一個迴圈從 0 數上去就不重不漏。集合運算也全變成位元運算：<Code>{"mask >> i & 1"}</Code> 問第 i 個有沒有選、<Code>{"a | b"}</Code> 是聯集、<Code>{"a & b"}</Code> 是交集、<Code>{"(a & b) == a"}</Code> 表示 a 是 b 的子集、1 的個數（popcount）就是子集大小。
        </p>
        <p>
          第二個技巧是<strong>只列舉某個 mask 的子集合</strong>：從 <Code>sub = mask</Code> 開始，每次 <Code>{"sub = (sub - 1) & mask"}</Code>，到 0 為止。為什麼正確：把 mask 裡是 1 的那 k 個位置抽出來，sub 在這些位置上的值可以看成一個 k 位元的數。減 1 會把 sub 最低位的 1 變成 0、它下面的位全變成 1；再 AND 回 mask，mask 以外的位被清掉，留下的恰好是「那個 k 位元的數減 1」。所以 sub 在抽出來的座標裡從 2ᵏ − 1 一路倒數到 0，每個子集合正好經過一次，中間不是子集合的整數全被跳過。空集合要處理完才停，因為 <Code>{"(0 - 1) & mask"}</Code> 又會回到 mask。
        </p>
        <p>
          列舉本身是 2ⁿ 個整數、每個 O(1) 前進到下一個，額外空間只有一個整數，這就是 <strong>O(2ⁿ) 時間、O(1) 空間</strong>。但每個 mask 通常還要做事：逐位檢查選了誰要 O(n)，整體變成 <strong>O(2ⁿ·n)</strong>。如果要的量可以遞推（例如子集總和），利用「mask 加上第 i 位之前，mask 本身已經算好」，每個子集 O(1)，總共 O(2ⁿ) 時間，代價是 O(2ⁿ) 的表。若對<strong>每一個</strong> mask 都列舉它的子集合，每個元素只有「不在 mask」「在 mask 但不在 sub」「兩邊都在」三種狀態，總次數是 <strong>3ⁿ</strong> 而不是 4ⁿ。實用上限大約是：2ⁿ 做到 n ≤ 20（一百萬）、3ⁿ 做到 n ≤ 15（一千四百萬）；n 在 40 左右就用<strong>折半列舉</strong>，兩半各 2²⁰ 個再合併。
        </p>
        <p>
          常見的坑：C++ 裡 <Code>==</Code> 比 <Code>{"&"}</Code> 先算，<Code>{"mask & 1 << i == 0"}</Code> 其實是 <Code>{"mask & ((1 << i) == 0)"}</Code>，條件永遠不成立，位元運算一律加括號；<Code>{"1 << n"}</Code> 在 n ≥ 31 時溢位，要寫 <Code>{"1LL << n"}</Code>；二進位從右往左讀，最右邊才是第 0 個元素。和 <strong>Subsets</strong> 的回溯相比，兩者都走過 2ⁿ 個子集，回溯能在半路剪枝，位元列舉不能，但它沒有遞迴、常數小，而且子集本身就是一個整數，可以直接當陣列索引或雜湊表的 key。這正是 <strong>Bitmask DP</strong> 的入口：<Code>dp[mask]</Code> 記錄「mask 這些元素處理完」的最佳值，子集合列舉對應「把 mask 拆成兩塊」的轉移。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認規模：列舉所有子集要 n ≤ 20 左右；還要列每個子集的子集合（3ⁿ）要 n ≤ 15 左右；n 在 40 左右就拆成兩半各自列舉。把元素編號 0 到 n − 1，<strong>第 i 位對應第 i 個元素</strong>。</>,
            <>外層迴圈 <Code>{"for mask in range(1 << n)"}</Code>，每個整數就是一個子集。C++ 裡 n 可能到 31 以上時改用 <Code>{"1LL << n"}</Code>。</>,
            <>內層用 <Code>{"mask >> i & 1"}</Code> 取出選了哪些元素，累積要算的量（總和、技能的 OR、有沒有衝突）。子集大小是 mask 的 popcount，只要大小恰好 k 的子集就先用它篩掉其他的。</>,
            <>要算的量若能由「少一個元素的子集」推出，就開一張大小 2ⁿ 的表遞推：對每個 i 與 <Code>{"mask < 1 << i"}</Code>，<Code>{"f[mask | 1 << i] = f[mask] + a[i]"}</Code>，省掉內層的 O(n)。</>,
            <>只要某個 mask 的子集合：<Code>sub = mask</Code>，處理完 sub 後若 <Code>sub == 0</Code> 就停，否則 <Code>{"sub = (sub - 1) & mask"}</Code>。不需要空集合時，迴圈條件直接寫 <Code>{"sub > 0"}</Code>。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>元素是 A、B、C、D，第 i 位對應第 i 個元素，所以 A 是最右邊的 bit 0。前半段 mask 從 0 數到 15：左邊是目前 mask 的 4 個位元，藍色的位是 1，底下綠色的就是被選的元素；右邊 16 格裡藍色是目前的 mask，綠色是已經列過的。後半段只列 mask = 1011₂（A、B、D）的子 mask，C 那一位畫成虛線、永遠是 0，不是子 mask 的格子變灰。留意 sub 從 1000₂ 一步跳到 0011₂，中間四個含 C 的整數被 AND 一次跳過，8 個子 mask 走完就停。</p>
        <SubsetEnumDemo />
      </Section>

      <Section id="code">
        <p>四個函式：核心的 mask 迴圈列出所有子集；用它找人數最少、技能全包的小組，示範 OR 做聯集、popcount 算人數；子集總和的 O(2ⁿ) 遞推，折半列舉就是對兩半各跑一次它；最後是子集合列舉，並驗證對所有 mask 各列一次總共是 3ⁿ 次。C++ 只用標準的 <Code>std::bitset</Code> 數 1 的個數和印二進位。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 78", name: "Subsets（改用 mask 迴圈，不用遞迴）", diff: "Medium" },
            { src: "LeetCode 2212", name: "Maximum Points in an Archery Competition（列舉要贏哪幾區）", diff: "Medium" },
            { src: "LeetCode 2397", name: "Maximum Rows Covered by Columns（每一列存成 mask）", diff: "Medium" },
            { src: "LeetCode 2002", name: "Maximum Product of the Length of Two Palindromic Subsequences（兩個不相交的 mask）", diff: "Medium" },
            { src: "LeetCode 1178", name: "Number of Valid Words for Each Puzzle（子集合列舉）", diff: "Hard" },
            { src: "LeetCode 1755", name: "Closest Subsequence Sum（折半列舉）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const subsetEnumLesson: Lesson = { prereq: "Bitwise Basics、Subsets", Body };
