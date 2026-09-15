import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { GcdDemo } from "@/components/lesson/demos/GcdDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from functools import reduce


def gcd(a, b):
    """輾轉相除法：gcd(a, b) = gcd(b, a mod b)。O(log min(a, b))"""
    a, b = abs(a), abs(b)
    while b:
        a, b = b, a % b                  # 大的換成餘數，直到餘數為 0
    return a


def lcm(a, b):
    """最小公倍數：先除再乘，中間值不會超過答案"""
    if a == 0 or b == 0:
        return 0
    return abs(a // gcd(a, b) * b)


def ext_gcd(a, b):
    """擴展歐幾里得（a, b >= 0）：回傳 (g, x, y)，滿足 a*x + b*y == g"""
    if b == 0:
        return a, 1, 0                   # a*1 + 0*0 == a
    g, x1, y1 = ext_gcd(b, a % b)        # b*x1 + (a % b)*y1 == g
    # 代入 a % b == a - (a // b)*b，整理成 a 和 b 的係數
    return g, y1, x1 - (a // b) * y1


def mod_inverse(a, m):
    """a 在模 m 下的反元素；m 不必是質數，只要 gcd(a, m) == 1"""
    g, x, _ = ext_gcd(a % m, m)
    if g != 1:
        return None                      # 不互質就沒有反元素
    return x % m                         # x 可能是負的，拉回 [0, m)


if __name__ == "__main__":
    print(gcd(48000, 44100))             # 300（44.1 kHz → 48 kHz 的比例是 160/147）
    print(lcm(24, 30))                   # 120
    print(ext_gcd(252, 105))             # (21, -2, 5)：252·(−2) + 105·5 = 21
    print(mod_inverse(17, 3120))         # 2753（RSA 範例的私鑰 d）
    print(mod_inverse(6, 9))             # None（gcd(6, 9) = 3）
    print(reduce(gcd, [84, 126, 210]))   # 42：多個數就兩兩折疊
    print(reduce(lcm, [6, 8, 15]))       # 120
    # 內建：math.gcd，Python 3.9 起還有 math.lcm，兩者都接受多個參數`;

const cpp = `#include <cstdlib>
#include <iostream>
#include <numeric>
#include <tuple>
#include <vector>

// 輾轉相除法：gcd(a, b) = gcd(b, a mod b)。O(log min(a, b))
long long gcd(long long a, long long b) {
    a = std::llabs(a);                   // C++ 的 % 結果跟著被除數的正負號，先取絕對值
    b = std::llabs(b);
    while (b != 0) {
        long long r = a % b;
        a = b;
        b = r;
    }
    return a;
}

// 先除再乘：寫成 a * b / gcd 時 a * b 可能先溢位
long long lcm(long long a, long long b) {
    if (a == 0 || b == 0) return 0;
    return std::llabs(a / gcd(a, b) * b);
}

// 擴展歐幾里得（迭代版，對應示範的表格）。a, b >= 0
// 每一列都維持 r = a·s + b·t，回傳 {g, x, y} 使 a*x + b*y == g
std::tuple<long long, long long, long long> extGcd(long long a, long long b) {
    long long r0 = a, s0 = 1, t0 = 0;
    long long r1 = b, s1 = 0, t1 = 1;
    auto next = [](long long& x0, long long& x1, long long q) {
        long long x2 = x0 - q * x1;      // 新的一列 = 上上列 − q × 上一列
        x0 = x1;
        x1 = x2;
    };
    while (r1 != 0) {
        long long q = r0 / r1;
        next(r0, r1, q);                 // r、s、t 用同一條規則往下算
        next(s0, s1, q);
        next(t0, t1, q);
    }
    return {r0, s0, t0};
}

// a 在模 m 下的反元素（m 不必是質數）；不存在時回傳 -1
long long modInverse(long long a, long long m) {
    auto [g, x, y] = extGcd((a % m + m) % m, m);
    if (g != 1) return -1;
    return (x % m + m) % m;              // x 可能是負的
}

int main() {
    std::cout << gcd(48000, 44100) << "\\n";            // 300
    std::cout << lcm(24, 30) << "\\n";                  // 120
    auto [g, x, y] = extGcd(252, 105);
    std::cout << g << " " << x << " " << y << "\\n";    // 21 -2 5
    std::cout << modInverse(17, 3120) << "\\n";         // 2753
    std::cout << modInverse(6, 9) << "\\n";             // -1

    // C++17 的 <numeric> 內建 std::gcd、std::lcm，多個數用 accumulate 折疊
    std::vector<long long> v = {84, 126, 210};
    long long all = std::accumulate(v.begin(), v.end(), 0LL,
                                    [](long long p, long long q) { return std::gcd(p, q); });
    std::cout << all << "\\n";                          // 42（gcd(0, a) = a，所以初值用 0）
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "音訊重取樣：44.1 kHz 轉成 48 kHz",
              problem: "CD 音樂每秒 44100 個取樣，影片規格要 48000。重取樣器的做法是先插值放大 L 倍、再抽取縮小 M 倍，L/M 必須等於 48000/44100。直接拿 L = 48000，多相濾波器就得切成 48000 個相位。",
              why: "比例要先約分：gcd(48000, 44100) = 300，所以 L/M = 160/147，濾波器只要 160 個相位。輾轉相除四次除法就得到 300，完全不需要把兩個數做質因數分解。",
            },
            {
              title: "120Hz 螢幕為什麼能順暢播 24 fps 電影和 30 fps 影片",
              problem: "電影每秒 24 格，網路影片常是 30 格。60Hz 螢幕上 24 fps 的每一格只能輪流停 2 次、3 次更新，播放速度忽快忽慢，看起來會微微頓挫。要挑一個更新率，讓兩種格率都能整除。",
              why: "要找的是 24 和 30 的最小公倍數：lcm(24, 30) = 24 ÷ gcd(24, 30) × 30 = 24 ÷ 6 × 30 = 120。在 120Hz 下，24 fps 每格剛好停 5 次更新，30 fps 剛好 4 次。排程裡「幾個週期什麼時候再次對齊」都是同一個算式。",
            },
            {
              title: "產生 RSA 私鑰",
              problem: "教科書範例：p = 61、q = 53，φ(n) = 60 × 52 = 3120，公鑰指數 e = 17。私鑰 d 必須滿足 17 × d 除以 3120 餘 1。真正的金鑰 φ(n) 有 2048 位元，從 1 開始逐一試 d 永遠試不完。",
              why: "3120 不是質數，不能直接套費馬小定理求反元素。擴展歐幾里得在算 gcd(17, 3120) = 1 的同時，求出 17x + 3120y = 1 的整數解，x 取模 3120 就是 d = 2753。步數只和較小那個數的位數有關，實務上 e = 65537，就算 φ(n) 有 2048 位元也只要二十次上下的除法。",
            },
          ]}
          cue="最大公因數、最小公倍數、約分、通分、比例、週期何時重合、整除、ax + by = c 有沒有整數解、模數不是質數時的反元素、陣列所有數的公因數。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>輾轉相除法</strong>（歐幾里得演算法）只靠一個等式：<Code>gcd(a, b) = gcd(b, a mod b)</Code>。理由是 <Code>a mod b = a − q·b</Code>：任何同時整除 a 和 b 的數，一定也整除 <Code>a − q·b</Code>；反過來，同時整除 b 和餘數 r 的數，也整除 <Code>a = q·b + r</Code>。兩組數的公因數集合完全相同，最大的那個當然也相同。每做一次，數字就變小，直到餘數為 0，而 <Code>gcd(g, 0) = g</Code>。整個過程從不需要知道 a、b 的質因數，這是它比「分解質因數再取共同部分」快得多的原因。
        </p>
        <p>
          為什麼快：看連續兩步 <Code>(a, b) → (b, r) → (r, r′)</Code>。若 <Code>b ≤ a/2</Code>，則 <Code>r &lt; b ≤ a/2</Code>；若 <Code>b &gt; a/2</Code>，商只能是 1，<Code>r = a − b &lt; a/2</Code>。所以<strong>每兩步第一個數至少減半</strong>，除法次數是 <strong>O(log min(a, b))</strong>。最壞情況是相鄰的費氏數，每次商都是 1、縮得最慢，例如 <Code>gcd(89, 55)</Code> 要 9 次除法。迴圈版只用兩個變數，空間 <strong>O(1)</strong>；遞迴版要 O(log) 的呼叫堆疊。最小公倍數靠 <Code>gcd(a, b) × lcm(a, b) = a × b</Code> 得到，寫成 <Code>a / gcd × b</Code>。多個數就兩兩折疊，總共 O(n log M)，M 是最大值；gcd 一旦變成 1 就可以提前停。
        </p>
        <p>
          <strong>擴展歐幾里得</strong>在求 gcd 的同時找出整數 x、y 使 <Code>ax + by = gcd(a, b)</Code>，這組解一定存在（<strong>Bézout 等式</strong>）。遞迴寫法：假設已經求出 <Code>b·x′ + (a mod b)·y′ = g</Code>，把 <Code>a mod b = a − ⌊a/b⌋·b</Code> 代進去整理，得到 <Code>x = y′</Code>、<Code>y = x′ − ⌊a/b⌋·y′</Code>。兩個直接的推論：<Code>ax + by = c</Code> 有整數解<strong>若且唯若 g 整除 c</strong>；當 <Code>gcd(a, m) = 1</Code> 時，<Code>ax + my = 1</Code> 兩邊取模 m 得到 <Code>ax ≡ 1</Code>，x 就是 a 的<strong>模反元素</strong>。Modular Arithmetic 那篇用費馬小定理加快速冪求反元素，但那要求模數是質數；擴展歐幾里得只要求互質。
        </p>
        <p>
          常見的坑：用減法版 <Code>gcd(a − b, b)</Code> 代替取餘數，<Code>gcd(10⁹, 1)</Code> 要減十億次；C++ 的 <Code>%</Code> 結果跟著被除數的正負號，負數要先取絕對值（C++17 的 <Code>std::gcd</Code> 已經處理好）；lcm 寫成 <Code>a * b / gcd</Code> 會在除之前溢位，而且 a、b 有 0 時會除以 0；擴展歐幾里得算出的 x 常是負的，當反元素用之前要 <Code>(x % m + m) % m</Code>。題目裡看到分數，通常存成約分後的 <Code>(分子, 分母)</Code> 並把負號固定放在分子，就不會有浮點誤差，也能直接拿來當雜湊表的 key。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>先取絕對值。約定 <Code>gcd(a, 0) = a</Code>，所以 <Code>gcd(0, 0) = 0</Code>。</>,
            <><Code>while b != 0</Code>：<Code>a, b = b, a % b</Code>。迴圈結束時 a 就是最大公因數。a &lt; b 也不必先交換，第一輪會自動換過來。</>,
            <>最小公倍數：任一數為 0 就回傳 0，否則回傳 <Code>a // gcd(a, b) * b</Code>，先除再乘。多個數就從左到右折疊 gcd 或 lcm。</>,
            <>擴展版：<Code>b == 0</Code> 時回傳 <Code>(a, 1, 0)</Code>；否則遞迴求出 <Code>(g, x′, y′)</Code>，回傳 <Code>(g, y′, x′ − (a // b)·y′)</Code>。迭代版則讓每一列維持 <Code>r = a·s + b·t</Code>，r、s、t 都用「上上列 − q × 上一列」往下算。</>,
            <>應用：解 <Code>ax + by = c</Code> 先檢查 <Code>c % g == 0</Code>，有解時把 x、y 乘上 <Code>c / g</Code>。求 a 模 m 的反元素時確認 <Code>g == 1</Code>，答案是 <Code>x % m</Code>（拉回 0 到 m − 1）。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>用 252 和 105，分成兩段。前半段是輾轉相除：左邊逐行寫出「被除數 = 商 × 除數 + 餘數」，黃色是每行的餘數，下一行它就變成除數；右邊的表是餘數序列 r 和商 q。藍色是目前這一步，三次除法後餘數變 0，上一個餘數 21 標成綠色，接著順便算出 lcm = 1260。後半段是擴展歐幾里得：表格多出 s、t 兩欄，每一列都滿足 r = 252·s + 105·t。留意 s、t 和 r 走的是同一條「上上列減掉 q 倍的上一列」規則，最後綠色那一列給出 x = −2、y = 5。</p>
        <GcdDemo />
      </Section>

      <Section id="code">
        <p>gcd、lcm、擴展歐幾里得，以及用它求模反元素。Python 的擴展版用遞迴寫，和上面「代回去整理係數」的推導一一對應；C++ 用迭代寫，就是示範裡的 r、s、t 表格，而且不佔呼叫堆疊。兩邊最後都示範怎麼對多個數折疊，以及標準庫內建的版本。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1979", name: "Find Greatest Common Divisor of Array", diff: "Easy" },
            { src: "LeetCode 1071", name: "Greatest Common Divisor of Strings（字串版的輾轉相除）", diff: "Easy" },
            { src: "LeetCode 914", name: "X of a Kind in a Deck of Cards（所有出現次數的 gcd）", diff: "Easy" },
            { src: "LeetCode 592", name: "Fraction Addition and Subtraction（通分再約分）", diff: "Medium" },
            { src: "LeetCode 365", name: "Water and Jug Problem（Bézout：gcd 整除目標才量得出來）", diff: "Medium" },
            { src: "LeetCode 878", name: "Nth Magical Number（lcm 加二分答案）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const gcdLesson: Lesson = { prereq: "Recursion", Body };
