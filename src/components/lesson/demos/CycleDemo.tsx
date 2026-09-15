"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";

const POS: Record<string, [number, number]> = { A: [70, 130], B: [200, 60], C: [340, 40], D: [340, 130], E: [480, 90], F: [220, 210] };
const NODES = Object.keys(POS);
/** 有向圖：模組相依，u → v 表示 u 引用 v */
const DIR_EDGES: [string, string][] = [["A", "B"], ["A", "F"], ["B", "C"], ["B", "D"], ["D", "E"], ["E", "B"], ["F", "E"]];
/** 無向圖：機房之間的線路，依加入順序 */
const UND_EDGES: [string, string][] = [["A", "B"], ["B", "C"], ["A", "F"], ["C", "D"], ["F", "E"], ["D", "E"], ["B", "D"]];

type Mode = "directed" | "undirected";
type Color = "white" | "gray" | "black";
interface Step {
  desc: string;
  op: string;
  color: Record<string, Color>;
  cur: string | null;
  stack: string[];
  /** 正在檢查的邊 */
  probe: [string, string] | null;
  /** 已走過的樹邊／已合併的邊 */
  tree: [string, string][];
  /** 形成環的邊 */
  cycle: [string, string][];
  parent: number[];
  found: boolean;
}

function edgeEq(a: [string, string], b: [string, string]) {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
}

function buildDirected(): Step[] {
  const steps: Step[] = [];
  const color: Record<string, Color> = Object.fromEntries(NODES.map((n) => [n, "white"]));
  const adj: Record<string, string[]> = Object.fromEntries(NODES.map((n) => [n, []]));
  DIR_EDGES.forEach(([u, v]) => adj[u].push(v));
  const stack: string[] = [];
  const tree: [string, string][] = [];
  const cycle: [string, string][] = [];
  let found = false;
  const snap = (desc: string, op: string, cur: string | null, probe: [string, string] | null = null) =>
    steps.push({ desc, op, color: { ...color }, cur, stack: [...stack], probe, tree: [...tree], cycle: [...cycle], parent: [], found });

  snap("三種顏色：白色還沒拜訪、灰色正在遞迴中（在呼叫堆疊上）、黑色已經完成。從 A 開始 DFS。", "開始", null);
  const go = (u: string) => {
    color[u] = "gray";
    stack.push(u);
    snap(`拜訪 ${u}，塗成灰色，推入呼叫堆疊。`, `dfs(${u})`, u);
    for (const v of adj[u]) {
      if (color[v] === "white") {
        tree.push([u, v]);
        snap(`檢查邊 ${u} → ${v}：${v} 是白色，沿著這條邊遞迴下去。`, `dfs(${u})`, u, [u, v]);
        go(v);
      } else if (color[v] === "gray") {
        const i = stack.indexOf(v);
        const loop = stack.slice(i);
        for (let j = 0; j < loop.length - 1; j++) cycle.push([loop[j], loop[j + 1]]);
        cycle.push([u, v]);
        found = true;
        snap(`檢查邊 ${u} → ${v}：${v} 是灰色，代表 ${v} 還在堆疊上，${u} 是它的後代。這是一條回邊，${loop.join(" → ")} → ${v} 形成有向環。`, `dfs(${u})`, u, [u, v]);
      } else {
        snap(`檢查邊 ${u} → ${v}：${v} 是黑色，早就處理完了，從它出發到不了 ${u}，所以不會形成環。`, `dfs(${u})`, u, [u, v]);
      }
    }
    color[u] = "black";
    stack.pop();
    const back = stack[stack.length - 1] ?? null;
    snap(`${u} 的出邊都看完，塗成黑色，離開堆疊${back ? `，回到 ${back}` : ""}。`, back ? `dfs(${back})` : "結束", back);
  };
  go("A");
  snap(found ? "走訪結束。有向環的判定只看「遇到灰色節點」，遇到黑色節點不算，這是有向圖和無向圖最大的差別。" : "走訪結束，沒有遇到灰色節點，圖是 DAG。", "結束", null);
  return steps;
}

function buildUndirected(): Step[] {
  const steps: Step[] = [];
  const color: Record<string, Color> = Object.fromEntries(NODES.map((n) => [n, "white"]));
  const parent = NODES.map((_, i) => i);
  const tree: [string, string][] = [];
  const cycle: [string, string][] = [];
  let found = false;
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const snap = (desc: string, op: string, probe: [string, string] | null = null) =>
    steps.push({ desc, op, color: { ...color }, cur: null, stack: [], probe, tree: [...tree], cycle: [...cycle], parent: [...parent], found });

  snap("無向圖用併查集：一開始每個節點自成一群。逐條加入邊，加入前先問「兩端已經同群了嗎」。", "開始");
  for (const [u, v] of UND_EDGES) {
    const a = NODES.indexOf(u), b = NODES.indexOf(v);
    const ra = find(a), rb = find(b);
    if (ra === rb) {
      cycle.push([u, v]);
      found = true;
      snap(`邊 ${u} – ${v}：find(${u}) = ${NODES[ra]}、find(${v}) = ${NODES[rb]}，兩端已經同群，也就是已有一條路徑連接它們。再加這條邊就形成環。`, `${u} – ${v}`, [u, v]);
    } else {
      parent[ra] = rb;
      tree.push([u, v]);
      color[u] = "black";
      color[v] = "black";
      snap(`邊 ${u} – ${v}：find(${u}) = ${NODES[ra]}、find(${v}) = ${NODES[rb]}，不同群，合併，這條邊加入森林。`, `${u} – ${v}`, [u, v]);
    }
  }
  snap(`所有邊處理完，${cycle.length} 條邊會形成環。若只想知道有沒有環，第一次遇到同群就可以停。`, "結束");
  return steps;
}

