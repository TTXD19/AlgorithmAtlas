import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { MergeSortDemo } from "@/components/lesson/demos/MergeSortDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 把 src[lo:mid] 與 src[mid:hi] 兩段有序的合併到 dst[lo:hi]
def merge(src, dst, lo, mid, hi, key):
    i, j = lo, mid
    for k in range(lo, hi):
        # 左邊還有，而且右邊用完或「左 <= 右」就取左邊；相等時取左邊才穩定
        if i < mid and (j == hi or key(src[i]) <= key(src[j])):
            dst[k] = src[i]
            i += 1
        else:
            dst[k] = src[j]
            j += 1


# 由上而下：切半、遞迴排好兩半、合併。半開區間 [lo, hi)
def merge_sort(a, key=lambda x: x):
    buf = a[:]                              # 暫存陣列只配置一次，所有合併共用

    def sort(lo, hi):
        if hi - lo <= 1:                    # 0 或 1 個元素天生有序
            return
        mid = (lo + hi) // 2
        sort(lo, mid)
        sort(mid, hi)
        if key(a[mid - 1]) <= key(a[mid]):  # 兩段本來就接得起來，跳過合併
            return
        merge(a, buf, lo, mid, hi, key)
        for k in range(lo, hi):             # 合併結果寫回原陣列
            a[k] = buf[k]

    sort(0, len(a))
    return a


# 由下而上：不用遞迴，段長 1、2、4、8… 一輪一輪兩兩合併
def merge_sort_bottom_up(a, key=lambda x: x):
    n = len(a)
    src, dst = a, [None] * n                # 只多配置一塊暫存陣列
    width = 1
    while width < n:
        for lo in range(0, n, 2 * width):
            merge(src, dst, lo, min(lo + width, n), min(lo + 2 * width, n), key)
        src, dst = dst, src                 # 這一輪的輸出是下一輪的輸入
        width *= 2
    if src is not a:                        # 結果最後落在暫存陣列就搬回來
        a[:] = src
    return a


if __name__ == "__main__":
    print(merge_sort([5, 2, 9, 1, 7, 3, 8, 4]))            # [1, 2, 3, 4, 5, 7, 8, 9]
    print(merge_sort_bottom_up([5, 2, 9, 1, 7, 3, 8, 4]))  # [1, 2, 3, 4, 5, 7, 8, 9]
    # 穩定性：訂單已依時間排好，依狀態排序後，同狀態的訂單仍照時間排
    orders = [("A01", "shipped"), ("A02", "pending"), ("A03", "shipped"), ("A04", "pending")]
    print(merge_sort(orders, key=lambda o: o[1]))
    # [('A02', 'pending'), ('A04', 'pending'), ('A01', 'shipped'), ('A03', 'shipped')]`;

