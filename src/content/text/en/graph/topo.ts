import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Adjacency lists / matrices, BFS, DFS",
  applications: [
    {
      title: "Building a monorepo in parallel",
      problem:
        "A monorepo holds 40 packages: web depends on ui and api-client, and ui depends on utils. After a change everything has to be rebuilt, and no package can start until the ones it depends on are done — but the CI machine has 8 cores, so anything that can be built at the same time should be.",
      why: "Draw \"A depends on B\" as an edge B → A and a valid build order is exactly a topological order. At every moment, Kahn's queue holds precisely the packages whose dependencies are already built and that can start right now. Hand those out to different cores and you have the scheduling idea at the heart of tools like Turborepo and Bazel.",
    },
    {
      title: "Planning a degree around prerequisites",
      problem:
        "A computer science degree has 45 required courses: Algorithms needs Data Structures and Discrete Mathematics first, Operating Systems needs Computer Organization. After the department rewrites the prerequisites, someone has to check the fewest semesters a student could finish in with no credit limit, and confirm that no two courses block each other.",
      why: "Courses are nodes and prerequisites are edges. Kahn peels the graph one layer at a time: the first layer is the courses with no prerequisites, and everything whose in-degree drops to 0 once those are removed is the second layer, so the number of layers is the minimum number of semesters. If any courses are still left when the peeling stops, the prerequisites contain a cycle and those courses can never be taken.",
    },
    {
      title: "The nightly data pipeline",
      problem:
        "A data team manages 300 tables in dbt, and each table's SQL pulls in others with ref() — monthly revenue waits on order line items and the exchange rate table. Everything is recomputed overnight, and a single table that runs before something upstream of it makes the reported numbers wrong.",
      why: "The references between tables form a directed acyclic graph (DAG), and both dbt and Airflow compute a topological order before running anything. When someone accidentally makes two tables reference each other, the sort cannot finish, so the tool can fail before the run starts instead of halfway through it.",
    },
  ],
  cue: "Dependencies, ordering, prerequisites, A must finish before B, build or install order, DAGs, whether a schedule can complete, whether there is a circular dependency.",
  steps: [
    "Turn each dependency into an edge: \"`u` must come before `v`\" means adding `u → v` and `indeg[v] += 1`. Work out which direction the problem's pairs point in before you write anything.",
    "Put every node with in-degree 0 into the queue — those have no prerequisites at all.",
    "Take `u` off the queue and append it to the answer; for each outgoing edge `u → v`, do `indeg[v] -= 1`, and push `v` when it reaches 0.",
    "Stop when the queue is empty. If the answer has V nodes it is a topological order; fewer than V means a cycle, and every node whose in-degree is still above 0 is either on the cycle or downstream of it.",
    "The DFS version: three-colour marking, with the outer loop calling `dfs` on every white node. A grey neighbour means a cycle. A node is appended to `post` only once all of its neighbours are done, and the answer is `post` reversed.",
    "Variations: to process in parallel batches, drain a whole layer at once before computing the next, and the number of layers is the minimum number of rounds; for the lexicographically smallest order, swap the queue for a min-heap.",
  ],
  demoNote:
    "Six front-end packages and eight dependencies, where an arrow `u → v` means `u` has to be installed before `v`. In \"Kahn · in-degree\" mode, watch the `in=` under each node: every removed edge (it turns dashed) drops it by one, a package that hits 0 turns yellow and enters the queue, blue is the one being processed, and filled nodes are already emitted. In \"DFS · finish order\" mode, yellow marks the packages still on the call stack, the number under each node is the position in which it finished, and the right-hand column lists both the finish order and its reverse. Compare the two results: Kahn gives react → ts → r-dom → lint → next → app and DFS gives ts → lint → react → r-dom → next → app. The orders differ, but both respect every dependency.",
  codeNote:
    "Both languages implement Kahn and DFS. The example graph is the one from the interactive demo, and the printed output matches what each mode produces. Kahn needs no recursion and detects cycles for free, which makes it the usual default in practice; the DFS version shares its three-colour marking with cycle detection, so it fits naturally where you are already running a DFS. Python adds a layered version whose layers can each run in parallel, and C++ adds a variant that swaps the queue for a min-heap to get the lexicographically smallest order.",
  problems: [
    { src: "LeetCode 1557", name: "Minimum Number of Vertices to Reach All Nodes (the nodes with in-degree 0)", diff: "Medium" },
    { src: "LeetCode 210", name: "Course Schedule II (mind the direction of the edges)", diff: "Medium" },
    { src: "LeetCode 2115", name: "Find All Possible Recipes from Given Supplies (Kahn over string nodes)", diff: "Medium" },
    { src: "LeetCode 802", name: "Find Eventual Safe States (Kahn on the reversed graph, or three-colour DFS)", diff: "Medium" },
    { src: "LeetCode 2050", name: "Parallel Courses III (earliest finish time along a topological order)", diff: "Hard" },
    { src: "LeetCode 1203", name: "Sort Items by Groups Respecting Dependencies (two levels of topological sort)", diff: "Hard" },
  ],
};
