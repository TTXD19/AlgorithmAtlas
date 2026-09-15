import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { BinaryHeapDemo } from "@/components/lesson/demos/BinaryHeapDemo";
import type { Lesson } from "@/lib/lessons";

const python = `class MinHeap:
    """用陣列存的最小堆積。索引 i 的父節點是 (i-1)//2，子節點是 2i+1、2i+2。"""

    def __init__(self):
        self.a = []

    def push(self, x):
        self.a.append(x)                 # 先放到尾端，保持完全二元樹的形狀
        self._sift_up(len(self.a) - 1)   # 再往上浮到正確位置

    def pop(self):
        top = self.a[0]                  # 最小值一定在根
        last = self.a.pop()
        if self.a:
            self.a[0] = last             # 尾端搬到根，再往下沉
            self._sift_down(0)
        return top

    def peek(self):
        return self.a[0]

    def _sift_up(self, i):
        while i > 0:
            p = (i - 1) // 2
            if self.a[i] < self.a[p]:
                self.a[i], self.a[p] = self.a[p], self.a[i]
                i = p
            else:
                break

    def _sift_down(self, i):
        n = len(self.a)
        while True:
            l, r, smallest = 2 * i + 1, 2 * i + 2, i
            if l < n and self.a[l] < self.a[smallest]:
                smallest = l
            if r < n and self.a[r] < self.a[smallest]:
                smallest = r
            if smallest == i:
                break
            self.a[i], self.a[smallest] = self.a[smallest], self.a[i]
            i = smallest


# 實務上直接用標準庫：heapq 就是最小堆積
import heapq

h = []
heapq.heappush(h, 7)
heapq.heappush(h, 3)
heapq.heappush(h, 9)
print(heapq.heappop(h))      # 3

# 要最大堆積就把值取負
big = []
heapq.heappush(big, -7)
heapq.heappush(big, -9)
print(-heapq.heappop(big))   # 9

# 從一個既有串列建堆：O(n)，比逐個 push 的 O(n log n) 快
nums = [7, 3, 9, 1, 4, 8]
heapq.heapify(nums)
print(nums[0])               # 1`;

