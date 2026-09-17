import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion, Insertion Sort",
  applications: [
    {
      title: "A 120 GB file on a machine with 16 GB of memory",
      problem:
        "A 120 GB click log has to be sorted by user ID. The whole thing does not come close to fitting in memory, which rules out any sort that needs random access to the entire array.",
      why: "Read 10 GB at a time, sort it, and write it out as a sorted temporary file; that gives you 12 of them. Then open all 12 at once, look only at the first record in each, and emit the smallest. Merging needs nothing but sequential reads and writes, which is exactly what disks are best at. The Unix sort command and a database's ORDER BY both fall back to this when memory runs out — it is the external merge you see in a PostgreSQL query plan.",
    },
    {
      title: "An admin table where sorting a column must not scramble the groups",
      problem:
        "An order list holds 30,000 rows, already sorted by the time each order was placed. Support clicks the \"shipping status\" column and expects orders within a single status to still be in time order.",
      why: "When two values tie, the merge always takes the one from the left run, and elements in the left run already came first, so equal elements never change their relative order. That is what stable means. With a stable sort, sorting by several columns is just \"sort by the secondary column first, then by the primary one\". Python's sort and Java's Arrays.sort for objects both use TimSort, which is built around merging, to guarantee exactly this.",
    },
    {
      title: "A public API that sorts data users upload",
      problem:
        "The service accepts up to a million numbers and returns them sorted. Someone crafts an input so that quicksort's pivot lands on an extreme value every single time.",
      why: "Quicksort degrades to O(n²) in the worst case: a million numbers is around 5×10¹¹ comparisons and the service simply hangs. Merge sort always cuts down the middle, and where it cuts has nothing to do with the data, so even its worst case is about 2×10⁷ comparisons and a malicious input has no weak spot to aim at.",
    },
  ],
  cue: 'Does not fit in memory, external sorting, a stable sort is required, n log n even in the worst case, sorting a linked list, merging two sorted runs, inversions or "how many elements to my right are smaller".',
  steps: [
    "Define `sort(lo, hi)`: it sorts the half-open range `[lo, hi)`. When `hi - lo <= 1` it returns immediately, which is the base case.",
    "`mid = (lo + hi) // 2`, then recurse into `sort(lo, mid)` and `sort(mid, hi)`. Both halves are sorted by the time those calls return.",
    "Merge: set `i = lo` and `j = mid`, compare `a[i]` with `a[j]`, write the smaller one into the scratch array, and advance that side's pointer. Take the left one on ties (`<=`) to stay stable.",
    "Once one run runs out, whatever is left in the other is already sorted, so copy it across in one go. Finally write `[lo, hi)` of the scratch array back into the original array.",
    "Allocate the scratch array once at the outermost level and share it across every merge. Do not build a new array at each level.",
    "Refinements worth making in practice: when `a[mid-1] <= a[mid]` the two runs already line up, so skip the merge; for very short runs (a dozen elements or so) switch to insertion sort. If you would rather avoid recursion, go bottom-up and merge runs of width 1, 2, 4 and so on, one pass at a time.",
  ],
  demoNote:
    "One shared array, [5, 2, 9, 1, 7, 3, 8, 4]. The four rows are recursion levels 0 to 3: a split moves a whole run down one level, and a merge pulls elements back up one at a time, with a dashed cell meaning that position's value currently lives on another level. Yellow marks the two run pointers during a merge, blue is the position just written to the output, and green marks a run that is already sorted. Count the comparisons: level 2 does four merges of 1 each, level 1 two merges of 3 each, and level 0 takes 7 — 17 in total, and never more than n = 8 on any single level.",
  codeNote:
    "The top-down recursive version and the bottom-up iterative version share one merge function. The recursive one maps directly onto the steps above; the iterative one drops the recursion and merges runs of width 1, 2, 4 and so on, one pass at a time — the same shape as external sorting merging its temporary files pass by pass. Both allocate the scratch array once and use `<=` to stay stable. The last example uses order data to show stability, with the C++ side comparing against the standard library's `std::stable_sort`.",
  problems: [
    { src: "LeetCode 2570", name: "Merge Two 2D Arrays by Summing Values (practise the merge step on its own)", diff: "Easy" },
    { src: "LeetCode 912", name: "Sort an Array (write it once top-down and once bottom-up)", diff: "Medium" },
    { src: "LeetCode 148", name: "Sort List (the linked-list version; bottom-up reaches O(1) extra space)", diff: "Medium" },
    { src: "LeetCode 937", name: "Reorder Data in Log Files (relies on a stable sort)", diff: "Medium" },
    { src: "LeetCode 315", name: "Count of Smaller Numbers After Self (count while merging)", diff: "Hard" },
    { src: "LeetCode 493", name: "Reverse Pairs (count with two pointers before merging)", diff: "Hard" },
  ],
};
