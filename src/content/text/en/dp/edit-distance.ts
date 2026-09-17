import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "LCS",
  applications: [
    {
      title: 'The "did you mean" under a search box',
      problem:
        'A shopper types "recieve" into a retail search box and nothing on the site matches it. The system has to pick, out of a hundred thousand product keywords, the handful most likely to be what they meant.',
      why: 'Turn the difference between two words into a number: the fewest insertions, deletions and replacements needed. recieve to receive is 2, recieve to receipt is 4. Discard the hopeless candidates on length alone, then compute only the band where the distance is at most 2, and a query takes a few milliseconds. But recieve to relieve is only 1, closer than receive, which is why real spelling suggestions also weigh word frequency — or switch to the Damerau distance, which counts swapping two adjacent characters as a single step and brings recieve to receive down to 1.',
    },
    {
      title: "The error rate of a speech recogniser",
      problem:
        "A speech model transcribes a 20-word utterance, and the output is held up against a human reference: some words come out wrong, some are dropped, some are invented. The team wants one accuracy figure they can compare across model versions.",
      why: "Treat each word as though it were a single character and compute the edit distance: a replacement is a misheard word, a deletion a dropped one, an insertion an invented one. Dividing the distance by the number of words in the reference gives the industry-standard word error rate — a distance of 3 against a 20-word reference is a WER of 15%. Tracing back through the table also tells you exactly which words went wrong.",
    },
    {
      title: "Matching OCR'd product names back to the catalogue",
      problem:
        'A scanned receipt comes out of OCR as "Large MiIk Tea (no ice)", but the reader occasionally turns an l into a capital I, reads rn as m, or loses the brackets entirely. The line has to be matched to the closest item in the product master before it can be booked automatically.',
      why: "Compute the edit distance character by character against every candidate product name; whichever is closest, provided it is under a threshold, is matched automatically, and only the distant ones go to a human. Edit distance tolerates a few wrong or missing characters, which is far more useful than demanding an exact match, and the cost of each of the three operations can be tuned to the mistakes the OCR engine actually makes.",
    },
  ],
  cue: "How similar two strings are, the fewest steps turning A into B, insert / delete / replace, spelling correction, fuzzy matching, error-tolerant search, word error rate, a dp[i][j] over two prefixes.",
  steps: [
    "Allocate an `(m+1) × (n+1)` table with `dp[i][0] = i` and `dp[0][j] = j`.",
    "Fill it row by row, left to right: if `A[i−1] == B[j−1]` then `dp[i][j] = dp[i−1][j−1]`, otherwise `1 + min(diagonal, above, left)`, which stand for replace, delete and insert respectively.",
    "`dp[m][n]` is the edit distance.",
    "For the sequence of operations: walk back from `(m, n)`, see which source this cell equals once that step's cost is added, move there and record the operation, then reverse the list once you reach `(0, 0)`.",
    'When only the distance matters, roll a single row and stash the diagonal; when the question is only "is it ≤ k", compute nothing but the band where `|i − j| ≤ k`.',
  ],
  demoNote:
    "Turning horse into ros, the example from LeetCode 72. Row 0 and column 0 go in first, then the cells one at a time: blue is the cell being filled, amber is the source it ends up using, and the small arrow in the corner of a cell records which direction that source came from (↖ match or replace, ↑ delete, ← insert; when several sources tie, the pick order is replace, delete, insert). Once the table is full the trace back starts at the bottom-right corner, green marks the path, and the operations appear on the right in order: replace h → r, delete r, delete e. Three steps, exactly the value in the bottom-right cell.",
  codeNote:
    'Python has the full table, the recovery of the operation sequence, and the space-saving version that rolls a single row, finishing with a spelling suggestion for teh that shows a swap of two characters costing two steps under the Levenshtein distance. C++ has the version built on one row plus a single diagonal variable, and the one that computes only the band in order to decide whether the distance is at most k.',
  problems: [
    { src: "LeetCode 72", name: "Edit Distance", diff: "Medium" },
    { src: "LeetCode 97", name: "Interleaving String (another table over two prefixes)", diff: "Medium" },
    { src: "LeetCode 115", name: "Distinct Subsequences (swap \"fewest steps\" for \"how many ways\")", diff: "Hard" },
    { src: "LeetCode 44", name: "Wildcard Matching (* can absorb any length)", diff: "Hard" },
    { src: "LeetCode 1312", name: "Minimum Insertion Steps to Make a String Palindrome (compare the string with its reverse)", diff: "Hard" },
  ],
};
