import type { DemoText } from "./types";

export const demoEn: DemoText = {
  graph: {
    listSeparator: ", ",
    bfs: {
      activeLegend: "In the queue",
      activeTitle: "Queue (front → back)",
      start: (n) => `Put the start node ${n} in the queue, with dist[${n}] = 0.`,
      popFound: (u, found, d) => `Take ${u} off the front. Its neighbours ${found} are undiscovered: set dist = ${d} and push them onto the back of the queue.`,
      popNone: (u) => `Take ${u} off the front. Every neighbour is already discovered, so there is nothing to do.`,
      done: (s) => `The queue is empty and the traversal is over. The number on each node is its shortest distance from ${s}.`,
    },
    dfs: {
      activeLegend: "On the stack",
      activeTitle: "Call stack (bottom → top)",
      start: (n) => `Call dfs(${n}) on the start node.`,
      descend: (from, u) => `${from} has an undiscovered neighbour ${u}, so recurse into dfs(${u}) and push ${u} onto the stack.`,
      visit: (u) => `Visit ${u} and push it onto the stack.`,
      returnTo: (u, back) => `Every neighbour of ${u} has been explored, so dfs(${u}) returns and we back up to ${back} to carry on with its remaining neighbours.`,
      returnDone: (u) => `Every neighbour of ${u} has been explored, so dfs(${u}) returns.`,
      done: "The stack is empty and the traversal is over. The number under each node is the order it was visited in.",
    },
  },
};
