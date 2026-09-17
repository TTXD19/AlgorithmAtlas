import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "BFS, binary heaps, adjacency lists / matrices",
  applications: [
    {
      title: 'The "fastest route" in a navigation app',
      problem:
        'A city has 30,000 junctions and 80,000 road segments, and live traffic speeds turn each segment into a number of seconds. The user taps "Go" and expects the quickest way from home to the office within a second.',
      why: "Junctions are nodes, segments are edges, seconds are weights, and time is never negative — exactly Dijkstra's precondition. BFS only counts how many junctions you pass, so it would pick a route with few junctions and heavy traffic. Dijkstra settles the earliest arrival at each junction from nearest to farthest and can stop the moment the destination is settled, without working out the whole city.",
    },
    {
      title: "Routers building their tables with OSPF",
      problem:
        "A corporate network has 200 routers and 600 links, where each link's cost is a reference bandwidth divided by the link's bandwidth: 10 Gbps scores 1, 1 Gbps scores 10. Whenever a line goes down, every router has to recompute its best path to the other 199.",
      why: "In OSPF each router holds the entire topology, so one run of Dijkstra from itself produces the shortest-path tree to every destination at once. The routing table only needs the next hop for each destination, and following the parent pointers back gives exactly that. This is the textbook single-source, all-destinations use.",
    },
    {
      title: "Terrain pathfinding in a strategy game",
      problem:
        "The map is a 256 × 256 grid where stepping onto open ground costs 1 second, forest 3 and swamp 8. The player clicks a destination, and the unit should take the route with the least total time rather than the fewest tiles.",
      why: 'Each tile is a node, its four neighbours are its edges, and the weight is the number of seconds it costs to step into that tile. BFS would march straight through the swamp; Dijkstra guarantees the least total time. A*, the usual choice in games, is Dijkstra plus an estimate of "how far the goal still is", which makes the heap expand tiles pointing towards the goal first — the skeleton is identical.',
    },
  ],
  cue: "Shortest, fastest or cheapest path, edges with non-negative weights, costs that add up along a path, one source to every node, grids where each cell costs a different amount, a priority queue plus relaxation.",
  steps: [
    "Build the adjacency list `adj[u] = [(v, w), …]`, adding each edge in both directions for an undirected graph. Confirm that every weight is **≥ 0**; a single negative one rules Dijkstra out.",
    "Set every `dist` to ∞ and every `parent` to −1, then `dist[src] = 0` and push `(0, src)` onto the min-heap.",
    "Pop the top of the heap, `(d, u)`. If `d > dist[u]` this is a stale entry that has since been improved, so skip it; otherwise `dist[u]` is final from here on. With a single destination, you can stop as soon as `u` is that destination.",
    "For each edge `(v, w)` out of `u`: if `d + w < dist[v]`, set `dist[v] = d + w` and `parent[v] = u`, then push `(dist[v], v)`. There is no need to delete `v`'s older entry from the heap.",
    "Repeat 3–4 until the heap is empty. A node still at ∞ is unreachable; for the route itself, follow `parent` back from the destination until you reach −1, then reverse the sequence.",
  ],
  demoNote:
    'An undirected graph of six junctions A–F, where the number on each edge is how many minutes that stretch of road takes. The source is A, and it is the same graph as the code example. Node colours follow the legend: yellow is still in the priority queue, blue is the node just popped and currently relaxing its edges, and a finished node becomes a filled "settled" circle. The edge under inspection turns yellow, and it is drawn dashed when nothing was updated; the blue edges are the shortest-path tree so far. Watch B: it starts at 4 straight from A, then drops to 2 + 1 = 3 once C is settled, while the old (4, B) stays in the queue and is struck through and skipped when its turn comes. D and E are each improved once as well. After E is settled, trying E–F gives 10 + 5 = 15, no better than 14, so nothing changes. The last step highlights A → C → B → D → F in green, 14 minutes in all.',
  codeNote:
    "Three functions: the lazy-deletion heap version of Dijkstra (which records `parent` at the same time), the reconstruction of a path by following `parent`, and the heap-free O(V²) adjacency-matrix version that scans for the minimum each round. Both versions produce the same distances, and they sit side by side for comparison: reach for the heap version on sparse graphs, and for the matrix version when there are few nodes but almost every pair is connected.",
  problems: [
    { src: "LeetCode 743", name: "Network Delay Time (the template problem: shortest distance to the farthest node)", diff: "Medium" },
    { src: "LeetCode 1514", name: "Path with Maximum Probability (probabilities multiply, so use a max-heap)", diff: "Medium" },
    { src: "LeetCode 1631", name: "Path With Minimum Effort (on a grid, with path cost as a maximum)", diff: "Medium" },
    { src: "LeetCode 1976", name: "Number of Ways to Arrive at Destination (count the shortest paths along the way)", diff: "Medium" },
    { src: "LeetCode 2290", name: "Minimum Obstacle Removal to Reach Corner (weights are only 0 and 1, so 0-1 BFS works)", diff: "Hard" },
    { src: "LeetCode 2203", name: "Minimum Weighted Subgraph With the Required Paths (run it on the reversed graph too)", diff: "Hard" },
  ],
};
