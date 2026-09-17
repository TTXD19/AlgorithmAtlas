import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Big-O notation",
  applications: [
    {
      title: "Why arr[1000000] is just as fast as arr[0]",
      problem:
        "The pixels of an image, the samples of an audio clip, the rows of a database — what programs do most is grab the i-th one. If reaching the millionth item meant counting from the start, nothing would ever get done.",
      why: "An array keeps its elements in contiguous memory, so the address of element i is simply the base plus i × the size of one slot. One multiplication and one addition gets you there: O(1) random access.",
    },
    {
      title: "Why list.insert(0, x) slows a program to a crawl",
      problem:
        "Someone writes a loop that inserts every new record at the front of a list. At ten thousand records it is fine; at a hundred thousand the whole program grinds to a halt.",
      why: "That is the price of contiguous memory: inserting in the middle pushes everything after it back one slot. Each insert is O(n), and n of them is O(n²). Once you see that, you know to switch to append or to a deque.",
    },
    {
      title: "list / vector / ArrayList in every language",
      problem:
        "Python's list, C++'s vector, Java's ArrayList, JavaScript's array — all of them are containers you can keep pushing onto without declaring a size up front. How do they manage it?",
      why: "A dynamic array wraps a layer around a fixed-size array: when it fills up, it moves to a block twice the size. Understand that and you understand why push is fast, insert is slow, and which operations quietly turn into O(n).",
    },
  ],
  cue: "The i-th element, contiguous memory, random access, appending at the end, slow inserts in the middle, modifying in place, read and write pointers.",
  steps: [
    "Work out **where** the operation happens: at the end it is O(1); anywhere else it has to shift everything after it, so it is O(n).",
    "To delete or move elements **in place**, use a **read pointer and a write pointer**: `read` sweeps every slot, only the elements that qualify are written to the `write` position, and `write` ends up as the new length. One O(n) pass, with no new array.",
    "When the task is something like moving the last k elements to the front, ask whether **reversals** can express it: reverse the whole array, then reverse each piece back, in O(1) extra space.",
    "When you already know how many elements there will be, **reserve the capacity** first (`reserve`, `[None] * n`) and skip every growth copy.",
    "`insert(0, x)`, `pop(0)` or `x in list` inside a loop is a warning sign of O(n²); consider a deque or a set instead.",
  ],
  demoNote:
    "Under each slot is its memory address. Try inserting or deleting at the front and watch how many slots turn yellow, meaning they had to move; then compare an operation at the end, which touches a single slot.",
  codeNote:
    "The first half lists the complexity of every common operation; the second half has the two classic in-place techniques, read and write pointers and three reversals.",
  problems: [
    { src: "LeetCode 27", name: "Remove Element (read and write pointers)", diff: "Easy" },
    { src: "LeetCode 26", name: "Remove Duplicates from Sorted Array", diff: "Easy" },
    { src: "LeetCode 283", name: "Move Zeroes", diff: "Easy" },
    { src: "LeetCode 189", name: "Rotate Array (three reversals)", diff: "Medium" },
    { src: "LeetCode 238", name: "Product of Array Except Self", diff: "Medium" },
  ],
};
