import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { InversionsDemo } from "@/components/lesson/demos/InversionsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 合併排序順便數逆序對：右邊的元素先出來時，左邊還沒出來的都比它大
def count_inversions(a):
    a = a[:]                                 # 在副本上排序，不改動輸入
    buf = [0] * len(a)

    def sort(lo, hi):                        # 排好 a[lo:hi]，回傳其中的逆序對數
        if hi - lo <= 1:
            return 0
        mid = (lo + hi) // 2
        cnt = sort(lo, mid) + sort(mid, hi)  # 左半內部 + 右半內部
        i, j = lo, mid
        for k in range(lo, hi):
            if j == hi or (i < mid and a[i] <= a[j]):
                buf[k] = a[i]                # 相等不算逆序，先取左邊
                i += 1
            else:
                buf[k] = a[j]
                j += 1
                cnt += mid - i               # 跨兩半：左邊還剩 mid - i 個都比 a[j] 大
        a[lo:hi] = buf[lo:hi]
        return cnt

    return sort(0, len(a))


def count_inversions_brute(a):               # 對照用的 O(n²)
    return sum(1 for i in range(len(a)) for j in range(i + 1, len(a)) if a[i] > a[j])


# 兩份排名的 Kendall tau 距離：有幾對項目，兩份排名的先後相反
def kendall_tau_distance(rank_a, rank_b):
    pos = {item: i for i, item in enumerate(rank_b)}
    return count_inversions([pos[item] for item in rank_a])   # 依 A 的順序寫下 B 的名次


if __name__ == "__main__":
    judge_b = [3, 1, 4, 7, 2, 8, 5, 6]                       # 和互動示範同一組
    print(count_inversions(judge_b), count_inversions_brute(judge_b))   # 8 8
    print(kendall_tau_distance(["A", "B", "C", "D"], ["B", "A", "D", "C"]))   # 2
    print(count_inversions(list(range(5000, 0, -1))))       # 12497500 = 5000 × 4999 / 2`;

