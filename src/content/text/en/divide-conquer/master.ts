import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion, Big-O notation",
  applications: [
    {
      title: "Why cutting the problem in half makes it faster",
      problem:
        "Sorting n items by comparing every pair takes n² comparisons. People say \"split it in half, sort each half, then merge\" is much faster. But each half has to be split again recursively, and the merge itself costs n. Where does the speedup come from, and how big is it?",
      why: "Write it as the recurrence T(n) = 2T(n/2) + n and the master theorem hands you n log n directly. It also shows you why: the merging work on any one level adds up to exactly n, and there are only log n levels. No need to draw the recursion tree by hand every time.",
    },
    {
      title: "Is it worth splitting into more pieces?",
      problem:
        "Split a matrix multiplication into 4 blocks and the obvious approach needs 8 smaller multiplications. Strassen found a way to use only 7, at the cost of many extra additions and subtractions. Is saving one multiplication really worth it?",
      why: "8T(n/2) + n² is Θ(n³), while 7T(n/2) + n² is Θ(n^2.81). The theorem tells you the number of subproblems a determines the leaf count n^(log_b a), and here the leaf count overwhelms everything else — so the extra additions do not change the conclusion at all.",
    },
    {
      title: "Answering the complexity question in 30 seconds",
      problem:
        'You finish a divide-and-conquer or recursive solution and the interviewer asks, "what is the complexity?" Deriving the recursion tree on the spot is slow and easy to get wrong.',
      why: "Remember the three cases: compare log_b a with d. One look at the recurrence and you can say O(n log n), O(n²) or O(log n) — and explain why.",
    },
  ],
  cue: "T(n) = aT(n/b) + f(n), how many pieces you split into, how much smaller each piece is, recursion trees, the complexity of a divide-and-conquer algorithm.",
  steps: [
    "Read `a` (how many recursive calls), `b` (how much smaller the input to each call is) and `d` (the power of n in the work done outside the recursion) straight off the code.",
    "Compute `log_b a`. It is 0 when a = 1, 1 when a = b, and 2 when a = b². Otherwise reach for a calculator: log₂ 7 ≈ 2.81, for instance.",
    "Compare `log_b a` with `d`. Greater: case 1, the answer is Θ(n^(log_b a)). Equal: case 2, the answer is Θ(n^d log n). Less: case 3, the answer is Θ(n^d).",
    "Sanity-check with the recursion tree: work out the cost of level 0, level 1 and level 2, and see whether it is growing, holding steady or shrinking. The direction has to match the case you picked.",
    "If f(n) is not a plain polynomial, or the subproblems are not the same size, the theorem does not apply. Fall back to summing a recursion tree level by level, or guess the answer and verify it by induction.",
  ],
  demoNote:
    "Pick a familiar algorithm, or dial in your own a, b and d. The top shows the comparison and the conclusion; underneath is the work done on each level of the recursion tree. In case 1 the bars grow longer level by level, in case 2 they all have the same length, and in case 3 they shrink. Watch what fraction of the total the root level and the leaf level each account for.",
  codeNote:
    "The theorem is not an algorithm, so the code here is a small calculator: feed it a, b and d and it returns the case and the complexity, then sums a recursion tree level by level to check the result and show how much the total work grows when n doubles.",
  problems: [
    { src: "LeetCode 704", name: "Binary Search (T(n) = T(n/2) + 1)", diff: "Easy" },
    { src: "LeetCode 912", name: "Sort an Array (write merge sort, then derive T(n) = 2T(n/2) + n)", diff: "Medium" },
    { src: "LeetCode 50", name: "Pow(x, n) (T(n) = T(n/2) + 1)", diff: "Medium" },
    { src: "LeetCode 241", name: "Different Ways to Add Parentheses (uneven subproblems, so the theorem does not apply)", diff: "Medium" },
    { src: "LeetCode 932", name: "Beautiful Array (T(n) = 2T(n/2) + n)", diff: "Medium" },
    { src: "LeetCode 218", name: "The Skyline Problem (the divide and conquer version is T(n) = 2T(n/2) + n)", diff: "Hard" },
  ],
};
