import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion, Prefix Sum, Binary Tree Basics",
  applications: [
    {
      title: "Range statistics on a live leaderboard",
      problem:
        "A hundred thousand players have scores that keep changing, and the service has to keep answering \"total score of ranks 1000 through 2000\" and \"highest score in this band\". A prefix sum answers queries instantly but costs O(n) per update, while computing on demand costs O(n) per query.",
      why: "A segment tree cuts the array into ranges layer by layer, and each node stores the sum (or maximum) of its range. A query only has to stitch together a handful of ready-made ranges, and an update only touches one root-to-leaf path — both O(log n).",
    },
    {
      title: "Time-window queries in a monitoring system",
      problem:
        "One latency figure arrives every second, and the question is \"the maximum latency over any window\", while the data keeps streaming in.",
      why: "Swap \"sum\" for \"maximum\" and it is the same tree — only three operators change in the code. Any associative operation (sum, maximum, minimum, GCD) supports range queries on a segment tree.",
    },
    {
      title: "Computational geometry and sweep lines",
      problem:
        "A pile of overlapping rectangles whose union area you need, or a set of line segments where you need to know which ones intersect.",
      why: "A sweep line moves from left to right while a segment tree maintains the y-intervals currently covered. That needs range updates, which brings in lazy propagation — the advanced end of segment trees.",
    },
  ],
  cue: "Range sums or range maxima, needing queries and updates at the same time, O(n) being too slow, associative operations, sweep lines.",
  steps: [
    "Decide what each node stores (sum, maximum, …) and what the empty range is worth (0, −∞, …). Allocate `tree = [0] * (4n)`.",
    "**build(node, lo, hi)**: if lo == hi, store a[lo]; otherwise split in half, recurse, and finish with `tree[node] = merge(left, right)`.",
    "**query(node, lo, hi, ql, qh)**: return the empty value when the ranges are disjoint; return `tree[node]` when the node is fully contained; otherwise merge the results from both children.",
    "**update(node, lo, hi, i, v)**: walk down to the leaf, change it, and recompute each ancestor on the way back up.",
    "For range updates, add lazy propagation: give each node a `lazy` field and push the pending mark down before descending into a child.",
  ],
  demoNote:
    "Range sums over eight elements. During the query for [2, 5], watch which nodes get taken as they are (green), which are skipped (grey), and which have to split further. Then add 4 to index 3 and watch the ancestors along a single path get refreshed.",
  codeNote:
    "A complete implementation of range sum with point updates, storing the nodes in a 1-indexed heap-style array. The last line is a reminder that switching to a maximum means changing three places.",
  problems: [
    { src: "LeetCode 307", name: "Range Sum Query - Mutable", diff: "Medium" },
    { src: "LeetCode 315", name: "Count of Smaller Numbers After Self", diff: "Hard" },
    { src: "LeetCode 2407", name: "Longest Increasing Subsequence II (range maximum)", diff: "Hard" },
    { src: "LeetCode 218", name: "The Skyline Problem (a sweep-line way of thinking)", diff: "Hard" },
    { src: "LeetCode 850", name: "Rectangle Area II (sweep line plus range cover)", diff: "Hard" },
  ],
};
