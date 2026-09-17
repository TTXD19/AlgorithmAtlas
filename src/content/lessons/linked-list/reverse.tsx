import { ReverseListDemo } from "@/components/lesson/demos/ReverseListDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Iterative: three pointers, turning one arrow around per node. O(n) time, O(1) space
def reverse(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next          # 1. remember the way forward first
        cur.next = prev         # 2. turn the arrow around
        prev = cur              # 3. advance both pointers
        cur = nxt
    return prev                 # prev ends up on the original last node


# Recursive: trust reverse(head.next) to reverse the rest and hand back the new head,
# then just point the original next node's next back at yourself. O(n) space (the call stack)
def reverse_rec(head):
    if head is None or head.next is None:
        return head
    new_head = reverse_rec(head.next)
    head.next.next = head       # that node is the tail now, so hook it back to me
    head.next = None            # and I become the new tail
    return new_head


# Reverse the range [left, right] (LeetCode 92): head insertion
def reverse_between(head, left, right):
    dummy = ListNode(0, head)
    before = dummy
    for _ in range(left - 1):
        before = before.next    # before stops just ahead of the range
    cur = before.next           # cur never moves; each round lifts the node after it to the front of the range
    for _ in range(right - left):
        moved = cur.next
        cur.next = moved.next
        moved.next = before.next
        before.next = moved
    return dummy.next`;

const cpp = `struct ListNode {
    int val;
    ListNode* next;
    ListNode(int v, ListNode* n = nullptr) : val(v), next(n) {}
};

// Iterative
ListNode* reverse(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* cur = head;
    while (cur) {
        ListNode* nxt = cur->next;
        cur->next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}

// Recursive
ListNode* reverseRec(ListNode* head) {
    if (!head || !head->next) return head;
    ListNode* newHead = reverseRec(head->next);
    head->next->next = head;
    head->next = nullptr;
    return newHead;
}

// Reverse the range [left, right]: head insertion
ListNode* reverseBetween(ListNode* head, int left, int right) {
    ListNode dummy(0, head);
    ListNode* before = &dummy;
    for (int i = 0; i < left - 1; i++) before = before->next;
    ListNode* cur = before->next;
    for (int i = 0; i < right - left; i++) {
        ListNode* moved = cur->next;
        cur->next = moved->next;
        moved->next = before->next;
        before->next = moved;
    }
    return dummy.next;
}`;

export const skeleton: LessonSkeleton = {
  demo: <ReverseListDemo />,
  code: { python, cpp },
};
