"use client";

import { useMemo, useState, type ReactNode } from "react";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";

/** 套件相依：u → v 表示「裝 v 之前要先裝 u」 */
const NODES = ["react", "ts", "r-dom", "lint", "next", "app"];
const POS: Record<string, [number, number]> = { react: [70, 70], ts: [70, 190], "r-dom": [230, 70], lint: [230, 190], next: [400, 130], app: [560, 130] };
type Edge = [string, string];
const EDGES: Edge[] = [["react", "r-dom"], ["react", "next"], ["r-dom", "next"], ["r-dom", "app"], ["ts", "lint"], ["ts", "next"], ["next", "app"], ["lint", "app"]];

type Mode = "kahn" | "dfs";
const LABEL: Record<Mode, string> = { kahn: "Kahn · 入度", dfs: "DFS · 完成順序" };

interface Step {
  desc: string;
  op: string;
  /** Kahn 的入度表（DFS 模式不用） */
  indeg: Record<string, number>;
  /** Kahn：佇列（前 → 後）；DFS：呼叫堆疊（底 → 頂） */
  pending: string[];
  /** Kahn：輸出順序；DFS：完成順序 */
  output: string[];
  cur: string | null;
  /** 正在處理的邊 */
  probe: Edge | null;
  /** 已處理的邊（Kahn 已移除、DFS 已檢查） */
  done: Edge[];
  /** 狀態剛變動的節點 */
  hot: string | null;
}

function adjacency(): Record<string, string[]> {
  const adj: Record<string, string[]> = Object.fromEntries(NODES.map((n) => [n, []]));
  EDGES.forEach(([u, v]) => adj[u].push(v));
  return adj;
}

function buildKahn(): Step[] {
  const steps: Step[] = [];
  const adj = adjacency();
  const indeg: Record<string, number> = Object.fromEntries(NODES.map((n) => [n, 0]));
  EDGES.forEach(([, v]) => indeg[v]++);
  const queue: string[] = [];
  const order: string[] = [];
  const removed: Edge[] = [];
  const snap = (desc: string, op: string, cur: string | null = null, probe: Edge | null = null, hot: string | null = null) =>
    steps.push({ desc, op, indeg: { ...indeg }, pending: [...queue], output: [...order], cur, probe, done: [...removed], hot });

  snap("先數每個套件的入度：有幾條邊指向它，也就是它依賴幾個還沒裝的套件。", "計算入度");
  NODES.forEach((n) => { if (indeg[n] === 0) queue.push(n); });
  snap(`入度為 0 的套件不依賴任何東西，可以先裝：${queue.join("、")}。全部放入佇列。`, "初始化佇列");
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    snap(
      adj[u].length
        ? `取出 ${u}，安裝它，加到輸出順序。接著把它的 ${adj[u].length} 條出邊一條一條移除。`
        : `取出 ${u}，安裝它，加到輸出順序。${u} 沒有出邊，沒有套件在等它。`,
      `取出 ${u}`, u,
    );
    for (const v of adj[u]) {
      indeg[v]--;
      removed.push([u, v]);
      if (indeg[v] === 0) {
        queue.push(v);
        snap(`移除邊 ${u} → ${v}，${v} 的入度減為 0：它依賴的套件都裝好了，放入佇列。`, `取出 ${u}`, u, [u, v], v);
      } else {
        snap(`移除邊 ${u} → ${v}，${v} 的入度減為 ${indeg[v]}，還在等其他套件。`, `取出 ${u}`, u, [u, v], v);
      }
    }
  }
  snap(
    order.length === NODES.length
      ? `佇列為空，${order.length} 個套件全部輸出，這就是一個合法的安裝順序。若輸出數少於節點數，代表有節點的入度永遠降不到 0，圖裡有環。`
      : "佇列為空但還有節點沒輸出，圖裡有環。",
    "結束",
  );
  return steps;
}

