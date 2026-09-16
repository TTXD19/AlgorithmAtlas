/**
 * BFS / DFS 互動示範共用的小圖與步驟產生器。
 *
 * 邏輯只有這一份；敘述文字由呼叫端依語言傳進來（見 lib/demo-text）。
 */
import type { GraphDemoText } from "./demo-text";

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

export type DemoAlgo = "bfs" | "dfs";

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

export function bfsSteps(t: GraphDemoText): DemoStep[] {
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

  snap(t.bfs.start(start), null);
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
        ? t.bfs.popFound(u, found.join(t.listSeparator), dist[u] + 1)
        : t.bfs.popNone(u),
      u,
    );
  }
  snap(t.bfs.done(start), null);
  return steps;
}

export function dfsSteps(t: GraphDemoText): DemoStep[] {
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

  snap(t.dfs.start(start), null);
  const go = (u: string, from: string | null) => {
    seen[u] = order.length + 1;
    order.push(u);
    stack.push(u);
    snap(from ? t.dfs.descend(from, u) : t.dfs.visit(u), u);
    for (const v of adj[u]) {
      if (!(v in seen)) {
        tree.push([u, v]);
        go(v, u);
      }
    }
    stack.pop();
    finished.push(u);
    const back = stack[stack.length - 1] ?? null;
    snap(back ? t.dfs.returnTo(u, back) : t.dfs.returnDone(u), back);
  };
  go(start, null);
  snap(t.dfs.done, null);
  return steps;
}

/** 依語言組出示範設定。文字來自 demo-text，邏輯共用這一份。 */
export function demoConfigs(t: GraphDemoText): Record<DemoAlgo, DemoConfig> {
  return {
    bfs: { activeLegend: t.bfs.activeLegend, activeTitle: t.bfs.activeTitle, steps: () => bfsSteps(t) },
    dfs: { activeLegend: t.dfs.activeLegend, activeTitle: t.dfs.activeTitle, steps: () => dfsSteps(t) },
  };
}
