import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { CountingSortDemo } from "@/components/lesson/demos/CountingSortDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 計數排序：整數鍵、值域 [lo, hi]，完全不做比較。O(n + k)，k = hi - lo + 1
def counting_sort(a):
    if not a:
        return []
    lo, hi = min(a), max(a)
    count = [0] * (hi - lo + 1)
    for x in a:
        count[x - lo] += 1                   # 位移 lo，負數也能當索引
    out = []
    for v, c in enumerate(count):
        out.extend([v + lo] * c)             # 值 v + lo 出現 c 次就輸出 c 次
    return out


# 穩定版：排的是物件，key(x) 落在 0..k-1
def counting_sort_by_key(items, key, k):
    count = [0] * k
    for it in items:
        count[key(it)] += 1
    for v in range(1, k):
        count[v] += count[v - 1]             # 現在 count[v] = 鍵 <= v 的元素個數
    out = [None] * len(items)
    for it in reversed(items):               # 由後往前放，同鍵的先後才不會顛倒
        count[key(it)] -= 1
        out[count[key(it)]] = it
    return out


if __name__ == "__main__":
    print(counting_sort([5, 2, 9, 1, 7, 3, 8, 4, 2, 5]))   # [1, 2, 2, 3, 4, 5, 5, 7, 8, 9]
    print(counting_sort([3, -1, 0, -1, 2]))                # [-1, -1, 0, 2, 3]
    # 報名序號已排好，依分數排序後，同分的人仍照報名順序
    students = [("Amy", 88), ("Ben", 72), ("Cara", 88), ("Dan", 95), ("Eve", 72)]
    print(counting_sort_by_key(students, key=lambda s: s[1], k=101))
    # [('Ben', 72), ('Eve', 72), ('Amy', 88), ('Cara', 88), ('Dan', 95)]`;