function buildDfs(): Step[] {
  const steps: Step[] = [];
  const adj = adjacency();
  const color: Record<string, "white" | "gray" | "black"> = Object.fromEntries(NODES.map((n) => [n, "white"]));
  const stack: string[] = [];
  const finished: string[] = [];
  const checked: Edge[] = [];
  const snap = (desc: string, op: string, cur: string | null = null, probe: Edge | null = null, hot: string | null = null) =>
    steps.push({ desc, op, indeg: {}, pending: [...stack], output: [...finished], cur, probe, done: [...checked], hot });

  snap("外層迴圈依序對每個還沒拜訪的套件呼叫 dfs。一個套件要等它的出邊全部走完、準備離開遞迴時，才記進「完成順序」。", "開始");
  const go = (u: string, intro: string) => {
    color[u] = "gray";
    stack.push(u);
    snap(`${intro}進入 dfs(${u})，${u} 放上呼叫堆疊。`, `dfs(${u})`, u);
    for (const v of adj[u]) {
      checked.push([u, v]);
      if (color[v] === "white") {
        snap(`檢查邊 ${u} → ${v}：${v} 還沒拜訪，先遞迴進去，等 ${v} 完成再回來看 ${u} 的下一條邊。`, `dfs(${u})`, u, [u, v], v);
        go(v, "");
      } else if (color[v] === "gray") {
        snap(`檢查邊 ${u} → ${v}：${v} 還在呼叫堆疊上，這是一條回邊，圖裡有環，不存在拓撲順序。`, `dfs(${u})`, u, [u, v], v);
      } else {
        snap(`檢查邊 ${u} → ${v}：${v} 已經完成，在完成順序裡排在 ${u} 前面，反轉後 ${u} 自然在 ${v} 前面，不用再進去。`, `dfs(${u})`, u, [u, v], v);
      }
    }
    color[u] = "black";
    stack.pop();
    finished.push(u);
    const back = stack.length ? stack[stack.length - 1] : null;
    const head = adj[u].length ? `${u} 的出邊都看完了` : `${u} 沒有出邊`;
    snap(`${head}，${u} 完成，是第 ${finished.length} 個完成的套件${back ? `，回到 dfs(${back})` : "，呼叫堆疊清空"}。`, back ? `dfs(${back})` : "外層迴圈", back, null, u);
  };
  let skipped: string[] = [];
  NODES.forEach((n, i) => {
    if (color[n] !== "white") { skipped.push(n); return; }
    const skip = skipped.length ? `${skipped.join("、")} 已經完成，跳過；` : "";
    go(n, i === 0 ? `外層迴圈從 ${n} 開始，` : `外層迴圈往下找：${skip}${n} 還沒拜訪，`);
    skipped = [];
  });
  const topo = [...finished].reverse();
  snap(
    `${skipped.length ? `剩下的 ${skipped.join("、")} 都已完成。` : ""}完成順序 ${finished.join(" → ")} 反轉，得到拓撲順序 ${topo.join(" → ")}。和 Kahn 的結果不同，但同樣滿足每一條相依：拓撲順序通常不只一種。`,
    "結束",
  );
  return steps;
}

