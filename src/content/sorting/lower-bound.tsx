import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { LowerBoundDemo } from "@/components/lesson/demos/LowerBoundDemo";
import type { Lesson } from "@/lib/lessons";

const python = `import math
from itertools import permutations


def lower_bound(n):
    """任何比較排序在最壞情況至少要比 ⌈log₂ n!⌉ 次（用整數算，避免浮點誤差）"""
    return (math.factorial(n) - 1).bit_length()   # m ≥ 1 時 (m − 1).bit_length() = ⌈log₂ m⌉


# 兩個只能用 less(x, y) 比較的排序，用來實際數比較次數
def merge_sort(a, less):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid], less), merge_sort(a[mid:], less)
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if less(right[j], left[i]):
            out.append(right[j]); j += 1
        else:
            out.append(left[i]); i += 1
    return out + left[i:] + right[j:]


def binary_insertion_sort(a, less):
    out = []
    for x in a:
        lo, hi = 0, len(out)
        while lo < hi:                             # 在已排好的 out 裡二分找位置
            mid = (lo + hi) // 2
            if less(x, out[mid]):
                hi = mid
            else:
                lo = mid + 1
        out.insert(lo, x)
    return out


def worst_comparisons(sort, n):
    """把 n 個相異元素的 n! 種排列都跑一遍，回傳最多比了幾次"""
    worst = 0
    for perm in permutations(range(n)):
        count = 0

        def less(x, y):
            nonlocal count
            count += 1
            return x < y

        sort(list(perm), less)
        worst = max(worst, count)
    return worst


if __name__ == "__main__":
    for n in range(2, 9):
        print(n, lower_bound(n), worst_comparisons(merge_sort, n),
              worst_comparisons(binary_insertion_sort, n))
    # n  下界  合併  二分插入
    # 2   1    1     1
    # 3   3    3     3
    # 4   5    5     5
    # 5   7    8     8      ← 下界 7 做得到（merge insertion），這兩個演算法做不到
    # 6  10   11    11
    # 7  13   14    14
    # 8  16   17    17
    n = 10**6                                      # log₂ n! 用 lgamma 估，和 n log₂ n 比
    print(round(math.lgamma(n + 1) / math.log(2) / (n * math.log2(n)), 3))   # 0.928`;

