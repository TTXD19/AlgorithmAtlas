import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { FastPowDemo } from "@/components/lesson/demos/FastPowDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 遞迴版：x^n = (x^(n//2))²，n 是奇數再多乘一個 x
def power_rec(x, n):
    if n == 0:
        return 1
    half = power_rec(x, n // 2)          # 只遞迴一次；寫成兩次呼叫就退化成 O(n)
    return half * half * (x if n % 2 else 1)


# 迭代版：由低位往高位掃 n 的二進位，base 每一輪平方
def power_mod(x, n, mod):
    result, base = 1 % mod, x % mod
    while n > 0:
        if n & 1:                        # 這一位是 1：把 x^(2^i) 乘進答案
            result = result * base % mod
        base = base * base % mod         # x^(2^i) → x^(2^(i+1))
        n >>= 1
    return result


# 同一套做法換成矩陣：[[1, 1], [1, 0]]^n = [[F(n+1), F(n)], [F(n), F(n-1)]]
def mat_mul(A, B, mod):
    return [[(A[0][0] * B[0][0] + A[0][1] * B[1][0]) % mod, (A[0][0] * B[0][1] + A[0][1] * B[1][1]) % mod],
            [(A[1][0] * B[0][0] + A[1][1] * B[1][0]) % mod, (A[1][0] * B[0][1] + A[1][1] * B[1][1]) % mod]]


def fib_mod(n, mod):
    result, base = [[1, 0], [0, 1]], [[1, 1], [1, 0]]   # 單位矩陣就是矩陣的「1」
    while n > 0:
        if n & 1:
            result = mat_mul(result, base, mod)
        base = mat_mul(base, base, mod)
        n >>= 1
    return result[0][1]                  # 右上角是 F(n)


if __name__ == "__main__":
    print(power_rec(3, 13), power_rec(2, 10))      # 1594323 1024
    MOD = 10**9 + 7
    print(power_mod(3, 25, MOD), pow(3, 25, MOD))  # 288603514 288603514（內建三參數 pow 就是快速冪）
    print(fib_mod(10, MOD), fib_mod(10**18, MOD))  # 55 209783453（第 10¹⁸ 項只要約 60 輪）`;

const cpp = `#include <cstdint>
#include <iostream>

using u64 = std::uint64_t;

// 快速冪取模：兩數都小於 mod（≤ 2³²）時，乘積放得進 64 位元
u64 powMod(u64 x, u64 n, u64 mod) {
    u64 result = 1 % mod, base = x % mod;
    for (; n > 0; n >>= 1) {
        if (n & 1) result = result * base % mod;   // 這一位是 1 就乘進答案
        base = base * base % mod;                  // 準備下一位的 x^(2^(i+1))
    }
    return result;
}

// LeetCode 50：浮點數、負指數。n = INT_MIN 取負會溢位，先轉成 64 位元
double myPow(double x, int n) {
    long long e = n;
    if (e < 0) { x = 1 / x; e = -e; }
    double result = 1;
    for (; e > 0; e >>= 1) {
        if (e & 1) result *= x;
        x *= x;
    }
    return result;
}

// 2×2 矩陣快速冪算 F(n) mod m
struct Mat { u64 a, b, c, d; };                    // [[a, b], [c, d]]
Mat mul(const Mat& X, const Mat& Y, u64 m) {
    return {(X.a * Y.a + X.b * Y.c) % m, (X.a * Y.b + X.b * Y.d) % m,
            (X.c * Y.a + X.d * Y.c) % m, (X.c * Y.b + X.d * Y.d) % m};
}
u64 fibMod(u64 n, u64 m) {
    Mat result{1, 0, 0, 1}, base{1, 1, 1, 0};     // 單位矩陣、轉移矩陣
    for (; n > 0; n >>= 1) {
        if (n & 1) result = mul(result, base, m);
        base = mul(base, base, m);
    }
    return result.b;
}

int main() {
    const u64 MOD = 1000000007;
    std::cout << powMod(3, 13, MOD) << ' ' << powMod(3, 25, MOD) << '\\n';    // 1594323 288603514
    std::cout << myPow(2.0, 10) << ' ' << myPow(2.0, -2) << '\\n';            // 1024 0.25
    std::cout << fibMod(10, MOD) << ' ' << fibMod(1000000000000000000ULL, MOD) << '\\n';  // 55 209783453
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "HTTPS 握手裡的 RSA 運算",
              problem: "伺服器用 2048 位元的 RSA 金鑰簽章，要算 m^d mod N，其中 d 本身就是一個 2048 位元的數。逐次相乘要做大約 2²⁰⁴⁸ 次乘法，宇宙的年齡都不夠。",
              why: "把 d 寫成二進位，從低位往高位掃：每一位都把底數平方一次，遇到 1 就把它乘進答案，每次乘完立刻取模讓數字維持在 2048 位元。總共大約 2048 次平方加上一千多次乘法，一次簽章在毫秒內完成。",
            },
            {
              title: "線性遞推的第 10¹⁸ 項",
              problem: "某個計數問題的答案滿足 F(n) = F(n−1) + F(n−2)，題目要第 10¹⁸ 項對 10⁹+7 的餘數。就算每秒算十億項，一路推下去也要三十幾年。",
              why: "一次遞推等於乘上矩陣 [[1, 1], [1, 0]]，第 n 項就是這個矩陣的 n 次方。矩陣乘法同樣滿足結合律，快速冪照用：log₂ 10¹⁸ ≈ 60，大約 60 次平方加上最多 60 次乘法，每次是 2×2 矩陣相乘，瞬間算完。",
            },
            {
              title: "信用評等 30 年後的違約機率",
              problem: "銀行有一張「今年的評等明年變成什麼」的機率轉移矩陣，想知道一張現在是 A 級的債券，30 年後落在違約狀態的機率。",
              why: "30 年後的分布是轉移矩陣的 30 次方。30 = 11110₂，只要 4 次平方加上 4 次乘法，而不是連乘 29 次。狀態有 k 個時每次矩陣乘法是 O(k³)，快速冪把總成本壓到 O(k³ log n)。",
            },
          ]}
          cue="x 的 n 次方、n 很大（10⁹、10¹⁸）、答案取模、RSA 與模冪、線性遞推第 n 項、矩陣的 n 次方、重複套用同一個操作 n 次、乘法次數要 O(log n)。"
        />
      </Section>

      <Section id="concept">
        <p>
          算 xⁿ 最直接是乘 n − 1 次。<strong>快速冪</strong>用分治把指數切半：<Code>xⁿ = (x^⌊n/2⌋)²</Code>，n 是奇數時再多乘一個 x。算出一半、平方一次就得到全部，遞迴式是 <Code>T(n) = T(n/2) + O(1)</Code>，套 Master Theorem 的 a = 1、b = 2、d = 0 落在情況 2，是 <strong>O(log n)</strong> 次乘法。最常見的錯是把 <Code>power(x, n/2)</Code> 呼叫兩次再相乘：遞迴式變成 <Code>T(n) = 2T(n/2) + O(1)</Code>，又回到 O(n)，關鍵在「一半只算一次」。
        </p>
        <p>
          迭代版從二進位看同一件事。把 n 寫成 <Code>Σ bᵢ·2ⁱ</Code>，就有 <Code>xⁿ = ∏ x^(2ⁱ)</Code>，只乘 bᵢ = 1 的那幾項。從最低位往最高位掃，維持兩個<strong>不變量</strong>：處理第 i 位之前，<Code>base = x^(2ⁱ)</Code>，<Code>result = x^(n 的低 i 位)</Code>。第 i 位是 1 就把 base 乘進 result，然後 base 平方變成 <Code>x^(2ⁱ⁺¹)</Code>、n 右移一位。所有位元處理完，低位就是整個 n，result 正是 xⁿ。這個寫法不用遞迴，額外空間 O(1)。
        </p>
        <p>
          複雜度：n 有 <Code>⌊log₂ n⌋ + 1</Code> 個位元，每一位最多一次平方加一次乘法，總共不超過 <strong>2 log₂ n</strong> 次乘法；指數變成十倍，位元只多 3、4 個。這裡的 O(log n) 是「乘法的次數」：取模運算的每次乘法是 O(1)；沒有取模的大整數，數字越乘越長，每次乘法本身就越來越貴。空間上迭代版 O(1)，遞迴版要 O(log n) 的呼叫堆疊。快速冪只用到<strong>結合律</strong>和一個「1」（單位元素），所以不只適用於數字：矩陣的「1」是單位矩陣，一次 k×k 矩陣乘法 O(k³)，整體 O(k³ log n)，這就是用矩陣快速冪算線性遞推第 n 項的做法；置換、仿射變換等可以合成的操作也都能這樣「倍增」。
        </p>
        <p>
          常見的坑：<strong>溢位</strong>，每做一次乘法就要取模，而且兩個小於 mod 的數相乘必須放得進型別，mod = 10⁹+7 時 64 位元整數夠用，mod 接近 10¹⁸ 時就要 128 位元或特別的乘法；<strong>負指數</strong>（LeetCode 50）要先取倒數，而 32 位元的 <Code>INT_MIN</Code> 直接取負會溢位，先轉成 64 位元；<Code>x⁰ = 1</Code> 包括 x = 0 的情況，而 mod = 1 時答案應該是 0，所以初值寫 <Code>1 % mod</Code>。和相鄰課程的關係：Master Theorem 那篇的二分搜尋和這裡是同一個遞迴式；數學主題的 Modular Arithmetic 會用快速冪算模反元素，也就是費馬小定理的 <Code>a^(p−2) mod p</Code>。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>初始化 <Code>result = 1 % mod</Code>、<Code>base = x % mod</Code>。</>,
            <>當 <Code>n &gt; 0</Code>：若 <Code>n &amp; 1</Code> 是 1，<Code>result = result × base % mod</Code>。</>,
            <><Code>base = base × base % mod</Code>，<Code>n &gt;&gt;= 1</Code>，回到上一步。每一輪處理 n 的一個位元。</>,
            <>n 變成 0 時 <Code>result</Code> 就是答案。遞迴寫法則是先算 <Code>half = power(x, n // 2)</Code>，回傳 <Code>half²</Code> 或 <Code>half² × x</Code>，一半只算一次。</>,
            <>換成矩陣或其他可結合的操作時，把 1 換成單位元素、把乘法換成那個操作，其餘完全不變。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>底數固定是 3，可以切換指數 13、25、100。上方是指數的二進位，右邊是最低位，上排標出每一位的權重；從最低位往最高位一格一格處理，藍色是正在處理的位元，處理過的位元是 1 就變綠色。表格記下每一位時的 base（也就是 3 的 2ⁱ 次方）以及 result，所有乘法都對 10⁹+7 取模。右側兩條長條比較乘法次數：指數 13 要 6 次、25 要 7 次、100 只要 9 次，逐次相乘分別是 12、24、99 次。</p>
        <FastPowDemo />
      </Section>

      <Section id="code">
        <p>Python 放遞迴版、迭代的模冪，以及把同一套迴圈套在 2×2 矩陣上算費氏數列第 10¹⁸ 項。C++ 放模冪、處理浮點數與負指數的 LeetCode 50 寫法（注意 <Code>INT_MIN</Code>），和矩陣快速冪。三個迴圈長得一模一樣，差別只在「1」和「乘法」是什麼。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 509", name: "Fibonacci Number（用矩陣快速冪做到 O(log n)）", diff: "Easy" },
            { src: "LeetCode 50", name: "Pow(x, n)（負指數與 INT_MIN）", diff: "Medium" },
            { src: "LeetCode 1922", name: "Count Good Numbers（n 到 10¹⁵，答案是兩個模冪相乘）", diff: "Medium" },
            { src: "LeetCode 372", name: "Super Pow（指數是一個超長的十進位陣列）", diff: "Medium" },
            { src: "LeetCode 1969", name: "Minimum Non-Zero Product of the Array Elements（先推出公式，再用模冪算）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const fastPowLesson: Lesson = { prereq: "Recursion、Master Theorem", Body };
