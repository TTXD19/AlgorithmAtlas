"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, BTN, CELL } from "./StepBar";

type Mode = "kruskal" | "prim";
const NODES = ["A", "B", "C", "D", "E", "F"];
const POS: Record<string, [number, number]> = { A: [70, 60], B: [230, 45], C: [400, 70], D: [70, 215], E: [240, 225], F: [410, 215] };
/** 無向帶權圖 */
const EDGES: [string, string, number][] = [["A", "B", 3], ["A", "D", 2], ["B", "D", 4], ["B", "E", 1], ["D", "E", 5], ["B", "C", 7], ["C", "E", 6], ["C", "F", 4], ["E", "F", 8]];
const key = (a: string, b: string) => (a < b ? a + b : b + a);

const TEXT = demoText(
  {
    kruskalIntro: (e: number) =>
      `Kruskal 先把 ${e} 條邊依權重由小到大排好（見邊的清單）。一開始每個節點自成一群，還沒有任何邊。接著從最便宜的邊開始看：兩端在不同群就收下並合併，同一群就丟掉，因為會成環。`,
    kruskalTake: (a: string, b: string, w: number, count: number, total: number) =>
      `${a}–${b}（${w}）：${a} 和 ${b} 原本在不同群，收下這條邊並把兩群合併。已選 ${count} 條，總權重 ${total}。`,
    kruskalReject: (a: string, b: string, w: number, group: string) =>
      `${a}–${b}（${w}）：${a} 和 ${b} 已經在同一群（${group}），之間早就有路，加上這條邊會形成環，丟掉（虛線）。`,
    kruskalDone: (picked: number, rest: number, list: string, total: number) =>
      `已經選了 V − 1 = ${picked} 條邊，所有節點連成一群，剩下的 ${rest} 條邊（${list}）不用再看。最小生成樹的總權重是 ${total}。排序 O(E log E) 是主要成本，併查集的操作幾乎是常數。`,
    primIntro: (list: string) =>
      `Prim 從任一節點出發，這裡選 A。樹裡目前只有 A，把 A 連到樹外的邊放進最小堆積：${list}。之後每一步都從堆積取出最便宜的邊。`,
    primStale: (u: string, v: string, w: number) =>
      `取出 ${u}–${v}（${w}），但 ${v} 已經在樹裡了。這條邊是之前放進去的舊資料，兩端都在樹內，直接丟掉。這種「取出時才檢查」的寫法叫 lazy Prim，程式最簡單。`,
    primTake: (u: string, v: string, w: number, total: number, tail: string) =>
      `取出 ${u}–${v}（${w}）：這是目前連接「樹內」和「樹外」最便宜的邊，把 ${v} 加進樹，總權重 ${total}。${tail}`,
    primPushed: (v: string, list: string) => `再把 ${v} 連到樹外的邊放進堆積：${list}。`,
    primNoNew: (v: string) => `${v} 沒有連到樹外的新邊。`,
    primDone: (nodes: number, edges: number, total: number) =>
      `${nodes} 個節點都進了樹，共 ${edges} 條邊，總權重 ${total}，和 Kruskal 得到的一樣。每條邊最多進出堆積一次，O(E log E)；堆積裡剩下的邊不用再處理。`,
    opSort: "排序邊",
    opDone: "完成",
    opStart: "從 A 開始",
    opPop: (u: string, v: string) => `取出 ${u}–${v}`,
    totalWeight: (w: number) => `總權重 ${w}`,
    sep: "、",
    svgLabel: "最小生成樹示範圖",
    legendTree: "已選進生成樹",
    legendProbe: "這一步處理的邊",
    legendRejected: "丟掉的邊",
    legendMerged: "已和別人合併的節點",
    legendInTree: "已在樹裡的節點",
    sortedEdges: "依權重排序的邊",
    groups: "目前的分群",
    treeNodes: "樹裡的節點",
    heap: "最小堆積（由小到大）",
    heapNote: "刪除線是另一端已經在樹裡、之後取出會被丟掉的邊",
  },
  {
    en: {
      kruskalIntro: (e: number) =>
        `Kruskal starts by sorting all ${e} edges by weight, lightest first (see the edge list). Every node begins in a group of its own and no edge has been chosen yet. Then it walks the sorted list: if the endpoints are in different groups, take the edge and merge the groups; if they are already in the same group, throw it away, because it would close a cycle.`,
      kruskalTake: (a: string, b: string, w: number, count: number, total: number) =>
        `${a}–${b} (${w}): ${a} and ${b} were in different groups, so take this edge and merge the two groups. ${count} edge${count === 1 ? "" : "s"} chosen, total weight ${total}.`,
      kruskalReject: (a: string, b: string, w: number, group: string) =>
        `${a}–${b} (${w}): ${a} and ${b} are already in the same group (${group}), so a path between them exists and this edge would close a cycle. Throw it away (shown dashed).`,
      kruskalDone: (picked: number, rest: number, list: string, total: number) =>
        `That is V − 1 = ${picked} edges and every node is now in a single group, so the remaining ${rest} edge${rest === 1 ? "" : "s"} (${list}) never have to be looked at. The minimum spanning tree has total weight ${total}. Sorting at O(E log E) dominates the cost; the union-find operations are close to constant time.`,
      primIntro: (list: string) =>
        `Prim can start anywhere, and here it starts at A. The tree holds only A, so every edge from A to a node outside the tree goes into a min-heap: ${list}. From here on, each step pops the cheapest edge from the heap.`,
      primStale: (u: string, v: string, w: number) =>
        `Pop ${u}–${v} (${w}), but ${v} is already in the tree. This entry is stale — both endpoints are inside the tree now — so throw it away. Checking only at pop time is called lazy Prim, and it keeps the code as simple as possible.`,
      primTake: (u: string, v: string, w: number, total: number, tail: string) =>
        `Pop ${u}–${v} (${w}): this is the cheapest edge joining the tree to a node outside it, so ${v} joins the tree and the total weight becomes ${total}.${tail ? ` ${tail}` : ""}`,
      primPushed: (v: string, list: string) => `Now push the edges from ${v} to nodes outside the tree: ${list}.`,
      primNoNew: (v: string) => `${v} has no new edges leading outside the tree.`,
      primDone: (nodes: number, edges: number, total: number) =>
        `All ${nodes} nodes are in the tree, joined by ${edges} edges with total weight ${total} — the same tree Kruskal found. Each edge enters and leaves the heap at most once, so O(E log E); whatever is left on the heap is never processed.`,
      opSort: "Sort edges",
      opDone: "Done",
      opStart: "Start at A",
      opPop: (u: string, v: string) => `Pop ${u}–${v}`,
      totalWeight: (w: number) => `total weight ${w}`,
      sep: ", ",
      svgLabel: "Minimum spanning tree demo graph",
      legendTree: "Chosen for the spanning tree",
      legendProbe: "Edge handled this step",
      legendRejected: "Discarded edge",
      legendMerged: "Node merged with another group",
      legendInTree: "Node already in the tree",
      sortedEdges: "Edges sorted by weight",
      groups: "Current groups",
      treeNodes: "Nodes in the tree",
      heap: "Min-heap (cheapest first)",
      heapNote: "A struck-through edge leads to a node already in the tree, so it is discarded when popped.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  op: string;
  tree: string[];            // 已選的邊（key）
  rejected: string[];        // Kruskal：因成環被丟掉；Prim：從堆積彈出後丟掉
  probe: string | null;
  /** Kruskal：目前的分群 */
  groups?: string[][];
  /** Kruskal：邊的處理進度 */
  cursor?: number;
  /** Prim：已在樹裡的節點與堆積內容 */
  inTree?: string[];
  heap?: [number, string, string][];
  added?: string | null;
  total: number;
  done?: boolean;
}

function buildKruskal(t: T): Step[] {
  const steps: Step[] = [];
  const sorted = [...EDGES].sort((x, y) => x[2] - y[2]);
  const parent: Record<string, string> = Object.fromEntries(NODES.map((n) => [n, n]));
  const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const tree: string[] = [];
  const rejected: string[] = [];
  let total = 0;
  const groups = () => {
    const g: Record<string, string[]> = {};
    NODES.forEach((n) => (g[find(n)] ??= []).push(n));
    return Object.values(g);
  };
  const snap = (desc: string, op: string, probe: string | null, cursor: number, done = false) =>
    steps.push({ desc, op, tree: [...tree], rejected: [...rejected], probe, groups: groups(), cursor, total, done });

  snap(t.kruskalIntro(EDGES.length), t.opSort, null, -1);
  for (let i = 0; i < sorted.length; i++) {
    const [a, b, w] = sorted[i];
    const ra = find(a), rb = find(b);
    if (ra !== rb) {
      parent[ra] = rb;
      tree.push(key(a, b));
      total += w;
      snap(t.kruskalTake(a, b, w, tree.length, total), `${a}–${b}`, key(a, b), i);
      if (tree.length === NODES.length - 1) {
        snap(t.kruskalDone(NODES.length - 1, sorted.length - i - 1, sorted.slice(i + 1).map(([x, y, ww]) => `${x}–${y} ${ww}`).join(t.sep), total), t.opDone, null, i, true);
        break;
      }
    } else {
      rejected.push(key(a, b));
      snap(t.kruskalReject(a, b, w, groups().find((g) => g.includes(a))!.join(t.sep)), `${a}–${b}`, key(a, b), i);
    }
  }
  return steps;
}

function buildPrim(t: T): Step[] {
  const steps: Step[] = [];
  const inTree: string[] = [];
  const tree: string[] = [];
  const rejected: string[] = [];
  const heap: [number, string, string][] = [];
  let total = 0;
  const sortHeap = () => heap.sort((x, y) => x[0] - y[0] || x[2].localeCompare(y[2]));
  const snap = (desc: string, op: string, probe: string | null, added: string | null = null, done = false) =>
    steps.push({ desc, op, tree: [...tree], rejected: [...rejected], probe, inTree: [...inTree], heap: heap.map((h) => [...h] as [number, string, string]), added, total, done });
  const pushEdges = (u: string) => {
    const pushed: string[] = [];
    for (const [a, b, w] of EDGES) {
      const v = a === u ? b : b === u ? a : null;
      if (v && !inTree.includes(v)) { heap.push([w, u, v]); pushed.push(`${u}–${v} ${w}`); }
    }
    sortHeap();
    return pushed;
  };

  inTree.push("A");
  const first = pushEdges("A");
  snap(t.primIntro(first.join(t.sep)), t.opStart, null, "A");
  while (inTree.length < NODES.length && heap.length) {
    const [w, u, v] = heap.shift()!;
    if (inTree.includes(v)) {
      rejected.push(key(u, v));
      snap(t.primStale(u, v, w), t.opPop(u, v), key(u, v));
      continue;
    }
    inTree.push(v);
    tree.push(key(u, v));
    total += w;
    const pushed = pushEdges(v);
    const last = inTree.length === NODES.length;
    const tail = last ? "" : pushed.length ? t.primPushed(v, pushed.join(t.sep)) : t.primNoNew(v);
    snap(t.primTake(u, v, w, total, tail), t.opPop(u, v), key(u, v), v);
  }
  snap(t.primDone(NODES.length, tree.length, total), t.opDone, null, null, true);
  return steps;
}

export function MstDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const kruskal = useMemo(() => buildKruskal(t), [t]);
  const prim = useMemo(() => buildPrim(t), [t]);
  const [mode, setMode] = useState<Mode>("kruskal");
  const [k, setK] = useState(0);
  const steps = mode === "kruskal" ? kruskal : prim;
  const s = steps[Math.min(k, steps.length - 1)];
  const switchMode = (m: Mode) => { setMode(m); setK(0); };
  const sorted = useMemo(() => [...EDGES].sort((x, y) => x[2] - y[2]), []);

  const nodeState = (n: string) => {
    if (mode === "prim") return s.added === n ? "c" : s.inTree?.includes(n) ? "q" : "";
    if (s.probe && s.probe.includes(n)) return "c";
    const group = s.groups?.find((g) => g.includes(n));
    return group && group.length > 1 ? "q" : "";
  };

  return (
    <div className="@container overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={Math.min(k, steps.length - 1)}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["kruskal", "prim"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "kruskal" ? "Kruskal" : "Prim"}
              </button>
            ))}
          </div>
        }
        right={<span className="font-mono">{s.op} · {t.totalWeight(s.total)}</span>}
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-accent align-[3px]" />{t.legendTree}</span>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-amber align-[3px]" />{t.legendProbe}</span>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block w-4 border-t-2 border-dashed border-line-strong align-[3px]" />{t.legendRejected}</span>
        <Legend cls="border-amber bg-amber-soft">{mode === "kruskal" ? t.legendMerged : t.legendInTree}</Legend>
      </div>

      <div className="grid grid-cols-1 @[640px]:grid-cols-[minmax(0,1fr)_220px]">
        <svg viewBox="0 0 480 270" role="img" aria-label={t.svgLabel} className="block h-auto w-full">
          {EDGES.map(([a, b, w]) => {
            const id = key(a, b);
            const [x1, y1] = POS[a], [x2, y2] = POS[b];
            const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
            const inTree = s.tree.includes(id), probe = s.probe === id, rej = s.rejected.includes(id) && !probe;
            const stroke = probe ? "var(--amber)" : inTree ? "var(--accent)" : "var(--line-strong)";
            const mx = (x1 + x2) / 2 + (-dy / len) * 11, my = (y1 + y2) / 2 + (dx / len) * 11;
            return (
              <g key={id} opacity={rej ? 0.55 : 1}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={probe ? 3.5 : inTree ? 3 : 1.5} strokeDasharray={rej ? "5 4" : undefined} />
                <rect x={mx - 9} y={my - 7} width="18" height="14" rx="3" fill="var(--surface)" />
                <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize="11" fontFamily="var(--font-mono)" fill={probe ? "var(--amber)" : inTree ? "var(--accent)" : "var(--ink-2)"} fontWeight={probe || inTree ? 600 : 400}>{w}</text>
              </g>
            );
          })}
          {NODES.map((n) => {
            const [x, y] = POS[n];
            return (
              <g key={n} className={`node ${nodeState(n)}`}>
                <circle cx={x} cy={y} r="18" />
                <text className="lbl" x={x} y={y}>{n}</text>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-col gap-3 border-t border-line p-4 text-[13px] @[640px]:border-t-0 @[640px]:border-l">
          {mode === "kruskal" ? (
            <>
              <div>
                <div className="eyebrow mb-1.5">{t.sortedEdges}</div>
                <div className="flex flex-wrap gap-1 @[640px]:flex-col">
                  {sorted.map(([a, b, w], i) => {
                    const id = key(a, b);
                    const tone = s.probe === id ? CELL.amber : s.tree.includes(id) ? CELL.green : s.rejected.includes(id) ? `${CELL.dim} line-through` : i > (s.cursor ?? -1) && s.done ? CELL.dim : "border-line-strong bg-surface text-ink";
                    return <span key={id} className={`rounded-md border px-2 py-0.5 font-mono text-[12px] ${tone}`}>{a}–{b} · {w}</span>;
                  })}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-1.5">{t.groups}</div>
                <div className="flex flex-wrap gap-1 font-mono text-[12px]">
                  {s.groups?.map((g) => <span key={g.join("")} className={`rounded-md border px-2 py-0.5 ${g.length > 1 ? CELL.amber : "border-line bg-surface-2 text-ink-3"}`}>{`{${g.join(", ")}}`}</span>)}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="eyebrow mb-1.5">{t.treeNodes}</div>
                <div className="font-mono text-[12.5px]">{s.inTree?.join(t.sep)}</div>
              </div>
              <div>
                <div className="eyebrow mb-1.5">{t.heap}</div>
                <div className="flex flex-wrap gap-1">
                  {s.heap?.length ? s.heap.map(([w, u, v], i) => (
                    <span key={`${u}${v}${i}`} className={`rounded-md border px-2 py-0.5 font-mono text-[12px] ${s.inTree?.includes(v) ? `${CELL.dim} line-through` : i === 0 && !s.done ? CELL.amber : "border-line-strong bg-surface text-ink"}`}>{u}–{v} · {w}</span>
                  )) : <span className="text-[12px] text-ink-3">{ui.demo.empty}</span>}
                </div>
                <div className="mt-1 text-[11.5px] text-ink-3">{t.heapNote}</div>
              </div>
            </>
          )}
        </div>
      </div>

      <StepFooter k={Math.min(k, steps.length - 1)} total={steps.length}>{s.desc}</StepFooter>
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
