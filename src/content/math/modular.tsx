import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { ModularDemo } from "@/components/lesson/demos/ModularDemo";
import type { Lesson } from "@/lib/lessons";

const python = `MOD = 1_000_000_007


def mod_pow(a, e, m=MOD):
    """快速冪：a^e mod m，O(log e)。Python 內建的 pow(a, e, m) 做的是同一件事"""
    a %= m
    result = 1 % m
    while e:
        if e & 1:
            result = result * a % m
        a = a * a % m                           # 每一步都取模，數字不會長大
        e >>= 1
    return result


def mod_inv(a, p=MOD):
    """費馬小定理：p 是質數時 a 的反元素是 a^(p-2)。a 是 p 的倍數就沒有反元素"""
    if a % p == 0:
        raise ValueError("a 是 p 的倍數，沒有反元素")
    return mod_pow(a, p - 2, p)


def inverses_upto(n, p=MOD):
    """1 到 n 的反元素一次算完，O(n)。p 必須是大於 n 的質數"""
    inv = [0] * (n + 1)
    if n >= 1:
        inv[1] = 1
    for i in range(2, n + 1):
        inv[i] = (p - p // i) * inv[p % i] % p  # 由 p = (p // i)·i + p % i 取模後整理而來
    return inv


def iban_valid(iban):
    """IBAN 檢查碼：前四碼移到最後、字母換成 10 到 35，整串數字 mod 97 要等於 1。
    這個數字有三十幾位，邊讀邊取模就不用組出大整數"""
    s = iban.replace(" ", "")
    s = s[4:] + s[:4]
    r = 0
    for ch in s:
        v = int(ch, 36)                         # 0-9 → 0 到 9，A-Z → 10 到 35
        r = (r * (100 if v >= 10 else 10) + v) % 97
    return r == 1


if __name__ == "__main__":
    print(mod_pow(5, 11, 13), mod_inv(5, 13))   # 8 8
    print(7 * mod_inv(5, 13) % 13)              # 4：模 13 之下的 7 / 5
    print(mod_inv(2), 2 * mod_inv(2) % MOD)     # 500000004 1
    print(inverses_upto(12, 13)[1:])            # [1, 7, 9, 10, 8, 11, 2, 5, 3, 4, 6, 12]
    print(iban_valid("GB82 WEST 1234 5698 7654 32"), iban_valid("GB82 WEST 1234 5698 7654 23"))   # True False
    print((3 - 5) % 7)                          # 5：Python 的 % 結果永遠不是負數`;

