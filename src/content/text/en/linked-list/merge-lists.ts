import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Singly linked lists, fast & slow pointers, recursion",
  applications: [
    {
      title: "Merging several sorted log files",
      problem:
        "Each server's log is already sorted by time, and you want one combined timeline out of them. Dumping everything into an array and sorting it is O(N log N), and it all has to be read into memory first.",
      why: "Every file is already sorted, so you simply keep comparing the current front entry of each one and taking the smallest. Two files cost O(n + m), k files with a heap cost O(N log k), and either way the work can be streamed. This is the heart of external sorting and of log aggregation systems.",
    },
    {
      title: "The last step of merge sort",
      problem:
        "Merge sort splits the data in half, sorts each half, and then has to combine two sorted runs into one. On a linked list that step needs no extra space at all.",
      why: "Merging a list only rewires pointers, it never moves data, so merge sort on a list runs in O(n log n) time and O(log n) space — cheaper than the array version. That is exactly LeetCode 148, Sort List.",
    },
    {
      title: "A database's merge join",
      problem: "Two tables are both sorted by the join key, and you need the pairs of rows whose keys match.",
      why: "It is the same two pointers walking forward together: whichever side is smaller advances, and equal keys produce output. The skeleton is identical to merging lists; only the output step differs.",
    },
  ],
  cue: "Two (or k) already-sorted sequences, merging, taking the smallest one, merge sort, dummy + tail, k-way merge.",
  steps: [
    "Create `dummy` and set `tail = dummy`. The dummy node makes attaching the first node look exactly like attaching every node after it.",
    "`while a and b`: compare `a.val` with `b.val`, attach the smaller node to `tail.next`, advance that list's pointer, and set `tail = tail.next`. Take a on ties, so the result stays stable.",
    "After the loop, `tail.next = a or b` attaches whichever list still has nodes, all in one move.",
    "Return `dummy.next`, not dummy.",
    "For k lists, push every list's head into a min-heap (Python needs an index as a tie-breaker), then repeatedly pop the smallest, attach it, and push its next.",
  ],
  demoNote:
    "Step through how two lists merge: each step compares the two heads and attaches the smaller one to the end of the result; once a list runs out, everything left in the other is attached in a single move.",
  codeNote:
    "The iterative and recursive versions of merging two lists, the heap-based merge of k lists, and merge sort on a linked list, which uses the merge as a building block.",
  problems: [
    { src: "LeetCode 21", name: "Merge Two Sorted Lists", diff: "Easy" },
    { src: "LeetCode 88", name: "Merge Sorted Array (the array version: fill from the back)", diff: "Easy" },
    { src: "LeetCode 148", name: "Sort List (merge sort on a linked list)", diff: "Medium" },
    { src: "LeetCode 23", name: "Merge k Sorted Lists (with a heap)", diff: "Hard" },
    { src: "LeetCode 2", name: "Add Two Numbers (a variation on walking two pointers together)", diff: "Medium" },
  ],
};
