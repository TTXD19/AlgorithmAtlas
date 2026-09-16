"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";

const POS: Record<string, [number, number]> = { A: [70, 130], B: [200, 60], C: [340, 40], D: [340, 130], E: [480, 90], F: [220, 210] };
const NODES = Object.keys(POS);
/** 有向圖：模組相依，u → v 表示 u 引用 v */
const DIR_EDGES: [string, string][] = [["A", "B"], ["A", "F"], ["B", "C"], ["B", "D"], ["D", "E"], ["E", "B"], ["F", "E"]];
/** 無向圖：機房之間的線路，依加入順序 */
const UND_EDGES: [string, string][] = [["A", "B"], ["B", "C"], ["A", "F"], ["C", "D"], ["F", "E"], ["D", "E"], ["B", "D"]];

type Mode = "directed" | "undirected";
type Color = "white" | "gray" | "black";

const TEXT = demoText(
  {
    opStart: "開始",
    opEnd: "結束",
    intro: "三種顏色：白色還沒拜訪、灰色正在遞迴中（在呼叫堆疊上）、黑色已經完成。從 A 開始 DFS。",
    visit: (u: string) => `拜訪 ${u}，塗成灰色，推入呼叫堆疊。`,
    edgeWhite: (u: string, v: string) => `檢查邊 ${u} → ${v}：${v} 是白色，沿著這條邊遞迴下去。`,
    edgeGray: (u: string, v: string, loop: string) =>
      `檢查邊 ${u} → ${v}：${v} 是灰色，代表 ${v} 還在堆疊上，${u} 是它的後代。這是一條回邊，${loop} → ${v} 形成有向環。`,
    edgeBlack: (u: string, v: string) => `檢查邊 ${u} → ${v}：${v} 是黑色，早就處理完了，從它出發到不了 ${u}，所以不會形成環。`,
    finish: (u: string, back: string | null) => `${u} 的出邊都看完，塗成黑色，離開堆疊${back ? `，回到 ${back}` : ""}。`,
    endCycle: "走訪結束。有向環的判定只看「遇到灰色節點」，遇到黑色節點不算，這是有向圖和無向圖最大的差別。",
    endDag: "走訪結束，沒有遇到灰色節點，圖是 DAG。",
    undIntro: "無向圖用併查集：一開始每個節點自成一群。逐條加入邊，加入前先問「兩端已經同群了嗎」。",
    sameGroup: (u: string, v: string, ru: string, rv: string) =>
      `邊 ${u} – ${v}：find(${u}) = ${ru}、find(${v}) = ${rv}，兩端已經同群，也就是已有一條路徑連接它們。再加這條邊就形成環。`,
    diffGroup: (u: string, v: string, ru: string, rv: string) =>
      `邊 ${u} – ${v}：find(${u}) = ${ru}、find(${v}) = ${rv}，不同群，合併，這條邊加入森林。`,
    undEnd: (n: number) => `所有邊處理完，${n} 條邊會形成環。若只想知道有沒有環，第一次遇到同群就可以停。`,
    modeDirected: "有向圖 · 三色 DFS",
    modeUndirected: "無向圖 · 併查集",
    legendWhite: "白：未拜訪",
    legendGray: "灰：在堆疊中",
    legendBlack: "黑：已完成",
    legendUnwired: "尚未接線",
    legendWired: "已接上邊",
    treeEdge: "樹邊",
    mergedEdge: "已合併的邊",
    cycleEdge: "形成環的邊",
    svgLabel: "環偵測示範圖",
    stackTitle: "呼叫堆疊（底 → 頂）",
    parentTitle: "parent（併查集）",
    nodeRow: "節點",
    resultTitle: "結果",
    foundCycle: (n: number) => `發現環（${n} 條邊）`,
    noCycle: "尚未發現環",
  },
  {
    en: {
      opStart: "Start",
      opEnd: "Done",
      intro: "Three colours: white means not visited yet, grey means the recursion is still inside it (it is on the call stack), and black means it is finished. Start the DFS at A.",
      visit: (u: string) => `Visit ${u}, paint it grey, and push it onto the call stack.`,
      edgeWhite: (u: string, v: string) => `Check edge ${u} → ${v}: ${v} is white, so follow this edge and recurse into it.`,
      edgeGray: (u: string, v: string, loop: string) =>
        `Check edge ${u} → ${v}: ${v} is grey, which means ${v} is still on the stack and ${u} is one of its descendants. This is a back edge, and ${loop} → ${v} forms a directed cycle.`,
      edgeBlack: (u: string, v: string) => `Check edge ${u} → ${v}: ${v} is black, so it finished long ago. Nothing reachable from ${v} leads back to ${u}, so this edge cannot close a cycle.`,
      finish: (u: string, back: string | null) => `Every outgoing edge of ${u} has been checked, so paint it black and pop it off the stack${back ? `, returning to ${back}` : ""}.`,
      endCycle: "The traversal is over. A directed cycle is detected only by running into a grey node; running into a black one does not count, and that is the biggest difference between the directed and undirected cases.",
      endDag: "The traversal is over. No grey node was ever encountered, so the graph is a DAG.",
      undIntro: 'For an undirected graph, use union-find: every node starts in a group of its own. Add the edges one at a time, asking first "are these two endpoints already in the same group?"',
      sameGroup: (u: string, v: string, ru: string, rv: string) =>
        `Edge ${u} – ${v}: find(${u}) = ${ru} and find(${v}) = ${rv}. The endpoints are already in the same group, so a path between them exists. Adding this edge closes a cycle.`,
      diffGroup: (u: string, v: string, ru: string, rv: string) =>
        `Edge ${u} – ${v}: find(${u}) = ${ru} and find(${v}) = ${rv}. Different groups, so merge them and add this edge to the forest.`,
      undEnd: (n: number) => `Every edge has been processed, and ${n} of them close a cycle. If you only need to know whether a cycle exists, you can stop at the first same-group edge.`,
      modeDirected: "Directed · three-colour DFS",
      modeUndirected: "Undirected · union-find",
      legendWhite: "White: not visited",
      legendGray: "Grey: on the stack",
      legendBlack: "Black: finished",
      legendUnwired: "Not wired up yet",
      legendWired: "Edge added",
      treeEdge: "Tree edge",
      mergedEdge: "Merged edge",
      cycleEdge: "Edge that closes a cycle",
      svgLabel: "Cycle detection demo graph",
      stackTitle: "Call stack (bottom → top)",
      parentTitle: "parent (union-find)",
      nodeRow: "Node",
      resultTitle: "Result",
      foundCycle: (n: number) => `Cycle found (${n} edge${n === 1 ? "" : "s"})`,
      noCycle: "No cycle so far",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

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

function buildDirected(t: T): Step[] {
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

  snap(t.intro, t.opStart, null);
  const go = (u: string) => {
    color[u] = "gray";
    stack.push(u);
    snap(t.visit(u), `dfs(${u})`, u);
    for (const v of adj[u]) {
      if (color[v] === "white") {
        tree.push([u, v]);
        snap(t.edgeWhite(u, v), `dfs(${u})`, u, [u, v]);
        go(v);
      } else if (color[v] === "gray") {
        const i = stack.indexOf(v);
        const loop = stack.slice(i);
        for (let j = 0; j < loop.length - 1; j++) cycle.push([loop[j], loop[j + 1]]);
        cycle.push([u, v]);
        found = true;
        snap(t.edgeGray(u, v, loop.join(" → ")), `dfs(${u})`, u, [u, v]);
      } else {
        snap(t.edgeBlack(u, v), `dfs(${u})`, u, [u, v]);
      }
    }
    color[u] = "black";
    stack.pop();
    const back = stack[stack.length - 1] ?? null;
    snap(t.finish(u, back), back ? `dfs(${back})` : t.opEnd, back);
  };
  go("A");
  snap(found ? t.endCycle : t.endDag, t.opEnd, null);
  return steps;
}

function buildUndirected(t: T): Step[] {
  const steps: Step[] = [];
  const color: Record<string, Color> = Object.fromEntries(NODES.map((n) => [n, "white"]));
  const parent = NODES.map((_, i) => i);
  const tree: [string, string][] = [];
  const cycle: [string, string][] = [];
  let found = false;
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const snap = (desc: string, op: string, probe: [string, string] | null = null) =>
    steps.push({ desc, op, color: { ...color }, cur: null, stack: [], probe, tree: [...tree], cycle: [...cycle], parent: [...parent], found });

  snap(t.undIntro, t.opStart);
  for (const [u, v] of UND_EDGES) {
    const a = NODES.indexOf(u), b = NODES.indexOf(v);
    const ra = find(a), rb = find(b);
    if (ra === rb) {
      cycle.push([u, v]);
      found = true;
      snap(t.sameGroup(u, v, NODES[ra], NODES[rb]), `${u} – ${v}`, [u, v]);
    } else {
      parent[ra] = rb;
      tree.push([u, v]);
      color[u] = "black";
      color[v] = "black";
      snap(t.diffGroup(u, v, NODES[ra], NODES[rb]), `${u} – ${v}`, [u, v]);
    }
  }
  snap(t.undEnd(cycle.length), t.opEnd);
  return steps;
}

export function CycleDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const directed = useMemo(() => buildDirected(TEXT[locale]), [locale]);
  const undirected = useMemo(() => buildUndirected(TEXT[locale]), [locale]);
  const [mode, setMode] = useState<Mode>("directed");
  const [k, setK] = useState(0);
  const steps = mode === "directed" ? directed : undirected;
  const s = steps[k];
  const edges = mode === "directed" ? DIR_EDGES : UND_EDGES;
  const switchMode = (m: Mode) => { setMode(m); setK(0); };
  const isTree = (e: [string, string]) => s.tree.some((x) => edgeEq(x, e));
  const isCycle = (e: [string, string]) => s.cycle.some((x) => edgeEq(x, e));
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
                {m === "directed" ? t.modeDirected : t.modeUndirected}
              </button>
            ))}
          </div>
        }
        right={<span className="font-mono">{s.op}</span>}
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        {mode === "directed" ? (
          <>
            <Legend cls="border-line-strong bg-[var(--node-fill)]">{t.legendWhite}</Legend>
            <Legend cls="border-amber bg-amber-soft">{t.legendGray}</Legend>
            <Legend cls="border-accent bg-accent">{ui.demo.processing}</Legend>
            <Legend cls="border-ink bg-ink">{t.legendBlack}</Legend>
          </>
        ) : (
          <>
            <Legend cls="border-line-strong bg-[var(--node-fill)]">{t.legendUnwired}</Legend>
            <Legend cls="border-ink bg-ink">{t.legendWired}</Legend>
          </>
        )}
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-accent align-[3px]" />{mode === "directed" ? t.treeEdge : t.mergedEdge}</span>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-amber align-[3px]" />{t.cycleEdge}</span>
      </div>

      <div className="grid grid-cols-1 @[640px]:grid-cols-[minmax(0,1fr)_220px]">
        <svg viewBox="0 0 560 260" role="img" aria-label={t.svgLabel} className="block h-auto w-full">
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
              <div className="eyebrow mb-1.5">{t.stackTitle}</div>
              <Cells items={s.stack} tone={() => CELL.amber} w="w-7" />
            </div>
          ) : (
            <div className="flex-1">
              <div className="eyebrow mb-1.5">{t.parentTitle}</div>
              <div className="flex gap-2">
                <div><div className="mb-1 font-mono text-[10.5px] text-ink-3">{t.nodeRow}</div><Cells items={NODES} w="w-7" /></div>
                <div><div className="mb-1 font-mono text-[10.5px] text-ink-3">parent</div><Cells items={s.parent.map((p) => NODES[p])} tone={(i) => (s.parent[i] === i ? CELL.accent : "")} w="w-7" /></div>
              </div>
            </div>
          )}
          <div className="flex-1">
            <div className="eyebrow mb-1.5">{t.resultTitle}</div>
            <div className={`text-[13px] font-semibold ${s.found ? "text-amber" : "text-ink-3"}`}>{s.found ? t.foundCycle(s.cycle.length) : t.noCycle}</div>
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
