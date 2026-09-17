import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Memoization & Tabulation, 1-D DP",
  applications: [
    {
      title: "git diff: which lines actually changed",
      problem:
        "A 1,200-line config file has been edited in a few places, and the code review tool has to mark which lines are unchanged, which were deleted and which are new. It should keep the unchanged set as large as possible, or the reviewer drowns in a wall of red and green.",
      why: "Treat each line as one element, and the longest common subsequence of the two versions is exactly the set of unchanged lines; everything else is a deletion on the old side or an addition on the new one. git's default Myers algorithm computes the shortest edit script using only deletions and insertions, which is the same problem as LCS, just tuned for the case where the two files are nearly identical.",
    },
    {
      title: "How similar are two gene sequences?",
      problem:
        "Researchers compare a stretch of the same gene in two species, roughly 10,000 bases each (A, C, G, T). Evolution has inserted and deleted bases along the way, shifting everything out of alignment, so comparing position by position gives nonsense.",
      why: "LCS lets you skip any number of characters in between and only insists that what remains stays in order, which is exactly the tolerance you need for insertions and deletions. A 10,000 × 10,000 table is a hundred million cells at O(1) each. Needleman–Wunsch global alignment in bioinformatics is the same table, with \"match, add one\" replaced by tunable scores and penalties.",
    },
    {
      title: "Scoring summaries and checking essays for plagiarism",
      problem:
        "A system produces a summary and you want to know how close it is to a human-written reference; or two 3,000-word reports come in and a teacher wants to flag suspicious pairs. Shuffling the wording slightly or adding a sentence in the middle should not drop the score to zero.",
      why: "The LCS length divided by the length of the reference text is ROUGE-L, a standard summarisation metric. It counts only the words that appear in the same order, without requiring them to be adjacent, so inserting a sentence or rephrasing costs a little; copying a passage wholesale scores very close to 1.",
    },
  ],
  cue: "Two sequences, the part they share, relative order preserved but gaps allowed, diff, alignment, fewest deletions and insertions, similarity, dp[i][j] over two prefixes.",
  steps: [
    "Create a `(m+1) × (n+1)` table `dp`, with row 0 and column 0 all zeros — the LCS against an empty sequence.",
    "Fill it cell by cell for i from 1 to m and j from 1 to n: if `A[i−1] == B[j−1]` then `dp[i][j] = dp[i−1][j−1] + 1`, otherwise take `max(dp[i−1][j], dp[i][j−1])`.",
    "The bottom-right cell `dp[m][n]` is the LCS length.",
    "To rebuild the LCS: start at `(m, n)`, and when the characters match, take that character and move diagonally up-left; when they differ, move up or left towards the larger dp value, breaking ties either way. Reverse what you collected for the answer. Along the way, moving up deletes a character of A and moving left inserts a character of B — that is the diff.",
    "If you only need the length, roll two rows instead, with the shorter sequence as the row width, bringing the space down to `O(min(m, n))`.",
  ],
  demoNote:
    "A = PYTHON, B = TYPHOON. P, Y and T appear in opposite order on the two sides, so there is more than one LCS. The table fills row by row: blue is the cell being filled, yellow are the cells it reads — the diagonal neighbour when the characters match, the cells above and to the left when they differ — and the small arrow in each cell's top-left corner records where its answer came from (ties always record ←). Then the backtrack runs from the bottom-right: green outlines mark the path and solid green marks the characters that belong to the LCS. The diff grows underneath at the same time, with green for kept, a yellow − for deleted from A and a blue + for inserted from B. This path yields THON, and the last step lists the two other answers you would get by breaking the ties the other way, all of length 4.",
  codeNote:
    "The Python tab has the full table, the reconstruction of the LCS string, and a line-by-line diff whose sample output looks just like git diff. The C++ tab has the string reconstruction, which needs the whole table, and the space-saving two-row version for when you only need the length. Both languages break ties towards the left when backtracking, so they land on the same answer as the interactive demo.",
  problems: [
    { src: "LeetCode 1143", name: "Longest Common Subsequence", diff: "Medium" },
    { src: "LeetCode 1035", name: "Uncrossed Lines (lines that do not cross means order is preserved: LCS in disguise)", diff: "Medium" },
    { src: "LeetCode 583", name: "Delete Operation for Two Strings (the answer is m + n − 2·LCS)", diff: "Medium" },
    { src: "LeetCode 718", name: "Maximum Length of Repeated Subarray (contrast: requiring contiguity makes it a substring)", diff: "Medium" },
    { src: "LeetCode 712", name: "Minimum ASCII Delete Sum for Two Strings (swap \"length\" for a sum of character values)", diff: "Medium" },
    { src: "LeetCode 1092", name: "Shortest Common Supersequence (build the LCS table, then emit both sides along the path)", diff: "Hard" },
  ],
};
