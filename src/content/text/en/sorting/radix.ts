import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Counting Sort",
  applications: [
    {
      title: "Sorting and de-duplicating 29 million phone numbers",
      problem:
        "A carrier has to sort 29 million 10-digit mobile numbers to find the ones registered twice. The numbers have a fixed width, but treated as integers their range is 10¹⁰ wide — far too big for a counting sort's array.",
      why: "Split each number into its 10 digits and, starting from the last one, run 10 passes: each pass drops the numbers into buckets 0-9 by that digit and collects them back in order. Every pass is a plain sequential scan, about 300 million simple operations in total. A comparison sort needs roughly n log₂ n ≈ 700 million string comparisons, and each of those walks the digits anyway. Once sorted, duplicates are guaranteed to sit next to each other.",
    },
    {
      title: "ORDER BY in an analytical database",
      problem:
        "A warehouse query has to sort a hundred million rows by a 32-bit integer customer ID before grouping and aggregating them. A comparison sort's branch mispredictions and scattered memory access make it the slowest stage of the query.",
      why: "Treat the key as 4 bytes and handle one byte per pass: count how many rows have each byte value, turn that into starting offsets, then copy the rows into a scratch buffer in order. Four passes and it is sorted, and each pass's count array is only 256 slots, small enough to live entirely in the CPU cache. Analytical engines such as DuckDB do exactly this, normalising the sort key into fixed-width bytes and then radix sorting it.",
    },
    {
      title: "A million samples from a Monte Carlo simulation",
      problem:
        "A simulation generates a million random numbers uniformly distributed over [0, 1). They need to be sorted so you can plot the empirical cumulative distribution and read off the percentiles.",
      why: "The values are floats, so they cannot index an array directly, but their distribution is known to be uniform. Open a million buckets and drop value x into bucket ⌊x·n⌋: on average each bucket holds one item, sorting inside a bucket costs almost nothing, and concatenating them in order gives you the answer in expected O(n). That is bucket sort — it bets on the distribution of the data rather than on the width of the key.",
    },
  ],
  cue: "Integers or fixed-length strings, a range too wide to count directly, a fixed number of digits (phone numbers, dates, IP addresses, 32-bit IDs), needing to beat O(n log n), uniformly distributed floats, bucketing, maximum gap.",
  steps: [
    "Pick the base and the digit count: decimal data means b = 10 and d = the number of digits in the largest value; a 32-bit integer means b = 256 and d = 4; a fixed-length string uses one digit per character.",
    "Start at the **lowest digit**. On pass j, extract that digit from each element, for example `x // b^j % b` or `(x >> 8j) & 0xFF`.",
    "Run a **stable** counting sort on that digit: count how many elements have each value, prefix-sum the counts into the starting offset of each run, then copy the elements into a scratch array in order.",
    "The scratch array becomes the input to the next pass. Move up one digit, and after d passes the whole sequence is sorted.",
    "For uniformly distributed floats, switch to bucket sort: open n buckets, drop `x` into bucket `min(⌊x·n⌋, n−1)`, sort inside each bucket, and concatenate them in order.",
  ],
  demoNote:
    "Nine two-digit numbers. The tens digits of the first eight are the shared array [5, 2, 9, 1, 7, 3, 8, 4], the units digits are deliberately scrambled, and one extra value, 24, makes the tens digit 2 appear twice. The first pass buckets by units digit into buckets 0-9 and collects them back in order; the second pass does the same by tens digit. The underline marks the digit this pass is reading, blue is the element being bucketed right now, grey is everything already in a bucket, and green is the sequence collected back. Watch bucket 2 on the second pass: 24 comes before 29 because the first pass already put 24 ahead of 29 by units digit, and this pass stably preserves that order.",
  codeNote:
    "The Python side has decimal LSD radix sort (change the base argument and it reads one byte per pass), a version for fixed-length strings, and bucket sort. The C++ side is the shape you meet in practice: 8 bits per pass over a 32-bit integer, always 4 passes, using a count array to work out where each run starts before copying the elements across; bucket sort follows. Every pass in both languages is stable, which is what makes radix sort correct in the first place.",
  problems: [
    { src: "LeetCode 1356", name: "Sort Integers by The Number of 1 Bits (values stay under 10⁴, so the bit count is only 0-13: bucket on it)", diff: "Easy" },
    { src: "LeetCode 1502", name: "Can Make Arithmetic Progression From Sequence (once you know the common difference, each value's slot is a direct calculation)", diff: "Easy" },
    { src: "LeetCode 451", name: "Sort Characters By Frequency (the frequency is the bucket index)", diff: "Medium" },
    { src: "LeetCode 2343", name: "Query Kth Smallest Trimmed Number (radix sort on fixed-length strings)", diff: "Medium" },
    { src: "LeetCode 220", name: "Contains Duplicate III (buckets of width valueDiff + 1)", diff: "Hard" },
  ],
};
