import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { BubbleSortDemo } from "@/components/lesson/demos/BubbleSortDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 氣泡排序：相鄰兩格比較，大的往右換
# 每掃完一輪，這輪最大的元素一定被推到尾端
def bubble_sort(a):
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):          # 尾端 i 個已固定，不用再看
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:                      # 一整輪沒交換，代表已經有序
            break
    return a


# 變形：雞尾酒排序（雙向氣泡）
# 一輪往右推最大值、一輪往左推最小值。小值卡在尾端（烏龜）時快很多，
# 但最壞仍是 O(n²)：完全反序時比較次數和氣泡排序一樣
def cocktail_sort(a):
    lo, hi = 0, len(a) - 1
    while lo < hi:
        swapped = False
        for j in range(lo, hi):             # 往右推最大
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        hi -= 1
        for j in range(hi, lo, -1):         # 往左推最小
            if a[j - 1] > a[j]:
                a[j - 1], a[j] = a[j], a[j - 1]
                swapped = True
        lo += 1
        if not swapped:
            break
    return a


if __name__ == "__main__":
    print(bubble_sort([5, 2, 9, 1, 7, 3, 8, 4]))     # [1, 2, 3, 4, 5, 7, 8, 9]
    print(cocktail_sort([5, 2, 9, 1, 7, 3, 8, 4]))   # [1, 2, 3, 4, 5, 7, 8, 9]`;

