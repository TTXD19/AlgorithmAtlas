import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { CircularQueueDemo } from "@/components/lesson/demos/CircularQueueDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from collections import deque

# 用 deque，不要用 list：list.pop(0) 是 O(n)
q = deque()
q.append(1)          # 入隊（尾端）O(1)
q.append(2)
q.popleft()          # 出隊（前端）O(1) → 1
q[0]                 # 看最前面

# deque 兩端都能用，所以也能當堆疊或滑動視窗
d = deque([1, 2, 3])
d.appendleft(0)      # 前端加入
d.pop()              # 尾端移除


# 環狀陣列實作固定容量的佇列（LeetCode 622）
class CircularQueue:
    def __init__(self, k):
        self.buf = [None] * k
        self.cap = k
        self.head = 0        # 最前面的元素
        self.size = 0

    def enqueue(self, x):
        if self.size == self.cap:
            return False
        tail = (self.head + self.size) % self.cap   # 繞回去
        self.buf[tail] = x
        self.size += 1
        return True

    def dequeue(self):
        if self.size == 0:
            return False
        self.head = (self.head + 1) % self.cap      # 不搬元素，只移 head
        self.size -= 1
        return True

    def front(self):
        return -1 if self.size == 0 else self.buf[self.head]


# 用兩個堆疊做佇列（LeetCode 232）：攤銷 O(1)
class QueueWithStacks:
    def __init__(self):
        self.inbox, self.outbox = [], []

    def push(self, x):
        self.inbox.append(x)

    def pop(self):
        if not self.outbox:                  # 只有 outbox 空了才倒
            while self.inbox:
                self.outbox.append(self.inbox.pop())
        return self.outbox.pop()`;

const cpp = `#include <queue>
#include <deque>
#include <vector>
#include <stack>

// std::queue：push 入隊、pop 出隊、front 看最前面
void basics() {
    std::queue<int> q;
    q.push(1);
    q.push(2);
    q.front();   // 1
    q.pop();

    std::deque<int> d = {1, 2, 3};
    d.push_front(0);
    d.pop_back();
}

// 環狀陣列佇列
class CircularQueue {
    std::vector<int> buf;
    int head = 0, size = 0;
public:
    explicit CircularQueue(int k) : buf(k) {}

    bool enqueue(int x) {
        if (size == (int)buf.size()) return false;
        buf[(head + size) % buf.size()] = x;
        size++;
        return true;
    }

    bool dequeue() {
        if (size == 0) return false;
        head = (head + 1) % buf.size();
        size--;
        return true;
    }

    int front() const { return size == 0 ? -1 : buf[head]; }
};

// 兩個堆疊做佇列
class QueueWithStacks {
    std::stack<int> inbox, outbox;
public:
    void push(int x) { inbox.push(x); }
    int pop() {
        if (outbox.empty())
            while (!inbox.empty()) { outbox.push(inbox.top()); inbox.pop(); }
        int v = outbox.top(); outbox.pop();
        return v;
    }
};`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "印表機、訊息佇列、工作排程",
              problem: "多個人同時送列印工作，先送的要先印。Kafka、RabbitMQ 這類系統把訊息排成一列，生產者從尾端放、消費者從前端拿。",
              why: "佇列的「先進先出」就是公平的定義。每個人只能排到隊尾，服務永遠從隊頭開始，不會有人插隊。",
            },
            {
              title: "BFS 為什麼一層一層走",
              problem: "圖的廣度優先搜尋要「先看完距離 1 的，再看距離 2 的」。這個順序怎麼保證？",
              why: "把發現的節點依序放進佇列，永遠先處理最早發現的。先進先出自動維持了「離起點近的先處理」。BFS 那篇的示範就是佇列在動。",
            },
            {
              title: "為什麼 Python 用 list 當佇列會很慢",
              problem: "有人用 list.pop(0) 出隊，資料一多程式就卡住。",
              why: "陣列從前端移除要把所有元素往前搬，O(n)。環狀陣列讓 head 往前走而不搬元素，deque 就是這樣做的（實際上是分段的雙向串列）。知道原因，就知道該換 deque。",
            },
          ]}
          cue="先進先出、排隊、公平處理、一層一層、BFS、生產者消費者、兩端都要操作。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>佇列</strong>從一端進、另一端出：<Code>enqueue</Code> 放到尾端，<Code>dequeue</Code> 從前端拿走。<strong>先進先出</strong>（FIFO），最早放進去的最先被處理。堆疊記住「最近發生的事」，佇列記住「最早發生的事」，兩者是一組對照，也決定了 DFS 和 BFS 的差別。
        </p>
        <p>
          用陣列做佇列有個陷阱：從前端移除要把後面的元素全部往前搬，O(n)。解法是<strong>環狀陣列</strong>：記住 <Code>head</Code> 和 <Code>size</Code>，出隊只把 head 往前移一格，尾端位置用 <Code>(head + size) % 容量</Code> 算，走到底就繞回 0。這樣兩端操作都是 O(1)，而且記憶體連續、快取友善。用鏈結串列也可以，但每個節點多一個指標。
          </p>
        <p>
          <strong>雙端佇列</strong>（deque）兩端都能進出。它同時是堆疊也是佇列，Python 的 <Code>collections.deque</Code>、C++ 的 <Code>std::deque</Code> 都是標準配備。下一章的單調佇列就建立在「尾端能彈出、前端也能彈出」這個能力上。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>需要先進先出時，Python 用 <Code>deque</Code>、C++ 用 <Code>std::queue</Code>。不要用 list 的 <Code>pop(0)</Code>。</>,
            <>自己實作固定容量佇列用<strong>環狀陣列</strong>：記 <Code>head</Code> 和 <Code>size</Code>（不要記 head 和 tail，會分不清空與滿）。</>,
            <><strong>入隊</strong>：<Code>buf[(head + size) % cap] = x</Code>，size 加一。滿了就回傳失敗或擴容。</>,
            <><strong>出隊</strong>：<Code>head = (head + 1) % cap</Code>，size 減一。不搬任何元素。</>,
            <>BFS 的骨架：起點入隊；<Code>while queue</Code>：出隊一個、處理它、把還沒看過的鄰居入隊。要分層就在每一輪記下當時的佇列長度。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>容量 6 的環狀陣列。enqueue 幾次再 dequeue 幾次，看 tail 怎麼繞回陣列前面、head 怎麼往前走而不搬任何元素。</p>
        <CircularQueueDemo />
      </Section>

      <Section id="code">
        <p>內建的 deque / queue 用法、環狀陣列實作、以及用兩個堆疊做出佇列（攤銷分析那篇的例子，這裡給完整程式碼）。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 232", name: "Implement Queue using Stacks", diff: "Easy" },
            { src: "LeetCode 225", name: "Implement Stack using Queues", diff: "Easy" },
            { src: "LeetCode 622", name: "Design Circular Queue", diff: "Medium" },
            { src: "LeetCode 933", name: "Number of Recent Calls（滑動時間窗）", diff: "Easy" },
            { src: "LeetCode 102", name: "Binary Tree Level Order Traversal（用佇列分層）", diff: "Medium" },
            { src: "LeetCode 641", name: "Design Circular Deque", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const queueLesson: Lesson = { prereq: "Array & Dynamic Array、Stack", Body };
