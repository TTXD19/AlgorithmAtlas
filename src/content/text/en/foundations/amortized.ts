import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Big-O notation, arrays and dynamic arrays",
  applications: [
    {
      title: "If list.append occasionally has to move everything, why call it O(1)?",
      problem:
        "Python's list, JavaScript's array and C++'s vector are all fixed-size arrays underneath. When one fills up, a bigger block is allocated and every existing element is copied across — and that one call is O(n).",
      why: "Amortised analysis looks at the total cost of a whole run of operations, divided by how many there were. The move happens rarely, and each one buys a long stretch of cheap pushes, so the average cost per push is still constant.",
    },
    {
      title: "Why hash tables rehash",
      problem:
        "As a hash map fills up, collisions multiply, so it allocates a table twice the size and reinserts every element. For that instant it is slow.",
      why: "Same reasoning: a rehash is O(n), but it happens half as often each time n doubles, so insertion is still O(1) amortised. Understanding this is what tells you why \"doubling\" is the crucial part and \"add 100 more slots\" is not.",
    },
    {
      title: "Building a queue out of two stacks",
      problem:
        "You have to implement a queue with nothing but stacks. On a dequeue, if the output stack is empty, the whole input stack has to be poured into it — and that call is O(n).",
      why: "Each element is moved at most once in its lifetime, so n operations cost O(n) in total, which is O(1) amortised per operation. This is the amortised example interviewers ask about most.",
    },
  ],
  cue: "Occasionally slow but usually fast, growing a buffer, rehashing, each element handled at most once, total cost divided by the number of operations.",
  steps: [
    "Identify **the expensive operation** and what triggers it: the buffer filling up, the output stack running empty, the load factor crossing a threshold.",
    "Work out **how often it happens** and what each occurrence costs in terms of n. Under a doubling strategy it happens log n times, and the kth one costs 2ᵏ.",
    "Use the **aggregate method** to add up the cost of all n operations: n cheap ones plus a handful of expensive ones gives you the total.",
    "Divide the total by n and you have the **amortised cost**. For a more intuitive account, switch to the accounting method: how much each cheap operation has to prepay to cover the expensive ones later.",
    "Check that **nothing gets refunded**: amortised analysis assumes the sequence starts from an empty structure, so if pops and pushes alternate, make sure the shrinking policy does not make the cost blow up over and over (which is why a buffer usually only shrinks once it is a quarter full).",
  ],
  demoNote:
    'Press push and watch: most of the time the cost is 1, and when the capacity fills up a tall yellow bar appears — but the "average per push" line never rises above 3.',
  codeNote:
    "The Python version hand-writes a dynamic array and counts the elements it moves; the C++ version simply watches `std::vector`'s capacity change.",
  problems: [
    { src: "LeetCode 232", name: "Implement Queue using Stacks (amortised O(1))", diff: "Easy" },
    { src: "LeetCode 155", name: "Min Stack", diff: "Medium" },
    { src: "LeetCode 705", name: "Design HashSet (think about when to grow)", diff: "Easy" },
    { src: "LeetCode 146", name: "LRU Cache", diff: "Medium" },
  ],
  quiz: [
    {
      q: "With capacity doubling, roughly what is the total cost of n pushes to a dynamic array?",
      choices: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
      answer: 0,
      why: "Moves happen at push 1, 2, 4, … and their sizes sum to less than n. Add the n inserts and the total is under 3n.",
    },
    {
      q: "If growth is changed to 'add 100 slots each time', the amortised cost per push becomes?",
      choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answer: 2,
      why: "Total moves become about n²/200; divided by n that is O(n) per push. Doubling is what halves the frequency of the expensive operation as n grows.",
    },
    {
      q: "What does 'amortised O(1)' actually claim?",
      choices: ["Every single operation is O(1)", "On a lucky run the average is O(1)", "Any sequence of n operations costs at most c·n in total", "The slowest single operation is O(1)"],
      answer: 2,
      why: "Amortised bounds are guarantees, not probabilities: one operation may be slow, but the whole sequence has a hard ceiling.",
    },
    {
      q: "In the accounting method a dynamic array charges 3 coins per push. Where do they go?",
      choices: ["Three inserts", "1 to insert itself, 1 saved for its own future move, 1 to move an older element from the first half", "1 to insert, 2 to the system", "All saved for the next resize"],
      answer: 1,
      why: "That way every element that needs moving at resize time has already been paid for, and the account never goes negative.",
    },
  ],
};
