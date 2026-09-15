import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { CountingBitsDemo } from "@/components/lesson/demos/CountingBitsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `def popcount_naive(n):
    """逐位檢查：看最低位再右移，迴圈次數 = 位元長度"""
    n &= 0xFFFFFFFF                     # 當成 32 位元無號數，負數才不會無限迴圈
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count


def popcount(n):
    """Brian Kernighan：每次清掉最低位的 1，迴圈次數 = 1 的個數"""
    n &= 0xFFFFFFFF
    count = 0
    while n:
        n &= n - 1                      # 清掉最低位的 1，更高的位不動
        count += 1
    return count


def count_bits(n):
    """0..n 每個數的 1 個數（LeetCode 338）。O(n)"""
    bits = [0] * (n + 1)
    for i in range(1, n + 1):
        bits[i] = bits[i & (i - 1)] + 1  # i & (i-1) 比 i 小、恰好少一個 1，早就算好了
        # 另一種遞推：bits[i] = bits[i >> 1] + (i & 1)
    return bits


def total_hamming_distance(nums):
    """所有數對的漢明距離總和（LeetCode 477）。逐位計數，O(32n)"""
    n, total = len(nums), 0
    for b in range(32):
        ones = sum((x >> b) & 1 for x in nums)
        total += ones * (n - ones)      # 這一位上，每個 1 和每個 0 配成一對
    return total


if __name__ == "__main__":
    print(popcount(181))                # 5（10110101）
    print(popcount_naive(181))          # 5，但迴圈跑了 8 次
    print(popcount(0xFFFFFFC0))         # 26：遮罩 255.255.255.192 就是 /26
    print(popcount(-1))                 # 32（-1 的 32 位元二補數全是 1）
    print(popcount(1 ^ 4))              # 2：1 和 4 的漢明距離
    print(64 & 63 == 0)                 # True：只有一個 1，是 2 的冪次（Python 的 & 比 == 優先）
    print(count_bits(8))                # [0, 1, 1, 2, 1, 2, 2, 3, 1]
    print(total_hamming_distance([4, 14, 2]))  # 6
    print((181).bit_count())            # 5（內建，Python 3.10+；舊版可用 bin(181).count("1")）`;

