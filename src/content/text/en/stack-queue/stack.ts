import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Arrays and dynamic arrays",
  applications: [
    {
      title: "Bracket checking and Ctrl+Z in an editor",
      problem:
        "Brackets in code have to come in pairs, and the most recently opened one must be the first to close. Undo works the same way: the last action taken is the first one reversed.",
      why: "A stack only lets things in and out at one end, which makes it last-in, first-out by construction. Push on an opening bracket, pop and compare on a closing one; push every action, pop on undo. The structure itself states the rule.",
    },
    {
      title: "How a function call remembers where to return",
      problem:
        "A calls B, B calls C. When C finishes, which line of B does it return to, and when B finishes, which line of A? With recursion the same function may be dozens of levels deep.",
      why: "The call stack: every call pushes a frame, every return pops one. The call stack you met in the recursion lesson is exactly this structure. DFS using a stack while BFS uses a queue is the same idea again.",
    },
    {
      title: "How a calculator works out 3 + 4 × 2",
      problem:
        "Expressions have precedence and parentheses, so evaluating strictly left to right gives the wrong answer. Compilers, spreadsheets and calculators all have to get this right.",
      why: "Convert the expression to postfix (reverse Polish) notation and a single stack evaluates it left to right in one pass: push numbers, and on an operator pop two, compute, and push the result back.",
    },
  ],
  cue: "Last in first out, the most recent one first, matching pairs, undo, nested structure, evaluating expressions, the iterative form of DFS.",
  steps: [
    "Check whether the problem has a **most recent one first** structure: nesting, pairing, backtracking, or needing to remember the path you took.",
    "Decide **what goes on the stack**: characters, indices, or a (value, extra information) pair. Storing indices is usually more flexible than storing values.",
    "Scan the input left to right. Push on an \"open\"; on a \"close\", first check that the **stack is not empty**, then compare against the top and pop.",
    "After the scan, check that the stack is **empty**: anything left over usually means something was never closed.",
    "Verify with three inputs: empty input, closes with no opens, and opens with no closes.",
  ],
  demoNote:
    "Pick a string and step through the bracket matching: opening brackets are pushed, closing ones are compared against the top and popped. Note which step catches each of the three invalid cases.",
  codeNote:
    "The basic operations, bracket matching, evaluating postfix notation, and a Min Stack that stores one extra minimum per level. In C++, remember that `pop()` returns nothing, so read `top()` first.",
  problems: [
    { src: "LeetCode 20", name: "Valid Parentheses", diff: "Easy" },
    { src: "LeetCode 155", name: "Min Stack", diff: "Medium" },
    { src: "LeetCode 150", name: "Evaluate Reverse Polish Notation", diff: "Medium" },
    { src: "LeetCode 71", name: "Simplify Path", diff: "Medium" },
    { src: "LeetCode 394", name: "Decode String (nested)", diff: "Medium" },
    { src: "LeetCode 224", name: "Basic Calculator", diff: "Hard" },
  ],
};
