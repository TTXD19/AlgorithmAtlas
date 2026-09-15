import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { HashingDemo } from "@/components/lesson/demos/HashingDemo";
import type { Lesson } from "@/lib/lessons";

const python = `import random


class PrefixHash:
    """多項式前綴雜湊：建表 O(n)，之後任意子字串 s[l:r] 的雜湊 O(1)"""
    M = (1 << 61) - 1                   # 梅森質數，Python 整數不會溢位，直接用
    B = random.randrange(256, M)        # 底數隨機選：別人無法事先構造碰撞

    def __init__(self, s):
        n = len(s)
        self.h = [0] * (n + 1)          # h[i] = s[:i] 的雜湊
        self.pw = [1] * (n + 1)         # pw[i] = B^i mod M
        for i, ch in enumerate(s):
            self.h[i + 1] = (self.h[i] * self.B + ord(ch)) % self.M   # 字元值用編碼，不會是 0
            self.pw[i + 1] = self.pw[i] * self.B % self.M

    def get(self, l, r):
        """s[l:r] 的雜湊：前 l 個字元在 h[r] 裡被多乘了 B^(r-l)，減掉它"""
        return (self.h[r] - self.h[l] * self.pw[r - l]) % self.M   # Python 的 % 結果不會是負數


def longest_duplicate(s):
    """出現至少兩次（可重疊）的最長子字串。長度 L 有重複，L-1 一定也有，所以能二分長度"""
    ph = PrefixHash(s)

    def find(L):                        # 找一個長度 L、出現過兩次的起點，沒有就回傳 -1
        seen = set()
        for i in range(len(s) - L + 1):
            x = ph.get(i, i + L)
            if x in seen:
                return i
            seen.add(x)
        return -1

    lo, hi, best = 1, len(s) - 1, ""
    while lo <= hi:                     # 每猜一次 O(n)，總共 O(n log n)
        mid = (lo + hi) // 2
        i = find(mid)
        if i == -1:
            hi = mid - 1
        else:
            best, lo = s[i:i + mid], mid + 1
    return best


def java_hash(s):
    """Java 的 String.hashCode：固定底數 31、自然溢位（mod 2³²）"""
    x = 0
    for ch in s:
        x = (x * 31 + ord(ch)) & 0xFFFFFFFF
    return x


if __name__ == "__main__":
    ph = PrefixHash("abcabca")
    print(ph.get(0, 3) == ph.get(3, 6), ph.get(0, 3) == ph.get(1, 4))   # True False
    print(longest_duplicate("banana"), longest_duplicate("to be or not to be"))   # ana to be
    print(repr(longest_duplicate("abcd")))                              # ''
    print(java_hash("Aa"), java_hash("BB"), java_hash("AaBB"), java_hash("BBAa"))   # 2112 2112 2031744 2031744`;

