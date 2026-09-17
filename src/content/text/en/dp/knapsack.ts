import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Memoization & Tabulation, 1-D DP",
  applications: [
    {
      title: "Which R&D proposals get funded",
      problem:
        "The annual R&D budget is $50 million and 40 proposals have come in, each with a cost in millions and an estimated payoff. A proposal is approved in full or rejected; you cannot fund half of one. Forty proposals means 2⁴⁰ ≈ 1.1 trillion possible sets.",
      why: "Every proposal is in or out, the total cost is capped, and you want the largest total payoff: that is exactly the 0/1 knapsack. Measured in millions the capacity is only 50, so the table is 41 × 51, about two thousand cells, filled in an instant. Picking greedily by payoff per million looks sensible, but proposals cannot be split, and one large project with the best ratio can lock up the rest of the budget, so greedy gets it wrong.",
    },
    {
      title: "What the truck carries today",
      problem:
        "A truck is limited to 1,200 kg and the warehouse holds 60 shipments waiting to go out, each with a weight and a freight charge. A shipment either goes on the truck whole or waits until tomorrow, and the goal is the highest freight revenue for this trip.",
      why: "Another 0/1 knapsack. The 2-D table is 61 × 1,201, roughly 73,000 cells. Since each row reads only the row above it, rolling the table into one dimension takes just 1,201 integers. If weights have to be exact to the gram the capacity becomes 1.2 million: the 2-D table would need over 73 million cells, while the 1-D array still needs only 1.2 million. That is what rolling the table buys you, and it shows how directly the capacity figure drives the cost.",
    },
    {
      title: "Splitting overnight batch jobs across two machines",
      problem:
        "Eighteen batch jobs add up to 460 minutes of runtime and have to be divided between two equally fast machines. The run is not finished until both machines are, so you want the later one to finish as early as possible — that is, both totals as close to 230 minutes as you can get.",
      why: "Treat each runtime as both the weight and the value and ask: choosing some jobs, what is the largest total that stays at or below 230? This is the boolean form of the knapsack, where can[s] records whether some subset sums to exactly s and the capacity is half the total. An 18 × 231 table finds the best split, with no need to try all 2¹⁸ = 262,144 of them.",
    },
  ],
  cue: "Each item is in or out, nothing can be split, a weight or budget cap, maximise the total value, hit a target sum exactly, split into two piles with the smallest gap, capacity is a smallish integer.",
  steps: [
    "Confirm the shape of the problem: each item can be taken **at most once**, there is an **integer capacity** W, and the goal is to maximise the total value (or decide whether a sum is reachable, or count the ways). Items that can be taken any number of times make it an unbounded knapsack.",
    "Define `dp[i][w]` = the best value from the first i items at capacity w. Base case: row 0 is all zeros (when the capacity must be filled exactly, only `dp[0][0] = 0` and the rest is −∞).",
    "Outer loop i from 1 to n, inner loop w from 0 to W: start with `dp[i][w] = dp[i−1][w]` (skip it), and if `w ≥ wᵢ`, take the larger of that and `dp[i−1][w−wᵢ] + vᵢ` (take it).",
    "The answer is `dp[n][W]`. To list what was chosen, walk upward from `(n, W)`: whenever `dp[i][w] ≠ dp[i−1][w]`, record item i and set `w −= wᵢ`; otherwise leave w alone. Stop at row 0.",
    "When only the best value matters, roll the table into a single row: a 1-D `dp` of length W+1, items on the outside, w scanned **downward** from W to wᵢ, `dp[w] = max(dp[w], dp[w−wᵢ] + vᵢ)`.",
    "Other variants change only the combining step and the initial values: `or` with `can[0] = True` for feasibility, addition with `ways[0] = 1` for counting. The loop structure stays exactly the same.",
  ],
  demoNote:
    'Four items — A (weight 1, value 1), B (weight 3, value 4), C (weight 4, value 5), D (weight 5, value 7) — and a capacity of 7. The table fills one cell at a time: blue is the cell being computed, yellow is the "skip it" source `dp[i−1][w]`, and green is the "take it" source `dp[i−1][w−wᵢ]`. Once it is full, the traceback runs upward from the bottom-right corner; the green path marks the cells it walks through, and in the item row green means taken while a strikethrough means left behind. Watch the final cell `dp[4][7]`: taking D, the item with the best ratio, only reaches 8, while leaving it out keeps B + C = 9.',
  codeNote:
    "Three functions: the 2-D table with traceback (the only one that can list which items were chosen), the rolled-up 1-D version scanning downward (the standard form when only the best value is needed), and the boolean knapsack for the smallest gap between two piles. The 2-D version is the easiest to follow and the only one that traces back; the 1-D version is what you actually write when solving problems. The C++ boolean knapsack uses `std::bitset`, where the single line `can |= can << x` performs a whole pass and handles 64 bits at a time.",
  problems: [
    { src: "LeetCode 416", name: "Partition Equal Subset Sum (boolean knapsack, capacity is half the total)", diff: "Medium" },
    { src: "LeetCode 1049", name: "Last Stone Weight II (really the smallest gap between two piles)", diff: "Medium" },
    { src: "LeetCode 494", name: "Target Sum (turns into counting subset sums)", diff: "Medium" },
    { src: "LeetCode 2915", name: "Length of the Longest Subsequence That Sums to Target (exact fill, initialise to −∞)", diff: "Medium" },
    { src: "LeetCode 474", name: "Ones and Zeroes (a knapsack with two capacities)", diff: "Medium" },
    { src: "LeetCode 879", name: "Profitable Schemes (counting with a minimum profit)", diff: "Hard" },
  ],
};