const cpp = `#include <cstdint>
#include <iostream>

const std::int64_t MOD = 1000000007;

// a^e mod m。兩個小於 m 的數相乘最多約 10¹⁸，int64 放得下；m 更大就要換 128 位元乘法
std::int64_t modPow(std::int64_t a, std::int64_t e, std::int64_t m = MOD) {
    a %= m;
    if (a < 0) a += m;                                  // C++ 的 % 會保留被除數的負號
    std::int64_t result = 1 % m;
    while (e > 0) {
        if (e & 1) result = result * a % m;
        a = a * a % m;
        e >>= 1;
    }
    return result;
}

// 質數模數：費馬小定理
std::int64_t modInv(std::int64_t a, std::int64_t p = MOD) { return modPow(a, p - 2, p); }

// 任意模數：擴展歐幾里得，維持 r = a·s (mod m)。gcd(a, m) ≠ 1 時沒有反元素，回傳 -1
std::int64_t modInvGeneral(std::int64_t a, std::int64_t m) {
    std::int64_t r0 = ((a % m) + m) % m, r1 = m, s0 = 1, s1 = 0;
    while (r1 != 0) {
        std::int64_t q = r0 / r1, r2 = r0 - q * r1, s2 = s0 - q * s1;
        r0 = r1; r1 = r2; s0 = s1; s1 = s2;
    }
    if (r0 != 1) return -1;
    return ((s0 % m) + m) % m;
}

int main() {
    std::cout << modPow(5, 11, 13) << ' ' << modInv(5, 13) << '\\n';            // 8 8
    std::cout << modInvGeneral(5, 12) << ' ' << modInvGeneral(4, 12) << ' '
              << modPow(5, 10, 12) << '\\n';                                     // 5 -1 1：費馬在合數模數給錯答案

    // 機率要以分數 P/Q 取模輸出：兩顆骰子點數和為 7 的機率是 6/36
    std::cout << 6 * modInv(36) % MOD << ' ' << modInv(6) << '\\n';             // 166666668 166666668：6/36 = 1/6

    std::cout << (3 - 5) % 7 << ' ' << ((3 - 5) % 7 + 7) % 7 << '\\n';          // -2 5：負數要加回模數

    // 指數可以對 p − 1 取模（費馬），不能對 p 取模
    std::cout << modPow(3, (MOD - 1) + 5) << ' ' << modPow(3, 5) << '\\n';      // 243 243
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "HTTPS 連線的 Diffie–Hellman 金鑰交換",
              problem: "瀏覽器和伺服器要在會被竊聽的網路上約定一把共同金鑰。雙方各自挑一個 2048 位元的祕密數字 a、b，公開交換的只有 g^a 和 g^b。這些數字的真實大小是 2048 位元再取 2048 位元的次方，宇宙裡的原子都不夠寫。",
              why: "所有計算都在模一個 2048 位元的質數 p 之下進行：g^a mod p 用快速冪每一步取模，數字永遠不超過 p，兩三千次模乘法就算完。對方收到後再算 (g^b)^a mod p，兩邊得到同一個 g^(ab) mod p；竊聽者手上只有 g^a、g^b，要從中反推 a 就是困難的離散對數問題。",
            },
            {
              title: "IBAN 銀行帳號的檢查碼",
              problem: "國際匯款的 IBAN 帳號長達三十幾個字元，打錯一碼錢就會匯到別人帳戶。系統必須在送出前檢查格式，而 IBAN 的規則是：前四碼移到最後、字母換成兩位數，得到的三十多位整數除以 97 餘數要等於 1。這個整數早就超過 64 位元。",
              why: "取模可以分配到加法和乘法上，所以不必組出整個大整數：從左到右每讀一位，就把目前的餘數乘 10 再加上新的數字，然後立刻 mod 97，餘數永遠小於 97。97 是質數，任何一個數字打錯、或相鄰兩個數字對調，都會讓餘數改變，一定抓得到。",
            },
            {
              title: "把主金鑰拆給多位主管保管",
              problem: "公司的主金鑰不能交給單一個人。要把它拆成 5 份分給 5 位主管，任意 3 位到齊就能還原，但只有 2 位的話完全得不到任何資訊。",
              why: "Shamir 秘密分享把金鑰當成一個二次多項式的常數項，發給每位主管多項式上的一個點，所有運算都在模大質數之下。3 個點用拉格朗日插值還原多項式，公式裡要做除法，模數之下的除法就是乘上反元素。模數是質數，所以任何非零的數都有反元素，用費馬小定理加快速冪就能算。",
            },
          ]}
          cue="答案很大要求取模 10⁹+7、中間計算會溢位、大整數的餘數、要在模數之下做除法（分數、機率、期望值）、次方很大的 a^b mod m、反元素、密碼學與檢查碼。"
        />
      </Section>

      <Section id="concept">
        <p>
          <Code>a mod m</Code> 是 a 除以 m 的餘數，<Code>a ≡ b (mod m)</Code> 表示 a 和 b 除以 m 的餘數相同，也就是 m 整除 <Code>a − b</Code>。模運算最重要的性質是它能<strong>分配到加、減、乘</strong>上：<Code>(a + b) mod m = ((a mod m) + (b mod m)) mod m</Code>，減法和乘法同理。所以每做一次運算就可以立刻取模，中間值永遠小於 m。題目常用的 <Code>10⁹+7</Code> 是質數，兩個小於它的數相加還在 32 位元有號整數內，相乘不超過 10¹⁸，64 位元整數放得下。
        </p>
        <p>
          減法和除法要小心。C++ 的 <Code>%</Code> 會保留被除數的正負號，<Code>(3 − 5) % 7</Code> 是 −2，要寫成 <Code>(a − b + m) % m</Code> 拉回 0 到 m − 1；Python 的 <Code>%</Code> 結果則不會是負數。<strong>除法不能分配</strong>：<Code>(12 / 4) mod 5 = 3</Code>，但 <Code>12 mod 5 = 2</Code>、<Code>4 mod 5 = 4</Code>，2 除以 4 連整數都不是。解法是<strong>反元素</strong>：若 <Code>b · x ≡ 1 (mod m)</Code>，x 就記作 <Code>b⁻¹</Code>，「除以 b」改成「乘上 b⁻¹」。反元素存在的充要條件是 <Code>gcd(b, m) = 1</Code>。
        </p>
        <p>
          模數是質數 p 時，求反元素有現成公式。<strong>費馬小定理</strong>：a 不是 p 的倍數時 <Code>a^(p−1) ≡ 1 (mod p)</Code>。證明就是示範裡的觀察：1 到 p − 1 各乘上 a，餘數恰好是 1 到 p − 1 的重新排列，兩邊全部乘起來再約掉 <Code>(p−1)!</Code> 就得到它。拆出一個 a，<Code>a⁻¹ ≡ a^(p−2)</Code>，用快速冪 <strong>O(log p)</strong> 時間、O(1) 空間算出來。模數不是質數時，改用擴展歐幾里得，同樣 O(log m)，前提是 <Code>gcd(a, m) = 1</Code>。需要 1 到 n 全部的反元素時，遞推式 <Code>inv[i] = (p − ⌊p/i⌋) · inv[p mod i] mod p</Code> 讓總時間只有 <strong>O(n)</strong>。
        </p>
        <p>
          常見的坑：先相乘才取模，<Code>int</Code> 已經溢位了，乘法前要轉成 64 位元；減法之後忘了加回 m；對合數模數套用費馬小定理，示範裡 <Code>5^10 mod 12</Code> 得到 1，真正的反元素卻是 5；想求 0 或 p 的倍數的反元素；取模之後還拿來比大小，取模不保留大小順序。另一個容易錯的地方是指數：<Code>a^e mod p</Code> 的指數可以對 <Code>p − 1</Code> 取模（前提是 a 不是 p 的倍數），不能對 p 取模。和鄰近課程的關係：Fast Exponentiation 提供 <Code>a^e mod m</Code> 的計算方法；GCD 的擴展歐幾里得處理非質數模數；下一篇 Combinatorics 要算 <Code>C(n, k) mod p</Code>，會用反元素把階乘的除法換成乘法。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>選定模數 m，每次加、減、乘之後立刻取模，讓中間值永遠小於 m；乘法前確認 <Code>(m − 1)²</Code> 放得進使用的整數型別。</>,
            <>減法寫成 <Code>(a − b + m) mod m</Code>；任何可能是負數的值都用 <Code>((x mod m) + m) mod m</Code> 拉回 0 到 m − 1。</>,
            <>遇到除以 b：先確認 <Code>gcd(b, m) = 1</Code>，把「除以 b」換成「乘上 b 的反元素」。</>,
            <>模數是質數 p 時，反元素是 <Code>b^(p−2) mod p</Code>，用快速冪計算；模數不是質數時用擴展歐幾里得。</>,
            <>要 1 到 n 全部的反元素時，用 <Code>inv[i] = (p − ⌊p/i⌋) · inv[p mod i] mod p</Code> 由小到大 O(n) 算完。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>在模 13 之下找 5 的反元素。第一段把 k = 1 到 12 逐一乘上 5 再取餘數：藍色是這一步，下排綠色標出已經出現過的餘數，乘到 k = 8 時餘數是 1，黃色標出 5 的反元素 8。乘完 12 個之後每個餘數剛好出現一次，由此推出費馬小定理，得到 5⁻¹ ≡ 5¹¹。第二段用快速冪算 5¹¹ mod 13：11 的二進位是 1011，表格逐位列出 base 和 result，四輪之後 result = 8，和試出來的一致；接著用它算出 7 / 5 ≡ 4。最後換成合數模數 12：a = 4 時餘數只有 0、4、8，1 從來不出現，沒有反元素；a = 5 雖然有反元素 5，照抄費馬公式卻算出 1，黃色框標出這個錯誤。</p>
        <ModularDemo />
      </Section>

      <Section id="code">
        <p>Python 放快速冪、費馬小定理求反元素、O(n) 算出 1 到 n 的反元素，以及邊讀邊取模的 IBAN 檢查。C++ 放快速冪、費馬版與擴展歐幾里得版的反元素，並示範三個常見情境：機率以分數取模輸出、負數的餘數、指數對 p − 1 取模。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1497", name: "Check If Array Pairs Are Divisible by k（負數的餘數要先拉回正的）", diff: "Medium" },
            { src: "LeetCode 1015", name: "Smallest Integer Divisible by K（只記餘數，不記整個數）", diff: "Medium" },
            { src: "LeetCode 2550", name: "Count Collisions of Monkeys on a Polygon（2ⁿ − 2 取模，減完要加回模數）", diff: "Medium" },
            { src: "LeetCode 2961", name: "Double Modular Exponentiation", diff: "Medium" },
            { src: "LeetCode 1808", name: "Maximize Number of Nice Divisors（拆成 3 的次方，快速冪取模）", diff: "Hard" },
            { src: "LeetCode 1622", name: "Fancy Sequence（全體乘法要反過來做，需要模反元素）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const modularLesson: Lesson = { prereq: "Fast Exponentiation、GCD & LCM", Body };
