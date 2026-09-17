import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Arrays, binary tree basics",
  applications: [
    {
      title: "Process scheduling in an operating system",
      problem:
        "Hundreds of processes are waiting for the CPU, each with its own priority, and new ones arrive at any moment. Every time the CPU frees up you have to pick the highest-priority process, but re-sorting the whole queue is far too slow.",
      why: "A heap guarantees only that the element on top is the extreme one; it says nothing about the order of everything else. That is why inserting and removing each cost O(log n) rather than the O(n log n) of a sort. The Linux scheduler and Java's PriorityQueue are both built on this structure.",
    },
    {
      title: "Event simulation and timers",
      problem:
        "A game server is running tens of thousands of timers: ability cooldowns, buffs expiring, monsters respawning. On every tick it has to ask which one fires next.",
      why: "Put the expiry times into a min-heap and the top of the heap is always the one due soonest. Node.js timers and the Go runtime's timers are implemented exactly this way.",
    },
    {
      title: "The engine inside Dijkstra",
      problem:
        "The shortest-path algorithm has to pick, on every round, the unsettled node with the smallest distance so far. Scanning all of them costs O(V) per round and O(V²) overall.",
      why: "With a heap each round costs O(log V) and the whole run becomes O((V+E) log V). The heap is the reason a great many graph algorithms run as fast as they do.",
    },
  ],
  cue: "Pulling out the largest or smallest at any moment, priorities, whatever is due first, top-K, data that keeps arriving while you keep taking extremes out.",
  steps: [
    "**push(x)**: append x to the end of the array and let i be its index.",
    "While i is not the root and `a[i] < a[parent]`: swap the two and move i up to the parent. Otherwise stop.",
    "**pop()**: save `a[0]` as the return value, move the last element into `a[0]`, shorten the array by one, and set i = 0.",
    "Find c, the smaller of i's two children. If `a[c] < a[i]`: swap them, move i to c and repeat; otherwise stop.",
    "For a max-heap, reverse the direction of the comparisons — or negate the values and push them into a min-heap, the way Python does.",
  ],
  demoNote:
    "A fixed script of operations. The tree view is on top and the array view of the very same data is on the right; the two are one and the same thing. Amber marks the pair of nodes being compared, blue the pair that was just swapped.",
  codeNote:
    "Write one by hand to get sift up and sift down straight, then reach for `heapq` or `std::priority_queue` in practice. Note that Python gives you only a min-heap, while C++ defaults to a max-heap.",
  problems: [
    { src: "LeetCode 1046", name: "Last Stone Weight (a max-heap)", diff: "Easy" },
    { src: "LeetCode 703", name: "Kth Largest Element in a Stream", diff: "Easy" },
    { src: "LeetCode 23", name: "Merge k Sorted Lists (the heap holds the k list heads)", diff: "Hard" },
    { src: "LeetCode 621", name: "Task Scheduler", diff: "Medium" },
    { src: "LeetCode 1942", name: "The Number of the Smallest Unoccupied Chair (two heaps acting as timers)", diff: "Medium" },
  ],
};
