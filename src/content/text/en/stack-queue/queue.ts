import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array & Dynamic Array, Stack",
  applications: [
    {
      title: "Print spoolers, message queues and job scheduling",
      problem:
        "Several people send print jobs at once, and whoever sent theirs first should print first. Systems like Kafka and RabbitMQ line messages up the same way: producers add at the back, consumers take from the front.",
      why: "A queue's first-in-first-out rule is the definition of fairness. Everyone can only join at the back, service always starts at the front, and nobody jumps the line.",
    },
    {
      title: "Why BFS goes level by level",
      problem:
        "Breadth-first search has to finish everything at distance 1 before it looks at distance 2. What actually guarantees that order?",
      why: "Push discovered nodes into a queue in order and always process the one discovered earliest. First in, first out automatically keeps \"closest to the start goes first\". The demo in the BFS lesson is a queue in motion.",
    },
    {
      title: "Why using a Python list as a queue is slow",
      problem: "Someone dequeues with list.pop(0), and the program grinds to a halt once the data grows.",
      why: "Removing from the front of an array shifts every remaining element forward: O(n). A circular array advances head instead of moving anything, which is what deque does (a linked list of blocks, in fact). Once you know why, you know to switch to deque.",
    },
  ],
  cue: "First in first out, waiting in line, fair processing, level by level, BFS, producers and consumers, operations needed at both ends.",
  steps: [
    "When you need first-in-first-out, use `deque` in Python and `std::queue` in C++. Do not use a list's `pop(0)`.",
    "To implement a fixed-capacity queue yourself, use a **circular array**: track `head` and `size` (not head and tail, which leaves empty and full indistinguishable).",
    "**Enqueue**: `buf[(head + size) % cap] = x`, then increment size. When it is full, either report failure or grow the buffer.",
    "**Dequeue**: `head = (head + 1) % cap`, then decrement size. Nothing is moved.",
    "The BFS skeleton: enqueue the start node, then `while queue`, dequeue one node, process it and enqueue any neighbour not yet seen. To split it into levels, record the queue's length at the top of each round.",
  ],
  demoNote:
    "A circular array of capacity 6. Enqueue a few times, then dequeue a few times, and watch tail wrap around to the front of the array while head advances without moving a single element.",
  codeNote:
    "How to use the built-in deque and queue, the circular array implementation, and a queue built from two stacks — the example from the amortised analysis lesson, with the full code here.",
  problems: [
    { src: "LeetCode 232", name: "Implement Queue using Stacks", diff: "Easy" },
    { src: "LeetCode 225", name: "Implement Stack using Queues", diff: "Easy" },
    { src: "LeetCode 622", name: "Design Circular Queue", diff: "Medium" },
    { src: "LeetCode 933", name: "Number of Recent Calls (a sliding time window)", diff: "Easy" },
    { src: "LeetCode 102", name: "Binary Tree Level Order Traversal (a queue, level by level)", diff: "Medium" },
    { src: "LeetCode 641", name: "Design Circular Deque", diff: "Medium" },
  ],
};
