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
  quiz: [
    {
      q: "A recursive function has no base case. What happens when it runs?",
      choices: ["It returns 0", "It returns the right answer immediately", "It recurses forever until the stack overflows", "It fails to compile"],
      answer: 2,
      why: "With no smallest case that can be answered directly, every call makes another call, and the call stack grows until it overflows.",
    },
    {
      q: "`factorial(n)` recurses to depth n. Its space complexity is at least?",
      choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answer: 2,
      why: "Every level holds a record on the call stack, so depth n means O(n) space even though the function allocates no arrays.",
    },
    {
      q: "When writing the recursive case, what does the 'recursive leap of faith' ask you to do?",
      choices: ["Trace the value of every call level by level", "Trust that the recursive call returns the right answer and only check that this level uses it correctly", "Convert the recursion to a loop first", "Print the arguments on every call"],
      answer: 1,
      why: "It is induction in code: assume the smaller problem is solved and only assemble the bigger answer from it.",
    },
    {
      q: "Which recursive call does **not** move toward the base case?",
      choices: ["`sum(arr[1:])` on a shorter list", "`fib(n - 1) + fib(n - 2)`", "`dfs(node.left)` down a subtree", "`solve(n)` calling `solve(n)` with the same n"],
      answer: 3,
      why: "The argument never changes, so the problem never shrinks and the base case is never reached. The other three shrink a list, a number and a tree.",
    },
  ],
};
