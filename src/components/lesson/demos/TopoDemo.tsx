"use client";

import { useMemo, useState, type ReactNode } from "react";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

/** 套件相依：u → v 表示「裝 v 之前要先裝 u」 */
const NODES = ["react", "ts", "r-dom", "lint", "next", "app"];
const POS: Record<string, [number, number]> = { react: [70, 70], ts: [70, 190], "r-dom": [230, 70], lint: [230, 190], next: [400, 130], app: [560, 130] };
type Edge = [string, string];
const EDGES: Edge[] = [["react", "r-dom"], ["react", "next"], ["r-dom", "next"], ["r-dom", "app"], ["ts", "lint"], ["ts", "next"], ["next", "app"], ["lint", "app"]];

type Mode = "kahn" | "dfs";

const TEXT = demoText(
  {
    modeKahn: "Kahn · 入度",
    modeDfs: "DFS · 完成順序",
    sep: "、",

    opIndeg: "計算入度",
    opInitQueue: "初始化佇列",
    opPop: (u: string) => `取出 ${u}`,
    opEnd: "結束",
    countIndeg: "先數每個套件的入度：有幾條邊指向它，也就是它依賴幾個還沒裝的套件。",
    initQueue: (list: string) => `入度為 0 的套件不依賴任何東西，可以先裝：${list}。全部放入佇列。`,
    popWithEdges: (u: string, out: number) => `取出 ${u}，安裝它，加到輸出順序。接著把它的 ${out} 條出邊一條一條移除。`,
    popNoEdges: (u: string) => `取出 ${u}，安裝它，加到輸出順序。${u} 沒有出邊，沒有套件在等它。`,
    dropReady: (u: string, v: string) => `移除邊 ${u} → ${v}，${v} 的入度減為 0：它依賴的套件都裝好了，放入佇列。`,
    dropWait: (u: string, v: string, d: number) => `移除邊 ${u} → ${v}，${v} 的入度減為 ${d}，還在等其他套件。`,
    kahnDone: (n: number) => `佇列為空，${n} 個套件全部輸出，這就是一個合法的安裝順序。若輸出數少於節點數，代表有節點的入度永遠降不到 0，圖裡有環。`,
    kahnCycle: "佇列為空但還有節點沒輸出，圖裡有環。",

    opStart: "開始",
    opDfs: (u: string) => `dfs(${u})`,
    opOuter: "外層迴圈",
    dfsIntro: "外層迴圈依序對每個還沒拜訪的套件呼叫 dfs。一個套件要等它的出邊全部走完、準備離開遞迴時，才記進「完成順序」。",
    enter: (intro: string, u: string) => `${intro}進入 dfs(${u})，${u} 放上呼叫堆疊。`,
    outerFirst: (n: string) => `外層迴圈從 ${n} 開始，`,
    outerNext: (skip: string, n: string) => `外層迴圈往下找：${skip}${n} 還沒拜訪，`,
    outerSkip: (list: string) => `${list} 已經完成，跳過；`,
    edgeWhite: (u: string, v: string) => `檢查邊 ${u} → ${v}：${v} 還沒拜訪，先遞迴進去，等 ${v} 完成再回來看 ${u} 的下一條邊。`,
    edgeGray: (u: string, v: string) => `檢查邊 ${u} → ${v}：${v} 還在呼叫堆疊上，這是一條回邊，圖裡有環，不存在拓撲順序。`,
    edgeBlack: (u: string, v: string) => `檢查邊 ${u} → ${v}：${v} 已經完成，在完成順序裡排在 ${u} 前面，反轉後 ${u} 自然在 ${v} 前面，不用再進去。`,
    finish: (u: string, hasOut: boolean, rank: number, back: string | null) =>
      `${hasOut ? `${u} 的出邊都看完了` : `${u} 沒有出邊`}，${u} 完成，是第 ${rank} 個完成的套件${back ? `，回到 dfs(${back})` : "，呼叫堆疊清空"}。`,
    dfsRest: (list: string) => `剩下的 ${list} 都已完成。`,
    dfsDone: (rest: string, order: string, topo: string) =>
      `${rest}完成順序 ${order} 反轉，得到拓撲順序 ${topo}。和 Kahn 的結果不同，但同樣滿足每一條相依：拓撲順序通常不只一種。`,

    aria: "拓撲排序示範圖",
    legendWaiting: "還在等相依",
    legendQueued: "在佇列中（入度 0）",
    legendOutput: "已輸出",
    legendUnvisited: "未拜訪",
    legendStack: "在呼叫堆疊上",
    edgesRemoved: "已移除的邊",
    edgesChecked: "已檢查的邊",
    indegTitle: "入度表",
    queueTitle: "佇列（前 → 後）",
    outputTitle: "輸出順序",
    stackTitle: "呼叫堆疊（底 → 頂）",
    finishTitle: "完成順序",
    topoTitle: "拓撲順序（完成順序反轉）",
    noOutput: "尚未輸出",
    noFinished: "尚未有套件完成",
    finishTag: (k: number) => `完成 #${k}`,
  },
  {
    en: {
      modeKahn: "Kahn · in-degree",
      modeDfs: "DFS · finish order",
      sep: ", ",

      opIndeg: "Count in-degrees",
      opInitQueue: "Seed the queue",
      opPop: (u: string) => `Pop ${u}`,
      opEnd: "Done",
      countIndeg: "First count the in-degree of each package: how many edges point at it, which is how many not-yet-installed packages it depends on.",
      initQueue: (list: string) => `Packages with in-degree 0 depend on nothing, so they can be installed right away: ${list}. Put them all in the queue.`,
      popWithEdges: (u: string, out: number) => `Pop ${u}, install it, and append it to the output order. Now remove ${out === 1 ? "its single out-edge" : `its ${out} out-edges one at a time`}.`,
      popNoEdges: (u: string) => `Pop ${u}, install it, and append it to the output order. ${u} has no out-edges, so nothing is waiting on it.`,
      dropReady: (u: string, v: string) => `Remove the edge ${u} → ${v}. The in-degree of ${v} drops to 0: everything it depends on is installed, so it joins the queue.`,
      dropWait: (u: string, v: string, d: number) => `Remove the edge ${u} → ${v}. The in-degree of ${v} drops to ${d}, so it is still waiting on other packages.`,
      kahnDone: (n: number) => `The queue is empty and all ${n} packages came out, so this is a valid installation order. If fewer nodes come out than the graph has, some in-degree never reached 0 and the graph contains a cycle.`,
      kahnCycle: "The queue is empty but some nodes were never output, so the graph contains a cycle.",

      opStart: "Start",
      opDfs: (u: string) => `dfs(${u})`,
      opOuter: "Outer loop",
      dfsIntro: "The outer loop calls dfs on each unvisited package in turn. A package is only added to the finish order once every one of its out-edges has been explored and the recursion is about to return.",
      enter: (intro: string, u: string) => `${intro}Enter dfs(${u}); ${u} goes on the call stack.`,
      outerFirst: (n: string) => `The outer loop starts at ${n}. `,
      outerNext: (skip: string, n: string) => `The outer loop moves on. ${skip}${n} has not been visited yet. `,
      outerSkip: (list: string) => `Skipping ${list}, already finished. `,
      edgeWhite: (u: string, v: string) => `Check the edge ${u} → ${v}: ${v} has not been visited, so recurse into it first and come back to the next edge of ${u} once ${v} is finished.`,
      edgeGray: (u: string, v: string) => `Check the edge ${u} → ${v}: ${v} is still on the call stack, so this is a back edge. The graph contains a cycle and has no topological order.`,
      edgeBlack: (u: string, v: string) => `Check the edge ${u} → ${v}: ${v} is already finished, so it sits before ${u} in the finish order, and after the reversal ${u} comes before ${v} anyway. No need to go in again.`,
      finish: (u: string, hasOut: boolean, rank: number, back: string | null) =>
        `${hasOut ? `Every out-edge of ${u} has been checked` : `${u} has no out-edges`}, so ${u} is finished — number ${rank} in the finish order${back ? `. Back in dfs(${back}).` : ". The call stack is now empty."}`,
      dfsRest: (list: string) => `The remaining packages, ${list}, are already finished. `,
      dfsDone: (rest: string, order: string, topo: string) =>
        `${rest}Reverse the finish order ${order} to get the topological order ${topo}. It differs from Kahn's answer but honours every dependency just as well: a graph usually has more than one topological order.`,

      aria: "Topological sort demo graph",
      legendWaiting: "Waiting on dependencies",
      legendQueued: "In the queue (in-degree 0)",
      legendOutput: "Output",
      legendUnvisited: "Unvisited",
      legendStack: "On the call stack",
      edgesRemoved: "Removed edges",
      edgesChecked: "Checked edges",
      indegTitle: "In-degree table",
      queueTitle: "Queue (front → back)",
      outputTitle: "Output order",
      stackTitle: "Call stack (bottom → top)",
      finishTitle: "Finish order",
      topoTitle: "Topological order (finish order reversed)",
      noOutput: "Nothing output yet",
      noFinished: "No package has finished yet",
      finishTag: (k: number) => `done #${k}`,
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

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

function buildKahn(t: T): Step[] {
  const steps: Step[] = [];
  const adj = adjacency();
  const indeg: Record<string, number> = Object.fromEntries(NODES.map((n) => [n, 0]));
  EDGES.forEach(([, v]) => indeg[v]++);
  const queue: string[] = [];
  const order: string[] = [];
  const removed: Edge[] = [];
  const snap = (desc: string, op: string, cur: string | null = null, probe: Edge | null = null, hot: string | null = null) =>
    steps.push({ desc, op, indeg: { ...indeg }, pending: [...queue], output: [...order], cur, probe, done: [...removed], hot });

  snap(t.countIndeg, t.opIndeg);
  NODES.forEach((n) => { if (indeg[n] === 0) queue.push(n); });
  snap(t.initQueue(queue.join(t.sep)), t.opInitQueue);
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    snap(
      adj[u].length
        ? t.popWithEdges(u, adj[u].length)
        : t.popNoEdges(u),
      t.opPop(u), u,
    );
    for (const v of adj[u]) {
      indeg[v]--;
      removed.push([u, v]);
      if (indeg[v] === 0) {
        queue.push(v);
        snap(t.dropReady(u, v), t.opPop(u), u, [u, v], v);
      } else {
        snap(t.dropWait(u, v, indeg[v]), t.opPop(u), u, [u, v], v);
      }
    }
  }
  snap(
    order.length === NODES.length
      ? t.kahnDone(order.length)
      : t.kahnCycle,
    t.opEnd,
  );
  return steps;
}

function buildDfs(t: T): Step[] {
  const steps: Step[] = [];
  const adj = adjacency();
  const color: Record<string, "white" | "gray" | "black"> = Object.fromEntries(NODES.map((n) => [n, "white"]));
  const stack: string[] = [];
  const finished: string[] = [];
  const checked: Edge[] = [];
  const snap = (desc: string, op: string, cur: string | null = null, probe: Edge | null = null, hot: string | null = null) =>
    steps.push({ desc, op, indeg: {}, pending: [...stack], output: [...finished], cur, probe, done: [...checked], hot });

  snap(t.dfsIntro, t.opStart);
  const go = (u: string, intro: string) => {
    color[u] = "gray";
    stack.push(u);
    snap(t.enter(intro, u), t.opDfs(u), u);
    for (const v of adj[u]) {
      checked.push([u, v]);
      if (color[v] === "white") {
        snap(t.edgeWhite(u, v), t.opDfs(u), u, [u, v], v);
        go(v, "");
      } else if (color[v] === "gray") {
        snap(t.edgeGray(u, v), t.opDfs(u), u, [u, v], v);
      } else {
        snap(t.edgeBlack(u, v), t.opDfs(u), u, [u, v], v);
      }
    }
    color[u] = "black";
    stack.pop();
    finished.push(u);
    const back = stack.length ? stack[stack.length - 1] : null;
    snap(t.finish(u, adj[u].length > 0, finished.length, back), back ? t.opDfs(back) : t.opOuter, back, null, u);
  };
  let skipped: string[] = [];
  NODES.forEach((n, i) => {
    if (color[n] !== "white") { skipped.push(n); return; }
    const skip = skipped.length ? t.outerSkip(skipped.join(t.sep)) : "";
    go(n, i === 0 ? t.outerFirst(n) : t.outerNext(skip, n));
    skipped = [];
  });
  const topo = [...finished].reverse();
  snap(
    t.dfsDone(skipped.length ? t.dfsRest(skipped.join(t.sep)) : "", finished.join(" → "), topo.join(" → ")),
    t.opEnd,
  );
  return steps;
}

export function TopoDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const kahn = useMemo(() => buildKahn(t), [t]);
  const dfs = useMemo(() => buildDfs(t), [t]);
  const [mode, setMode] = useState<Mode>("kahn");
  const [k, setK] = useState(0);
  const label: Record<Mode, string> = { kahn: t.modeKahn, dfs: t.modeDfs };
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
                {label[m]}
              </button>
            ))}
          </div>
        }
        right={<span className="font-mono">{s.op}</span>}
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        {mode === "kahn" ? (
          <>
            <Legend cls="border-line-strong bg-[var(--node-fill)]">{t.legendWaiting}</Legend>
            <Legend cls="border-amber bg-amber-soft">{t.legendQueued}</Legend>
            <Legend cls="border-accent bg-accent">{ui.demo.processing}</Legend>
            <Legend cls="border-ink bg-ink">{t.legendOutput}</Legend>
          </>
        ) : (
          <>
            <Legend cls="border-line-strong bg-[var(--node-fill)]">{t.legendUnvisited}</Legend>
            <Legend cls="border-amber bg-amber-soft">{t.legendStack}</Legend>
            <Legend cls="border-accent bg-accent">{ui.demo.processing}</Legend>
            <Legend cls="border-ink bg-ink">{ui.demo.finished}</Legend>
          </>
        )}
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block w-4 border-t-[1.5px] border-dashed border-line-strong align-[3px]" />{mode === "kahn" ? t.edgesRemoved : t.edgesChecked}</span>
      </div>

      <div className="grid grid-cols-1 @[640px]:grid-cols-[minmax(0,1fr)_230px]">
        <svg viewBox="0 0 630 260" role="img" aria-label={t.aria} className="block h-auto w-full">
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
                  finishRank(n) > 0 && <text className="dist" x={x} y={y + 33} style={hot}>{t.finishTag(finishRank(n))}</text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="flex flex-col gap-3.5 border-t border-line p-4 text-[13px] @[640px]:border-t-0 @[640px]:border-l">
          {mode === "kahn" ? (
            <>
              <div>
                <div className="eyebrow mb-1.5">{t.indegTitle}</div>
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
                <div className="eyebrow mb-1.5">{t.queueTitle}</div>
                <Cells items={s.pending} tone={() => CELL.amber} w="w-auto px-2" />
              </div>
              <div>
                <div className="eyebrow mb-1.5">{t.outputTitle}</div>
                <Chain items={s.output} empty={t.noOutput} />
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="eyebrow mb-1.5">{t.stackTitle}</div>
                <Cells items={s.pending} tone={() => CELL.amber} w="w-auto px-2" />
              </div>
              <div>
                <div className="eyebrow mb-1.5">{t.finishTitle}</div>
                <Chain items={s.output} empty={t.noFinished} />
              </div>
              <div>
                <div className="eyebrow mb-1.5">{t.topoTitle}</div>
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
