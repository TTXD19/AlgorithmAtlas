import type { TopicsText } from "./types";

/**
 * 英文版的主題與細項文字。
 *
 * 關於 `zh` 這個欄位名：它在介面上一律是顯示在英文名底下的副標。細項用完整
 * 名稱（BFS → Breadth-First Search），主題用一句短副標。欄位名沿用原本的
 * `zh` 是為了不動 Topic 介面與 7 個消費端，語意上請讀成「本地化副標」。
 */
export const en: TopicsText = {
  kind: { ds: "Data structures", algo: "Algorithms" },
  level: { 1: "Intro", 2: "Intermediate", 3: "Hard" },

  topics: {
    foundations: {
      zh: "How we measure cost",
      desc: "How to judge whether an algorithm is any good. The vocabulary the rest of the site uses.",
      intro:
        "Before any data structure or algorithm, get three tools in place: Big-O to describe cost, recursion to think with, and amortised analysis to explain why something is \"fast on average\". Every complexity figure elsewhere on the site builds on these.",
      applications: [
        { title: "Why it was fast in testing and times out in production", desc: "Go from 100 rows to a million — ten thousand times the data — and an O(n²) program does a hundred million times the work, while O(n log n) does about thirty thousand times. Big-O lets you predict that before you write the code.", sub: "big-o" },
        { title: "Why pushing to a dynamic array counts as O(1)", desc: "When the array fills up it has to move, and that one push is O(n) — but averaged out, each push is still constant time. Amortised analysis is how you talk about \"occasionally slow, fast overall\".", sub: "amortized" },
        { title: "Handing the problem to a smaller version of yourself", desc: "Folders contain folders; expressions contain expressions. Recursion lets you describe one layer and leave the rest to the same function. Trees, DFS, divide and conquer and DP are all built on it.", sub: "recursion" },
      ],
    },
    arrays: {
      zh: "Indexed and keyed access",
      desc: "The two most basic containers: reach things by position, or by key.",
      intro:
        "Arrays trade contiguous memory for O(1) access by position; hash tables trade a hash function for O(1) access by key. These two are the foundation of almost every program, and usually the first tool to reach for in an interview.",
      applications: [
        { title: "Caches and sessions", desc: "A user ID mapping to a login state, a URL mapping to cached content — both are hash tables. Redis is, at heart, one very large hash table.", sub: "hash-table" },
        { title: "\"How many times does this letter appear?\"", desc: "Counting character frequencies, checking whether two words are anagrams, finding duplicates — a hash table turns every one of those lookups into O(1).", sub: "hash-map-apps" },
        { title: "Range totals in a report", desc: "Asked for revenue from day 1000 to day 5000? Compute prefix sums once and every later question is a single subtraction.", sub: "prefix-sum" },
        { title: "Images and game boards", desc: "A picture is a 2D array. Rotating it 90 degrees, walking it in a spiral, finding connected cells on a board — all 2D array work.", sub: "matrix" },
      ],
    },
    "linked-list": {
      zh: "Nodes joined by pointers",
      desc: "Nodes strung together by pointers. O(1) insert and delete, but no jumping straight to an index.",
      intro:
        "A linked list gives up contiguous memory in exchange for O(1) insertion and deletion at a known position. You will not reach for one often, but the pointer intuition, the fast/slow trick, and its role behind LRU caches and trees make it worth the detour.",
      applications: [
        { title: "Back and forward in a browser", desc: "Each page remembering the one before and the one after is a doubly linked list. So are playlists and an editor's undo/redo.", sub: "doubly" },
        { title: "LRU caches", desc: "Move what was just used to the front, drop what has gone stale off the back. Paired with a hash table that is O(1). OS page replacement and CDN caches both work this way.", sub: "fast-slow" },
        { title: "Detecting a cycle", desc: "Two runners on a track, one twice as fast — if there is a loop they must meet. The same trick finds the middle of a list, and needs no extra memory.", sub: "fast-slow" },
      ],
    },
    "stack-queue": {
      zh: "Last in first out, first in first out",
      desc: "Order is itself information.",
      intro:
        "A stack remembers what happened most recently, a queue what happened earliest. Both are simple enough to build on an array, yet they are exactly what separates DFS from BFS — and monotonic stacks and queues are how you turn O(n²) into O(n).",
      applications: [
        { title: "Bracket matching and undo in an editor", desc: "Push on an opening bracket, pop and compare on a closing one. Ctrl+Z is the same thing: push every action, pop to undo.", sub: "stack" },
        { title: "Print spoolers and message queues", desc: "The job sent first prints first; the message received first is handled first. Kafka and RabbitMQ are queues at their core.", sub: "queue" },
        { title: "\"When is the next day the price is higher?\"", desc: "Asking that for every day is O(n²) by brute force. A monotonic stack does one pass, with each element pushed and popped exactly once.", sub: "monotonic-stack" },
        { title: "Window maximum on a dashboard", desc: "\"What was the worst latency in the last 60 seconds?\", asked every second. A monotonic queue keeps that answer O(1) as the window slides.", sub: "monotonic-queue" },
      ],
    },
    heap: {
      zh: "Always the largest or smallest, in O(log n)",
      desc: "Get at the maximum or minimum whenever you want, for O(log n).",
      intro:
        "A heap is a complete binary tree stored in an array, where a parent is always smaller (or larger) than its children. It does not sort everything — it only guarantees the top — which is why insert and extract are both logarithmic. It is the standard way to build a priority queue.",
      applications: [
        { title: "OS process scheduling", desc: "High-priority processes run first and new ones arrive at any time. A priority queue makes both \"add\" and \"take the highest\" fast; Linux's CFS uses a related structure.", sub: "binary-heap" },
        { title: "Top 10 most-read articles", desc: "Ten million articles, and you want the ten most read. You do not need to sort them. Keep a min-heap of size 10 and make one pass.", sub: "top-k" },
        { title: "A running median", desc: "Data keeps arriving and you need the median at any moment. A max-heap holds the lower half, a min-heap the upper half, and the median sits at the two tops.", sub: "two-heaps" },
      ],
    },
    tree: {
      zh: "Hierarchies without cycles",
      desc: "Hierarchy without cycles. Recursion feels most natural here.",
      intro:
        "A tree is \"a node with more nodes under it\", which maps onto recursion directly. Start with traversing a binary tree; binary search trees combine order with dynamic insertion; tries handle strings; segment trees and Fenwick trees handle range queries.",
      applications: [
        { title: "File systems and the DOM", desc: "Folders inside folders, tags inside tags. Computing a folder's size, rendering a page, serialising JSON — all tree traversal.", sub: "traversal" },
        { title: "Database indexes and sorted sets", desc: "A MySQL index is a B-tree; Redis sorted sets and Java's TreeMap are balanced search trees. \"Find it fast and keep it in order\" is the BST family's job.", sub: "bst" },
        { title: "Autocomplete in a search box", desc: "Type \"alg\" and \"algorithm\" appears. A trie walks letter by letter, one level per character.", sub: "trie" },
        { title: "Live rankings and range statistics", desc: "A hundred thousand values changing constantly, and you still need \"the sum of entries 1000 to 2000\". Segment trees and Fenwick trees keep both query and update logarithmic.", sub: "segment" },
      ],
    },
    "graph-ds": {
      zh: "Storing a graph, and answering \"connected?\"",
      desc: "How to store a graph in code, and how to answer \"are these two connected?\" quickly.",
      intro:
        "A graph is nodes and edges, and it can describe any problem about things being related. This topic is only about storage: when to use an adjacency list versus a matrix, and union-find, a structure built specifically for connectivity. The algorithms live under Graph Algorithms.",
      applications: [
        { title: "Friendships in a social network", desc: "A billion users with a few hundred friends each. An adjacency matrix would need 10¹⁸ cells; an adjacency list stores only the edges that exist.", sub: "adjacency" },
        { title: "Is the network still connected?", desc: "Links between data centres come and go, and you need \"can A still reach B?\" at any moment. Union-find makes that almost constant time.", sub: "union-find" },
        { title: "Grouping faces in a photo library", desc: "Draw an edge between two similar faces, and each connected component ends up being one person. Union-find is the simplest clustering tool there is.", sub: "union-find" },
      ],
    },
    sorting: {
      zh: "From O(n²) to O(n log n)",
      desc: "Putting things in order. From O(n²) to O(n log n), and where the comparison barrier sits.",
      intro:
        "Sorting is the most-called algorithm there is, and the best material for understanding divide and conquer, stability, and lower-bound proofs. By the end you will know why your language's built-in sort is designed the way it is, and when you can beat n log n.",
      applications: [
        { title: "Storefronts and leaderboards", desc: "Ordering products by price, rating or sales, or a game leaderboard refreshed every minute. Once the data is large, O(n²) versus O(n log n) is the difference between responding and not.", sub: "merge" },
        { title: "ORDER BY and external sorting", desc: "A database's ORDER BY is a sorting algorithm; when the data will not fit in memory it uses an external merge sort, reading one chunk at a time.", sub: "merge" },
        { title: "Sorting as a prerequisite", desc: "Binary search, deduplication, merging time intervals, finding a median — all assume order. Sort first and the problem after it often becomes easy.", sub: "lower-bound" },
        { title: "When the values are plain integers", desc: "Ages, scores, postcodes — integers over a fixed range can be sorted without comparing at all, which is how counting sort and radix sort get past n log n.", sub: "counting" },
      ],
    },
    searching: {
      zh: "Halving the search space",
      desc: "Finding things. Order lets you throw away half the data at every step.",
      intro:
        "From plain linear search, to binary search over sorted data, to two pointers and sliding windows — the two array techniques that turn O(n²) into O(n). This is the highest-frequency toolkit in both interviews and day-to-day work.",
      applications: [
        { title: "git bisect finding the broken commit", desc: "Which of a thousand commits introduced the bug? Test the middle one each time and ten steps is enough. That is binary search, and it works on anything ordered.", sub: "binary" },
        { title: "\"How fast do we have to go to make it?\"", desc: "Koko eating bananas, the minimum ship capacity: the answer itself is monotonic — faster always still makes it — so you can binary search the answer and just check feasibility each time.", sub: "binary-answer" },
        { title: "\"Average over the last 5 minutes\"", desc: "Data keeps arriving and the window keeps sliding. A sliding window adds each value once and removes it once, instead of recomputing the whole range.", sub: "sliding" },
        { title: "Two numbers summing to a target", desc: "One pointer from each end, closing in. That drops a factor of n versus the nested loop, and a lot of array problems are variations on it.", sub: "two-pointers" },
      ],
    },
    backtracking: {
      zh: "Try everything, but turn back early",
      desc: "Try every possibility, but turn back the moment it cannot work.",
      intro:
        "Backtracking is disciplined brute force: make a choice, recurse, undo the choice on the way back. It is DFS over a decision tree, and it is what solves sudoku, permutations and N-queens. Pruning is what decides whether it finishes this century.",
      applications: [
        { title: "Timetabling and seating", desc: "Give each class a slot; on a clash try the next one; if nothing fits, go back and change the previous class. That is backtracking, and N-queens is its textbook form.", sub: "n-queens" },
        { title: "Enumerating combinations", desc: "Listing every subset, permutation or combination — testing every combination of feature flags, generating every variant of a password.", sub: "subsets" },
        { title: "Sudoku and crosswords", desc: "Put a digit in a cell, back out when it breaks a rule. The way a person solves it and the way a program solves it have the same shape.", sub: "word-search" },
      ],
    },
    "divide-conquer": {
      zh: "Split, solve, combine",
      desc: "Cut it into pieces, solve each, then put the answers back together.",
      intro:
        "Divide and conquer is where O(n log n) comes from: halve the problem, recurse, merge the results. Merge sort and quicksort are its famous examples; here it is treated as a general method, with the Master Theorem for working out the cost.",
      applications: [
        { title: "Why halving makes it faster", desc: "Comparing n things pairwise takes n², but splitting in half, solving each and merging takes n log n. The Master Theorem saves you from deriving the recurrence every time.", sub: "master-theorem" },
        { title: "Cryptography and big numbers", desc: "RSA raises a number to a several-hundred-digit power modulo another. Fast exponentiation halves the exponent each step, finishing in a few hundred multiplications instead of never.", sub: "fast-pow" },
        { title: "\"How many pairs are out of order?\"", desc: "Measuring how far apart two rankings are is really counting inversions. Count them during merge sort's merge step and it costs nothing extra.", sub: "inversions" },
      ],
    },
    greedy: {
      zh: "Take the best step available, now",
      desc: "Always take the best option available right now. When does that give the best overall answer?",
      intro:
        "Greedy algorithms never backtrack and never try alternatives, so they are usually the fastest thing you can write. The catch is that they are not always right. The point of this topic is not just writing a greedy solution, but learning to use an exchange argument to tell when greed is safe.",
      applications: [
        { title: "Meeting rooms and timetables", desc: "Given a pile of meeting times, how many can you fit without a clash? Always take the one that ends earliest — an intuitive rule that can actually be proven optimal.", sub: "interval" },
        { title: "Compression in zip and JPEG", desc: "Frequent characters get short codes, rare ones get long codes. Huffman coding merges the two least frequent each step — greedy, and provably optimal.", sub: "huffman" },
        { title: "Making change and OS scheduling", desc: "A till hands out the largest coin first; an OS runs the shortest job first. Some of these are always right and some break on particular coin sets — telling which is the point of this topic.", sub: "coin" },
        { title: "Can you reach the end?", desc: "Each cell says how far you may jump. Track only \"the furthest I can currently reach\" and one pass answers it, without trying any individual route.", sub: "jump" },
      ],
    },
    graph: {
      zh: "Traversal, shortest paths, ordering",
      desc: "Start with traversal, then shortest paths, dependency order and connectivity.",
      intro:
        "Graphs describe maps, social networks, task dependencies — anything where things relate to other things. This topic starts with the two basic traversals and works up through cycle detection, topological sort, the shortest-path family and minimum spanning trees.",
      applications: [
        { title: "Map navigation", desc: "Junctions are nodes and roads are edges. \"Fewest turns\" is BFS; \"fastest in minutes\" has to account for edge weights, and that is Dijkstra.", sub: "bfs" },
        { title: "\"People you may know\"", desc: "Everyone two hops from you is a friend of a friend. BFS working outward ring by ring maps exactly onto degrees of separation.", sub: "bfs" },
        { title: "Install and build order", desc: "A depends on B, B depends on C, so npm or make has to install C first. That is topological sort — and you need cycle detection first to be sure there is no circular dependency.", sub: "topo" },
        { title: "Laying network cable", desc: "Connect every data centre for the lowest total cost. That is a minimum spanning tree, and Kruskal's version uses union-find.", sub: "mst" },
      ],
    },
    dp: {
      zh: "Overlapping subproblems, remembered",
      desc: "Break a big problem into overlapping smaller ones, and remember the answers so you never recompute.",
      intro:
        "DP rests on two things: subproblems recur, and the best answer to the whole is built from best answers to the parts. Start with memoisation, learn to define a state, write the transition and pick an order — then work through the common state designs: knapsack, sequences, grids, intervals, bitmasks and trees.",
      applications: [
        { title: "Spell check and autocorrect", desc: "How far apart are \"teh\" and \"the\"? Edit distance counts the fewest changes, and it is behind both input methods and \"did you mean\".", sub: "edit-distance" },
        { title: "git diff", desc: "Which lines are unchanged, which were added or removed — that is the longest common subsequence.", sub: "lcs" },
        { title: "Budgets and resource allocation", desc: "A fixed budget, each option with a cost and a payoff, and you want the best combination. That is the knapsack problem, and cloud capacity planning is the same question.", sub: "knapsack" },
        { title: "Why plain recursion is not enough", desc: "Naive Fibonacci recomputes the same subproblem millions of times. Remember the answers and exponential time becomes linear — that is where DP starts.", sub: "memo" },
      ],
    },
    string: {
      zh: "Matching, searching and hashing",
      desc: "Matching, searching and hashing. The prefix function is the key tool here.",
      intro:
        "Brute-force string matching is O(nm) in the worst case. Every algorithm in this topic avoids re-comparing in a different way: hashing replaces strings with numbers, KMP and Z reuse what has already been matched, and Manacher exploits the symmetry of palindromes.",
      applications: [
        { title: "Ctrl+F and grep", desc: "Finding a string in a hundred-million-character log is O(nm) at worst by brute force. KMP never re-reads what it has already matched, making it linear.", sub: "kmp" },
        { title: "Plagiarism and duplicate detection", desc: "Hash each passage to a number and compare numbers instead of text. Rabin-Karp's rolling hash means sliding the window costs nothing.", sub: "rabin-karp" },
        { title: "DNA sequence analysis", desc: "A genome is a very long ACGT string. Finding a particular fragment, or a palindromic structure (restriction sites often are), is string algorithms.", sub: "hashing" },
        { title: "Matching thousands of keywords at once", desc: "A trie layers every keyword on top of each other, so one pass over the document finds all of them.", sub: "trie-apps" },
      ],
    },
    bits: {
      zh: "Working directly with ones and zeroes",
      desc: "Work on the ones and zeroes directly. Fast, compact, and a way to represent sets.",
      intro:
        "An integer in memory is just a run of bits. AND, OR, XOR and the shifts are each a single CPU instruction, and used well they collapse some problems to constant time — or let one integer stand in for a whole set.",
      applications: [
        { title: "Permissions and feature flags", desc: "Read, write and execute take one bit each, so one integer holds the lot. Unix's chmod 755 and a game's status flags work this way.", sub: "basics" },
        { title: "Finding the one that is alone", desc: "Every value appears twice except one. XOR them all together and the pairs cancel, leaving the answer — with no extra memory at all.", sub: "xor" },
        { title: "Netmasks and hashing", desc: "Subnet masks, replacing a hash table's modulo with an AND, Bloom filters — all bit operations underneath.", sub: "counting-bits" },
      ],
    },
    math: {
      zh: "The maths that keeps coming up",
      desc: "The handful of mathematical tools that algorithm problems keep reaching for.",
      intro:
        "This is not number theory for its own sake — it is the few tools that algorithm problems keep needing: greatest common divisor, prime sieves, modular arithmetic and fast exponentiation, and counting. They show up again and again in cryptography, hashing and counting problems.",
      applications: [
        { title: "RSA behind HTTPS", desc: "Public-key encryption runs on large primes and modular arithmetic: generating primes, computing modular inverses, doing modular exponentiation. Every lesson here is one of its parts.", sub: "modular" },
        { title: "Aspect ratios and reducing fractions", desc: "1920×1080 is 16:9 because of the greatest common divisor. Fraction arithmetic, aligning periods and gear ratios are the same tool.", sub: "gcd" },
        { title: "\"How many ways are there?\"", desc: "How many paths from corner to corner, how many five-card hands. Binomial coefficients are everywhere in counting and probability — just watch for overflow and remember to take the modulus.", sub: "combinatorics" },
      ],
    },
  },

  subs: {
    "foundations/big-o": {
      zh: "Time and space complexity",
      desc: "Describing how cost grows with the input size n",
      apply: "Judging whether code will hold up under real data; asked in every interview",
    },
    "foundations/recursion": {
      zh: "Recursion",
      desc: "A function calling itself, with the call stack remembering the way back",
      apply: "Tree traversal, DFS, divide and conquer, and where DP starts",
    },
    "foundations/amortized": {
      zh: "Amortised analysis",
      desc: "The average cost over a run of operations, not the worst single one",
      apply: "Why dynamic arrays, hash table growth and union-find are fast enough",
    },
    "arrays/array": {
      zh: "Arrays and dynamic arrays",
      desc: "Contiguous memory, O(1) access, but inserting in the middle shifts everything",
      apply: "Every language's list or vector",
    },
    "arrays/prefix-sum": {
      zh: "Prefix sums",
      desc: "Accumulate once, and a range sum becomes a single subtraction",
      apply: "Range totals in reports, subarray-sum problems",
    },
    "arrays/hash-table": {
      zh: "Hash tables",
      desc: "Hash functions, collision handling, load factor",
      apply: "Caches, sessions, database indexes, deduplication",
    },
    "arrays/hash-map-apps": {
      zh: "Counting and deduplication",
      desc: "Two Sum and Group Anagrams — the \"trade space for time\" pattern",
      apply: "Frequency counts, pairing lookups",
    },
    "arrays/matrix": {
      zh: "2D arrays",
      desc: "Rotation, transpose, spiral traversal, four-directional movement",
      apply: "Image processing, board games, grid maps",
    },
    "linked-list/singly": {
      zh: "Singly linked lists",
      desc: "Nodes, pointers, head and sentinel nodes",
      apply: "Building pointer intuition; implementing queues and stacks",
    },
    "linked-list/doubly": {
      zh: "Doubly linked lists",
      desc: "Walk both ways, delete any known node in O(1)",
      apply: "LRU caches, browsing history, undo/redo",
    },
    "linked-list/reverse": {
      zh: "Reversing a list",
      desc: "The three-pointer iterative form and the recursive one",
      apply: "Core pointer practice; very common in interviews",
    },
    "linked-list/fast-slow": {
      zh: "Fast and slow pointers",
      desc: "Find the middle, detect a cycle (Floyd), find where the cycle starts",
      apply: "Detecting circular references, splitting a list in half",
    },
    "linked-list/merge-lists": {
      zh: "Merging lists",
      desc: "Merge two sorted lists; use a heap when there are K of them",
      apply: "The heart of merge sort; merging several sorted streams",
    },
    "stack-queue/stack": {
      zh: "Stacks",
      desc: "push / pop / peek, the call stack, bracket matching",
      apply: "Undo, bracket checking, expression evaluation, DFS",
    },
    "stack-queue/queue": {
      zh: "Queues and deques",
      desc: "Circular array implementation, double-ended queues",
      apply: "Job scheduling, message queues, BFS",
    },
    "stack-queue/monotonic-stack": {
      zh: "Monotonic stacks",
      desc: "Keep it increasing or decreasing to find the next greater or smaller element",
      apply: "Stock analysis, largest rectangle in a histogram, daily temperatures",
    },
    "stack-queue/monotonic-queue": {
      zh: "Monotonic queues",
      desc: "O(1) maximum over a sliding window",
      apply: "Window extremes in live monitoring, DP optimisation",
    },
    "heap/binary-heap": {
      zh: "Binary heaps",
      desc: "Array representation, sift up / sift down, heapify",
      apply: "Priority queues, Dijkstra, event simulation",
    },
    "heap/top-k": {
      zh: "Top K",
      desc: "Keep a heap of size K, or use Quick Select",
      apply: "Leaderboards, shortlisting candidates in a recommender",
    },
    "heap/two-heaps": {
      zh: "Two heaps",
      desc: "A max-heap on the left, a min-heap on the right, kept balanced",
      apply: "Median of a stream, median over a sliding window",
    },
    "tree/binary-tree": {
      zh: "Binary tree basics",
      desc: "Height, depth, complete trees, array representation",
      apply: "The shared basis for heaps, expression trees and decision trees",
    },
    "tree/traversal": {
      zh: "Pre-, in-, post- and level-order traversal",
      desc: "Recursive and iterative forms; level order uses a queue",
      apply: "Folder sizes, serialising a tree, evaluating expressions",
    },
    "tree/bst": {
      zh: "Binary search trees",
      desc: "Insert, delete, validate; in-order gives you sorted output",
      apply: "Ordered sets, range queries, the prototype of a database index",
    },
    "tree/balanced": {
      zh: "How balancing works",
      desc: "Why AVL and red-black trees guarantee O(log n) — the idea, not the implementation",
      apply: "TreeMap, std::map, database indexes",
    },
    "tree/trie": {
      zh: "Tries",
      desc: "One character per level, shared prefixes",
      apply: "Autocomplete, spell check, IP routing tables",
    },
    "tree/segment": {
      zh: "Segment trees",
      desc: "Range queries with point updates; lazy propagation for range updates",
      apply: "Dynamic range sum and range maximum queries",
    },
    "tree/fenwick": {
      zh: "Fenwick trees",
      desc: "A dynamic prefix sum built out of bit tricks",
      apply: "A lighter alternative to a segment tree; counting inversions",
    },
    "graph-ds/adjacency": {
      zh: "Adjacency lists and matrices",
      desc: "Directed, undirected, weighted; the sparse versus dense trade-off",
      apply: "The input format for every graph algorithm",
    },
    "graph-ds/union-find": {
      zh: "Union-find",
      desc: "Path compression, union by rank",
      apply: "Connectivity checks, clustering, the core of Kruskal",
    },
    "sorting/bubble": {
      zh: "Bubble sort",
      desc: "Swap neighbours — the most obvious and the slowest",
      apply: "Teaching: understanding adjacent swaps and stability",
    },
    "sorting/selection": {
      zh: "Selection sort",
      desc: "Each pass picks the smallest and puts it in front",
      apply: "Fewest writes, for when writing is expensive",
    },
    "sorting/insertion": {
      zh: "Insertion sort",
      desc: "Like sorting a hand of cards; O(n) when nearly sorted",
      apply: "Small or nearly sorted arrays — built-in sorts switch to it for short runs",
    },
    "sorting/merge": {
      zh: "Merge sort",
      desc: "Halve, sort each, merge. Stable",
      apply: "External sorting of large files, sorting linked lists, counting inversions",
    },
    "sorting/quick": {
      zh: "Quicksort",
      desc: "Pick a pivot, split, recurse. Fastest on average",
      apply: "The basis of most built-in sorts; Quick Select finds the kth largest",
    },
    "sorting/heap-sort": {
      zh: "Heapsort",
      desc: "Heapify, then extract one at a time. In place",
      apply: "When memory is tight and you still need a guaranteed n log n",
    },
    "sorting/counting": {
      zh: "Counting sort",
      desc: "Count how often each value appears — no comparisons at all",
      apply: "Integers over a small range: scores, ages",
    },
    "sorting/radix": {
      zh: "Radix and bucket sort",
      desc: "Bucket by digit or by range",
      apply: "Fixed-length integers or strings, such as phone numbers",
    },
    "sorting/lower-bound": {
      zh: "The comparison sort lower bound",
      desc: "A decision tree proves comparison sorting needs Ω(n log n)",
      apply: "Knowing when faster is impossible",
    },
    "searching/linear": {
      zh: "Linear search",
      desc: "Look at them one by one — the only option on unordered data",
      apply: "Small data, unordered data, a one-off lookup",
    },
    "searching/binary": {
      zh: "Binary search",
      desc: "Getting the lower bound and upper bound boundaries right",
      apply: "git bisect, dictionary lookups, version compatibility testing",
    },
    "searching/binary-answer": {
      zh: "Binary search on the answer",
      desc: "If the answer is monotonic you can binary search it, with a feasibility check",
      apply: "Allocation problems, minimising the maximum",
    },
    "searching/two-pointers": {
      zh: "Two pointers",
      desc: "Pointers closing in from both ends, or both moving the same way",
      apply: "Pairs in a sorted array, deduplication, palindrome checks",
    },
    "searching/sliding": {
      zh: "Sliding windows",
      desc: "Fixed-length and variable-length forms",
      apply: "Stream statistics, rate limiting, longest substring without repeats",
    },
    "backtracking/subsets": {
      zh: "Subsets",
      desc: "Take each element or do not — 2ⁿ of them",
      apply: "Testing feature flag combinations, enumerating a power set",
    },
    "backtracking/permutations": {
      zh: "Permutations",
      desc: "A used array, or swapping in place",
      apply: "Ordering a schedule, enumerating routes",
    },
    "backtracking/combinations": {
      zh: "Combinations and pruning",
      desc: "Start from an index to avoid repeats; sort first to prune early",
      apply: "Making up an amount, picking a team",
    },
    "backtracking/n-queens": {
      zh: "N-queens",
      desc: "Place row by row, tracking attacked columns and diagonals in sets",
      apply: "The prototype constraint-satisfaction problem: timetabling, rostering",
    },
    "backtracking/word-search": {
      zh: "Backtracking on a grid",
      desc: "DFS across a grid, restoring the mark on the way back",
      apply: "Word games, enumerating maze routes",
    },
    "divide-conquer/master": {
      zh: "Solving recurrences",
      desc: "The three cases of T(n) = aT(n/b) + f(n)",
      apply: "Reading off the cost of a divide-and-conquer algorithm quickly",
    },
    "divide-conquer/max-subarray": {
      zh: "Maximum subarray",
      desc: "The divide-and-conquer version next to Kadane's linear one",
      apply: "Best buy-and-sell window, signal analysis",
    },
    "divide-conquer/fast-pow": {
      zh: "Fast exponentiation",
      desc: "Halve the exponent, recursively or with bit iteration",
      apply: "RSA, modular arithmetic, matrix powers for Fibonacci",
    },
    "divide-conquer/inversions": {
      zh: "Counting inversions",
      desc: "Count them during merge sort's merge step",
      apply: "Ranking similarity, measuring how unsorted data is",
    },
    "greedy/principles": {
      zh: "When greedy is correct",
      desc: "The greedy-choice property and exchange arguments",
      apply: "Deciding whether a problem can be greedy; if not, reach for DP",
    },
    "greedy/coin": {
      zh: "Making change",
      desc: "Greedy works on standard coin sets and fails on arbitrary ones",
      apply: "Till change; understanding when greed breaks",
    },
    "greedy/interval": {
      zh: "Interval scheduling",
      desc: "Sort by end time. Merge Intervals, Meeting Rooms",
      apply: "Booking rooms, CPU job scheduling, ad slots",
    },
    "greedy/jump": {
      zh: "Jump game",
      desc: "Track the furthest position reachable so far",
      apply: "Quickly deciding whether resources are enough to reach a goal",
    },
    "greedy/huffman": {
      zh: "Huffman coding",
      desc: "Use a heap to merge the two lowest frequencies each step",
      apply: "The entropy coding stage of zip, JPEG and MP3",
    },
    "graph/bfs": {
      zh: "Breadth-first search",
      desc: "Spreads outward one ring at a time; made for shortest paths on unweighted graphs",
      apply: "Fewest steps, degrees of separation, crawling level by level",
    },
    "graph/dfs": {
      zh: "Depth-first search",
      desc: "Go as deep as possible then back out; the basis of components and topological sort",
      apply: "Walking folders, flood fill, detecting circular dependencies",
    },
    "graph/grid": {
      zh: "Grids as graphs",
      desc: "Treat a 2D array as a graph, where the four directions are the edges",
      apply: "Counting islands, mazes, connected regions in an image",
    },
    "graph/cycle": {
      zh: "Cycle detection",
      desc: "Three-colour marking on directed graphs, union-find on undirected ones",
      apply: "Circular dependencies, deadlock detection",
    },
    "graph/topo": {
      zh: "Topological sort",
      desc: "Kahn's in-degree method and the DFS finishing-order method",
      apply: "Package install order, course prerequisites, build pipelines",
    },
    "graph/bipartite": {
      zh: "Bipartite checking",
      desc: "Two-colour it so neighbours never share a colour",
      apply: "Matching problems, splitting things that conflict",
    },
    "graph/dijkstra": {
      zh: "Single-source shortest paths",
      desc: "On non-negative weights, settle distances one at a time with a priority queue",
      apply: "Fastest route in navigation, network routing",
    },
    "graph/bellman-ford": {
      zh: "Shortest paths with negative weights",
      desc: "Relax V−1 rounds; if round V still relaxes, there is a negative cycle",
      apply: "Detecting currency arbitrage, paths with negative edges",
    },
    "graph/floyd": {
      zh: "All-pairs shortest paths",
      desc: "A triple loop of DP, good for small dense graphs",
      apply: "Routing tables for small networks, any-pair distance lookups",
    },
    "graph/dag-shortest": {
      zh: "Shortest paths on a DAG",
      desc: "Topologically sort first, then relax in order — negative weights are fine",
      apply: "Critical path in project scheduling",
    },
    "graph/mst": {
      zh: "Minimum spanning trees",
      desc: "Kruskal sorts edges and uses union-find; Prim uses a heap",
      apply: "Laying cable or fibre, cluster analysis",
    },
    "dp/memo": {
      zh: "Memoisation and tabulation",
      desc: "Fibonacci and Climbing Stairs, top-down and bottom-up",
      apply: "Any recursion with overlapping subproblems — add a cache first",
    },
    "dp/dp-1d": {
      zh: "One-dimensional DP",
      desc: "House Robber, Decode Ways — the state depends only on the last few",
      apply: "Sequential decisions, simple scheduling and counting",
    },
    "dp/knapsack": {
      zh: "0/1 knapsack",
      desc: "Take each item or do not; the 2D table and its space-compressed form",
      apply: "Budget allocation, portfolios, container loading",
    },
    "dp/unbounded": {
      zh: "Unbounded knapsack",
      desc: "Items can be reused — the DP behind Coin Change",
      apply: "Fewest coins for an amount, purchasing from unlimited supply",
    },
    "dp/lis": {
      zh: "Longest increasing subsequence",
      desc: "The O(n²) DP and the O(n log n) patience-sorting version",
      apply: "Stock trend analysis, the Russian doll envelopes problem",
    },
    "dp/lcs": {
      zh: "Longest common subsequence",
      desc: "A 2D table; on a match, take the diagonal plus one",
      apply: "diff tools, DNA alignment, plagiarism comparison",
    },
    "dp/edit-distance": {
      zh: "Edit distance",
      desc: "The fewest inserts, deletes and substitutions",
      apply: "Spell correction, fuzzy search, scoring speech recognition",
    },
    "dp/grid-dp": {
      zh: "Paths on a grid",
      desc: "Unique Paths and Min Path Sum, moving only right or down",
      apply: "Counting robot routes, seam carving in images",
    },
    "dp/interval-dp": {
      zh: "Interval DP",
      desc: "Burst Balloons and matrix chain multiplication — enumerate the split point",
      apply: "Optimal parenthesisation, polygon triangulation",
    },
    "dp/bitmask-dp": {
      zh: "Bitmask DP",
      desc: "Use the bits of an integer to represent a set as the state",
      apply: "TSP, small assignment problems",
    },
    "dp/tree-dp": {
      zh: "DP on trees",
      desc: "Post-order traversal, combining subtree answers into the parent's",
      apply: "Tree diameter, maximum path sum, independent set on a tree",
    },
    "string/hashing": {
      zh: "String hashing",
      desc: "Polynomial hashing, the modulus, and collisions",
      apply: "Comparing substrings for equality quickly",
    },
    "string/rabin-karp": {
      zh: "Rolling hash matching",
      desc: "Update the hash in O(1) as the window moves",
      apply: "Plagiarism detection, multi-pattern matching",
    },
    "string/kmp": {
      zh: "Prefix-function matching",
      desc: "The failure function keeps the match pointer from going backwards",
      apply: "Text search, signature matching in intrusion detection",
    },
    "string/z-algo": {
      zh: "The Z function",
      desc: "For each position, the longest common prefix with the whole string",
      apply: "String matching, detecting periodicity",
    },
    "string/manacher": {
      zh: "Longest palindrome",
      desc: "Reuse the symmetry of known palindromes instead of expanding again",
      apply: "Palindromic DNA fragments, text analysis",
    },
    "string/trie-apps": {
      zh: "Tries in practice",
      desc: "Autocomplete, Word Search II, multi-pattern matching",
      apply: "Search suggestions, profanity filtering",
    },
    "bits/basics": {
      zh: "The basic operations",
      desc: "AND / OR / XOR / NOT and shifts; getting, setting and clearing a bit",
      apply: "Permission flags, hardware registers, compact storage",
    },
    "bits/xor": {
      zh: "XOR tricks",
      desc: "a ^ a = 0 and a ^ 0 = a — swapping and cancelling",
      apply: "Single Number, the missing number, swapping without a temporary",
    },
    "bits/counting-bits": {
      zh: "Counting bits",
      desc: "Brian Kernighan's n & (n−1)",
      apply: "Hamming distance, population count",
    },
    "bits/subset-enum": {
      zh: "Enumerating subsets with bits",
      desc: "Every integer from 0 to 2ⁿ−1 is one subset",
      apply: "Small combinatorial problems, the setup for bitmask DP",
    },
    "math/gcd": {
      zh: "Greatest common divisor",
      desc: "Euclid's algorithm and the extended version",
      apply: "Reducing fractions, ratios, synchronising periods",
    },
    "math/sieve": {
      zh: "Prime sieves",
      desc: "Cross off multiples from the bottom up",
      apply: "Generating a prime table, factorisation",
    },
    "math/modular": {
      zh: "Modular arithmetic",
      desc: "Modular addition and multiplication, fast powers, inverses via Fermat",
      apply: "RSA, hashing, taking answers mod 10⁹+7",
    },
    "math/combinatorics": {
      zh: "Counting",
      desc: "Pascal's triangle, C(n,k), precomputed factorials under a modulus",
      apply: "Counting paths, probability, sampling",
    },
  },
};
