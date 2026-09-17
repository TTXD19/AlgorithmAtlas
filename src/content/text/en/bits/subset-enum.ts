import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Bitwise Basics, Subsets",
  applications: [
    {
      title: "The smallest project team that still covers every skill",
      problem:
        "A new project needs six skills — frontend, backend, database, DevOps, design, testing — and the ten engineers in the department each have some of them. The manager wants the smallest team that still covers all six.",
      why: "Store each engineer's skills as a 6-bit integer, and a team becomes a 10-bit mask. Count from 0 to 1023, OR together the skills of everyone in the mask, and a result of 111111₂ means full coverage; the number of 1s in the mask is the headcount. That is 1024 teams at up to 10 ORs each, under ten thousand operations, with no recursion and no separate roster to maintain.",
    },
    {
      title: "Splitting 36 crates between two trucks as evenly as possible",
      problem:
        "A warehouse has 36 crates of differing weights to load onto two trucks, and the gap between the two loads should be as small as possible. Each crate goes on truck A or truck B, so trying everything is 2³⁶ ≈ 69 billion combinations — far too many.",
      why: "Split the crates into two halves of 18. Enumerate the 2¹⁸ = 262,144 subset weights of each half with masks, computing each one in O(1) from the subset with one crate fewer. Sort one half, then binary search it for the weight that pairs best with each weight from the other half to land nearest half the total. Around ten million operations and you have the best split. This is meet in the middle, the standard move when n is around 40.",
    },
    {
      title: "Word puzzles: which words can seven letters spell?",
      problem:
        "Each puzzle gives seven distinct letters, and players must find words that use only those letters and always include the centre letter. With 10,000 puzzles and a 100,000-word dictionary, checking every word against every puzzle is a billion comparisons.",
      why: "A word only matters for which letters it uses, so squeeze it into a 26-bit mask and use a hash table to count how many words each mask has. The six letters besides the centre one have just 2⁶ = 64 submasks, which sub = (sub − 1) & mask enumerates without missing one; add the centre letter to each and look it up. That is 640,000 lookups for all 10,000 puzzles.",
    },
  ],
  cue: "n ≤ 20, each element either chosen or not, a set stored as a single integer, trying every combination, union and intersection of sets, listing all subsets of a given set, 3ⁿ, n around 40 (meet in the middle), the state of a bitmask DP.",
  steps: [
    "Check the size. Enumerating every subset needs n ≤ 20 or so; also listing the submasks of every subset (3ⁿ) needs n ≤ 15 or so; at n around 40, split into two halves and enumerate each. Number the elements 0 to n − 1, with **bit i standing for element i**.",
    "The outer loop is `for mask in range(1 << n)`, and each integer is one subset. In C++, switch to `1LL << n` when n can reach 31 or more.",
    "Inside, use `mask >> i & 1` to pull out which elements are chosen and accumulate whatever you need (a sum, an OR of skills, a conflict check). The size of the subset is the popcount of mask, so if you only want subsets of size exactly k, use it to filter the rest out first.",
    "If the quantity you need can be built from \"the subset with one element fewer\", fill a table of size 2ⁿ instead: for each i and each `mask < 1 << i`, set `f[mask | 1 << i] = f[mask] + a[i]`, which drops the inner O(n).",
    "For the submasks of one mask: start at `sub = mask`, and after processing sub stop if `sub == 0`, otherwise `sub = (sub - 1) & mask`. When you do not want the empty set, the loop condition can just be `sub > 0`.",
  ],
  demoNote:
    "The elements are A, B, C, D, and bit i stands for element i, so A is bit 0 on the far right. In the first half, mask counts from 0 to 15: on the left are the four bits of the current mask, with blue bits set to 1 and the chosen elements in green underneath; in the 16 cells on the right, blue is the current mask and green marks the ones already listed. The second half lists only the submasks of mask = 1011₂ (A, B, D), so the C bit is drawn dashed and stays 0, and cells that are not submasks turn grey. Watch sub jump straight from 1000₂ to 0011₂ — the four integers in between all contain C and are skipped by a single AND — and stop after all eight submasks.",
  codeNote:
    "Four functions. The core mask loop lists every subset; using it to find the smallest fully skilled team shows OR as union and popcount as headcount; the O(2ⁿ) recurrence for subset sums is what meet in the middle runs once on each half; and last comes submask enumeration, with a check that listing the submasks of every mask really does take 3ⁿ steps. The C++ version uses only the standard `std::bitset` to count 1s and print binary.",
  problems: [
    { src: "LeetCode 78", name: "Subsets (use a mask loop instead of recursion)", diff: "Medium" },
    { src: "LeetCode 2212", name: "Maximum Points in an Archery Competition (enumerate which sections to win)", diff: "Medium" },
    { src: "LeetCode 2397", name: "Maximum Rows Covered by Columns (store each row as a mask)", diff: "Medium" },
    { src: "LeetCode 2002", name: "Maximum Product of the Length of Two Palindromic Subsequences (two disjoint masks)", diff: "Medium" },
    { src: "LeetCode 1178", name: "Number of Valid Words for Each Puzzle (submask enumeration)", diff: "Hard" },
    { src: "LeetCode 1755", name: "Closest Subsequence Sum (meet in the middle)", diff: "Hard" },
  ],
};
