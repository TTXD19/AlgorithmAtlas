import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { ManacherDemo } from "@/components/lesson/demos/ManacherDemo";
import type { Lesson } from "@/lib/lessons";

const python = `def manacher(s):
    """在 t = #s[0]#s[1]#…# 上求回文半徑 p。p[i] 剛好等於對應回文在 s 裡的長度。O(n)"""
    t = [None] * (2 * len(s) + 1)
    t[1::2] = s                                 # 奇數位置放字元，偶數位置是分隔（None 不會等於任何字元）
    n = len(t)
    p = [0] * n
    c = r = 0                                   # 右界最遠的回文：中心 c，右界 r = c + p[c]
    for i in range(n):
        if i < r:
            p[i] = min(p[2 * c - i], r - i)     # 抄鏡像位置的半徑，但最多借到右界
        while i - p[i] - 1 >= 0 and i + p[i] + 1 < n and t[i - p[i] - 1] == t[i + p[i] + 1]:
            p[i] += 1                           # 右界以外只能自己往外比
        if i + p[i] > r:
            c, r = i, i + p[i]
    return p


def longest_palindrome(s):
    p = manacher(s)
    i = max(range(len(p)), key=p.__getitem__)
    start = (i - p[i]) // 2                     # t 的位置換回 s 的位置
    return s[start:start + p[i]]


def count_palindromes(s):
    """回文子字串總數（位置不同就算不同）：每個中心貢獻 ceil(p / 2) 個"""
    return sum((v + 1) // 2 for v in manacher(s))


class PalindromeQuery:
    """預處理 O(n)，之後每次問「s[l..r] 是不是回文」都是 O(1)"""

    def __init__(self, s):
        self.p = manacher(s)

    def is_palindrome(self, l, r):              # 閉區間 [l, r]，在 t 裡的中心是 l + r + 1
        return self.p[l + r + 1] >= r - l + 1


if __name__ == "__main__":
    print(manacher("abaaba"))                   # [0, 1, 0, 3, 0, 1, 6, 1, 0, 3, 0, 1, 0]
    print(longest_palindrome("forgeeksskeegfor"))   # geeksskeeg
    print(count_palindromes("aaa"), count_palindromes("abaaba"))   # 6 11
    q = PalindromeQuery("abaaba")
    print(q.is_palindrome(1, 4), q.is_palindrome(0, 3), q.is_palindrome(0, 2))   # True False True：baab、abaa、aba`;

