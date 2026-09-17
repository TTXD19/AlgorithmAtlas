import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array & Dynamic Array, Bubble Sort",
  applications: [
    {
      title: "An access-control panel tidying card records in EEPROM",
      problem:
        "An external EEPROM holds 100 card records that have to be ordered by card number before they can be binary-searched. The controller has 2 KB of RAM, nowhere near enough to hold the whole set, so it reads and writes straight to the chip — and each address only survives about a hundred thousand writes.",
      why: "Comparisons are reads, and reads do not wear the chip out; writes do. Selection sort makes at most one swap per pass, so 100 records cost at most 99 swaps and 198 record writes. Bubble sort needs up to 4,950 swaps — fifty times the write volume.",
    },
    {
      title: "A warehouse arm reordering a row of crates",
      problem:
        "Twelve bays hold crates that must be rearranged into tomorrow's shipping order. Scanning a barcode takes a fraction of a second, but swapping two crates means three trips through a buffer bay and close to a minute of arm time.",
      why: "Selection sort uses the cheap scan to decide which crate belongs in the first bay, and only moves it once that is settled — one move, not several. Twelve crates need at most 11 swaps, and when the crate ids are all distinct that count is exactly the theoretical minimum for sorting by swaps alone. Bubble sort would need up to 66 swaps.",
    },
    {
      title: "A Wi-Fi module that only tries the three strongest access points",
      problem:
        "A scan at boot finds 20 access points, and the firmware wants to try the three strongest in descending order of signal. The code runs on a microcontroller with no standard library, and allocating memory just for this is out of the question.",
      why: "Every pass of selection sort locks in one final position, so picking the maximum each pass and stopping after three leaves the answer in the first three slots: 19 + 18 + 17 = 54 comparisons, entirely in place. When both k and n are small this is the least fussy option; for large or streaming data, reach for a top-k heap instead.",
    },
  ],
  cue: "Minimising swaps or writes, cheap comparisons but expensive moves, locking in one final position per pass, only needing the first few elements, minimum number of swaps, small data where stability does not matter.",
  steps: [
    "The outer loop runs `i` from 0 to n−2. At that point `a[0..i−1]` is sorted and `a[i..n−1]` is the unsorted region.",
    "Set `m = i`. The inner loop scans `j` from i+1 to n−1 and sets `m = j` whenever `a[j] < a[m]`. The inner loop only updates the index; it never swaps.",
    "Once the inner loop finishes, swap `a[i]` with `a[m]` if `m ≠ i`. From here on `a[i]` holds its final value and is never touched again.",
    "The last slot needs no pass: the first n−1 slots took all the smaller elements, so whatever is left must be the largest. To sort descending, flip the comparison to `>` and pick the maximum each pass.",
    "If you only want the k smallest, stop the outer loop after k passes and `a[0..k−1]` is the answer, in O(kn). If you need stability, replace the swap with \"lift out `a[m]`, shift `a[i..m−1]` right by one, drop it into `a[i]`\".",
  ],
  demoNote:
    "The same array as bubble sort, [5, 2, 9, 1, 7, 3, 8, 4], sorted ascending. Each step looks at one slot of the unsorted region: blue is the slot being examined, yellow is the current minimum candidate, and yellow jumps whenever something smaller turns up. At the end of a pass the two blue slots are that pass's one and only swap, and green is the sorted region on the left. Notice that in passes 2 and 7 the minimum is already in place, so no swap happens. The run ends with 28 comparisons and just 5 swaps (this data has 3 cycles, and 8 − 3 = 5, which is the minimum). Bubble sort needs 13 swaps on the same array.",
  codeNote:
    "The basic version returns the swap count so you can compare it directly with bubble sort. The two variants are the k-pass version that extracts the k smallest, and the stable version that shifts right instead of swapping. The main program runs both the plain and the stable version over records with tied scores, so you can see how swapping scrambles the order of equal elements. The C++ version takes a template plus a comparison function, so one body sorts integers and records alike.",
  problems: [
    { src: "LeetCode 414", name: 'Third Maximum Number (three "pick the largest" passes, with duplicates counted once)', diff: "Easy" },
    { src: "LeetCode 2500", name: "Delete Greatest Value in Each Row (every pass picks the largest value in each row)", diff: "Easy" },
    { src: "LeetCode 670", name: "Maximum Swap (a descending selection sort that makes a single swap)", diff: "Medium" },
    { src: "LeetCode 969", name: "Pancake Sorting (every pass flips the largest value to the end)", diff: "Medium" },
    { src: "LeetCode 2471", name: "Minimum Number of Operations to Sort a Binary Tree by Level (minimum swaps = n − number of cycles)", diff: "Medium" },
    { src: "LeetCode 765", name: "Couples Holding Hands (another minimum-swaps problem)", diff: "Hard" },
  ],
};
