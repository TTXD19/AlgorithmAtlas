import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Subsets",
  applications: [
    {
      title: "Making up an amount from the coins you have",
      problem:
        "A vending machine takes only 5c, 10c and 50c coins, and you want every way of paying 65c. 10+5+50 and 50+10+5 are the same way and must not be counted twice.",
      why: "This is a combination, not a permutation: the order does not matter. Letting each level pick only from the current position rightward makes reordered duplicates impossible by construction. The moment the remaining amount would go negative, the whole branch is abandoned — that is pruning.",
    },
    {
      title: "Picking a team of 5 out of 20 people",
      problem:
        "A club has to choose 5 competitors from 20 applicants and score every possible roster for fit. There are C(20, 5) = 15,504 of them, and they need to be listed systematically.",
      why: "Picking from start rightward guarantees that each roster appears exactly once. Add one pruning rule — stop going deeper as soon as too few people are left to fill the 5 slots — and a great deal of useless recursion disappears.",
    },
    {
      title: "A shopping list that fits the budget",
      problem:
        "Given a parts price list, list every purchase whose total comes to exactly the budget, where each part may be bought more than once.",
      why: "Sort the prices first. Once the current part already costs more than the remaining budget, everything pricier after it will too, so the whole loop can end there. Sorting plus pruning removes well over half the search tree.",
    },
  ],
  cue: "Reach a target sum, choose k of them, order does not matter, elements may be reused or used only once, list every solution, n is small but brute force is still too slow.",
  steps: [
    "**Sort** the candidates first; that is what lets the pruning use `break`.",
    "Write `dfs(start, remain)`: when `remain == 0`, copy `path` into the answers and return.",
    "Run a for loop from `start` to the end. If `candidates[i] > remain`, `break` (that is the pruning). If the input has duplicates and `i > start and candidates[i] == candidates[i-1]`, `continue`.",
    "Make a choice: `path.append(candidates[i])`, then recurse into `dfs(i, remain - candidates[i])` (reusable) or `dfs(i + 1, …)` (used only once).",
    "Undo the choice: `path.pop()`, then move on to the next i.",
  ],
  demoNote:
    "candidates = [2, 3, 6, 7], target = 7. The recursion stack underneath shows start and remain at every level, and the yellow step is the moment the pruning fires: the candidate is already larger than remain, so the whole loop ends right there.",
  codeNote:
    "Combination Sum (reusable), C(n, k) (pruned on how many are left) and Combination Sum II (used only once, duplicates in the input). All that separates the three is what gets passed as start and what the pruning condition is.",
  problems: [
    { src: "LeetCode 39", name: "Combination Sum", diff: "Medium" },
    { src: "LeetCode 40", name: "Combination Sum II (used once only, duplicates skipped)", diff: "Medium" },
    { src: "LeetCode 77", name: "Combinations", diff: "Medium" },
    { src: "LeetCode 216", name: "Combination Sum III", diff: "Medium" },
    { src: "LeetCode 17", name: "Letter Combinations of a Phone Number", diff: "Medium" },
    { src: "LeetCode 131", name: "Palindrome Partitioning (a combination of cut positions)", diff: "Medium" },
  ],
};
