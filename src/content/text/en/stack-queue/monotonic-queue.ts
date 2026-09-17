import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Queues and deques, monotonic stacks, prefix sums",
  applications: [
    {
      title: "A monitoring dashboard: peak latency over the last 60 seconds",
      problem:
        'One number arrives per second and you have to report "the maximum of the last 60" at any moment. Rescanning 60 values each time is O(k), across 86,400 seconds a day — and k is often in the thousands.',
      why: "A monotonic queue makes the maximum O(1) as the window slides. Each number enters and leaves the queue exactly once, so the whole run is O(n), independent of k.",
    },
    {
      title: "Maximum filters in image processing",
      problem: "Replacing each pixel with the maximum over the surrounding k×k neighbourhood (the dilation operator). Done directly it is O(n·k²).",
      why: "Run a one-dimensional sliding window maximum along every row, then along every column: two O(n) passes. The monotonic queue is the standard tool for window extrema like this.",
    },
    {
      title: "Speeding up a dynamic programming transition",
      problem:
        "Plenty of DP transitions look like dp[i] = max(dp[j]) + something, with j ranging over [i−k, i−1]. Scanning every j for every i is O(nk).",
      why: '"The maximum over a range" sliding along with i is exactly the shape a monotonic queue handles, collapsing the transition to O(1). This is a standard optimisation in advanced DP.',
    },
  ],
  cue: "Maximum or minimum over a sliding window, extrema over a fixed-length range, the last k items, how an extremum updates as a window moves, the range max in a DP transition.",
  steps: [
    "Build a deque of **indices** (not values, so you can tell when an entry has expired). Keep the values decreasing for a maximum, increasing for a minimum.",
    "For each i, **clear the back first**: `while dq and nums[dq[-1]] <= nums[i]: dq.pop()`. Using `<=` evicts older equal elements too, which keeps the queue shorter.",
    "Push i onto the back.",
    "**Then clear the front**: `if dq[0] <= i − k: dq.popleft()`. At most one entry can expire per iteration, so an if is enough.",
    "Once `i ≥ k − 1` (the window is full), `nums[dq[0]]` is the answer for that window.",
  ],
  demoNote:
    "Window size 3. Each step first pops everything smaller than the new element off the back (shown struck through), then checks whether the front has expired. Green is the front of the deque, which is the current window's maximum.",
  codeNote:
    "Sliding window maximum and minimum differ by a single comparison operator. The third snippet combines prefix sums with a monotonic queue to solve \"shortest subarray with sum at least k\", an advanced use of the technique.",
  problems: [
    { src: "LeetCode 239", name: "Sliding Window Maximum", diff: "Hard" },
    {
      src: "LeetCode 1438",
      name: "Longest Continuous Subarray With Absolute Diff ≤ Limit (maintain a max and a min at once)",
      diff: "Medium",
    },
    { src: "LeetCode 862", name: "Shortest Subarray with Sum at Least K", diff: "Hard" },
    { src: "LeetCode 1696", name: "Jump Game VI (DP plus a monotonic queue)", diff: "Medium" },
    { src: "LeetCode 1425", name: "Constrained Subsequence Sum", diff: "Hard" },
  ],
};
