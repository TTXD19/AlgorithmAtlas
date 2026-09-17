import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array & Dynamic Array",
  applications: [
    {
      title: 'A report asking for "revenue from day 1,000 to day 5,000"',
      problem:
        "One revenue figure per day, and management asks for the total over some arbitrary range at any moment, hundreds of times a day. Adding it up from scratch every time gets slow as soon as the data grows.",
      why: "Spend O(n) once to compute the running total from day one up to each day, and from then on any range is the difference between two of those totals: O(1).",
    },
    {
      title: "How many runs of consecutive transactions add up to exactly k",
      problem:
        "Count the contiguous subarrays whose sum equals k. Brute-forcing every (l, r) is O(n²), which falls apart once n reaches a hundred thousand.",
      why: "A range sum is the difference of two prefix sums. On reaching position j, the only question is how many earlier prefix sums equal P[j] − k, and a hash table of counts answers it — O(n) overall.",
    },
    {
      title: "The total brightness of any rectangle in an image",
      problem:
        "The integral image is a staple of computer vision: you need the pixel total of any rectangular region of a picture, quickly, for face detection and blur filters.",
      why: "A 2D prefix sum. Build the table once in O(mn), and afterwards any rectangle's total is four values added and subtracted, O(1).",
    },
  ],
  cue: "Range sums, the sum of a contiguous subarray, repeated queries against data that never changes, the total over a rectangular region, a sum equal to k.",
  steps: [
    "Allocate an array of length `n + 1` with `P[0] = 0`.",
    "Sweep left to right with `P[i+1] = P[i] + a[i]`. Each step is a single addition, so building the table is O(n).",
    "To query the sum of `a[l..r]`, return `P[r+1] − P[l]`. Note the right edge is r+1, because P is defined to exclude its own position.",
    'When the question is "how many subarrays sum to k", rewrite it as `P[j] − P[i] = k` and, as you scan, keep a hash table counting how often each prefix sum has appeared; at j, look up how many times `P[j] − k` has occurred. Remember to seed it with `{0: 1}`.',
    "In two dimensions, `S[r+1][c+1] = grid[r][c] + S[r][c+1] + S[r+1][c] − S[r][c]` (inclusion-exclusion: add the left and the top, then subtract the top-left corner counted twice), and a rectangle query is the same four terms added and subtracted.",
  ],
  demoNote:
    'Press "Build one step" to watch P accumulate one cell at a time; once the table is built, choose l and r to see how a range sum falls out of subtracting one P value from another.',
  codeNote:
    "Three parts: the basic build and query, prefix sums plus a hash table for counting subarrays, and the 2D prefix sum. The C++ version stores the prefix sums as long long so the running total cannot overflow.",
  problems: [
    { src: "LeetCode 303", name: "Range Sum Query - Immutable", diff: "Easy" },
    { src: "LeetCode 724", name: "Find Pivot Index", diff: "Easy" },
    { src: "LeetCode 560", name: "Subarray Sum Equals K (prefix sums plus a hash table)", diff: "Medium" },
    { src: "LeetCode 304", name: "Range Sum Query 2D - Immutable", diff: "Medium" },
    { src: "LeetCode 974", name: "Subarray Sums Divisible by K", diff: "Medium" },
  ],
};
