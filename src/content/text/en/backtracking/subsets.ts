import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion",
  applications: [
    {
      title: "Testing every combination of feature flags",
      problem:
        "A system has five feature flags (dark mode, the new checkout flow, experimental search, and so on), and QA has to confirm that no combination of them fights with any other. Each flag is on or off — how many cases are there, and how do you list every one without missing any?",
      why: "A flag being on or off is exactly an element being taken or skipped. Decide the flags one at a time; once they are all decided you have one combination, then go back, change the previous decision and carry on. All 2⁵ = 32 combinations, none missed and none repeated.",
    },
    {
      title: "Every sandwich you can build from the toppings",
      problem:
        "A deli offers four optional toppings and the menu is supposed to list every possible combination, including plain with none of them. The owner wrote the list by hand and missed two, which only came to light when a customer asked.",
      why: "The hand-written list missed cases because it had no systematic order. Subset enumeration supplies one: take the first topping or not, take the second or not, and so on — reach the bottom and you have a sandwich. All 2⁴ = 16, guaranteed complete.",
    },
    {
      title: "Finding which numbers add up to a target",
      problem:
        "An expense claim comes to $1,250 in total and there are eight receipts. You need to work out which of them add up to exactly that amount.",
      why: "Just take the sum of each subset of the eight receipts: 2⁸ = 256 cases run instantly. Subset enumeration is the foundation for every \"try all the combinations\" problem, and combinations and pruning both grow out of it.",
    },
  ],
  cue: "All combinations, choose any number of them, each item wanted or not, the power set, every state of a set of switches, n small (≤ 20) and you need the whole list.",
  steps: [
    "Set up `ans` (the answers) and `path` (the current path), and write `dfs(i)` to mean \"deciding element i right now\".",
    "Base case: when `i == len(nums)` every element has been decided, so append a **copy** of `path` to `ans`.",
    "Make a choice: `path.append(nums[i])`, then recurse with `dfs(i + 1)`.",
    "Undo the choice: `path.pop()`, restoring `path` to how it looked on entry to this level.",
    "Take the other branch: skip nums[i] and call `dfs(i + 1)` directly. With both branches done, this level is finished and control returns to the level above.",
  ],
  demoNote:
    "The decision tree for [1, 2, 3]. Each node shows the path so far, the left branch takes the element and the right branch skips it. Notice how every undo rewinds the path to what it was on entering that level, and how the 8 leaves are exactly the 8 subsets.",
  codeNote:
    "Three versions: the standard take-or-skip shape, the start-index shape where every node is a subset, and the version that handles duplicate elements.",
  problems: [
    { src: "LeetCode 78", name: "Subsets", diff: "Medium" },
    { src: "LeetCode 90", name: "Subsets II (sort, then skip duplicates within a level)", diff: "Medium" },
    { src: "LeetCode 784", name: "Letter Case Permutation (each letter is upper or lower case)", diff: "Medium" },
    { src: "LeetCode 1863", name: "Sum of All Subset XOR Totals", diff: "Easy" },
    { src: "LeetCode 2044", name: "Count Number of Maximum Bitwise-OR Subsets", diff: "Medium" },
    { src: "LeetCode 698", name: "Partition to K Equal Sum Subsets (each number picks a subset to join, with pruning)", diff: "Medium" },
  ],
};
