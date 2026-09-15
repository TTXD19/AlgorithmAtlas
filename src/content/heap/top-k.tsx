import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { TopKDemo } from "@/components/lesson/demos/TopKDemo";
import type { Lesson } from "@/lib/lessons";

const python = `import heapq
from collections import Counter


def top_k_largest(nums, k):
    """前 K 大：維持一個大小為 K 的最小堆積。O(n log k)"""
    heap = []
    for x in nums:
        if len(heap) < k:
            heapq.heappush(heap, x)
        elif x > heap[0]:                # 比門檻大才有資格進榜
            heapq.heapreplace(heap, x)   # pop 最小再 push，一次 O(log k)
    return sorted(heap, reverse=True)


def kth_largest(nums, k):
    """第 K 大：同樣的堆積，最後堆頂就是答案"""
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]


def top_k_frequent(words, k):
    """出現次數前 K 高：先計數，再對 (次數, 字) 做 Top-K"""
    count = Counter(words)
    # nlargest 內部就是大小為 k 的堆積
    return heapq.nlargest(k, count, key=count.get)


def top_k_frequent_bucket(nums, k):
    """次數的範圍最多是 n，可以用桶排序做到 O(n)"""
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for x, c in count.items():
        buckets[c].append(x)
    out = []
    for c in range(len(buckets) - 1, 0, -1):
        out.extend(buckets[c])
        if len(out) >= k:
            return out[:k]
    return out`;

const cpp = `#include <vector>
#include <queue>
#include <functional>
#include <unordered_map>
#include <algorithm>

// 前 K 大：大小為 K 的最小堆積。O(n log k)
std::vector<int> topKLargest(const std::vector<int>& nums, int k) {
    std::priority_queue<int, std::vector<int>, std::greater<int>> heap;
    for (int x : nums) {
        if ((int)heap.size() < k) heap.push(x);
        else if (x > heap.top()) { heap.pop(); heap.push(x); }
    }
    std::vector<int> out;
    while (!heap.empty()) { out.push_back(heap.top()); heap.pop(); }
    std::reverse(out.begin(), out.end());
    return out;
}

// 第 K 大：只要一個數，也可以用 nth_element（Quick Select，平均 O(n)）
int kthLargest(std::vector<int> nums, int k) {
    std::nth_element(nums.begin(), nums.begin() + (k - 1), nums.end(), std::greater<int>());
    return nums[k - 1];
}

// 出現次數前 K 高
std::vector<int> topKFrequent(const std::vector<int>& nums, int k) {
    std::unordered_map<int, int> count;
    for (int x : nums) count[x]++;
    using P = std::pair<int, int>;                    // (次數, 值)
    std::priority_queue<P, std::vector<P>, std::greater<P>> heap;
    for (auto& [val, c] : count) {
        heap.push({c, val});
        if ((int)heap.size() > k) heap.pop();
    }
    std::vector<int> out;
    while (!heap.empty()) { out.push_back(heap.top().second); heap.pop(); }
    return out;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "首頁的「熱門文章 Top 10」",
              problem: "一千萬篇文章各有閱讀數，每五分鐘要更新一次前十名。全部排序是 O(n log n)，而且你只要十個。",
              why: "維持一個大小為 10 的最小堆積，堆頂就是「入榜門檻」。掃過每篇文章，比門檻小的直接跳過，比門檻大的才換進來。O(n log 10)，幾乎就是掃一遍的成本。",
            },
            {
              title: "推薦系統取前 K 個候選",
              problem: "對每個使用者算出幾十萬個商品的分數，只需要分數最高的 50 個送去下一階段。",
              why: "同樣的 Top-K 堆積。當 K 遠小於 n 時，堆積的記憶體只有 O(K)，適合在資料流上跑，不用把全部分數留在記憶體裡。",
            },
            {
              title: "log 分析：最常出現的 IP",
              problem: "十億行存取紀錄，找出請求最多的前 100 個 IP。",
              why: "先用雜湊表計數，再對 (次數, IP) 做 Top-K。次數的範圍有限時，甚至能用桶排序做到 O(n)，這是這個主題裡值得知道的另一條路。",
            },
          ]}
          cue="前 K 大／小、第 K 大、最常出現的 K 個、離某點最近的 K 個、K 遠小於 n、資料是串流。"
        />
      </Section>

      <Section id="concept">
        <p>
          要找前 K 大，直覺是全部排序取前 K 個，O(n log n)。但你只需要 K 個，其餘 n − K 個的順序完全不重要。<strong>大小為 K 的最小堆積</strong>只記住目前最好的 K 個，而且堆頂是這 K 個裡最小的，也就是「入榜門檻」：新元素比門檻小就不用理它，比門檻大就把門檻踢掉換它進來。每個元素最多一次 O(log K) 的操作，整體 <strong>O(n log K)</strong>。
        </p>
        <p>
          方向很容易搞反：找<strong>前 K 大用最小堆積</strong>，找<strong>前 K 小用最大堆積</strong>。記法是「堆頂是最容易被淘汰的那個」。同一個堆積掃完後，堆頂就是第 K 大，所以「第 K 大」和「前 K 大」是同一題。
        </p>
        <p>
          還有兩條路。<strong>Quick Select</strong>：用快速排序的分割一次砍掉一半，平均 O(n)，但需要整份資料在記憶體、也不適合串流。<strong>桶排序</strong>：當要比的是「出現次數」時，次數最多是 n，開 n 個桶把元素按次數丟進去，從大的桶往回收，O(n)。選哪個看 K 的大小、資料是否為串流、以及要比的值有沒有範圍限制。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認目標：前 K 大用<strong>最小</strong>堆積，前 K 小用<strong>最大</strong>堆積。若要比的是次數或距離，先算出那個值，堆積裡放 <Code>(值, 元素)</Code> 的 tuple。</>,
            <>逐個掃過元素。堆積還沒滿 K 個就直接 push。</>,
            <>滿了之後，新元素和堆頂比較：<strong>不比堆頂好</strong>就跳過（O(1)），<strong>比堆頂好</strong>就 pop 堆頂再 push 它（Python 用 <Code>heapreplace</Code> 一次做完）。</>,
            <>掃完後堆積裡就是答案。要有序輸出就逐個 pop 再反轉；只要第 K 大就直接看堆頂。</>,
            <>若 K 接近 n、資料不是串流、只跑一次，改用 Quick Select 或直接排序可能更快；要比的是次數時考慮桶排序。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>K = 3。逐筆掃過閱讀數，堆頂（黃色）是入榜門檻。留意有多少筆連堆積都不用碰，直接被跳過。</p>
        <TopKDemo />
      </Section>

      <Section id="code">
        <p>前 K 大、第 K 大、出現次數前 K 高三種變形，加上桶排序的 O(n) 版本作對照。C++ 另外示範 <Code>nth_element</Code>，那就是標準庫的 Quick Select。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 215", name: "Kth Largest Element in an Array（堆積與 Quick Select 各做一次）", diff: "Medium" },
            { src: "LeetCode 347", name: "Top K Frequent Elements（試試桶排序版）", diff: "Medium" },
            { src: "LeetCode 973", name: "K Closest Points to Origin", diff: "Medium" },
            { src: "LeetCode 692", name: "Top K Frequent Words（次數相同時按字典序）", diff: "Medium" },
            { src: "LeetCode 1985", name: "Find the Kth Largest Integer in the Array（字串比較）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const topKLesson: Lesson = { prereq: "Binary Heap、Hash Table", Body };
