import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { TwoHeapsDemo } from "@/components/lesson/demos/TwoHeapsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `import heapq


class MedianFinder:
    """資料流中位數（LeetCode 295）。
    low：最大堆積，放較小的一半（用取負模擬）
    high：最小堆積，放較大的一半
    不變量：len(low) == len(high) 或 len(low) == len(high) + 1，且 max(low) <= min(high)
    """

    def __init__(self):
        self.low = []    # 存 -x
        self.high = []   # 存 x

    def add_num(self, x):
        if not self.low or x <= -self.low[0]:
            heapq.heappush(self.low, -x)
        else:
            heapq.heappush(self.high, x)
        # 重新平衡：low 最多比 high 多一個
        if len(self.low) > len(self.high) + 1:
            heapq.heappush(self.high, -heapq.heappop(self.low))
        elif len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2


# 同一個骨架的另一個應用：IPO（LeetCode 502）
# 兩個堆積分工：一個按「門檻」排（最小堆積），一個按「利潤」排（最大堆積）
def maximize_capital(k, w, profits, capital):
    by_capital = sorted(zip(capital, profits))     # (需要的資本, 利潤)
    available = []                                 # 最大堆積：存 -利潤
    i = 0
    for _ in range(k):
        while i < len(by_capital) and by_capital[i][0] <= w:
            heapq.heappush(available, -by_capital[i][1])   # 資本夠了，解鎖
            i += 1
        if not available:
            break
        w += -heapq.heappop(available)             # 做利潤最高的那個
    return w`;

const cpp = `#include <queue>
#include <vector>
#include <functional>

class MedianFinder {
    std::priority_queue<int> low;                                            // 最大堆積：較小的一半
    std::priority_queue<int, std::vector<int>, std::greater<int>> high;      // 最小堆積：較大的一半
public:
    void addNum(int x) {
        if (low.empty() || x <= low.top()) low.push(x);
        else high.push(x);
        // 重新平衡：low 最多比 high 多一個
        if (low.size() > high.size() + 1) { high.push(low.top()); low.pop(); }
        else if (high.size() > low.size()) { low.push(high.top()); high.pop(); }
    }
    double findMedian() {
        if (low.size() > high.size()) return low.top();
        return (low.top() + high.top()) / 2.0;
    }
};`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "監控儀表板的 p50 延遲",
              problem: "每秒幾千筆請求延遲進來，儀表板要即時顯示中位數。中位數不像平均可以累加，每次重算要先排序，O(n log n)。",
              why: "把資料分成「較小的一半」和「較大的一半」，各用一個堆積管理。中位數永遠是兩個堆頂之一或它們的平均，新資料進來只要 O(log n) 調整。",
            },
            {
              title: "有門檻的排程：IPO 問題",
              problem: "手上有一筆資本，每個專案需要一定資本才能啟動，做完能賺利潤。最多做 K 個，怎麼讓最後資本最多？",
              why: "一個堆積按「需要的資本」排，負責解鎖目前做得起的專案；另一個按「利潤」排，負責從解鎖的裡面挑最賺的。兩個堆積各管一個維度，這是雙堆積的另一種形狀。",
            },
            {
              title: "滑動視窗中位數",
              problem: "股價的過去 30 天中位數，每天往前滑一格。除了加入新資料，還要移除舊資料。",
              why: "同樣兩個堆積，加上「延遲刪除」：被移除的元素先記在雜湊表裡，等它浮到堆頂時再真正丟掉。這是資料流中位數的進階版。",
            },
          ]}
          cue="中位數、資料流、一半一半、兩個維度各自排序、既要最大又要最小。"
        />
      </Section>

      <Section id="concept">
        <p>
          一個堆積只能回答「最大是誰」或「最小是誰」，回答不了「中間是誰」。但把資料<strong>切成兩半</strong>就可以：較小的一半放進<strong>最大堆積</strong>，它的堆頂是左半的最大值；較大的一半放進<strong>最小堆積</strong>，它的堆頂是右半的最小值。這兩個堆頂正好是整體最中間的兩個數。
        </p>
        <p>
          要維持兩條<strong>不變量</strong>。第一，<strong>左半的每個數都不大於右半的每個數</strong>，也就是 <Code>max(low) ≤ min(high)</Code>：新元素和左半堆頂比一下，決定進哪一邊。第二，<strong>兩邊大小相差不超過 1</strong>：放完後若某邊多太多，就把它的堆頂搬去另一邊。約定左邊可以多一個，那麼奇數筆時中位數就是左邊堆頂，偶數筆時是兩個堆頂的平均。
        </p>
        <p>
          每筆資料最多一次 push 加一次搬移，<strong>O(log n)</strong>；查中位數只看堆頂，<strong>O(1)</strong>。相比每次排序的 O(n log n)，這就是「串流」問題典型的做法：不重算，只維護。
        </p>
        <p>
          雙堆積不只用在中位數。更一般的形狀是<strong>兩個堆積各管一個維度</strong>：IPO 問題用一個堆積按資本門檻解鎖、另一個按利潤挑選；會議室問題用一個堆積管開始時間、另一個管結束時間。認出「有兩個排序準則要同時處理」，就想到它。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>準備 <Code>low</Code>（最大堆積）與 <Code>high</Code>（最小堆積）。Python 沒有最大堆積，<Code>low</Code> 存負值。</>,
            <>新元素 x：若 <Code>low</Code> 是空的或 <Code>x ≤ max(low)</Code>，推入 <Code>low</Code>；否則推入 <Code>high</Code>。這一步維持「左半 ≤ 右半」。</>,
            <>重新平衡：若 <Code>len(low) &gt; len(high) + 1</Code>，把 <Code>low</Code> 的堆頂搬到 <Code>high</Code>；若 <Code>len(high) &gt; len(low)</Code>，把 <Code>high</Code> 的堆頂搬到 <Code>low</Code>。</>,
            <>查中位數：<Code>low</Code> 較多時回傳 <Code>max(low)</Code>；一樣多時回傳 <Code>(max(low) + min(high)) / 2</Code>。</>,
            <>需要移除舊元素（滑動視窗）時，用雜湊表記下「待刪除」，等該元素浮到堆頂再真的 pop，並在計算大小時扣掉待刪除的數量。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>八筆延遲資料依序進來。留意每一筆做了幾件事：先決定進哪邊，必要時搬一個過去，然後中位數直接從堆頂讀出。</p>
        <TwoHeapsDemo />
      </Section>

      <Section id="code">
        <p>資料流中位數的完整實作，加上 IPO 問題示範「兩個堆積各管一個維度」的另一種用法。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 295", name: "Find Median from Data Stream", diff: "Hard" },
            { src: "LeetCode 502", name: "IPO", diff: "Hard" },
            { src: "LeetCode 480", name: "Sliding Window Median（延遲刪除）", diff: "Hard" },
            { src: "LeetCode 253", name: "Meeting Rooms II（一個堆積管結束時間）", diff: "Medium" },
            { src: "LeetCode 1825", name: "Finding MK Average", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const twoHeapsLesson: Lesson = { prereq: "Binary Heap", Body };
