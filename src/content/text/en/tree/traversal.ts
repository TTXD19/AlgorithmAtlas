import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Binary tree basics, queues, stacks",
  applications: [
    {
      title: "Working out a folder's size needs postorder",
      problem:
        "To know how large a folder is, you first need the size of every subfolder inside it. In other words, the children have to be finished before the node itself can be.",
      why: "That is exactly what postorder does. Deleting an entire tree, summing a subtree, checking whether a subtree is balanced — anything whose answer is assembled out of its subtrees is postorder.",
    },
    {
      title: "Serialising or copying a tree needs preorder",
      problem:
        "Save a tree as a string, send it to another machine, and rebuild the same tree there. Or simply make a copy of a tree.",
      why: "Preorder records the node before descending, so the first value you read back is the root and you can build as you read. Add a marker for empty children and a single preorder sequence rebuilds the whole tree uniquely.",
    },
    {
      title: "Inorder on a BST is already sorted",
      problem:
        "In a binary search tree, left < node < right, and you want every value listed from smallest to largest.",
      why: "Left, then the node, then right is precisely ascending order. Validating that a tree is a BST, finding the kth smallest value, and spotting two nodes that were swapped all rely on inorder.",
    },
    {
      title: "Printing an org chart level by level needs level order",
      problem:
        "A company org chart has to print by rank: all the VPs first, then all the managers. Or you want the node nearest the root that matches something.",
      why: "Level order uses a queue rather than recursion, so every node on one level is processed before any node on the next. It is BFS on a tree.",
    },
  ],
  cue: "Children before the node or the node first, listing values in ascending order, printing level by level, serialisation, BFS or DFS on a tree.",
  steps: [
    "Choose the order: **preorder** when the answer is carried downwards, **postorder** when it is assembled upwards, **inorder** when a BST has to come out sorted, and **level order** when you work one level at a time.",
    "Recursive version: `if node is None: return`, then place the line that visits the node before, between, or after the two recursive calls.",
    "Level-order version: push the root onto the queue; each pass pops a node, handles it, and pushes its children onto the back. To group by level, record the queue's length at the start of every pass.",
    "When you need an iterative version, simulate it with a stack: preorder is the easiest (push the right child, then the left); inorder uses the go-left-as-far-as-possible pattern; postorder can be a node-right-left preorder that you reverse at the end.",
    "Check the complexity: every node goes in and out once, so O(n); the extra space is the height of the tree (DFS) or the widest level (BFS).",
  ],
  demoNote:
    "Switch between the four traversals and step through the visiting order. The three depth-first ones show the call stack, and level order shows the queue. This tree's inorder happens to be 1 through 7, because it is a BST.",
  codeNote:
    "The three depth-first functions sit side by side, with only one line in a different place. Level order uses a queue and groups its output by level, and the last function is the iterative inorder.",
  problems: [
    { src: "LeetCode 94", name: "Binary Tree Inorder Traversal (write it once recursively and once iteratively)", diff: "Easy" },
    { src: "LeetCode 102", name: "Binary Tree Level Order Traversal", diff: "Medium" },
    { src: "LeetCode 199", name: "Binary Tree Right Side View (level order, taking the last node of each level)", diff: "Medium" },
    { src: "LeetCode 105", name: "Construct Binary Tree from Preorder and Inorder", diff: "Medium" },
    { src: "LeetCode 297", name: "Serialize and Deserialize Binary Tree", diff: "Hard" },
    { src: "LeetCode 236", name: "Lowest Common Ancestor (postorder thinking)", diff: "Medium" },
  ],
};