const cpp = `#include <algorithm>
#include <cstddef>
#include <iostream>
#include <string>
#include <vector>

std::string withSeparators(const std::string& s) {
    std::string t = "#";
    for (char ch : s) { t += ch; t += '#'; }
    return t;
}

// 在已插入分隔字元的 t 上求回文半徑。match(x, y) 決定兩個對稱位置算不算相符：
// 一般回文用「相等」，DNA 的互補回文用「互補」。中心本身也必須和自己相符，對稱論證才成立
template <class Match>
std::vector<std::size_t> radii(const std::string& t, Match match) {
    std::size_t n = t.size(), c = 0, r = 0;
    std::vector<std::size_t> p(n, 0);
    for (std::size_t i = 0; i < n; i++) {
        if (!match(t[i], t[i])) continue;                 // 不能當中心（DNA 的字母不會和自己互補），半徑 0
        if (i < r) p[i] = std::min(p[2 * c - i], r - i);
        while (i >= p[i] + 1 && i + p[i] + 1 < n && match(t[i - p[i] - 1], t[i + p[i] + 1])) p[i]++;
        if (i + p[i] > r) { c = i; r = i + p[i]; }
    }
    return p;
}

std::string longestPalindrome(const std::string& s) {
    std::vector<std::size_t> p = radii(withSeparators(s), [](char x, char y) { return x == y; });
    std::size_t i = static_cast<std::size_t>(std::max_element(p.begin(), p.end()) - p.begin());
    return s.substr((i - p[i]) / 2, p[i]);
}

// DNA 裡「反向互補等於自己」的片段，例如限制酶 EcoRI 的切位 GAATTC。
// 回傳所有長度至少 minLen、無法再往外延伸的互補回文起點與內容
std::vector<std::pair<std::size_t, std::string>> dnaPalindromes(const std::string& dna, std::size_t minLen) {
    auto comp = [](char ch) { return ch == 'A' ? 'T' : ch == 'T' ? 'A' : ch == 'C' ? 'G' : ch == 'G' ? 'C' : ch; };
    std::vector<std::size_t> p = radii(withSeparators(dna), [&](char x, char y) { return comp(x) == y; });
    std::vector<std::pair<std::size_t, std::string>> res;
    for (std::size_t i = 0; i < p.size(); i += 2)          // 只有分隔字元（偶數位置）能當中心
        if (p[i] >= minLen) res.push_back({(i - p[i]) / 2, dna.substr((i - p[i]) / 2, p[i])});
    return res;
}

int main() {
    std::cout << longestPalindrome("abaaba") << ' ' << longestPalindrome("forgeeksskeegfor") << '\\n';   // abaaba geeksskeeg
    for (const auto& [pos, site] : dnaPalindromes("CCGAATTCAGTGGATCCGG", 6))
        std::cout << pos << ' ' << site << '\\n';   // 2 GAATTC（EcoRI）
                                                     // 11 GGATCC（BamHI）
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "找出限制酶的切位",
              problem: "分子生物學實驗要知道一段 5 萬鹼基的質體上，哪些位置會被限制酶切開。很多限制酶辨識的序列是「反向互補等於自己」的片段，例如 EcoRI 的 GAATTC，反過來讀再把 A、T 與 C、G 互換，還是 GAATTC。",
              why: "把回文的「對稱位置相等」換成「對稱位置互補」，Manacher 的鏡像論證一樣成立，因為互補關係對調兩次會回到原本的字母；唯一要多加的規定是中心必須落在兩個鹼基之間，因為沒有鹼基和自己互補。一次 O(n) 就得到每個中心能延伸多遠，所有長度至少 6 的互補回文一起列出，再和限制酶的辨識序列表對照。",
            },
            {
              title: "統計病毒基因組裡的回文密度",
              problem: "研究者觀察到疱疹病毒的基因組裡，有些區域的回文序列特別密集，而這些區域常常就在 DNA 複製起點附近。要在 20 多萬鹼基的基因組上，用滑動區間統計每一段裡回文的數量，找出異常密集的地方。",
              why: "Manacher 算出每個中心的最長回文半徑之後，以同一個中心、較短的回文全部都成立，所以每個中心的回文數量直接由半徑算出，不必逐一展開。整條基因組 O(n) 處理完，再用前綴和就能 O(1) 查詢任意區間內的回文數量。",
            },
            {
              title: "大量的「這一段是不是回文」查詢",
              problem: "把一個長 2,000 的字串切成最少段回文，動態規劃枚舉切點時要問上百萬次「s[l..r] 是不是回文」；另一類題目則是字串長 10 萬、查詢 10 萬次。每次都從兩端往中間比，最壞 O(n) 一次。",
              why: "s[l..r] 在插入分隔字元後的中心是 l + r + 1，它是回文當且僅當那個中心的半徑至少是 r − l + 1。Manacher 預處理 O(n) 之後，每次查詢 O(1)，也不需要 O(n²) 的回文表。",
            },
          ]}
          cue="最長回文子字串、回文子字串的數量、以每個位置為中心能延伸多遠、大量區間回文查詢、DNA 反向互補片段、需要比 O(n²) 中心展開更快。"
        />
      </Section>

      <Section id="concept">
        <p>
          找最長回文子字串最直接的做法是<strong>中心展開</strong>：以每個字元、以及每兩個字元之間為中心往外擴，直到兩邊不同。遇到 aaaa…a 時每個中心都擴到底，最壞 O(n²)。奇數長度的回文中心在字元上、偶數長度的在字元之間，分開處理很麻煩，所以先在每個字元之間和頭尾插入<strong>分隔字元</strong>：s = abaaba 變成 T = #a#b#a#a#b#a#，長度 2n + 1，所有回文的中心都落在 T 的某個位置上。<Code>p[i]</Code> 是 T 上以 i 為中心的回文半徑，巧的是它剛好等於對應回文在 s 裡的長度，起點是 <Code>(i − p[i]) / 2</Code>。
        </p>
        <p>
          Manacher 維護<strong>右界最遠的回文</strong>：中心 c、右界 <Code>r = c + p[c]</Code>。處理 i 時如果 <Code>i &lt; r</Code>，i 在這個大回文裡，它關於 c 的<strong>鏡像</strong> <Code>j = 2c − i</Code> 已經算過。大回文左右對稱，i 附近的字元就是 j 附近字元的鏡像。若 <Code>p[j] &lt; r − i</Code>，j 的回文連同讓它停下來的那個字元都在大回文裡，i 會在同樣的地方停下，直接 <Code>p[i] = p[j]</Code>，一次比較都不用。若 <Code>p[j] ≥ r − i</Code>，只能保證半徑至少 <Code>r − i</Code>，右界外面的字元沒看過，要從那裡繼續往外比。若 i 在右界之外，就從半徑 0 開始展開。每次展開完，如果 <Code>i + p[i] &gt; r</Code>，就把中心和右界換成 i。
        </p>
        <p>
          複雜度：從 <Code>min(p[j], r − i)</Code> 開始往外比時，每一次成功的比較都會把右界往右推一格，r 只增不減、最多到 2n + 1，所以成功的比較總共是 O(n)；失敗的比較每個 i 最多一次。整體 <strong>O(n)</strong> 時間、<strong>O(n)</strong> 空間。一次算出的 p 陣列可以回答很多問題：最大的 <Code>p[i]</Code> 是最長回文；以 i 為中心的回文有 <Code>⌈p[i] / 2⌉</Code> 個，加總就是回文子字串的總數；<Code>s[l..r]</Code> 是回文當且僅當 <Code>p[l + r + 1] ≥ r − l + 1</Code>。
        </p>
        <p>
          常見的坑：沒插分隔字元就只找得到奇數長度的回文，abba 會被漏掉；T 和 s 之間的位置換算差一，起點要用 <Code>(i − p[i]) / 2</Code>；抄鏡像半徑時忘了和 <Code>r − i</Code> 取最小值，會把右界外沒看過的字元也當成對稱；展開時沒有檢查兩端邊界。<Code>p[j]</Code> 嚴格大於 <Code>r − i</Code> 時其實答案就是 <Code>r − i</Code>，不過統一寫成繼續往外比，也只是多一次失敗的比較。和鄰近課程的關係：這和上一篇 Z-Algorithm 是同一個套路，「在伸得最遠的區間裡借鏡像位置的答案，只有超出區間才自己比」；用字串雜湊加二分半徑也能做到 O(n log n)；區間 DP 的回文表是 O(n²)，Manacher 在只需要回文資訊時可以取代它。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>在 s 的每個字元之間和頭尾插入分隔字元，得到長度 <Code>2n + 1</Code> 的 T；p 陣列全部設 0，<Code>c = r = 0</Code>。</>,
            <>對每個 i：若 <Code>i &lt; r</Code>，令 <Code>p[i] = min(p[2c − i], r − i)</Code>；否則 <Code>p[i] = 0</Code>。</>,
            <>在兩端都沒有越界、而且 <Code>T[i − p[i] − 1] = T[i + p[i] + 1]</Code> 時，p[i] 加 1。</>,
            <>若 <Code>i + p[i] &gt; r</Code>，令 <Code>c = i</Code>、<Code>r = i + p[i]</Code>。</>,
            <>讀答案：最大的 <Code>p[i]</Code> 是最長回文長度，在 s 中從 <Code>(i − p[i]) / 2</Code> 開始；<Code>s[l..r]</Code> 是回文當且僅當 <Code>p[l + r + 1] ≥ r − l + 1</Code>。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>s = abaaba 插入 # 之後是 T = #a#b#a#a#b#a#，長度 13。第一列的藍色是 i，綠色是它相對於目前中心的鏡像 2c − i，黃色是以 i 為中心展開出的回文；第二列標出右界最遠的回文。i = 1 和 3 都在右界外，老實展開，i = 3 以 b 為中心得到半徑 3，也就是 aba，右界推到 6。i = 4 的鏡像是 2，p[2] = 0 比到右界的 2 格小，直接抄 0。i = 6 是 aa 中間的 #，鏡像 p[0] = 0 等於到右界的 0 格，只能自己展開，一路擴到 T 的兩端，半徑 6，右界推到 12。之後 i = 7、8、10 全部抄鏡像；i = 9、11、12 的鏡像半徑剛好等於到右界的距離，但右界已經是字串結尾，比一次就停。最大的 p 在 i = 6，對應 s 從 0 開始、長度 6 的 abaaba。</p>
        <ManacherDemo />
      </Section>

      <Section id="code">
        <p>Python 用 None 當分隔字元，保證不會和任何字元相等，並示範最長回文、回文子字串計數，以及 O(1) 的區間回文查詢。C++ 把「兩個對稱位置算不算相符」抽成參數，同一份 Manacher 既能找一般回文，也能找 DNA 的互補回文；和自己不相符的位置不能當中心，這一行對一般回文沒有影響，對 DNA 則排除了以鹼基為中心的假回文。範例裡找出的兩個片段正是 EcoRI 和 BamHI 的切位。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 5", name: "Longest Palindromic Substring", diff: "Medium" },
            { src: "LeetCode 647", name: "Palindromic Substrings（每個中心貢獻 ⌈p / 2⌉ 個）", diff: "Medium" },
            { src: "LeetCode 132", name: "Palindrome Partitioning II（DP 裡的回文判斷改成 O(1) 查詢）", diff: "Hard" },
            { src: "LeetCode 2472", name: "Maximum Number of Non-overlapping Palindrome Substrings", diff: "Hard" },
            { src: "LeetCode 1960", name: "Maximum Product of the Length of Two Palindromic Substrings（Manacher 加前後綴最大值）", diff: "Hard" },
            { src: "LeetCode 3327", name: "Check if DFS Strings Are Palindromes（樹的走訪序列上跑 Manacher）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const manacherLesson: Lesson = { prereq: "Z-Algorithm", Body };
