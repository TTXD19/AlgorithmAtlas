import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion, subsets",
  applications: [
    {
      title: "Job order on a machine",
      problem:
        "One machine has to process 6 orders, and the changeover time between any two of them differs, so a different order means a different total. You want the sequence that takes the least time.",
      why: "Ordering problems are not subset problems: the same items in a different order are a different answer. Six orders give 6! = 720 sequences, so you can list them all and total each one. That is the most direct solution to a scheduling problem while n is small, and the starting point for understanding problems like TSP.",
    },
    {
      title: "Enumerating delivery routes",
      problem:
        "A courier leaves the depot, has to visit 5 addresses and come back. Which order gives the shortest total distance?",
      why: "Every visiting order over 5 addresses is a permutation of 5. A used array records which addresses are already in the route, each step picks from the ones not yet placed, and reaching the bottom gives one complete route.",
    },
    {
      title: "Anagrams and password variants",
      problem:
        "Which words can you spell by rearranging the letters of \"listen\"? Or: the password on a test account is some ordering of a few fragments, and you want to try every ordering.",
      why: "Rearranging letters is exactly permutation. When letters repeat you have to avoid producing the same result twice, which takes nothing more than sorting first and adding the rule \"skip an equal value whose predecessor is unused\".",
    },
  ],
  cue: "Order, arrangement, how many arrangements, each element used exactly once, n!, rearranging letters, the visiting order of a route.",
  steps: [
    "Set up `ans`, `path` and `used` (all false). `dfs()` means \"decide what goes in the next position\".",
    "Base case: `len(path) == n` means every position is filled, so copy `path` into `ans`.",
    "Loop over every j: if `used[j]` is true, continue.",
    "Make the choice: `used[j] = True`, `path.append(nums[j])`, then recurse with `dfs()`.",
    "Undo the choice: `path.pop()` and `used[j] = False` — both have to be restored — then try the next j.",
  ],
  demoNote:
    "The permutation tree for [1, 2, 3]. Each level picks from the numbers whose used flag is false, and the panel below shows the used array alongside the path. Notice that every undo restores the used array and the path together.",
  codeNote:
    "The used-array version, the swap version, and the version that handles duplicates. All three share the skeleton \"choose, recurse, undo\"; they differ only in how they track which elements are still available.",
  problems: [
    { src: "LeetCode 46", name: "Permutations", diff: "Medium" },
    { src: "LeetCode 47", name: "Permutations II (sort, then test used[j-1])", diff: "Medium" },
    { src: "LeetCode 31", name: "Next Permutation (no backtracking: find the next one in lexicographic order)", diff: "Medium" },
    { src: "LeetCode 526", name: "Beautiful Arrangement", diff: "Medium" },
    { src: "LeetCode 60", name: "Permutation Sequence (compute the k-th directly with factorials)", diff: "Hard" },
    { src: "LeetCode 996", name: "Number of Squareful Arrays", diff: "Hard" },
  ],
};
