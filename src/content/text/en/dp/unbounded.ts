import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "0/1 Knapsack, Memoization & Tabulation",
  applications: [
    {
      title: "Cutting stock: the most profitable way to cut one bar",
      problem:
        "You have a 10 m aluminium extrusion. Customers buy 3 m, 4 m and 5 m lengths at 260, 340 and 420 respectively, and they will take as many of each as you can supply. Cutting nothing but 3 m pieces, which have the best price per metre, gives three pieces worth 780 and leaves 1 m of scrap.",
      why: "Length is the weight, the sale price is the value, and the length of the bar is the knapsack capacity — and since you can cut any number of pieces at each length, this is the unbounded knapsack. dp[w] remembers the most that w metres can be sold for, and it finds 3 + 3 + 4 for 860. Going greedily by price per metre leaves an offcut that nothing fits, whereas the DP has compared every remainder against every length.",
    },
    {
      title: "Exact postage with the fewest stamps",
      problem:
        "A parcel needs 63 in postage and the counter has only 7, 10 and 25 stamps left, in unlimited quantities. Starting with the largest denomination, 25 + 25 + 10 leaves 3, and no stamp covers that — greedy is simply stuck.",
      why: 'Hitting the total exactly while using as few stamps as possible is the minimising form of the unbounded knapsack, better known as Coin Change. dp[a] is the fewest stamps that add up to a, amounts that cannot be made start at ∞, and the answer comes out as 25 + 10 + 7×4, six stamps in all. Greedy cannot be trusted when the denominations have no multiple structure; the DP is correct for any set of them.',
    },
    {
      title: "Packing an order: how many ways to fill every box",
      problem:
        "An order is for 120 cans of a drink. Cartons come in sizes of 6, 10 and 24, there is no limit on how many you use, and every carton has to be full. Sales wants to know how many combinations of carton counts are available.",
      why: "This is the counting form of the unbounded knapsack: dp[a] += dp[a − carton size], giving 16. The loop order is everything. Cartons on the outside and cans on the inside counts each set of cartons once; swap the two loops and the same cartons picked in a different order count as different, giving 39614. It is the most common mistake in this whole family of problems.",
    },
  ],
  cue: "Unlimited supply of each item, items that may be picked again, reaching a given total, the fewest items, the most value, how many combinations, making change, cutting stock, Coin Change.",
  steps: [
    "Check the shape of the problem: every item **may be used repeatedly**, and you have to reach, or stay within, some total W. Define `dp[w]` as the best value, or the number of ways, at total w.",
    "Set the initial values to match the goal: for the most value within W, all zeros; for the fewest items hitting W exactly, `dp[0] = 0` and everything else ∞; for the number of ways, `dp[0] = 1` and everything else 0.",
    "Loop over the items on the outside and over w on the inside, running **upwards** from `wᵢ` to W: use `dp[w] = max(dp[w], dp[w−wᵢ] + vᵢ)` for the most value, `min(dp[w], dp[w−wᵢ] + 1)` for the fewest items, and `dp[w] += dp[w−wᵢ]` for the number of ways.",
    "If the question really wants **permutations** (a different order counting as a different answer), swap the two loops: w runs from 1 to W on the outside and the items on the inside, transitioning only when `wᵢ ≤ w`.",
    "The answer is in `dp[W]`. In the exact-total version, `dp[W]` still holding ∞ means the total cannot be made, so return −1. When counting in C++, switch to `unsigned long long`.",
  ],
  demoNote:
    'Coins `[1, 2, 5]` and an amount of 11, looking for the fewest coins. "Unbounded (forward sweep)" gives each coin one round and sweeps the amount from small to large; "0/1 knapsack (reverse sweep)" uses exactly the same transition but sweeps the amount from large to small, which amounts to having one coin of each kind. Blue is the cell being filled in, a grey ∞ is an amount that cannot be made yet, and the source cell `dp[w−coin]` is green while it still holds last round\'s value and amber once this round has updated it — that amber is the same coin being used a second time. Watch where the amber shows up in the forward mode, and how the two modes finish with `dp[11]` at 3 and at ∞ respectively.',
  codeNote:
    "The unbounded knapsack for maximum value, plus the two variants that come up most often: the fewest coins, and the number of ways in both its combination and its permutation form. The two counting versions sit side by side so that swapping the loops can be seen to compute genuinely different things. The C++ counting functions use `unsigned long long` to absorb the overflow in the intermediate values.",
  problems: [
    { src: "LeetCode 322", name: "Coin Change (fewest items, initialise to ∞)", diff: "Medium" },
    { src: "LeetCode 518", name: "Coin Change II (combinations, coins on the outside)", diff: "Medium" },
    { src: "LeetCode 279", name: "Perfect Squares (the items are 1, 4, 9, …)", diff: "Medium" },
    { src: "LeetCode 377", name: "Combination Sum IV (permutations, loops swapped)", diff: "Medium" },
    { src: "LeetCode 139", name: "Word Break (words can be reused and order matters)", diff: "Medium" },
    { src: "LeetCode 1449", name: "Form Largest Integer With Digits That Add up to Target (hit the total exactly, then compare digit counts)", diff: "Hard" },
  ],
};
