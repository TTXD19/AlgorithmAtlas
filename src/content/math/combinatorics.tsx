import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { CombinatoricsDemo } from "@/components/lesson/demos/CombinatoricsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `MOD = 1_000_000_007


class Binomial:
    """預先算好階乘與階乘的反元素，之後每次 C(n, k) mod p 都是 O(1)。需要 n_max < p"""

    def __init__(self, n_max, p=MOD):
        self.p = p
        self.fact = [1] * (n_max + 1)
        for i in range(1, n_max + 1):
            self.fact[i] = self.fact[i - 1] * i % p
        self.inv_fact = [1] * (n_max + 1)
        self.inv_fact[n_max] = pow(self.fact[n_max], p - 2, p)   # 整個流程只做這一次快速冪
        for i in range(n_max, 0, -1):
            self.inv_fact[i - 1] = self.inv_fact[i] * i % p     # (i-1)! 的反元素 = i! 的反元素 × i

    def C(self, n, k):
        if k < 0 or k > n:                      # 選不出來就是 0 種，先擋掉免得索引越界
            return 0
        return self.fact[n] * self.inv_fact[k] % self.p * self.inv_fact[n - k] % self.p


def comb_exact(n, k):
    """精確值，O(min(k, n-k))。第 i 步的結果是 C(n-k+i, i)，一定是整數，所以先乘再除不會有餘數。
    Python 3.8 起也可以直接用 math.comb"""
    if k < 0 or k > n:
        return 0
    k = min(k, n - k)
    res = 1
    for i in range(1, k + 1):
        res = res * (n - k + i) // i
    return res


if __name__ == "__main__":
    print(Binomial(8, 13).C(8, 3), comb_exact(8, 3))   # 4 56：示範裡的 C(8, 3) mod 13
    print(comb_exact(49, 6))                    # 13983816：大樂透 49 選 6 的組合數
    print(comb_exact(4 + 2, 2))                 # 15：往右 4 步、往下 2 步的路徑數
    print(comb_exact(10 + 4 - 1, 4 - 1))        # 286：10 台相同的機器分到 4 個機房（隔板法）
    print(Binomial(200000).C(200000, 100000))   # 879467333`;

