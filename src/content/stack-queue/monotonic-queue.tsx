import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { MonotonicQueueDemo } from "@/components/lesson/demos/MonotonicQueueDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from collections import deque

# 滑動視窗最大值（LeetCode 239）
# deque 存索引，對應的值從前到後遞減，最前面永遠是視窗最大值
def max_sliding_window(nums, k):
    dq = deque()
    out = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:     # 尾端比 x 小的永遠不會再是最大值
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:                  # 最前面已經離開視窗
            dq.popleft()
        if i >= k - 1:                      # 視窗滿了才輸出
            out.append(nums[dq[0]])
    return out


# 同一個骨架改成最小值：把 <= 換成 >=
def min_sliding_window(nums, k):
    dq = deque()
    out = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] >= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out


# 和至少為 k 的最短子陣列（LeetCode 862）：前綴和 + 單調佇列
def shortest_subarray(nums, k):
    p = [0]
    for x in nums:
        p.append(p[-1] + x)
    dq = deque()                            # 前綴和遞增的索引
    best = float("inf")
    for j, pj in enumerate(p):
        while dq and pj - p[dq[0]] >= k:    # 前端能當左端點就結算，之後不會更好
            best = min(best, j - dq.popleft())
        while dq and p[dq[-1]] >= pj:       # 尾端比我大的，當左端點永遠輸我
            dq.pop()
        dq.append(j)
    return best if best != float("inf") else -1`;

const cpp = `#include <vector>
#include <deque>
#include <algorithm>

// 滑動視窗最大值
std::vector<int> maxSlidingWindow(const std::vector<int>& nums, int k) {
    std::deque<int> dq;                    // 索引，值遞減
    std::vector<int> out;
    for (int i = 0; i < (int)nums.size(); i++) {
        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back();
        dq.push_back(i);
        if (dq.front() <= i - k) dq.pop_front();
        if (i >= k - 1) out.push_back(nums[dq.front()]);
    }
    return out;
}

// 和至少為 k 的最短子陣列：前綴和 + 單調佇列
int shortestSubarray(const std::vector<int>& nums, int k) {
    int n = nums.size();
    std::vector<long long> p(n + 1, 0);
    for (int i = 0; i < n; i++) p[i + 1] = p[i] + nums[i];
    std::deque<int> dq;
    int best = n + 1;
    for (int j = 0; j <= n; j++) {
        while (!dq.empty() && p[j] - p[dq.front()] >= k) {
            best = std::min(best, j - dq.front());
            dq.pop_front();
        }
        while (!dq.empty() && p[dq.back()] >= p[j]) dq.pop_back();
        dq.push_back(j);
    }
    return best == n + 1 ? -1 : best;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "監控儀表板：過去 60 秒的最大延遲",
              problem: "每秒進來一個數字，隨時要報「最近 60 筆的最大值」。每次重新掃 60 筆是 O(k)，一天八萬六千秒乘上 k，而且 k 常常是幾千。",
              why: "單調佇列讓視窗滑動時，取最大值是 O(1)。每個數字只進出佇列各一次，整體 O(n)，和 k 無關。",
            },
            {
              title: "影像處理的最大值濾波",
              problem: "對圖片每個像素取周圍 k×k 範圍的最大值（膨脹運算）。直接做是 O(n·k²)。",
              why: "先對每一列做一維的滑動視窗最大值，再對每一行做一次，兩次 O(n)。單調佇列是這類「視窗極值」的標準工具。",
            },
            {
              title: "動態規劃的轉移優化",
              problem: "很多 DP 的轉移長這樣：dp[i] = max(dp[j]) + 某個值，其中 j 在 [i−k, i−1] 之間。每個 i 都掃一遍 j 是 O(nk)。",
              why: "「區間內的最大值」隨 i 滑動，正是單調佇列處理的形狀，把轉移壓成 O(1)。這是進階 DP 常見的優化。",
            },
          ]}
          cue="滑動視窗的最大／最小值、固定長度區間的極值、最近 k 個、視窗滑動時極值怎麼更新、DP 轉移的區間 max。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>單調佇列</strong>是一個雙端佇列，裡面的值從前到後保持<strong>遞減</strong>（求最大值時），所以<strong>最前面永遠是目前視窗的最大值</strong>。它同時用到 deque 的兩端：尾端負責維持單調性，前端負責把離開視窗的元素淘汰。
        </p>
        <p>
          核心觀察：新元素 x 進來時，尾端所有<strong>比 x 小</strong>的元素可以直接丟掉。理由是它們比 x 小，又比 x 早進視窗、會比 x 早離開，所以只要 x 還在，它們永遠當不上最大值。丟掉之後把 x 放到尾端，佇列自然保持遞減。
        </p>
        <p>
          前端則要檢查<strong>是否已經滑出視窗</strong>：存的是索引，若 <Code>dq[0] ≤ i − k</Code> 就從前端彈出。因為每個索引只推入一次、彈出至多一次，n 個元素總共 O(n)，比暴力的 O(nk) 和堆積的 O(n log k) 都好。
        </p>
        <p>
          它和單調堆疊的關係：都靠「新元素進來前把沒用的彈掉」維持單調性。差別在單調佇列還要從<strong>前端</strong>淘汰過期的，所以需要 deque。凡是「在一個滑動的區間裡取極值」，先想它。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>建一個 deque 存<strong>索引</strong>（不是值，才能判斷是否過期）。求最大值時維持值遞減，求最小值時遞增。</>,
            <>對每個 i：<strong>先清尾端</strong>，<Code>while dq and nums[dq[-1]] &lt;= nums[i]: dq.pop()</Code>。用 <Code>&lt;=</Code> 讓相等的舊元素也被淘汰，佇列更短。</>,
            <>把 i 推入尾端。</>,
            <><strong>再清前端</strong>：<Code>if dq[0] &lt;= i − k: dq.popleft()</Code>。每一輪最多只會過期一個，所以用 if 就夠。</>,
            <>當 <Code>i ≥ k − 1</Code>（視窗滿了），<Code>nums[dq[0]]</Code> 就是這個視窗的答案。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>視窗大小 3。每一步先從尾端彈掉比新元素小的（劃掉的），再檢查前端是否過期；綠色是 deque 最前面，也就是目前視窗的最大值。</p>
        <MonotonicQueueDemo />
      </Section>

      <Section id="code">
        <p>滑動視窗最大值與最小值只差一個比較符號；第三段把前綴和和單調佇列組合起來解「和至少為 k 的最短子陣列」，是這個技巧的進階用法。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 239", name: "Sliding Window Maximum", diff: "Hard" },
            { src: "LeetCode 1438", name: "Longest Continuous Subarray With Absolute Diff ≤ Limit（同時維護 max 與 min）", diff: "Medium" },
            { src: "LeetCode 862", name: "Shortest Subarray with Sum at Least K", diff: "Hard" },
            { src: "LeetCode 1696", name: "Jump Game VI（DP + 單調佇列）", diff: "Medium" },
            { src: "LeetCode 1425", name: "Constrained Subsequence Sum", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const monotonicQueueLesson: Lesson = { prereq: "Queue & Deque、Monotonic Stack、Prefix Sum", Body };
