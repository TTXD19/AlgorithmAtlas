import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array & Dynamic Array, Bubble Sort",
  applications: [
    {
      title: "The last mile of a standard-library sort",
      problem:
        "To sort a million integers, quicksort and merge sort keep halving the range, and near the bottom that leaves tens of thousands of runs holding barely a dozen elements each. Recursing again on a run that small — picking a pivot, allocating scratch space — burns more time on bookkeeping than on the comparisons themselves.",
      why: "When n is small, constants matter more than growth rates. Insertion sort has no recursion, moves data only between neighbouring slots, and is kind to the CPU cache, so at a dozen elements it beats any O(n log n) algorithm. LLVM libc++'s std::sort switches to insertion sort once a range drops below 24 elements, and Python's Timsort uses binary insertion sort to pad short runs out to 32-64 elements before merging them.",
    },
    {
      title: "Sensor time series: readings that land a few slots late",
      problem:
        "A temperature sensor on a factory floor sends 10 timestamped readings per second, 864,000 a day. Network jitter makes a handful of packets arrive late, but no reading is ever more than 5 slots away from where it belongs. The stream has to be ordered by timestamp before it is archived.",
      why: "Insertion sort costs O(n + inversions). Each reading moves back at most 5 slots, so a full day takes under 4.32 million shifts and roughly 5.18 million comparisons — and it can sort as the data arrives. Quicksort and heapsort, which never look at how tidy the input already is, sit at n log₂ n ≈ 17 million comparisons and have to wait for the whole day's data first.",
    },
    {
      title: "A race leaderboard as runners cross the line",
      problem:
        "A road race starts in waves, and 60 runners cross the line one after another. Each runner's net time is their finish time minus the start of their own wave, so finishing later does not mean being slower. The board has to update the standings the instant a runner crosses.",
      why: "Insertion sort's invariant — the first i entries are always in order — makes it an online algorithm by nature: a new time comes in, you shift it back from the end into place, and nobody else's relative order changes. All 60 runners cost at most 1,770 shifts, and because the sort is stable, runners with identical times stay in the order they finished.",
    },
  ],
  cue: "Small arrays (a few dozen at most), nearly sorted data, every element close to its final position, items arriving one at a time that must stay ordered, a stable in-place sort, the small runs inside a hybrid sort.",
  steps: [
    "The outer loop runs `i` from 1 to n−1. At the start of round i, `a[0..i-1]` is already sorted; it begins as just `a[0]`, and a single element is sorted by itself.",
    "Save `a[i]` into `key` and set `j = i − 1`. Slot `a[i]` is now a hole, so overwriting it loses nothing.",
    "`while j >= 0 and a[j] > key`: `a[j+1] = a[j]`, `j -= 1`. Test `j >= 0` first, and shift only on a **strictly greater** comparison — that is what keeps the sort stable.",
    "The loop stops with `a[j] ≤ key` or `j = −1`. Write `key` into `a[j+1]`, and the sorted region grows to `a[0..i]`.",
    "When comparisons are expensive, use `bisect_right` (upper_bound) to locate the insertion point inside `a[0..i-1]` and shift the block in one go. To run it on a hybrid sort's small runs, replace the left bound 0 with the run's start `lo`.",
  ],
  demoNote:
    "The shared array is [5, 2, 9, 1, 7, 3, 8, 4]. Each round lifts one element into the hand, leaving a dashed hole behind it. Green is the sorted region, amber is the element just compared with the card in hand (if it is larger it shifts one slot right and the hole moves left), and blue is where the card was just inserted. Notice that inserting 9 stops after a single comparison, while inserting 1 shifts all the way to the left end. The run ends with 13 shifts, exactly this array's inversion count. There are 18 comparisons: the 13 shifts plus the 5 comparisons that stopped the loop (inserting 2 and 1 ran off the left end, so those rounds need no stopping comparison), which sits right inside the range I to I + (n−1) = 20.",
  codeNote:
    "The basic version plus two variants. Binary insertion sort cuts comparisons to O(n log n) while the moves stay O(n²), which pays off for expensive strings or objects — it is what Timsort uses. In C++ that means `std::upper_bound` to find the slot and one `std::rotate` to shift the block. The range version sorts only `a[lo..hi]`, the shape a hybrid sort calls on its small runs.",
  problems: [
    { src: "LeetCode 2418", name: "Sort the People (hand-write insertion sort, moving names along with heights)", diff: "Easy" },
    { src: "LeetCode 147", name: "Insertion Sort List (a linked list needs no shifting, but you scan from the head)", diff: "Medium" },
    { src: "LeetCode 57", name: "Insert Interval (find the slot in a sorted list, then merge the overlaps)", diff: "Medium" },
    { src: "LeetCode 775", name: "Global and Local Inversions (when nothing is more than one slot off, every inversion is adjacent)", diff: "Medium" },
    { src: "LeetCode 1649", name: "Create Sorted Array through Instructions (the cost of each insertion, sped up with a BIT)", diff: "Hard" },
  ],
};
