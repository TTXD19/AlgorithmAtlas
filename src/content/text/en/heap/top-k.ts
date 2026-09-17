import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Binary heaps, hash tables",
  applications: [
    {
      title: 'The "top 10 trending articles" on a homepage',
      problem:
        "Ten million articles each carry a view count, and the top ten has to be refreshed every five minutes. Sorting the lot is O(n log n), and you only ever wanted ten of them.",
      why: "Keep a min-heap of size 10, whose top is the cut-off for getting onto the list. Scan every article: anything below the cut-off is skipped outright, and only something above it gets swapped in. That is O(n log 10), barely more than the cost of a single pass.",
    },
    {
      title: "Shortlisting the top K candidates in a recommender",
      problem:
        "A few hundred thousand products are scored for each user, but only the 50 highest-scoring ones go through to the next stage.",
      why: "The same Top-K heap. When K is far smaller than n, the heap costs only O(K) of memory, which makes it a good fit for a stream — you never have to hold every score at once.",
    },
    {
      title: "Log analysis: the most frequent IP addresses",
      problem: "A billion lines of access logs, and you want the 100 IP addresses that made the most requests.",
      why: "Count with a hash table first, then run Top-K over (count, IP). When the counts have a bounded range, bucket sort can even get this down to O(n), which is the other route worth knowing in this topic.",
    },
  ],
  cue: "Top K largest or smallest, the Kth largest, the K most frequent, the K nearest to some point, K far smaller than n, data arriving as a stream.",
  steps: [
    "Fix the direction: top K largest wants a **min**-heap, top K smallest wants a **max**-heap. When the comparison is on a count or a distance, compute that value first and store `(value, element)` tuples in the heap.",
    "Scan the elements one at a time. While the heap holds fewer than K, simply push.",
    "Once it is full, compare each new element with the top: **no better than the top** means skip it (O(1)), and **better than the top** means pop the top and push the new one instead (Python's `heapreplace` does both in one go).",
    "When the scan ends, the heap is the answer. For sorted output, pop repeatedly and reverse; if you only want the Kth largest, just read the top.",
    "If K is close to n, the data is not a stream and you only need this once, quickselect or a plain sort may well be faster; when the comparison is on counts, consider bucket sort.",
  ],
  demoNote:
    "K = 3. The view counts are read one at a time, and the top of the heap (in amber) is the cut-off for getting onto the list. Notice how many values never touch the heap at all and are skipped outright.",
  codeNote:
    "Three variations — top K largest, the Kth largest, and the K most frequent — plus the O(n) bucket sort version for comparison. C++ also demonstrates `nth_element`, which is the standard library's quickselect.",
  problems: [
    { src: "LeetCode 215", name: "Kth Largest Element in an Array (do it once with a heap and once with quickselect)", diff: "Medium" },
    { src: "LeetCode 347", name: "Top K Frequent Elements (try the bucket sort version)", diff: "Medium" },
    { src: "LeetCode 973", name: "K Closest Points to Origin", diff: "Medium" },
    { src: "LeetCode 692", name: "Top K Frequent Words (ties broken lexicographically)", diff: "Medium" },
    { src: "LeetCode 1985", name: "Find the Kth Largest Integer in the Array (compared as strings)", diff: "Medium" },
  ],
};