const cpp = `#include <algorithm>
#include <cmath>
#include <cstdio>
#include <functional>
#include <numeric>
#include <vector>

using Less = std::function<bool(int, int)>;

// ⌈log₂ n!⌉：n ≤ 20 時 n! 放得進 unsigned long long，用整數算不會有浮點誤差
int lowerBound(int n) {
    unsigned long long f = 1;
    for (int i = 2; i <= n; i++) f *= i;
    int h = 0;
    while ((1ULL << h) < f) h++;                   // 最小的 h 使 2^h ≥ n!
    return h;
}

std::vector<int> mergeSort(const std::vector<int>& a, const Less& less) {
    if (a.size() <= 1) return a;
    std::size_t mid = a.size() / 2;
    auto l = mergeSort({a.begin(), a.begin() + mid}, less);
    auto r = mergeSort({a.begin() + mid, a.end()}, less);
    std::vector<int> out;
    std::size_t i = 0, j = 0;
    while (i < l.size() && j < r.size()) out.push_back(less(r[j], l[i]) ? r[j++] : l[i++]);
    out.insert(out.end(), l.begin() + i, l.end());
    out.insert(out.end(), r.begin() + j, r.end());
    return out;
}

std::vector<int> binaryInsertionSort(const std::vector<int>& a, const Less& less) {
    std::vector<int> out;
    for (int x : a) {
        std::size_t lo = 0, hi = out.size();
        while (lo < hi) {                          // 在已排好的 out 裡二分找位置
            std::size_t mid = (lo + hi) / 2;
            if (less(x, out[mid])) hi = mid; else lo = mid + 1;
        }
        out.insert(out.begin() + lo, x);
    }
    return out;
}

// 走遍 n! 種排列，回傳最多的比較次數
int worstComparisons(std::vector<int> (*sort)(const std::vector<int>&, const Less&), int n) {
    std::vector<int> perm(n);
    std::iota(perm.begin(), perm.end(), 0);
    int worst = 0;
    do {
        int count = 0;
        sort(perm, [&](int x, int y) { count++; return x < y; });
        worst = std::max(worst, count);
    } while (std::next_permutation(perm.begin(), perm.end()));
    return worst;
}

int main() {
    for (int n = 2; n <= 8; n++)                   // 輸出和 Python 版的表相同
        std::printf("%d %d %d %d\\n", n, lowerBound(n),
                    worstComparisons(mergeSort, n), worstComparisons(binaryInsertionSort, n));
    double n = 1e6;                                // lgamma(n + 1) = ln(n!)
    std::printf("%.3f\\n", std::lgamma(n + 1) / std::log(2.0) / (n * std::log2(n)));   // 0.928
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "還要不要繼續優化排序的比較次數",
              problem: "團隊的排序服務已經用上 O(n log n) 的演算法，有人提議再花兩個月，把「平均每個元素比較幾次」壓得更低；供應商也宣稱他們的通用排序函式庫是 O(n) 的。",
              why: "只要演算法只能靠「比較兩個元素」得知資料的樣子，最壞情況就至少要 log₂(n!) ≈ n log₂ n − 1.44n 次比較。合併排序最壞約 n log₂ n 次，離下界只差一個低階項，能再擠出的空間很小；宣稱「通用又只靠比較卻是 O(n)」的東西一定哪裡不對。要更快，得換掉計算模型，而不是繼續調比較的次序。",
            },
            {
              title: "十億筆資料的容量規劃",
              problem: "每晚要依使用者分數排序 10 億筆紀錄，預算只夠配置固定幾台機器，想在採購前估計排序最少要花多少比較。",
              why: "下界直接給出數字：log₂(10⁹!) 大約是 10⁹ × (29.9 − 1.44) ≈ 285 億次比較，任何比較排序都省不掉。若這個數字超出預算，唯一的出路是跳出比較模型：分數如果是整數或固定寬度，就改用計數或基數排序，每筆只要常數次操作。",
            },
            {
              title: "面試題要求「不能用排序」",
              problem: "題目寫著：找出陣列裡最長的連續整數序列，而且必須 O(n) 時間。直覺的做法是先排序再掃一遍。",
              why: "先排序就是 Ω(n log n)，這條下界說明不管怎麼寫排序都達不到 O(n)，所以題目其實在提示你換模型：用雜湊集合直接查「x+1 在不在」，每次查詢不是比較，而是把值當成位置去找。認得這條下界，就能一眼判斷「這題不能走排序」。",
            },
          ]}
          cue="還能不能更快、O(n log n) 是不是極限、決策樹、log₂(n!)、題目要求 O(n) 卻看起來需要排序、只能用比較、資訊量、下界論證。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>比較排序</strong>指的是只能透過「比較兩個元素誰大」來了解輸入的排序演算法：泡沫、插入、合併、快速、堆積排序都是。這樣的演算法不論怎麼寫，對固定的 n 都可以畫成一棵<strong>決策樹</strong>：每個內部節點是一次比較「a &lt; b？」，依答案走左或右；每片葉子是演算法最後輸出的一種排列順序。拿一組輸入去跑，就是從根走到某片葉子，<strong>比較次數等於那條路徑的長度</strong>，最壞情況的比較次數就是樹的<strong>高度</strong>。
        </p>
        <p>
          證明只要數葉子。n 個相異元素有 <strong>n!</strong> 種排列，每一種需要不同的重排方式才能變成有序，所以一個正確的演算法至少要有 n! 片可以到達的葉子，否則兩種不同的輸入會走到同一片葉子、被做了同樣的重排，至少有一個排錯。高度 h 的二元樹最多只有 2ʰ 片葉子，因此 <Code>2ʰ ≥ n!</Code>，也就是 <Code>h ≥ log₂(n!)</Code>。任何比較排序在最壞情況下至少要比 <strong>⌈log₂ n!⌉</strong> 次。n = 3 時是 ⌈log₂ 6⌉ = 3、n = 4 時是 ⌈log₂ 24⌉ = 5。
        </p>
        <p>
          這個量有多大：一方面 <Code>n! ≤ nⁿ</Code>，所以 <Code>log₂ n! ≤ n log₂ n</Code>；另一方面 n! 至少有 n/2 個因數不小於 n/2，所以 <Code>n! ≥ (n/2)^(n/2)</Code>，<Code>log₂ n! ≥ (n/2) log₂(n/2)</Code>。兩邊夾起來得到 <strong>log₂(n!) = Θ(n log n)</strong>，更精確的 Stirling 近似是 <Code>n log₂ n − 1.443n + O(log n)</Code>。所以比較排序的最壞情況是 <strong>Ω(n log n)</strong>，合併排序與堆積排序的最壞 O(n log n) 在漸近意義下已經最佳。平均情況也逃不掉：一棵有 n! 片葉子的二元樹，葉子的平均深度同樣至少是 log₂(n!)，因此快速排序的平均 O(n log n) 也是最佳的。
        </p>
        <p>
          下界常被誤讀。第一，它只管<strong>比較模型</strong>：計數排序拿值當陣列索引、基數排序看數字的位數，一次操作得到的資訊遠多於一次「是或否」，所以 O(n + k)、O(d·n) 並不矛盾，只是它們要求鍵是小整數或固定寬度。第二，它說的是「所有 n! 種輸入裡最壞的那個」：如果已知輸入幾乎有序，可能的排列少得多，插入排序的 O(n + 逆序對數) 就不受這條下界限制。第三，⌈log₂ n!⌉ 不一定做得到：n = 5 時下界是 7，一般的合併與二分插入最壞要 8 次，精心設計的 merge insertion 才做得到 7，而 n = 12 已證明最少要 30 次、比下界多 1。同一套「數答案有幾種」的論證也適用其他問題：在有序陣列裡找一個數有 n + 1 種結果，所以二分搜尋的 ⌈log₂(n+1)⌉ 次也是最佳的。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認<strong>計算模型</strong>：演算法是不是只能透過比較兩個元素來取得資訊。用了雜湊、索引或位元運算，就不在這條下界的範圍內。</>,
            <>數出<strong>可能的答案有幾種</strong>：排序 n 個相異元素有 n! 種，在有序陣列中搜尋有 n + 1 種。</>,
            <>把任一演算法畫成決策樹：每次比較有兩個分支，高度 h 的樹最多 2ʰ 片葉子，每種答案至少要佔一片。</>,
            <>由 <Code>2ʰ ≥ 答案數</Code> 得到 <Code>h ≥ ⌈log₂ 答案數⌉</Code>；排序就是 ⌈log₂ n!⌉ = Ω(n log n)。</>,
            <>需要更快時，只能改變前提：鍵是小整數就用計數或基數排序；輸入幾乎有序就用自適應的插入排序；只需要第 k 小或前 K 大，就不必完整排序。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>選 n = 2、3、4。上方四個數字是 n!、log₂ n!、最壞情況至少要比較的次數，以及對照用的 n log₂ n；中間一排方塊是高度 h 的二元樹最多能裝幾片葉子，灰色裝不下，藍色是第一個裝得下 n! 片的高度。n = 3 時畫出一棵實際的決策樹，選一組輸入就能看它沿著黃色路徑比了幾次、落在哪片葉子：[5, 2, 9] 只比 2 次，[5, 9, 2] 要比 3 次，但沒有任何輸入超過 3 次。最下面的表把 n 放大到一百萬，log₂ n! 和 n log₂ n 的比值往 1 靠近。</p>
        <LowerBoundDemo />
      </Section>

      <Section id="code">
        <p>程式碼把證明變成可以跑的數字：<Code>lower_bound</Code> 用整數精確算出 ⌈log₂ n!⌉；再寫兩個只能透過 <Code>less(x, y)</Code> 比較的排序，把 n 個元素的所有 n! 種排列都跑一遍，記下最多比了幾次。表格裡看得到兩件事：沒有任何演算法低於下界；n = 5 起，常見的演算法會比下界多一兩次，下界是「至少」而不是「剛好」。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 217", name: "Contains Duplicate（排序 O(n log n) 對上雜湊 O(n)，後者不在比較模型裡）", diff: "Easy" },
            { src: "LeetCode 278", name: "First Bad Version（n 種可能的答案，至少要 log₂ n 次詢問）", diff: "Easy" },
            { src: "LeetCode 128", name: "Longest Consecutive Sequence（要求 O(n)，所以不能先排序）", diff: "Medium" },
            { src: "LeetCode 164", name: "Maximum Gap（要求線性時間，用鴿籠原理分桶）", diff: "Medium" },
            { src: "LeetCode 41", name: "First Missing Positive（把值當索引，跳出比較模型）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const lowerBoundLesson: Lesson = { prereq: "Merge Sort、Heap Sort、Binary Tree Basics", Body };
