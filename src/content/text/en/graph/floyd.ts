import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Bellman-Ford, adjacency lists / matrices",
  applications: [
    {
      title: "A lookup table for NPC pathfinding",
      problem:
        "A game level is navigated through a mesh of 300 waypoints, and a hundred NPCs on screen each decide where to step next on every frame. Running a shortest-path search per NPC per frame would eat the entire frame budget.",
      why: "The map is fixed, so at load time you can run Floyd-Warshall once and get both the distance between every pair of waypoints and a \"next hop\" table. 300³ is 27 million operations, well under a second. During play each NPC just reads next[current][target] and knows where to go in O(1), at a cost of two 300 × 300 tables.",
    },
    {
      title: "Role inheritance in a permission system",
      problem:
        "An enterprise permission system has 200 roles, roles can inherit from other roles, and inheritance chains: admin inherits editor, editor inherits viewer. Every permission check has to walk down that chain, there is no obvious depth at which to stop, and someone may have configured a cycle.",
      why: "Swap \"shortest distance\" for \"is it reachable\", addition for AND and minimum for OR, and the same triple loop becomes Warshall's transitive closure. Precompute what each role actually covers and every check is a table lookup. With bitsets ORing a whole row at a time, 200 roles takes no time at all.",
    },
    {
      title: "The highest-bandwidth path across a network",
      problem:
        "The dedicated links between data centres all have different bandwidths, and the throughput of a route is set by its narrowest hop. The operations team wants to know the most bandwidth available between any two data centres.",
      why: "Floyd-Warshall's structure does not care that the operation is addition. Replace \"length through k = the two halves added\" with \"bandwidth through k = the smaller of the two halves\", and \"take the shortest\" with \"take the largest\", and the update becomes cap[i][j] = max(cap[i][j], min(cap[i][k], cap[k][j])) — still O(V³) for the widest bottleneck between every pair.",
    },
  ],
  cue: "Shortest distances between all pairs, a few hundred nodes at most, a dense graph, negative edges but no negative cycle, reachability or transitive closure, bottleneck paths, a lot of point-to-point queries.",
  steps: [
    "Build the V × V matrix `dist`: `dist[i][i] = 0`, each edge `u → v` set to `min(current value, w)`, everything else ∞. If you want to recover paths, also set `next[u][v] = v`.",
    "The outermost loop runs k from 0 to V − 1, meaning \"k is now allowed as an intermediate node\".",
    "The two inner loops enumerate i and j: if neither `dist[i][k]` nor `dist[k][j]` is ∞ and their sum is smaller than `dist[i][j]`, update `dist[i][j]` and set `next[i][j] = next[i][k]`.",
    "Once the triple loop finishes, check the diagonal: any `dist[i][i] < 0` means the graph contains a negative cycle.",
    "To query a distance, read `dist[i][j]`; to get the path, start at i and repeatedly move to `next[current][j]` until you arrive at j.",
  ],
  demoNote:
    "Four nodes and eight directed edges, where B → C has weight −2. The distance matrix on the right starts out holding only the direct edges. Each round first fixes the intermediate node k (the yellow node, with row k and column k of the matrix outlined in yellow), then steps through the cells this round shrinks: blue is the dist[i][j] being updated, solid yellow are the dist[i][k] and dist[k][j] it reads, and green marks the cells already updated this round. k = A lets C and D reach B through A; k = B puts the negative edge to work, taking A → C from ∞ to 2 and D → C from 8 to 3; k = C and k = D change three cells each, with B → A and C → B both updated twice. Finally the diagonal is checked for negatives, and the next table reconstructs the shortest path from D to C: D → A → B → C, total length 3.",
  codeNote:
    "Python has the full version: handling duplicate edges, recording next to recover paths, and checking for negative cycles, plus a Warshall transitive closure over bitsets using role inheritance as the example. C++ has the shortest-distance version updating in place, with INF set to a quarter of the maximum so sums cannot overflow, and a widest-path variant that swaps the operations for min and max.",
  problems: [
    { src: "LeetCode 1334", name: "Find the City With the Smallest Number of Neighbors at a Threshold Distance", diff: "Medium" },
    { src: "LeetCode 1462", name: "Course Schedule IV (transitive closure)", diff: "Medium" },
    { src: "LeetCode 399", name: "Evaluate Division (Floyd-Warshall with addition swapped for multiplication)", diff: "Medium" },
    { src: "LeetCode 2976", name: "Minimum Cost to Convert String I (cheapest conversions between 26 letters)", diff: "Medium" },
    { src: "LeetCode 2959", name: "Number of Possible Sets of Closing Branches (enumerate subsets, running Floyd-Warshall on each)", diff: "Hard" },
    { src: "LeetCode 2977", name: "Minimum Cost to Convert String II", diff: "Hard" },
  ],
};
