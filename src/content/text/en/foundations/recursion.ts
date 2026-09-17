import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Big-O Notation",
  applications: [
    {
      title: "Working out the size of a folder",
      problem: "A folder holds files and subfolders, those subfolders hold files and subfolders of their own, and there is no telling how deep it goes.",
      why: "Recursion only describes the rule for one level: my size = my files + the size of each of my subfolders. And how is a subfolder's size worked out? By the same function. How deep the nesting goes never comes into it.",
    },
    {
      title: "Rendering nested UI components",
      problem: "A comment has replies, and those replies have replies of their own; a menu contains submenus. A React component has to draw that structure.",
      why: "A component that renders itself inside itself is recursion. For any data where a structure contains the same structure, recursion is the most natural thing to write.",
    },
    {
      title: "Half of what comes later is built on it",
      problem: "Tree traversal, DFS, merge sort, quicksort, backtracking, dynamic programming — every one of them is a variation on recursion.",
      why: "Get comfortable with the habit of trusting that a smaller copy of yourself returns the right answer, and all those later algorithms become just another problem to take apart the same way.",
    },
  ],
  cue: "A structure that contains the same structure, no telling how many levels deep, shrinking the problem a little turns it into the same problem, tree-shaped data.",
  steps: [
    "Define what the function **means**: `factorial(n)` returns n factorial. State the meaning clearly, because that is what you will later be trusting.",
    "Write the **base case**: the smallest situation, the one you can answer outright. `n == 1` returns 1. With no base case the recursion never ends.",
    "Write the **recursive case**: assume `factorial(n - 1)` is already correct, and then `factorial(n)` is just `n * factorial(n - 1)`.",
    "Check that every recursive call **moves toward the base case** (n gets smaller, the list gets shorter, the tree goes one level down), or it will never stop.",
    "Estimate the **depth**: factorial recurses n deep, anything that halves recurses log n deep. When the depth gets too large, switch to iteration or an explicit stack.",
  ],
  demoNote:
    "Step through factorial(4). On the left is the line currently executing; on the right is the call stack, pushing one frame at a time on the way down and returning one answer at a time once the base case is reached.",
  codeNote:
    "The three examples cover the three shapes recursion takes — a number shrinking, a list getting shorter, and a tree going one level down — with the iterative version at the end for comparison.",
  problems: [
    { src: "LeetCode 344", name: "Reverse String (do it recursively)", diff: "Easy" },
    { src: "LeetCode 509", name: "Fibonacci Number", diff: "Easy" },
    { src: "LeetCode 206", name: "Reverse Linked List (the recursive version)", diff: "Easy" },
    { src: "LeetCode 70", name: "Climbing Stairs (write the recursion first, and feel why it is slow)", diff: "Easy" },
    { src: "LeetCode 779", name: "K-th Symbol in Grammar", diff: "Medium" },
  ],
};
