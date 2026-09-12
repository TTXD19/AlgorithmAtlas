import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { MergeListsDemo } from "@/components/lesson/demos/MergeListsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `import heapq

# 合併兩條有序串列：dummy + tail，每次接上比較小的那個。O(n + m)
def merge_two(a, b):
    dummy = tail = ListNode(0)
    while a and b:
        if a.val <= b.val:          # 相等時取 a，保持穩定
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b              # 剩下的那段直接接上
    return dummy.next


# 遞迴版：merge(a, b) = 較小的那個節點 + merge(剩下的)
def merge_two_rec(a, b):
    if not a: return b
    if not b: return a
    if a.val <= b.val:
        a.next = merge_two_rec(a.next, b)
        return a
    b.next = merge_two_rec(a, b.next)
    return b


# 合併 k 條：最小堆積存每條的頭，每次取最小的。O(N log k)
def merge_k(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))   # i 避免比較 node
    dummy = tail = ListNode(0)
    while heap:
        _, i, node = heapq.heappop(heap)
        tail.next = tail = node
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next


# 串列版合併排序：快慢指標切半，遞迴排兩半，再合併。O(n log n)、O(log n) 堆疊
def sort_list(head):
    if not head or not head.next:
        return head
    slow, fast = head, head.next
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    right, slow.next = slow.next, None      # 從中間切開
    return merge_two(sort_list(head), sort_list(right))`;

const cpp = `#include <queue>
#include <vector>

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int v, ListNode* n = nullptr) : val(v), next(n) {}
};

// 合併兩條
ListNode* mergeTwo(ListNode* a, ListNode* b) {
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (a && b) {
        if (a->val <= b->val) { tail->next = a; a = a->next; }
        else                  { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    return dummy.next;
}

// 合併 k 條：最小堆積
ListNode* mergeK(std::vector<ListNode*>& lists) {
    auto cmp = [](ListNode* x, ListNode* y) { return x->val > y->val; };
    std::priority_queue<ListNode*, std::vector<ListNode*>, decltype(cmp)> pq(cmp);
    for (ListNode* n : lists) if (n) pq.push(n);
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (!pq.empty()) {
        ListNode* n = pq.top(); pq.pop();
        tail->next = n;
        tail = n;
        if (n->next) pq.push(n->next);
    }
    return dummy.next;
}

// 串列版合併排序
ListNode* sortList(ListNode* head) {
    if (!head || !head->next) return head;
    ListNode *slow = head, *fast = head->next;
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
    ListNode* right = slow->next;
    slow->next = nullptr;
    return mergeTwo(sortList(head), sortList(right));
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "合併多個已排序的日誌檔",
              problem: "每台伺服器的 log 各自依時間排好，要合成一份總的時間序。把全部倒進陣列再排序是 O(N log N)，而且要先讀進記憶體。",
              why: "每條都有序，只要反覆比較各條的「目前最前面那筆」、取最小的。兩條是 O(n + m)，k 條用堆積是 O(N log k)，而且可以串流處理。這是外部排序與 log 聚合系統的核心。",
            },
            {
              title: "合併排序的最後一步",
              problem: "合併排序把資料切成兩半各自排好，最後要「把兩段有序的合成一段」。在串列上做這件事不用額外空間。",
              why: "串列的合併只改指標、不搬資料，所以串列版合併排序是 O(n log n) 時間、O(log n) 空間，比陣列版省。LeetCode 148 Sort List 就是這題。",
            },
            {
              title: "資料庫的 merge join",
              problem: "兩張表都依 join key 排好序，要找出 key 相同的配對。",
              why: "同樣是雙指標同時往前走：誰小誰前進，相等就輸出。和合併串列是同一個骨架，只是「輸出」的動作不同。",
            },
          ]}
          cue="兩條（或 k 條）已排序、合併、取最小的那個、合併排序、dummy + tail、多路歸併。"
        />
      </Section>

      <Section id="concept">
        <p>
          兩條<strong>已排序</strong>的串列要合成一條有序的，只需要一個觀察：<strong>整體最小的一定是兩條的頭之一</strong>。取走比較小的那個頭，剩下的仍然是兩條有序串列，重複同樣的事。這就是合併（merge）。每個節點只被比較一次、接上一次，O(n + m)。
        </p>
        <p>
          寫法上用 <Code>dummy</Code> 節點當結果的起點、<Code>tail</Code> 指向結果的最後一個節點。每一輪把較小的頭接到 <Code>tail.next</Code>、tail 前進、那條串列的頭也前進。其中一條用完時，另一條剩下的部分本來就是接好的，<strong>直接把 tail.next 指過去</strong>，不用再一個一個接。不建新節點，只改指標，額外空間 O(1)。
        </p>
        <p>
          合併 <strong>k 條</strong>時，每輪要在 k 個頭裡挑最小的。用<strong>最小堆積</strong>維護這 k 個頭，取出最小 O(log k)、把它的下一個放回去 O(log k)，總共 O(N log k)。另一種寫法是兩兩合併、像錦標賽一樣分治，複雜度相同。
        </p>
        <p>
          反過來，把合併當作零件就得到<strong>串列版合併排序</strong>：快慢指標找中點切半，遞迴排好兩半，再合併。這是串列排序的標準解，也把前面三篇（快慢指標、遞迴、合併）串在一起。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>建 <Code>dummy</Code>，<Code>tail = dummy</Code>。dummy 讓第一個節點的接法和後面的一樣。</>,
            <><Code>while a and b</Code>：比較 <Code>a.val</Code> 和 <Code>b.val</Code>，把較小的接到 <Code>tail.next</Code>，那條串列的指標前進，<Code>tail = tail.next</Code>。相等時取 a，結果才是穩定的。</>,
            <>迴圈結束後 <Code>tail.next = a or b</Code>，把還沒用完的那條整段接上。</>,
            <>回傳 <Code>dummy.next</Code>，不是 dummy。</>,
            <>k 條時把每條的頭放進最小堆積（Python 要加索引當 tie-breaker），每次 pop 最小的接上，再 push 它的 next。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>逐步看兩條串列怎麼合併：每一步比較兩個頭，較小的接到結果尾端；一條用完後，另一條剩下的整段直接接上。</p>
        <MergeListsDemo />
      </Section>

      <Section id="code">
        <p>迭代版與遞迴版合併兩條、用堆積合併 k 條、以及把合併當零件的串列版合併排序。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 21", name: "Merge Two Sorted Lists", diff: "Easy" },
            { src: "LeetCode 88", name: "Merge Sorted Array（陣列版，從後面往前填）", diff: "Easy" },
            { src: "LeetCode 148", name: "Sort List（串列版合併排序）", diff: "Medium" },
            { src: "LeetCode 23", name: "Merge k Sorted Lists（堆積）", diff: "Hard" },
            { src: "LeetCode 2", name: "Add Two Numbers（雙指標同時走的變形）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const mergeListsLesson: Lesson = { prereq: "Singly Linked List、Fast & Slow Pointers、Recursion", Body };
