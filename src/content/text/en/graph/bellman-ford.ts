import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Dijkstra, adjacency lists / matrices",
  applications: [
    {
      title: "Spotting arbitrage in currency markets",
      problem:
        "A trading system receives the exchange rate between every pair of 150 currencies, once a second. If dollars to euros, euros to yen and yen back to dollars multiply out to more than 1, that is a risk-free profit, and you have to find it before the rates move.",
      why: "Turn a rate r into the edge weight −log r and \"the product is greater than 1\" becomes \"the weights sum to less than 0\", so an arbitrage opportunity is exactly a negative cycle in the graph. Dijkstra cannot handle negative weights, but Bellman-Ford can: run V − 1 rounds, sweep once more, and anything still relaxable means a negative cycle — and walking back along parent recovers the actual chain of trades.",
    },
    {
      title: "RIP, where a router only knows its neighbours",
      problem:
        "A campus network has a few dozen routers. Each one knows only how far away its directly connected neighbours are, no single router holds the whole topology, and yet every one of them has to work out the shortest route to every subnet.",
      why: "A distance-vector protocol is just Bellman-Ford, distributed. Each router periodically sends its distance table to its neighbours, and each neighbour relaxes its own table using \"your distance to the destination plus my distance to you\". Every exchange is effectively one round, and after a handful of them the network converges. RIP's rule that anything past 15 hops counts as unreachable exists precisely to stop this round-by-round updating from climbing forever when a link goes down.",
    },
    {
      title: "Checking a project schedule for contradictions",
      problem:
        "A project comes with hundreds of rules: \"B must start no later than 3 days after A starts\", \"C cannot start until at least 2 days after B starts\". The project manager wants to know whether all of them can hold at once.",
      why: "Every rule can be written as x_j − x_i ≤ c, which corresponds to an edge from i to j with weight c — a system of difference constraints. Rules that contradict each other are exactly a negative cycle in that graph, and when there is no negative cycle the shortest distances Bellman-Ford computes are a valid set of start dates.",
    },
  ],
  cue: "Negative edge weights, negative cycles, arbitrage, at most k edges, distance-vector routing, difference constraints x_j − x_i ≤ c, shortest paths where Dijkstra does not apply, modest V and E.",
  steps: [
    "Set every `dist` to ∞ and `dist[src] = 0`. Storing the graph as a plain list of edges `(u, v, w)` is enough.",
    "Repeat V − 1 rounds: for each edge, if `dist[u] != ∞` and `dist[u] + w < dist[v]`, update `dist[v]`, also recording `parent[v] = u` when you need the path itself.",
    "If a round makes no update at all, the distances have converged and you can stop early.",
    "Sweep all the edges one more time: if anything can still be relaxed, there is a negative cycle reachable from the start, and shortest paths are undefined.",
    "To recover the cycle: note a node updated in that sweep, walk back along `parent` V steps, then go around once collecting nodes. When at most k edges are allowed, relax each round against a copy of the previous round's `dist`.",
  ],
  demoNote:
    "Five nodes and ten directed edges, with negative weights written in yellow. \"Example 1: negative edges, no negative cycle\": round 1 alone makes six updates, round 2 has only A → D left, which pushes D from 2 down to −2, and round 3 changes nothing, so it stops early with A = 2 and D = −2. \"Example 2: a negative cycle\" changes C → A to −5, so going around A → D → C → A now sums to −2: every round still finds updates, even the source S is dragged below zero, and the check on round 5 after the four full rounds can still relax an edge. The negative cycle recovered along parent, C → A → D → C, is highlighted in yellow. As for the nodes, blue marks the one updated on this step and yellow marks nodes that already have a distance which may still change; a blue edge is one that relaxed successfully this round.",
  codeNote:
    "Python has the standard Bellman-Ford (with early exit and negative-cycle detection), a routine that recovers the cycle itself, and the \"at most k edges\" variation, all on the same graph as the interactive demo. C++ has Bellman-Ford and SPFA, each detecting negative cycles its own way: Bellman-Ford asks whether round V can still relax an edge, SPFA asks whether some shortest path has used V edges.",
  problems: [
    { src: "LeetCode 743", name: "Network Delay Time (non-negative weights — write it with Bellman-Ford as well and compare against Dijkstra)", diff: "Medium" },
    { src: "LeetCode 787", name: "Cheapest Flights Within K Stops (at most k+1 edges, each round using only the previous round's distances)", diff: "Medium" },
    { src: "CSES 1197", name: "Cycle Finding (find and print a negative cycle)", diff: "Medium" },
    { src: "LeetCode 1928", name: "Minimum Cost to Reach Destination in Time (relax in layers by time)", diff: "Hard" },
    { src: "CSES 1673", name: "High Score (longest path: negate the weights and only count negative cycles that can reach the target)", diff: "Hard" },
  ],
};
