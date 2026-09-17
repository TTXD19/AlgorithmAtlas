import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "DFS, union-find",
  applications: [
    {
      title: "Deadlock detection in a database",
      problem:
        "Transaction T1 holds a lock on the orders table and is waiting for inventory; T2 holds inventory and is waiting for payments; T3 holds payments and is waiting for orders. All three are waiting for someone else to let go, and none of them ever will. At peak hours hundreds of transactions are queued on locks at once.",
      why: "Draw \"T1 is waiting on a lock T2 holds\" as a directed edge T1 → T2 and you get a wait-for graph, where a deadlock is exactly a directed cycle. PostgreSQL runs this check once a transaction has waited longer than deadlock_timeout (1 second by default) and aborts one of the transactions in the cycle. Three-colour DFS does not just answer whether a cycle exists — the call stack tells you which transactions are stuck together.",
    },
    {
      title: "A scheduler rejecting a workflow that loops",
      problem:
        "A data team has 300 tasks in Airflow, each declaring which tasks must finish first. Someone makes \"export report\" wait on \"clear temp files\", but \"clear temp files\" already waits, indirectly, on \"export report\". Ship that configuration and the whole chain sits waiting forever.",
      why: "Task dependencies form a directed graph, and a valid configuration has to be a DAG (directed acyclic graph). One three-colour DFS at load time settles it in O(V+E); better still, the moment you hit a grey node, the matching stretch of the stack is the complete cycle, ready to print in the error message. That is far easier to debug than \"circular dependency detected\".",
    },
    {
      title: "A loop patched into the office switches",
      problem:
        "An office has 40 network switches, and someone in IT is running cables from a list, one at a time. The moment a cable gives two already-connected switches a second path between them, broadcast packets circle that loop forever and saturate the network within seconds — a broadcast storm.",
      why: "Cables are undirected edges, and the question is whether adding this one creates a cycle. Union-find adds them one at a time: if both ends are already in the same set, a path between them already exists, so this cable is the redundant loop. Each cable costs practically O(1), with no need to re-traverse the whole graph after every connection. Spanning Tree Protocol (STP) on the switches blocks the surplus ports automatically, and this is the cycle it is there to eliminate.",
    },
  ],
  cue: "Circular dependencies, deadlock, mutual waiting, checking whether something is a DAG, whether adding this edge creates a cycle, whether a graph is a tree, looping back to yourself.",
  steps: [
    "First decide whether the graph is **directed** or **undirected**. The DFS version turns the input into an adjacency list; the union-find version only needs the edge list.",
    "Directed: set every entry of `color` to white and call `dfs(s)` on **every** node `s` that is still white. Do not start from node 0 alone.",
    "`dfs(u)`: colour `u` grey and push it onto the path. For each edge `u → v`: grey means you found a cycle; white means recurse, and if the child call found a cycle, pass it straight back up; black means skip. Once every outgoing edge is checked, colour `u` black and pop it off the path.",
    "To report the cycle itself: when you hit a grey `v`, take the stretch of the path from `v` to the end and append `v` again — those are the nodes on the cycle.",
    "Undirected: set `parent[i] = i` and process each `(u, v)` in turn. `find(u) == find(v)` means a cycle; otherwise union them. If you use DFS instead, record the index of the edge you used to reach each node, skip that one edge, and treat every other visited neighbour as a cycle.",
    "With tens of thousands of nodes, avoid deep recursion: simulate the stack explicitly, or use Kahn's in-degree method and check whether a topological sort can place every node.",
  ],
  demoNote:
    'Both modes use the same six nodes A–F and seven edges each. "Directed · three-colour DFS" starts at A and checks outgoing edges in insertion order: a yellow outline means grey (on the call stack, mirrored in the list on the right) and a solid blue node is the one being processed. Watch E → B hit a grey B and the whole ring B → D → E → B turn yellow; a little later F → E hits a finished, black E (dashed) and that is not a cycle. "Undirected · union-find" adds edges one at a time: blue lines join the forest, and a blue cell in the parent array marks a root. When D – E and B – D come in, both ends are already in one set, so only those two cycle-closing edges are marked yellow.',
  codeNote:
    "Python has three functions: three-colour DFS that finds a directed cycle and returns the nodes on it, union-find that answers whether an undirected graph has a cycle, and an undirected DFS version that excludes the edge it came in on by index, which handles parallel edges correctly. The examples use the same graph as the interactive demo, with A–F numbered 0–5. The C++ version implements the first two.",
  problems: [
    { src: "LeetCode 207", name: "Course Schedule (switch to three-colour DFS and print the cycle)", diff: "Medium" },
    { src: "LeetCode 802", name: "Find Eventual Safe States (the nodes that turn black are the safe ones)", diff: "Medium" },
    { src: "LeetCode 1559", name: "Detect Cycles in 2D Grid (undirected DFS that skips the edge it came in on)", diff: "Medium" },
    { src: "LeetCode 457", name: "Circular Array Loop (every node has exactly one outgoing edge)", diff: "Medium" },
    { src: "LeetCode 685", name: "Redundant Connection II (directed version: in-degree 2 or a cycle)", diff: "Hard" },
    { src: "LeetCode 2360", name: "Longest Cycle in a Graph (measure the cycle's length)", diff: "Hard" },
  ],
};
