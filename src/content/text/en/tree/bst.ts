import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Binary tree basics, traversal, binary search",
  applications: [
    {
      title: "Fast lookups that also stay in order",
      problem:
        "A hash table looks a key up in O(1), but ask it \"what is the smallest key above 50?\" or \"which keys lie between 30 and 70?\" and it has no answer. A sorted array answers both, but every insert shifts elements, O(n).",
      why: "A BST gives you both: search, insert and delete are all O(h), and an in-order traversal is the sorted sequence, so range queries and predecessor/successor fall out naturally. Java's TreeMap, C++'s std::map and Redis sorted sets all belong to this family.",
    },
    {
      title: "The prototype of a database index",
      problem:
        "A database has to find WHERE age BETWEEN 30 AND 40 across tens of millions of rows, and still accept new rows at any moment.",
      why: "An index is a search tree at heart. The B-tree actually used is the multiway version of a BST, sized so each node fills one disk block, but \"smaller to the left, larger to the right, in-order is sorted\" is exactly the same idea.",
    },
    {
      title: 'Why "compare with the parent" is wrong',
      problem:
        "Asked to check whether a tree is a BST, plenty of people verify only that each node is larger than its left child and smaller than its right — and then get caught out by a node buried deep in the tree.",
      why: "The rule is that the entire left subtree is smaller, not just the left child. The correct approach carries the bounds set by the ancestors all the way down. It is the single best exercise for understanding the definition.",
    },
  ],
  cue: "Ordered sets, range queries, predecessor and successor, the k-th smallest, needing inserts and lookups together, in-order gives sorted output.",
  steps: [
    "**Search and insert**: start at the root and go left when the target is smaller than the node, right when it is larger. A search returns on equality and reports absence when it reaches an empty spot; an insert puts the new node in that empty spot.",
    "**Delete**: find the node first. With 0 or 1 child, replace it with that child (or with nothing).",
    "With 2 children: walk into the right subtree and keep going left to reach the successor, copy the successor's value into this node, then recursively delete the successor from the right subtree (it has at most a right child, so it falls into the previous case).",
    "**Validation**: recurse downward carrying a (lo, hi) range, replacing hi with the node's own key on the way left and lo on the way right. Every node must fall strictly inside its range.",
    '**Range query and k-th smallest**: use an in-order traversal, pruned by "once the value is below lo do not go left, once it is above hi do not go right", or stop as soon as the count reaches k.',
  ],
  demoNote:
    "Seven values are inserted in turn to build the tree, then one key that exists and one that does not are searched for, then 45 is inserted, and finally 30 — a node with two children — is deleted, so you can watch the successor 40 move up into its place.",
  codeNote:
    'The three basic operations, search, insert and delete, plus the two things interviewers ask for most: validation and range queries. Writing delete recursively as "return the new root of this subtree" means the parent never needs a special case.',
  problems: [
    { src: "LeetCode 700", name: "Search in a Binary Search Tree", diff: "Easy" },
    { src: "LeetCode 701", name: "Insert into a Binary Search Tree", diff: "Medium" },
    { src: "LeetCode 450", name: "Delete Node in a BST", diff: "Medium" },
    { src: "LeetCode 98", name: "Validate Binary Search Tree", diff: "Medium" },
    { src: "LeetCode 230", name: "Kth Smallest Element in a BST", diff: "Medium" },
    { src: "LeetCode 235", name: "Lowest Common Ancestor of a BST", diff: "Medium" },
    { src: "LeetCode 108", name: "Convert Sorted Array to BST (build a balanced one)", diff: "Easy" },
  ],
};