const cpp = `#include <algorithm>
#include <iostream>
#include <vector>

// 合併排序順便數逆序對。n = 10⁵ 時答案可達 5×10⁹，一定要用 long long
long long sortCount(std::vector<int>& a, std::vector<int>& buf, int lo, int hi) {
    if (hi - lo <= 1) return 0;
    int mid = lo + (hi - lo) / 2;
    long long cnt = sortCount(a, buf, lo, mid) + sortCount(a, buf, mid, hi);
    int i = lo, j = mid;
    for (int k = lo; k < hi; k++) {
        if (j == hi || (i < mid && a[i] <= a[j])) buf[k] = a[i++];   // 相等先取左邊
        else { buf[k] = a[j++]; cnt += mid - i; }   // 左邊還剩 mid - i 個都比它大
    }
    std::copy(buf.begin() + lo, buf.begin() + hi, a.begin() + lo);
    return cnt;
}

long long countInversions(std::vector<int> a) {   // 傳值：在副本上排序
    std::vector<int> buf(a.size());
    return sortCount(a, buf, 0, (int)a.size());
}

// 另一種 O(n log n)：由左往右掃，用 Fenwick Tree 數「前面有幾個比我大」
long long countInversionsBIT(const std::vector<int>& a) {
    std::vector<int> vals(a);                     // 座標壓縮：值換成 1..m 的名次
    std::sort(vals.begin(), vals.end());
    vals.erase(std::unique(vals.begin(), vals.end()), vals.end());
    int m = (int)vals.size();
    std::vector<int> tree(m + 1, 0);
    long long cnt = 0;
    for (int i = 0; i < (int)a.size(); i++) {
        int r = int(std::lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin()) + 1;
        int notGreater = 0;                       // 前面 <= a[i] 的個數
        for (int x = r; x > 0; x -= x & -x) notGreater += tree[x];
        cnt += i - notGreater;                    // 前面其餘的都比 a[i] 大
        for (int x = r; x <= m; x += x & -x) tree[x]++;
    }
    return cnt;
}

int main() {
    std::vector<int> judgeB = {3, 1, 4, 7, 2, 8, 5, 6};
    std::cout << countInversions(judgeB) << ' ' << countInversionsBIT(judgeB) << '\\n';   // 8 8
    std::vector<int> desc(100000);
    for (int i = 0; i < 100000; i++) desc[i] = 100000 - i;
    std::cout << countInversions(desc) << '\\n';   // 4999950000（完全反序是 n(n−1)/2，超過 int）
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "推薦模型的排名準不準",
              problem: "電商的推薦模型替 10 萬個商品排出預測名次，上線一週後有了實際銷售名次。想用一個數字衡量兩份排名有多接近：有幾對商品，模型排的先後和實際相反。兩兩比對要看約 50 億對。",
              why: "把商品依實際名次排好，寫下每個商品的預測名次，意見相反的商品對就是這個序列的逆序對，這就是 Kendall tau 距離。在合併排序的合併步驟順便數，O(n log n)，10 萬個商品只要一百多萬次比較。",
            },
            {
              title: "資料有多亂，決定該用哪種排序",
              problem: "物流中心的掃描紀錄大致依時間到達，偶爾有幾筆延遲。工程師想知道資料「差多少才算排好」，好決定用插入排序還是合併排序。",
              why: "逆序對數正好是把序列排好所需的最少相鄰交換次數，也是插入排序要挪動的次數。先花 O(n log n) 數出來：數字接近 n，插入排序 O(n + 逆序對) 幾乎是線性；數字接近 n²/2，就換合併排序。",
            },
            {
              title: "滑塊拼圖打亂後還有沒有解",
              problem: "手機上的 15 數字推盤遊戲，如果隨便把數字排進格子，有一半的盤面不管怎麼推都拼不回去。遊戲產生題目時必須保證有解。",
              why: "每推一次，數字序列的逆序對奇偶和空格位置會一起以固定的方式改變，所以「逆序對數的奇偶，加上空格所在的列」決定了這盤有沒有解。產生題目時數一次逆序對，不合規則就交換兩個非空格數字，奇偶性就翻過來。",
            },
          ]}
          cue="逆序對、i < j 但 a[i] > a[j]、兩份排名有多不一致、Kendall tau、最少相鄰交換次數、右邊有幾個比我小、排列的奇偶、在合併排序時順便數。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>逆序對</strong>是一對位置 <Code>i &lt; j</Code> 而 <Code>a[i] &gt; a[j]</Code>，也就是「前面的比後面的大」。n 個元素最多有 <Code>n(n−1)/2</Code> 對（完全反序），最少 0 對（已排序），數字大小就代表序列離有序有多遠：它等於泡沫排序的交換次數、插入排序的挪動次數，也是把序列排好所需的最少相鄰交換次數。兩層迴圈兩兩比對是 <strong>O(n²)</strong>，n = 10⁵ 時要 50 億次。
        </p>
        <p>
          分治的觀察：把陣列切成左右兩半，每一對逆序對只有三種：兩個都在左半、兩個都在右半、一個在左一個在右（<strong>跨半</strong>）。前兩種遞迴去數。跨半的那種只看「左半的某個值大於右半的某個值」，和兩半內部怎麼排列無關，所以可以<strong>先把兩半各自排好再數</strong>，這正是合併排序的合併步驟。合併時左指標 i、右指標 j：若 <Code>a[i] ≤ a[j]</Code> 取左邊；否則取右邊的 <Code>a[j]</Code>，此時左半還沒取走的 <Code>a[i..mid−1]</Code> 全都 ≥ a[i] &gt; a[j]，而且原本都排在 a[j] 前面，一次加上 <Code>mid − i</Code> 對。每一個跨半逆序對 (左 x, 右 y) 恰好在 y 被取出的那一刻算一次：比 y 大的左半元素那時都還沒被取走，不比 y 大的都已經取走了。
        </p>
        <p>
          複雜度就是合併排序的 <Code>T(n) = 2T(n/2) + O(n)</Code>，<strong>O(n log n)</strong> 時間、<strong>O(n)</strong> 暫存空間，另加 O(log n) 的遞迴深度。答案本身可能到 <Code>n(n−1)/2</Code>：n 超過 65,536 就會超出 32 位元整數，C++ 一定要用 long long。另一種同樣 O(n log n) 的寫法是用 <strong>Fenwick Tree</strong>：值先壓縮成名次，由左往右掃，每個元素查「前面已經出現、而且比我大」的個數再把自己加進去；它不必重排陣列，適合一邊讀資料一邊數。
        </p>
        <p>
          常見的坑：相等的值不算逆序，合併時必須寫 <Code>a[i] ≤ a[j]</Code> 先取左邊，寫成 <Code>&lt;</Code> 會把相等的也算進去；計數的位置要和取出的方向一致，「取右邊時加 <Code>mid − i</Code>」和「取左邊時加 <Code>j − mid</Code>」是兩種等價寫法，混用就會重複或漏算；直接在輸入陣列上排序會把呼叫端的資料打亂。變形題要注意條件是否和合併的順序一致：Reverse Pairs 的條件是 <Code>a[i] &gt; 2·a[j]</Code>，和「誰先出來」的順序不同，要在合併之前另外用雙指標數；Count of Smaller Numbers After Self 要的是每個元素各自的數量，就得排序索引而不是值。這一課和 Merge Sort 是同一段程式碼，差別只是多了一行計數；Insertion Sort 那篇示範的挪動次數 13，數的也是逆序對。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>定義 <Code>sort(lo, hi)</Code>：把 <Code>[lo, hi)</Code> 排好，並回傳這個區間內的逆序對數。長度 ≤ 1 時回傳 0。</>,
            <>切半遞迴：<Code>cnt = sort(lo, mid) + sort(mid, hi)</Code>，這是兩半內部的逆序對。</>,
            <>合併：比較 <Code>a[i]</Code> 和 <Code>a[j]</Code>。<Code>a[i] ≤ a[j]</Code> 就取左邊；否則取右邊，並 <Code>cnt += mid − i</Code>。</>,
            <>把合併結果寫回 <Code>[lo, hi)</Code>，回傳 <Code>cnt</Code>。最外層的回傳值就是答案，記得用 64 位元整數。</>,
            <>要每個元素各自的數量，或條件不是單純的大於（例如 <Code>a[i] &gt; 2·a[j]</Code>），就改成排序索引、或在合併前另外用雙指標數。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>評審 B 給八部作品的名次 [3, 1, 4, 7, 2, 8, 5, 6]，已經依評審 A 的名次排好，所以逆序對就是兩位評審意見相反的作品對數。上方是整個陣列，黃色是正在合併的區段；下方列出左半、右半與合併結果，藍色是下一次要比較的兩個元素，灰色是已經取走的。每當右邊的元素先出來（合併結果裡的綠色），左邊還沒取走的元素會全部變成黃色，一次算進逆序對。最後共 8 對，和暴力兩兩比對一樣，佔全部 28 對的 29%。</p>
        <InversionsDemo />
      </Section>

      <Section id="code">
        <p>Python 放合併排序版、對照用的暴力版，以及把兩份排名轉成逆序對來算 Kendall tau 距離的應用。C++ 放合併排序版與 Fenwick Tree 版，並用完全反序的 10 萬個數示範答案為什麼一定要 long long。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 775", name: "Global and Local Inversions（全部逆序對都必須是相鄰的）", diff: "Medium" },
            { src: "LeetCode 1850", name: "Minimum Adjacent Swaps to Reach the Kth Smallest Number（相鄰交換次數就是逆序對數）", diff: "Medium" },
            { src: "LeetCode 315", name: "Count of Smaller Numbers After Self（每個元素各自數，排序索引）", diff: "Hard" },
            { src: "LeetCode 493", name: "Reverse Pairs（條件是 a[i] > 2·a[j]，合併前先用雙指標數）", diff: "Hard" },
            { src: "LeetCode 327", name: "Count of Range Sum（對前綴和做同樣的合併計數）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const inversionsLesson: Lesson = { prereq: "Merge Sort、Master Theorem", Body };
