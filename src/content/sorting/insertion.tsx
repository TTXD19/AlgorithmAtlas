import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { InsertionSortDemo } from "@/components/lesson/demos/InsertionSortDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from bisect import bisect_right


# 插入排序：左邊 a[0..i-1] 已排好，拿起 a[i]，比它大的往右挪，再放進洞裡
def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]                          # 手上的牌，a[i] 變成洞
        j = i - 1
        while j >= 0 and a[j] > key:        # 嚴格大於才挪，同值不越過，保持穩定
            a[j + 1] = a[j]                 # 往右挪一格，洞往左移
            j -= 1
        a[j + 1] = key                      # 放進洞裡
    return a


# 變形一：二分插入排序
# 用二分搜尋找位置，比較降到 O(n log n)；搬移仍是 O(n²)，適合比較很貴的資料
def binary_insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        pos = bisect_right(a, key, 0, i)    # 放在相等元素的右邊，保持穩定
        a[pos + 1:i + 1] = a[pos:i]         # 整段往右挪一格
        a[pos] = key
    return a


# 變形二：只排 a[lo..hi]（閉區間）
# 混合排序切到小段時呼叫它，而不是繼續遞迴
def insertion_sort_range(a, lo, hi):
    for i in range(lo + 1, hi + 1):
        key = a[i]
        j = i - 1
        while j >= lo and a[j] > key:       # 左界是 lo，不是 0
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key


if __name__ == "__main__":
    print(insertion_sort([5, 2, 9, 1, 7, 3, 8, 4]))                  # [1, 2, 3, 4, 5, 7, 8, 9]
    print(binary_insertion_sort(["pear", "fig", "apple", "kiwi"]))  # ['apple', 'fig', 'kiwi', 'pear']
    b = [9, 8, 7, 6, 5, 4, 3, 2, 1]
    insertion_sort_range(b, 2, 6)                                    # 只排索引 2..6
    print(b)                                                         # [9, 8, 3, 4, 5, 6, 7, 2, 1]`;

