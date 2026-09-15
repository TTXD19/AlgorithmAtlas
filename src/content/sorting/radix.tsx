import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { RadixSortDemo } from "@/components/lesson/demos/RadixSortDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# LSD 基數排序：非負整數，從最低位開始，每一趟依一位數做穩定的計數排序
def radix_sort(a, base=10):
    if not a:
        return a
    exp, biggest = 1, max(a)
    while biggest // exp > 0:                # 還有更高的位數
        count = [0] * base
        for x in a:
            count[x // exp % base] += 1
        for d in range(1, base):
            count[d] += count[d - 1]
        out = [0] * len(a)
        for x in reversed(a):                # 由後往前放：這一位相同時保留上一趟的順序
            d = x // exp % base
            count[d] -= 1
            out[count[d]] = x
        a, exp = out, exp * base
    return a


# 固定長度字串（電話號碼、日期）：從最後一個字元往前，每趟按字元分桶
def radix_sort_strings(words):
    for pos in range(len(words[0]) - 1, -1, -1):
        buckets = [[] for _ in range(128)]   # ASCII
        for w in words:
            buckets[ord(w[pos])].append(w)   # 依原順序放進去，保持穩定
        words = [w for b in buckets for w in b]
    return words


# 桶排序：[0, 1) 之間大致均勻分布的小數，開 n 個桶，平均每桶 O(1) 個
def bucket_sort(xs):
    n = len(xs)
    buckets = [[] for _ in range(n)]
    for x in xs:
        buckets[min(int(x * n), n - 1)].append(x)   # 第 i 桶收 [i/n, (i+1)/n)
    return [x for b in buckets for x in sorted(b)]  # 桶內很少，排好後依序串接


if __name__ == "__main__":
    print(radix_sort([52, 29, 91, 17, 73, 38, 84, 45, 24]))   # [17, 24, 29, 38, 45, 52, 73, 84, 91]
    print(radix_sort([170, 45, 75, 90, 802, 24, 2, 66], base=256))
    # [2, 24, 45, 66, 75, 90, 170, 802]（base 256：一趟看一個位元組，兩趟就排完）
    print(radix_sort_strings(["0912", "0203", "0911", "0122", "0203"]))
    # ['0122', '0203', '0203', '0911', '0912']
    print(bucket_sort([0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68]))
    # [0.12, 0.17, 0.21, 0.23, 0.26, 0.39, 0.68, 0.72, 0.78, 0.94]`;

const cpp = `#include <algorithm>
#include <cstdint>
#include <iostream>
#include <vector>

// LSD 基數排序：32 位元無號整數，一趟看 8 個位元（base 256），固定 4 趟
void radixSort(std::vector<std::uint32_t>& a) {
    std::vector<std::uint32_t> buf(a.size());
    for (int shift = 0; shift < 32; shift += 8) {
        std::size_t start[257] = {};
        for (auto x : a) start[((x >> shift) & 0xFF) + 1]++;
        for (int d = 0; d < 256; d++) start[d + 1] += start[d];   // start[d]：這一位是 d 的元素從哪一格開始放
        for (auto x : a) buf[start[(x >> shift) & 0xFF]++] = x;  // 由前往後放進各段的開頭，保持穩定
        a.swap(buf);                                             // 4 趟後結果剛好回到 a
    }
}

// 桶排序：[0, 1) 之間大致均勻分布的小數
std::vector<double> bucketSort(const std::vector<double>& xs) {
    std::size_t n = xs.size();
    std::vector<std::vector<double>> buckets(n);
    for (double x : xs)
        buckets[std::min(n - 1, static_cast<std::size_t>(x * n))].push_back(x);
    std::vector<double> out;
    out.reserve(n);
    for (auto& b : buckets) {
        std::sort(b.begin(), b.end());          // 平均每桶 O(1) 個，排序幾乎不花時間
        out.insert(out.end(), b.begin(), b.end());
    }
    return out;
}

int main() {
    std::vector<std::uint32_t> a = {3000000000u, 52, 29, 91, 17, 73, 38, 84, 45, 24, 65536};
    radixSort(a);
    for (auto x : a) std::cout << x << ' ';
    std::cout << '\\n';   // 17 24 29 38 45 52 73 84 91 65536 3000000000

    for (double x : bucketSort({0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68}))
        std::cout << x << ' ';
    std::cout << '\\n';   // 0.12 0.17 0.21 0.23 0.26 0.39 0.68 0.72 0.78 0.94
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "2,900 萬個手機門號排序去重",
              problem: "電信公司要把 2,900 萬個 10 碼手機門號排序，找出重複登記的號碼。門號位數固定，但當成整數的值域有 10¹⁰ 那麼大，計數排序開不了那麼大的陣列。",
              why: "把門號拆成 10 位數字，從最後一位開始，每一趟依那一位分進 0～9 十個桶再依序收回，做 10 趟。每趟只是循序掃一遍，總共約 3 億次簡單操作；比較排序要約 n log₂ n ≈ 7 億次字串比較，每次比較還要逐字元比。排好之後重複的號碼一定相鄰。",
            },
            {
              title: "分析型資料庫的 ORDER BY",
              problem: "資料倉儲要依 32 位元整數的客戶 ID 排序一億列資料，再做分組彙總。比較排序大量的分支預測失敗和隨機記憶體存取，是查詢裡最慢的一段。",
              why: "把鍵看成 4 個位元組，一趟處理一個位元組：數出每個位元組值有幾個、算出起點、依序搬到暫存區，4 趟就排完，每趟的計數陣列只有 256 格，整個放得進 CPU 快取。DuckDB 這類分析型資料庫就是先把排序鍵轉成固定長度的位元組，再用基數排序。",
            },
            {
              title: "蒙地卡羅模擬的一百萬個樣本",
              problem: "模擬程式產生 100 萬個均勻分布在 [0, 1) 的亂數，要排序後畫出經驗累積分布，並取出各個百分位數。",
              why: "資料是小數，不能直接當索引，但分布已知是均勻的。開 100 萬個桶，數值 x 放進第 ⌊x·n⌋ 個桶，平均每桶只有一個，桶內排序幾乎不花時間，依序串起來就好，期望 O(n)。這是桶排序：它賭的是資料分布，而不是鍵的位數。",
            },
          ]}
          cue="整數或固定長度字串、值域太大不能直接計數、位數固定（電話、日期、IP、32 位元 ID）、要比 O(n log n) 快、小數而且分布均勻、分桶、最大間距。"
        />
      </Section>

      <Section id="concept">
        <p>
          計數排序在值域 k 很大時開不出 count 陣列。<strong>基數排序</strong>把一個大鍵拆成 d 個小位數，每一位只有 b 種值（十進位 b = 10，位元組 b = 256），然後<strong>從最低位開始</strong>，每一趟都依「這一位」對整個序列做一次<strong>穩定</strong>的計數排序，d 趟之後整體就有序。這叫 LSD（least significant digit）基數排序。反過來從最高位切成 b 個桶、再遞迴排每個桶的是 MSD，適合長度不一的字串，但實作較複雜。
        </p>
        <p>
          為什麼從最低位開始、而且每趟必須穩定：用歸納法看「做完第 j 趟，序列依<strong>最低 j 位</strong>有序」。第 j+1 趟依第 j+1 位重排：這一位不同的兩個元素，被這一趟排好先後；這一位相同的兩個元素，穩定排序保留它們在上一趟的順序，而上一趟已經依最低 j 位排好，所以兩者依最低 j+1 位也有序。少了穩定性，這一位相同時上一趟的成果會被打亂，整個論證就斷了。由高位往低位做同樣的事則是錯的，因為最後一趟看的是最低位，會把高位的順序蓋掉。
        </p>
        <p>
          複雜度：每趟是一次 O(n + b) 的計數排序，共 d 趟，時間 <strong>O(d·(n + b))</strong>，和資料怎麼排列無關；空間是暫存陣列加計數陣列 <strong>O(n + b)</strong>。位數和基數要一起選：32 位元整數用 b = 256 只要 4 趟，每趟 256 格的計數陣列很小；用 b = 65536 只要 2 趟，但計數陣列大到放不進快取，常數反而變大。當 d 是常數（固定寬度的整數、固定長度的字串），基數排序就是線性時間，n = 一億時 4 趟對上 log₂ n ≈ 27 層，差距很明顯。它只適用於能拆成位數的鍵：負數要先翻轉符號位元或整體位移，浮點數要轉成保序的位元表示。
        </p>
        <p>
          <strong>桶排序</strong>是另一條路：資料是 [0, 1) 裡<strong>大致均勻</strong>的小數時，開 n 個桶，<Code>x</Code> 放進第 <Code>⌊x·n⌋</Code> 個桶，每個桶期望只有 O(1) 個元素，桶內用插入排序、再依桶的順序串接，<strong>期望 O(n)</strong>。它的前提是分布，不是位數：資料全擠在同一個桶時退化成桶內排序的複雜度（插入排序就是 O(n²)），所以對分布未知的輸入不可靠。常見的坑：<Code>x = 1.0</Code> 會算出第 n 號桶而越界，要夾到 n − 1；LSD 的某一趟用了不穩定的排序；位數沒補齊（字串長度不同就要先補到一樣長，或改用 MSD）。和上一篇的關係：基數排序的每一趟就是穩定版計數排序；下一篇會說明，這兩者能快過 n log n，是因為它們都不靠比較。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>選基數與位數：十進位資料 b = 10、d = 最大值的位數；32 位元整數 b = 256、d = 4；固定長度字串就一個字元一位。</>,
            <>從<strong>最低位</strong>開始，第 j 趟取出每個元素這一位的值，例如 <Code>x // b^j % b</Code> 或 <Code>{"(x >> 8j) & 0xFF"}</Code>。</>,
            <>依這一位做<strong>穩定</strong>的計數排序：數每個值的個數、前綴和算出每一段的起點、依序把元素搬到暫存陣列。</>,
            <>暫存陣列變成下一趟的輸入，換更高的一位，做滿 d 趟就整體有序。</>,
            <>小數而且分布均勻時改用桶排序：開 n 個桶、<Code>x</Code> 放進第 <Code>min(⌊x·n⌋, n−1)</Code> 個、桶內排序後依序串接。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>九個兩位數：前八個的十位數就是共用陣列 [5, 2, 9, 1, 7, 3, 8, 4]，個位數故意打亂，再多一個 24，讓十位數 2 出現兩次。第一趟依個位數分進 0～9 十個桶再依序收回，第二趟依十位數。底線標出這一趟看的位數，藍色是正在分桶的元素，灰色是已經進桶的，綠色是收回來的序列。留意第二趟的桶 2：24 在 29 前面，是因為第一趟已經依個位把 24 排在 29 之前，這一趟又穩定地保留了這個順序。</p>
        <RadixSortDemo />
      </Section>

      <Section id="code">
        <p>Python 版是十進位的 LSD 基數排序（換一個 base 參數就能一次看一個位元組）、固定長度字串的版本，以及桶排序。C++ 版是實務上最常見的寫法：32 位元整數一趟看 8 個位元、固定 4 趟，用計數陣列算出每段的起點再依序搬移；另附桶排序。兩種語言的每一趟都是穩定的，這是基數排序正確的前提。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1356", name: "Sort Integers by The Number of 1 Bits（值不超過 10⁴，1 的個數只有 0～13，依它分桶）", diff: "Easy" },
            { src: "LeetCode 1502", name: "Can Make Arithmetic Progression From Sequence（算出公差後，每個數該在哪一格直接算得出來）", diff: "Easy" },
            { src: "LeetCode 451", name: "Sort Characters By Frequency（出現次數當桶號）", diff: "Medium" },
            { src: "LeetCode 2343", name: "Query Kth Smallest Trimmed Number（固定長度字串的基數排序）", diff: "Medium" },
            { src: "LeetCode 220", name: "Contains Duplicate III（寬度 valueDiff + 1 的桶）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const radixLesson: Lesson = { prereq: "Counting Sort", Body };
