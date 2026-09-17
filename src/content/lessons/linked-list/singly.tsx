import { SinglyListDemo } from "@/components/lesson/demos/SinglyListDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next          # points at the next node; None on the last one


class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def push_front(self, val):            # O(1)
        self.head = Node(val, self.head)  # the new node's next points at the old head
        self.size += 1

    def push_back(self, val):             # O(n): with no tail pointer you have to walk to the end
        node = Node(val)
        if self.head is None:
            self.head = node
        else:
            cur = self.head
            while cur.next:
                cur = cur.next
            cur.next = node
        self.size += 1

    def get(self, index):                 # O(n): one node at a time is the only way
        cur = self.head
        for _ in range(index):
            cur = cur.next
        return cur.val

    def insert_after(self, node, val):    # O(1): given that you already hold the node
        node.next = Node(val, node.next)
        self.size += 1

    def remove_after(self, node):         # O(1): skip over the next node
        if node.next:
            node.next = node.next.next
            self.size -= 1

    def find(self, val):                  # O(n)
        cur = self.head
        while cur and cur.val != val:
            cur = cur.next
        return cur


# A sentinel (dummy) node removes the special case for "delete the head"
def remove_all(head, val):
    dummy = Node(0, head)
    cur = dummy
    while cur.next:
        if cur.next.val == val:
            cur.next = cur.next.next      # skip it
        else:
            cur = cur.next
    return dummy.next`;

const cpp = `struct Node {
    int val;
    Node* next;
    Node(int v, Node* n = nullptr) : val(v), next(n) {}
};

class LinkedList {
    Node* head = nullptr;
    int size = 0;
public:
    void pushFront(int val) {                 // O(1)
        head = new Node(val, head);
        size++;
    }

    void pushBack(int val) {                  // O(n)
        Node* node = new Node(val);
        if (!head) { head = node; }
        else {
            Node* cur = head;
            while (cur->next) cur = cur->next;
            cur->next = node;
        }
        size++;
    }

    int get(int index) const {                // O(n)
        Node* cur = head;
        for (int i = 0; i < index; i++) cur = cur->next;
        return cur->val;
    }

    void insertAfter(Node* node, int val) {   // O(1)
        node->next = new Node(val, node->next);
        size++;
    }

    void removeAfter(Node* node) {            // O(1)
        if (!node->next) return;
        Node* gone = node->next;
        node->next = gone->next;
        delete gone;                          // C++ makes you free it yourself
        size--;
    }

    Node* find(int val) const {               // O(n)
        Node* cur = head;
        while (cur && cur->val != val) cur = cur->next;
        return cur;
    }
};

// Sentinel node: delete every node equal to val, with no special case when the head goes
Node* removeAll(Node* head, int val) {
    Node dummy(0, head);
    Node* cur = &dummy;
    while (cur->next) {
        if (cur->next->val == val) {
            Node* gone = cur->next;
            cur->next = gone->next;
            delete gone;
        } else {
            cur = cur->next;
        }
    }
    return dummy.next;
}`;

export const skeleton: LessonSkeleton = {
  demo: <SinglyListDemo />,
  code: { python, cpp },
};
