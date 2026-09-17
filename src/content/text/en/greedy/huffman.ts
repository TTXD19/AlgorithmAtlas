import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Greedy principles, binary heaps, binary trees",
  applications: [
    {
      title: "Why zip can cut a text file in half",
      problem:
        "In an English document, e turns up tens of thousands of times and z only a handful, yet ASCII spends 8 bits on every character alike. Common and rare characters cost exactly the same, which is plainly wasteful.",
      why: "Give common characters short codes and rare ones long codes and the total bit count falls. Huffman coding repeatedly merges the two lowest-frequency items into a tree, and the path down that tree is the code. It is the final stage of DEFLATE (zip, gzip, PNG), and it is provably the shortest possible as long as each character gets one code.",
    },
    {
      title: "The last step in JPEG and MP3",
      problem:
        "Once images and audio have been transformed and quantised, what is left is a pile of numbers in which zeros and small values dominate and large values are rare. Those numbers have to go into a file, and smaller is better.",
      why: "This is exactly the kind of wildly uneven distribution that Huffman coding compresses best. JPEG's entropy coding stage and MP3's bitstream packing both use it. The lossy part of lossy compression happens during quantisation; this step is lossless.",
    },
    {
      title: "The code cannot be ambiguous",
      problem:
        "Variable-length codes come with a trap: if a is 0 and b is 01, then on reading a 0 you cannot tell whether to stop or read on. Adding separators eats up the space you just saved.",
      why: "Every character in a Huffman tree sits at a leaf, so no code is a prefix of another — that is what makes it a prefix code. To decode, walk down from the root and emit a character whenever you land on a leaf; no separators needed. Greedy merging guarantees the property for free.",
    },
  ],
  cue: "Compression, variable-length codes, shorter codes for more frequent symbols, prefix codes, merging the two smallest each round, building a tree with a min-heap.",
  steps: [
    "Count how often each character occurs, make one leaf node per character, and put them all in a **min-heap** ordered by frequency.",
    "While more than one node remains in the heap: pop the two with the lowest frequencies, a and b.",
    "Create a new node with frequency `a.freq + b.freq`, a as its left child and b as its right, and push it back. Repeat until a single node is left; that is the root.",
    "Walk the whole tree from the root, left is 0 and right is 1, and record a character's code when you reach its leaf.",
    "To encode, look each character up and concatenate. To decode, start at the root, go left on a 0 and right on a 1, emit a character on reaching a leaf, and return to the root.",
  ],
  demoNote:
    '"abracadabra" has 5 distinct characters. Each step first marks the two lowest frequencies in the heap (yellow), and the next step merges them into a new node (blue) and pushes it back. Once the tree is built, walking down from the root gives the code table, and the totals are compared at the end: 23 bits for Huffman against 33 for a fixed 3-bit code.',
  codeNote:
    "Building the tree with a heap, walking it to produce the code table, plus encoding and decoding. The Python version represents internal nodes as tuples, the C++ version uses pointers.",
  problems: [
    { src: "LeetCode 1046", name: "Last Stone Weight (take the two largest each round)", diff: "Easy" },
    { src: "LeetCode 1167", name: "Minimum Cost to Connect Sticks (premium; identical to Huffman)", diff: "Medium" },
    { src: "LeetCode 347", name: "Top K Frequent Elements (count frequencies, then use a heap)", diff: "Medium" },
    { src: "LeetCode 767", name: "Reorganize String (order by frequency with a heap)", diff: "Medium" },
    { src: "LeetCode 1000", name: "Minimum Cost to Merge Stones (greedy fails once merges must be adjacent; needs interval DP)", diff: "Hard" },
  ],
};
