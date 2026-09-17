import { LRUCacheDemo } from "@/components/lesson/demos/LRUCacheDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `class Node:
    def __init__(self, key=None, val=None):
        self.key, self.val = key, val
        self.prev = self.next = None


class LRUCache:
    """A doubly linked list holds the usage order (most recent at the head); a hash table finds a node in O(1)."""

    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}                      # key → Node
        self.head, self.tail = Node(), Node()   # two sentinels
        self.head.next, self.tail.prev = self.tail, self.head

    # --- the two O(1) list operations ---
    def _unlink(self, node):
        node.prev.next = node.next         # having prev is what makes unlinking yourself O(1)
        node.next.prev = node.prev

    def _push_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    # --- public interface ---
    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._unlink(node)                 # move to the front = just used
        self._push_front(node)
        return node.val

    def put(self, key, val):
        if key in self.map:
            node = self.map[key]
            node.val = val
            self._unlink(node)
            self._push_front(node)
            return
        if len(self.map) == self.cap:
            lru = self.tail.prev           # the least recently used sits at the tail
            self._unlink(lru)
            del self.map[lru.key]
        node = Node(key, val)
        self._push_front(node)
        self.map[key] = node


# Python's built-in deque and OrderedDict are doubly linked lists underneath
from collections import deque, OrderedDict
d = deque([1, 2, 3])
d.appendleft(0)      # O(1)
d.pop()              # O(1)`;

const cpp = `#include <list>
#include <unordered_map>

// std::list is a doubly linked list; keeping its iterators in an unordered_map makes unlinking O(1)
class LRUCache {
    int cap;
    std::list<std::pair<int, int>> order;                    // front = most recently used
    std::unordered_map<int, std::list<std::pair<int, int>>::iterator> map;

public:
    explicit LRUCache(int capacity) : cap(capacity) {}

    int get(int key) {
        auto it = map.find(key);
        if (it == map.end()) return -1;
        order.splice(order.begin(), order, it->second);     // O(1) move to the front
        return it->second->second;
    }

    void put(int key, int val) {
        auto it = map.find(key);
        if (it != map.end()) {
            it->second->second = val;
            order.splice(order.begin(), order, it->second);
            return;
        }
        if ((int)order.size() == cap) {
            map.erase(order.back().first);                  // evict the least recently used
            order.pop_back();
        }
        order.push_front({key, val});
        map[key] = order.begin();
    }
};

// The two core operations, with hand-written nodes
struct Node {
    int key, val;
    Node *prev = nullptr, *next = nullptr;
};

void unlink(Node* n) {              // O(1), because prev is known
    n->prev->next = n->next;
    n->next->prev = n->prev;
}

void pushFront(Node* head, Node* n) {   // head is the sentinel
    n->next = head->next;
    n->prev = head;
    head->next->prev = n;
    head->next = n;
}`;

export const skeleton: LessonSkeleton = {
  demo: <LRUCacheDemo />,
  code: { python, cpp },
};
