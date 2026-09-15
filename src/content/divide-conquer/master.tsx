import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { MasterTheoremDemo } from "@/components/lesson/demos/MasterTheoremDemo";
import type { Lesson } from "@/lib/lessons";

const python = `import math


def npow(d):
    """n^d 的顯示：n^0 寫 1、n^1 寫 n"""
    return "1" if d == 0 else "n" if d == 1 else f"n^{d}"


def master(a, b, d):
    """T(n) = a·T(n/b) + Θ(n^d) 的解。回傳 (情況, 複雜度字串)。
    比較 log_b(a) 與 d：
      大於 → 葉子主導，Θ(n^log_b a)
      等於 → 每層一樣多，Θ(n^d · log n)
      小於 → 根主導，Θ(n^d)
    """
    e = math.log(a, b)                      # 葉子數的指數 log_b a
    if abs(e - d) < 1e-9:
        return 2, "Θ(log n)" if d == 0 else f"Θ({npow(d)} log n)"
    if e > d:
        return 1, f"Θ(n^{e:.2f})"
    return 3, f"Θ({npow(d)})"


# 用遞迴樹逐層加總，驗證定理給的答案
def recursion_tree(a, b, d, n):
    total, size, nodes = 0, n, 1
    while size >= 1:
        total += nodes * size ** d          # 這一層：nodes 個子問題，每個花 size^d
        nodes *= a
        size /= b
    return total


if __name__ == "__main__":
    for name, (a, b, d) in {
        "合併排序": (2, 2, 1),
        "二分搜尋": (1, 2, 0),
        "Karatsuba": (3, 2, 1),
        "Strassen": (7, 2, 2),
    }.items():
        case, ans = master(a, b, d)
        print(f"{name}: T(n) = {'' if a == 1 else a}T(n/{b}) + {npow(d)} → 情況 {case}，{ans}")
    # 合併排序: T(n) = 2T(n/2) + n → 情況 2，Θ(n log n)
    # 二分搜尋: T(n) = T(n/2) + 1 → 情況 2，Θ(log n)
    # Karatsuba: T(n) = 3T(n/2) + n → 情況 1，Θ(n^1.58)
    # Strassen: T(n) = 7T(n/2) + n^2 → 情況 1，Θ(n^2.81)

    # n 從 1024 加倍到 2048，看總工作量放大幾倍：
    # 合併排序約 2.2 倍（n log n 在 n 加倍時略多於 2 倍），Strassen 約 7 倍（n^2.81）
    for a, b, d in [(2, 2, 1), (7, 2, 2)]:
        r = recursion_tree(a, b, d, 2048) / recursion_tree(a, b, d, 1024)
        print(f"a={a} b={b} d={d}: n 加倍，工作量 ×{r:.2f}")   # ×2.18、×7.01`;