const cpp = `#include <bitset>
#include <cstdint>
#include <iostream>
#include <vector>

// 逐位檢查：看最低位再右移，迴圈次數 = 位元長度
int popcountNaive(std::uint32_t n) {
    int count = 0;
    while (n) {
        count += n & 1;
        n >>= 1;              // 無號數右移補 0；有號負數右移通常補 1，迴圈停不下來
    }
    return count;
}

// Brian Kernighan：每次清掉最低位的 1，迴圈次數 = 1 的個數
int popcount(std::uint32_t n) {
    int count = 0;
    while (n) {
        n &= n - 1;           // 清掉最低位的 1，更高的位不動
        ++count;
    }
    return count;
}

// 0..n 每個數的 1 個數（LeetCode 338）。O(n)
std::vector<int> countBits(int n) {
    std::vector<int> bits(n + 1, 0);
    for (int i = 1; i <= n; ++i)
        bits[i] = bits[i & (i - 1)] + 1;   // 也可以寫 bits[i >> 1] + (i & 1)
    return bits;
}

// 所有數對的漢明距離總和（LeetCode 477）。逐位計數，O(32n)
long long totalHammingDistance(const std::vector<int>& nums) {
    long long n = static_cast<long long>(nums.size()), total = 0;
    for (int b = 0; b < 32; ++b) {
        long long ones = 0;
        for (int x : nums) ones += (static_cast<std::uint32_t>(x) >> b) & 1;
        total += ones * (n - ones);        // 這一位上，每個 1 和每個 0 配成一對
    }
    return total;
}

int main() {
    std::cout << popcount(181) << "\\n";                      // 5（10110101）
    std::cout << popcountNaive(181) << "\\n";                 // 5，但迴圈跑了 8 次
    std::cout << popcount(0xFFFFFFC0u) << "\\n";              // 26：255.255.255.192 就是 /26
    std::cout << popcount(static_cast<std::uint32_t>(-1)) << "\\n";  // 32
    std::cout << popcount(1 ^ 4) << "\\n";                    // 2：1 和 4 的漢明距離
    std::cout << ((64 & 63) == 0) << "\\n";                   // 1：2 的冪次。C++ 的 == 比 & 優先，括號不能省
    for (int v : countBits(8)) std::cout << v << ' ';        // 0 1 1 2 1 2 2 3 1
    std::cout << "\\n" << totalHammingDistance({4, 14, 2}) << "\\n";  // 6
    // 實務上用內建：std::bitset、GCC/Clang 的 __builtin_popcount、C++20 的 std::popcount
    std::cout << std::bitset<32>(181).count() << "\\n";       // 5
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "子網路遮罩換算成 CIDR 前綴長度",
              problem: "防火牆設定檔寫的是 255.255.255.192，路由表卻要填 /26。要把遮罩換成前綴長度、算出這個網段有 2⁶ = 64 個位址，還要擋掉 255.255.0.255 這種 1 不連續的非法遮罩。",
              why: "遮罩就是 32 位元整數 0xFFFFFFC0，前綴長度等於裡面 1 的個數。反過來數更快：全部翻轉得到 0x3F，只有 6 個 1，Kernighan 迴圈跑 6 次，32 − 6 = 26。合法遮罩翻轉後一定是 2ᵏ − 1，用 h & (h + 1) == 0 一行就能驗證，和 n & (n − 1) 是同一個借位原理。",
            },
            {
              title: "相簿的「相似照片」偵測",
              problem: "每張照片算出一個 64 位元的感知雜湊（pHash），兩張圖越像，雜湊裡不同的位元越少。使用者上傳一張新照片，要和相簿裡 50 萬個雜湊比對，找出差異不超過 10 個位元的。",
              why: "「有幾個位元不同」就是漢明距離：先 a ^ b，不同的位變成 1，再數 1 的個數。每次比對只是一次 XOR 加一次 popcount，在現代 CPU 上各是一道指令，50 萬次比對幾毫秒就做完，完全不用解碼圖片去比像素。",
            },
            {
              title: "用位元圖統計每日活躍使用者",
              problem: "App 有三千萬個使用者，每人有一個編號。想知道今天有幾個人登入過，以及昨天和今天都登入的有幾人。若用雜湊集合存每天登入過的編號，一天一千萬人登入就要吃掉幾百 MB 記憶體，還得保留好幾天來比對。",
              why: "每個使用者對應一個位元，三千萬個位元只要 3.75 MB，Redis 的 SETBIT／BITCOUNT 就是這樣做。今天的活躍人數是整張位元圖裡 1 的個數；兩天都登入的人數，是把兩張圖每 64 位元一段 AND 起來再 popcount。population count 就是這類統計的核心運算。",
            },
          ]}
          cue="數 1 的個數、popcount、set bits、漢明距離、有幾個位元不同、n & (n − 1)、清掉最低位的 1、2 的冪次、0 到 n 每個數的位元數。"
        />
      </Section>

      <Section id="concept">
        <p>
          「一個整數裡有幾個位元是 1」叫做 <strong>population count</strong>（popcount，也叫 Hamming weight）。最直接的做法是<strong>逐位檢查</strong>：看最低位 <Code>n & 1</Code> 加進計數，再 <Code>{"n >>= 1"}</Code>，直到 n 變 0。迴圈次數等於位元長度，和裡面有幾個 1 無關。<strong>Brian Kernighan</strong> 的做法只在有 1 的地方停：每次執行 <Code>n &= n - 1</Code> 恰好清掉最低位的那個 1，清幾次 n 才變 0，就有幾個 1。
        </p>
        <p>
          為什麼 <Code>n & (n - 1)</Code> 只清掉最低位的 1：設 n 最低位的 1 在第 j 位，那麼第 0 到 j − 1 位全是 0。減 1 需要借位，第 j 位變 0、第 0 到 j − 1 位全變 1，第 j 位以上完全不變。再和原本的 n 做 AND：第 j 位是 1 & 0 = 0，更低的位是 0 & 1 = 0，更高的位是 x & x = x，結果正好是「n 拿掉最低位的 1」。迴圈維持的不變量是 <Code>count + popcount(n)</Code> 恆等於原數的 1 的個數：每輪 count 加 1、n 少一個 1，n 變 0 時 count 就是答案。同一個式子還能判斷 <strong>2 的冪次</strong>：n &gt; 0 且 <Code>n & (n - 1) == 0</Code>，代表 n 只有一個 1。
        </p>
        <p>
          設 1 的個數是 k、位元寬度是 w。Kernighan 是 <strong>O(k)</strong>，逐位檢查是 O(位元長度)，最壞都是 O(w)（32 個位元全是 1 時兩者一樣），但 1 越稀疏 Kernighan 越省；兩者都只用 <strong>O(1)</strong> 空間。要算 0 到 n 每個數的 1 個數（LeetCode 338），每個數各跑一次 Kernighan 總共 O(n log n)；改用遞推 <Code>bits[i] = bits[i & (i - 1)] + 1</Code>：<Code>i & (i - 1)</Code> 比 i 小、恰好少一個 1，而且早就填好了，所以整張表 <strong>O(n)</strong>，除了答案陣列本身不需要額外空間（<Code>{"bits[i >> 1] + (i & 1)"}</Code> 也是一樣的效果）。<strong>漢明距離</strong>是 <Code>popcount(a ^ b)</Code>；要算整個陣列所有數對的漢明距離總和，不必 O(n²) 兩兩比，改成逐位看：某一位上有 c 個 1、n − c 個 0，這一位就貢獻 c × (n − c)，總共 O(32n)。
        </p>
        <p>
          最常見的坑是<strong>負數</strong>。Python 的整數沒有固定寬度，−1 可以想成有無限多個 1，<Code>n &= n - 1</Code> 只會得到 −2、−4、−8⋯⋯永遠到不了 0，逐位檢查的 <Code>{"n >>= 1"}</Code> 也會卡在 −1；要先 <Code>n &= 0xFFFFFFFF</Code> 轉成 32 位元。C++ 要用 <Code>std::uint32_t</Code>，有號負數右移通常補 1，一樣停不下來。實務上直接用內建：Python 3.10 起的 <Code>int.bit_count()</Code>、C++ 的 <Code>{"std::bitset<32>(n).count()"}</Code>、GCC/Clang 的 <Code>__builtin_popcount</Code>、C++20 的 <Code>std::popcount</Code>，通常會編譯成 CPU 的 POPCNT 指令。自己會寫 Kernighan 的價值在「清掉最低位的 1」這個動作：Subset Enumeration 的 <Code>(sub - 1) & mask</Code> 是同一種借位，XOR Tricks 用來分組的 <Code>diff & -diff</Code>、Fenwick Tree 的 <Code>i & -i</Code> 是它的姊妹式（取出最低位的 1 而不是清掉），Bitmask DP 裡 popcount(mask) 就是子集大小。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>先確定寬度與正負號：輸入可能是負數時，Python 先 <Code>n &= 0xFFFFFFFF</Code>，C++ 改用 <Code>std::uint32_t</Code>，否則迴圈不會結束。</>,
            <><Code>count = 0</Code>；<Code>while n != 0</Code>：<Code>n &= n - 1</Code>（清掉最低位的 1），<Code>count += 1</Code>。迴圈結束時 count 就是 1 的個數。</>,
            <>要知道兩個數有幾個位元不同（漢明距離），先算 <Code>x = a ^ b</Code>，再對 x 做第 2 步。</>,
            <>要 0 到 n 每個數的答案：開 <Code>bits = [0] * (n + 1)</Code>，i 從 1 填到 n，<Code>bits[i] = bits[i & (i - 1)] + 1</Code>，每格 O(1)。</>,
            <>要所有數對的漢明距離總和：對每個位元位置數出有 c 個數在這一位是 1，累加 c × (n − c)，不要兩兩配對。</>,
            <>正式程式直接呼叫內建（<Code>bit_count()</Code>、<Code>__builtin_popcount</Code>、<Code>std::bitset::count</Code>）；判斷 2 的冪次寫 <Code>{"n > 0 and n & (n - 1) == 0"}</Code>，C++ 記得加括號。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>n = 181 = 10110101₂，8 個位元裡有 5 個 1。前半段是 Brian Kernighan：每一步把 n、n − 1、n & (n − 1) 三列疊在一起，黃色標出這一輪要清掉的最低位 1 所在的位置，n − 1 那一列的綠色是它下面因借位而變成 1 的位（181 是奇數，第一步還看不到綠色）。後半段是逐位檢查：「原本的 n」那一列裡，正在檢查的位是 1 就標綠、是 0 就標黃，檢查過的位變灰。下方的計數區隨時顯示 count 和目前的迴圈次數，最後比較兩者的總次數：Kernighan 5 次，逐位檢查 8 次。</p>
        <CountingBitsDemo />
      </Section>

      <Section id="code">
        <p>逐位檢查和 Kernighan 兩個版本放在一起對照，接著是兩個延伸：用 <Code>bits[i & (i - 1)] + 1</Code> 在 O(n) 內填出 0 到 n 的整張表（LeetCode 338），以及逐位計數求所有數對的漢明距離總和（LeetCode 477）。main 裡的例子包含子網路遮罩、負數與 2 的冪次，最後附上內建函式的寫法。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 191", name: "Number of 1 Bits（Kernighan 的原型題）", diff: "Easy" },
            { src: "LeetCode 461", name: "Hamming Distance（先 XOR 再數 1）", diff: "Easy" },
            { src: "LeetCode 231", name: "Power of Two（n & (n − 1) == 0）", diff: "Easy" },
            { src: "LeetCode 338", name: "Counting Bits（O(n) 遞推）", diff: "Easy" },
            { src: "LeetCode 477", name: "Total Hamming Distance（逐位計數）", diff: "Medium" },
            { src: "LeetCode 2429", name: "Minimize XOR（1 的個數固定後，貪心決定放哪幾位）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const countingBitsLesson: Lesson = { prereq: "Bitwise Basics、XOR Tricks", Body };
