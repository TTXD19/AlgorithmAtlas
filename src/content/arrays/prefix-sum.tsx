import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { PrefixSumDemo } from "@/components/lesson/demos/PrefixSumDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 建表 O(n)：P[i] = a[0] + ... + a[i-1]，多留一格 P[0] = 0
def build_prefix(a):
    p = [0] * (len(a) + 1)
    for i, x in enumerate(a):
        p[i + 1] = p[i] + x
    return p

# 查詢 O(1)：a[l..r] 的和
def range_sum(p, l, r):
    return p[r + 1] - p[l]


a = [3, 1, 4, 1, 5, 9, 2, 6]
p = build_prefix(a)          # [0, 3, 4, 8, 9, 14, 23, 25, 31]
range_sum(p, 2, 5)           # 4+1+5+9 = 19 = p[6] - p[2]


# 前綴和 + 雜湊表：有幾個子陣列的和恰好是 k（LeetCode 560）
# 子陣列 (i, j] 的和 = P[j] - P[i] = k  ⇔  P[i] = P[j] - k
# 所以走到 j 時，問「之前有幾個前綴和等於 P[j] - k」
def subarray_sum(nums, k):
    count = 0
    seen = {0: 1}            # 前綴和 0 出現過一次（空前綴）
    running = 0
    for x in nums:
        running += x
        count += seen.get(running - k, 0)
        seen[running] = seen.get(running, 0) + 1
    return count


# 二維前綴和：S[r][c] = 左上角到 (r-1, c-1) 的矩形總和
def build_2d(grid):
    m, n = len(grid), len(grid[0])
    s = [[0] * (n + 1) for _ in range(m + 1)]
    for r in range(m):
        for c in range(n):
            s[r+1][c+1] = grid[r][c] + s[r][c+1] + s[r+1][c] - s[r][c]
    return s

def rect_sum(s, r1, c1, r2, c2):     # 左上 (r1,c1) 到右下 (r2,c2)
    return s[r2+1][c2+1] - s[r1][c2+1] - s[r2+1][c1] + s[r1][c1]`;

const cpp = `#include <vector>
#include <unordered_map>

// 建表 O(n)
std::vector<long long> buildPrefix(const std::vector<int>& a) {
    std::vector<long long> p(a.size() + 1, 0);
    for (size_t i = 0; i < a.size(); i++) p[i + 1] = p[i] + a[i];
    return p;
}

// 查詢 O(1)
long long rangeSum(const std::vector<long long>& p, int l, int r) {
    return p[r + 1] - p[l];
}

// 前綴和 + 雜湊表：和為 k 的子陣列個數
int subarraySum(const std::vector<int>& nums, int k) {
    std::unordered_map<long long, int> seen;
    seen[0] = 1;
    long long running = 0;
    int count = 0;
    for (int x : nums) {
        running += x;
        auto it = seen.find(running - k);
        if (it != seen.end()) count += it->second;
        seen[running]++;
    }
    return count;
}

// 二維前綴和
std::vector<std::vector<long long>> build2D(const std::vector<std::vector<int>>& g) {
    int m = g.size(), n = g[0].size();
    std::vector<std::vector<long long>> s(m + 1, std::vector<long long>(n + 1, 0));
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            s[r+1][c+1] = g[r][c] + s[r][c+1] + s[r+1][c] - s[r][c];
    return s;
}

