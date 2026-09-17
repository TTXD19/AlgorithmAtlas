import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Binary search",
  applications: [
    {
      title: "How fast do you have to be to make it in time",
      problem:
        "Koko has several piles of bananas in front of her and the guard comes back in h hours. Each hour she picks one pile and eats k bananas from it (if that pile holds fewer than k, the hour is still used up). What is the smallest k that gets her through them all?",
      why: "Working out k directly is hard, but \"given k, does she make it?\" is easy: add up ⌈pile / k⌉ over the piles. And the larger k gets, the easier finishing becomes, so feasibility is monotone. Binary search on k with one check per round, and about log rounds find the smallest feasible k.",
    },
    {
      title: "Least ship capacity, splitting work across machines",
      problem:
        "A batch of cargo has to ship in order within D days — what is the smallest capacity the ship needs? Or split a row of jobs across k machines so that the busiest machine has as little to do as possible.",
      why: '"Minimise the maximum" is this technique\'s signature shape. Guess a ceiling and check greedily whether the work fits under it; if it does, try a lower one, and if it does not, try a higher one.',
    },
    {
      title: "Capacity planning for a service",
      problem:
        "A service has to survive peak traffic, so what is the fewest machines that will hold? Every candidate count needs its own load simulation, which is expensive, so you cannot try them all.",
      why: "More machines is never worse, so it is monotone. Binary search brings the number of simulations down to a logarithm — from hundreds to under ten. Whenever verifying an answer is easier than computing one, and the answer is monotone, this works.",
    },
  ],
  cue: "The smallest feasible value, the largest feasible value, minimising the maximum, maximising the minimum, how much is enough, verifying being easier than solving.",
  steps: [
    'Restate the problem as a decision: "is the answer x feasible?". Confirm that the larger (or the smaller) x gets, the easier feasibility becomes — that is the **monotonicity**.',
    "Fix the range `lo` and `hi`, making sure the true answer lies inside it. A wider range costs only a few more rounds (doubling it costs exactly one), but `feasible` has to judge every value in the range correctly: below the weight of the heaviest item, for example, loading the ship piece by piece greedily would wrongly report success, so the lower bound is set to that heaviest item.",
    "Write `feasible(x)`: usually a single O(n) greedy pass or simulation. It is the heart of the algorithm, so test it on its own first.",
    "`while lo < hi`: `mid = (lo + hi) // 2`; feasible means `hi = mid`, infeasible means `lo = mid + 1` (this is the smallest feasible value).",
    "When the loop ends, `lo` is the answer. (The loop does not necessarily verify the `lo` it leaves behind, so when the range might hold no feasible value at all, check `feasible(lo)` once more.) For the largest feasible value, switch to `mid = (lo + hi + 1) // 2`, with `lo = mid` when feasible and `hi = mid - 1` when not.",
  ],
  demoNote:
    "Koko eating bananas, with five piles and a 6-hour limit. The top row holds the candidate speeds 1 to 30, and each one that gets tried is marked feasible (green) or infeasible (amber) — the green ones always end up on the right. Below is the check itself: add up ⌈pile / k⌉ across the piles and compare it with h.",
  codeNote:
    "Koko's bananas and the ship's capacity both look for the smallest feasible value, with an identical skeleton and only `feasible` and the range swapped out. The third piece, cutting logs, looks for the largest feasible value, so note that rounding `mid` up and the direction of the updates are both reversed.",
  problems: [
    { src: "LeetCode 875", name: "Koko Eating Bananas", diff: "Medium" },
    { src: "LeetCode 1011", name: "Capacity To Ship Packages Within D Days", diff: "Medium" },
    { src: "LeetCode 410", name: "Split Array Largest Sum (minimise the maximum)", diff: "Hard" },
    { src: "LeetCode 1482", name: "Minimum Number of Days to Make m Bouquets", diff: "Medium" },
    { src: "LeetCode 1552", name: "Magnetic Force Between Two Balls (maximise the minimum)", diff: "Medium" },
    { src: "LeetCode 2226", name: "Maximum Candies Allocated to K Children (the largest feasible value)", diff: "Medium" },
  ],
};