const cpp = `#include <algorithm>
#include <iostream>
#include <string>
#include <utility>
#include <vector>

// 計數排序：整數鍵、值域 [lo, hi]。O(n + k)
std::vector<int> countingSort(const std::vector<int>& a) {
    if (a.empty()) return {};
    auto [mn, mx] = std::minmax_element(a.begin(), a.end());
    int lo = *mn;
    std::vector<int> count(*mx - lo + 1, 0);    // 值域太大時這一行會吃光記憶體
    for (int x : a) count[x - lo]++;            // 位移 lo，負數也能當索引
    std::vector<int> out;
    out.reserve(a.size());
    for (int v = 0; v < (int)count.size(); v++)
        out.insert(out.end(), count[v], v + lo);  // 值 v + lo 放 count[v] 個
    return out;
}

// 穩定版：依 key（0..k-1）排序物件
template <typename T, typename Key>
std::vector<T> countingSortByKey(const std::vector<T>& items, Key key, int k) {
    std::vector<int> count(k, 0);
    for (const T& it : items) count[key(it)]++;
    for (int v = 1; v < k; v++) count[v] += count[v - 1];     // 鍵 <= v 的個數
    std::vector<T> out(items.size());
    for (auto it = items.rbegin(); it != items.rend(); ++it)  // 由後往前放才穩定
        out[--count[key(*it)]] = *it;
    return out;
}

int main() {
    for (int x : countingSort({5, 2, 9, 1, 7, 3, 8, 4, 2, 5})) std::cout << x << ' ';
    std::cout << '\\n';                          // 1 2 2 3 4 5 5 7 8 9
    for (int x : countingSort({3, -1, 0, -1, 2})) std::cout << x << ' ';
    std::cout << '\\n';                          // -1 -1 0 2 3

    std::vector<std::pair<std::string, int>> students = {
        {"Amy", 88}, {"Ben", 72}, {"Cara", 88}, {"Dan", 95}, {"Eve", 72}};
    auto byScore = countingSortByKey(students, [](const auto& s) { return s.second; }, 101);
    for (const auto& [name, score] : byScore) std::cout << name << ' ';
    std::cout << '\\n';                          // Ben Eve Amy Cara Dan
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "大考放榜：13 萬人依分數排名",
              problem: "一科考試有 13 萬名考生，分數是 0 到 100 的整數。放榜系統要依分數由高到低排出名次，同分的人維持報名序號的順序。",
              why: "分數只有 101 種可能。開 101 個格子數每個分數有幾個人，再用前綴和算出每個分數在名單裡從哪一格開始，把每位考生直接放進去。總共大約 13 萬 + 101 次操作，而任何比較排序最壞都要十幾萬乘上 17 次左右的比較。由後往前放，同分者自然保持報名順序。",
            },
            {
              title: "戶政資料依年齡分組",
              problem: "全國 2,300 萬筆戶籍資料要依年齡排序，順便產生每一歲有多少人的統計表。年齡是 0 到 120 的整數。",
              why: "計數排序的第一步「數每個值出現幾次」本身就是那張統計表，排序只是把它展開。2,300 萬筆掃兩遍加上 121 格的前綴和，比 n log n ≈ 5 億次比較少一個數量級，而且一整批資料只需要循序讀寫。",
            },
            {
              title: "照片的亮度中位數與基數排序的每一趟",
              problem: "一張 1,200 萬畫素的灰階照片，每個像素是 0 到 255 的亮度，要找出亮度的中位數來決定曝光補償；另一個場景是把 32 位元整數拆成 4 個位元組做基數排序。",
              why: "值域只有 256 種：數完 256 個格子後，從暗往亮累加，累計超過一半的那一格就是中位數，不必真的排序 1,200 萬個數。基數排序每一趟要的正是「值域 256、而且穩定」的排序，也就是這一課的穩定版計數排序。",
            },
          ]}
          cue="整數鍵、值域小（k 不比 n 大太多）、分數、年齡、位元組、直方圖、同值要保持原本順序、基數排序的每一趟、要比 O(n log n) 更快。"
        />
      </Section>

      <Section id="concept">
        <p>
          當要排的是<strong>值域很小的整數</strong>，不必比較任何兩個元素。開一個長度 k 的 <Code>count</Code> 陣列，掃一遍把 <Code>count[x]</Code> 加一，就知道每個值出現幾次；再從小到大把值 v 輸出 <Code>count[v]</Code> 次，結果就是有序的。值域不從 0 開始或有負數時，先求出最小值 <Code>lo</Code>，用 <Code>x − lo</Code> 當索引。這種做法能突破比較排序 Ω(n log n) 的下界，是因為那個下界只限制「靠比較取得資訊」的演算法；計數排序直接拿值當陣列索引，一次存取就知道它該去哪一區，不在那個模型裡（Sorting Lower Bound 那一篇會證明這條下界）。
        </p>
        <p>
          只輸出數字時上面就夠了，但實務上排的常是<strong>物件</strong>：依分數排學生、依狀態排訂單，同一個鍵底下還帶著別的資料。穩定版多一步<strong>前綴累加</strong>：<Code>count[v] += count[v−1]</Code> 之後，<Code>count[v]</Code> 是「鍵 ≤ v 的元素個數」，所以鍵為 v 的元素佔輸出的 <Code>count[v−1]</Code> 到 <Code>count[v] − 1</Code> 這一段。接著<strong>由後往前</strong>掃輸入，每拿到一個鍵 v 的元素，先 <Code>count[v] −= 1</Code> 再放到 <Code>out[count[v]]</Code>。同鍵的元素裡，原本排在最後的先被放到這一段的最後一格，前一個放到倒數第二格，依此類推，相對順序和輸入完全一樣，這就是<strong>穩定</strong>。改成由前往後放、又沿用同樣的遞減寫法，同鍵元素就會整段顛倒。
        </p>
        <p>
          複雜度：計數掃 n 個元素、前綴累加掃 k 格、放回再掃 n 個元素，時間 <strong>O(n + k)</strong>，而且和資料的排列無關，最好、平均、最壞都一樣。空間是 count 的 O(k) 加上輸出陣列的 O(n)，穩定版共 <strong>O(n + k)</strong>；只排純整數時可以直接覆寫原陣列，只要 O(k)。關鍵在 k：值域是 0～100 時 k 可以忽略，值域是 0～10⁹ 時光 count 就要 4 GB，O(n + k) 被 k 主宰，這時就該換成把數字拆成幾位分別排的<strong>基數排序</strong>。經驗法則是 k = O(n) 才划算。
        </p>
        <p>
          常見的坑有三個。忘了位移，遇到負數就越界；放回時由前往後掃卻用了「先減一再放」，結果仍然有序但不穩定，基數排序會因此出錯；值域是估的，測資裡出現一個超大值就讓記憶體爆掉，所以要先求 min 和 max。和鄰近的做法比：Hash Set / Map Patterns 那篇用雜湊表數次數，適合鍵的種類多但分散的情況；計數排序用陣列，前提是鍵本身就是小整數。它<strong>不是原地</strong>排序、只能用在離散的整數鍵，小數或字串要先轉成整數鍵，或改用下一篇的基數與桶排序。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認鍵是整數，求出最小值 <Code>lo</Code> 與最大值 <Code>hi</Code>，值域 <Code>k = hi − lo + 1</Code> 大約不超過 n 的幾倍才划算。</>,
            <>開長度 k 的 <Code>count</Code> 陣列，掃一遍輸入，<Code>count[x − lo] += 1</Code>。</>,
            <>只排數字：v 從 0 到 k − 1，把 <Code>v + lo</Code> 輸出 <Code>count[v]</Code> 次，結束。</>,
            <>排物件要穩定：前綴累加 <Code>count[v] += count[v − 1]</Code>，現在 <Code>count[v]</Code> 是鍵 ≤ v 的元素個數。</>,
            <><strong>由後往前</strong>掃輸入：<Code>count[key] −= 1</Code>，把元素放到 <Code>out[count[key]]</Code>。掃完 <Code>out</Code> 就是穩定排好的結果。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>共用陣列 [5, 2, 9, 1, 7, 3, 8, 4] 再補上 2 和 5 各一個，用 ᵃ、ᵇ 標出同值元素原本的先後。三個階段依序進行：計數、前綴累加、由後往前放回。藍色是正在處理的輸入元素，輸出列裡的藍色是它剛被放進去的位置；黃色是它對應的 count 格，綠色是已經放好的輸出。整個過程沒有任何兩個元素互相比較過，最後檢查 2ᵃ 是否仍在 2ᵇ 前面、5ᵃ 是否仍在 5ᵇ 前面。</p>
        <CountingSortDemo />
      </Section>

      <Section id="code">
        <p>兩個版本：只排整數的精簡版（用最小值位移，負數也能用），以及排物件的穩定版，範例用「依分數排學生、同分維持原順序」示範穩定性。C++ 的穩定版寫成模板，鍵函式與值域 k 由呼叫端提供，基數排序的每一趟就能直接套用。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1051", name: "Height Checker（身高只有 1～100，計數後直接比對）", diff: "Easy" },
            { src: "LeetCode 1122", name: "Relative Sort Array（值域 0～1000 的計數）", diff: "Easy" },
            { src: "LeetCode 791", name: "Custom Sort String（26 個字母各數一次，照指定順序輸出）", diff: "Medium" },
            { src: "LeetCode 274", name: "H-Index（引用數超過 n 的都算 n，值域壓到 0～n）", diff: "Medium" },
            { src: "LeetCode 2785", name: "Sort Vowels in a String（只對母音做計數排序）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const countingSortLesson: Lesson = { prereq: "Array & Dynamic Array、Prefix Sum", Body };
