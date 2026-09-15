import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { MaxSubarrayDemo } from "@/components/lesson/demos/MaxSubarrayDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 最大子陣列（LeetCode 53）：分治版
# 答案只有三種可能：全在左半、全在右半、跨過中線
def max_subarray_dc(a):
    def solve(lo, hi):
        if lo == hi:
            return a[lo]                          # 單一元素
        mid = (lo + hi) // 2
        left = solve(lo, mid)                     # 全在左半
        right = solve(mid + 1, hi)                # 全在右半
        # 跨中線：從 mid 往左的最大後綴 + 從 mid+1 往右的最大前綴
        s, best_l = 0, float("-inf")
        for i in range(mid, lo - 1, -1):
            s += a[i]
            best_l = max(best_l, s)
        s, best_r = 0, float("-inf")
        for i in range(mid + 1, hi + 1):
            s += a[i]
            best_r = max(best_r, s)
        return max(left, right, best_l + best_r)  # 三者取最大
    return solve(0, len(a) - 1)


# Kadane：cur 是「以 i 結尾」的最大和，負的就丟掉重來
def max_subarray_kadane(a):
    cur = best = a[0]
    for x in a[1:]:
        cur = max(x, cur + x)                     # 接上去，或從 x 重新開始
        best = max(best, cur)
    return best


# 變形：同時回傳區間 [l, r]
def max_subarray_range(a):
    cur, best = a[0], a[0]
    start, l, r = 0, 0, 0
    for i in range(1, len(a)):
        if cur < 0:
            cur, start = a[i], i                  # 重新開始
        else:
            cur += a[i]
        if cur > best:
            best, l, r = cur, start, i
    return best, l, r


if __name__ == "__main__":
    a = [-2, 1, -3, 4, -1, 2, 1, -5]
    print(max_subarray_dc(a), max_subarray_kadane(a), max_subarray_range(a))  # 6 6 (6, 3, 6)`;

