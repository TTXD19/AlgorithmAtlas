import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { SieveDemo } from "@/components/lesson/demos/SieveDemo";
import type { Lesson } from "@/lib/lessons";

const python = `def sieve(n):
    """埃拉托斯特尼篩法：is_prime[x] 為 True 表示 x 是質數。O(n log log n)"""
    is_prime = [True] * (n + 1)
    is_prime[0:2] = [False] * min(2, n + 1)     # 0 和 1 都不是質數
    p = 2
    while p * p <= n:                           # p² > n 就停：更大的 p 沒有倍數要劃了
        if is_prime[p]:
            # 從 p² 開始劃：比它小的倍數 p·k（k < p）早就被 k 的質因數劃掉
            is_prime[p * p::p] = [False] * ((n - p * p) // p + 1)
        p += 1
    return is_prime


def linear_sieve(n):
    """線性篩：每個合數只被它的最小質因數劃一次。回傳 (質數列表, spf)，O(n)"""
    spf = [0] * (n + 1)                         # spf[x]：x 的最小質因數
    primes = []
    for i in range(2, n + 1):
        if spf[i] == 0:                         # 沒有人劃過它，是質數
            spf[i] = i
            primes.append(i)
        for p in primes:
            if p > spf[i] or i * p > n:         # p 一旦超過 i 的最小質因數，i·p 的最小質因數就不是 p
                break
            spf[i * p] = p
    return primes, spf


def factorize(x, spf):
    """查最小質因數表分解質因數，每一步至少除以 2，O(log x)"""
    factors = []
    while x > 1:
        p, cnt = spf[x], 0
        while x % p == 0:
            x //= p
            cnt += 1
        factors.append((p, cnt))
    return factors


if __name__ == "__main__":
    is_prime = sieve(60)
    print([x for x in range(61) if is_prime[x]])
    # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]
    print(sum(sieve(10**6)))                    # 78498：一百萬以內的質數個數
    primes, spf = linear_sieve(100)
    print(len(primes), factorize(84, spf), factorize(97, spf))
    # 25 [(2, 2), (3, 1), (7, 1)] [(97, 1)]`;

