import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion, hash tables",
  applications: [
    {
      title: "Change one spreadsheet cell and the whole workbook recalculates",
      problem:
        "A financial model has 20,000 formula cells. Cells like \"exchange rate\" and \"tax rate\" are referenced by a thousand formulas, and those formulas reference still more formulas. If evaluating a formula recursively recomputed every cell it referenced, a shared cell would be worked out a thousand times over, and stacking dependency chains on top of that makes the total work exponential.",
      why: "A cell's value is fixed by its own formula and the cells it references, and the answer is the same no matter who asks for it — that is an overlapping subproblem. Compute it once, record it on the cell, and every later reference just reads it, so the total work drops to \"number of cells + number of references\". Sort the cells by dependency first and evaluate upward from the ones that reference nothing, and you have tabulation.",
    },
    {
      title: "Transposition tables in game AI",
      problem:
        "Tic-tac-toe has 255,168 complete games from an empty board, and the full search tree holds over 540,000 nodes. But \"top-left then centre\" and \"centre then top-left\" reach the same board, and there are only 5,478 distinct positions.",
      why: "Whether a position is won or lost is fixed by where the pieces are and whose turn it is, not by how the game got there, so you can key a hash table on the position and look the evaluation up the second time you meet it. A chess engine's transposition table is exactly this kind of memoisation — and because there are far too many positions to enumerate, it can only remember the ones actually searched, which is precisely where memoisation beats tabulation.",
    },
    {
      title: "Binomial trees for option pricing",
      problem:
        "Slice the time to expiry into 500 steps where the share price moves up or down by a fixed ratio each step. Walking one path at a time means facing 2⁵⁰⁰ paths, but up-then-down and down-then-up give the same price, so there are only 125,751 distinct nodes.",
      why: "A node's value is fixed by which step it is and how many up moves have happened, and step t depends only on two nodes at step t+1. Filling backwards one layer at a time from the expiry layer (501 prices whose values you can write down directly) is tabulation; each layer only needs the next one, so a single array of length 501 overwritten again and again is enough, and there is no 500-deep recursion to worry about.",
    },
  ],
  cue: "Overlapping subproblems, the same arguments computed many times over, repeated nodes in the recursion tree, how many ways, minimum or maximum, pure functions, @cache, recursion too deep, top-down, bottom-up.",
  steps: [
    'Write the **brute-force recursion** first, and say exactly what the function means: `ways(i)` returns "how many ways there are to reach step i". The arguments are the state, and the base cases go at the very top.',
    "Check two things: the **same arguments show up more than once** in the recursion tree (overlapping subproblems), and the return value **depends on the arguments alone**. Caching is only safe when nothing depends on a global variable or on the path taken to get here.",
    '**Memoisation**: create a dict or array keyed by the state (use −1 for "not computed yet"). Look it up on entry and return straight away on a hit; otherwise run the original recursion and **store the result before returning it**. In Python you can simply add `@cache`.',
    "**Tabulation**: replace the function with an array `dp`, fill in the base cases, then loop in an order that computes every dependency first, applying the same transition to each cell. If `dp[i]` depends on smaller indices, let i run from small to large.",
    "**Space compression**: look at how many cells the transition actually reads. If it only reads the previous k, roll k variables instead and space drops from O(n) to O(1).",
    "Estimate **number of states × cost per transition** to confirm you are inside the time limit. Switch to tabulation when the recursion could run tens of thousands of frames deep; stay with memoisation when the state space is enormous but only a small part of it is ever reached.",
  ],
  demoNote:
    'Computing fib(6), with the tree writing f(n) for fib(n). The whole recursion tree starts faded and lights up in call order as you press "Next": blue is the call in progress, grey is a base case reached for the first time. "Plain recursion" mode takes 25 calls, and the 18 yellow ones are subproblems being recomputed — the entire f(4) and f(3) subtrees get expanded all over again. Switch to "Memoised" and the same problem takes only 11 calls; green marks a cache hit, and the subtree below it is never expanded. The cards under the tree count the calls in each mode, and the small table beside them shows the gap at n = 6, 10, 20 and 30: by n = 30 it is 2,692,537 calls against 59.',
  codeNote:
    'The same fib written four ways — plain recursion, memoisation (a hand-written cache and `@cache`), tabulation, and the two-variable compressed version — so you can see exactly what each step changes; the C++ cache is an array that uses −1 for "not computed yet". Then the stair climb with a choice of step sizes shows the same transformation applied to a transition with several options, and the Python memoised version deliberately puts `@cache` inside the function so that different `steps` never share a cache.',
  problems: [
    { src: "LeetCode 509", name: "Fibonacci Number (write it three times: memoised, tabulated, rolling variables)", diff: "Easy" },
    { src: "LeetCode 70", name: "Climbing Stairs (turn the brute-force recursion into a table)", diff: "Easy" },
    { src: "LeetCode 1137", name: "N-th Tribonacci Number (roll three variables)", diff: "Easy" },
    { src: "LeetCode 377", name: "Combination Sum IV (the generalised stair climb from the code)", diff: "Medium" },
    { src: "LeetCode 2140", name: "Solving Questions With Brainpower (fill the table back to front)", diff: "Medium" },
    { src: "LeetCode 1553", name: "Minimum Number of Days to Eat N Oranges (n up to 2×10⁹, memoisation only)", diff: "Hard" },
  ],
};
