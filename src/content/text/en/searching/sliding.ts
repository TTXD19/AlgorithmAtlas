import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Two pointers, hash tables",
  applications: [
    {
      title: 'The "average latency over the last 5 minutes" on a monitoring dashboard',
      problem:
        "Latency samples arrive once a second, and the dashboard has to refresh the average over the last 300 seconds every second. Re-adding 300 numbers every second stops keeping up once the volume grows.",
      why: "Only two samples change each second: a new one arrives and the oldest one leaves. Keep a running total, add one and subtract one, and you have the new average in O(1) per second. That is a fixed-length sliding window.",
    },
    {
      title: "API rate limiting: at most 100 calls every 10 seconds",
      problem:
        "Every incoming request has to answer the question \"has this user already made 100 calls in the last 10 seconds?\". Storing the entire history and filtering it on each request is both too slow and too large.",
      why: "Keep only the timestamps inside the window: when a request arrives, first drop the expired ones off the left end, then look at how many are left. Each timestamp goes in once and comes out once, which is amortised O(1). The window spans a fixed amount of time but holds a variable number of requests, which is why it needs a queue rather than a fixed-size array.",
    },
    {
      title: "Longest substring without repeats, shortest subarray that qualifies",
      problem:
        "The longest stretch of a string with no repeated character, or the shortest stretch of an array whose sum is at least S. Enumerating every interval by brute force is O(n²), or even O(n³).",
      why: "Extend the right end, and when the condition breaks, pull the left end right until it holds again — both ends only ever move right. Each element enters and leaves the window once, so the whole thing is O(n). Spotting a contiguous interval plus a monotone validity condition is what tells you it is a variable window.",
    },
  ],
  cue: "Contiguous subarrays or substrings, the last k items, the last t seconds, the longest or shortest interval satisfying a condition, streaming statistics, rate limiting, add one and remove one.",
  steps: [
    "Confirm the problem is about a **contiguous** interval and that validity is monotone as the interval grows and shrinks (for the longest: shrinking keeps it valid; for the shortest: growing keeps it valid). Decide what statistic the window carries — it has to support O(1) insertion and removal.",
    "`l = 0` and the statistic empty. `for r in range(n)`: add `a[r]` to the statistic.",
    "`while the window is invalid`: remove `a[l]` from the statistic and do `l += 1`. This inner loop runs at most n times in total, not n times per step.",
    "The window is valid now, so update the answer with `r − l + 1` (for the longest). For the shortest, put that update inside the shrinking loop and change its condition to shrink while the window is valid.",
    "For a fixed length, drop the validity test altogether: once `r ≥ k`, remove `a[r − k]` on every step, and the window is always exactly k long.",
  ],
  demoNote:
    "The longest substring without repeating characters. The blue cells are the current window, and below it is the set of characters inside the window. When r lands on a character already in the set (shown in amber), it is not added yet; l moves right until that character leaves, and only then does it go in. The green underline marks the best interval so far.",
  codeNote:
    "Four pieces: the longest substring without repeats as a variable window, the maximum average as a fixed window, the shortest qualifying interval as the other kind of variable window, and a rate limiter whose window is a queue. Notice that the longest and shortest variants update the answer in different places.",
  problems: [
    { src: "LeetCode 3", name: "Longest Substring Without Repeating Characters", diff: "Medium" },
    { src: "LeetCode 643", name: "Maximum Average Subarray I (fixed window)", diff: "Easy" },
    { src: "LeetCode 209", name: "Minimum Size Subarray Sum (shortest valid window)", diff: "Medium" },
    { src: "LeetCode 424", name: "Longest Repeating Character Replacement", diff: "Medium" },
    { src: "LeetCode 567", name: "Permutation in String (fixed window plus counts)", diff: "Medium" },
    { src: "LeetCode 76", name: "Minimum Window Substring", diff: "Hard" },
  ],
};
