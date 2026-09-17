import { MergeListsDemo } from "@/components/lesson/demos/MergeListsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `import heapq

# Merge two sorted lists: dummy + tail, attaching the smaller head each time. O(n + m)
def merge_two(a, b):
    dummy = tail = ListNode(0)
    while a and b:
        if a.val <= b.val:          # take a on ties, which keeps the merge stable
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b              # attach whatever is left in one go
    return dummy.next


# Recursive version: merge(a, b) = the smaller node + merge(the rest)
def merge_two_rec(a, b):
    if not a: return b
    if not b: return a
    if a.val <= b.val:
        a.next = merge_two_rec(a.next, b)
        return a
    b.next = merge_two_rec(a, b.next)
    return b


# Merge k lists: a min-heap holds every list's head, and the smallest comes off each time. O(N log k)
def merge_k(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))   # i stops the heap comparing nodes
    dummy = tail = ListNode(0)
    while heap:
        _, i, node = heapq.heappop(heap)
        tail.next = tail = node
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next


# Merge sort on a list: fast and slow pointers halve it, each half is sorted recursively, then merged. O(n log n), O(log n) stack
def sort_list(head):
    if not head or not head.next:
        return head
    slow, fast = head, head.next
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    right, slow.next = slow.next, None      # cut it in the middle
    return merge_two(sort_list(head), sort_list(right))`;

const cpp = `#include <queue>
#include <vector>

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int v, ListNode* n = nullptr) : val(v), next(n) {}
};

// Merge two lists
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

// Merge k lists: a min-heap
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

// Merge sort on a list
ListNode* sortList(ListNode* head) {
    if (!head || !head->next) return head;
    ListNode *slow = head, *fast = head->next;
    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }
    ListNode* right = slow->next;
    slow->next = nullptr;
    return mergeTwo(sortList(head), sortList(right));
}`;

export const skeleton: LessonSkeleton = {
  demo: <MergeListsDemo />,
  code: { python, cpp },
};
