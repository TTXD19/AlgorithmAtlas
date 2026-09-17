import { BSTDemo } from "@/components/lesson/demos/BSTDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None


def search(node, key):
    """Every comparison throws away a whole subtree. O(h)"""
    while node and node.key != key:
        node = node.left if key < node.key else node.right
    return node


def insert(node, key):
    """Recursive version: returns the root of this subtree after the insertion"""
    if node is None:
        return Node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    elif key > node.key:
        node.right = insert(node.right, key)
    return node                       # an equal key is not inserted twice


def delete(node, key):
    if node is None:
        return None
    if key < node.key:
        node.left = delete(node.left, key)
    elif key > node.key:
        node.right = delete(node.right, key)
    else:
        # found it, and there are three cases
        if node.left is None:         # 0 or 1 child: splice in the other side
            return node.right
        if node.right is None:
            return node.left
        succ = node.right             # 2 children: take the smallest key on the right (the in-order successor)
        while succ.left:
            succ = succ.left
        node.key = succ.key           # overwrite this node's key with the successor's
        node.right = delete(node.right, succ.key)   # then delete the successor from the right subtree
    return node


def is_valid_bst(node, lo=float("-inf"), hi=float("inf")):
    """Validation: every node must sit inside the bounds its ancestors set. Comparing with the parent is not enough."""
    if node is None:
        return True
    if not (lo < node.key < hi):
        return False
    return is_valid_bst(node.left, lo, node.key) and is_valid_bst(node.right, node.key, hi)


def range_query(node, lo, hi, out):
    """List every key in [lo, hi]: an in-order traversal with pruning"""
    if node is None:
        return
    if lo < node.key:
        range_query(node.left, lo, hi, out)
    if lo <= node.key <= hi:
        out.append(node.key)
    if node.key < hi:
        range_query(node.right, lo, hi, out)`;

const cpp = `#include <climits>
#include <vector>

struct Node {
    int key;
    Node *left = nullptr, *right = nullptr;
    Node(int k) : key(k) {}
};

Node* search(Node* n, int key) {
    while (n && n->key != key) n = key < n->key ? n->left : n->right;
    return n;
}

Node* insert(Node* n, int key) {
    if (!n) return new Node(key);
    if (key < n->key) n->left = insert(n->left, key);
    else if (key > n->key) n->right = insert(n->right, key);
    return n;
}

Node* remove(Node* n, int key) {
    if (!n) return nullptr;
    if (key < n->key) n->left = remove(n->left, key);
    else if (key > n->key) n->right = remove(n->right, key);
    else {
        if (!n->left) { Node* r = n->right; delete n; return r; }
        if (!n->right) { Node* l = n->left; delete n; return l; }
        Node* succ = n->right;
        while (succ->left) succ = succ->left;
        n->key = succ->key;
        n->right = remove(n->right, succ->key);
    }
    return n;
}

bool isValidBST(Node* n, long lo = LONG_MIN, long hi = LONG_MAX) {
    if (!n) return true;
    if (n->key <= lo || n->key >= hi) return false;
    return isValidBST(n->left, lo, n->key) && isValidBST(n->right, n->key, hi);
}`;

export const skeleton: LessonSkeleton = {
  demo: <BSTDemo />,
  code: { python, cpp },
};
