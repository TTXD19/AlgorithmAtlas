import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "1-D DP, binary search",
  applications: [
    {
      title: "Stock trends: the longest run of rises",
      problem:
        "You want to measure how strong a stock's upward trend has been over ten years, about 2,500 trading days: from the closing prices, pick a set of days on which the price is higher every time, skipping as many days in between as you like. How many days can you pick? And every one of the market's 1,800 listed stocks has to be recomputed after each close.",
      why: '"Skipping is allowed" means you want a subsequence rather than a contiguous stretch, which is exactly LIS. The O(n²) DP costs about 3 million comparisons per stock, over 5 billion across the market; switch to tails plus binary search and each stock costs roughly 2,500 × 12 comparisons, a few tens of millions for the whole market.',
    },
    {
      title: "Nesting boxes in a warehouse: how deep can they go",
      problem:
        "A warehouse holds 3,000 boxes of assorted sizes. One box fits inside another only if both its length and its width are strictly smaller, and rotating is not allowed. You want to nest as many boxes as possible, one inside the next.",
      why: "Both dimensions have to increase. Sort by length ascending and, when lengths tie, by width descending, then run LIS on the widths. That descending step makes it impossible for two boxes of equal length to end up in the same increasing sequence, which collapses the two-dimensional problem into one dimension and solves it in O(n log n). This is Russian Doll Envelopes.",
    },
    {
      title: "Tidying a shelf: the fewest books to move",
      problem:
        "A library shelf holds 1,200 books whose call numbers have been shuffled out of order. Each move pulls one book out and slots it back in anywhere. What is the fewest moves that puts the shelf back in order?",
      why: 'The books you never touch have to be in the right relative order already, which is to say they form an increasing subsequence; every other book takes one move to slot back into place. The more you leave alone, the fewer you move, so the answer is n − LIS. Almost every "fewest deletions or moves to make it sorted" problem reduces this way.',
    },
  ],
  cue: "Subsequence (gaps allowed), increasing all the way, longest chain, nesting one inside another, both dimensions have to grow, fewest deletions or moves to make it sorted, n up to 10⁵ so O(n log n) is needed.",
  steps: [
    "Work out whether the problem wants a **subsequence** (gaps allowed) or a contiguous subarray, and whether it is **strictly increasing** or allows equal values. If it is two-dimensional (envelopes, boxes), first sort by the first dimension ascending and by the second descending on ties, then keep only the second.",
    "For n up to a few thousand, or when you need a count: `dp = [1] * n`, then for each i scan every `j < i` and set `dp[i] = max(dp[i], dp[j] + 1)` whenever `nums[j] < nums[i]`. The answer is `max(dp)`.",
    "For O(n log n): start with an empty `tails` and, for each `x`, compute `pos = lower_bound(tails, x)` (use upper_bound if equal values are allowed).",
    "Append when `pos == len(tails)`, otherwise set `tails[pos] = x`. Once everything is processed, `len(tails)` is the length of the LIS.",
    "If you need the sequence itself: store indices in tails, record `parent[i] = tails[pos-1]` while processing element i (−1 when pos is 0), then walk back from the last slot of tails along parent and reverse.",
  ],
  demoNote:
    'Eight days of stock prices, `[3, 1, 4, 1, 5, 9, 2, 6]`, with both modes running on the same data. "O(n²) DP table" fills in `dp[i]` cell by cell: blue is the current i, green are the smaller values j that it could follow, and yellow is whichever of them has the largest dp. Notice that the 1 at i = 3 cannot attach to the earlier 1, because the sequence has to be strictly increasing. The final step highlights 3 → 4 → 5 → 9 in green, recovered by following the predecessors back. "O(n log n) tails" binary-searches for each element first (yellow marks the position found, and a yellow dashed + means it goes on the end), then overwrites or appends (blue). Look at the last step: tails is [1, 2, 5, 6], and the length of 4 is correct, but the indices it came from — 3, 6, 4, 7 — are not increasing, so it is not an actual subsequence.',
  codeNote:
    "Four functions: the O(n²) DP (the Python version also rebuilds the sequence through `prev`, while the C++ version returns only the length), the tails version that just returns the length, an O(n log n) version that stores indices plus `parent` to rebuild the sequence, and the sort that collapses Russian Doll Envelopes into a one-dimensional LIS. Both approaches are here because the O(n²) version is easier to follow and extends to counting, while only the tails version copes with large inputs. The examples use the same eight days of prices as the interactive demo; the two versions rebuild different subsequences, but of the same length.",
  problems: [
    { src: "LeetCode 300", name: "Longest Increasing Subsequence (write both versions once)", diff: "Medium" },
    { src: "LeetCode 334", name: "Increasing Triplet Subsequence (a tails array capped at length 3)", diff: "Medium" },
    { src: "LeetCode 673", name: "Number of Longest Increasing Subsequence (O(n²) DP plus counting)", diff: "Medium" },
    { src: "LeetCode 354", name: "Russian Doll Envelopes (sorting collapses it to one dimension)", diff: "Hard" },
    { src: "LeetCode 1964", name: "Find the Longest Valid Obstacle Course at Each Position (non-decreasing, so upper_bound)", diff: "Hard" },
    { src: "LeetCode 1713", name: "Minimum Operations to Make a Subsequence (LCS turned into LIS)", diff: "Hard" },
  ],
};