const cpp = `#include <vector>
#include <algorithm>
#include <climits>
#include <cstdio>

// 分治版：全在左半、全在右半、跨中線，三者取最大
int solve(const std::vector<int>& a, int lo, int hi) {
    if (lo == hi) return a[lo];
    int mid = (lo + hi) / 2;
    int left = solve(a, lo, mid);
    int right = solve(a, mid + 1, hi);
    int s = 0, bestL = INT_MIN;                   // 從 mid 往左的最大後綴
    for (int i = mid; i >= lo; i--) { s += a[i]; bestL = std::max(bestL, s); }
    s = 0; int bestR = INT_MIN;                   // 從 mid+1 往右的最大前綴
    for (int i = mid + 1; i <= hi; i++) { s += a[i]; bestR = std::max(bestR, s); }
    return std::max({left, right, bestL + bestR});
}
int maxSubarrayDC(const std::vector<int>& a) { return solve(a, 0, (int)a.size() - 1); }

// Kadane：cur 是以 i 結尾的最大和
int maxSubarrayKadane(const std::vector<int>& a) {
    int cur = a[0], best = a[0];
    for (size_t i = 1; i < a.size(); i++) {
        cur = std::max(a[i], cur + a[i]);         // 接上去，或從 a[i] 重來
        best = std::max(best, cur);
    }
    return best;
}

// 變形：回傳區間 [l, r]
int maxSubarrayRange(const std::vector<int>& a, int& l, int& r) {
    int cur = a[0], best = a[0], start = 0;
    l = r = 0;
    for (int i = 1; i < (int)a.size(); i++) {
        if (cur < 0) { cur = a[i]; start = i; }
        else cur += a[i];
        if (cur > best) { best = cur; l = start; r = i; }
    }
    return best;
}

int main() {
    std::vector<int> a = {-2, 1, -3, 4, -1, 2, 1, -5};
    int l, r;
    int best = maxSubarrayRange(a, l, r);
    std::printf("%d %d %d [%d, %d]\\n", maxSubarrayDC(a), maxSubarrayKadane(a), best, l, r); // 6 6 6 [3, 6]
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "股票：哪一段持有期間賺最多",
              problem: "有一年份的每日漲跌。想知道如果只能買一次賣一次，哪一天買、哪一天賣最賺。試每一對買賣日是 O(n²)，250 天還好，十年的分鐘線就撐不住。",
              why: "每日漲跌加起來就是持有期間的獲利，問題變成「連續一段加總最大」。分治把它切半，答案不是在左半、就在右半、不然就跨過中線，O(n log n)。Kadane 再壓到 O(n)。",
            },
            {
              title: "訊號裡最強的那一段",
              problem: "感測器回傳一串數值，扣掉基準線後有正有負。要找出「訊號最集中」的連續時段，也就是加總最大的區間。",
              why: "和股票是同一題。Kadane 一路掃過去，遇到累積變負就重新開始，因為帶著負的前綴只會拖累後面。",
            },
            {
              title: "分治的形狀，之後會再用到",
              problem: "線段樹要支援「任意區間的最大子陣列和」，每次查詢不能重掃整段。",
              why: "分治版合併左右兩半的方式（左半最佳、右半最佳、左後綴加右前綴）正是線段樹節點要存的四個值。這一課先把合併的邏輯練熟，之後就是把它放進樹裡。",
            },
          ]}
          cue="連續子陣列、加總最大、最佳買賣區間、一段最強的訊號、可以切半再合併。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>最大子陣列</strong>：在一串有正有負的數裡，找連續一段使加總最大。暴力枚舉所有 (l, r) 是 O(n²)，用前綴和也只是把內層加總變 O(1)，枚舉本身還是 n²。
        </p>
        <p>
          <strong>分治</strong>的觀察是：把陣列從中間切開，答案的區間只有三種位置，<strong>完全在左半</strong>、<strong>完全在右半</strong>、<strong>跨過中線</strong>。前兩種遞迴解決。第三種一定包含 mid 和 mid+1，所以它等於「以 mid 結尾的最大後綴」加「從 mid+1 開始的最大前綴」，各掃一次 O(n) 就能算出。三者取最大。遞迴式 T(n) = 2T(n/2) + n，由 Master Theorem 得 <strong>O(n log n)</strong>，空間是遞迴深度 O(log n)。
        </p>
        <p>
          <strong>Kadane</strong> 換一個角度：定義 cur 為「以第 i 個元素<strong>結尾</strong>的最大和」。要嘛把 a[i] 接在前一段後面（cur + a[i]），要嘛從 a[i] 重新開始，取大的那個。等價地說，前面累積若是負的，帶著只會拖累，直接丟掉。整體答案是所有 cur 的最大值。一次掃描 <strong>O(n)</strong>、O(1) 空間。這其實是一維 DP，之後會在 DP 主題再遇到它。
        </p>
        <p>
          兩者的取捨：Kadane 更快也更短，面試寫它。分治的價值在<strong>合併的形狀</strong>：一個區段的資訊只要記「總和、最大前綴、最大後綴、最大子段」四個數，兩個相鄰區段就能 O(1) 合併，這正是線段樹處理區間最大子陣列的做法。常見錯誤：全是負數時答案是最大的那個負數而不是 0，所以 best 要初始化成 a[0] 而不是 0。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>分治：<Code>solve(lo, hi)</Code> 回傳該區間的最大子陣列和。若 <Code>lo == hi</Code>，回傳 <Code>a[lo]</Code>。</>,
            <>取 <Code>mid</Code>，遞迴求 <Code>left = solve(lo, mid)</Code> 與 <Code>right = solve(mid+1, hi)</Code>。</>,
            <>跨中線：從 mid 往左累加，記錄最大值 <Code>bestL</Code>；從 mid+1 往右累加，記錄最大值 <Code>bestR</Code>。跨中線的答案是 <Code>bestL + bestR</Code>。</>,
            <>回傳 <Code>max(left, right, bestL + bestR)</Code>。每層 O(n)，共 log n 層。</>,
            <>Kadane：<Code>cur = max(a[i], cur + a[i])</Code>，<Code>best = max(best, cur)</Code>，從 <Code>a[0]</Code> 開始初始化，一次掃完。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>八天的漲跌。前半段是分治：遞迴樹上藍色是正在處理的區間，綠色是已解出的；陣列裡黃色是跨中線掃描的範圍，綠色是這一層的答案區間。分治做完後，同一串步驟接著跑 Kadane：陣列裡黃色是 cur 對應的區間，綠色是目前的 best，看它怎麼用兩個變數掃一遍就得到同樣的答案。</p>
        <MaxSubarrayDemo />
      </Section>

      <Section id="code">
        <p>分治版與 Kadane 版並列，加上一個回傳區間位置的變形，股票題要的「哪天買哪天賣」就是它。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 121", name: "Best Time to Buy and Sell Stock（把價格轉成每日漲跌）", diff: "Easy" },
            { src: "LeetCode 53", name: "Maximum Subarray（分治和 Kadane 各寫一次）", diff: "Medium" },
            { src: "LeetCode 152", name: "Maximum Product Subarray（同時追蹤最大與最小）", diff: "Medium" },
            { src: "LeetCode 918", name: "Maximum Sum Circular Subarray（總和減最小子陣列）", diff: "Medium" },
            { src: "LeetCode 1186", name: "Maximum Subarray Sum with One Deletion", diff: "Medium" },
            { src: "LeetCode 363", name: "Max Sum of Rectangle No Larger Than K（二維壓成一維）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const maxSubarrayLesson: Lesson = { prereq: "Recursion、Prefix Sum", Body };
