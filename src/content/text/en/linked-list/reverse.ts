import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Singly linked lists, recursion",
  applications: [
    {
      title: "The linked-list question every interview asks",
      problem:
        "Reverse Linked List is the warm-up question at almost every company, and above it sit reversing a range, reversing in groups of k, and checking whether a list is a palindrome. All of them are built on the same three-pointer move.",
      why: "Reversing a list is the purest exercise in pointer manipulation: each node does exactly one thing — turn its arrow around — but get the order wrong and the whole list breaks. Practise until you write it without thinking, because every later linked-list problem is a variation on this move.",
    },
    {
      title: "Adding numbers stored as lists, and checking palindromes",
      problem:
        "Two large numbers stored as lists have to be added (with the ones digit at the end), or a list has to be checked for reading the same forwards and backwards. A list can only be walked forwards; there is no way to read it from the tail.",
      why: "Reverse the second half and you can walk inwards from both ends at once. This is the standard trick for handling a backwards problem in O(1) space, and it is cheaper in memory than copying the list into an array.",
    },
    {
      title: "Seeing the trade-off between recursion and iteration",
      problem:
        "Same task: the iterative version needs three pointers, the recursive version is four lines but costs an O(n) call stack. Give recursion a long enough list and it blows up.",
      why: "There is no better problem for putting the two styles side by side. The iterative version is what you should ship, and the recursive one is the finest example of the \"trust a smaller copy of yourself\" way of thinking.",
    },
  ],
  cue: "Reversing, reading backwards, starting from the tail, palindrome lists, groups of k, reversing a range, the prev / cur / next trio of pointers.",
  steps: [
    "`prev = None` and `cur = head`.",
    "Loop while `cur`. Inside, **first** do `nxt = cur.next` to keep hold of the way forward.",
    "`cur.next = prev` turns the arrow around. This is the only line that actually changes the structure.",
    "`prev = cur` and `cur = nxt` step both pointers forward together. The order matters: the other way round, cur loses track of the original next node.",
    "When the loop ends, return `prev`. Run it once each on an empty list, a single node and two nodes to check the boundaries.",
  ],
  demoNote:
    "Step through the iterative version and watch how each round's four moves turn one node's arrow around. Green marks the part already reversed, and prev always sits at its head.",
  codeNote:
    "The iterative version, the recursive version, and reversing a range by head insertion. All three are worth writing by hand once, and in the recursive one pay particular attention to what the line `head.next.next = head` is doing.",
  problems: [
    { src: "LeetCode 206", name: "Reverse Linked List", diff: "Easy" },
    { src: "LeetCode 234", name: "Palindrome Linked List (find the middle, then reverse the second half)", diff: "Easy" },
    { src: "LeetCode 92", name: "Reverse Linked List II (reverse a range)", diff: "Medium" },
    { src: "LeetCode 24", name: "Swap Nodes in Pairs", diff: "Medium" },
    { src: "LeetCode 25", name: "Reverse Nodes in k-Group", diff: "Hard" },
  ],
};
