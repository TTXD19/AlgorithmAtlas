import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Arrays and dynamic arrays, Big-O notation",
  applications: [
    {
      title: "A dozen values, and the code has to be written on paper",
      problem:
        "A whiteboard interview, or a small embedded device: you need a short list of numbers in order, with no library to call and no appetite for recursion.",
      why: "Bubble sort is two loops and a swap — five lines, hard to get wrong — and with a few dozen values O(n²) costs nothing. It is the shortest path to understanding what sorting even is.",
    },
    {
      title: "The data is almost sorted and you just want to confirm it",
      problem:
        "A leaderboard that updates once a day was already in order yesterday, and today only one or two people moved. You want to fix it with the least possible work.",
      why: 'Add the "stop if a whole pass made no swaps" check and already-sorted data finishes after a single scan, in O(n). When one person has dropped (sits too far forward), a single pass pushes them back; but someone who has risen (sits too far back) moves only one slot forward per pass, so a gap of d ranks costs d passes. Last place jumping to first still costs the full n−1 passes, so O(n²), and for that shape of data insertion sort is the safer choice.',
    },
    {
      title: "Understanding stable sorting and swap counts",
      problem:
        "Tied entries must keep their original order after sorting; or each swap writes to slow storage and you want to know how many swaps there actually were.",
      why: "Bubble sort only swaps adjacent elements when the left one is strictly greater, so equal values never trade places and it is stable by construction. The swap count is exactly the number of inversions in the data, which is also the minimum number of swaps possible when you may only swap neighbours. It is the textbook example for making both ideas concrete; if write counts really matter, use selection sort, which swaps at most n−1 times.",
    },
  ],
  cue: "Adjacent swaps, one largest value settled per pass, nearly sorted data you want to bail out of early, counting inversions, teaching or tiny inputs.",
  steps: [
    "Outer loop i runs from 0 to n−2, one iteration per pass. Set `swapped` to `False` at the start of each pass.",
    "Inner loop j runs from 0 to n−2−i: compare `a[j]` with `a[j+1]`, and if the left one is bigger, swap them and set `swapped` to `True`.",
    "At the end of the pass, `a[n−1−i]` holds that pass's largest value and is settled. Later passes never look at it again.",
    "If `swapped` is still `False`, the pass found no inversions at all, the array is already sorted, and you can stop early.",
    "For stability, only swap on a strict greater-than. Using `>=` makes equal elements trade places and the stability is gone.",
  ],
  demoNote:
    "The shared array [5, 2, 9, 1, 7, 3, 8, 4]. Each step is one comparison of neighbours, and both cells turn blue on a swap. Watch one more cell settle at the end of every pass (in green), and the fifth pass stop immediately because it made no swaps at all.",
  codeNote:
    "The basic version with the early exit, plus the bidirectional cocktail sort variant. Cocktail sort fixes the case where a small value at the very end needs n−1 passes to get back to the front (the so-called turtle), but that is the only case it helps with: the worst case is still O(n²).",
  problems: [
    { src: "LeetCode 1051", name: "Height Checker (sort, then count the positions that differ)", diff: "Easy" },
    { src: "LeetCode 2717", name: "Semi-Ordered Permutation (minimum adjacent swaps: bubble 1 and n to the two ends)", diff: "Easy" },
    {
      src: "LeetCode 283",
      name: "Move Zeroes (treat 0 as the largest value and do stable adjacent swaps, then work out the O(n) two-pointer version)",
      diff: "Easy",
    },
    { src: "LeetCode 75", name: "Sort Colors (three values — can you beat O(n²)?)", diff: "Medium" },
    {
      src: "LeetCode 3011",
      name: "Find if Array Can Be Sorted (you may only swap neighbours with the same popcount, so simulate bubble sort directly)",
      diff: "Medium",
    },
    { src: "LeetCode 912", name: "Sort an Array (O(n²) times out — feel the difference)", diff: "Medium" },
  ],
};
