import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Memoization & Tabulation",
  applications: [
    {
      title: "Hospital night shifts: never two in a row",
      problem:
        "A resident has 30 nights available for night shifts this month, and the allowance depends on the day: 2,000 on a weekday, 3,500 at the weekend, 5,000 on a public holiday. The rules forbid working two nights in a row. Which nights pay the most? There are over two million legal schedules to pick from.",
      why: "Each night is either worked or not, and working one rules out the night before it — this is House Robber exactly. dp[i] holds the largest allowance over the first i nights: skip tonight and it is dp[i−1], work it and it is dp[i−2] plus tonight. Thirty cells, one max each. Taking the best-paid nights first is wrong: with three consecutive nights paying 3,500, 5,000 and 3,500, the middle one alone gives 5,000 while the two outer ones give 7,000.",
    },
    {
      title: "Word segmentation: how many ways to split a string",
      problem:
        'A search engine has to make sense of the hashtag #choosespain. The dictionary holds "choose", "chooses", "spain" and "pain", so the string splits as choose / spain or as chooses / pain. A 20-character string has 19 gaps, each either cut or not, which is 2¹⁹ ≈ 520,000 splits to check.',
      why: "Let dp[i] be the number of ways to split the first i characters. Grouping the splits by which dictionary word comes last gives classes that do not overlap and that together cover everything, so dp[i] is the sum of those classes. If the longest word is 10 characters, each cell looks back only 10 positions, roughly 10n dictionary lookups for the whole string. Decode Ways has the same shape: the last chunk is one digit or two. Swap the sum for a maximum — over word frequencies, say — and the same table picks out the single most likely split.",
    },
    {
      title: "Commuter tickets: day pass, weekly or monthly",
      problem:
        "Next year's office days are irregular: about 150 of them, sometimes a full week in a row, sometimes one after a gap of several days. A return trip costs 60, a 7-day pass 300 and a 30-day pass 1,200. What is the cheapest way to buy?",
      why: 'Let dp[d] be the least you can spend to get through day d. Stay home on day d and dp[d] = dp[d−1]; travel, and it depends on which pass covers today: a day ticket follows dp[d−1], a 7-day pass follows dp[d−7], a 30-day pass follows dp[d−30], and you take the smallest of the three. 365 cells, three options each. A rule of thumb like "buy the weekly pass whenever you travel more than five days that week" never says which day the pass should start on, whereas the DP has compared every possible start.',
    },
  ],
  cue: "Two adjacent items cannot both be chosen, only a handful of choices at each step, the best value over the first i items, how many ways, the least cost, an answer that depends on just the last item or two, a single O(n) sweep.",
  steps: [
    'Write down **what the state means** in one sentence: is `dp[i]` the answer for "the first i items" or for "ending at item i"? Then settle whether the final answer is the last cell or the largest cell in the table.',
    "Look at **the last step**: what choices does it have, and which smaller state does each choice fall back to? That gives you the **transition**. Take `max` for a maximum, `min` for a minimum, and **add** the classes together when counting, as long as they neither overlap nor miss anything.",
    "Fill in the **base cases**: the first few cells that the transition reads but that have no source of their own. Sizing the table at n+1 and letting `dp[0]` stand for the empty prefix usually removes the special cases altogether.",
    "`dp[i]` depends only on smaller indices, so a single loop with i going from small to large fills the whole table.",
    "**Squeeze the space**: if only the previous k cells are ever read, roll k variables forward instead, and mind the update order. When you need the actual choices back, keep the whole table, check which source the last cell matches, and follow the sources backwards.",
  ],
  demoNote:
    'Seven houses, `nums = [2, 7, 9, 3, 1, 8, 4]`. Once the state is defined the two base cells go in, and after that each house takes two steps. First the two sources light up: amber is `dp[i−1]`, the "skip it" option, and green is `dp[i−2]`, the "rob it" option, to which the blue `nums[i]` still has to be added. The next step writes the larger of the two into the blue `dp[i]`. The prev2 and prev1 below the table are the two values the rolling version has in hand while it computes that cell. Watch i = 6: robbing gives 12 + 4 = 16, worse than the 19 you get by skipping. The final step walks back from the end, and the green houses 0, 2 and 5 are the ones that were robbed: 2 + 9 + 8 = 19.',
  codeNote:
    "Three functions: House Robber down to two variables, a version that keeps the whole table and walks back to recover which houses were robbed, and the counting problem Decode Ways. The first two sit side by side to show what squeezing the space costs — O(1) space leaves you the maximum and nothing else, so knowing the choices means keeping the table. The sample data is the same as in the demo.",
  problems: [
    { src: "LeetCode 198", name: "House Robber", diff: "Medium" },
    { src: "LeetCode 740", name: "Delete and Earn (line the values up and it is House Robber)", diff: "Medium" },
    { src: "LeetCode 213", name: "House Robber II (a ring: split into drop-the-first and drop-the-last)", diff: "Medium" },
    { src: "LeetCode 91", name: "Decode Ways (counting, and watch out for 0)", diff: "Medium" },
    { src: "LeetCode 139", name: "Word Break (look back by the length of each dictionary word)", diff: "Medium" },
    { src: "LeetCode 983", name: "Minimum Cost For Tickets (look back 1, 7 and 30 days)", diff: "Medium" },
  ],
};
