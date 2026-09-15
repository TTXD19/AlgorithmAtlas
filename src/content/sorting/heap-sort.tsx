import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { HeapSortDemo } from "@/components/lesson/demos/HeapSortDemo";
import type { Lesson } from "@/lib/lessons";

const python = `import heapq
from itertools import islice


def sift_down(a, i, size):
    """把 a[i] 往下沉，直到它不小於兩個子節點。只看前 size 格。"""
    while True:
        l, r, largest = 2 * i + 1, 2 * i + 2, i
        if l < size and a[l] > a[largest]:     # 子節點存在要比 size，不是 len(a)
            largest = l
        if r < size and a[r] > a[largest]:
            largest = r
        if largest == i:                       # 最大堆積性質成立
            return
        a[i], a[largest] = a[largest], a[i]
        i = largest


# 堆積排序：原地、O(1) 額外空間、最壞 O(n log n)、不穩定
def heap_sort(a):
    n = len(a)
    # 階段一：heapify。索引 n // 2 之後都是葉節點，從最後一個非葉節點往前沉
    for i in range(n // 2 - 1, -1, -1):
        sift_down(a, i, n)
    # 階段二：堆頂是最大值，換到尾端固定，堆積縮小一格後修復堆頂
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        sift_down(a, 0, end)                   # 只修前 end 格，尾端已排好
    return a


# 變形：邊排邊輸出（不是原地）。O(n) 建堆，之後每取一個 O(log n)
# 只取前 k 個時總成本 O(n + k log n)，全部取完就是一次完整的堆積排序
def iter_largest(nums):
    h = [-x for x in nums]                     # heapq 是最小堆積，取負當最大堆積
    heapq.heapify(h)
    while h:
        yield -heapq.heappop(h)


if __name__ == "__main__":
    print(heap_sort([5, 2, 9, 1, 7, 3, 8, 4]))     # [1, 2, 3, 4, 5, 7, 8, 9]
    scores = [62, 95, 71, 88, 95, 40, 79]
    print(list(islice(iter_largest(scores), 3)))   # [95, 95, 88]（第一頁只要前 3 名）`;

