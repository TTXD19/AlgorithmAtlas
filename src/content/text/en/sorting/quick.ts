import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion, merge sort",
  applications: [
    {
      title: "Sorting e-commerce search results by price",
      problem:
        "One query pulls back 2 million products that have to be sorted in memory from cheapest to most expensive before being paginated. Prices are doubles, and two products at the same price can come in any order.",
      why: "Quicksort swaps inside the original array, so there is no 2-million-slot scratch array the way merge sort needs (another 16 MB). Partitioning scans straight through from one end to the other, which is kind to the CPU cache and gives it a smaller constant factor than other O(n log n) sorts. When stability is not required, built-in sorts are usually built around it — Java's Arrays.sort for double[], for instance, is dual-pivot quicksort.",
    },
    {
      title: "p50 and p99 latency on a monitoring dashboard",
      problem:
        "Every minute brings 1.2 million API response times, and you need p50 and p99 — the values sitting at positions 600,000 and 1,188,000 once sorted. Sorting everything is O(n log n), but the order of the other 1.19 million positions is never used.",
      why: "Quick Select uses the same partitioning, but after each split it only follows the side the answer is on and throws the other side away entirely. When the splits land in the middle it touches only n + n/2 + n/4 + … ≤ 2n elements, and with a random pivot the expectation is still O(n). C++'s std::nth_element is exactly this idea.",
    },
    {
      title: "Grouping 30 million orders by status",
      problem:
        "Orders have only five statuses — awaiting payment, paid, shipping, delivered, cancelled — and 30 million of them have to be arranged by status in place, without allocating a second array.",
      why: "With that many duplicates, ordinary partitioning shoves every element equal to the pivot onto one side and degrades to O(n²) in the worst case. A three-way partition collects the whole \"equal to pivot\" block in the middle and never recurses into it, so each level down eliminates at least one status: at most five levels, O(n) per level, close to linear, and in place throughout.",
    },
  ],
  cue: "In-place sorting, stability not required, fastest on average, pivot, partition, k-th smallest / median / percentile, three-way partitioning for heavy duplicates, the language's built-in sort.",
  steps: [
    "If the range `[lo, hi]` holds 0 or 1 elements (`lo >= hi`), return immediately.",
    "Pick a random index in `[lo, hi]` and swap it with `a[hi]` to make it the pivot.",
    "Lomuto partition: `i = lo − 1`; sweep `j` from `lo` to `hi − 1`, and whenever `a[j] <= pivot`, do `i += 1` and swap `a[i]` with `a[j]`.",
    "After the sweep, swap `a[i+1]` with `a[hi]`. The pivot's final position is `p = i + 1`.",
    "Handle `[lo, p−1]` and `[p+1, hi]`: recurse into the shorter side, and for the longer one update `lo` or `hi` and loop back to step 1. That keeps the stack depth under log n.",
    "With heavy duplicates in the data, switch to a three-way partition (the three pointers `lt`, `i`, `gt`) and never recurse into the block equal to the pivot. If you only need the k-th smallest, use Quick Select and follow only the part k falls in.",
  ],
  demoNote:
    "The shared array is [5, 2, 9, 1, 7, 3, 8, 4], and the pivot is always the last element of the range — a Lomuto partition with no randomisation, so every playthrough is identical. Yellow is the pivot, blue marks the two cells just swapped, green marks elements already in their final place, and grey is outside the current range; while a partition runs, the rows underneath list the ≤ pivot region, the > pivot region and the elements not yet examined. The first cut uses 4 as the pivot and splits 3 against 4, which is reasonably even. The next three partitions use 3, 5 and 7, each of which happens to be the extreme value of its range, so the range shrinks by only one each time — this is what degrading to O(n²) looks like.",
  codeNote:
    "The Lomuto partition (the one from the demo), quicksort with a random pivot that only recurses into the shorter side, the three-way variant for heavy duplicates, and Quick Select built on that three-way partition. Both partitions are shown because Lomuto is the easiest to follow, but only the three-way version survives heavy duplicates — which is also why Quick Select uses it.",
  problems: [
    { src: "LeetCode 905", name: "Sort Array By Parity (one partition: evens left, odds right)", diff: "Easy" },
    { src: "LeetCode 75", name: "Sort Colors (three-way partition, also known as the Dutch national flag problem)", diff: "Medium" },
    { src: "LeetCode 2161", name: "Partition Array According to Given Pivot (relative order must be preserved, which swap-based partitioning destroys)", diff: "Medium" },
    { src: "LeetCode 912", name: "Sort an Array (always taking the last element as pivot times out; add randomisation and three-way partitioning)", diff: "Medium" },
    { src: "LeetCode 215", name: "Kth Largest Element in an Array (Quick Select; watch out for heavy duplicates)", diff: "Medium" },
    { src: "LeetCode 324", name: "Wiggle Sort II (Quick Select for the median, then a three-way partition)", diff: "Medium" },
  ],
};
