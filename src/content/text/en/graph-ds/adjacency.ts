import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Arrays, hash tables",
  applications: [
    {
      title: "Friendships in a social network",
      problem:
        "A billion users, each with a few hundred friends on average. You need to store who is friends with whom and list any one person's friends quickly.",
      why: "An adjacency matrix would need 10¹⁸ cells — every hard drive on earth put together would not be enough. An adjacency list stores only the edges that exist, one friend list per person, for O(V + E) space. Real-world graphs are almost always sparse, which is why the adjacency list is the default choice.",
    },
    {
      title: "Routing and maps",
      problem:
        "Junctions are nodes, roads are edges, and every road has a length or a travel time. A navigation algorithm constantly asks which junctions it can reach from here, and how long each one takes.",
      why: "An adjacency list maps every node to a list of (neighbour, weight) pairs, which answers exactly that question. BFS, DFS and Dijkstra all take \"walk this node's neighbours\" as their basic move, so getting the data structure right is what makes the algorithms pleasant to write.",
    },
    {
      title: "When a matrix is the right call",
      problem:
        "A board where every cell connects to its neighbours, or a small complete graph: few nodes, many edges, and a constant stream of \"are A and B directly connected?\" questions.",
      why: "Looking up a single cell of an adjacency matrix is O(1), and on a dense graph the matrix wastes nothing. Algorithms like Floyd-Warshall are written around a matrix anyway. Consider it when V is under a few thousand, or when E approaches V².",
    },
  ],
  cue: "Who connects to whom, what the neighbours are, directed or undirected, weighted or not, sparse or dense, how big V and E are.",
  steps: [
    "Read the problem carefully: **directed or undirected**, **weighted or not**, whether the nodes are integers or something else, and how big V and E are.",
    "Build an **adjacency list** by default: `adj = [[] for _ in range(n)]` or `defaultdict(list)`.",
    "For each edge (u, v), do `adj[u].append(v)`, plus `adj[v].append(u)` if the graph is undirected. When there are weights, store `(v, w)`.",
    "Only switch to a matrix, `[[0] * n for _ in range(n)]`, when E approaches V² or you need an O(1) adjacency test.",
    "Grid problems do not need an explicit graph: treat (row, col) as the node, the four directions as the edges, and walk the array directly.",
  ],
  demoNote:
    "The same graph in both representations. Toggle directed or undirected and weighted or unweighted, then click any node to see which row of the list and which row of the matrix light up as its neighbours. Note how many cells each representation uses.",
  codeNote:
    "Building an adjacency list and an adjacency matrix from an edge list, each handling the directed, undirected and weighted cases. At the end is the form you will see most often, with integer nodes — it is what the rest of the graph lessons use.",
  problems: [
    { src: "LeetCode 1557", name: "Minimum Number of Vertices to Reach All Nodes (count in-degrees)", diff: "Medium" },
    { src: "LeetCode 997", name: "Find the Town Judge (in-degree and out-degree)", diff: "Easy" },
    { src: "LeetCode 133", name: "Clone Graph", diff: "Medium" },
    { src: "LeetCode 1971", name: "Find if Path Exists in Graph (build the graph, then traverse)", diff: "Easy" },
    { src: "LeetCode 1436", name: "Destination City", diff: "Easy" },
  ],
};
