import { FastSlowDemo } from "@/components/lesson/demos/FastSlowDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Find the middle: fast moves two steps, slow moves one, so slow is halfway when fast runs out
def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow            # on an even-length list this is the second middle node


# Cycle detection (Floyd): if there is a cycle, fast is bound to catch slow
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False


# Find where the cycle starts: after they meet, send one pointer back to head and step both one at a time
def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            slow = head
            while slow is not fast:
                slow = slow.next
                fast = fast.next
            return slow
    return None


# The kth node from the end: fast goes k steps ahead, then both move until fast runs out
def kth_from_end(head, k):
    slow = fast = head
    for _ in range(k):
        fast = fast.next
    while fast:
        slow = slow.next
        fast = fast.next
    return slow`;

const cpp = `struct ListNode {
    int val;
    ListNode* next;
};

ListNode* middle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}

bool hasCycle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}

ListNode* cycleStart(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {
            slow = head;
            while (slow != fast) {
                slow = slow->next;
                fast = fast->next;
            }
            return slow;
        }
    }
    return nullptr;
}

ListNode* kthFromEnd(ListNode* head, int k) {
    ListNode *slow = head, *fast = head;
    for (int i = 0; i < k; i++) fast = fast->next;
    while (fast) {
        slow = slow->next;
        fast = fast->next;
    }
    return slow;
}`;

export const skeleton: LessonSkeleton = {
  demo: <FastSlowDemo />,
  code: { python, cpp },
};
