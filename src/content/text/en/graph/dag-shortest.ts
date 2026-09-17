import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Topological Sort, Bellman-Ford",
  applications: [
    {
      title: "The critical path of a project schedule",
      problem:
        "Putting up an office tower involves thousands of tasks, each with an estimated duration and each with rules about what has to finish before it can start. The client wants to know the earliest possible completion date, which tasks must never slip, and which ones can run a few days late without hurting anything.",
      why: "Dependencies between tasks cannot form a cycle, so the plan is a DAG. Walking the tasks in topological order gives each one's earliest start time, which is the longest path from the beginning; a second pass in reverse order gives the latest start time, and the gap between the two is the task's float. The tasks with zero float link up into the critical path. This is CPM, used in large construction projects since the 1950s, and the whole calculation is O(V + E).",
    },
    {
      title: "Breaking a paragraph into lines in TeX",
      problem:
        "When you typeset a paragraph, where should each line break? Filling one line at a time as greedily as possible often leaves a later line stretched thin and the whole paragraph looking ragged, but the number of ways to break a paragraph is exponential.",
      why: "Make every legal breaking position a node, make \"break from position i to position j and call that one line\" an edge, and weight each edge by how badly that line has to be stretched or squeezed. Positions only move forward, so the graph is guaranteed acyclic, and the best-looking paragraph is simply the shortest path from the start to the end. TeX's line-breaking algorithm is dynamic programming on exactly this graph, keeping only the feasible breakpoints, which is why even long paragraphs are typeset instantly.",
    },
    {
      title: "A phonetic input method picking the most natural sentence",
      problem:
        "Someone types a string of phonetic syllables. Every stretch of them matches a great many homophones and multi-syllable words, so the combinations run into thousands of candidate sentences. The input method has to pick the one that reads most like ordinary Chinese, in real time, and redo the whole thing every time one more syllable is typed.",
      why: "Positions in the sentence are the nodes, each candidate word is an edge from where it starts to where it ends, and the weight is the log of how likely that word is. Every edge points forward, so this \"word lattice\" is a DAG, the most likely sentence is the longest path, and one O(V + E) sweep in position order finds it. It is the same idea as Viterbi decoding in speech recognition.",
    },
  ],
  cue: "The graph is guaranteed acyclic (dependencies, time only moving forward, positions only moving forward), negative weights but no cycles, a longest path or a critical path, transitions between DP states, counting paths.",
  steps: [
    "Confirm the graph is acyclic and compute a topological order (Kahn, or the reverse of the DFS finishing order); if Kahn emits fewer than V nodes, there is a cycle.",
    "Set every `dist` to ∞ (to −∞ when you want the longest path) and the source to 0. If you need the path itself, keep a `parent` array as well.",
    "Take the nodes in topological order. If `dist[u]` is still ∞, u cannot be reached from the source, so skip it.",
    "For each outgoing edge `u → v` with weight w: if `dist[u] + w < dist[v]` (use > for the longest path), update `dist[v]` and set `parent[v] = u`.",
    "Once every node is done, `dist` is the answer, and following `parent` backwards gives the path. For a critical path, make a second pass in reverse topological order to get the latest start times; the tasks with zero float are the ones on the critical path.",
  ],
  demoNote:
    'The tabs at the top switch between two examples, and the row underneath is the topological order together with the current distances: blue is the node being processed, green is one that is finished. In "Shortest path (negative weights)" the source is S, and R comes before S in the order and simply cannot be reached, so it is skipped when its turn comes. After that each outgoing edge turns amber as it is relaxed, and the blue edges are the shortest-path tree so far: Y is first set to 6 via T, then drops to 5 through the negative edge X → Y, while Z starts at 4 and finally becomes 3 through the −2 on Y → Z. In "Longest path: project schedule" the number on an edge is the duration of the task it leaves from, and the update takes the maximum instead: Test has to wait for both API (day 9) and UI (day 7), so it takes 9, and Ship can begin on day 12 at the earliest. The last step marks the critical path Start → Spec → API → Test → Ship and works out the float on UI and Docs.',
  codeNote:
    'Python has Kahn\'s topological sort followed by relaxation for the shortest path, path reconstruction, and the critical path with its two passes for the total duration and the float. C++ has a version built on the DFS finishing order, plus a word-segmentation example: position numbers are already a topological order, so scoring each dictionary word as an edge weight and taking the longest path splits 研究生命起源 into 研究 生命 起源.',
  problems: [
    { src: "LeetCode 3243", name: "Shortest Distance After Road Addition Queries I (indices only move forward, so rerun the DAG shortest path per query)", diff: "Medium" },
    { src: "LeetCode 2192", name: "All Ancestors of a Node in a Directed Acyclic Graph (pass ancestor sets along the topological order)", diff: "Medium" },
    { src: "LeetCode 1786", name: "Number of Restricted Paths From First to Last Node (Dijkstra first, then count paths in distance order)", diff: "Medium" },
    { src: "LeetCode 329", name: "Longest Increasing Path in a Matrix (longest path on an implicit DAG)", diff: "Hard" },
    { src: "LeetCode 1857", name: "Largest Color Value in a Directed Graph (DP over the topological order, which also detects cycles)", diff: "Hard" },
  ],
};
