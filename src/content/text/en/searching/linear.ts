import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Arrays",
  applications: [
    {
      title: "Looking up a key in a config file",
      problem:
        "At startup a program reads a config file of a few dozen lines and needs the value of one field. Should it build an index first, or sort, or use a hash table?",
      why: "Reading a few dozen entries from top to bottom takes microseconds. Sorting or building a hash table has to touch every entry anyway, so for a single lookup the setup always costs more than the scan itself. When the data is small and you only look once, going one by one is the fastest thing you can do.",
    },
    {
      title: "Finding the first error in a log",
      problem:
        "A log file that was just written out, ordered by time, with no index of any kind. You want the first line where ERROR appears.",
      why: "The data is not sorted by what you are looking for, and you are not going to query it repeatedly. There is no shortcut here: scanning in order is the only option, and you can stop at the first hit.",
    },
    {
      title: 'A "recently opened files" list',
      problem:
        "You have a five-element list of recently used files, and every time a file is opened you check whether it is already in the list. Is a hash table worth it?",
      why: "With very few elements a linear scan has a smaller constant than hashing: no hash to compute, contiguous memory, friendly to the CPU cache. Five elements means at most five comparisons — not worth maintaining a separate hash table and keeping the two in sync.",
    },
  ],
  cue: "Unordered data, tiny data, a single lookup, stop at the first hit, not worth sorting or indexing first.",
  steps: [
    "Start at index 0, so `i = 0`.",
    "While `i < n`, compare `nums[i]` with the target. On a match return `i` — that is the only successful exit.",
    "Otherwise `i += 1` and go back to the previous step.",
    "If `i` reaches `n` (including an empty array, where `n = 0` from the start), everything has been checked without a match, so return `-1`.",
    "When you want **every** matching position, do not return early: collect each matching `i` into a list and return it after the full scan.",
  ],
  demoNote:
    "Search 10 unordered numbers for 46, then switch to 40, which is not there, and watch how many comparisons the worst case takes. The table underneath lists the worst-case comparison counts for linear and binary search at various n — with the caveat that binary search needs the data sorted first.",
  codeNote:
    "The basic version, a version that returns every matching position, and the sentinel trick that saves one bounds check per iteration. All three are O(n) time; they differ in what they return and how many comparisons happen inside the loop. At the end are the linear searches each language already ships: `in` and `list.index` in Python, `std::find` in C++.",
  problems: [
    { src: "LeetCode 2057", name: "Smallest Index With Equal Value (find the first one, return -1 on a miss)", diff: "Easy" },
    { src: "LeetCode 2108", name: "Find First Palindromic String in the Array (the condition is a function; stop on the first hit)", diff: "Easy" },
    { src: "LeetCode 2942", name: "Find Words Containing Character (return every matching position)", diff: "Easy" },
    { src: "LeetCode 1779", name: "Find Nearest Point That Has the Same X or Y Coordinate", diff: "Easy" },
    { src: "LeetCode 1848", name: "Minimum Distance to the Target Element (search outward from start)", diff: "Easy" },
    { src: "LeetCode 1", name: "Two Sum (first search linearly for each number's partner, then work out why a hash table is better)", diff: "Easy" },
  ],
};
