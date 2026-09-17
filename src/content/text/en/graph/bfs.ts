import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Queues, adjacency lists",
  applications: [
    {
      title: '"People you may know"',
      problem:
        "Facebook and LinkedIn suggest friends-of-friends. One hop out is your friends, two hops is their friends, and past three hops the suggestions stop being useful.",
      why: "BFS is the only traversal that naturally works outward one ring at a time. It finishes every node at distance 1 before touching distance 2, so you get exact control over degrees of separation.",
    },
    {
      title: "Fewest moves through a maze or map",
      problem:
        "A robot vacuum has to get from its dock to the kitchen, and every step on the grid costs the same. NPC pathfinding and \"fewest transfers\" transit routing are the same problem.",
      why: "When every edge costs the same, the first time BFS reaches a node it has taken the fewest possible steps. You do not need anything as involved as Dijkstra.",
    },
    {
      title: "Web crawlers and things that spread",
      problem:
        "A search engine starts at a homepage, follows every link on it, then follows the links on those pages. Epidemic models and network broadcasts spread the same way.",
      why: "Going near-before-far means the crawler covers the pages closest to the entry point first — usually the important ones — and you can stop cleanly at a maximum depth.",
    },
  ],
  cue: "Fewest steps, shortest path with no weights, levels or degrees of separation, nearest to a given point, spreading outward in rings.",
  steps: [
    "Put the start node in the queue and mark it discovered, so it is never queued twice.",
    "Take a node `u` off the **front** of the queue.",
    "For each neighbour `v` of `u`: if `v` is not discovered yet, mark it, record `dist[v] = dist[u] + 1`, and push it onto the **back** of the queue.",
    "Repeat steps 2–3 until the queue is empty. Every node reachable from the start has now been visited.",
  ],
  demoNote:
    'Starting from node A. Press "Next" to watch the queue advance one ring at a time; the number under each node is its distance from A.',
  codeNote: "Both versions let a single `dist` table do double duty: whether a node was discovered, and how far away it is.",
  problems: [
    { src: "LeetCode 1091", name: "Shortest Path in Binary Matrix", diff: "Medium" },
    { src: "LeetCode 994", name: "Rotting Oranges", diff: "Medium" },
    { src: "LeetCode 127", name: "Word Ladder", diff: "Medium" },
    { src: "LeetCode 200", name: "Number of Islands", diff: "Medium" },
  ],
};
