import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Greedy principles",
  applications: [
    {
      title: "Giving change at a till",
      problem:
        "A customer pays 100 for something that costs 37, so you owe 63 in change. The cashier does not enumerate every combination; they start from the largest coin and work down: 50, 10, 1, 1, 1 — five coins. The same routine is correct for dollars, euros and yen.",
      why: "That is exactly greedy: at every step take the largest coin that does not exceed what is left. It works because these currencies are designed so that each larger denomination is a multiple, or nearly a multiple, of the smaller ones, which makes taking the large coin never worse than taking small ones. This lesson first pins down why it is correct, then looks at when it fails.",
    },
    {
      title: "The coin hopper in a vending machine",
      problem:
        "A particular machine is loaded with only three coins: 1, 3 and 4. To give 6 in change, greedy hands out 4+1+1, three coins, when 3+3 would do it in two. The hoppers run dry sooner than they should.",
      why: "Same greedy algorithm, different set of denominations, wrong answer. That is the most important lesson in greedy algorithms: correctness comes from the structure of the input, not from the algorithm itself. And there is a definite test for whether a set of denominations can be handled greedily.",
    },
    {
      title: "Fewest coins for arbitrary denominations",
      problem:
        "An interview question hands you an arbitrary array of denominations and an amount and asks for the fewest coins. It looks like making change, but nothing is guaranteed about the denominations, and greedy is wrong on some of the test cases.",
      why: "This is where DP comes in: dp[a] is the fewest coins that make a, and for each denomination c you try dp[a − c] + 1. Greedy is a special case of the DP — when the denominations are canonical, the best transition at every step happens to be exactly \"take the largest coin\".",
    },
  ],
  cue: "Making change, fewest coins, largest denomination first, canonical coin systems, switching to DP when greedy fails.",
  steps: [
    "Sort the denominations from **largest to smallest**.",
    "For each denomination c: `count = amount // c`, take count coins, then `amount %= c`.",
    "When the loop ends amount should be 0; anything else means this set of denominations cannot make that amount (which never happens when a 1 coin exists).",
    "To check whether a set of denominations can be handled greedily: for every amount from 1 up to the sum of the two largest denominations, compare the greedy coin count against the DP one. If they match everywhere, the system is canonical.",
    "If it is not canonical, switch to DP: `dp[0] = 0`, `dp[a] = min(dp[a − c] + 1)`, and read off `dp[amount]`.",
  ],
  demoNote:
    "Switch between the two sets of denominations and the four amounts. Greedy takes one denomination per step, and the optimum computed by DP is shown on the right. Look at what `[1, 3, 4]` does for 6 and for 10, and at why 27 happens to come out right again: the counterexamples do not appear at every amount, so passing a handful of test cases is no evidence that an algorithm is correct.",
  codeNote:
    "The greedy version, the DP version, and a function that checks whether a set of denominations is canonical. Together the three make the point of this lesson: be greedy when you can, use DP when you cannot, and know in advance which case you are in.",
  problems: [
    { src: "LeetCode 860", name: "Lemonade Change (hand back the largest notes first)", diff: "Easy" },
    { src: "LeetCode 1710", name: "Maximum Units on a Truck (sort by value per unit)", diff: "Easy" },
    { src: "LeetCode 322", name: "Coin Change (arbitrary denominations, so DP is required)", diff: "Medium" },
    { src: "LeetCode 518", name: "Coin Change II (counting the ways, also DP)", diff: "Medium" },
    { src: "LeetCode 279", name: "Perfect Squares (another case where greedy is wrong)", diff: "Medium" },
  ],
};