const cpp = `#include <vector>
#include <queue>
#include <functional>

// 手寫最小堆積
class MinHeap {
    std::vector<int> a;
    void siftUp(int i) {
        while (i > 0) {
            int p = (i - 1) / 2;
            if (a[i] < a[p]) { std::swap(a[i], a[p]); i = p; }
            else break;
        }
    }
    void siftDown(int i) {
        int n = a.size();
        while (true) {
            int l = 2 * i + 1, r = 2 * i + 2, smallest = i;
            if (l < n && a[l] < a[smallest]) smallest = l;
            if (r < n && a[r] < a[smallest]) smallest = r;
            if (smallest == i) break;
            std::swap(a[i], a[smallest]);
            i = smallest;
        }
    }
public:
    void push(int x) { a.push_back(x); siftUp(a.size() - 1); }
    int pop() {
        int top = a[0];
        a[0] = a.back(); a.pop_back();
        if (!a.empty()) siftDown(0);
        return top;
    }
    int peek() const { return a[0]; }
    bool empty() const { return a.empty(); }
};

// 實務上用 std::priority_queue。預設是最大堆積
std::priority_queue<int> maxHeap;
// 最小堆積要多給兩個模板參數
std::priority_queue<int, std::vector<int>, std::greater<int>> minHeap;

// 從既有資料建堆：O(n)
std::vector<int> nums = {7, 3, 9, 1, 4, 8};
std::priority_queue<int, std::vector<int>, std::greater<int>> h(nums.begin(), nums.end());
// h.top() == 1`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "作業系統的工作排程",
              problem: "幾百個程序等著 CPU，每個有不同優先度，新程序隨時進來。每次都要挑優先度最高的來跑，但把整個佇列重新排序太慢。",
              why: "堆積只保證「最頂端是極值」，不管其他元素的順序。所以加入和取出都是 O(log n)，而不是排序的 O(n log n)。Linux 排程器與 Java 的 PriorityQueue 底層都是這種結構。",
            },
            {
              title: "事件模擬與計時器",
              problem: "遊戲伺服器有上萬個計時器：技能冷卻、Buff 到期、怪物重生。每個 tick 要問「最近一個要觸發的是誰」。",
              why: "把到期時間放進最小堆積，堆頂永遠是最早到期的。Node.js 的 timer、Go 的 runtime timer 都是這樣實作的。",
            },
            {
              title: "Dijkstra 的引擎",
              problem: "最短路徑演算法每一輪要挑「目前距離最小的未確定節點」。暴力掃描每輪 O(V)，整體 O(V²)。",
              why: "換成堆積後每輪 O(log V)，整體變成 O((V+E) log V)。堆積是很多圖論演算法能跑得快的原因。",
            },
          ]}
          cue="隨時取最大或最小、優先度、最早到期、Top-K、資料一直進來還要一直取極值。"
        />
      </Section>

      <Section id="concept">
        <p>
          堆積是一棵<strong>完全二元樹</strong>：每一層填滿才往下一層，同一層由左往右填。這個形狀讓它可以<strong>直接用陣列存</strong>，不需要指標：索引 i 的父節點在 <Code>(i − 1) / 2</Code>，兩個子節點在 <Code>2i + 1</Code> 與 <Code>2i + 2</Code>。
        </p>
        <p>
          唯一的規則是<strong>堆積性質</strong>：最小堆積裡每個父節點都不大於它的子節點（最大堆積反過來）。注意這只約束父子之間，兄弟之間、不同子樹之間沒有順序。所以堆積<strong>不是排序好的</strong>，它只保證根是最小值。少做的這些事，就是它比排序快的原因。
        </p>
        <p>
          兩個基本操作都靠「破壞規則、再修復」。<strong>push</strong>：把新元素放到陣列尾端（樹的最後一個位置），然後和父節點比較，比父節點小就交換，一路往上浮（sift up）。<strong>pop</strong>：取走根，把尾端元素搬到根，然後和較小的子節點比較，比子節點大就交換，一路往下沉（sift down）。兩者最多走過樹高 log n 層，所以是 O(log n)。
        </p>
        <p>
          從 n 個元素建堆有更快的方法：從最後一個非葉節點往前，對每個節點做一次 sift down。看起來是 n 次 log n，但底層節點多而下沉距離短，加總後是 <strong>O(n)</strong>。Python 的 <Code>heapify</Code> 與 C++ 的 <Code>make_heap</Code> 都是這樣做。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <><strong>push(x)</strong>：把 x 加到陣列尾端，設 i 為它的索引。</>,
            <>當 i 不是根且 <Code>a[i] &lt; a[parent]</Code>：交換兩者，i 移到父節點。否則停止。</>,
            <><strong>pop()</strong>：記下 <Code>a[0]</Code> 當回傳值，把尾端元素搬到 <Code>a[0]</Code>，陣列長度減一，設 i = 0。</>,
            <>找 i 的兩個子節點中較小的那個 c。若 <Code>a[c] &lt; a[i]</Code>：交換，i 移到 c，重複；否則停止。</>,
            <>要最大堆積時，把比較方向反過來；或像 Python 一樣把值取負塞進最小堆積。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>一段固定的操作腳本。上方是樹的視角，右側是同一份資料的陣列視角，兩者是同一個東西。黃色是正在比較的兩個節點，藍色是剛交換的。</p>
        <BinaryHeapDemo />
      </Section>

      <Section id="code">
        <p>先手寫一次理解 sift up 與 sift down，實務上直接用 <Code>heapq</Code> 或 <Code>std::priority_queue</Code>。注意 Python 只有最小堆積，C++ 預設是最大堆積。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1046", name: "Last Stone Weight（最大堆積）", diff: "Easy" },
            { src: "LeetCode 703", name: "Kth Largest Element in a Stream", diff: "Easy" },
            { src: "LeetCode 23", name: "Merge k Sorted Lists（堆積存 k 個頭）", diff: "Hard" },
            { src: "LeetCode 621", name: "Task Scheduler", diff: "Medium" },
            { src: "LeetCode 1942", name: "The Number of the Smallest Unoccupied Chair（兩個堆積當計時器）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const binaryHeapLesson: Lesson = { prereq: "Array、Binary Tree Basics", Body };
