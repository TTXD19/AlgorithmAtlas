import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion, Prefix Sum",
  applications: [
    {
      title: "Stocks: which holding period made the most",
      problem:
        "You have a year of daily price changes and want to know which day to buy and which day to sell, given one buy and one sell. Trying every pair of days is O(n²), which is fine for 250 days but hopeless for ten years of minute bars.",
      why: "Adding up the daily changes gives the profit over a holding period, so the question becomes \"which contiguous run has the largest sum?\". Divide and conquer cuts the array in half: the answer lies in the left half, in the right half, or across the middle, for O(n log n). Kadane then squeezes it down to O(n).",
    },
    {
      title: "The strongest stretch of a signal",
      problem:
        "A sensor returns a stream of values that are positive and negative once the baseline is subtracted. You want the contiguous stretch where the signal is most concentrated — the range with the largest sum.",
      why: "It is the same problem as the stock one. Kadane sweeps through once and restarts whenever the running total goes negative, because carrying a negative prefix forward can only drag the rest down.",
    },
    {
      title: "A merge shape you will use again",
      problem:
        "A segment tree needs to answer \"maximum subarray sum over any range\", and a query cannot afford to rescan the whole range.",
      why: "The way the divide-and-conquer version combines its two halves — best on the left, best on the right, left suffix plus right prefix — is exactly the four values a segment tree node has to store. This lesson drills the merge logic; later on you just put it in a tree.",
    },
  ],
  cue: "Contiguous subarray, largest sum, the best buy-and-sell window, the strongest stretch of a signal, something you can halve and then merge.",
  steps: [
    "Divide and conquer: `solve(lo, hi)` returns the maximum subarray sum inside that range. If `lo == hi`, return `a[lo]`.",
    "Take `mid` and recurse for `left = solve(lo, mid)` and `right = solve(mid+1, hi)`.",
    "Across the middle: accumulate leftwards from mid and keep the largest total as `bestL`; accumulate rightwards from mid+1 and keep the largest as `bestR`. The crossing answer is `bestL + bestR`.",
    "Return `max(left, right, bestL + bestR)`. Each level costs O(n) and there are log n levels.",
    "Kadane: `cur = max(a[i], cur + a[i])`, `best = max(best, cur)`, both initialised from `a[0]`, in a single pass.",
  ],
  demoNote:
    "Eight days of price changes. The first half is divide and conquer: in the recursion tree, blue is the range being worked on and green is one already solved; in the array, yellow is the span of the cross-the-middle scan and green is this level's answer range. Once that finishes, the same run of steps continues with Kadane: yellow is the range `cur` currently covers and green is the best found so far — watch how two variables and one pass reach the same answer.",
  codeNote:
    "The divide-and-conquer version and Kadane side by side, plus a variant that reports the range itself — that is what the stock question's \"which day to buy, which day to sell\" needs.",
  problems: [
    { src: "LeetCode 121", name: "Best Time to Buy and Sell Stock (turn the prices into daily changes)", diff: "Easy" },
    { src: "LeetCode 53", name: "Maximum Subarray (write it once with divide and conquer, once with Kadane)", diff: "Medium" },
    { src: "LeetCode 152", name: "Maximum Product Subarray (track the maximum and the minimum together)", diff: "Medium" },
    { src: "LeetCode 918", name: "Maximum Sum Circular Subarray (total minus the minimum subarray)", diff: "Medium" },
    { src: "LeetCode 1186", name: "Maximum Subarray Sum with One Deletion", diff: "Medium" },
    { src: "LeetCode 363", name: "Max Sum of Rectangle No Larger Than K (collapse two dimensions into one)", diff: "Hard" },
  ],
};
