import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array & Dynamic Array, Amortized Analysis",
  applications: [
    {
      title: "Finding one user among a million live sessions",
      problem:
        "Every request carries a session ID and the server has to know instantly whose it is. Scanning an array means up to a million comparisons per request, and doing that on every request takes the service down.",
      why: "A hash table runs the ID through a hash function to compute which slot it belongs in, so a lookup never compares against anyone else. Redis and Memcached are, at heart, one large hash table.",
    },
    {
      title: "Hash indexes and joins in a database",
      problem: "Two tables have to be matched on user_id. Without an index, every row means scanning the other table: O(n·m).",
      why: "Build one table into a hash table first (a hash join), and each row of the other table costs a single lookup. O(n + m).",
    },
    {
      title: "Variable lookup in compilers and interpreters",
      problem:
        "A variable name appears in the source and the interpreter has to find its value. A program may hold thousands of names, and every line needs a lookup.",
      why: "A symbol table is a hash table: the string is hashed into a numeric index. Every object attribute and every module namespace in Python is a dict underneath.",
    },
  ],
  cue: "Look a value up by key, deduplicate, check whether something has been seen, caching, O(1) lookup, keys that are not consecutive integers.",
  steps: [
    "Compute `h = hash(key)`, and the bucket number `b = h % capacity`.",
    "**Lookup**: walk the chain in bucket b comparing keys; return the value on a match, and reaching the end means the key is absent. The average chain length is the load factor, so this is O(1).",
    "**Insertion**: search as in step 2 first. If the key is there, overwrite it; if not, append to the end of the chain and increment the element count.",
    "After inserting, check the **load factor**: if it is over the threshold, double the capacity and re-place every existing key using `hash % new capacity`.",
    "**Deletion**: find the entry and unlink it from the chain. Open addressing has to leave a tombstone marker behind when deleting, while chaining does not — which is why chaining is the easier one to teach.",
  ],
  demoNote:
    "Insert keys starting from 4 buckets and watch collisions build up chains. Once the load factor passes 0.75, the bucket count doubles, every key is redistributed, and the chains get short again.",
  codeNote:
    "A hash table with separate chaining written from scratch, walking through get, put, remove and rehash, followed by the built-in containers you should actually reach for in practice.",
  problems: [
    { src: "LeetCode 705", name: "Design HashSet", diff: "Easy" },
    { src: "LeetCode 706", name: "Design HashMap", diff: "Easy" },
    { src: "LeetCode 217", name: "Contains Duplicate", diff: "Easy" },
    { src: "LeetCode 380", name: "Insert Delete GetRandom O(1) (a hash table plus an array)", diff: "Medium" },
    { src: "LeetCode 146", name: "LRU Cache (a hash table plus a doubly linked list)", diff: "Medium" },
  ],
};