const cpp = `#include <vector>
#include <string>
#include <utility>
#include <iostream>
#include <algorithm>

// 把 src[lo, mid) 與 src[mid, hi) 兩段有序的合併到 dst[lo, hi)
void mergeInto(const std::vector<int>& src, std::vector<int>& dst, int lo, int mid, int hi) {
    int i = lo, j = mid;
    for (int k = lo; k < hi; k++) {
        if (i < mid && (j == hi || src[i] <= src[j])) dst[k] = src[i++];  // <= 相等取左邊，保持穩定
        else dst[k] = src[j++];
    }
}

// 由上而下：排好半開區間 [lo, hi)
void sortRange(std::vector<int>& a, std::vector<int>& buf, int lo, int hi) {
    if (hi - lo <= 1) return;                       // 0 或 1 個元素天生有序
    int mid = lo + (hi - lo) / 2;
    sortRange(a, buf, lo, mid);
    sortRange(a, buf, mid, hi);
    if (a[mid - 1] <= a[mid]) return;               // 兩段本來就接得起來，跳過合併
    mergeInto(a, buf, lo, mid, hi);
    std::copy(buf.begin() + lo, buf.begin() + hi, a.begin() + lo);
}

void mergeSort(std::vector<int>& a) {
    std::vector<int> buf(a.size());                 // 暫存陣列只配置一次
    sortRange(a, buf, 0, (int)a.size());
}

// 由下而上：段長 1、2、4… 兩兩合併，src 與 dst 每輪交換角色
void mergeSortBottomUp(std::vector<int>& a) {
    int n = (int)a.size();
    std::vector<int> buf(n);
    std::vector<int>* src = &a;
    std::vector<int>* dst = &buf;
    for (int width = 1; width < n; width *= 2) {
        for (int lo = 0; lo < n; lo += 2 * width)
            mergeInto(*src, *dst, lo, std::min(lo + width, n), std::min(lo + 2 * width, n));
        std::swap(src, dst);
    }
    if (src != &a) a = *src;                        // 結果最後落在 buf 就搬回來
}

int main() {
    std::vector<int> a = {5, 2, 9, 1, 7, 3, 8, 4};
    std::vector<int> b = a;
    mergeSort(a);
    mergeSortBottomUp(b);
    for (int x : a) std::cout << x << ' ';          // 1 2 3 4 5 7 8 9
    std::cout << '\\n';
    for (int x : b) std::cout << x << ' ';          // 1 2 3 4 5 7 8 9
    std::cout << '\\n';

    // 標準庫的 std::stable_sort 保證穩定：同狀態的訂單維持原本的時間順序
    std::vector<std::pair<std::string, std::string>> orders = {
        {"A01", "shipped"}, {"A02", "pending"}, {"A03", "shipped"}, {"A04", "pending"}};
    std::stable_sort(orders.begin(), orders.end(),
                     [](const auto& x, const auto& y) { return x.second < y.second; });
    for (const auto& [id, status] : orders) std::cout << id << ' ';  // A02 A04 A01 A03
    std::cout << '\\n';
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "120 GB 的檔案，機器只有 16 GB 記憶體",
              problem: "一份 120 GB 的點擊紀錄要依使用者 ID 排序，整份讀進記憶體根本放不下，任何需要隨機存取整個陣列的排序都用不了。",
              why: "每次讀 10 GB 進來排好、寫成一個有序的暫存檔，得到 12 個；再同時打開這 12 個檔，每個只看最前面那一筆，挑最小的輸出。合併只需要循序讀寫，正好是磁碟最擅長的。Unix 的 sort 指令和資料庫的 ORDER BY 在記憶體不夠時都這樣做，PostgreSQL 查詢計畫裡的 external merge 就是它。",
            },
            {
              title: "後台表格：點一下欄位，同組內的順序不能亂",
              problem: "訂單列表有 3 萬筆，已經依下單時間排好。客服點「物流狀態」欄位排序，希望同一個狀態裡的訂單仍然照時間排。",
              why: "合併時兩值相等一律先取左段，左段的元素原本就排在前面，所以相等元素的相對順序永遠不變，這叫穩定。有了穩定排序，多欄位排序只要「先排次要欄位、再排主要欄位」。Python 的 sort、Java 對物件的 Arrays.sort 都用以合併為核心的 TimSort，就是為了保證這一點。",
            },
            {
              title: "公開 API 接受使用者上傳的資料來排序",
              problem: "服務接受最多 100 萬筆數字並回傳排序結果。有人刻意構造資料，讓快速排序的 pivot 每次都選到極端值。",
              why: "快速排序最壞退化成 O(n²)，100 萬筆約 5×10¹¹ 次比較，服務直接卡死。合併排序永遠從正中間切，切法和資料內容無關，最壞也只要約 2×10⁷ 次比較，惡意輸入找不到弱點。",
            },
          ]}
          cue="記憶體放不下、外部排序、需要穩定排序、最壞也要 n log n、鏈結串列排序、合併兩段有序、逆序對或「右邊有幾個比我小」。"
        />
      </Section>

      <Section id="concept">
        <p>
          兩段<strong>已經排好</strong>的資料要合成一段，只要兩個指標各指段首，每次比較、把較小的放到輸出、那一邊前進，n 個元素放 n 次就好，O(n)。<strong>合併排序</strong>把排序問題轉成合併問題：把陣列從中間切成兩半，遞迴把兩半各自排好，再合併。一路切到只剩 0 或 1 個元素時，它天生有序，這就是 base case。
        </p>
        <p>
          正確性用歸納法：假設遞迴回傳時兩半都已有序，只要合併正確，整段就有序。合併的<strong>不變量</strong>是「輸出區已放好的 k 個元素，是兩段裡最小的 k 個，而且有序」。兩段各自有序，所以剩下的元素裡最小的一定是兩個指標所指的其中一個，取較小的放上去，不變量維持；放滿時整段完成。<strong>穩定性</strong>來自比較寫成 <Code>a[i] &lt;= a[j]</Code>：相等時取左段，而左段的元素在原陣列本來就在右段之前。寫成 <Code>&lt;</Code> 會先取右邊，結果仍然有序，但穩定性就沒了。
        </p>
        <p>
          複雜度：<Code>T(n) = 2T(n/2) + O(n)</Code>。畫成遞迴樹，第 d 層有 2^d 段、每段長 n/2^d，這一層所有合併加起來剛好處理 n 個元素；切到長度 1 要 ⌈log₂ n⌉ 層，所以總共 <strong>O(n log n)</strong>。切法不看資料內容，<strong>最好、平均、最壞都是 O(n log n)</strong>，每次合併的比較次數介於較短那段的長度和 len − 1 之間，只影響常數。若加上「<Code>a[mid-1] &lt;= a[mid]</Code> 就跳過合併」的檢查，已排序的輸入降到 O(n)。空間：合併要暫存陣列，整個排序共用一塊 <strong>O(n)</strong> 的 buf 即可，遞迴堆疊再加 O(log n)。由下而上的迭代版省掉遞迴，但暫存陣列一樣是 O(n)。
        </p>
        <p>
          常見錯誤：每次遞迴都切片出新陣列（<Code>a[:mid]</Code>、<Code>a[mid:]</Code>），複雜度沒變，但配置記憶體的次數多、常數大，應該先配置一塊 buf 共用；區間開閉混用，<Code>[lo, mid)</Code> 和 <Code>[mid, hi)</Code> 配 <Code>hi - lo &lt;= 1</Code> 是一套，改成閉區間就要整套跟著改，否則會漏格或無限遞迴。和鄰近演算法比：快速排序原地、快取友善、平均通常更快，但最壞 O(n²) 且不穩定；堆積排序只要 O(1) 空間，也不穩定。合併排序用 O(n) 空間換到「穩定＋最壞 O(n log n)」。短段落用插入排序反而更快，所以 TimSort 會先用插入排序把短段整理好再合併。合併這一步本身在串列上只改指標（見合併串列），在合併時順便計數就是逆序對。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>定義 <Code>sort(lo, hi)</Code>：排好半開區間 <Code>[lo, hi)</Code>。<Code>hi - lo &lt;= 1</Code> 時直接回傳，這是 base case。</>,
            <><Code>mid = (lo + hi) // 2</Code>，遞迴 <Code>sort(lo, mid)</Code> 與 <Code>sort(mid, hi)</Code>，回來時兩段都已有序。</>,
            <>合併：<Code>i = lo</Code>、<Code>j = mid</Code>，比較 <Code>a[i]</Code> 和 <Code>a[j]</Code>，較小的寫進暫存陣列、那一邊的指標前進。相等時取左邊（<Code>&lt;=</Code>），保持穩定。</>,
            <>其中一段用完後，另一段剩下的本來就有序，整段照抄；最後把暫存陣列的 <Code>[lo, hi)</Code> 寫回原陣列。</>,
            <>暫存陣列在最外層配置一次、所有合併共用，不要每層都建新陣列。</>,
            <>實務上的改進：<Code>a[mid-1] &lt;= a[mid]</Code> 時兩段已接得起來，跳過合併；段長很短（例如十幾個以下）時改用插入排序。不想用遞迴就改成由下而上，段長 1、2、4… 逐輪合併。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>共用陣列 [5, 2, 9, 1, 7, 3, 8, 4]。四列是遞迴的第 0 到第 3 層：切半時整段往下搬一層，合併時從下一層逐個取回上一層，虛線格代表這個位置的值目前在別層。黃色是合併時左右兩段的指標，藍色是剛放進輸出的位置，綠色是已排好的區段。數一數比較次數：第 2 層四次合併各 1 次、第 1 層兩次各 3 次、第 0 層 7 次，共 17 次，每一層都不超過 n = 8。</p>
        <MergeSortDemo />
      </Section>

      <Section id="code">
        <p>由上而下的遞迴版和由下而上的迭代版共用同一個合併函式。遞迴版直接對應演算法步驟；迭代版不用遞迴，段長 1、2、4… 一輪一輪合併，也正是外部排序一輪輪合併暫存檔的形狀。兩版都只配置一次暫存陣列、用 <Code>&lt;=</Code> 保持穩定；最後用訂單資料示範穩定性，C++ 對照標準庫的 <Code>std::stable_sort</Code>。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 2570", name: "Merge Two 2D Arrays by Summing Values（單獨練合併這一步）", diff: "Easy" },
            { src: "LeetCode 912", name: "Sort an Array（由上而下與由下而上各寫一次）", diff: "Medium" },
            { src: "LeetCode 148", name: "Sort List（串列版，由下而上可做到 O(1) 額外空間）", diff: "Medium" },
            { src: "LeetCode 937", name: "Reorder Data in Log Files（依賴穩定排序）", diff: "Medium" },
            { src: "LeetCode 315", name: "Count of Smaller Numbers After Self（合併時順便計數）", diff: "Hard" },
            { src: "LeetCode 493", name: "Reverse Pairs（合併前先用雙指標計數）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const mergeSortLesson: Lesson = { prereq: "Recursion、Insertion Sort", Body };
