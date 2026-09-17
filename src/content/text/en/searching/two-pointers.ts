import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Arrays",
  applications: [
    {
      title: "Finding the pair in a sorted list that adds up exactly",
      problem:
        "A ledger of transactions sorted by amount, and you need the two entries that add up to a reconciliation figure. Brute force pairs every entry with every other one: n(n−1)/2 pairs, O(n²).",
      why: "Sorted data has structure you can exploit. If the smallest plus the largest is too small, the smallest cannot reach the target with any partner at all, so it is eliminated; if the sum is too large, the largest goes instead. One pointer from the left and one from the right close in on each other, eliminating one element per step, so it is over in at most n − 1 steps. This is the standard answer for pairing in sorted data.",
    },
    {
      title: "Tidying in place: deduplicating, moving zeroes, filtering",
      problem:
        "A sorted array contains duplicates that have to go, and you cannot allocate a second array (memory is tight, or the interface demands an in-place edit).",
      why: "One pointer reads ahead while the other tracks how far the writing has got. The read pointer is never behind the write pointer, so overwriting never damages data you have not read yet. These are same-direction pointers: O(n) time and O(1) extra space.",
    },
    {
      title: "Palindrome checks and merging two sorted lists",
      problem:
        "Decide whether a string reads the same forwards and backwards; or combine two individually sorted lists into a single sorted one.",
      why: "A palindrome check compares from both ends inward, and a merge walks one pointer along each list. Both advance on the relationship between two positions, with no nested loop anywhere in sight.",
    },
  ],
  cue: "Already sorted, pairing things up, both ends closing in, editing in place, a nested O(n²) loop whose two indices move monotonically.",
  steps: [
    "For converging pointers, ask first: is the data sorted? If it is not and the problem allows it, sort (O(n log n)); if it does not, consider a hash table. Same-direction problems such as moving zeroes or filtering need no ordering at all.",
    "Converging: `l = 0`, `r = n − 1`, `while l < r`. Compare `a[l] + a[r]` against the target.",
    "Too small means `l += 1`, too large means `r −= 1`, and equal is the answer. At every step, ask yourself why the eliminated element cannot work with any partner.",
    "Same direction: `w = 0` (or 1), `for r in range(n)`. When `a[r]` is worth keeping, do `a[w] = a[r]; w += 1`.",
    "At the end, converging pointers return the pair they found or report that there is none; same-direction pointers return `w`, and `a[:w]` is the result.",
  ],
  demoNote:
    'The "Converging" mode looks for a two sum of 25 in a sorted array, and the struck-out cells are the ones that have been proved impossible. The "Same direction" mode removes duplicates in place: green is the result written so far and amber is the position being read — notice that w never gets ahead of r.',
  codeNote:
    "Two sum with converging pointers, duplicate removal with same-direction pointers, and 3Sum, which pins one value and converges on the other two. Deduplication is the easiest part of 3Sum to get wrong, so look closely at the two places where repeats are skipped.",
  problems: [
    { src: "LeetCode 167", name: "Two Sum II - Input Array Is Sorted", diff: "Medium" },
    { src: "LeetCode 26", name: "Remove Duplicates from Sorted Array", diff: "Easy" },
    { src: "LeetCode 283", name: "Move Zeroes (same direction: a read and a write pointer)", diff: "Easy" },
    { src: "LeetCode 125", name: "Valid Palindrome", diff: "Easy" },
    { src: "LeetCode 15", name: "3Sum", diff: "Medium" },
    { src: "LeetCode 11", name: "Container With Most Water (drop the shorter side)", diff: "Medium" },
  ],
};