export function CycleDemo() {
  const directed = useMemo(() => buildDirected(), []);
  const undirected = useMemo(() => buildUndirected(), []);
  const [mode, setMode] = useState<Mode>("directed");
  const [k, setK] = useState(0);
  const steps = mode === "directed" ? directed : undirected;
  const s = steps[k];
  const edges = mode === "directed" ? DIR_EDGES : UND_EDGES;
  const switchMode = (m: Mode) => { setMode(m); setK(0); };
  const isTree = (e: [string, string]) => s.tree.some((t) => edgeEq(t, e));
  const isCycle = (e: [string, string]) => s.cycle.some((t) => edgeEq(t, e));
  const isProbe = (e: [string, string]) => s.probe !== null && edgeEq(s.probe, e);

  return (
    <div className="@container overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["directed", "undirected"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "directed" ? "有向圖 · 三色 DFS" : "無向圖 · 併查集"}
              </button>
            ))}
          </div>
        }
        right={<span className="font-mono">{s.op}</span>}
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        {mode === "directed" ? (
          <>
            <Legend cls="border-line-strong bg-[var(--node-fill)]">白：未拜訪</Legend>
            <Legend cls="border-amber bg-amber-soft">灰：在堆疊中</Legend>
            <Legend cls="border-accent bg-accent">處理中</Legend>
            <Legend cls="border-ink bg-ink">黑：已完成</Legend>
          </>
        ) : (
          <>
            <Legend cls="border-line-strong bg-[var(--node-fill)]">尚未接線</Legend>
            <Legend cls="border-ink bg-ink">已接上邊</Legend>
          </>
        )}
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-accent align-[3px]" />{mode === "directed" ? "樹邊" : "已合併的邊"}</span>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-amber align-[3px]" />形成環的邊</span>
      </div>

      <div className="grid grid-cols-1 @[640px]:grid-cols-[minmax(0,1fr)_220px]">
        <svg viewBox="0 0 560 260" role="img" aria-label="環偵測示範圖" className="block h-auto w-full">
          <defs>
            <marker id="cyc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--line-strong)" /></marker>
            <marker id="cyc-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
            <marker id="cyc-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--amber)" /></marker>
          </defs>
          {edges.map((e) => {
            const [a, b] = e;
            const [x1, y1] = POS[a], [x2, y2] = POS[b];
            const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
            const ex = x2 - (dx / len) * 21, ey = y2 - (dy / len) * 21;
            const cyc = isCycle(e), tr = isTree(e), pr = isProbe(e);
            const stroke = cyc ? "var(--amber)" : tr || pr ? "var(--accent)" : "var(--line-strong)";
            const marker = cyc ? "url(#cyc-arrow-amber)" : tr || pr ? "url(#cyc-arrow-accent)" : "url(#cyc-arrow)";
            return (
              <line
                key={a + b}
                x1={x1} y1={y1}
                x2={mode === "directed" ? ex : x2} y2={mode === "directed" ? ey : y2}
                stroke={stroke} strokeWidth={cyc || tr || pr ? 2.5 : 1.5}
                strokeDasharray={pr && !tr && !cyc ? "5 4" : undefined}
                markerEnd={mode === "directed" ? marker : undefined}
              />
            );
          })}
          {NODES.map((n) => {
            const [x, y] = POS[n];
            const state = s.cur === n ? "c" : s.color[n] === "gray" ? "q" : s.color[n] === "black" ? "v" : "";
            return (
              <g key={n} className={`node ${state}`}>
                <circle cx={x} cy={y} r="18" />
                <text className="lbl" x={x} y={y}>{n}</text>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-row gap-3.5 border-t border-line p-4 text-[13px] @[640px]:flex-col @[640px]:border-t-0 @[640px]:border-l">
          {mode === "directed" ? (
            <div className="flex-1">
              <div className="eyebrow mb-1.5">呼叫堆疊（底 → 頂）</div>
              <Cells items={s.stack} tone={() => CELL.amber} w="w-7" />
            </div>
          ) : (
            <div className="flex-1">
              <div className="eyebrow mb-1.5">parent（併查集）</div>
              <div className="flex gap-2">
                <div><div className="mb-1 font-mono text-[10.5px] text-ink-3">節點</div><Cells items={NODES} w="w-7" /></div>
                <div><div className="mb-1 font-mono text-[10.5px] text-ink-3">parent</div><Cells items={s.parent.map((p) => NODES[p])} tone={(i) => (s.parent[i] === i ? CELL.accent : "")} w="w-7" /></div>
              </div>
            </div>
          )}
          <div className="flex-1">
            <div className="eyebrow mb-1.5">結果</div>
            <div className={`text-[13px] font-semibold ${s.found ? "text-amber" : "text-ink-3"}`}>{s.found ? `發現環（${s.cycle.length} 條邊）` : "尚未發現環"}</div>
          </div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

function Legend({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap">
      <i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-[1.5px] align-[-1px] ${cls}`} />
      {children}
    </span>
  );
}