const cpp = `#include <cmath>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <vector>

// 模數是質數 p、n < p：階乘表 + 階乘反元素表，建表 O(n + log p)，查詢 O(1)
struct Binomial {
    std::int64_t p;
    std::vector<std::int64_t> fact, invFact;

    static std::int64_t power(std::int64_t a, std::int64_t e, std::int64_t m) {
        std::int64_t r = 1;
        for (a %= m; e > 0; e >>= 1, a = a * a % m)
            if (e & 1) r = r * a % m;
        return r;
    }

    Binomial(int nMax, std::int64_t mod) : p(mod), fact(nMax + 1, 1), invFact(nMax + 1, 1) {
        for (int i = 1; i <= nMax; i++) fact[i] = fact[i - 1] * i % p;
        invFact[nMax] = power(fact[nMax], p - 2, p);
        for (int i = nMax; i >= 1; i--) invFact[i - 1] = invFact[i] * i % p;
    }

    std::int64_t C(int n, int k) const {
        if (k < 0 || k > n) return 0;
        return fact[n] * invFact[k] % p * invFact[n - k] % p;
    }
};

// 模數不是質數（沒有反元素）時：Pascal 三角形只用加法，O(n²)
std::vector<std::vector<std::int64_t>> pascal(int n, std::int64_t m) {
    std::vector<std::vector<std::int64_t>> c(n + 1);
    for (int i = 0; i <= n; i++) {
        c[i].assign(i + 1, 1 % m);
        for (int j = 1; j < i; j++) c[i][j] = (c[i - 1][j - 1] + c[i - 1][j]) % m;
    }
    return c;
}

// 機率不取模：組合數太大會溢位，改用 log。lgamma(n + 1) = ln(n!)
double logC(int n, int k) { return std::lgamma(n + 1.0) - std::lgamma(k + 1.0) - std::lgamma(n - k + 1.0); }

int main() {
    Binomial bin(200000, 1000000007);
    std::cout << bin.C(200000, 100000) << ' ' << bin.C(5, 7) << '\\n';     // 879467333 0

    std::cout << pascal(30, 1000)[30][15] << '\\n';                        // 520：C(30, 15) = 155117520，模 1000 不是質數也能算

    // 大樂透買一注，6 個號碼剛好中 3 個的機率：C(6, 3)·C(43, 3) / C(49, 6)
    double prob = std::exp(logC(6, 3) + logC(43, 3) - logC(49, 6));
    std::cout << std::setprecision(6) << prob << '\\n';                     // 0.0176504
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "大樂透的中獎機率",
              problem: "大樂透從 1 到 49 開出 6 個號碼，買一注中頭獎的機率是多少？只中 3 個號碼的普獎又是多少？把所有開獎結果一一列出來再數，是一千多萬種組合。",
              why: "開獎和號碼順序無關，所有結果共有 C(49, 6) = 13,983,816 種，頭獎只有 1 種，機率約一千四百萬分之一。剛好中 3 個，是從自己的 6 個號碼選 3 個、再從其餘 43 個選 3 個沒中的，C(6, 3) × C(43, 3) = 246,820 種，機率約 1.77%。整個問題就是幾個組合數相乘再相除。",
            },
            {
              title: "基因富集分析的顯著性",
              problem: "實驗找出 300 個表現量異常的基因，其中 40 個屬於「免疫反應」這個功能分類，而全基因組兩萬個基因裡這個分類有 500 個。研究者要判斷這是巧合，還是免疫反應真的和實驗條件有關。",
              why: "隨機挑 300 個基因時，其中恰好 k 個屬於該分類的機率是超幾何分布 C(500, k) · C(19500, 300 − k) / C(20000, 300)，把 k ≥ 40 的機率加總就是 p 值。這些組合數有上百位數，實務上預先算好 ln(n!) 的表，用對數相加減再取指數，不會溢位。",
            },
            {
              title: "設定組合的兩兩測試",
              problem: "一個軟體的設定頁有 20 個開關，全部組合是 2²⁰，超過一百萬種，不可能每種都測。但經驗上大部分的 bug 只和其中一兩個設定有關。",
              why: "兩兩組合測試只要求「任意兩個開關的四種開關狀態」都至少出現在某一組測試裡。需要涵蓋的條件是 C(20, 2) × 4 = 760 個，而一組測試能同時涵蓋 C(20, 2) = 190 個，所以至少要 4 組；實際上精心安排的 8 組測試就能全部涵蓋。組合數告訴你要涵蓋多少條件，也估得出測試數量的下限。",
            },
          ]}
          cue="從 n 個裡選 k 個、不管順序、網格路徑數、相同物品分到不同箱子（隔板法）、機率等於有利情況除以全部情況、答案取模 10⁹+7 的計數題、大量查詢 C(n, k)。"
        />
      </Section>

      <Section id="concept">
        <p>
          計數的兩個基本式子：<strong>排列</strong> <Code>P(n, k) = n! / (n − k)!</Code>，從 n 個不同的東西依序挑 k 個，順序不同算不同；<strong>組合</strong> <Code>C(n, k) = n! / (k! · (n − k)!)</Code>，不管順序，所以把每組 k 個東西的 k! 種排法除掉。很多題目換個角度就是組合數：在方格上往右 a 步、往下 b 步的路徑數是 <Code>C(a + b, a)</Code>，因為只要決定 a + b 步裡哪幾步往右；把 n 個相同的東西分進 k 個箱子（可以空）是 <Code>C(n + k − 1, k − 1)</Code>，相當於在 n 個東西之間插 k − 1 根隔板，這叫<strong>隔板法</strong>。
        </p>
        <p>
          怎麼算取決於規模和模數。第一種是 <strong>Pascal 三角形</strong>：<Code>C(n, k) = C(n − 1, k − 1) + C(n − 1, k)</Code>，理由是單看第 n 個東西選或不選，把所有選法分成不重疊的兩類。整張表 O(n²) 時間和空間，只用加法，所以<strong>任何模數</strong>都能用，適合 n 在幾千以內。第二種是精確值的<strong>乘法公式</strong> <Code>C(n, k) = ∏ (n − k + i) / i</Code>，i 從 1 到 k，每一步的中間結果都是 <Code>C(n − k + i, i)</Code>，一定是整數，O(min(k, n − k))；但 C++ 的 64 位元整數在 n 超過 60 左右就會溢位，精確值要靠大數或 Python。
        </p>
        <p>
          第三種是模數為質數 p 時最常用的做法：預先算<strong>階乘表</strong> <Code>fact[i] = i! mod p</Code> 和<strong>階乘反元素表</strong> <Code>inv_fact[i] = (i!)⁻¹ mod p</Code>，之後 <Code>C(n, k) = fact[n] · inv_fact[k] · inv_fact[n − k]</Code>，每次查詢 O(1)。反元素表不必對每一格做快速冪，只對 <Code>n!</Code> 做一次，再由右往左 <Code>inv_fact[i − 1] = inv_fact[i] · i</Code>，因為 <Code>(i − 1)! = i! / i</Code>。建表總共 <strong>O(n + log p)</strong> 時間、<strong>O(n)</strong> 空間。前提是 <strong>n &lt; p</strong>，否則 <Code>p!</Code> 以後的階乘都含因數 p，取模變成 0，沒有反元素；n 比 p 大時要改用 Lucas 定理。
        </p>
        <p>
          常見的坑：<Code>k &lt; 0</Code> 或 <Code>k &gt; n</Code> 時答案是 0，沒先擋掉會索引越界；直接算 n! 再除，<Code>21!</Code> 就超過 64 位元；乘法公式寫成 <Code>res * ((n − k + i) / i)</Code>，整數除法先截斷就錯了；階乘表只開到 n，查詢時 n 超出範圍；模數不是質數卻用了費馬小定理；算機率時用浮點數直接乘組合數，很快就溢位或失去精度，應該改用 <Code>ln(n!)</Code> 的對數相加減。和鄰近課程的關係：上一篇 Modular Arithmetic 提供反元素；Pascal 三角形本身就是 Memoization &amp; Tabulation 的填表；Backtracking 的 Combinations 是把 <Code>C(n, k)</Code> 種組合實際列出來，組合數告訴你那個搜尋會有多大。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>先判斷要數的是排列還是組合、東西是否相同，把問題換成 <Code>C(n, k)</Code> 或 <Code>P(n, k)</Code> 的式子，例如路徑數 <Code>C(a + b, a)</Code>、隔板法 <Code>C(n + k − 1, k − 1)</Code>。</>,
            <>n 在幾千以內，或模數不是質數：用 Pascal 三角形 <Code>C[n][k] = C[n − 1][k − 1] + C[n − 1][k]</Code> 填表。</>,
            <>模數是質數 p 而且 n &lt; p：建 <Code>fact[0..n]</Code>，<Code>fact[i] = fact[i − 1] · i mod p</Code>。</>,
            <><Code>inv_fact[n] = fact[n]^(p − 2) mod p</Code>，再由右往左 <Code>inv_fact[i − 1] = inv_fact[i] · i mod p</Code>。</>,
            <>查詢時 <Code>k &lt; 0</Code> 或 <Code>k &gt; n</Code> 回傳 0，否則回傳 <Code>fact[n] · inv_fact[k] · inv_fact[n − k] mod p</Code>。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>上方可以切換兩種算法。「Pascal 三角形」從兩端的 1 開始，逐格填第 0 到 6 列：藍色是正在算的格子，黃色是它上一列的兩個來源，第一格的說明會拆解為什麼是「包含第 n 個」加上「不包含第 n 個」。填完第 6 列 1、6、15、20、15、6、1，總和 64 = 2⁶，綠色的 C(6, 2) = 15 同時也是往右 4 步、往下 2 步的路徑數。「階乘表 mod 13」要算 C(8, 3) mod 13：先由左往右填 0! 到 8!，再只對 8! = 7 做一次費馬小定理得到反元素 2，接著由右往左每格乘上 i 填完反元素表，每一步都附驗算。查詢時綠色的三格相乘 7 × 11 × 9 ≡ 4，和 56 mod 13 相同。最後一步說明為什麼 n 必須小於模數。</p>
        <CombinatoricsDemo />
      </Section>

      <Section id="code">
        <p>Python 放階乘表加階乘反元素表的 Binomial 類別，以及計算精確值的乘法公式，並用它算樂透、網格路徑和隔板法的例子。C++ 放同樣的 Binomial 結構、模數不是質數時用的 Pascal 三角形，以及算機率時改用 lgamma 對數的寫法。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 118", name: "Pascal's Triangle", diff: "Easy" },
            { src: "LeetCode 1641", name: "Count Sorted Vowel Strings（隔板法）", diff: "Medium" },
            { src: "LeetCode 2400", name: "Number of Ways to Reach a Position After Exactly k Steps（決定幾步往右）", diff: "Medium" },
            { src: "LeetCode 1735", name: "Count Ways to Make Array With Product（質因數分解後每個質數各用隔板法）", diff: "Hard" },
            { src: "LeetCode 1569", name: "Number of Ways to Reorder Array to Get Same BST（左右子樹交錯排列 C(n − 1, 左子樹大小)）", diff: "Hard" },
            { src: "LeetCode 1916", name: "Count Ways to Build Rooms in an Ant Colony（階乘表加反元素）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const combinatoricsLesson: Lesson = { prereq: "Modular Arithmetic、Memoization & Tabulation", Body };
