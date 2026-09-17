import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Traversal, DFS, memoization & tabulation",
  applications: [
    {
      title: "The guest list for the company party",
      problem:
        "A company of 300 people has an org chart shaped like a tree. HR has scored how keen each person is to come, but to keep everyone relaxed, a manager and their direct reports are never invited together. Maximise the total score of the people invited.",
      why: "Each person is simply in or out, and the only constraint runs between a manager and their direct reports. So keep two numbers per node: the best the whole subtree can score with this person invited (none of their reports are), and the best with them left out (each report independently takes whichever of its own two numbers is larger). One sweep from the bottom up handles each of the 300 people once, instead of trying 2³⁰⁰ guest lists.",
    },
    {
      title: "Worst-case delivery time on a tree-shaped network",
      problem:
        "A rural logistics network is a tree: a depot branches into a few roads, each of which branches again, with no loops anywhere. The company wants to know the largest number of road segments between any two stops, to estimate its worst-case delivery time.",
      why: "The path between the two farthest stops has a single highest point, and there it is made of two downward chains joined together. Compute the longest downward chain at every stop and try joining its longest and second-longest chains to update the answer: one postorder traversal finds the diameter of the entire network, with no need to run a separate BFS for every pair of stops.",
    },
    {
      title: "Which stop should host the service centre",
      problem:
        "The same tree-shaped network has 100,000 stops, and one of them has to host the maintenance centre so that the total distance to all the others is as small as possible. Computing that total separately for every stop is O(n²) — ten billion operations.",
      why: "Root the tree anywhere and compute, in one pass, the size of every subtree and the root's total distance. Then reroot in a second, top-down pass: moving the root from p to a child u brings the size[u] stops inside u's subtree 1 closer and pushes the other n − size[u] stops 1 further away, so ans[u] = ans[p] − size[u] + (n − size[u]). Two O(n) passes give you the answer for every stop.",
    },
  ],
  cue: "Trees, subtrees, building a parent's answer from its children's answers, postorder traversal, take-or-skip decisions (adjacent nodes cannot both be taken), the diameter of a tree, the longest path through a given node, the answer with every node as the root (rerooting).",
  steps: [
    "Pick a root. On a general tree, use DFS or BFS to record each node's parent and to lay out an order in which a parent always comes before its children.",
    "Decide what each node **hands back to its parent** (the longest downward chain, say, or the take/skip pair), and how that is computed from the children's values.",
    "Process in postorder: a node is computed only once all its children are done. When the answer involves joining two subtrees at this node, update the global answer there as well, but still return only the part that can be attached upwards.",
    "The answer sits at the root, or is the global maximum you recorded during the traversal.",
    "If you need the answer with every node as the root, add one top-down rerooting pass that derives each child's answer from its parent's answer and subtree sizes in O(1).",
  ],
  demoNote:
    "A binary tree of 10 nodes, with its diameter found by postorder traversal. Every node computes two quantities: down, the longest chain going downwards, shown under the node and returned to its parent; and through, the left chain plus the right chain, used only to update the global answer. Blue is the node being processed, yellow are its children, green is the best diameter path so far, and grey marks the nodes not reached yet. The answer is updated first at G and D, and finally at B, where it becomes 6: H → G → D → B → E → I → J. By the time the root A is processed, the longest path through it is only 5 — this diameter never touches the root at all, which is exactly why every node has to try to update the answer.",
  codeNote:
    "Python covers the binary-tree diameter, the maximum path sum with negative values allowed, and the maximum weight independent set on a general tree using an iterative ordering (the party guest list from above). C++ covers the diameter of a general tree (joining the longest and second-longest chains) and a two-pass rerooting DP: the sum of distances from each node to all the others.",
  problems: [
    { src: "LeetCode 543", name: "Diameter of Binary Tree", diff: "Easy" },
    { src: "LeetCode 337", name: "House Robber III (two states: take or skip)", diff: "Medium" },
    { src: "LeetCode 124", name: "Binary Tree Maximum Path Sum (leave out negative chains)", diff: "Hard" },
    { src: "LeetCode 968", name: "Binary Tree Cameras (three states per node)", diff: "Hard" },
    { src: "LeetCode 2246", name: "Longest Path With Different Adjacent Characters (general-tree diameter: longest plus second longest)", diff: "Hard" },
    { src: "LeetCode 834", name: "Sum of Distances in Tree (rerooting DP)", diff: "Hard" },
  ],
};