const cpp = `#include <cmath>
#include <cstdio>
#include <string>

// T(n) = a·T(n/b) + Θ(n^d)，回傳情況編號並把答案寫進 out
int master(int a, int b, int d, std::string& out) {
    double e = std::log(a) / std::log(b);   // log_b a
    std::string nd = d == 0 ? "1" : d == 1 ? "n" : "n^" + std::to_string(d);   // n^d 的顯示
    if (std::fabs(e - d) < 1e-9) {          // 情況 2：每層工作量相同
        out = d == 0 ? "Θ(log n)" : "Θ(" + nd + " log n)";
        return 2;
    }
    if (e > d) {                            // 情況 1：葉子主導
        char buf[32];
        std::snprintf(buf, sizeof buf, "Θ(n^%.2f)", e);
        out = buf; return 1;
    }
    out = "Θ(" + nd + ")";                  // 情況 3：根主導
    return 3;
}

// 遞迴樹逐層加總，驗證定理
double recursionTree(int a, int b, int d, double n) {
    double total = 0, size = n, nodes = 1;
    while (size >= 1) {
        total += nodes * std::pow(size, d);
        nodes *= a;
        size /= b;
    }
    return total;
}

int main() {
    struct { const char* name; int a, b, d; } cases[] = {
        {"合併排序", 2, 2, 1}, {"二分搜尋", 1, 2, 0}, {"Karatsuba", 3, 2, 1}, {"Strassen", 7, 2, 2},
    };
    for (auto& c : cases) {
        std::string ans;
        int k = master(c.a, c.b, c.d, ans);
        std::printf("%s: 情況 %d，%s\\n", c.name, k, ans.c_str());   // 例如 合併排序: 情況 2，Θ(n log n)
    }
    std::printf("合併排序 n 加倍 → ×%.2f\\n", recursionTree(2, 2, 1, 2048) / recursionTree(2, 2, 1, 1024));   // ×2.18
    std::printf("Strassen n 加倍 → ×%.2f\\n", recursionTree(7, 2, 2, 2048) / recursionTree(7, 2, 2, 1024));   // ×7.01
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "為什麼切一半就變快",
              problem: "把 n 筆資料排序，兩兩比較要 n² 次。有人說「切成兩半各自排，再合起來」會快很多。但切半也要遞迴再切半，合併還要花 n 的時間，到底快在哪？快多少？",
              why: "寫成遞迴式 T(n) = 2T(n/2) + n，Master Theorem 直接告訴你答案是 n log n。它讓你看見關鍵：每一層的合併工作加起來剛好是 n，而層數只有 log n。不用每次都手推遞迴樹。",
            },
            {
              title: "值不值得多切幾份",
              problem: "矩陣乘法切成 4 塊，直覺要做 8 次小乘法。Strassen 想辦法只做 7 次，但多了很多加減法。少一次乘法真的划算嗎？",
              why: "8T(n/2) + n² 是 Θ(n³)，7T(n/2) + n² 是 Θ(n^2.81)。定理告訴你子問題數量 a 決定葉子數 n^(log_b a)，而葉子數在這裡壓倒一切，所以多出來的加減法完全不影響結論。",
            },
            {
              title: "面試時 30 秒內回答複雜度",
              problem: "寫完一個分治或遞迴的解法，面試官問「複雜度多少」。手推遞迴樹又慢又容易錯。",
              why: "記住三種情況：比較 log_b a 和 d。看一眼遞迴式就能報出 O(n log n)、O(n²) 還是 O(log n)，也能解釋為什麼。",
            },
          ]}
          cue="T(n) = aT(n/b) + f(n)、切成幾份、每份縮小幾倍、遞迴樹、分治的複雜度是多少。"
        />
      </Section>

      <Section id="concept">
        <p>
          分治演算法的時間都長成同一個形狀：<strong>T(n) = a·T(n/b) + f(n)</strong>。a 是切成幾個子問題，b 是每個子問題縮小幾倍，f(n) 是切開和合併的成本。這一課只處理 f(n) = Θ(n^d) 的多項式情況，這已經涵蓋絕大多數你會遇到的分治。
        </p>
        <p>
          想像<strong>遞迴樹</strong>。第 i 層有 a^i 個子問題，每個大小 n/b^i，所以第 i 層的總工作量是 a^i × (n/b^i)^d = n^d × (a/b^d)^i。這是一個公比 <strong>r = a/b^d</strong> 的等比數列。等比數列的總和由公比決定：r 大於 1 時最後一項最大，r 等於 1 時每項一樣，r 小於 1 時第一項最大。這就是<strong>三種情況</strong>的來源。
        </p>
        <p>
          比較 <strong>log_b a</strong>（葉子數的指數）和 <strong>d</strong>（根的工作量指數），等價於比較 r 和 1。<strong>情況 1</strong>：log_b a &gt; d，葉子主導，T(n) = Θ(n^(log_b a))，例如 Strassen 的 n^2.81。<strong>情況 2</strong>：log_b a = d，每層工作量都是 n^d，共 log n 層，T(n) = Θ(n^d log n)，例如合併排序的 n log n、二分搜尋的 log n。<strong>情況 3</strong>：log_b a &lt; d，根主導，T(n) = Θ(n^d)，例如切半但合併要 n² 的演算法，遞迴根本沒幫上忙。
          </p>
        <p>
          常見誤區：以為「有切半就是 log n」。切半只保證層數是 log n，總時間還要看每層做多少事。另外定理不涵蓋 f(n) 不是多項式的情況（例如 T(n) = 2T(n/2) + n log n 卡在情況 2 和 3 之間），也不涵蓋子問題不是按比例縮小的情況（例如快速排序最壞情況的 T(n) = T(n−1) + n，每次只少一個），或子問題大小不一樣的情況（例如 T(n) = T(n/3) + T(2n/3) + n）。這些要回頭畫遞迴樹或用代換法。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>從程式碼讀出 <Code>a</Code>（遞迴呼叫幾次）、<Code>b</Code>（每次傳入的大小縮小幾倍）、<Code>d</Code>（遞迴以外的工作是 n 的幾次方）。</>,
            <>算 <Code>log_b a</Code>。a = 1 時是 0，a = b 時是 1，a = b² 時是 2；其他情況用計算機，例如 log₂ 7 ≈ 2.81。</>,
            <>比較 <Code>log_b a</Code> 與 <Code>d</Code>。大於：情況 1，答案 Θ(n^(log_b a))。等於：情況 2，答案 Θ(n^d log n)。小於：情況 3，答案 Θ(n^d)。</>,
            <>用遞迴樹檢查直覺：算第 0 層、第 1 層、第 2 層的工作量，看是在變大、持平還是變小。方向要和你選的情況一致。</>,
            <>若 f(n) 不是純多項式，或子問題大小不均，定理不適用。改畫遞迴樹逐層加總，或猜答案再用歸納法驗證。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>選一個常見演算法，或自己組合 a、b、d。上方顯示比較與結論，下方是遞迴樹每一層的工作量：情況 1 的長條逐層變長，情況 2 每層一樣長，情況 3 逐層變短。注意根那層和葉子那層各占總量的比例。</p>
        <MasterTheoremDemo />
      </Section>

      <Section id="code">
        <p>定理本身不是演算法，這裡的程式碼是一個小計算器：輸入 a、b、d 回傳情況與複雜度，再用遞迴樹逐層加總驗證，看 n 加倍時總工作量放大幾倍。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 704", name: "Binary Search（T(n) = T(n/2) + 1）", diff: "Easy" },
            { src: "LeetCode 912", name: "Sort an Array（寫合併排序，推 T(n) = 2T(n/2) + n）", diff: "Medium" },
            { src: "LeetCode 50", name: "Pow(x, n)（T(n) = T(n/2) + 1）", diff: "Medium" },
            { src: "LeetCode 241", name: "Different Ways to Add Parentheses（子問題不均，定理不適用）", diff: "Medium" },
            { src: "LeetCode 932", name: "Beautiful Array（T(n) = 2T(n/2) + n）", diff: "Medium" },
            { src: "LeetCode 218", name: "The Skyline Problem（分治版 T(n) = 2T(n/2) + n）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const masterLesson: Lesson = { prereq: "Recursion、Big-O Notation", Body };
