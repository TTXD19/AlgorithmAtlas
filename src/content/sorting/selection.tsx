import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { SelectionSortDemo } from "@/components/lesson/demos/SelectionSortDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 選擇排序：每輪在未排序區找最小值，和未排序區的第一格交換
# 回傳交換次數，方便和其他排序對照
def selection_sort(a, key=lambda x: x):
    n = len(a)
    swaps = 0
    for i in range(n - 1):                  # 最後一格不用處理
        m = i                               # 只記最小值的索引，先不交換
        for j in range(i + 1, n):
            if key(a[j]) < key(a[m]):
                m = j
        if m != i:
            a[i], a[m] = a[m], a[i]         # 每輪最多交換一次，a[i] 從此固定
            swaps += 1
    return swaps


# 變形一：只跑前 k 輪，a[:k] 就是最小的 k 個（而且已排好），O(kn)
def smallest_k(a, k):
    n = len(a)
    for i in range(min(k, n)):
        m = min(range(i, n), key=a.__getitem__)   # 未排序區第一個最小值的索引
        a[i], a[m] = a[m], a[i]
    return a[:k]


# 變形二：穩定版。找到最小值後不交換，而是把 a[i..m-1] 右移一格再放進 a[i]
# 同值元素的相對順序不變，但寫入次數變成 O(n²)，失去選擇排序最大的優點
def stable_selection_sort(a, key=lambda x: x):
    n = len(a)
    for i in range(n - 1):
        m = i
        for j in range(i + 1, n):
            if key(a[j]) < key(a[m]):       # 嚴格小於：同值時留下最前面那個
                m = j
        x = a[m]
        while m > i:                        # 右移，不會越過任何同值元素
            a[m] = a[m - 1]
            m -= 1
        a[i] = x
    return a


if __name__ == "__main__":
    a = [5, 2, 9, 1, 7, 3, 8, 4]
    swaps = selection_sort(a)
    print(a, swaps)                         # [1, 2, 3, 4, 5, 7, 8, 9] 5
    print(smallest_k([5, 2, 9, 1, 7, 3, 8, 4], 3))   # [1, 2, 3]

    # 依分數排序，同分的 A 原本在 B 前面
    recs = [(3, "A"), (3, "B"), (1, "C")]
    selection_sort(recs, key=lambda r: r[0])
    print(recs)          # [(1, 'C'), (3, 'B'), (3, 'A')]  A、B 順序被打亂
    recs = [(3, "A"), (3, "B"), (1, "C")]
    stable_selection_sort(recs, key=lambda r: r[0])
    print(recs)          # [(1, 'C'), (3, 'A'), (3, 'B')]`;

