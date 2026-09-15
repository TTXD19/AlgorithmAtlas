import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { QuickSortDemo } from "@/components/lesson/demos/QuickSortDemo";
import type { Lesson } from "@/lib/lessons";

const python = `import random


def partition(a, lo, hi):
    """Lomuto 分割：以 a[hi] 為 pivot，回傳 pivot 最後的位置"""
    pivot = a[hi]
    i = lo - 1                              # a[lo..i] 都 <= pivot
    for j in range(lo, hi):
        if a[j] <= pivot:
            i += 1
            a[i], a[j] = a[j], a[i]
    a[i + 1], a[hi] = a[hi], a[i + 1]       # pivot 放到兩區中間，從此不再移動
    return i + 1


def quick_sort(a, lo=0, hi=None):
    """隨機 pivot + 只遞迴較短的一邊：平均 O(n log n)，堆疊深度 O(log n)"""
    if hi is None:
        hi = len(a) - 1
    while lo < hi:
        r = random.randint(lo, hi)          # 隨機選 pivot，換到尾端再分割
        a[r], a[hi] = a[hi], a[r]
        p = partition(a, lo, hi)
        if p - lo < hi - p:                 # 左邊較短：遞迴左邊，右邊留給迴圈
            quick_sort(a, lo, p - 1)
            lo = p + 1
        else:
            quick_sort(a, p + 1, hi)
            hi = p - 1
    return a


def partition3(a, lo, hi):
    """三路分割：a[lo..lt-1] < pivot、a[lt..gt] == pivot、a[gt+1..hi] > pivot"""
    pivot = a[random.randint(lo, hi)]
    lt, i, gt = lo, lo, hi
    while i <= gt:
        if a[i] < pivot:
            a[lt], a[i] = a[i], a[lt]
            lt += 1
            i += 1
        elif a[i] > pivot:
            a[i], a[gt] = a[gt], a[i]
            gt -= 1                         # 換過來的元素還沒看過，i 不前進
        else:
            i += 1
    return lt, gt


def quick_sort_3way(a, lo=0, hi=None):
    """大量重複值也不退化：等於 pivot 的整段一次定位"""
    if hi is None:
        hi = len(a) - 1
    if lo >= hi:
        return a
    lt, gt = partition3(a, lo, hi)
    quick_sort_3way(a, lo, lt - 1)
    quick_sort_3way(a, gt + 1, hi)
    return a


def quick_select(a, k):
    """第 k 小的值（k 從 0 起算），平均 O(n)；會改變 a 的順序"""
    lo, hi = 0, len(a) - 1
    while True:
        lt, gt = partition3(a, lo, hi)
        if k < lt:
            hi = lt - 1                     # 答案在左段，右邊整個丟掉
        elif k > gt:
            lo = gt + 1
        else:
            return a[k]                     # k 落在「等於 pivot」那段


if __name__ == "__main__":
    b = [5, 2, 9, 1, 7, 3, 8, 4]
    print(partition(b, 0, len(b) - 1), b)   # 3 [2, 1, 3, 4, 7, 9, 8, 5]（和示範第一次分割相同）
    print(quick_sort([5, 2, 9, 1, 7, 3, 8, 4]))           # [1, 2, 3, 4, 5, 7, 8, 9]
    print(quick_sort_3way([3, 1, 3, 3, 2, 1, 3, 2]))      # [1, 1, 2, 2, 3, 3, 3, 3]
    nums = [5, 2, 9, 1, 7, 3, 8, 4]
    print(quick_select(nums[:], 3))                       # 4（第 4 小）
    print(quick_select(nums[:], len(nums) - 2))           # 8（第 2 大）`;

