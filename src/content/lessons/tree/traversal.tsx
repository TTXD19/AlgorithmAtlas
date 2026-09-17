import { TraversalDemo } from "@/components/lesson/demos/TraversalDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `from collections import deque


# Three depth-first traversals; the only difference is which line visits the node itself
def preorder(node, out):
    if node is None:
        return
    out.append(node.val)          # node
    preorder(node.left, out)      # left
    preorder(node.right, out)     # right

def inorder(node, out):
    if node is None:
        return
    inorder(node.left, out)       # left
    out.append(node.val)          # node
    inorder(node.right, out)      # right

def postorder(node, out):
    if node is None:
        return
    postorder(node.left, out)     # left
    postorder(node.right, out)    # right
    out.append(node.val)          # node


# Level order: use a queue and handle one whole level at a time
def level_order(root):
    if root is None:
        return []
    out = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):   # this pass handles only the current level
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        out.append(level)
    return out


# Iterative inorder: an explicit stack in place of recursion
def inorder_iter(root):
    out, stack, node = [], [], root
    while node or stack:
        while node:                   # go left as far as possible, pushing on the way
            stack.append(node)
            node = node.left
        node = stack.pop()            # no left child left, so visit the node itself
        out.append(node.val)
        node = node.right             # on to the right subtree`;

const cpp = `#include <vector>
#include <stack>
#include <queue>

struct TreeNode { int val; TreeNode *left, *right; };

void preorder(TreeNode* n, std::vector<int>& out) {
    if (!n) return;
    out.push_back(n->val);
    preorder(n->left, out);
    preorder(n->right, out);
}

void inorder(TreeNode* n, std::vector<int>& out) {
    if (!n) return;
    inorder(n->left, out);
    out.push_back(n->val);
    inorder(n->right, out);
}

void postorder(TreeNode* n, std::vector<int>& out) {
    if (!n) return;
    postorder(n->left, out);
    postorder(n->right, out);
    out.push_back(n->val);
}

std::vector<std::vector<int>> levelOrder(TreeNode* root) {
    std::vector<std::vector<int>> out;
    if (!root) return out;
    std::queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int sz = q.size();
        std::vector<int> level;
        for (int i = 0; i < sz; i++) {
            TreeNode* n = q.front(); q.pop();
            level.push_back(n->val);
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
        out.push_back(level);
    }
    return out;
}

std::vector<int> inorderIter(TreeNode* root) {
    std::vector<int> out;
    std::stack<TreeNode*> st;
    TreeNode* n = root;
    while (n || !st.empty()) {
        while (n) { st.push(n); n = n->left; }
        n = st.top(); st.pop();
        out.push_back(n->val);
        n = n->right;
    }
    return out;
}`;

export const skeleton: LessonSkeleton = {
  demo: <TraversalDemo />,
  code: { python, cpp },
};
