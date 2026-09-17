import { TwoHeapsDemo } from "@/components/lesson/demos/TwoHeapsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `import heapq


class MedianFinder:
    """Median of a data stream (LeetCode 295).
    low: max-heap holding the smaller half (simulated by storing negatives)
    high: min-heap holding the larger half
    Invariant: len(low) == len(high) or len(low) == len(high) + 1, and max(low) <= min(high)
    """

    def __init__(self):
        self.low = []    # stores -x
        self.high = []   # stores x

    def add_num(self, x):
        if not self.low or x <= -self.low[0]:
            heapq.heappush(self.low, -x)
        else:
            heapq.heappush(self.high, x)
        # Rebalance: low may hold at most one more than high
        if len(self.low) > len(self.high) + 1:
            heapq.heappush(self.high, -heapq.heappop(self.low))
        elif len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2


# The same skeleton elsewhere: IPO (LeetCode 502)
# The heaps split the work: one ordered by the capital threshold (min-heap), one by profit (max-heap)
def maximize_capital(k, w, profits, capital):
    by_capital = sorted(zip(capital, profits))     # (capital required, profit)
    available = []                                 # max-heap: stores -profit
    i = 0
    for _ in range(k):
        while i < len(by_capital) and by_capital[i][0] <= w:
            heapq.heappush(available, -by_capital[i][1])   # affordable now, so unlock it
            i += 1
        if not available:
            break
        w += -heapq.heappop(available)             # take on the most profitable one
    return w`;

const cpp = `#include <queue>
#include <vector>
#include <functional>

class MedianFinder {
    std::priority_queue<int> low;                                            // max-heap: the smaller half
    std::priority_queue<int, std::vector<int>, std::greater<int>> high;      // min-heap: the larger half
public:
    void addNum(int x) {
        if (low.empty() || x <= low.top()) low.push(x);
        else high.push(x);
        // Rebalance: low may hold at most one more than high
        if (low.size() > high.size() + 1) { high.push(low.top()); low.pop(); }
        else if (high.size() > low.size()) { low.push(high.top()); high.pop(); }
    }
    double findMedian() {
        if (low.size() > high.size()) return low.top();
        return (low.top() + high.top()) / 2.0;
    }
};`;

export const skeleton: LessonSkeleton = {
  demo: <TwoHeapsDemo />,
  code: { python, cpp },
};
