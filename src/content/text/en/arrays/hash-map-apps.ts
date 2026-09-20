import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Hash tables",
  applications: [
    {
      title: "Finding two transactions that add up to a target",
      problem:
        "Reconciling accounts means asking which two amounts sum to 1000. Enumerating every pair with two nested loops is O(n²), which is ten billion steps for a hundred thousand rows.",
      why: 'At each row, ask "have I already seen the number I need?" Store what you have seen in a hash table and that question costs O(1), making the whole scan O(n). This is Two Sum, the prototype for every pair-lookup problem.',
    },
    {
      title: "A search engine deciding whether two words use the same letters",
      problem:
        "listen and silent are built from the same letters. Spell checkers, word games and duplicate-document detection all need a fast answer to \"same contents, different order\".",
      why: "Count how often each letter appears; if the two count tables match, the words belong together. A hash table makes the counting O(n), and using the sorted string as a key groups every anagram in a single pass.",
    },
    {
      title: "Which errors show up most often in the logs",
      problem: "Hundreds of millions of log lines, and you want the ten most common error messages.",
      why: "One O(n) counting pass with a hash table, then take the top k. Frequency counting is the most common use a hash table gets, and pairing it with a heap is the classic Top-K problem.",
    },
  ],
  cue: "How many times something appears, whether there are duplicates, finding a partner or a pair, grouping things that belong together, have I seen this before, replacing the inner loop of an O(n²) solution.",
  steps: [
    "Write the brute-force solution first and find the **inner loop** that is searching for something. What is it searching for? That is your hash table key.",
    'Decide what the value is: a `set` when you only need "is it there"; value -> index when you need positions; value -> count when you need frequencies; key -> list when you are grouping.',
    "Make a **single** left-to-right pass: **look up** first to see whether the table already answers the question, then **store** the current element. Doing it the other way round lets an element pair with itself.",
    "For grouping problems, design the key first: what operation turns every member of a group into the same value? Make sure that value is an immutable type.",
    "Check the complexity: n iterations, each with an O(1) lookup and store, so O(n) time and O(n) space. If an inner loop is still there, the key is wrong.",
  ],
  demoNote:
    'Two Sum, one pass over the array, step by step: each step first checks whether the partner it needs is in the table, and stores itself when it is not. Note that by the time the answer turns up, the array has been read exactly once.',
  codeNote:
    "Four snippets for the four patterns. Python's `Counter` and `defaultdict` are the standard tools for counting and grouping; C++ uses `unordered_map` and `unordered_set`.",
  problems: [
    { src: "LeetCode 1", name: "Two Sum (pair lookup)", diff: "Easy" },
    { src: "LeetCode 242", name: "Valid Anagram (counting)", diff: "Easy" },
    { src: "LeetCode 219", name: "Contains Duplicate II (value -> most recent index)", diff: "Easy" },
    { src: "LeetCode 49", name: "Group Anagrams (grouping)", diff: "Medium" },
    { src: "LeetCode 347", name: "Top K Frequent Elements (counting plus buckets or a heap)", diff: "Medium" },
    { src: "LeetCode 128", name: "Longest Consecutive Sequence (membership)", diff: "Medium" },
  ],
  quiz: [
    {
      q: "The standard move that turns a brute-force O(n²) into O(n) is?",
      choices: ["Rewrite the outer loop as recursion", "Replace the inner 'searching' loop with a hash lookup", "Sort and then binary search", "Convert the array to a string"],
      answer: 1,
      why: "Spend O(n) space to remove one factor of n: whatever the inner loop searches for becomes the hash key.",
    },
    {
      q: "In the one-pass Two Sum, what must happen first for each element?",
      choices: ["Store it, then look for its partner", "Look up `target − x` in the map, then store x", "Sort first", "Skip duplicates first"],
      answer: 1,
      why: "In the other order x could pair with itself (target = 6, x = 3). Look up before you store.",
    },
    {
      q: "Group Anagrams needs one key shared by every string in a group. Which works?",
      choices: ["The string's length", "The string itself", "The sorted string", "The first character"],
      answer: 2,
      why: "Same group, same key; different group, different key. Anagrams sort to the same string. A 26-letter count tuple also works.",
    },
    {
      q: "Which of these **cannot** be a Python dict key?",
      choices: ["`(1, 2)`", "`\"abc\"`", "`[1, 2]`", "`42`"],
      answer: 2,
      why: "Keys must be hashable, i.e. immutable. A list can be mutated, so it is rejected; a tuple is fine.",
    },
  ],
};
