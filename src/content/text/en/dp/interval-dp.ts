import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Memoization & Tabulation, 1-D DP",
  applications: [
    {
      title: "Which two matrices in a chain to multiply first",
      problem:
        "A numerical routine has to compute A·B·C, where A is 10×30, B is 30×5 and C is 5×60. Matrix multiplication is associative, so (AB)C and A(BC) give the same answer — but wildly different amounts of work. A real model has a dozen or more matrices in the chain.",
      why: "(AB)C costs 10·30·5 + 10·5·60 = 4,500 scalar multiplications; A(BC) costs 27,000, six times more. The best cost for a run of matrices is decided by where the final multiplication splits it: the left part done optimally, the right part done optimally, plus the cost of multiplying those two results. Enumerate the split point and work from short intervals up to long ones, and a dozen matrices resolve instantly.",
    },
    {
      title: "A logging system merging adjacent small files",
      problem:
        "A logging service writes one file per hour, 24 a day and all different sizes. To cut down on small files they are merged into one, but only two files that are adjacent in time may be merged (that is what keeps the chronological order), and a merge costs the combined size of the two files.",
      why: "If any two files could be merged, always taking the two smallest would be Huffman's greedy rule — but \"adjacent only\" breaks greedy. The final merge over interval [i, j] must join two already-merged files, [i, k] and [k+1, j], at a cost equal to the whole range's size. So dp[i][j] = min over k of dp[i][k] + dp[k+1][j] + the range sum.",
    },
    {
      title: "How a strand of RNA folds",
      problem:
        "A strand of RNA is a sequence of A, U, G and C, where A pairs with U and G pairs with C, and the arcs between paired bases may not cross. Biologists want to predict the largest number of pairs a strand of a few hundred bases can form, as a first estimate of its stable structure.",
      why: "Look at base j of the interval [i, j]. Either it pairs with nothing, and the answer is the one for [i, j−1], or it pairs with some k in the middle — and because arcs cannot cross, that splits the problem into two independent halves, [i, k−1] and [k+1, j−1]. That is the Nussinov algorithm, an O(n³) interval DP.",
    },
  ],
  cue: "A contiguous run of things, merging two neighbouring segments, where the last step splits, parenthesisation, bursting balloons, palindromes, triangulation, a dp[i][j] that covers an interval, filling shortest intervals first.",
  steps: [
    "Define `dp[i][j]` as the best answer for an interval, decide whether the interval is open or closed, and pad the ends with sentinels where that helps (Burst Balloons pads with 1).",
    "Fill in the base cases: intervals of length 1 for a closed interval, or intervals with nothing between the two ends for an open one.",
    "Run `length` from small to large in the outer loop, enumerate the start `i` in the inner loop, and derive `j`.",
    "Enumerate the split point — or the \"last step\" — k: `dp[i][j] = best(dp[i][k] ⊕ dp[k+1][j] + merge cost)`. Record the winning k if you need to reconstruct the solution, and precompute costs such as a range sum with a prefix-sum array.",
    "The answer is `dp[0][n−1]`, and following the recorded k values recursively rebuilds the parenthesisation or the order of operations.",
  ],
  demoNote:
    "Burst Balloons with nums = [3, 1, 5, 8], padded at both ends with 1 to give [1, 3, 1, 5, 8, 1]. Each dp[i][j] in the table is the best score for bursting every balloon between i and j, filled shortest interval first. Each step assumes some balloon k is the last one burst inside that interval: in the row of balloons above, blue is k, yellow marks the two ends of the interval — which are exactly k's neighbours when it pops — and grey are the ones already burst by the sub-problems. In the table, blue is the cell being filled, yellow are the two sub-intervals it reads, and the small digit in the bottom-right corner records the chosen k. The final answer is dp[0][5] = 167.",
  codeNote:
    "Python has Burst Balloons, matrix chain multiplication with the parenthesisation reconstructed, and longest palindromic subsequence written as memoised recursion — two ways of writing the same interval state, side by side. C++ has Burst Balloons and \"merge adjacent piles\", where the merge cost is the whole range's sum, showing how a prefix-sum array makes that an O(1) lookup.",
  problems: [
    { src: "LeetCode 516", name: "Longest Palindromic Subsequence (matching ends go straight in)", diff: "Medium" },
    { src: "LeetCode 877", name: "Stone Game (a two-player game on an interval)", diff: "Medium" },
    { src: "LeetCode 1039", name: "Minimum Score Triangulation of Polygon (enumerate the vertex that forms a triangle with the two ends)", diff: "Medium" },
    { src: "LeetCode 312", name: "Burst Balloons (enumerate the balloon burst last)", diff: "Hard" },
    { src: "LeetCode 1547", name: "Minimum Cost to Cut a Stick (sort the cut points and it becomes interval DP)", diff: "Hard" },
    { src: "LeetCode 1000", name: "Minimum Cost to Merge Stones (merging K piles at a time adds a dimension to the state)", diff: "Hard" },
  ],
};