const cpp = `#include <vector>
#include <string>
#include <algorithm>
#include <iostream>

// 插入排序：拿起 a[i]，比它大的往右挪，再放進洞裡
void insertionSort(std::vector<int>& a) {
    for (int i = 1; i < (int)a.size(); i++) {
        int key = a[i];                         // 手上的牌
        int j = i - 1;
        while (j >= 0 && a[j] > key) {          // 先判斷 j >= 0，否則會讀到 a[-1]
            a[j + 1] = a[j];                    // 往右挪一格
            j--;
        }
        a[j + 1] = key;                         // 放進洞裡
    }
}

// 變形一：二分插入排序，比較昂貴的型別（字串、物件）才划算
template <typename T>
void binaryInsertionSort(std::vector<T>& a) {
    for (auto it = a.begin(); it != a.end(); ++it) {
        auto pos = std::upper_bound(a.begin(), it, *it);  // 相等的放右邊，保持穩定
        std::rotate(pos, it, it + 1);           // [pos, it) 右移一格，*it 移到 pos
    }
}

// 變形二：只排 a[lo..hi]，混合排序在小段落呼叫它
void insertionSortRange(std::vector<int>& a, int lo, int hi) {
    for (int i = lo + 1; i <= hi; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= lo && a[j] > key) {         // 左界是 lo，不是 0
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}

int main() {
    std::vector<int> a = {5, 2, 9, 1, 7, 3, 8, 4};
    insertionSort(a);
    for (int x : a) std::cout << x << ' ';      // 1 2 3 4 5 7 8 9
    std::cout << '\\n';

    std::vector<std::string> w = {"pear", "fig", "apple", "kiwi"};
    binaryInsertionSort(w);
    for (auto& s : w) std::cout << s << ' ';    // apple fig kiwi pear
    std::cout << '\\n';

    std::vector<int> b = {9, 8, 7, 6, 5, 4, 3, 2, 1};
    insertionSortRange(b, 2, 6);                // 只排索引 2..6
    for (int x : b) std::cout << x << ' ';      // 9 8 3 4 5 6 7 2 1
    std::cout << '\\n';
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "語言內建 sort 的最後一哩路",
              problem: "排序一百萬個整數，快速排序或合併排序一路切半，切到最後會有好幾萬個只剩十幾個元素的小段。對這麼小的段落還繼續遞迴、選 pivot、配置暫存陣列，花在管理上的時間比真正的比較還多。",
              why: "n 很小時，常數比成長率重要。插入排序沒有遞迴、只在相鄰格子間挪動、對 CPU 快取友善，十幾個元素時比 O(n log n) 的演算法快。LLVM libc++ 的 std::sort 在區段少於 24 個元素時改用插入排序，Python 的 Timsort 則用二分插入排序把短片段補到 32～64 個元素再合併。",
            },
            {
              title: "感測器時間序列：晚到幾格的資料",
              problem: "工廠的溫度感測器每秒送 10 筆帶時間戳記的讀數，一天 864,000 筆。網路延遲讓少數封包晚到，但任何一筆和正確位置的距離都不超過 5 格。存檔前要依時間戳記排好。",
              why: "插入排序的成本是 O(n + 逆序對數)。每筆最多往回挪 5 格，總挪動不超過 432 萬次、比較不超過約 518 萬次，而且資料可以邊到邊排；快速排序、堆積排序這類不看資料是否整齊的排序，比較次數在 n log₂ n ≈ 1,700 萬這個量級，還得等資料到齊。",
            },
            {
              title: "路跑現場看板：選手一個個衝線",
              problem: "路跑分波出發，60 位選手陸續衝線。每個人的淨成績是衝線時間減去自己那一波的起跑時間，所以晚衝線的人不一定比較慢。大會螢幕要在每位選手衝線的瞬間更新排名。",
              why: "插入排序的不變量是「前 i 筆永遠有序」，天生是線上演算法：新成績進來，只要從尾端往前挪到正確位置，其他人的相對順序不動。60 人全部到齊最多挪 1,770 次；成績相同的選手會照衝線先後排列，因為它是穩定的。",
            },
          ]}
          cue="小陣列（幾十個以內）、幾乎有序、每個元素離正確位置不遠、資料一筆一筆來且要隨時有序、需要穩定又原地、混合排序的小段落。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>插入排序</strong>就是整理手上撲克牌的方式：左手拿著一疊已經排好的牌，每次摸一張新牌，從右往左找到它該在的位置插進去。放到陣列上，就是把陣列分成左邊的<strong>已排序區</strong> <Code>a[0..i-1]</Code> 和右邊還沒處理的部分。每一輪把 <Code>a[i]</Code> 存進 <Code>key</Code>，原位置就空出一個「洞」；往左看，比 <Code>key</Code> 大的元素一個個往右挪一格，洞跟著往左移，碰到第一個不比 <Code>key</Code> 大的元素（或到了最左邊）就停，把 <Code>key</Code> 放進洞裡。
        </p>
        <p>
          正確性靠一個<strong>迴圈不變量</strong>：第 i 輪開始前，<Code>a[0..i-1]</Code> 恰好是原本前 i 個元素排好的結果。這一輪被挪動的都是比 <Code>key</Code> 大的元素，而且整段一起右移、彼此順序不變；停下來的位置 <Code>j</Code> 滿足 <Code>a[j] ≤ key</Code>，它左邊的元素又都 ≤ <Code>a[j]</Code>，所以 <Code>key</Code> 放進 <Code>j+1</Code> 後，<Code>a[0..i]</Code> 仍然有序。做到 i = n−1，整個陣列就排好了。因為只在<strong>嚴格大於</strong>時才挪，<Code>key</Code> 永遠不會越過和它相等的元素，所以插入排序是<strong>穩定</strong>的；而且只多用一個暫存變數，是<strong>原地</strong>排序。
        </p>
        <p>
          複雜度看挪動次數就好：每挪一次，恰好消掉一個<strong>逆序對</strong>（<Code>key</Code> 和被它越過的元素），所以總挪動次數等於陣列的逆序對數 <Code>I</Code>；每一輪最多再多一次「不成立」的比較，比較次數介於 <Code>I</Code> 和 <Code>I + (n−1)</Code> 之間，總時間是 <strong>O(n + I)</strong>。已排序時 <Code>I = 0</Code>，只做 n−1 次比較，<strong>最好 O(n)</strong>；完全反序時 <Code>I = n(n−1)/2</Code>，<strong>最壞 O(n²)</strong>；隨機資料的逆序對期望值是 <Code>n(n−1)/4</Code>，<strong>平均仍是 O(n²)</strong>。若每個元素離最終位置最多 k 格，每個元素最多往左挪 k 格，時間就是 <strong>O(nk)</strong>。額外空間 <strong>O(1)</strong>。
        </p>
        <p>
          常見的錯有三個。迴圈條件必須有 <Code>j &gt;= 0</Code>，而且要寫在 <Code>a[j] &gt; key</Code> 前面：C++ 少了它或順序反了，會讀到 <Code>a[-1]</Code> 這個越界位置；Python 的 <Code>a[-1]</Code> 是合法的「最後一個元素」，少了檢查可能丟出 IndexError，也可能不報錯卻把資料弄亂。把 <Code>&gt;</Code> 寫成 <Code>&gt;=</Code> 會讓相等元素互相越過，失去穩定性。用交換代替挪動結果一樣，但每一步從一次寫入變成三次，做的其實就是氣泡排序那種相鄰交換。和鄰居比較：氣泡排序的交換次數同樣等於逆序對數，但插入排序每步只寫一次；選擇排序不管資料長怎樣都要 <Code>n(n−1)/2</Code> 次比較，插入排序則會隨資料越有序而自動變快（<strong>自適應</strong>）。它也是<strong>線上</strong>演算法，資料一筆一筆到也能維持有序。合併排序、快速排序在小段落改用它；把「挪一格」推廣成「挪 gap 格」，就是希爾排序。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>外層 <Code>i</Code> 從 1 跑到 n−1。進入第 i 輪時，<Code>a[0..i-1]</Code> 已經有序；一開始只有 <Code>a[0]</Code>，一個元素自己就是有序的。</>,
            <>把 <Code>a[i]</Code> 存進 <Code>key</Code>，令 <Code>j = i − 1</Code>。此時 <Code>a[i]</Code> 可以視為一個洞，覆寫它不會弄丟資料。</>,
            <><Code>while j &gt;= 0 and a[j] &gt; key</Code>：<Code>a[j+1] = a[j]</Code>，<Code>j -= 1</Code>。先檢查 <Code>j &gt;= 0</Code>，而且只在<strong>嚴格大於</strong>時挪，才能保持穩定。</>,
            <>迴圈停下時 <Code>a[j] ≤ key</Code> 或 <Code>j = −1</Code>，把 <Code>key</Code> 寫進 <Code>a[j+1]</Code>，已排序區變成 <Code>a[0..i]</Code>。</>,
            <>比較很貴時，改用 <Code>bisect_right</Code>（upper_bound）在 <Code>a[0..i-1]</Code> 找插入位置，再整段右移；當作混合排序的小段落使用時，把左界 0 換成區段起點 <Code>lo</Code>。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>共用陣列 [5, 2, 9, 1, 7, 3, 8, 4]。每一輪拿起一個元素放到「手上的牌」，原位置變成虛線的洞；綠色是已排序區，黃色是剛和手上的牌比較過的元素（比較大就挪到右邊一格，洞往左移），藍色是剛插入的位置。注意插入 9 時只比一次就停下，插入 1 則一路挪到最左邊；最後挪動次數是 13，正好是這個陣列的逆序對數量。比較是 18 次：13 次挪動，加上 5 次讓迴圈停下的比較（插入 2 和 1 時到了最左邊才停，不需要這一次），正好落在 I 到 I + (n−1) = 20 之間。</p>
        <InsertionSortDemo />
      </Section>

      <Section id="code">
        <p>基本版加上兩個變形。二分插入排序把比較次數降到 O(n log n)，但搬移仍是 O(n²)，適合比較很貴的字串或物件，Timsort 用的就是它；C++ 用 <Code>std::upper_bound</Code> 找位置、<Code>std::rotate</Code> 一次挪整段。區間版只排 <Code>a[lo..hi]</Code>，是混合排序在小段落呼叫的形式。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 2418", name: "Sort the People（手寫插入排序，名字跟著身高一起挪）", diff: "Easy" },
            { src: "LeetCode 147", name: "Insertion Sort List（鏈結串列不用挪，但要從頭找位置）", diff: "Medium" },
            { src: "LeetCode 57", name: "Insert Interval（在有序區間裡找位置插入，再合併重疊）", diff: "Medium" },
            { src: "LeetCode 775", name: "Global and Local Inversions（每個元素離定位最多 1 格時，逆序對全是相鄰的）", diff: "Medium" },
            { src: "LeetCode 1649", name: "Create Sorted Array through Instructions（每次插入的成本，要用 BIT 加速）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const insertionLesson: Lesson = { prereq: "Array & Dynamic Array、Bubble Sort", Body };