const cpp = `#include <vector>
#include <utility>
#include <iostream>

// 氣泡排序：相鄰比較，大的往右換；一輪沒交換就提前結束
void bubbleSort(std::vector<int>& a) {
    int n = (int)a.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {   // 尾端 i 個已固定
            if (a[j] > a[j + 1]) {
                std::swap(a[j], a[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;                    // 已經有序
    }
}

// 變形：雞尾酒排序（雙向氣泡）
void cocktailSort(std::vector<int>& a) {
    int lo = 0, hi = (int)a.size() - 1;
    while (lo < hi) {
        bool swapped = false;
        for (int j = lo; j < hi; j++)           // 往右推最大
            if (a[j] > a[j + 1]) { std::swap(a[j], a[j + 1]); swapped = true; }
        hi--;
        for (int j = hi; j > lo; j--)           // 往左推最小
            if (a[j - 1] > a[j]) { std::swap(a[j - 1], a[j]); swapped = true; }
        lo++;
        if (!swapped) break;
    }
}

int main() {
    std::vector<int> a = {5, 2, 9, 1, 7, 3, 8, 4};
    bubbleSort(a);
    for (int x : a) std::cout << x << ' ';      // 1 2 3 4 5 7 8 9
    std::cout << '\\n';

    // 1 是「烏龜」：氣泡排序要跑滿 7 輪，雞尾酒排序來回一趟就把它送回最前面
    std::vector<int> b = {2, 3, 4, 5, 7, 8, 9, 1};
    cocktailSort(b);
    for (int x : b) std::cout << x << ' ';      // 1 2 3 4 5 7 8 9
    std::cout << '\\n';
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "十幾筆資料，程式要寫在紙上",
              problem: "白板面試或嵌入式的小裝置，要把一小串數字排好，沒有函式庫可以呼叫，也不想寫遞迴。",
              why: "氣泡排序只有兩層迴圈和一個交換，五行寫完、不會寫錯，資料只有幾十筆時 O(n²) 完全無所謂。它是理解「排序」這件事最短的路。",
            },
            {
              title: "資料幾乎排好了，只想確認一下",
              problem: "每天更新一次的排行榜，昨天已經有序，今天只有一兩個人名次動了，想用最少的力氣修好。",
              why: "加上「一整輪都沒交換就停」的檢查，已排序的資料只掃一遍就結束，O(n)。只有一個人名次變差（位置太前面）時，一輪就把他推回去；但名次變好的人（位置太後面）每輪只能往前一格，差 d 名就得跑 d 輪。最後一名衝到第一名，照樣要跑滿 n−1 輪、O(n²)，這種資料改用插入排序更穩。",
            },
            {
              title: "理解「穩定排序」與「交換次數」",
              problem: "排序後同分的人順序不能亂；或者每次交換要寫入很慢的儲存體，想知道到底交換了幾次。",
              why: "氣泡排序只交換相鄰且嚴格大於的元素，同值永遠不會互換，天生穩定；交換次數正好等於資料裡的逆序對數量，這也是「只准交換相鄰元素」時最少需要的次數。它是講清楚這兩個概念的教學範本；真的在意寫入次數，就改用最多只交換 n−1 次的選擇排序。",
            },
          ]}
          cue="相鄰交換、每輪推出一個最大值、幾乎有序想早點停、逆序對數量、教學或小資料。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>氣泡排序</strong>的規則只有一條：從左到右看每一對相鄰元素，左邊比右邊大就交換。一輪掃完，目前的最大值一定被一路帶到最右邊，像氣泡浮到水面。這個位置從此固定，下一輪只掃前面 n−1 格，再下一輪掃 n−2 格，最多 n−1 輪就全部排好。
        </p>
        <p>
          為什麼正確？每一輪結束時，「還沒固定的區域」裡的最大值必定被推到該區域的尾端，因為一旦掃到它，它和右邊的元素比都不會輸，會一路往右換（遇到一樣大的，就由右邊那個接棒繼續往右）。所以第 i 輪結束後，尾端 i 個元素是整體最大的 i 個且已排好。歸納到 n−1 輪就完成。
        </p>
        <p>
          複雜度：第 i 輪（從 1 算起）做 n−i 次比較，加總 (n−1)+(n−2)+…+1 = n(n−1)/2，<strong>O(n²)</strong>。交換次數等於<strong>逆序對</strong>的數量（每次交換恰好消掉一對相鄰逆序），最壞（完全反序）也是 n(n−1)/2，最好（已有序）是 0。加上 <Code>swapped</Code> 旗標，已有序的輸入一輪就結束，最好情況變成 O(n)；平均與最壞仍是 O(n²)。要跑幾輪不看「亂掉的元素有幾個」，而看「最需要往左移的元素要移幾格」：每一輪，左邊還有更大值的元素都恰好往左移一格。額外空間 O(1)。
        </p>
        <p>
          和相鄰演算法的比較：選擇排序比較次數固定但交換最多 n−1 次；插入排序的成本是 O(n + 逆序對數)，只要逆序對少就接近 O(n)，不怕小值卡在尾端，而且每次只做「搬移」不做完整交換，常數更小，所以實務上小陣列都用插入排序而不是氣泡排序。氣泡排序的價值在教學：它把「交換相鄰元素」「穩定性」「逆序對」三個概念一次講清楚。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>外層迴圈 i 從 0 到 n−2，代表第 i+1 輪；每輪開始把 <Code>swapped</Code> 設為 <Code>False</Code>。</>,
            <>內層 j 從 0 掃到 n−2−i：比較 <Code>a[j]</Code> 與 <Code>a[j+1]</Code>，左邊大就交換並把 <Code>swapped</Code> 設為 <Code>True</Code>。</>,
            <>這一輪結束，<Code>a[n−1−i]</Code> 是本輪最大值，固定不動；之後的輪次不再看它。</>,
            <>若 <Code>swapped</Code> 仍是 <Code>False</Code>，代表這一輪沒有任何逆序對，陣列已經有序，提前結束。</>,
            <>要穩定就只在「嚴格大於」時交換；用 <Code>&gt;=</Code> 會讓同值元素互換位置，穩定性就沒了。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>共用陣列 [5, 2, 9, 1, 7, 3, 8, 4]。每一步是一次相鄰比較，交換時兩格變藍色。注意每輪結束尾端多固定一格（綠色），以及第五輪沒有任何交換就直接停下。</p>
        <BubbleSortDemo />
      </Section>

      <Section id="code">
        <p>基本版加上提前結束，以及雙向掃描的雞尾酒排序變形。雞尾酒排序解決「小值在最尾端要 n−1 輪才回到前面」的問題（所謂的烏龜），但它只改善這類資料，最壞仍是 O(n²)。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1051", name: "Height Checker（排序後比對有幾個位置不同）", diff: "Easy" },
            { src: "LeetCode 2717", name: "Semi-Ordered Permutation（最少相鄰交換次數，就是把 1 和 n 冒泡到兩端）", diff: "Easy" },
            { src: "LeetCode 283", name: "Move Zeroes（把 0 當最大值做穩定的相鄰交換，再想想雙指標怎麼做到 O(n)）", diff: "Easy" },
            { src: "LeetCode 75", name: "Sort Colors（三種值，想想能不能比 O(n²) 更好）", diff: "Medium" },
            { src: "LeetCode 3011", name: "Find if Array Can Be Sorted（只准交換 1 的位元數相同的相鄰元素，直接模擬氣泡排序）", diff: "Medium" },
            { src: "LeetCode 912", name: "Sort an Array（用 O(n²) 會超時，體會一下差距）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const bubbleLesson: Lesson = { prereq: "Array & Dynamic Array、Big-O Notation", Body };