const cpp = `#include <algorithm>
#include <functional>
#include <iostream>
#include <utility>
#include <vector>

// 把 a[i] 往下沉，直到它不小於兩個子節點。只看前 size 格
void siftDown(std::vector<int>& a, int i, int size) {
    while (true) {
        int l = 2 * i + 1, r = 2 * i + 2, largest = i;
        if (l < size && a[l] > a[largest]) largest = l;
        if (r < size && a[r] > a[largest]) largest = r;
        if (largest == i) return;               // 最大堆積性質成立
        std::swap(a[i], a[largest]);
        i = largest;
    }
}

// 堆積排序：原地、O(1) 額外空間、最壞 O(n log n)
void heapSort(std::vector<int>& a) {
    int n = (int)a.size();
    for (int i = n / 2 - 1; i >= 0; i--)        // 階段一：heapify，O(n)
        siftDown(a, i, n);
    for (int end = n - 1; end > 0; end--) {     // 階段二：取出 n - 1 次
        std::swap(a[0], a[end]);                // 最大值落到尾端，固定
        siftDown(a, 0, end);                    // 堆積縮成前 end 格
    }
}

// 同一個演算法用 STL 寫：make_heap 建堆，pop_heap 把最大值移到 [begin, end) 的最後一格
// 預設 std::less 是最大堆積，得到由小到大；傳 std::greater 就變成由大到小
template <class Cmp = std::less<int>>
void heapSortStl(std::vector<int>& a, Cmp cmp = Cmp()) {
    std::make_heap(a.begin(), a.end(), cmp);
    for (auto end = a.end(); end != a.begin(); --end)
        std::pop_heap(a.begin(), end, cmp);     // 每次區間縮小一格
}

int main() {
    std::vector<int> a = {5, 2, 9, 1, 7, 3, 8, 4};
    heapSort(a);
    for (int x : a) std::cout << x << ' ';      // 1 2 3 4 5 7 8 9
    std::cout << '\\n';

    std::vector<int> scores = {62, 95, 71, 88, 95, 40, 79};
    heapSortStl(scores, std::greater<int>());
    for (int x : scores) std::cout << x << ' '; // 95 95 88 79 71 62 40
    std::cout << '\\n';
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "作業系統核心裡的 sort()",
              problem: "Linux 核心開機時要把上千筆例外處理表（exception table）排好，之後還有各種表格要排序。核心堆疊只有 8 KB 到 16 KB，不能放心遞迴；有些場合不方便配置記憶體；要排的內容也不一定受核心控制。",
              why: "堆積排序只用陣列本身，sift down 是迴圈不是遞迴，額外空間 O(1)，而且不管輸入長什麼樣子都是 O(n log n)。快速排序平均較快，但最壞 O(n²) 可以被刻意觸發；合併排序要 O(n) 的暫存。Linux 的 lib/sort.c 選的就是堆積排序。",
            },
            {
              title: "內建排序的保險絲",
              problem: "一個 API 接受使用者上傳 100 萬筆數字再排序。有人摸清了你的快速排序怎麼選 pivot，特地送來讓每次分割都極度不平均的資料，比較次數從約 2,000 萬暴增到約 5,000 億。",
              why: "混合排序平常跑快速排序，一旦發現遞迴層數超過約 2 log n，就把這一段交給堆積排序：它最壞也是 O(n log n)，而且同樣原地，不會丟掉快速排序不用暫存陣列的優勢。.NET 的 Array.Sort 與 Rust 的 sort_unstable 都拿堆積排序當最壞情況的退路。",
            },
            {
              title: "放榜查詢：大多數人只看前幾頁",
              problem: "30 萬名考生的成績要依分數由高到低分頁顯示，每頁 50 名。絕大多數人只看第一、二頁，但沒人知道會不會有人一路翻到最後。",
              why: "先花 O(n) 把成績 heapify 成最大堆積（約 60 萬次比較以內），之後每要一名就取出一次堆頂，約 36 次比較。第一頁總共不到 61 萬次，全部排好則要約 1,000 萬次。真有人翻到最後一頁，也不過是做完一次完整的堆積排序。",
            },
          ]}
          cue="原地排序、O(1) 額外空間、最壞也要 O(n log n)、不能遞迴、怕惡意輸入卡出最壞情況、快速排序的退路、邊排邊取出最大的幾個。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>堆積排序</strong>可以看成換了工具的選擇排序：選擇排序每輪要掃一遍才找得到極值，O(n)；如果未排序區本身就是一個<strong>最大堆積</strong>，最大值就在 <Code>a[0]</Code>，拿走後修復只要 O(log n)。整個演算法分兩個階段，全部在原陣列上完成。<strong>heapify</strong>：先把整個陣列整理成最大堆積。<strong>取出</strong>：反覆把堆頂 <Code>a[0]</Code> 和堆積的最後一格交換，堆積大小減一，再對新的根做 <strong>sift down</strong>。陣列因此分成兩段，前面 <Code>[0, size)</Code> 是堆積，後面 <Code>[size, n)</Code> 是已排好的尾端，尾端一輪長一格。
        </p>
        <p>
          正確性靠一個<strong>不變量</strong>：每輪開始時，<Code>a[size..n−1]</Code> 是全體最大的 n − size 個元素且已由小到大排好，<Code>a[0..size−1]</Code> 是其餘元素組成的最大堆積。堆頂是堆積裡最大的，又不大於尾端的任何一個，所以把它換到 <Code>size − 1</Code> 之後尾端依然有序、多了一格。換到根的那個元素只破壞了根這一個位置，左右子樹仍是堆積，一次 sift down 就修好，不變量延續到下一輪；<Code>size</Code> 降到 1 時整個陣列有序。建堆也是同樣的道理：索引 <Code>n // 2</Code> 以後都是葉節點，本身就是堆積，從 <Code>n // 2 − 1</Code> 往前處理，輪到節點 i 時它的兩棵子樹已經是堆積，一次 sift down 就讓以 i 為根的子樹也成為堆積。
        </p>
        <p>
          複雜度：heapify 看起來是 n/2 次 sift down、每次 O(log n)，但高度為 h 的節點最多 <Code>⌈n / 2^(h+1)⌉</Code> 個，每個最多下沉 h 層，總和 <Code>Σ h · n / 2^(h+1) = O(n)</Code>，因為大部分節點都在底層、根本沉不了幾層。取出階段做 n − 1 次 sift down，每次最多走樹高 ⌊log₂ n⌋ 層，<strong>O(n log n)</strong>。它沒有「運氣不好」的輸入：已排序、反序、隨機，最好、平均、最壞都是 <strong>O(n log n)</strong>（像全部相等這種特例反而會變成 O(n)，因為每次 sift down 第一步就停）。sift down 寫成迴圈時額外空間是 <strong>O(1)</strong>；寫成遞迴則要 O(log n) 的呼叫堆疊，就不算真正原地了。
        </p>
        <p>
          常見的錯有三個：sift down 判斷子節點存不存在時要比 <Code>size</Code>（目前的堆積大小）而不是 <Code>n</Code>，否則已排好的尾端會被拉回堆積；建堆的迴圈要從 <Code>n // 2 − 1</Code> <strong>往前</strong>跑，往後跑時子樹還不是堆積；由小到大要用<strong>最大</strong>堆積，原地用最小堆積會排成由大到小。它也<strong>不穩定</strong>：<Code>[2a, 2b, 1]</Code> 排完是 <Code>[1, 2b, 2a]</Code>，兩個 2 的相對順序反了。和鄰居比較：合併排序穩定，但要 O(n) 暫存；快速排序平均更快，因為分割是循序掃過相鄰的記憶體，而 sift down 從 <Code>i</Code> 跳到 <Code>2i + 1</Code>，大陣列上幾乎每一步都是快取未命中。所以堆積排序很少當主力，而是在「不能多用記憶體、又不能接受最壞 O(n²)」時出場。Binary Heap 講的是堆積本身，Top-K 用的是大小為 K 的堆積，這裡則是把整個陣列就地變成堆積。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>寫 <Code>sift_down(a, i, size)</Code>：在 <Code>i</Code>、<Code>2i + 1</Code>、<Code>2i + 2</Code> 中找最大的，子節點索引要 <Code>&lt; size</Code> 才算存在。最大的是 <Code>i</Code> 就停，否則交換並把 <Code>i</Code> 移到那個子節點，重複。</>,
            <><strong>建堆</strong>：<Code>i</Code> 從 <Code>n // 2 − 1</Code> 往下到 0，對每個 <Code>i</Code> 呼叫 <Code>sift_down(a, i, n)</Code>。完成後 <Code>a[0]</Code> 是最大值。</>,
            <><strong>取出</strong>：<Code>end</Code> 從 <Code>n − 1</Code> 往下到 1，交換 <Code>a[0]</Code> 與 <Code>a[end]</Code>，這一輪的最大值落在 <Code>end</Code>，之後不再移動。</>,
            <>對新的根呼叫 <Code>sift_down(a, 0, end)</Code>。此時堆積大小是 <Code>end</Code>，傳 <Code>n</Code> 會把已排好的尾端捲回去。</>,
            <>迴圈結束，陣列由小到大排好。要由大到小就把比較反過來（最小堆積）；只要最大的前 k 個，取出 k 次就停，成本 O(n + k log n)。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>共用陣列 [5, 2, 9, 1, 7, 3, 8, 4]。上方的樹只畫目前還在堆積裡的部分，節點下方的 [i] 是它在陣列裡的索引；下方是同一份陣列，綠色是已排好的尾端。黃色是正在比較的父子節點，藍色是剛交換的兩格。步驟 1 到 8 是 heapify，建完是 [9, 7, 8, 4, 2, 3, 5, 1]；之後每次取出都是「堆頂換到尾端」一次交換，再讓新的根往下沉，下沉的層數不會超過樹高。</p>
        <HeapSortDemo />
      </Section>

      <Section id="code">
        <p>核心是手寫的 <Code>sift_down</Code> 與兩階段的 <Code>heap_sort</Code>。Python 另外用 <Code>heapq</Code> 寫了一個邊排邊輸出的產生器，對應放榜翻頁的情境：它不是原地的，但示範了只取前 k 個時的 O(n + k log n)。C++ 用標準庫的 <Code>std::make_heap</Code> 與 <Code>std::pop_heap</Code> 重寫同一個演算法，傳入 <Code>std::greater</Code> 就變成由大到小。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 506", name: "Relative Ranks（從最大堆積依序取出，第幾個出來就是第幾名）", diff: "Easy" },
            { src: "LeetCode 1636", name: "Sort Array by Increasing Frequency（改寫 sift_down 的比較：先比次數，次數相同時值大的在前）", diff: "Easy" },
            { src: "LeetCode 912", name: "Sort an Array（手寫堆積排序，O(1) 額外空間且最壞 O(n log n)）", diff: "Medium" },
            { src: "LeetCode 215", name: "Kth Largest Element in an Array（heapify 後只取出 k 次，是提早停下的堆積排序）", diff: "Medium" },
            { src: "LeetCode 1962", name: "Remove Stones to Minimize the Total（原地 heapify，反覆修改堆頂再往下沉）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const heapSortLesson: Lesson = { prereq: "Binary Heap、Selection Sort", Body };
