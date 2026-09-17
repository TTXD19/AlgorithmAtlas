import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "BFS, DFS, union-find",
  applications: [
    {
      title: "Final exams, and only two slots to book",
      problem:
        "The department could only book two exam slots, morning and afternoon, and 60 courses need a final. Any two courses with a student in common cannot share a slot, and enrolment data turns up 400 such pairs.",
      why: "Make each course a node and each clash an edge, and the question becomes: can you colour the graph with two colours so that no edge joins two nodes of the same colour? Put any course in the morning and everything that clashes with it is forced into the afternoon; the colours cascade, and a single BFS answers it. When the schedule is impossible, the odd cycle the algorithm finds — three courses that all clash with each other, say — is concrete evidence of why, and tells you which courses to move to a make-up slot.",
    },
    {
      title: "Splitting traces across a two-layer board",
      problem:
        "A two-layer circuit board carries 90 traces, and drawing them on a single plane leaves 140 pairs crossing. Two traces that cross cannot share a layer: one goes on the front, the other on the back.",
      why: 'Build a conflict graph out of "these two cross" and the bipartite check hands you the layer for every trace. At O(V+E) it is cheap enough for a design tool to re-run after every edit. When the check fails, the odd cycle names the handful of traces that are stuck on each other, so the engineer only has to add vias or reroute within that small group.',
    },
    {
      title: "Finding the two sides before you run a matching algorithm",
      problem:
        "A tutoring marketplace is importing 8,000 accounts and 25,000 \"has taken a lesson together\" records from a legacy system, then using bipartite matching to schedule next term automatically. But each legacy record holds only two account IDs, with no field saying which one is the tutor and which one is the student.",
      why: "Bipartite matching (Hopcroft–Karp, for instance) needs to know the left and right sides up front. One BFS colouring splits the accounts into two groups and catches dirty data along the way: a component that fails to colour means the records contain an odd cycle — three accounts that have all tutored each other, say — and that group needs a human to look at it. Colouring only proves the two groups are opposites; to learn which group holds the tutors, look at any account in the component whose role you already know.",
    },
  ],
  cue: "Split into two groups, mutually conflicting items that cannot share a group, only two slots or layers or teams, adjacent nodes must differ, odd-length cycles, the setup for bipartite matching, the enemy of my enemy is my friend.",
  steps: [
    "Build an undirected adjacency list (treat directed edges as undirected) and a `color` array set entirely to `-1`, meaning not coloured yet.",
    "Scan the nodes in order. If `color[s] == -1`, then `s` starts a new connected component: colour it `0` and push it onto the queue.",
    "Pop `u` off the queue and look at each neighbour `v`. If `v` is uncoloured, colour it `1 − color[u]` and enqueue it; if it is already coloured and `color[v] == color[u]`, **return \"not bipartite\" immediately**; if the colours differ, move on.",
    "When the queue empties, go back to step 2 for the next start node. If the whole graph finishes with no conflict it is bipartite, and the nodes coloured 0 and 1 are the two groups.",
    "To get an odd cycle as evidence, also track `parent` and `depth`. From the two ends of the conflicting edge `(u, v)`, climb from the deeper end first until the two paths meet, then join the paths and add the edge.",
    "When edges arrive one at a time, use union-find over `2n` nodes instead: before adding `(u, v)`, a conflict is `find(u) == find(v)`; otherwise union `u` with `v + n` and `v` with `u + n`.",
  ],
  demoNote:
    'Both examples have six nodes, A through F, and seven edges, with BFS starting at A and neighbours processed in alphabetical order. "Example 1: bipartite" is two quadrilaterals, A–B–C–D and C–E–F–D, so every cycle is even; it ends with blue (colour 0) on A, C and F, and green (colour 1) on B, D and E. "Example 2: odd cycle" swaps D–F for D–E, adding the triangle C–D–E: while processing C the algorithm finds that neighbour E is also colour 0 and stops right there. The yellow lines mark the odd cycle C–B–A–D–E, made of the two colouring paths plus the conflicting edge, which is the thickest line. A yellow outline means the node is still in the queue and a thick outline means it is being processed; solid blue edges were walked during colouring, and the other edges under inspection are dashed. Note that the odd cycle you find is not necessarily the shortest one, but any of them is enough to prove the colouring is impossible.',
  codeNote:
    "The BFS two-colouring is the heart of it, and the outer loop handles disconnected graphs. The union-find version splits each node into \"this side\" and \"the opposite side\", which suits edges arriving one at a time with an answer needed after each one; LeetCode 886 can be written this way too. The Python file also shows how to recover an odd cycle at the point of conflict, turning \"not bipartite\" into visible evidence. The examples use the same two graphs as the interactive demo, with A through F numbered 0 through 5.",
  problems: [
    { src: "LeetCode 785", name: "Is Graph Bipartite? (the graph may be disconnected)", diff: "Medium" },
    { src: "LeetCode 886", name: "Possible Bipartition (build the graph from dislikes; union-find also works)", diff: "Medium" },
    { src: "LeetCode 1042", name: "Flower Planting With No Adjacent (contrast: four colours, degree at most 3, greedy is enough)", diff: "Medium" },
    { src: "LeetCode 1129", name: "Shortest Path with Alternating Colors (split every node into two states)", diff: "Medium" },
    { src: "LeetCode 2493", name: "Divide Nodes Into the Maximum Number of Groups (check bipartiteness first, then the most levels per component)", diff: "Hard" },
    { src: "LeetCode 2608", name: "Shortest Cycle in a Graph (a non-tree edge plus two BFS paths is a cycle)", diff: "Hard" },
  ],
};