const cpp = `#include <vector>
#include <random>
#include <utility>
#include <iostream>

std::mt19937 rng(std::random_device{}());
int randomIndex(int lo, int hi) { return std::uniform_int_distribution<int>(lo, hi)(rng); }

// Lomuto 分割：以 a[hi] 為 pivot，回傳 pivot 最後的位置
int partition(std::vector<int>& a, int lo, int hi) {
    int pivot = a[hi], i = lo - 1;          // a[lo..i] 都 <= pivot
    for (int j = lo; j < hi; j++)
        if (a[j] <= pivot) std::swap(a[++i], a[j]);
    std::swap(a[i + 1], a[hi]);             // pivot 放到兩區中間
    return i + 1;
}

// 隨機 pivot + 只遞迴較短的一邊：堆疊深度 O(log n)
void quickSort(std::vector<int>& a, int lo, int hi) {
    while (lo < hi) {
        std::swap(a[randomIndex(lo, hi)], a[hi]);
        int p = partition(a, lo, hi);
        if (p - lo < hi - p) { quickSort(a, lo, p - 1); lo = p + 1; }
        else                 { quickSort(a, p + 1, hi); hi = p - 1; }
    }
}

// 三路分割：a[lo..lt-1] < pivot、a[lt..gt] == pivot、a[gt+1..hi] > pivot
std::pair<int, int> partition3(std::vector<int>& a, int lo, int hi) {
    int pivot = a[randomIndex(lo, hi)];
    int lt = lo, i = lo, gt = hi;
    while (i <= gt) {
        if (a[i] < pivot) std::swap(a[lt++], a[i++]);
        else if (a[i] > pivot) std::swap(a[i], a[gt--]);   // 換來的還沒看，i 不動
        else i++;
    }
    return {lt, gt};
}

void quickSort3(std::vector<int>& a, int lo, int hi) {
    if (lo >= hi) return;
    auto [lt, gt] = partition3(a, lo, hi);
    quickSort3(a, lo, lt - 1);              // 等於 pivot 的整段不用再排
    quickSort3(a, gt + 1, hi);
}

// Quick Select：第 k 小（k 從 0 起算），平均 O(n)
int quickSelect(std::vector<int> a, int k) {
    int lo = 0, hi = (int)a.size() - 1;
    while (true) {
        auto [lt, gt] = partition3(a, lo, hi);
        if (k < lt) hi = lt - 1;            // 答案在左段
        else if (k > gt) lo = gt + 1;       // 答案在右段
        else return a[k];
    }
}

int main() {
    std::vector<int> a = {5, 2, 9, 1, 7, 3, 8, 4};
    quickSort(a, 0, (int)a.size() - 1);
    for (int x : a) std::cout << x << ' ';  // 1 2 3 4 5 7 8 9
    std::cout << '\\n';

    std::vector<int> b = {3, 1, 3, 3, 2, 1, 3, 2};
    quickSort3(b, 0, (int)b.size() - 1);
    for (int x : b) std::cout << x << ' ';  // 1 1 2 2 3 3 3 3
    std::cout << '\\n';

    std::cout << quickSelect({5, 2, 9, 1, 7, 3, 8, 4}, 3) << '\\n';   // 4（第 4 小）
    // 標準庫：std::nth_element 就是 Quick Select
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "電商搜尋結果依價格排序",
              problem: "一次查詢撈出 200 萬件商品，要在記憶體裡依價格由低到高排好再分頁。價格是 double，同價的商品誰先誰後無所謂。",
              why: "快速排序在原陣列上交換，不必像合併排序再開一份 200 萬格的暫存陣列（多 16 MB）；分割是從頭到尾循序掃，對 CPU 快取很友善，常數比其他 O(n log n) 排序小。不要求穩定時，語言內建的排序多半以它為主體，例如 Java 對 double[] 的 Arrays.sort 用的就是雙軸快速排序。",
            },
            {
              title: "監控面板上的 p50 與 p99 延遲",
              problem: "每分鐘收到 120 萬筆 API 回應時間，要算出 p50 和 p99，也就是排序後第 60 萬個與第 118 萬 8 千個位置上的值。全部排好是 O(n log n)，但其他 119 萬多個位置的順序根本用不到。",
              why: "Quick Select 用同樣的分割，但分割完只往答案所在的那一邊走，另一邊整個丟掉。每次切在中間時總共只掃 n + n/2 + n/4 + … ≤ 2n 個元素，隨機選 pivot 下期望仍是 O(n)。C++ 的 std::nth_element 就是這個想法。",
            },
            {
              title: "三千萬筆訂單依狀態分組",
              problem: "訂單只有「待付款、已付款、出貨中、已送達、已取消」五種狀態，要把三千萬筆原地依狀態排好，不想再多開一份陣列。",
              why: "重複值極多時，一般的分割把等於 pivot 的元素全擠到同一邊，最壞會退化成 O(n²)。三路分割一次把「等於 pivot」的整段收在中間、不再遞迴，每往下一層至少少一種狀態，最多五層、每層掃 O(n)，接近線性，而且全程原地。",
            },
          ]}
          cue="原地排序、不要求穩定、平均最快、pivot、分割（partition）、第 k 小／中位數／百分位數、大量重複值用三路分割、語言內建 sort。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>快速排序</strong>是反過來的分治。合併排序直接從中間切，功夫花在合併；快速排序則是把功夫花在前面的<strong>分割（partition）</strong>：選一個 <strong>pivot</strong>，把 ≤ pivot 的元素搬到左邊、&gt; pivot 的搬到右邊。分割完，pivot 左邊每個都不比它大、右邊每個都比它大，所以它已經站在排序後的最終位置，之後再也不用動。左右兩段各自遞迴就好，沒有合併步驟，全程在原陣列上交換。
        </p>
        <p>
          為什麼正確？示範用的 <strong>Lomuto 分割</strong>取 <Code>a[hi]</Code> 當 pivot，用 <Code>i</Code>、<Code>j</Code> 把範圍切成三段並維持不變量：<Code>a[lo..i]</Code> 都 ≤ pivot、<Code>a[i+1..j-1]</Code> 都 &gt; pivot、<Code>a[j..hi-1]</Code> 還沒看。看 <Code>a[j]</Code> 時，若它 &gt; pivot，<Code>j</Code> 前進就自然併入第二段；若它 ≤ pivot，<Code>i</Code> 先前進一格再交換 <Code>a[i]</Code>、<Code>a[j]</Code>，第二段開頭那個大元素被換到第二段尾端，<Code>a[j]</Code> 則併入第一段，三段的性質都沒被破壞。掃完時第三段是空的，把 pivot 換到 <Code>i+1</Code> 就得到「左 ≤ pivot &lt; 右」。再對長度做歸納：左右兩段遞迴排好後，左段每個值 ≤ pivot &lt; 右段每個值，整段就有序。
        </p>
        <p>
          複雜度：同一層遞迴的所有分割加起來掃 O(n)，所以時間取決於有幾層。pivot 每次切在中間時 <Code>T(n) = 2T(n/2) + O(n)</Code>，log n 層，<strong>O(n log n)</strong>；每次都是極值時（已排序的資料固定取尾端當 pivot）<Code>T(n) = T(n−1) + O(n)</Code>，n 層，<strong>O(n²)</strong>。改成<strong>隨機選 pivot</strong> 後，元素互不相同時期望比較次數約 <Code>2n ln n ≈ 1.39 n log₂ n</Code>，不管輸入原本怎麼排都一樣，沒有哪種排列能穩定觸發最壞情況。空間方面分割是原地的，額外成本只有遞迴堆疊：平均深度 O(log n)，但兩邊都直接遞迴時最壞深度是 O(n)。<strong>只遞迴較短的一邊</strong>、較長的一邊用迴圈接著處理，每深一層範圍至少減半，深度保證不超過 log₂ n，這才是 <strong>O(log n) 空間</strong>的由來。
        </p>
        <p>
          常見的坑有三個。第一是<strong>大量重複值</strong>：Lomuto 把等於 pivot 的元素全放左邊，所有值都相同時每次只少一個，隨機 pivot 也救不了；要改用<strong>三路分割</strong>，切成 <Code>&lt; pivot</Code>、<Code>== pivot</Code>、<Code>&gt; pivot</Code> 三段，中間整段一次定位。第二是<strong>不穩定</strong>：遠距離交換會打亂同值元素的先後，例如 <Code>[2₁, 2₂, 1]</Code> 以 1 為 pivot 分割後變成 <Code>[1, 2₂, 2₁]</Code>。第三是遞迴範圍沒有排除 pivot，寫成 <Code>[lo, p]</Code> 時範圍可能完全不縮小而無限遞迴。和鄰近課程比：合併排序最壞也是 O(n log n) 而且穩定，但要 O(n) 暫存陣列；堆積排序最壞 O(n log n) 又只要 O(1) 空間，但存取跳來跳去，實務上較慢。所以不穩定的內建排序多以快速排序為主體再加保險（例如 introsort 在遞迴太深時改用堆積排序、小段落改用插入排序），需要穩定時（Python 的 <Code>sorted</Code>、Java 的物件排序）則用合併型的 Timsort。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>範圍 <Code>[lo, hi]</Code> 只剩 0 或 1 個元素（<Code>lo &gt;= hi</Code>）就直接返回。</>,
            <>在 <Code>[lo, hi]</Code> 隨機選一個索引，和 <Code>a[hi]</Code> 交換，讓它當 pivot。</>,
            <>Lomuto 分割：<Code>i = lo − 1</Code>；<Code>j</Code> 從 <Code>lo</Code> 掃到 <Code>hi − 1</Code>，遇到 <Code>a[j] &lt;= pivot</Code> 就 <Code>i += 1</Code> 並交換 <Code>a[i]</Code>、<Code>a[j]</Code>。</>,
            <>掃完交換 <Code>a[i+1]</Code> 與 <Code>a[hi]</Code>，<Code>p = i + 1</Code> 就是 pivot 的最終位置。</>,
            <>處理 <Code>[lo, p−1]</Code> 與 <Code>[p+1, hi]</Code>：較短的一邊遞迴，較長的一邊更新 <Code>lo</Code> 或 <Code>hi</Code> 後回到步驟 1 用迴圈繼續，堆疊深度就不會超過 log n。</>,
            <>資料有大量重複值時改用三路分割（<Code>lt</Code>、<Code>i</Code>、<Code>gt</Code> 三個指標），等於 pivot 的整段不再遞迴；只要第 k 小就用 Quick Select，每次只往 k 所在的那一段繼續。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>共用陣列 [5, 2, 9, 1, 7, 3, 8, 4]，固定取範圍最後一個元素當 pivot 做 Lomuto 分割（示範不隨機，每次播放才會一樣）。黃色是 pivot，藍色是剛交換的兩格，綠色是已定位的元素，灰色在目前範圍之外；分割進行中，下方會列出 ≤ pivot 區、&gt; pivot 區與還沒看的元素。第一刀以 4 為 pivot 切成 3 個和 4 個，還算平均；之後以 3、5、7 為 pivot 的三次分割，pivot 都剛好是當時範圍裡的極值，範圍每次只縮小 1，這就是退化成 O(n²) 的樣子。</p>
        <QuickSortDemo />
      </Section>

      <Section id="code">
        <p>Lomuto 分割（和示範相同）、隨機 pivot 並只遞迴較短一邊的快速排序、處理大量重複值的三路分割版本，以及用三路分割實作的 Quick Select。兩種分割都列出來，是因為 Lomuto 最好懂，但遇到大量重複值只有三路分割撐得住，Quick Select 也因此選用三路分割。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 905", name: "Sort Array By Parity（一次分割：偶數放左、奇數放右）", diff: "Easy" },
            { src: "LeetCode 75", name: "Sort Colors（三路分割，也叫荷蘭國旗問題）", diff: "Medium" },
            { src: "LeetCode 2161", name: "Partition Array According to Given Pivot（要保持原本的相對順序，交換式分割會打亂它）", diff: "Medium" },
            { src: "LeetCode 912", name: "Sort an Array（固定取尾端當 pivot 容易超時，加上隨機與三路分割）", diff: "Medium" },
            { src: "LeetCode 215", name: "Kth Largest Element in an Array（Quick Select，注意大量重複值）", diff: "Medium" },
            { src: "LeetCode 324", name: "Wiggle Sort II（Quick Select 找中位數再三路分割）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const quickSortLesson: Lesson = { prereq: "Recursion、Merge Sort", Body };
