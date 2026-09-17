import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Stacks, recursion, adjacency lists",
  applications: [
    {
      title: "Working out how large a folder is",
      problem:
        "Finder, or the du command, has to work out how much space a folder takes up: step into a subfolder, total it up, come back to the parent and add it in, and keep going down until there are no subfolders left.",
      why: "Go in, finish the work, come back out — that is exactly the recursive structure of DFS. Anything tree-shaped (a file system, the DOM, a JSON document) is almost always walked with DFS.",
    },
    {
      title: "The paint bucket in an image editor",
      problem:
        "One click and the entire connected patch of the same colour is filled in. Flood fill in image processing, clearing connected same-coloured tiles in a game, counting islands on a map — all of them are about finding a connected region.",
      why: "DFS starts at one cell and covers everything it can reach; what it covers is one connected component. The code is shorter than BFS, just a few lines with recursion.",
    },
    {
      title: "Detecting circular dependencies",
      problem:
        "Module A imports B, B imports C, and C imports A again; a bundler has to catch that cycle before it causes trouble. Spreadsheet formulas that reference each other and package version constraints behave the same way.",
      why: "DFS can tell a node that is still being explored apart from one that is finished. Reaching a node that is still being explored means there is a cycle. BFS cannot make that distinction.",
    },
  ],
  cue: "Connected regions, flood fill, whether a cycle exists, all paths or all combinations, walking a tree structure, needing to backtrack.",
  steps: [
    "Call `dfs(u)` on the start node, mark `u` as discovered, and record it in the visit order.",
    "Look at each neighbour `v` of `u` in turn: if `v` has not been discovered, recurse into `dfs(v)` **immediately**, finishing the path through `v` before coming back for the next neighbour.",
    "Once every neighbour of `u` has been seen, `dfs(u)` returns — it **backtracks** to the node that called it.",
    "When the start node's `dfs` returns, every node reachable from the start has been visited. To cover the whole graph, call it again on each node that is still undiscovered; each of those calls is one connected component.",
  ],
  demoNote:
    "The same graph, again starting at A, with neighbours taken in alphabetical order. Watch the stack grow tall and shrink back, and look at the visit numbers under the nodes: nothing like the level order BFS produced.",
  codeNote:
    "The recursive version sits closest to the idea. On a deep graph it can exceed the recursion limit, and that is when you switch to an explicit stack, the iterative version.",
  problems: [
    { src: "LeetCode 695", name: "Max Area of Island", diff: "Medium" },
    { src: "LeetCode 133", name: "Clone Graph", diff: "Medium" },
    { src: "LeetCode 797", name: "All Paths From Source to Target", diff: "Medium" },
    { src: "LeetCode 207", name: "Course Schedule", diff: "Medium" },
    { src: "LeetCode 547", name: "Number of Provinces", diff: "Medium" },
  ],
};
