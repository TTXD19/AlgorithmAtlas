import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Union-Find, Binary Heap, Greedy Principles",
  applications: [
    {
      title: "Laying out a power grid or a fibre network",
      problem:
        "A utility has to connect 40 villages to the grid, and the cost of running a line between any two of them varies with distance and terrain. Every village needs power, but not every pair needs a direct line — they only have to end up connected — and the total construction cost should be as low as possible.",
      why: "A network that is fully connected at the lowest total cost can never contain a cycle: remove the most expensive line on a cycle and everything stays connected for less. So the answer is exactly a minimum spanning tree. In 1926 the Czech mathematician Borůvka published the first MST algorithm for precisely this reason — he was planning the electricity network for Moravia.",
    },
    {
      title: "Single-linkage clustering",
      problem:
        "You have 5,000 customer records, each a feature vector. Marketing wants eight clusters where customers inside a cluster are similar and the gaps between clusters are as large as possible — but nobody knows what shape the clusters have, and they need not be round.",
      why: "Treat each record as a node and each pairwise distance as an edge weight, then run Kruskal but stop early: every edge you accept merges two groups, so halt when eight remain. That is the same as cutting the seven longest edges of the minimum spanning tree, and the result is single-linkage hierarchical clustering. It can find long, thin or curved clusters, which k-means, looking only at cluster centres, cannot.",
    },
    {
      title: "Drill paths for a circuit board",
      problem:
        "A CNC machine has to drill 2,000 holes in a circuit board, visiting every hole and returning to the origin. The shorter the path, the faster the production line. Finding the genuinely shortest route is the travelling salesman problem, which is hopeless at this size.",
      why: "Build the minimum spanning tree over the hole positions, run a depth-first traversal of that tree, and drill in the order the traversal first reaches each hole, skipping any already visited. As long as the distances satisfy the triangle inequality, this route is guaranteed to be at most twice the optimum — and the MST itself takes only O(V²). It is one of the classic approximation algorithms.",
    },
  ],
  cue: "Connect every point at the lowest total cost, no start or end specified, a cost between every pair of points, cutting the longest edges to form clusters, minimising the largest edge on a path (a bottleneck path), union-find.",
  steps: [
    "Confirm the graph is undirected and connected. For Kruskal: sort every edge by weight, lightest first, and start union-find with each node in its own group.",
    "Walk the edges in order. For `(u, v, w)`, if `find(u) ≠ find(v)`, take the edge and `union` the two groups; if they match, skip it, because it would close a cycle.",
    "Stop once you have V − 1 edges. If you run out of edges with fewer than V − 1, the graph is disconnected.",
    "For Prim: start at any node and push its incident edges into a min-heap. Pop the lightest edge each time; if its far end is already in the tree, discard it, otherwise add that node to the tree and push its edges to nodes still outside. Stop when all V nodes are in.",
    "On a dense graph, use array Prim instead: keep `key[v]`, the lightest edge from each outside node to the tree, add the node with the smallest key each round, and use it to update the other keys. O(V²).",
  ],
  demoNote:
    'The same graph of 6 nodes and 9 edges, with the two algorithms on the toggle at the top. In "Kruskal" mode the right-hand side shows the sorted edges and the current groups: B–E, A–D and A–B are taken in turn, merging A, B, D and E into one group; then B–D (4) has both ends in that group, so it goes dashed and is discarded; C–F is taken; D–E (5) is discarded for the same reason; C–E (6) joins the two groups, which completes the 5 edges, leaving B–C and E–F unexamined. In "Prim" mode the tree grows from A and the right-hand side is the min-heap: A–D, A–B and B–E come off first, then D–B and D–E pop with their far ends already in the tree and have to be dropped, and E–C and C–F finish the job. Blue edges are in the spanning tree, yellow is the edge being processed this step. Both methods pick the same edges, and both total 16.',
  codeNote:
    "The Python tab has union-find, Kruskal, lazy Prim, and single-linkage clustering by stopping Kruskal at k groups. The C++ tab has Kruskal via sorting plus union-find, and handles a complete graph of points in the plane with the O(V²) array version of Prim — with that many edges, listing and sorting them all is not worth it.",
  problems: [
    { src: "LeetCode 1584", name: "Min Cost to Connect All Points (a complete graph, ideal for array Prim)", diff: "Medium" },
    { src: "LeetCode 778", name: "Swim in Rising Water (a bottleneck path: add cells in increasing height order)", diff: "Hard" },
    { src: "LeetCode 1697", name: "Checking Existence of Edge Length Limited Paths (offline queries, sorted alongside the edges)", diff: "Hard" },
    { src: "LeetCode 1579", name: "Remove Max Number of Edges to Keep Graph Fully Traversable (two union-find structures)", diff: "Hard" },
    { src: "LeetCode 1489", name: "Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree", diff: "Hard" },
  ],
};
