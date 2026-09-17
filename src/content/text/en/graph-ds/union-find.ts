import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Arrays, recursion, amortised analysis",
  applications: [
    {
      title: "Is the network still connected?",
      problem:
        "Links between data centres are being added and rerouted constantly, and after every change you have to answer \"can A still reach B?\". Running a fresh BFS for each question is far too expensive.",
      why: "Union-find puts the nodes of one connected component into one group, so adding a link is merging two groups and a connectivity query is checking whether two nodes share a group. Both operations are all but constant time once amortised.",
    },
    {
      title: "Clustering faces in a photo library",
      problem:
        "Tens of thousands of faces, with an edge drawn between any two that are similar enough. In the end you want to know how many distinct people there are and which person each face belongs to.",
      why: "Each \"similar\" edge triggers one merge, and at the end every root stands for one person. Counting connected components is the most direct use of union-find, and Number of Provinces is exactly this problem.",
    },
    {
      title: "The heart of Kruskal's minimum spanning tree",
      problem:
        "You add edges in increasing order of weight, but an edge must never close a cycle. How do you decide quickly whether a given edge would create one?",
      why: "If both endpoints are already in the same group, the edge is redundant — and union returning false is precisely that signal. Without it, Kruskal would have to re-traverse the graph for every edge it considers.",
    },
  ],
  cue: "Whether two things are in the same group, edges added dynamically, how many connected components there are, whether adding this edge closes a cycle, merging only and never splitting.",
  steps: [
    "Initialise `parent[i] = i`, `size[i] = 1`, and the group count `count = n`.",
    "**find(x)**: while `parent[x] ≠ x`, recurse to find the root of `parent[x]` and point `parent[x]` straight at that root (path compression).",
    "**union(a, b)**: find both roots. If they are equal, return false; otherwise hang the smaller root under the larger one, update size, and do `count −= 1`.",
    "**connected(a, b)** is just `find(a) == find(b)`, and the number of connected components is `count`.",
    "When the nodes are not integers, map them to 0..n−1 with a hash table first. When edges have to be removed, consider processing the queries offline in reverse.",
  ],
  demoNote:
    "Eight nodes with a sequence of union and find operations. Watch how the parent array changes, how the trees grow, and which nodes get re-linked directly to the root when path compression fires.",
  codeNote:
    "A complete implementation with path compression and union by size, plus its two most common uses: counting connected components and detecting a cycle in an undirected graph. The C++ version uses iterative path halving to avoid recursion.",
  problems: [
    { src: "LeetCode 547", name: "Number of Provinces", diff: "Medium" },
    { src: "LeetCode 684", name: "Redundant Connection (cycle detection)", diff: "Medium" },
    { src: "LeetCode 200", name: "Number of Islands (worth redoing with union-find)", diff: "Medium" },
    { src: "LeetCode 721", name: "Accounts Merge (the nodes are strings)", diff: "Medium" },
    { src: "LeetCode 1584", name: "Min Cost to Connect All Points (the setup for Kruskal)", diff: "Medium" },
    { src: "LeetCode 1319", name: "Number of Operations to Make Network Connected", diff: "Medium" },
  ],
};
