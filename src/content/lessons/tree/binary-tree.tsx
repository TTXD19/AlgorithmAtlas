import { TreeBasicsDemo } from "@/components/lesson/demos/TreeBasicsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def height(node):
    """Height: the longest edge count going down from this node. An empty tree is -1, a leaf is 0."""
    if node is None:
        return -1
    return 1 + max(height(node.left), height(node.right))


def size(node):
    """Subtree size: the number of nodes, counting this one."""
    if node is None:
        return 0
    return 1 + size(node.left) + size(node.right)


def is_leaf(node):
    return node.left is None and node.right is None


def from_level_order(values):
    """Build a tree from a level-order array (None is an empty slot), the LeetCode input format."""
    if not values:
        return None
    nodes = [TreeNode(v) if v is not None else None for v in values]
    for i, node in enumerate(nodes):
        if node is None:
            continue
        l, r = 2 * i + 1, 2 * i + 2      # the index relation of a complete binary tree
        if l < len(nodes):
            node.left = nodes[l]
        if r < len(nodes):
            node.right = nodes[r]
    return nodes[0]


root = from_level_order([1, 2, 3, 4, 5, 6, 7])
print(height(root), size(root))   # 2 7`;

const cpp = `#include <algorithm>
#include <vector>

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

// Height: an empty tree is -1, a leaf is 0
int height(TreeNode* n) {
    if (!n) return -1;
    return 1 + std::max(height(n->left), height(n->right));
}

int size(TreeNode* n) {
    if (!n) return 0;
    return 1 + size(n->left) + size(n->right);
}

bool isLeaf(TreeNode* n) { return n && !n->left && !n->right; }

// Build a tree from a level-order array, where -1 is an empty slot
TreeNode* fromLevelOrder(const std::vector<int>& vals) {
    if (vals.empty()) return nullptr;
    std::vector<TreeNode*> nodes;
    for (int v : vals) nodes.push_back(v == -1 ? nullptr : new TreeNode(v));
    for (size_t i = 0; i < nodes.size(); i++) {
        if (!nodes[i]) continue;
        size_t l = 2 * i + 1, r = 2 * i + 2;
        if (l < nodes.size()) nodes[i]->left = nodes[l];
        if (r < nodes.size()) nodes[i]->right = nodes[r];
    }
    return nodes[0];
}`;

export const skeleton: LessonSkeleton = {
  demo: <TreeBasicsDemo />,
  code: { python, cpp },
};