export function TopoDemo() {
  const kahn = useMemo(() => buildKahn(), []);
  const dfs = useMemo(() => buildDfs(), []);
  const [mode, setMode] = useState<Mode>("kahn");
  const [k, setK] = useState(0);
  const steps = mode === "kahn" ? kahn : dfs;
  const s = steps[k];
  const same = (a: Edge, b: Edge) => a[0] === b[0] && a[1] === b[1];
  const isDone = (e: Edge) => s.done.some((d) => same(d, e));
  const isProbe = (e: Edge) => s.probe !== null && same(s.probe, e);
  const finishRank = (n: string) => s.output.indexOf(n) + 1;

  return (
    <div className="@container overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["kahn", "dfs"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => { setMode(m); setK(0); }}>
                {LABEL[m]}
              </button>
            ))}
          </div>
        }
        right={<span className="font-mono">{s.op}</span>}
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        {mode === "kahn" ? (
          <>
            <Legend cls="border-line-strong bg-[var(--node-fill)]">還在等相依</Legend>
            <Legend cls="border-amber bg-amber-soft">在佇列中（入度 0）</Legend>
            <Legend cls="border-accent bg-accent">處理中</Legend>
            <Legend cls="border-ink bg-ink">已輸出</Legend>
          </>
        ) : (
          <>
            <Legend cls="border-line-strong bg-[var(--node-fill)]">未拜訪</Legend>
            <Legend cls="border-amber bg-amber-soft">在呼叫堆疊上</Legend>
            <Legend cls="border-accent bg-accent">處理中</Legend>
            <Legend cls="border-ink bg-ink">已完成</Legend>
          </>
        )}
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block w-4 border-t-[1.5px] border-dashed border-line-strong align-[3px]" />{mode === "kahn" ? "已移除的邊" : "已檢查的邊"}</span>
      </div>

      <div className="grid grid-cols-1 @[640px]:grid-cols-[minmax(0,1fr)_230px]">
        <svg viewBox="0 0 630 260" role="img" aria-label="拓撲排序示範圖" className="block h-auto w-full">
          <defs>
            <marker id="topo-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--line-strong)" /></marker>
            <marker id="topo-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
          </defs>
          {EDGES.map((e) => {
            const [a, b] = e;
            const [x1, y1] = POS[a], [x2, y2] = POS[b];
            const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
            const ex = x2 - (dx / len) * 22, ey = y2 - (dy / len) * 22;
            const pr = isProbe(e), dim = isDone(e) && !pr;
            return (
              <line
                key={a + b}
                x1={x1} y1={y1} x2={ex} y2={ey}
                stroke={pr ? "var(--accent)" : "var(--line-strong)"}
                strokeWidth={pr ? 2.5 : 1.5}
                opacity={dim ? 0.3 : 1}
                strokeDasharray={dim ? "4 4" : undefined}
                markerEnd={pr ? "url(#topo-arrow-accent)" : "url(#topo-arrow)"}
              />
            );
          })}
          {NODES.map((n) => {
            const [x, y] = POS[n];
            const state = s.cur === n ? "c" : s.pending.includes(n) ? "q" : s.output.includes(n) ? "v" : "";
            const hot = s.hot === n ? { fill: "var(--accent)", fontWeight: 600 } : undefined;
            return (
              <g key={n} className={`node ${state}`}>
                <circle cx={x} cy={y} r="20" />
                <text className="lbl" x={x} y={y} style={{ fontSize: 11 }}>{n}</text>
                {mode === "kahn" ? (
                  <text className="dist" x={x} y={y + 33} style={hot}>in={s.indeg[n]}</text>
                ) : (
                  finishRank(n) > 0 && <text className="dist" x={x} y={y + 33} style={hot}>完成 #{finishRank(n)}</text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="flex flex-col gap-3.5 border-t border-line p-4 text-[13px] @[640px]:border-t-0 @[640px]:border-l">
          {mode === "kahn" ? (
            <>
              <div>
                <div className="eyebrow mb-1.5">入度表</div>
                <div className="grid grid-cols-6 gap-1 font-mono text-[12px] tabular-nums @[640px]:grid-cols-3">
                  {NODES.map((n) => (
                    <div key={n} className="text-center">
                      <div className="mb-0.5 truncate text-[10.5px] text-ink-3">{n}</div>
                      <div className={`grid h-7 place-items-center rounded-md border ${s.hot === n ? CELL.accent : s.indeg[n] === 0 ? CELL.dim : "border-line-strong bg-surface"}`}>{s.indeg[n]}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-1.5">佇列（前 → 後）</div>
                <Cells items={s.pending} tone={() => CELL.amber} w="w-auto px-2" />
              </div>
              <div>
                <div className="eyebrow mb-1.5">輸出順序</div>
                <Chain items={s.output} empty="尚未輸出" />
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="eyebrow mb-1.5">呼叫堆疊（底 → 頂）</div>
                <Cells items={s.pending} tone={() => CELL.amber} w="w-auto px-2" />
              </div>
              <div>
                <div className="eyebrow mb-1.5">完成順序</div>
                <Chain items={s.output} empty="尚未有套件完成" />
              </div>
              <div>
                <div className="eyebrow mb-1.5">拓撲順序（完成順序反轉）</div>
                <Chain items={[...s.output].reverse()} empty="—" />
              </div>
            </>
          )}
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

function Chain({ items, empty }: { items: string[]; empty: string }) {
  return (
    <div className="min-h-5 font-mono text-[12.5px]">
      {items.length
        ? items.map((n, i) => <span key={n}>{i > 0 && <span className="text-ink-3"> → </span>}{n}</span>)
        : <span className="font-sans text-ink-3">{empty}</span>}
    </div>
  );
}

function Legend({ cls, children }: { cls: string; children: ReactNode }) {
  return (
    <span className="whitespace-nowrap">
      <i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-[1.5px] align-[-1px] ${cls}`} />
      {children}
    </span>
  );
}
