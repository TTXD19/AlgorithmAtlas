import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Arrays and dynamic arrays, prefix sums",
  applications: [
    {
      title: "Exam results day: ranking 130,000 candidates by score",
      problem:
        "A single national exam has 130,000 candidates and scores are integers from 0 to 100. The results system has to rank everyone from the highest score down, with candidates on the same score keeping the order of their registration numbers.",
      why: "There are only 101 possible scores. Count how many candidates hold each score in 101 slots, use a prefix sum to find where each score's block begins in the final list, then drop every candidate straight into place. That is roughly 130,000 + 101 operations, whereas any comparison sort needs on the order of 130,000 × 17 comparisons in the worst case. Filling from the back makes tied candidates keep their registration order automatically.",
    },
    {
      title: "Grouping a population register by age",
      problem:
        "A national register of 23 million records has to be sorted by age, and the same pass should produce a table of how many people there are at each age. Ages are integers from 0 to 120.",
      why: "The first step of counting sort — tallying how often each value occurs — is that table; sorting merely expands it. Two passes over 23 million records plus a prefix sum across 121 slots is an order of magnitude less work than the roughly 500 million comparisons of n log n, and the whole batch is read and written sequentially.",
    },
    {
      title: "The median brightness of a photo, and each pass of radix sort",
      problem:
        "A 12-megapixel greyscale photo stores each pixel as a brightness from 0 to 255, and you want the median brightness to decide on exposure compensation. A second setting: splitting 32-bit integers into 4 bytes for a radix sort.",
      why: "The range holds only 256 values. Fill 256 slots, accumulate from dark to bright, and the slot where the running total passes half the pixels is the median — no need to actually sort 12 million numbers. And every pass of radix sort needs exactly a sort that is stable over a range of 256, which is the stable counting sort in this lesson.",
    },
  ],
  cue: "Integer keys, a small range (k not much bigger than n), scores, ages, bytes, histograms, equal values that must keep their original order, each pass of a radix sort, and anything that has to beat O(n log n).",
  steps: [
    "Confirm the keys are integers and find the minimum `lo` and maximum `hi`. The approach only pays off when the range `k = hi − lo + 1` is within a small factor of n.",
    "Allocate a `count` array of length k and make one pass over the input doing `count[x − lo] += 1`.",
    "Sorting plain numbers: for v from 0 to k − 1, emit `v + lo` exactly `count[v]` times, and you are done.",
    "Sorting objects stably: accumulate the prefix sums with `count[v] += count[v − 1]`, so that `count[v]` becomes the number of elements with key ≤ v.",
    "Scan the input **from the back**: do `count[key] −= 1` and place the element at `out[count[key]]`. When the scan finishes, `out` holds the stably sorted result.",
  ],
  demoNote:
    "The shared array [5, 2, 9, 1, 7, 3, 8, 4] plus one extra 2 and one extra 5, with ᵃ and ᵇ marking the original order of the equal values. The three phases run in sequence: counting, prefix accumulation, and filling from the back. Blue marks the input element being processed and, in the output row, the slot it was just placed in; yellow marks its count slot, and green marks output that is already settled. No two elements are ever compared with each other anywhere in the run. At the end, check that 2ᵃ still precedes 2ᵇ and 5ᵃ still precedes 5ᵇ.",
  codeNote:
    "Two versions: a compact one for plain integers (shifting by the minimum, so negatives work), and a stable one for objects, demonstrated by sorting students by score with ties keeping their original order. The C++ stable version is a template, with the key function and the range k supplied by the caller, so each pass of a radix sort can use it directly.",
  problems: [
    { src: "LeetCode 1051", name: "Height Checker (heights only run 1–100, so count and compare directly)", diff: "Easy" },
    { src: "LeetCode 1122", name: "Relative Sort Array (counting over the range 0–1000)", diff: "Easy" },
    { src: "LeetCode 791", name: "Custom Sort String (count each of the 26 letters, then emit in the given order)", diff: "Medium" },
    { src: "LeetCode 274", name: "H-Index (clamp citation counts above n to n, squeezing the range into 0–n)", diff: "Medium" },
    { src: "LeetCode 2785", name: "Sort Vowels in a String (counting sort over the vowels only)", diff: "Medium" },
  ],
};
