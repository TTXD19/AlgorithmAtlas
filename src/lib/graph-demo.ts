/** BFS / DFS 互動示範共用的小圖與步驟產生器。 */

export const DEMO_GRAPH = {
  nodes: {
    A: [70, 110],
    B: [190, 50],
    C: [190, 175],
    D: [320, 60],
    E: [320, 160],
    F: [450, 110],
    G: [450, 210],
    H: [560, 60],
  } as Record<string, [number, number]>,
  edges: [
    ["A", "B"], ["A", "C"], ["B", "D"], ["C", "E"], ["D", "E"],
    ["D", "F"], ["E", "G"], ["F", "H"], ["F", "G"],
  ] as [string, string][],
};

export interface DemoStep {
  desc: string;
  /** 正在處理的節點 */
  current: string | null;
  /** 待在資料結構（佇列／堆疊）裡的節點，依結構順序 */
  active: string[];
  /** 已完成的節點 */
  done: string[];
  /** 節點下方的小標籤，例如 d=2 或 #3 */
  label: Record<string, string>;
  /** 走訪順序 */
  order: string[];
  /** 走訪樹的邊 */
  tree: [string, string][];
}

export interface DemoConfig {
  activeLegend: string;
  activeTitle: string;
  steps: () => DemoStep[];
}

function adjacency() {
  const adj: Record<string, string[]> = {};
  Object.keys(DEMO_GRAPH.nodes).forEach((n) => (adj[n] = []));
  DEMO_GRAPH.edges.forEach(([a, b]) => {
    adj[a].push(b);
    adj[b].push(a);
  });
  Object.values(adj).forEach((l) => l.sort());
  return adj;
}

export function bfsSteps(): DemoStep[] {
  const adj = adjacency();
  const start = "A";
  const steps: DemoStep[] = [];
  const dist: Record<string, number> = { [start]: 0 };
  const queue = [start];
  const order: string[] = [];
  const tree: [string, string][] = [];
  const snap = (desc: string, current: string | null) =>
    steps.push({
      desc, current,
      active: [...queue],
      done: order.filter((x) => x !== current),
      label: Object.fromEntries(Object.entries(dist).map(([k, d]) => [k, `d=${d}`])),
      order: Object.keys(dist),
      tree: [...tree],
    });

  snap(`把起點 ${start} 放入佇列，dist[${start}] = 0。`, null);
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    const found: string[] = [];
    for (const v of adj[u]) {
      if (!(v in dist)) {
        dist[v] = dist[u] + 1;
        queue.push(v);
        found.push(v);
        tree.push([u, v]);
      }
    }
    snap(
      found.length
        ? `取出 ${u}，鄰居 ${found.join("、")} 尚未發現：設 dist = ${dist[u] + 1}，依序放入佇列尾端。`
        : `取出 ${u}，它的鄰居都已經被發現，不需要做任何事。`,
      u,
    );
  }
  snap("佇列為空，走訪結束。每個節點上的數字就是到 A 的最短距離。", null);
  return steps;
}

export function dfsSteps(): DemoStep[] {
  const adj = adjacency();
  const start = "A";
  const steps: DemoStep[] = [];
  const seen: Record<string, number> = {};
  const stack: string[] = [];
  const order: string[] = [];
  const finished: string[] = [];
  const tree: [string, string][] = [];
  const snap = (desc: string, current: string | null) =>
    steps.push({
      desc, current,
      active: [...stack],
      done: [...finished],
      label: Object.fromEntries(Object.entries(seen).map(([k, i]) => [k, `#${i}`])),
      order: [...order],
      tree: [...tree],
    });

  snap(`從起點 ${start} 呼叫 dfs(${start})。`, null);
  const go = (u: string, from: string | null) => {
    seen[u] = order.length + 1;
    order.push(u);
    stack.push(u);
    snap(
      from
        ? `${from} 的鄰居 ${u} 尚未發現，遞迴呼叫 dfs(${u})，把 ${u} 推入堆疊。`
        : `拜訪 ${u}，把它推入堆疊。`,
      u,
    );
    for (const v of adj[u]) {
      if (!(v in seen)) {
        tree.push([u, v]);
        go(v, u);
      }
    }
    stack.pop();
    finished.push(u);
    const back = stack[stack.length - 1] ?? null;
    snap(
      back
        ? `${u} 的鄰居都探索完了，dfs(${u}) 返回，回溯到 ${back}，繼續看 ${back} 剩下的鄰居。`
        : `${u} 的鄰居都探索完了，dfs(${u}) 返回。`,
      back,
    );
  };
  go(start, null);
  snap("堆疊清空，走訪結束。節點下方的編號是被拜訪的先後順序。", null);
  return steps;
}

export type DemoAlgo = "bfs" | "dfs";
export const DEMO_CONFIGS: Record<DemoAlgo, DemoConfig> = {
  bfs: { activeLegend: "在佇列中", activeTitle: "佇列（前 → 後）", steps: bfsSteps },
  dfs: { activeLegend: "在堆疊中", activeTitle: "呼叫堆疊（底 → 頂）", steps: dfsSteps },
};
