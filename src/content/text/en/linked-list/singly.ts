import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Arrays & dynamic arrays",
  applications: [
    {
      title: "How an operating system tracks runnable processes",
      problem:
        "Processes are created, finish and get suspended at any moment. You need O(1) insertion and removal at any position, and nobody knows in advance how many there will be.",
      why: "A list's nodes sit wherever memory allows and are strung together by pointers. Inserting or deleting changes two pointers, with no elements to shift and no contiguous block to reserve up front. The Linux kernel is full of linked lists.",
    },
    {
      title: "The collision chain inside a hash table",
      problem:
        "The hash table in the previous chapter resolved collisions by chaining: every key that lands in the same bucket is strung together. That chain is a singly linked list.",
      why: "Chains are usually short, only ever appended to, and only ever scanned end to end — exactly what a list does well without wasting space. Understand this and you understand how a hash table is actually built.",
    },
    {
      title: "The groundwork for working with pointers",
      problem:
        "Trees, graphs, LRU caches and skip lists are all \"nodes plus pointers\". Wire one pointer wrong and the structure either breaks in half or loops back on itself.",
      why: "A singly linked list is the simplest pointer structure there is. Get comfortable here with \"attach the new one before detaching the old\", sentinel nodes and edge cases, and every later pointer problem is the same set of moves.",
    },
  ],
  cue: "You do not know how many there will be, frequent insertion and deletion in the middle, node.next, head, pointers being rewired, the ListNode that shows up in interviews.",
  steps: [
    "**Inserting** after node p: point the new node's next at `p.next` first, then point `p.next` at the new node. Do it the other way round and you lose everything after p.",
    "**Deleting** the node after p: `p.next = p.next.next`. Nothing points at the skipped node any more, so it is gone (in C++ you have to delete it yourself).",
    "For any operation that can touch the head, create a **dummy** node pointing at head first and return `dummy.next` when you are done. That makes \"delete the head\" and \"delete from the middle\" the same piece of code.",
    "**Traverse** with `while cur:`, keeping an extra `prev` when you need the previous node. Use `while cur.next:` when you want to stop on the last node.",
    "Once it is written, test three inputs: an empty list, a list of one node, and a target that is the last node. Almost every bug in a pointer problem is at a boundary.",
  ],
  demoNote:
    "A comparison of how many nodes each operation walks past. Inserting at the front walks none, while inserting at the back and reading element 4 both walk all the way from head; deleting rewires a single pointer and leaves everything after it untouched.",
  codeNote:
    "A minimal hand-written list class with the complexity marked on every method, ending with a sentinel node that shows how \"delete every node equal to val\" gets rid of the special case for the head.",
  problems: [
    { src: "LeetCode 707", name: "Design Linked List", diff: "Medium" },
    { src: "LeetCode 203", name: "Remove Linked List Elements (sentinel node)", diff: "Easy" },
    { src: "LeetCode 83", name: "Remove Duplicates from Sorted List", diff: "Easy" },
    { src: "LeetCode 237", name: "Delete Node in a Linked List (deleting without the previous node)", diff: "Medium" },
    { src: "LeetCode 19", name: "Remove Nth Node From End of List", diff: "Medium" },
  ],
};
