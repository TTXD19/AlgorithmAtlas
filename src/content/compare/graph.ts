import type { Comparison } from "@/lib/compare";

export const graph: Comparison = {
  title: { "zh-Hant": "最短路徑演算法比較", en: "Shortest-path algorithms compared" },
  description: {
    "zh-Hant": "BFS、Dijkstra、Bellman-Ford、Floyd-Warshall、DAG 最短路徑：邊權、負邊、單源或全點對，一張表看完該用哪一個。",
    en: "BFS, Dijkstra, Bellman-Ford, Floyd-Warshall and DAG shortest paths: edge weights, negative edges, single-source or all-pairs — one table to pick the right one.",
  },
  columns: [
    { key: "weights", label: { "zh-Hant": "邊權", en: "Weights" } },
    { key: "negative", label: { "zh-Hant": "負邊", en: "Negative edges" } },
    { key: "scope", label: { "zh-Hant": "範圍", en: "Scope" } },
  ],
  rows: [
    {
      sub: "bfs",
      cells: {
        weights: { "zh-Hant": "全部相同（無權）", en: "All equal (unweighted)" },
        negative: "—",
        scope: { "zh-Hant": "單源", en: "Single source" },
      },
      pick: { "zh-Hant": "每步成本一樣：格子圖、社交距離、狀態轉移次數。最短路徑問題裡最快的一個，能用就用。", en: "Every step costs the same: grids, social distance, number of state transitions. The fastest of the family; use it whenever you can." },
    },
    {
      sub: "dijkstra",
      cells: {
        weights: { "zh-Hant": "非負", en: "Non-negative" },
        negative: "✗",
        scope: { "zh-Hant": "單源", en: "Single source" },
      },
      pick: { "zh-Hant": "有權圖的預設：地圖、網路延遲、加權狀態圖。一條負邊就會錯，而且不會報錯。", en: "The default for weighted graphs: maps, network latency, weighted state graphs. A single negative edge silently breaks it." },
    },
    {
      sub: "bellman-ford",
      cells: {
        weights: { "zh-Hant": "任意", en: "Any" },
        negative: { "zh-Hant": "✓，且能偵測負環", en: "✓, and detects negative cycles" },
        scope: { "zh-Hant": "單源", en: "Single source" },
      },
      pick: { "zh-Hant": "有負邊、要偵測負環（套利、匯率）、或「最多走 k 步」這種限制。V·E 很慢，V 上萬就要考慮換。", en: "Negative edges, negative-cycle detection (arbitrage, exchange rates), or an 'at most k edges' constraint. V·E is slow; reconsider past tens of thousands of vertices." },
    },
    {
      sub: "floyd",
      cells: {
        weights: { "zh-Hant": "任意", en: "Any" },
        negative: { "zh-Hant": "✓（負環看對角線）", en: "✓ (negative cycle shows on the diagonal)" },
        scope: { "zh-Hant": "全點對", en: "All pairs" },
      },
      pick: { "zh-Hant": "要所有點對的距離、V ≤ 400 左右、或圖很稠密。三層迴圈五行寫完，不會寫錯。", en: "Every pair's distance, V up to a few hundred, or a dense graph. Three loops in five lines; hard to get wrong." },
    },
    {
      sub: "dag-shortest",
      cells: {
        weights: { "zh-Hant": "任意", en: "Any" },
        negative: { "zh-Hant": "✓（無環所以沒有負環）", en: "✓ (acyclic, so no negative cycles)" },
        scope: { "zh-Hant": "單源", en: "Single source" },
      },
      pick: { "zh-Hant": "圖保證無環：任務排程、關鍵路徑、DP 狀態圖。拓撲序鬆弛一遍 O(V+E)，還能求最長路徑。", en: "The graph is guaranteed acyclic: scheduling, critical paths, DP state graphs. One relaxation pass in topological order, O(V+E), and it finds longest paths too." },
    },
  ],
  guide: [
    { "zh-Hant": "**無權** → BFS。**非負權** → Dijkstra。**有負邊** → Bellman-Ford。**無環** → DAG 拓撲鬆弛。**全點對且 V 小** → Floyd-Warshall。", en: "**Unweighted** → BFS. **Non-negative** → Dijkstra. **Negative edges** → Bellman-Ford. **Acyclic** → DAG relaxation. **All pairs, small V** → Floyd-Warshall." },
    { "zh-Hant": "**邊權只有 0 和 1** → 0-1 BFS（deque，權 0 放前面、權 1 放後面），O(V+E) 而不用 Dijkstra 的 log。", en: "**Weights are only 0 and 1** → 0-1 BFS (a deque: weight 0 to the front, weight 1 to the back), O(V+E) without Dijkstra's log." },
    { "zh-Hant": "**全點對但 V 大、邊稀疏** → 對每個點跑一次 Dijkstra，V·(V+E) log V 通常比 V³ 快得多。", en: "**All pairs but large V and sparse edges** → run Dijkstra from every vertex; V·(V+E) log V is usually far better than V³." },
    { "zh-Hant": "**最長路徑** → 一般圖是 NP-hard；DAG 上把邊權取負跑最短路徑，或直接在拓撲序上取 max。", en: "**Longest path** → NP-hard on general graphs; on a DAG negate the weights and run shortest path, or take max along topological order." },
    { "zh-Hant": "**只要知道能不能到、不在乎距離** → DFS 或 Union-Find 就夠，不必上最短路徑。", en: "**Only reachability, distance irrelevant** → DFS or Union-Find is enough; skip shortest paths entirely." },
  ],
};
