import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Singly Linked List",
  applications: [
    {
      title: "Reference cycles in garbage collectors and data structures",
      problem:
        "Object A points to B, B points to C, and C points back to A. The obvious way to detect that is to record every node you have visited in a set, but that costs O(n) extra memory.",
      why: "Run two pointers along the same path, one fast and one slow: with no cycle, the fast one reaches the end first; with a cycle, the fast one keeps looping and eventually catches the slow one from behind. O(1) space. This is Floyd's cycle-finding algorithm.",
    },
    {
      title: "Finding the middle in a single pass",
      problem:
        "Splitting a list in half — for merge sort, or to check whether it is a palindrome — means knowing where the middle is. But a list has no length field, so counting it first and then walking halfway costs two passes.",
      why: "Move fast two steps for every one of slow's, and when fast reaches the end slow has walked exactly half. One pass, in four lines of code.",
    },
    {
      title: "The period of a pseudo-random generator",
      problem:
        "Applying a function f over and over, x → f(x) → f(f(x)), must eventually repeat, because there are only finitely many states. You want to know where the loop starts and how long it is, without storing every state.",
      why: "Treat \"the successor of x is f(x)\" as a linked list and it is exactly the find-the-cycle-start problem. Pollard's rho factorisation uses the same trick.",
    },
  ],
  cue: "Whether there is a cycle, where a cycle starts, the middle node, the kth node from the end, only one pass allowed, no extra space allowed, two pointers moving at different speeds.",
  steps: [
    "`slow = fast = head`. The loop condition is always `while fast and fast.next`, which is what keeps `fast.next.next` from blowing up.",
    "Each round: `slow = slow.next` and `fast = fast.next.next`.",
    "**Finding the middle**: return slow once the loop ends. On an even-length list it stops at the second middle node; start fast from `head.next` if you want the first one instead.",
    "**Detecting a cycle**: check `slow is fast` after moving them each round. Compare after the move, since the two start out equal by definition.",
    "**The start of the cycle**: once they meet, set `slow = head` and move both one step at a time until they meet again. **The kth node from the end**: send fast k steps ahead, then move both at the same speed.",
  ],
  demoNote:
    "\"Find the middle\" shows where slow ends up when fast runs off the end. \"Detect a cycle\" shows how the two pointers meet inside the loop, and how the second phase locates the node where the cycle begins.",
  codeNote:
    "Four functions built on one skeleton: the middle node, cycle detection, the start of the cycle, and the kth node from the end. Notice that the loop condition is identical in all of them — only when they stop, and what they do afterwards, differs.",
  problems: [
    { src: "LeetCode 876", name: "Middle of the Linked List", diff: "Easy" },
    { src: "LeetCode 141", name: "Linked List Cycle", diff: "Easy" },
    { src: "LeetCode 142", name: "Linked List Cycle II (where the cycle starts)", diff: "Medium" },
    { src: "LeetCode 19", name: "Remove Nth Node From End of List (a fixed gap)", diff: "Medium" },
    { src: "LeetCode 287", name: "Find the Duplicate Number (treat the array as a list and find the cycle)", diff: "Medium" },
    { src: "LeetCode 143", name: "Reorder List (middle, reverse, then interleave)", diff: "Medium" },
  ],
};
