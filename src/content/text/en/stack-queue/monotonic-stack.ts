import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Stacks",
  applications: [
    {
      title: "Stock prices: the first day after today that closes higher",
      problem:
        "For every day, ask where the first higher price after it is. Scanning forward from each day is O(n²) — with 100,000 days that is ten billion comparisons.",
      why: "Sweep left to right and keep the days that have not found an answer yet on a stack. When a new day arrives, every day on the stack with a lower price gets that day as its answer, and they can all be popped and settled at once. Each day is pushed once and popped once: O(n).",
    },
    {
      title: "The largest rectangle in a histogram",
      problem:
        "Given a row of bars, find the rectangle with the largest area. Its height is set by the shortest bar it spans, so you need to know, for each bar, where the first shorter bar on each side is.",
      why: "That is exactly the question a monotonic stack answers. Keep a stack of increasing heights, and the moment a bar is popped you know both its left boundary (the new top) and its right boundary (the current position).",
    },
    {
      title: "Trapping rain water, and how many buildings you can see",
      problem:
        "\"Hemmed in by something taller on both sides\" and \"the first thing to the right that blocks the view\" — this whole family of questions has the same shape.",
      why: "They are all variations on \"find the first larger or smaller element to the left or right\". Recognise the shape and you know to reach for a monotonic stack.",
    },
  ],
  cue: "Next greater or smaller, the first one taller than this, left and right boundaries, each element looking rightward, an O(n²) double loop that only looks for the first element satisfying a condition.",
  steps: [
    "Confirm that the problem is \"for each element, find the **first element in some direction** that satisfies a size condition\".",
    "Pick the direction of monotonicity: **decreasing** stack when looking for something larger, **increasing** when looking for something smaller. Store **indices** on the stack so you can compute distances and look values up.",
    "Left to right, for each i: `while stack and condition(nums[stack[-1]], nums[i])`, pop the top j and record `ans[j]` (the answer is either i or nums[i]).",
    "Push i. If you also need \"the first one on the left\", the new top at the moment j is popped is j's left boundary.",
    "Whatever is still on the stack after the sweep has no answer (set it to −1 or 0). When everything has to be settled, append a sentinel value at the end.",
  ],
  demoNote:
    "Daily temperatures. Yellow marks the days still on the stack waiting for an answer; when a new day is warmer than the top, that top is popped and its answer filled in (green). Notice that the temperatures on the stack always decrease from bottom to top.",
  codeNote:
    "Daily temperatures, the general next greater element, and the largest rectangle in a histogram, which uses both boundaries at once. All three share the same skeleton; only the pop condition and what gets recorded on the pop change.",
  problems: [
    { src: "LeetCode 739", name: "Daily Temperatures", diff: "Medium" },
    { src: "LeetCode 496", name: "Next Greater Element I", diff: "Easy" },
    { src: "LeetCode 503", name: "Next Greater Element II (circular: sweep twice)", diff: "Medium" },
    { src: "LeetCode 901", name: "Online Stock Span", diff: "Medium" },
    { src: "LeetCode 84", name: "Largest Rectangle in Histogram", diff: "Hard" },
    { src: "LeetCode 42", name: "Trapping Rain Water (the monotonic stack version)", diff: "Hard" },
  ],
};
