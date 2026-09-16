import type { DemoText } from "./types";

export const demoZhHant: DemoText = {
  graph: {
    listSeparator: "、",
    bfs: {
      activeLegend: "在佇列中",
      activeTitle: "佇列（前 → 後）",
      start: (n) => `把起點 ${n} 放入佇列，dist[${n}] = 0。`,
      popFound: (u, found, d) => `取出 ${u}，鄰居 ${found} 尚未發現：設 dist = ${d}，依序放入佇列尾端。`,
      popNone: (u) => `取出 ${u}，它的鄰居都已經被發現，不需要做任何事。`,
      done: (s) => `佇列為空，走訪結束。每個節點上的數字就是到 ${s} 的最短距離。`,
    },
    dfs: {
      activeLegend: "在堆疊中",
      activeTitle: "呼叫堆疊（底 → 頂）",
      start: (n) => `從起點 ${n} 呼叫 dfs(${n})。`,
      descend: (from, u) => `${from} 的鄰居 ${u} 尚未發現，遞迴呼叫 dfs(${u})，把 ${u} 推入堆疊。`,
      visit: (u) => `拜訪 ${u}，把它推入堆疊。`,
      returnTo: (u, back) => `${u} 的鄰居都探索完了，dfs(${u}) 返回，回溯到 ${back}，繼續看 ${back} 剩下的鄰居。`,
      returnDone: (u) => `${u} 的鄰居都探索完了，dfs(${u}) 返回。`,
      done: "堆疊清空，走訪結束。節點下方的編號是被拜訪的先後順序。",
    },
  },
};
