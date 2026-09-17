import { CircularQueueDemo } from "@/components/lesson/demos/CircularQueueDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `from collections import deque

# Use deque, not list: list.pop(0) is O(n)
q = deque()
q.append(1)          # enqueue at the back, O(1)
q.append(2)
q.popleft()          # dequeue from the front, O(1) -> 1
q[0]                 # peek at the front

# A deque works at both ends, so it also serves as a stack or a sliding window
d = deque([1, 2, 3])
d.appendleft(0)      # push at the front
d.pop()              # remove from the back


# A fixed-capacity queue on a circular array (LeetCode 622)
class CircularQueue:
    def __init__(self, k):
        self.buf = [None] * k
        self.cap = k
        self.head = 0        # index of the front element
        self.size = 0

    def enqueue(self, x):
        if self.size == self.cap:
            return False
        tail = (self.head + self.size) % self.cap   # wraps around
        self.buf[tail] = x
        self.size += 1
        return True

    def dequeue(self):
        if self.size == 0:
            return False
        self.head = (self.head + 1) % self.cap      # nothing moves, head just advances
        self.size -= 1
        return True

    def front(self):
        return -1 if self.size == 0 else self.buf[self.head]


# A queue built from two stacks (LeetCode 232): amortised O(1)
class QueueWithStacks:
    def __init__(self):
        self.inbox, self.outbox = [], []

    def push(self, x):
        self.inbox.append(x)

    def pop(self):
        if not self.outbox:                  # only pour across once outbox is empty
            while self.inbox:
                self.outbox.append(self.inbox.pop())
        return self.outbox.pop()`;

const cpp = `#include <queue>
#include <deque>
#include <vector>
#include <stack>

// std::queue: push to enqueue, pop to dequeue, front to peek
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

// A queue on a circular array
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

// A queue built from two stacks
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

export const skeleton: LessonSkeleton = {
  demo: <CircularQueueDemo />,
  code: { python, cpp },
};
