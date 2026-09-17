import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Tries, KMP, Word Search",
  applications: [
    {
      title: "Antivirus scanning for hundreds of thousands of signatures",
      problem:
        "An antivirus signature database holds hundreds of thousands of virus signatures, each a byte sequence. Scanning a 50 MB file by searching for every signature separately means reading the file from the top hundreds of thousands of times, which is simply not viable.",
      why: "Insert every signature into one trie, then add fail links with a BFS, and you have an Aho–Corasick automaton. The file is read once: each byte advances the automaton by one step, and when there is no edge to follow you jump back along the fail links. Total time is the file length plus the number of hits, almost independent of how many signatures there are. ClamAV, the open-source antivirus scanner, matches its signatures with Aho–Corasick.",
    },
    {
      title: "A word-game solver",
      problem:
        "Boggle is a 4 × 4 grid of letters where adjacent cells (never reusing a cell) spell out words. A solver has to find every word in the grid that appears in a 170,000-word English dictionary. Running a separate grid search per word means 170,000 backtracking searches.",
      why: "Build the dictionary into a trie and do a single DFS over the grid, carrying the current trie node along with you: if the next cell's letter is not a child, no word in the dictionary starts with that prefix, so you prune immediately. Most paths die after two or three cells, and because each word found is removed from the trie — along with any branch that empties out — the search gets faster as it goes.",
    },
    {
      title: "Finding the nearest node in a distributed network",
      problem:
        "BitTorrent's DHT spans millions of machines. Every machine and every piece of data has a 160-bit ID, and data lives on the handful of machines whose IDs are \"closest\" to its own. The Kademlia protocol defines the distance between two IDs as their XOR, and a lookup has to find the nodes nearest a given ID quickly.",
      why: "XOR distance is decided by the highest bit where two IDs differ, so if you insert IDs into a trie bit by bit starting from the high end, a longer shared prefix means a smaller distance. Finding the nearest node means walking down from the high bit and taking the bit that matches the target whenever you can; finding the largest XOR instead means taking the opposite bit whenever you can. Kademlia's routing table groups peers by exactly this shared-prefix length, so a lookup needs only O(log n) hops.",
    },
  ],
  cue: "Many patterns to find in one piece of text at once, a large dictionary of words to search for on a grid or graph, prefix-based pruning, an integer's bits treated as characters (maximum XOR, XOR distance), counting by prefix.",
  steps: [
    'Decide what a "character" is: real characters for ordinary strings, a fixed number of bits (high bit first) for integers. Insert every string or number into the trie.',
    "To find many words on a grid or graph: carry the current trie node through the DFS, prune as soon as the next cell's character is not a child, and when you hit an end marker, take the answer and clear the marker.",
    "To find many patterns in one text: use a BFS to give every node a fail link `fail(v)`, and merge the output of `fail(v)` into the output of v.",
    "Scan the text: for each character, jump back along the fail links until you can move down or you are back at the root, then report every output at the node you land on.",
    "Maximum XOR over integers: to query x, walk down from the high bit taking the bit opposite to x's whenever that child exists, and the same bit only when it does not. The value you assemble on the way down is the maximum XOR.",
  ],
  demoNote:
    "Aho–Corasick finding he, she, his and hers in the text ushers, all at once. The first phase inserts the four keywords: blue marks the node just created, green marks the end of a keyword. The second phase adds the fail links with a BFS; the yellow dashed arrows are the links that do not point at the root, and each step explains how the search starts from the parent's fail link: sh points to h, his points to s, she points to he — and since he is itself a keyword, reaching she has to report he too — and hers points to s. The third phase scans the text: blue is the current state. Reading e lands on she and reports both she and he; reading r finds no r edge out of she, so the blue dashed arrow jumps to he and then moves down to her; finally s lands on hers. The text was read exactly once and all three keywords were found.",
  codeNote:
    "Python has a dictionary-based Aho–Corasick, Word Search II with trie pruning (that is LeetCode 212), and a bit trie for maximum XOR. C++ has an array-based Aho–Corasick that fills in the missing transitions after building so the automaton is complete and every character costs one table lookup, plus an array-based bit trie.",
  problems: [
    { src: "LeetCode 720", name: "Longest Word in Dictionary (every prefix must be a word)", diff: "Medium" },
    { src: "LeetCode 421", name: "Maximum XOR of Two Numbers in an Array (bit trie)", diff: "Medium" },
    { src: "LeetCode 2416", name: "Sum of Prefix Scores of Strings (count visits on each node)", diff: "Hard" },
    { src: "LeetCode 1032", name: "Stream of Characters (Aho–Corasick, or build the trie on reversed words)", diff: "Hard" },
    { src: "LeetCode 1707", name: "Maximum XOR With an Element From Array (sort offline, insert into the bit trie as you go)", diff: "Hard" },
    { src: "LeetCode 745", name: "Prefix and Suffix Search", diff: "Hard" },
  ],
};