long long rectSum(const std::vector<std::vector<long long>>& s, int r1, int c1, int r2, int c2) {
    return s[r2+1][c2+1] - s[r1][c2+1] - s[r2+1][c1] + s[r1][c1];
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "報表問「第 1000 天到第 5000 天的營收」",
              problem: "每天一筆營收，老闆隨時會問任意區間的總和，一天問幾百次。每次都從頭加到尾，資料一多就等很久。",
              why: "先花 O(n) 算一次「從第一天累計到每一天」的前綴和，之後任何區間都是兩個累計值相減，O(1)。",
            },
            {
              title: "有幾段連續的交易加起來剛好是 k",
              problem: "找出陣列裡「和等於 k」的連續子陣列有幾個。暴力枚舉所有 (l, r) 是 O(n²)，n 十萬就爆了。",
              why: "區間和 = 兩個前綴和的差。走到位置 j 時，只要問「前面有幾個前綴和等於 P[j] − k」，用雜湊表記次數，整體 O(n)。",
            },
            {
              title: "影像裡任意矩形的亮度總和",
              problem: "積分影像（integral image）是電腦視覺的基本工具：要快速算出圖片任一矩形區域的像素總和，用在人臉偵測、模糊濾鏡。",
              why: "二維前綴和：一次 O(mn) 建表，之後任何矩形的和只要四個值加減，O(1)。",
            },
          ]}
          cue="區間和、連續子陣列的和、多次查詢同一份不變的資料、矩形區域總和、和等於 k。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>前綴和</strong>是「從頭累加到每個位置」的陣列：<Code>P[i] = a[0] + a[1] + … + a[i-1]</Code>，多留一格 <Code>P[0] = 0</Code>。這樣任意區間 <Code>a[l..r]</Code> 的和就是 <Code>P[r+1] − P[l]</Code>：到 r 為止的總和，減掉 l 之前的總和，中間那段就留下來了。
        </p>
        <p>
          它是最單純的<strong>預處理換查詢</strong>：建表 O(n) 做一次，之後每次查詢 O(1)。前提是<strong>資料不會改</strong>，因為改動一個 a[i] 會讓後面所有 P 都要更新。若資料常改又常查，就要升級成 Fenwick 樹或線段樹，那是樹那一章的事。
        </p>
        <p>
          多留 <Code>P[0] = 0</Code> 這一格很重要，它讓「從 0 開始的區間」不用特判。同樣的想法可以延伸：前綴最大值、前綴 XOR、前綴乘積（Product of Array Except Self 就是前綴乘積乘上後綴乘積），只要運算有「反操作」或只要單向累積就行。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>開一個長度 <Code>n + 1</Code> 的陣列，<Code>P[0] = 0</Code>。</>,
            <>從左到右，<Code>P[i+1] = P[i] + a[i]</Code>。每一步只做一次加法，建表 O(n)。</>,
            <>查 <Code>a[l..r]</Code> 的和：回傳 <Code>P[r+1] − P[l]</Code>。注意右邊界是 r+1，因為 P 的定義「不含」該位置。</>,
            <>題目問「和等於 k 的子陣列」時，改寫成 <Code>P[j] − P[i] = k</Code>，邊掃邊用雜湊表記錄每個前綴和出現幾次，走到 j 就查 <Code>P[j] − k</Code> 出現過幾次。記得先放 <Code>{"{0: 1}"}</Code>。</>,
            <>二維時 <Code>S[r+1][c+1] = grid[r][c] + S[r][c+1] + S[r+1][c] − S[r][c]</Code>（容斥：左邊加上面，扣掉重複的左上角），查矩形也是同樣的四項加減。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>先按「建表下一步」看 P 怎麼一格一格累加，建好後選 l 和 r，看區間和怎麼從兩個 P 值相減得到。</p>
        <PrefixSumDemo />
      </Section>

      <Section id="code">
        <p>三段：基本的建表與查詢、前綴和加雜湊表數子陣列、二維前綴和。C++ 用 long long 存前綴和，避免累加溢位。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 303", name: "Range Sum Query - Immutable", diff: "Easy" },
            { src: "LeetCode 724", name: "Find Pivot Index", diff: "Easy" },
            { src: "LeetCode 560", name: "Subarray Sum Equals K（前綴和 + 雜湊表）", diff: "Medium" },
            { src: "LeetCode 304", name: "Range Sum Query 2D - Immutable", diff: "Medium" },
            { src: "LeetCode 974", name: "Subarray Sums Divisible by K", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const prefixSumLesson: Lesson = { prereq: "Array & Dynamic Array", Body };
