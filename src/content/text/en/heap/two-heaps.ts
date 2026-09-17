import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Binary Heap",
  applications: [
    {
      title: "The p50 latency on a monitoring dashboard",
      problem:
        "Thousands of request latencies arrive every second and the dashboard has to show the median live. Unlike the mean, a median cannot simply be accumulated; recomputing it means sorting first, at O(n log n) every time.",
      why: "Split the data into a smaller half and a larger half and give each one its own heap. The median is always one of the two heap tops, or their average, and absorbing a new value costs only O(log n).",
    },
    {
      title: "Scheduling with a threshold: the IPO problem",
      problem:
        "You start with some capital. Each project needs a certain amount of capital before it can begin and pays a profit once it is done. You may take on at most K projects — how do you finish with the most capital?",
      why: "One heap is ordered by the capital required and unlocks whatever you can currently afford; the other is ordered by profit and picks the most lucrative of the unlocked ones. Each heap owns one dimension, which is the other shape two heaps take.",
    },
    {
      title: "The median of a sliding window",
      problem:
        "The median share price over the last 30 days, sliding forward one day at a time. As well as adding a new value you have to remove an old one.",
      why: "The same two heaps, plus lazy deletion: a removed element is noted in a hash table and only really discarded once it surfaces at the top of a heap. This is the advanced form of the streaming median.",
    },
  ],
  cue: "Median, data stream, one half against the other half, two dimensions each with their own ordering, needing the largest and the smallest at once.",
  steps: [
    "Prepare `low` (a max-heap) and `high` (a min-heap). Python has no max-heap, so `low` stores negated values.",
    "For a new element x: if `low` is empty or `x ≤ max(low)`, push it onto `low`; otherwise push it onto `high`. This step maintains \"left half ≤ right half\".",
    "Rebalance: if `len(low) > len(high) + 1`, move `low`'s top over to `high`; if `len(high) > len(low)`, move `high`'s top over to `low`.",
    "Read the median: when `low` holds more, return `max(low)`; when both hold the same number, return `(max(low) + min(high)) / 2`.",
    "When old elements have to be removed (a sliding window), record them in a hash table as pending deletions, pop them for real once they surface at the top, and subtract the pending count when comparing sizes.",
  ],
  demoNote:
    "Eight latency readings arrive in order. Notice how little work each one takes: decide which side it goes on, move one element across if that is needed, then read the median straight off the heap tops.",
  codeNote:
    "A full implementation of the streaming median, plus the IPO problem to show the other use of the pattern, where each heap owns one dimension.",
  problems: [
    { src: "LeetCode 295", name: "Find Median from Data Stream", diff: "Hard" },
    { src: "LeetCode 502", name: "IPO", diff: "Hard" },
    { src: "LeetCode 480", name: "Sliding Window Median (lazy deletion)", diff: "Hard" },
    { src: "LeetCode 253", name: "Meeting Rooms II (one heap for the end times)", diff: "Medium" },
    { src: "LeetCode 1825", name: "Finding MK Average", diff: "Hard" },
  ],
};