const cpp = `#include <algorithm>
#include <chrono>
#include <cstddef>
#include <iostream>
#include <numeric>
#include <random>
#include <string>
#include <unordered_set>
#include <vector>

// 雙模數：兩個約 10⁹ 的質數各算一次，乘法結果不超過 10¹⁸，64 位元放得下
const unsigned long long M1 = 1000000007ULL, M2 = 998244353ULL;
std::mt19937_64 rng(static_cast<unsigned long long>(std::chrono::steady_clock::now().time_since_epoch().count()));
const unsigned long long B1 = rng() % (M1 - 256) + 256, B2 = rng() % (M2 - 256) + 256;   // 啟動時隨機選底數

struct PrefixHash {
    std::vector<unsigned long long> h1, h2, p1, p2;

    explicit PrefixHash(const std::string& s)
        : h1(s.size() + 1, 0), h2(s.size() + 1, 0), p1(s.size() + 1, 1), p2(s.size() + 1, 1) {
        for (std::size_t i = 0; i < s.size(); i++) {
            unsigned long long c = static_cast<unsigned char>(s[i]);
            h1[i + 1] = (h1[i] * B1 + c) % M1;
            h2[i + 1] = (h2[i] * B2 + c) % M2;
            p1[i + 1] = p1[i] * B1 % M1;
            p2[i + 1] = p2[i] * B2 % M2;
        }
    }

    // s[l, r) 的雜湊，兩個模數的結果拼成一個 64 位元整數。先加 M 再減，無號數才不會變成負的
    unsigned long long get(std::size_t l, std::size_t r) const {
        unsigned long long a = (h1[r] + M1 - h1[l] * p1[r - l] % M1) % M1;
        unsigned long long b = (h2[r] + M2 - h2[l] * p2[r - l] % M2) % M2;
        return a << 32 | b;
    }
};

// 出現至少兩次的最長子字串：二分長度，每次把所有長度 L 的雜湊丟進集合
std::string longestDuplicate(const std::string& s) {
    PrefixHash ph(s);
    std::string best;
    std::size_t lo = 1, hi = s.empty() ? 0 : s.size() - 1;
    while (lo <= hi) {
        std::size_t mid = (lo + hi) / 2, found = s.size();
        std::unordered_set<unsigned long long> seen;
        for (std::size_t i = 0; i + mid <= s.size(); i++)
            if (!seen.insert(ph.get(i, i + mid)).second) { found = i; break; }
        if (found == s.size()) hi = mid - 1;
        else { best = s.substr(found, mid); lo = mid + 1; }
    }
    return best;
}

// 兩個後綴 s[i:] 與 s[j:] 的最長共同前綴。「前 L 個字元相同」對 L 單調，二分 O(log n)
std::size_t lcp(const PrefixHash& ph, std::size_t n, std::size_t i, std::size_t j) {
    std::size_t lo = 0, hi = n - std::max(i, j);
    while (lo < hi) {
        std::size_t mid = (lo + hi + 1) / 2;
        if (ph.get(i, i + mid) == ph.get(j, j + mid)) lo = mid;
        else hi = mid - 1;
    }
    return lo;
}

// 後綴排序：比較兩個後綴 = 求 LCP，再比下一個字元。每次比較 O(log n)，總共 O(n log² n)
std::vector<std::size_t> suffixArray(const std::string& s) {
    PrefixHash ph(s);
    std::size_t n = s.size();
    std::vector<std::size_t> sa(n);
    std::iota(sa.begin(), sa.end(), std::size_t{0});
    std::sort(sa.begin(), sa.end(), [&](std::size_t i, std::size_t j) {
        std::size_t k = lcp(ph, n, i, j);
        if (j + k == n) return false;       // s[j:] 已經比完，它不會比 s[i:] 大
        if (i + k == n) return true;        // s[i:] 是 s[j:] 的前綴，短的排前面
        return s[i + k] < s[j + k];
    });
    return sa;
}

int main() {
    PrefixHash ph("abcabca");
    std::cout << (ph.get(0, 3) == ph.get(3, 6)) << ' ' << (ph.get(0, 3) == ph.get(1, 4)) << '\\n';   // 1 0
    std::cout << longestDuplicate("banana") << '\\n';                  // ana
    for (std::size_t i : suffixArray("banana")) std::cout << i << ' ';   // 5 3 1 0 4 2
    std::cout << '\\n';
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "找出被複製貼上的最長片段",
              problem: "一個 50 萬字元的原始碼檔案，想找出「出現至少兩次的最長子字串」，當作重複程式碼的線索。枚舉所有起點配對已經是上千億對，每對還要逐字元往後比，完全跑不完。",
              why: "長度 L 的片段若有重複，長度 L−1 一定也有，所以可以二分長度。每猜一個 L，把所有長度 L 的子字串雜湊值丟進集合，看有沒有重複。子字串雜湊是 O(1) 取出來的，每一輪只要 O(n)，整個問題降到 O(n log n)。",
            },
            {
              title: "雜湊表裡的字串鍵與 HashDoS 攻擊",
              problem: "網站後端把使用者送來的表單欄位名稱放進雜湊表。攻擊者若刻意送出幾萬個雜湊值完全相同的名稱，所有鍵都擠進同一個桶子，每次插入都要和整條鏈比較，一個請求就能讓伺服器忙好幾秒。",
              why: "Java 的 String.hashCode 就是底數 31、自然溢位的多項式雜湊。「Aa」和「BB」的值都是 2112，把它們任意串接起來也全部碰撞，長度 2n 的碰撞字串就有 2ⁿ 個。2011 年底公開的 HashDoS 攻擊利用的正是這種固定底數，之後 Python、Ruby 等語言改用每次啟動隨機的雜湊種子，Java 8 則把碰撞過多的桶子改成平衡樹。自己寫字串雜湊時，底數也要隨機選。",
            },
            {
              title: "把所有後綴排序",
              problem: "建立基因組的後綴陣列，或做 bzip2 使用的 Burrows–Wheeler 轉換，都要把一個長字串的所有後綴排好順序。一般排序每次比較兩個後綴最壞要 O(n)，n 個後綴排下來是 O(n² log n)。",
              why: "比較兩個後綴等於「先找最長共同前綴，再比下一個字元」。「前 L 個字元相同」對 L 是單調的，所以能用子字串雜湊二分出共同前綴長度，每次比較降到 O(log n)，整個排序 O(n log² n)。專門的 SA-IS 演算法可以做到 O(n)，但雜湊版只要幾十行。",
            },
          ]}
          cue="大量檢查兩段子字串是否相等、把子字串放進集合或雜湊表、二分長度找最長重複、最長共同前綴、字典序比較，而且可以接受極小的出錯機率。"
        />
      </Section>

      <Section id="concept">
        <p>
          比較兩個長度 L 的字串要逐字元比，O(L)。雜湊的想法是先把字串變成一個數字：把字串看成 <strong>B 進位的數</strong>，每個字元是一個位數，<Code>hash(s) = s[0]·B^(L−1) + s[1]·B^(L−2) + … + s[L−1]</Code>，全部 mod 一個大質數 M，這就是<strong>多項式雜湊</strong>。它可以由左往右累加：<Code>h[i+1] = h[i]·B + s[i]</Code>，一次掃過就得到所有<strong>前綴雜湊</strong>，同時把 <Code>pw[i] = B^i</Code> 存起來。字元的值不能是 0：如果 a = 0，「a」和「aa」的雜湊都是 0，就像 007 和 7 分不出來，所以用 a = 1 起算或直接用字元編碼。
        </p>
        <p>
          有了前綴雜湊，任何子字串 <Code>s[l, r)</Code> 的雜湊都能 O(1) 算出。<Code>h[r]</Code> 是前 r 個字元組成的數，其中前 l 個字元被多乘了 <Code>B^(r−l)</Code>，所以 <Code>hash(l, r) = h[r] − h[l]·pw[r−l]</Code>。這和十進位裡「12345 去掉開頭的 12，就是 12345 − 12 × 1000 = 345」是同一件事。建表 O(n) 時間、O(n) 空間，之後任意兩段的相等檢查都是 O(1)。判讀規則是單向的：雜湊不同，字串<strong>一定不同</strong>；雜湊相同，字串<strong>幾乎一定相同</strong>。
        </p>
        <p>
          <strong>碰撞</strong>的機率怎麼估：兩個不同、長度不超過 n 的字串，雜湊的差是一個次數小於 n 的多項式，在 mod 質數 M 之下最多有 n−1 個根，所以底數 B 隨機選時，碰撞機率至多 (n−1)/M，實際上接近 1/M。真正危險的是一次比很多個：把 q 個雜湊值放進集合，碰撞的對數大約是 <Code>q²/(2M)</Code>。q = 10⁵、M ≈ 10⁹ 時期望值已經有 5 對，所以實務上用 <strong>M = 2⁶¹−1</strong>，或用<strong>兩個約 10⁹ 的質數各算一次</strong>（雙雜湊），期望值就降到 10⁻⁸ 以下。底數一定要隨機選：固定底數的雜湊可以被事先構造出碰撞，「Aa」和「BB」就是 Java 字串雜湊的一組。
        </p>
        <p>
          常見的坑：C++ 裡 <Code>h[r] − h[l]·pw</Code> 可能是負數，要先加 M 再取 mod；兩個 10⁹ 等級的數相乘要用 64 位元整數，模數用 2⁶¹−1 時連 64 位元都不夠，要用 128 位元乘法或拆位處理。圖省事讓 unsigned long long 自然溢位（等於 mod 2⁶⁴）更危險：2⁶⁴ 不是質數，長度 1024 的 Thue–Morse 字串和它 a、b 互換後的版本，不管選哪個奇數底數都會碰撞。答案必須絕對正確時，雜湊相同後再逐字元確認一次。和鄰近課程的關係：下一篇 Rabin-Karp 讓固定長度的視窗在字串上滑動，每移一格 O(1) 更新雜湊；KMP 和 Z-Algorithm 則是完全確定、沒有碰撞風險的比對方法，只是能回答的問題比雜湊窄。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>選一個大質數 M（常用 <Code>2⁶¹−1</Code>，或 <Code>10⁹+7</Code> 與 <Code>998244353</Code> 一起用），底數 B 在程式啟動時從 <Code>[256, M)</Code> 隨機挑。</>,
            <>由左到右建表：<Code>h[0] = 0</Code>、<Code>pw[0] = 1</Code>，<Code>h[i+1] = (h[i]·B + s[i]) mod M</Code>，<Code>pw[i+1] = pw[i]·B mod M</Code>。</>,
            <>取子字串 <Code>s[l, r)</Code> 的雜湊：<Code>(h[r] − h[l]·pw[r−l]) mod M</Code>，結果若是負數就加上 M。</>,
            <>比較兩段：長度不同或雜湊不同就一定不相等；雜湊相同視為相等，必須絕對正確時再逐字元確認。</>,
            <>要找最長重複片段或最長共同前綴時，利用「長度 L 成立，L−1 也成立」的單調性二分長度，每次檢查都用 O(1) 的子字串雜湊。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>s = abcabca，為了能手算，底數 B = 31、模數 M = 101，字元值 a = 1、b = 2、c = 3。前半段逐字元建表：藍色是剛讀到的字元和剛算出的 h、pw，框裡寫出這一步的算式。建完表後做三次比較：黃色是第一段以及公式用到的 h、pw 格子，第二段和第一段雜湊相同時變綠色、不同時變藍色。s[0, 3) 和 s[3, 6) 都是 abc，雜湊都是 16；s[1, 4) 和 s[4, 7) 都是 bca，都是 97；abc 對 bca 是 16 對 97，一定不同，不必逐字元比。M = 101 只有 101 種值，子字串一多就會碰撞，真正使用時要換成上面說的大模數。</p>
        <HashingDemo />
      </Section>

      <Section id="code">
        <p>Python 用單一模數 2⁶¹−1（Python 整數不會溢位），示範子字串比較和二分長度找最長重複片段，最後重現 Java 字串雜湊的碰撞。C++ 用 10⁹+7 與 998244353 雙模數，所有乘法都在 64 位元內，並用雜湊二分最長共同前綴來做後綴排序。兩種語言的底數都在啟動時隨機選，每次執行的雜湊值不同，但印出來的答案一樣。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 187", name: "Repeated DNA Sequences（固定長度 10，雜湊放進集合）", diff: "Medium" },
            { src: "LeetCode 718", name: "Maximum Length of Repeated Subarray（陣列也能雜湊，二分長度）", diff: "Medium" },
            { src: "LeetCode 1044", name: "Longest Duplicate Substring（二分長度 + 雜湊集合，要注意碰撞）", diff: "Hard" },
            { src: "LeetCode 1147", name: "Longest Chunked Palindrome Decomposition（從兩端貪心，雜湊比較頭尾片段）", diff: "Hard" },
            { src: "LeetCode 1316", name: "Distinct Echo Substrings（子字串雜湊判斷前後兩半相等，再去重）", diff: "Hard" },
            { src: "LeetCode 2223", name: "Sum of Scores of Built Strings（每個後綴和整串的共同前綴，二分；Z-Algorithm 篇會再遇到）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const stringHashingLesson: Lesson = { prereq: "Hash Table、Prefix Sum、Binary Search", Body };
