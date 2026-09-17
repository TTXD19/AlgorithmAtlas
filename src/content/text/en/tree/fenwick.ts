import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Prefix sums, bitwise basics, segment trees",
  applications: [
    {
      title: "The same problem as a segment tree, in half the code",
      problem:
        "Prefix sums with point updates is the most common dynamic range problem. A segment tree can handle it, but that means three recursive functions — build, query and update — which is easy to get wrong under interview pressure.",
      why: "A Fenwick tree solves the same problem with two five-line loops, needs only n+1 cells of memory, and carries a smaller constant factor as well. Whenever a problem can be phrased as a prefix sum, it is the first thing to reach for.",
    },
    {
      title: "Counting inversions, or how many smaller values lie to the right",
      problem:
        "For each element, ask how many elements to its right are smaller. This is the basic quantity behind rank correlation scores and behind \"how out of order is this list\". Brute force is O(n²).",
      why: "Scan from right to left, recording each value you have seen as a count in a Fenwick tree, and every element needs a single query for \"how many values smaller than me have been seen so far\" — which is exactly a prefix sum. O(n log n).",
    },
    {
      title: "Live leaderboards",
      problem:
        "Game scores keep changing, and at any moment you need to answer \"how many players are scoring below x?\", which is x's rank.",
      why: "Index by score and store the number of players, and the rank is a prefix sum, while a score change is one decrement and one increment. Both operations are O(log n).",
    },
  ],
  cue: "Prefix sums over data that keeps changing, inversions, how many are smaller than me, live rankings, wanting something lighter than a segment tree.",
  steps: [
    "Index from **1** (the lowbit of 0 is 0, which loops forever). Allocate `tree = [0] * (n + 1)`.",
    "**update(i, delta)**: `while i ≤ n: tree[i] += delta; i += i & −i`.",
    "**prefix(i)**: `s = 0; while i > 0: s += tree[i]; i −= i & −i`.",
    "The range sum over [l, r] is `prefix(r) − prefix(l − 1)`.",
    "When the value range is huge, **compress the coordinates** first (map each value to its rank in 1..m) and index by rank. Inversion counting and live rankings both work this way.",
  ],
  demoNote:
    "The bars along the top show the interval each tree[i] is responsible for. Computing prefix(6), watch i jump from 6 to 4 and then to 0; for update(3), watch it jump from 3 to 4 and then to 8. Every step shows the binary form and the lowbit.",
  codeNote:
    "The whole implementation is two loops, plus the O(n) build and the classic inversion-counting application. Pay attention to the coordinate-compression step.",
  problems: [
    { src: "LeetCode 307", name: "Range Sum Query - Mutable (do it again with a Fenwick tree)", diff: "Medium" },
    { src: "LeetCode 315", name: "Count of Smaller Numbers After Self", diff: "Hard" },
    { src: "LeetCode 493", name: "Reverse Pairs", diff: "Hard" },
    { src: "LeetCode 1409", name: "Queries on a Permutation With Key", diff: "Medium" },
    { src: "LeetCode 2179", name: "Count Good Triplets in an Array", diff: "Hard" },
  ],
};
