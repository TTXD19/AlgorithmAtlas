import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Binary heaps, selection sort",
  applications: [
    {
      title: "The sort() inside an operating system kernel",
      problem:
        "While booting, the Linux kernel has to sort thousands of exception table entries, and plenty of other tables after that. The kernel stack is only 8 KB to 16 KB, so recursion is never safe; allocating memory is awkward in some of these paths; and the data being sorted is not always under the kernel's control.",
      why: "Heap sort uses nothing but the array itself, sift down is a loop rather than recursion, extra space is O(1), and it is O(n log n) no matter what the input looks like. Quicksort is faster on average, but its O(n²) worst case can be triggered deliberately, and merge sort needs an O(n) scratch buffer. Heap sort is exactly what Linux picked for lib/sort.c.",
    },
    {
      title: "The fuse inside a built-in sort",
      problem:
        "An API lets users upload a million numbers to be sorted. Someone works out how your quicksort picks its pivot and feeds it data that makes every partition wildly lopsided, pushing the comparison count from around 20 million to around 500 billion.",
      why: "A hybrid sort runs quicksort normally, and the moment the recursion depth passes roughly 2 log n it hands that segment to heap sort: O(n log n) even in the worst case, and still in place, so you keep quicksort's advantage of needing no scratch array. Both .NET's Array.Sort and Rust's sort_unstable use heap sort as their worst-case fallback.",
    },
    {
      title: "Results day: almost nobody reads past page two",
      problem:
        "300,000 exam scores have to be shown highest first, 50 per page. The overwhelming majority of visitors look at the first page or two, but nobody can promise that no one will page all the way to the end.",
      why: "Spend O(n) turning the scores into a max-heap (under about 600,000 comparisons), then pop the root once per result you need, about 36 comparisons each. The first page costs under 610,000 comparisons in total, whereas sorting everything costs around 10 million. And if somebody really does reach the last page, all you have done is one complete heap sort.",
    },
  ],
  cue: "Sort in place, O(1) extra space, O(n log n) even in the worst case, no recursion allowed, fear of adversarial input hitting the worst case, a fallback for quicksort, pulling out the largest few as you go.",
  steps: [
    "Write `sift_down(a, i, size)`: find the largest of `i`, `2i + 1` and `2i + 2`, where a child index only exists if it is `< size`. If the largest is `i`, stop; otherwise swap, move `i` to that child, and repeat.",
    "**Build the heap**: run `i` from `n // 2 − 1` down to 0, calling `sift_down(a, i, n)` for each. When that finishes, `a[0]` holds the maximum.",
    "**Extract**: run `end` from `n − 1` down to 1, swapping `a[0]` with `a[end]`. This round's maximum lands at `end` and never moves again.",
    "Call `sift_down(a, 0, end)` on the new root. The heap is now `end` slots long — passing `n` would drag the already-sorted tail back in.",
    "When the loop ends the array is sorted ascending. For descending order, flip the comparison (a min-heap); for just the k largest, stop after k extractions, which costs O(n + k log n).",
  ],
  demoNote:
    "Both views share the array [5, 2, 9, 1, 7, 3, 8, 4]. The tree on top draws only the part still inside the heap, and the [i] under each node is its array index; below is that same array, with the sorted tail in green. Yellow marks the parent and child currently being compared, blue the two slots just swapped. Steps 1 through 8 are the heapify, which ends at [9, 7, 8, 4, 2, 3, 5, 1]; after that, every extraction is a single swap of the root with the tail followed by sinking the new root, and that sink never goes deeper than the height of the tree.",
  codeNote:
    "The heart of it is a hand-written `sift_down` plus the two-phase `heap_sort`. Python adds a generator built on `heapq` that emits results as you go, matching the paginated results scenario: it is not in place, but it shows the O(n + k log n) cost of taking only the first k. C++ rewrites the same algorithm with the standard library's `std::make_heap` and `std::pop_heap`, where passing `std::greater` flips it to descending order.",
  problems: [
    { src: "LeetCode 506", name: "Relative Ranks (pop from a max-heap in order; the nth item out is the nth rank)", diff: "Easy" },
    { src: "LeetCode 1636", name: "Sort Array by Increasing Frequency (change what sift_down compares: frequency first, larger value first on ties)", diff: "Easy" },
    { src: "LeetCode 912", name: "Sort an Array (write heap sort by hand: O(1) extra space and O(n log n) worst case)", diff: "Medium" },
    { src: "LeetCode 215", name: "Kth Largest Element in an Array (heapify, then extract only k times — heap sort stopped early)", diff: "Medium" },
    { src: "LeetCode 1962", name: "Remove Stones to Minimize the Total (heapify in place, then repeatedly edit the root and sink it)", diff: "Medium" },
  ],
};
