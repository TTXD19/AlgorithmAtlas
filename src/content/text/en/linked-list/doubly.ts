import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Singly linked lists, hash tables",
  applications: [
    {
      title: "LRU caches: who gets evicted when memory runs out",
      problem:
        "A database page cache, a CDN, a browser cache — all have limited space, and when they fill up they have to evict whatever was used least recently. Every read has to mark its entry as just used, and every eviction has to find the oldest entry, and both have to be O(1).",
      why: "String the entries into a doubly linked list ordered by recency, most recent at the head and oldest at the tail. The hash table jumps straight to a node, and the backward pointer means pulling a node out of the middle and splicing it onto the head touches only four pointers. LeetCode 146 is exactly this problem.",
    },
    {
      title: "The browser's back and forward buttons",
      problem:
        "Every page needs to know the page before it and the page after it. Opening a new link from somewhere in the middle throws away the entire forward history.",
      why: "A node records both prev and next, so moving in either direction is O(1). Undo/redo in a text editor and previous/next track in a music player are the same structure.",
    },
    {
      title: "What deque and OrderedDict are made of",
      problem:
        "Why can Python's deque add and remove at both ends in O(1)? How can OrderedDict remember insertion order and still delete an arbitrary key in O(1)?",
      why: "Both are doubly linked lists underneath. Once prev and next make sense, this \"built-in magic\" turns into an implementation you can read.",
    },
  ],
  cue: "LRU, recency of use, operations at both ends, O(1) removal of an arbitrary node you already hold, previous and next, undo/redo.",
  steps: [
    "Create two sentinels: `head.next = tail` and `tail.prev = head`. Real nodes always sit between them.",
    "**Unlink** a node n: `n.prev.next = n.next` and `n.next.prev = n.prev`. Leaving n's own pointers alone is fine, since it is about to be relinked or discarded.",
    "**Push to the front**: set n's two pointers first (`n.next = head.next`, `n.prev = head`), then fix up the neighbours (`head.next.prev = n`, `head.next = n`). Yourself first, then everyone else.",
    "LRU `get`: look the node up in the hash table, unlink it, push it to the front, and return its value. Return −1 when the key is absent.",
    "LRU `put`: if the key exists, update the value and move the node to the front; if it does not and the cache is full, unlink `tail.prev` (the least recently used) and delete it from the hash table first, then create the new node, push it to the front, and record it in the hash table.",
  ],
  demoNote:
    "An LRU cache with capacity 3. put or get on a key moves it to the front; putting a new key into a full cache evicts the least recently used node at the tail. The hash table on the right points each key straight at its node in the list.",
  codeNote:
    "The Python version writes the nodes and the two sentinels by hand; once unlink and push_front are factored out, get and put are nothing but combinations of them. The C++ version uses `std::list` with `splice`, which does the O(1) move in a single line.",
  problems: [
    { src: "LeetCode 146", name: "LRU Cache", diff: "Medium" },
    { src: "LeetCode 641", name: "Design Circular Deque", diff: "Medium" },
    { src: "LeetCode 430", name: "Flatten a Multilevel Doubly Linked List", diff: "Medium" },
    { src: "LeetCode 1472", name: "Design Browser History", diff: "Medium" },
    { src: "LeetCode 460", name: "LFU Cache (a hash table plus several doubly linked lists)", diff: "Hard" },
  ],
};
