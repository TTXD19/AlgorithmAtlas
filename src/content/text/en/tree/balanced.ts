import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "BST",
  applications: [
    {
      title: "Inserting already-sorted data in order",
      problem:
        "You insert users into a BST in registration order, and the IDs increase as you go. The tree degenerates into a chain and every lookup costs O(n), which is no better than not building a tree at all.",
      why: "A balanced tree checks the two subtree heights after every insert or delete and rotates to fix any imbalance, which keeps the height at O(log n) whatever order the input arrives in.",
    },
    {
      title: "What std::map, TreeMap and Redis sorted sets run on",
      problem:
        "These ordered maps have to guarantee O(log n) even in the worst case; no particular input may be allowed to push them to O(n).",
      why: "They use red-black trees, a slightly looser kind of balanced tree that needs fewer rotations than AVL. You will not write one yourself, but you should know why they can guarantee the bound, and when to pick one over a hash table.",
    },
    {
      title: "Database indexes: the B-tree",
      problem:
        "An index lives on disk, so reading one node costs one disk I/O, and the log₂ n levels of a binary tree are far too many.",
      why: "A B-tree is the multiway version of a balanced tree: a few hundred keys per node brings the height down to three or four levels. The balancing idea is identical, with \"binary\" swapped for \"multiway\" to fit the disk block.",
    },
  ],
  cue: "O(log n) even in the worst case, input that may already be sorted, ordered maps, std::map, TreeMap, rotations, AVL, red-black trees, B-trees.",
  steps: [
    "Do the ordinary BST insert, and as the recursion returns through each ancestor, **update its height** and compute the height difference b between its two subtrees.",
    "If b lies within [−1, 1] nothing is wrong, so return the node unchanged.",
    "b > 1 (left-heavy): if the new key landed on the right of the left child (LR), **rotate the left child left** first; then **rotate this node right** and return the new root.",
    "b < −1 (right-heavy): if the new key landed on the left of the right child (RL), **rotate the right child right** first; then **rotate this node left**.",
    "After a rotation, remember to update the heights of the two nodes involved, the lower one before the upper one. In practice, use the standard library unless an interviewer asks for more.",
  ],
  demoNote:
    "Inserting 1 through 7 in order, the worst possible input for a BST. The plain BST on the left grows into a chain, while the AVL tree on the right rotates every time it goes out of balance. The b under each node is the difference between its subtree heights.",
  codeNote:
    "Only AVL insertion is implemented; what matters is the two rotation functions and how the four cases are told apart. The end notes which standard-library container to reach for in practice.",
  problems: [
    { src: "LeetCode 110", name: "Balanced Binary Tree (check whether it is balanced)", diff: "Easy" },
    { src: "LeetCode 1382", name: "Balance a Binary Search Tree (flatten in order, then rebuild)", diff: "Medium" },
    { src: "LeetCode 108", name: "Convert Sorted Array to Binary Search Tree", diff: "Easy" },
    { src: "LeetCode 729", name: "My Calendar I (use an ordered map to find the neighbouring intervals)", diff: "Medium" },
    { src: "LeetCode 220", name: "Contains Duplicate III (window queries on an ordered set)", diff: "Hard" },
  ],
};
