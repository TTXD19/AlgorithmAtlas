import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion",
  applications: [
    {
      title: "Folders, the DOM and JSON are all trees",
      problem:
        "Folders contain folders, HTML tags contain tags, JSON objects contain objects. None of these has a fixed depth, and an array index cannot express which thing sits inside which.",
      why: "A tree is the most natural way to express hierarchy. Learn the vocabulary — depth, height, leaf, subtree — on the simplest tree there is, the binary one, and every other tree-shaped structure you meet afterwards is described in the same language.",
    },
    {
      title: "Why a heap can live in an array",
      problem:
        "The heap from the previous topic is stored in an array, where the children of index i are at 2i+1 and 2i+2. Where does that relation come from?",
      why: "It is a property of complete binary trees: every level is filled before the next one starts, left to right, so level-order numbering leaves no gaps. Once you see that, you also see why an arbitrary tree cannot be stored this way.",
    },
    {
      title: "Every tree question in an interview starts here",
      problem:
        "Find the height, count the nodes, decide whether it is balanced, locate the deepest leaf — dozens of LeetCode problems share one shape.",
      why: "All of them are \"recurse into the left and right subtrees, then combine the two results into your own answer\". Drill that pattern here, and traversals, BSTs and tree DP later on are all extensions of it.",
    },
  ],
  cue: "Hierarchy, nesting, parent and child, depth, height, leaves, left and right subtrees, complete binary trees.",
  steps: [
    "For any tree problem, ask first: **what is the answer for an empty tree**? Height is −1, size is 0, sum is 0. That is the recursion's base case.",
    "Now assume the left and right subtrees have already been solved (call them L and R): **how do L, R and this node's own value combine into your answer**? Height is 1 + max(L, R), size is 1 + L + R.",
    "Write it as a function: handle the empty tree, recurse left and right, combine. Those three lines are the skeleton of almost every tree problem.",
    "Work out the complexity: every node is visited exactly once, so O(n) time, and the recursion depth equals the tree's height, so O(h) space.",
    "To build a tree for testing, use a level-order array with `2i + 1` and `2i + 2` — that is also LeetCode's input format.",
  ],
  demoNote:
    "Click any node to see its depth, height and subtree size on the right. The array underneath highlights where it sits in the level-order representation, and how the parent and child indices are computed.",
  codeNote:
    "The node definition, the three most basic recursive functions, and how to build a tree from a level-order array. Note that the base case for height is −1, which is what makes a leaf's height 0.",
  problems: [
    { src: "LeetCode 104", name: "Maximum Depth of Binary Tree", diff: "Easy" },
    { src: "LeetCode 222", name: "Count Complete Tree Nodes (exploit the complete-tree property for O(log² n))", diff: "Easy" },
    { src: "LeetCode 110", name: "Balanced Binary Tree", diff: "Easy" },
    { src: "LeetCode 543", name: "Diameter of Binary Tree", diff: "Easy" },
    { src: "LeetCode 226", name: "Invert Binary Tree", diff: "Easy" },
    { src: "LeetCode 100", name: "Same Tree", diff: "Easy" },
  ],
};
