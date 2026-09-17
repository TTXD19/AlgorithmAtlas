import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Modular Arithmetic, Memoization & Tabulation",
  applications: [
    {
      title: "Your odds in the lottery",
      problem:
        "A lottery draws 6 numbers from 1 to 49. What are the odds that one ticket takes the jackpot, and what are the odds of the smaller prize for matching only 3? Listing every possible draw and counting them means working through more than ten million combinations.",
      why: "The draw ignores the order of the numbers, so there are C(49, 6) = 13,983,816 possible outcomes and exactly 1 of them is the jackpot — roughly one in fourteen million. Matching exactly 3 means choosing 3 of your own 6 numbers and 3 of the other 43 that miss: C(6, 3) × C(43, 3) = 246,820 outcomes, about 1.77%. The whole question is a few binomial coefficients multiplied and divided.",
    },
    {
      title: "Significance in a gene enrichment analysis",
      problem:
        'An experiment flags 300 genes with abnormal expression, 40 of which belong to the "immune response" functional category — a category that covers 500 of the twenty thousand genes in the genome. The researcher has to decide whether that is a coincidence or whether the immune response really is tied to the experimental condition.',
      why: "When 300 genes are drawn at random, the probability that exactly k of them fall in that category is the hypergeometric distribution C(500, k) · C(19500, 300 − k) / C(20000, 300); summing over k ≥ 40 gives the p-value. These binomials run to hundreds of digits, so in practice you precompute a table of ln(n!), add and subtract in log space and exponentiate at the end, and nothing overflows.",
    },
    {
      title: "Pairwise testing of configuration options",
      problem:
        "A product's settings page has 20 toggles. All combinations come to 2²⁰, over a million, so testing every one is out of the question. Experience says most bugs involve only one or two settings at a time.",
      why: "Pairwise testing only asks that all four on/off states of every pair of toggles show up in at least one test case. That is C(20, 2) × 4 = 760 conditions to cover, and a single test case covers C(20, 2) = 190 of them at once, so at least 4 cases are needed — in practice a carefully arranged 8 cases cover everything. The binomial coefficient tells you how many conditions there are, and gives you a lower bound on the number of tests.",
    },
  ],
  cue: "Choose k from n, order does not matter, counting paths across a grid, identical items into distinct boxes (stars and bars), probability as favourable outcomes over all outcomes, counting problems with the answer taken mod 10⁹+7, many queries of C(n, k).",
  steps: [
    "Decide first whether you are counting permutations or combinations and whether the items are identical, then restate the problem as `C(n, k)` or `P(n, k)` — grid paths are `C(a + b, a)`, stars and bars is `C(n + k − 1, k − 1)`.",
    "For n up to a few thousand, or when the modulus is not prime: fill in Pascal's triangle with `C[n][k] = C[n − 1][k − 1] + C[n − 1][k]`.",
    "For a prime modulus p with n < p: build `fact[0..n]` using `fact[i] = fact[i − 1] · i mod p`.",
    "`inv_fact[n] = fact[n]^(p − 2) mod p`, then sweep right to left with `inv_fact[i − 1] = inv_fact[i] · i mod p`.",
    "On a query, return 0 when `k < 0` or `k > n`; otherwise return `fact[n] · inv_fact[k] · inv_fact[n − k] mod p`.",
  ],
  demoNote:
    'The control at the top switches between the two methods. "Pascal\'s triangle" starts from the 1s at each end and fills rows 0 through 6 one cell at a time: blue is the cell being computed, amber marks the two cells above that feed it, and the note on the first cell breaks down why it is "the n-th item included" plus "the n-th item excluded". Row 6 comes out as 1, 6, 15, 20, 15, 6, 1, summing to 64 = 2⁶, and the green C(6, 2) = 15 is also the number of paths made of 4 steps right and 2 steps down. "Factorial table mod 13" computes C(8, 3) mod 13: it fills 0! through 8! left to right, applies Fermat\'s little theorem exactly once to 8! = 7 to get the inverse 2, then fills the inverse table right to left by multiplying each cell by i, with a check at every step. The query multiplies the three green cells, 7 × 11 × 9 ≡ 4, which matches 56 mod 13. The final step explains why n has to stay below the modulus.',
  codeNote:
    "The Python side has the Binomial class with its factorial and inverse-factorial tables plus the multiplicative formula for exact values, and puts them to work on the lottery, grid-path and stars-and-bars examples. The C++ side has the same Binomial struct, Pascal's triangle for when the modulus is not prime, and the lgamma-based log form used for probabilities.",
  problems: [
    { src: "LeetCode 118", name: "Pascal's Triangle", diff: "Easy" },
    { src: "LeetCode 1641", name: "Count Sorted Vowel Strings (stars and bars)", diff: "Medium" },
    { src: "LeetCode 2400", name: "Number of Ways to Reach a Position After Exactly k Steps (decide how many steps go right)", diff: "Medium" },
    { src: "LeetCode 1735", name: "Count Ways to Make Array With Product (factorise, then stars and bars for each prime)", diff: "Hard" },
    { src: "LeetCode 1569", name: "Number of Ways to Reorder Array to Get Same BST (interleave the subtrees, C(n − 1, size of left subtree))", diff: "Hard" },
    { src: "LeetCode 1916", name: "Count Ways to Build Rooms in an Ant Colony (factorial table plus inverses)", diff: "Hard" },
  ],
};