const cpp = `#include <vector>
#include <utility>
#include <algorithm>
#include <functional>
#include <iostream>

// 選擇排序：每輪找未排序區的最小值，和第一格交換。回傳交換次數
template <typename T, typename Less = std::less<T>>
int selectionSort(std::vector<T>& a, Less less = Less()) {
    int n = (int)a.size(), swaps = 0;
    for (int i = 0; i < n - 1; i++) {           // 最後一格不用處理
        int m = i;                              // 只記索引，先不交換
        for (int j = i + 1; j < n; j++)
            if (less(a[j], a[m])) m = j;
        if (m != i) {
            std::swap(a[i], a[m]);              // 每輪最多交換一次
            swaps++;
        }
    }
    return swaps;
}

// 變形一：只跑前 k 輪，前 k 格就是最小的 k 個，O(kn)
void partialSelection(std::vector<int>& a, int k) {
    int n = (int)a.size();
    for (int i = 0; i < std::min(k, n); i++) {
        auto it = std::min_element(a.begin() + i, a.end());   // 第一個最小值
        std::swap(a[i], *it);
    }
}

// 變形二：穩定版，把最小值「搬」到前面而不是交換；寫入變成 O(n²)
template <typename T, typename Less = std::less<T>>
void stableSelectionSort(std::vector<T>& a, Less less = Less()) {
    int n = (int)a.size();
    for (int i = 0; i < n - 1; i++) {
        int m = i;
        for (int j = i + 1; j < n; j++)
            if (less(a[j], a[m])) m = j;        // 嚴格小於：同值留最前面的
        T x = a[m];
        for (; m > i; m--) a[m] = a[m - 1];     // 右移一格，不越過同值元素
        a[i] = x;
    }
}

int main() {
    std::vector<int> a = {5, 2, 9, 1, 7, 3, 8, 4};
    int swaps = selectionSort(a);
    for (int x : a) std::cout << x << ' ';
    std::cout << "| swaps = " << swaps << '\\n';          // 1 2 3 4 5 7 8 9 | swaps = 5

    std::vector<int> b = {5, 2, 9, 1, 7, 3, 8, 4};
    partialSelection(b, 3);
    std::cout << b[0] << ' ' << b[1] << ' ' << b[2] << '\\n';   // 1 2 3

    using Rec = std::pair<int, char>;                    // (分數, 名字)
    auto byScore = [](const Rec& x, const Rec& y) { return x.first < y.first; };
    std::vector<Rec> r1 = {{3, 'A'}, {3, 'B'}, {1, 'C'}}, r2 = r1;
    selectionSort(r1, byScore);
    stableSelectionSort(r2, byScore);
    for (auto& [score, name] : r1) std::cout << name << score << ' ';
    std::cout << '\\n';                                   // C1 B3 A3（A、B 順序被打亂）
    for (auto& [score, name] : r2) std::cout << name << score << ' ';
    std::cout << '\\n';                                   // C1 A3 B3
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "門禁控制器在 EEPROM 上整理卡片紀錄",
              problem: "外接 EEPROM 存了 100 筆卡片紀錄，要依卡號排好，之後才能二分搜尋。控制器只有 2 KB 的 RAM，放不下整份資料，只能直接在晶片上讀寫，而每個位址大約只能寫十萬次。",
              why: "比較只需要讀，讀不會磨損晶片；會磨損的是寫入。選擇排序每輪最多交換一次，100 筆最多 99 次交換、198 次紀錄寫入。氣泡排序最壞要交換 4,950 次，寫入量是 50 倍。",
            },
            {
              title: "倉儲機械手臂重排一整排貨箱",
              problem: "一排 12 個儲位放著貨箱，要依明天的出貨順序重新排列。掃條碼只要零點幾秒，但交換兩個貨箱要借緩衝位搬三趟，一次將近一分鐘。",
              why: "選擇排序先用便宜的掃描找出該放第一格的箱子，確定了才搬，而且只搬一次。12 箱最多交換 11 次；箱子編號互不相同時，它的交換次數正好是「只靠兩兩交換」的理論最少次數。換成氣泡排序，最壞要交換 66 次。",
            },
            {
              title: "Wi-Fi 模組只想試訊號最強的 3 個基地台",
              problem: "開機掃描到 20 個基地台，韌體要依訊號強度由強到弱嘗試前 3 個。程式跑在沒有標準函式庫的微控制器上，也不想為這點事另外配置記憶體。",
              why: "選擇排序每一輪都確定一個最終位置，所以每輪選最大、跑完 3 輪就停，前 3 格就是答案：比較 19 + 18 + 17 = 54 次，原地完成。k 和 n 都小時這是最省事的寫法；資料量大或是串流時，改用 Top-K 的堆積。",
            },
          ]}
          cue="交換或寫入次數要最少、比較便宜但搬動昂貴、每輪確定一個最終位置、只要前幾個、最少交換次數、不在乎穩定性的小資料。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>選擇排序</strong>把陣列分成兩區：左邊是<strong>已排好</strong>的區域，右邊是<strong>未排序</strong>的區域。每一輪把未排序區從頭掃到尾，記住最小值在哪個索引，掃完再把它和未排序區的第一格交換，已排好的區域就長一格。n−1 輪之後前 n−1 格都定位了，剩下的最後一格一定是最大的，不用再處理。
        </p>
        <p>
          正確性靠一個不變量：第 i 輪（從 0 算起）結束後，<Code>a[0..i]</Code> 是整個陣列最小的 i+1 個元素，而且由小到大排好。這一輪開始時，未排序區的每個元素都不小於已排好區的任何元素；挑出其中的最小值放到 <Code>a[i]</Code>，既不破壞順序，也保證它是剩下元素裡最小的，歸納下去就成立。和氣泡排序靠相鄰交換一步步把最大值推到尾端不同，選擇排序只記索引，確定之後<strong>一次交換</strong>就讓元素直接到達最終位置，所以交換最多 n−1 次。再進一步：把每一格連到「這格的元素排好後該去的位置」會形成若干個環，每次交換剛好從一個環拆出一個定位的元素，所以元素互不相同時，交換次數正好是 <Code>n − 環數</Code>，也就是只用交換排好序的最少次數。
        </p>
        <p>
          複雜度：第 i 輪要比較 n−1−i 次，總共 <Code>(n−1) + (n−2) + … + 1 = n(n−1)/2</Code>。這個數字<strong>和輸入無關</strong>：不看完未排序區的每一格，就無法確定誰最小，沒有提前結束的機會。所以最好、平均、最壞都是 <strong>Θ(n²)</strong> 次比較，已經排好的陣列也要比 n(n−1)/2 次，只是交換 0 次。交換最多 n−1 次，寫入是 O(n)；只多用一個索引變數，額外空間 <strong>O(1)</strong>。
        </p>
        <p>
          最常被忽略的是它<strong>不穩定</strong>：交換會把 <Code>a[i]</Code> 一口氣丟到後面，可能越過和它同值的元素。例如依分數排序 <Code>[(3, A), (3, B), (1, C)]</Code>，第一輪把 (3, A) 和 (1, C) 交換，得到 <Code>[(1, C), (3, B), (3, A)]</Code>，A、B 的順序反了。要穩定得改成取出最小值、中間元素右移一格再放回，但寫入次數會變成 O(n²)，最大的優點也沒了。另一個常見錯誤是在內層迴圈一看到更小的就交換，交換次數會退化成 O(n²)；內層只該更新索引。和鄰居比較：氣泡排序的交換次數等於逆序對數量，但穩定、能提前結束；插入排序在近乎有序時是 O(n)，小陣列實務上都選它；<strong>堆積排序</strong>則是選擇排序的升級版，把「掃一遍找最值」換成堆積的 O(log n)，整體變成 O(n log n)。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>外層 <Code>i</Code> 從 0 跑到 n−2。此時 <Code>a[0..i−1]</Code> 已排好，<Code>a[i..n−1]</Code> 是未排序區。</>,
            <>設 <Code>m = i</Code>。內層 <Code>j</Code> 從 i+1 掃到 n−1，只要 <Code>a[j] &lt; a[m]</Code> 就令 <Code>m = j</Code>。內層只更新索引，不交換。</>,
            <>內層結束後，若 <Code>m ≠ i</Code> 就交換 <Code>a[i]</Code> 與 <Code>a[m]</Code>。<Code>a[i]</Code> 從此是最終值，之後不再碰它。</>,
            <>最後一格不用跑：前 n−1 格放的都是較小的元素，剩下那格一定最大。要由大到小，把比較改成 <Code>&gt;</Code>，每輪選最大值。</>,
            <>只要最小的 k 個，外層跑 k 輪就停，<Code>a[0..k−1]</Code> 就是答案，O(kn)。需要穩定時，把交換改成「取出 <Code>a[m]</Code>、把 <Code>a[i..m−1]</Code> 右移一格、放進 <Code>a[i]</Code>」。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>和氣泡排序共用陣列 [5, 2, 9, 1, 7, 3, 8, 4]，由小到大。每一步看未排序區的一格：藍色是正在看的格子，黃色是目前的最小值候選，找到更小的，黃色就跳到那一格；掃完一輪，藍色的兩格就是這輪唯一的一次交換，綠色是左邊已排好的區域。注意第 2 輪和第 7 輪最小值本來就在定位，不用交換。最後比較 28 次、交換只有 5 次（這份資料有 3 個環，8 − 3 = 5，已經是最少）；同一份陣列用氣泡排序要交換 13 次。</p>
        <SelectionSortDemo />
      </Section>

      <Section id="code">
        <p>基本版回傳交換次數，可以直接和氣泡排序對照；兩個變形分別是只跑前 k 輪取出最小的 k 個，以及用右移代替交換的穩定版。主程式用同分的紀錄跑一般版與穩定版，看交換如何打亂同分元素的順序。C++ 用樣板加比較函式，同一份程式碼能排整數，也能排紀錄。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 414", name: "Third Maximum Number（跑三輪「選最大」，重複值只算一次）", diff: "Easy" },
            { src: "LeetCode 2500", name: "Delete Greatest Value in Each Row（每輪各列選出最大值）", diff: "Easy" },
            { src: "LeetCode 670", name: "Maximum Swap（由大到小的選擇排序只做一次交換）", diff: "Medium" },
            { src: "LeetCode 969", name: "Pancake Sorting（每輪把最大值翻到尾端）", diff: "Medium" },
            { src: "LeetCode 2471", name: "Minimum Number of Operations to Sort a Binary Tree by Level（最少交換 = n − 環數）", diff: "Medium" },
            { src: "LeetCode 765", name: "Couples Holding Hands（另一種最少交換次數）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const selectionLesson: Lesson = { prereq: "Array & Dynamic Array、Bubble Sort", Body };