const cpp = `#include <algorithm>
#include <cstddef>
#include <iostream>
#include <vector>

// 回傳所有 ≤ n 的質數。vector<char> 每個數一個位元組，比 vector<bool> 存取快
std::vector<long long> primesUpTo(long long n) {
    std::vector<long long> primes;
    if (n < 2) return primes;
    std::vector<char> composite(static_cast<std::size_t>(n) + 1, 0);
    for (long long p = 2; p <= n / p; p++)                  // 寫成 p <= n / p，p * p 就不會溢位
        if (!composite[static_cast<std::size_t>(p)])
            for (long long m = p * p; m <= n; m += p) composite[static_cast<std::size_t>(m)] = 1;
    for (long long x = 2; x <= n; x++)
        if (!composite[static_cast<std::size_t>(x)]) primes.push_back(x);
    return primes;
}

// 區間篩：找 [L, R] 裡的質數。只需要 √R 以內的質數，記憶體 O(√R + (R − L))
std::vector<long long> primesInRange(long long L, long long R) {
    std::vector<long long> res;
    if (R < 2 || L > R) return res;
    L = std::max(L, 2LL);
    long long lim = 1;
    while ((lim + 1) <= R / (lim + 1)) lim++;               // lim = ⌊√R⌋，全程用整數
    std::vector<char> composite(static_cast<std::size_t>(R - L + 1), 0);
    for (long long p : primesUpTo(lim)) {
        long long start = std::max(p * p, (L + p - 1) / p * p);   // 區間內第一個 ≥ p² 的 p 的倍數
        for (long long m = start; m <= R; m += p) composite[static_cast<std::size_t>(m - L)] = 1;
    }
    for (long long x = L; x <= R; x++)
        if (!composite[static_cast<std::size_t>(x - L)]) res.push_back(x);
    return res;
}

int main() {
    std::cout << primesUpTo(10000000).size() << '\\n';          // 664579：一千萬以內的質數個數
    for (long long p : primesInRange(1000000000000LL, 1000000000100LL)) std::cout << p << ' ';
    std::cout << '\\n';                                          // 1000000000039 1000000000061 1000000000063 1000000000091
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "產生 RSA 金鑰前先過濾候選數",
              problem: "產生 2048 位元的 RSA 金鑰，要隨機挑大奇數並測試是不是質數。機率質數測試每跑一次都要做上千位元的模冪運算，很貴，而隨機挑到的奇數大多數其實有很小的因數。",
              why: "OpenSSL 等函式庫內建前幾千個小質數的表，候選數先對這些小質數試除，能被整除的直接丟掉，只有通過的才進入昂貴的機率測試。這張小質數表就是用篩法產生的；大部分候選數在這一關就被刷掉，省下大量白做的模冪運算。",
            },
            {
              title: "大量整數的質因數分解",
              problem: "資料分析程式要替 100 萬個不超過 10⁷ 的整數計算因數個數，每個數都得先分解質因數。逐一試除到 √x，一個數最壞要做三千多次除法，最壞加起來是數十億次。",
              why: "先用線性篩在 O(N) 時間內建出「最小質因數表」spf，之後分解 x 只要反覆除以 spf[x]，每一步數字至少減半，一個數 O(log x) 步就分解完。上限 10⁷ 的表用 32 位元整數存約 40 MB，換來每次分解只要二十幾步以內。",
            },
            {
              title: "驗證哥德巴赫猜想到 4 × 10¹⁸",
              problem: "數學家想用電腦驗證「每個大於 2 的偶數都能寫成兩個質數的和」在非常大的範圍內成立，需要一段一段列出 10¹⁸ 附近的所有質數。開一個長度 10¹⁸ 的陣列是不可能的。",
              why: "區間篩只需要 √R 以內的質數（10⁹ 以內），再對長度幾百萬的區間 [L, R] 劃掉這些質數的倍數，記憶體只和區間長度有關。Oliveira e Silva 等人的驗證計畫正是用分段篩法，一段接一段地掃過整個範圍。",
            },
          ]}
          cue="需要某個上限內的所有質數、大量查詢一個數是不是質數、大量質因數分解（最小質因數表）、區間 [L, R] 內的質數、上限大約 10⁷ 以內可以開陣列。"
        />
      </Section>

      <Section id="concept">
        <p>
          判斷一個數是不是質數，最直接的方法是<strong>試除</strong>到 √x，但要列出 N 以內所有質數時，逐個試除是 O(N√N)。<strong>埃拉托斯特尼篩法</strong>反過來做：不去檢查每個數，而是讓每個質數去<strong>劃掉自己的倍數</strong>。一開始把 2 到 N 都當成可能是質數，由小到大掃，遇到第一個還沒被劃掉的數 p，它一定是質數，因為如果它有比自己小的質因數，早就被那個質因數劃掉了；接著把 p 的倍數全部劃掉，再找下一個。
        </p>
        <p>
          兩個讓它更快的觀察。第一，p 的倍數<strong>從 p² 開始劃</strong>就好：比 p² 小的倍數是 <Code>p·k</Code>，其中 k &lt; p，k 的質因數比 p 小，這個數在處理那個更小的質數時已經劃掉了。第二，<strong>p² &gt; N 就可以停</strong>：任何不超過 N 的合數都能寫成 <Code>a·b</Code> 且 a ≤ b，於是 <Code>a² ≤ N</Code>，它一定有一個不超過 √N 的質因數，早就被劃掉了。所以外層迴圈只跑到 √N，之後陣列裡還沒被劃掉的數全是質數。
        </p>
        <p>
          複雜度：質數 p 要劃大約 N/p 次，總次數是 <Code>N/2 + N/3 + N/5 + N/7 + …</Code>，而質數倒數的總和只以 log log N 的速度成長，所以時間 <strong>O(N log log N)</strong>。N = 10⁷ 時 ln ln N 還不到 3，實際上幾乎是線性的。空間是一個長度 N + 1 的布林陣列，<strong>O(N)</strong>。兩個常用的變形：<strong>線性篩</strong>讓每個合數只被它的最小質因數劃掉一次，嚴格 O(N)，還順便得到<strong>最小質因數表</strong>，之後分解任何 x ≤ N 都只要 O(log x)；<strong>區間篩</strong>先求出 √R 以內的質數，再用它們劃掉區間 [L, R] 裡的倍數，R 大到 10¹² 也只需要 √R 加上區間長度的記憶體。
        </p>
        <p>
          常見的坑：0 和 1 忘了設成非質數；陣列開成 N 而不是 N + 1；C++ 裡 <Code>p * p</Code> 在 N 接近 2³¹ 時會溢位，寫成 <Code>p &lt;= n / p</Code>；每個質數都從 2p 開始劃雖然正確，但白白多走很多已經劃掉的數；區間篩的起點要取 p² 和「區間內第一個 p 的倍數」兩者較大的，否則 L 很小時會把 p 本身劃掉。和鄰近課程的關係：上一篇 GCD 不需要分解質因數，而篩法正好提供大量分解的工具；下一篇 Modular Arithmetic 常用質數當模數，費馬小定理也要求模數是質數；如果只是要判斷一個 10¹⁸ 等級的數是不是質數，應該用 Miller–Rabin 這類機率測試，而不是篩法。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>開一個長度 <Code>N + 1</Code> 的布林陣列 <Code>is_prime</Code>，全部設為 true，再把 0 和 1 設為 false。</>,
            <>p 從 2 開始往上走，只要 <Code>p² ≤ N</Code> 就繼續。</>,
            <>若 <Code>is_prime[p]</Code> 仍為 true，p 就是質數，把 <Code>p², p² + p, p² + 2p, …</Code> 不超過 N 的位置全部設為 false；否則直接換下一個 p。</>,
            <><Code>p² &gt; N</Code> 時停止，陣列裡仍是 true 的位置就是 N 以內的全部質數。</>,
            <>要大量分解質因數時改用線性篩記錄最小質因數；上限大到開不了陣列時，只篩到 <Code>√R</Code>，再對區間 <Code>[L, R]</Code> 做區間篩。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>1 到 60 排成每列 10 個，√60 ≈ 7.75。藍色是目前確認的質數 p，黃色是這一步劃掉的倍數，黃色虛線是早就被更小的質數劃掉、這一輪又走到的數，灰色加刪除線是合數，綠色是確定的質數。p = 2 從 4 開始劃掉全部 29 個偶數；p = 3 從 9 開始，比 9 小的倍數 6 已經被 2 劃掉，這一輪走訪 18 個數、新劃掉 9 個；p = 5 從 25 開始，只新劃掉 25、35、55；p = 7 只剩 49 是新的。下一個沒被劃掉的是 11，但 11² = 121 &gt; 60，所以停止。下方表格記錄每個質數的工作量：總共走訪 57 次、劃掉 42 個合數，其中 15 次是重複劃到，剩下的 17 個數就是 60 以內的質數。</p>
        <SieveDemo />
      </Section>

      <Section id="code">
        <p>Python 放標準篩法（用切片一次劃掉整排倍數），以及順便記錄最小質因數的線性篩與查表分解。C++ 放一般篩法和區間篩，示範在 10¹² 到 10¹² + 100 之間找質數：只篩到 √R = 10⁶，陣列長度只有 101。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 204", name: "Count Primes", diff: "Medium" },
            { src: "LeetCode 2523", name: "Closest Prime Numbers in Range", diff: "Medium" },
            { src: "LeetCode 2521", name: "Distinct Prime Factors of Product of Array（最小質因數表分解）", diff: "Medium" },
            { src: "LeetCode 3233", name: "Find the Count of Numbers Which Are Not Special（質數的平方才有恰好兩個真因數）", diff: "Medium" },
            { src: "LeetCode 952", name: "Largest Component Size by Common Factor（分解質因數後用 Union-Find 合併）", diff: "Hard" },
            { src: "LeetCode 2709", name: "Greatest Common Divisor Traversal", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const sieveLesson: Lesson = { prereq: "GCD & LCM、Array & Dynamic Array", Body };
