import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Hash Tables, Traversal",
  applications: [
    {
      title: "Autocomplete in a search bar",
      problem:
        'The user types "alg" and every word beginning with alg has to appear at once. The dictionary holds a few hundred thousand words, so scanning it on each keystroke is far too slow, and a hash table can only look up a complete key.',
      why: 'A trie stacks words that share a prefix onto the same path. Three steps take you to "alg", and everything beneath that node is the answer — at a cost that has nothing to do with the size of the dictionary.',
    },
    {
      title: "Spell checking and banned-word filtering",
      problem:
        "Every word in a document has to be checked against a dictionary, or a block of text has to be scanned for any occurrence of any banned word.",
      why: "Looking up a word of length L takes L steps. When many patterns are matched at once, building them all into one tree lets a single pass over the text compare against every pattern simultaneously — the foundation of Aho-Corasick.",
    },
    {
      title: "IP lookup in a router",
      problem:
        "A routing table holds a few hundred thousand rules, every packet needs the rule with the longest prefix match, and the router has to keep up with a million packets a second.",
      why: "Treat the IP as a bit string in a trie and walk down along the packet's bits; the deepest valid node you reach is the longest prefix. This is the classic use of a binary trie, or radix tree.",
    },
  ],
  cue: "Prefix, starts with, autocomplete, many strings sharing a prefix, longest prefix match, dictionary.",
  steps: [
    "Node structure: a table of children (a `dict`, or an array of length 26) plus an `is_end` boolean. The root stands for the empty string.",
    "**Insert**: start at the root and, for each character, create the matching child if it does not exist, then step into it. Mark the final node `is_end = True`.",
    "**Search for a word**: follow the characters, and any step you cannot take means the word is absent; once you arrive, you still have to check `is_end`. **Search for a prefix**: arriving at all is enough.",
    "**Autocomplete**: walk to the prefix's node, then DFS that subtree, collecting a word every time you hit `is_end`.",
    "When the alphabet is small and fixed, store children in an array for faster steps; otherwise use a hash table. With very large numbers of strings, consider compressing into a radix tree.",
  ],
  demoNote:
    "Insert car, cat, cart and dog, and watch the shared c-a path get reused. Then look up the prefix ca for autocomplete, and check whether ca and cart are complete words on their own. The green nodes are the ones carrying an end marker.",
  codeNote:
    "Insert, word lookup, prefix lookup and autocomplete. The Python version stores children in a dict; the C++ version shows the fixed-array form for a lowercase alphabet.",
  problems: [
    { src: "LeetCode 208", name: "Implement Trie (Prefix Tree)", diff: "Medium" },
    { src: "LeetCode 211", name: "Design Add and Search Words (DFS with a wildcard)", diff: "Medium" },
    { src: "LeetCode 1268", name: "Search Suggestions System (autocomplete)", diff: "Medium" },
    { src: "LeetCode 212", name: "Word Search II (trie plus grid backtracking)", diff: "Hard" },
    { src: "LeetCode 648", name: "Replace Words (shortest prefix)", diff: "Medium" },
  ],
};
