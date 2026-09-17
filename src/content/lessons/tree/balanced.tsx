import { BalancedDemo } from "@/components/lesson/demos/BalancedDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `# AVL tree: no node's two subtrees differ in height by more than 1. Only insertion is implemented; the point is the rotations.
class Node:
    def __init__(self, key):
        self.key = key
        self.left = self.right = None
        self.height = 1                      # a leaf counts as height 1, which keeps the arithmetic simple


def h(n):
    return n.height if n else 0

def update(n):
    n.height = 1 + max(h(n.left), h(n.right))

def balance(n):
    return h(n.left) - h(n.right)            # positive means the left side is heavier


def rotate_right(y):
    #      y                x
    #     / \\              / \\
    #    x   C    -->     A   y
    #   / \\                  / \\
    #  A   B                B   C
    x = y.left
    y.left = x.right
    x.right = y
    update(y); update(x)                     # update y below first, then x above it
    return x

def rotate_left(x):
    y = x.right
    x.right = y.left
    y.left = x
    update(x); update(y)
    return y


def insert(n, key):
    if n is None:
        return Node(key)
    if key < n.key:
        n.left = insert(n.left, key)
    else:
        n.right = insert(n.right, key)
    update(n)
    b = balance(n)
    if b > 1:                                # left side too heavy
        if key > n.left.key:                 # it landed on the right of the left child (LR): rotate the left child left
            n.left = rotate_left(n.left)
        return rotate_right(n)               # then rotate this node right (LL)
    if b < -1:                               # right side too heavy
        if key < n.right.key:                # RL: rotate the right child right first
            n.right = rotate_right(n.right)
        return rotate_left(n)                # RR
    return n


# In practice, reach for the balanced tree your language ships with instead of writing one:
# Python has none built in, so sortedcontainers.SortedList is the usual choice;
# Java has TreeMap / TreeSet; C++ has std::map / std::set (red-black trees).`;

const cpp = `#include <algorithm>
#include <map>
#include <set>

// AVL insertion
struct Node {
    int key, height = 1;
    Node *left = nullptr, *right = nullptr;
    Node(int k) : key(k) {}
};

int h(Node* n) { return n ? n->height : 0; }
void update(Node* n) { n->height = 1 + std::max(h(n->left), h(n->right)); }
int balance(Node* n) { return h(n->left) - h(n->right); }

Node* rotateRight(Node* y) {
    Node* x = y->left;
    y->left = x->right;
    x->right = y;
    update(y); update(x);
    return x;
}
Node* rotateLeft(Node* x) {
    Node* y = x->right;
    x->right = y->left;
    y->left = x;
    update(x); update(y);
    return y;
}

Node* insert(Node* n, int key) {
    if (!n) return new Node(key);
    if (key < n->key) n->left = insert(n->left, key);
    else n->right = insert(n->right, key);
    update(n);
    int b = balance(n);
    if (b > 1) {
        if (key > n->left->key) n->left = rotateLeft(n->left);   // LR
        return rotateRight(n);                                     // LL
    }
    if (b < -1) {
        if (key < n->right->key) n->right = rotateRight(n->right); // RL
        return rotateLeft(n);                                      // RR
    }
    return n;
}

// In practice: std::map / std::set are red-black trees underneath, so insert, lookup and delete are all guaranteed O(log n)
std::set<int> s;                 // s.insert(5); s.lower_bound(3); s.erase(5);
std::map<int, int> m;            // m[3] = 7; auto it = m.upper_bound(3);`;

export const skeleton: LessonSkeleton = {
  demo: <BalancedDemo />,
  code: { python, cpp },
};
