import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Merge sort, the master theorem",
  applications: [
    {
      title: "How good is the recommendation model's ranking?",
      problem:
        "An online store's recommendation model ranks 100,000 products by predicted demand, and a week after launch the actual sales ranking is in. You want one number for how close the two rankings are: how many pairs of products the model ordered the opposite way round. Comparing every pair means about 5 billion comparisons.",
      why: "Sort the products by their actual rank, write down each one's predicted rank, and the pairs the two rankings disagree on are exactly the inversions of that sequence — the Kendall tau distance. Counting them inside the merge step of a merge sort is O(n log n), so 100,000 products take barely over a million comparisons.",
    },
    {
      title: "How unsorted is the data, and which sort should you use?",
      problem:
        "Scan records at a logistics hub arrive roughly in time order, with the occasional late one. An engineer wants to know how far from sorted the data is, to decide between insertion sort and merge sort.",
      why: "The inversion count is exactly the minimum number of adjacent swaps needed to sort the sequence, and also the number of shifts insertion sort performs. Spend O(n log n) counting first: if the number is close to n, insertion sort's O(n + inversions) is nearly linear; if it is close to n²/2, switch to merge sort.",
    },
    {
      title: "Is a shuffled sliding puzzle even solvable?",
      problem:
        "In the 15-puzzle, dropping the tiles into the grid at random leaves half of all boards impossible to solve no matter how you slide them. A game has to guarantee the puzzles it generates are solvable.",
      why: "Each slide changes the parity of the tile sequence's inversion count and the blank's position together in a fixed way, so the parity of the inversion count plus the row the blank sits in decides whether a board is solvable. Count the inversions once when generating a puzzle, and if the parity is wrong, swap any two non-blank tiles to flip it.",
    },
  ],
  cue: "Inversions, i < j but a[i] > a[j], how much two rankings disagree, Kendall tau, minimum adjacent swaps, how many to my right are smaller, the parity of a permutation, counting during a merge sort.",
  steps: [
    "Define `sort(lo, hi)`: sort `[lo, hi)` and return the number of inversions inside that range. Return 0 when the length is ≤ 1.",
    "Recurse on the halves: `cnt = sort(lo, mid) + sort(mid, hi)`, the inversions inside each half.",
    "Merge: compare `a[i]` against `a[j]`. Take the left one when `a[i] ≤ a[j]`; otherwise take the right one and add `cnt += mid − i`.",
    "Write the merged result back into `[lo, hi)` and return `cnt`. The outermost return value is the answer — use a 64-bit integer for it.",
    "If you need a count per element, or the condition is not a plain greater-than (`a[i] > 2·a[j]`, say), sort indices instead, or count separately with two pointers before merging.",
  ],
  demoNote:
    "Judge B's ranks for eight entries, [3, 1, 4, 7, 2, 8, 5, 6], already ordered by judge A's ranking — so the inversions are exactly the pairs of entries the two judges disagree on. The top row is the whole array, with the segment being merged in yellow; below it are the left half, the right half and the merged result, with the next two elements to compare in blue and the ones already taken in grey. Every time a right element comes out first (green in the merged result), all the left elements still waiting turn yellow and are counted as inversions in one go. The total is 8 pairs, matching the brute-force comparison, or 29% of all 28 pairs.",
  codeNote:
    "Python has the merge sort version, a brute-force version to check it against, and the application that turns two rankings into an inversion count to get the Kendall tau distance. C++ has the merge sort version and a Fenwick tree version, and uses 100,000 fully reversed numbers to show why the answer has to be a long long.",
  problems: [
    { src: "LeetCode 775", name: "Global and Local Inversions (every inversion has to be an adjacent one)", diff: "Medium" },
    {
      src: "LeetCode 1850",
      name: "Minimum Adjacent Swaps to Reach the Kth Smallest Number (the number of adjacent swaps is the inversion count)",
      diff: "Medium",
    },
    { src: "LeetCode 315", name: "Count of Smaller Numbers After Self (a count per element, so sort indices)", diff: "Hard" },
    { src: "LeetCode 493", name: "Reverse Pairs (the condition is a[i] > 2·a[j], so count with two pointers before merging)", diff: "Hard" },
    { src: "LeetCode 327", name: "Count of Range Sum (run the same merge-and-count over prefix sums)", diff: "Hard" },
  ],
};
