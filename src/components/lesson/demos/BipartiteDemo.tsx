"use client";

import { useMemo, useState, type ReactNode } from "react";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";

const POS: Record<string, [number, number]> = { A: [70, 130], B: [200, 50], C: [340, 50], D: [200, 210], E: [480, 90], F: [480, 210] };
const NODES = Object.keys(POS);
type Mode = "ok" | "odd";
/** 可二分：只有偶數環 */
const EDGES_OK: [string, string][] = [["A", "B"], ["A", "D"], ["B", "C"], ["C", "D"], ["C", "E"], ["D", "F"], ["E", "F"]];
/** 不可二分：C–D–E 是三角形（奇環） */
const EDGES_ODD: [string, string][] = [["A", "B"], ["A", "D"], ["B", "C"], ["C", "D"], ["C", "E"], ["D", "E"], ["E", "F"]];

interface Step {
  desc: string;
  color: Record<string, number>;
  queue: string[];
  cur: string | null;
  probe: [string, string] | null;
  conflict: [string, string] | null;
  /** 衝突時：兩條染色路徑加上衝突邊圍成的奇環，依序列出節點 */
  cycle: string[];
  tree: [string, string][];
  done: string[];
}

function buildSteps(edges: [string, string][]): Step[] {
  const steps: Step[] = [];
  const adj: Record<string, string[]> = Object.fromEntries(NODES.map((n) => [n, []]));
  edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u); });
  Object.values(adj).forEach((l) => l.sort());
  const color: Record<string, number> = {};
  const queue: string[] = [];
  const done: string[] = [];
  const tree: [string, string][] = [];
  const parent: Record<string, string> = {};
  const snap = (desc: string, cur: string | null = null, probe: [string, string] | null = null, conflict: [string, string] | null = null, cycle: string[] = []) =>
    steps.push({ desc, color: { ...color }, queue: [...queue], cur, probe, conflict, cycle, tree: [...tree], done: [...done] });
  /** 從 x 沿著染色時的 parent 往回走到起點 */
  const up = (x: string) => { const p = [x]; while (parent[p[p.length - 1]]) p.push(parent[p[p.length - 1]]); return p; };

  snap("目標：把每個節點塗成 0 或 1，讓每條邊的兩端不同色。從 A 開始 BFS。");
  color.A = 0;
  queue.push("A");
  snap("A 塗成 0，放入佇列。", null);
  while (queue.length) {
    const u = queue.shift()!;
    snap(`取出 ${u}（顏色 ${color[u]}），它的鄰居都必須是 ${1 - color[u]}。`, u);
    for (const v of adj[u]) {
      if (!(v in color)) {
        color[v] = 1 - color[u];
        queue.push(v);
        tree.push([u, v]);
        parent[v] = u;
        snap(`鄰居 ${v} 還沒塗色：塗成 ${color[v]}，放入佇列。`, u, [u, v]);
      } else if (color[v] === color[u]) {
        const pu = up(u), pv = up(v);
        const w = pu.find((x) => pv.includes(x))!;
        const cycle = [...pu.slice(0, pu.indexOf(w) + 1), ...pv.slice(0, pv.indexOf(w)).reverse()];
        snap(`鄰居 ${v} 已經是 ${color[v]}，和 ${u} 同色，圖不是二分圖。證據：${u} 往回的染色路徑 ${pu.slice(0, pu.indexOf(w) + 1).join("–")} 和 ${v} 的 ${pv.slice(0, pv.indexOf(w) + 1).join("–")} 在 ${w} 會合，加上邊 ${u}–${v} 圍成長度 ${cycle.length} 的奇環。`, u, [u, v], [u, v], cycle);
        return steps;
      } else {
        snap(`鄰居 ${v} 已經是 ${color[v]}，和 ${u} 不同色，符合規則。`, u, [u, v]);
      }
    }
    done.push(u);
  }
  snap(`佇列為空，每條邊兩端都不同色，圖是二分圖。顏色 0 的一組：${NODES.filter((n) => color[n] === 0).join("、")}；顏色 1 的一組：${NODES.filter((n) => color[n] === 1).join("、")}。`);
  return steps;
}

export function BipartiteDemo() {
  const okSteps = useMemo(() => buildSteps(EDGES_OK), []);
  const oddSteps = useMemo(() => buildSteps(EDGES_ODD), []);
  const [mode, setMode] = useState<Mode>("ok");
  const [k, setK] = useState(0);
  const steps = mode === "ok" ? okSteps : oddSteps;
  const edges = mode === "ok" ? EDGES_OK : EDGES_ODD;
  const s = steps[k];
  const switchMode = (m: Mode) => { setMode(m); setK(0); };
  const eq = (a: [string, string], b: [string, string]) => (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);

  return (
    <div className="@container overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["ok", "odd"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "ok" ? "例子 1：可二分" : "例子 2：含奇環"}
              </button>
            ))}
          </div>
        }
        right="BFS 兩色染色 · 從 A 開始"
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        <Legend cls="border-line-strong bg-[var(--node-fill)]">未染色</Legend>
        <Legend cls="border-accent bg-accent-soft">顏色 0</Legend>
        <Legend cls="border-green bg-green-soft">顏色 1</Legend>
        <Legend cls="border-amber bg-[var(--node-fill)] border-2">在佇列中（黃框）</Legend>
        <Legend cls="border-ink bg-[var(--node-fill)] border-2">處理中（粗框）</Legend>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-accent align-[3px]" />染色走過的邊</span>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-amber align-[3px]" />奇環（最粗的是衝突邊）</span>
      </div>

      <div className="grid grid-cols-1 @[640px]:grid-cols-[minmax(0,1fr)_220px]">
        <svg viewBox="0 0 560 260" role="img" aria-label="二分圖判定示範圖" className="block h-auto w-full">
          {edges.map((e) => {
            const [a, b] = e;
            const [x1, y1] = POS[a], [x2, y2] = POS[b];
            const conflict = s.conflict !== null && eq(s.conflict, e);
            const onCycle = s.cycle.some((x, i) => eq([x, s.cycle[(i + 1) % s.cycle.length]], e));
            const probe = s.probe !== null && eq(s.probe, e);
            const tree = s.tree.some((t) => eq(t, e));
            return (
              <line
                key={a + b}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={onCycle ? "var(--amber)" : probe || tree ? "var(--accent)" : "var(--line-strong)"}
                strokeWidth={conflict ? 4 : onCycle ? 3 : probe || tree ? 2.5 : 1.5}
                strokeDasharray={probe && !tree && !conflict ? "5 4" : undefined}
              />
            );
          })}
          {NODES.map((n) => {
            const [x, y] = POS[n];
            const c = s.color[n];
            const fill = c === 0 ? "var(--accent-soft)" : c === 1 ? "var(--green-soft)" : "var(--node-fill)";
            const inQ = s.queue.includes(n);
            const isCur = s.cur === n;
            const stroke = isCur ? "var(--ink)" : inQ ? "var(--amber)" : c === 0 ? "var(--accent)" : c === 1 ? "var(--green)" : "var(--line-strong)";
            const text = c === 0 ? "var(--accent)" : c === 1 ? "var(--green)" : "var(--ink)";
            return (
              <g key={n}>
                <circle cx={x} cy={y} r="18" fill={fill} stroke={stroke} strokeWidth={isCur ? 3 : inQ ? 2.5 : c === undefined ? 1.5 : 2} />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fontFamily="var(--font-mono)" fill={text}>{n}</text>
                {c !== undefined && <text x={x} y={y + 31} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-3)">色 {c}</text>}
              </g>
            );
          })}
        </svg>

        <div className="flex flex-row gap-3.5 border-t border-line p-4 text-[13px] @[640px]:flex-col @[640px]:border-t-0 @[640px]:border-l">
          <div className="flex-1">
            <div className="eyebrow mb-1.5">佇列（前 → 後）</div>
            <Cells items={s.queue} tone={() => CELL.amber} w="w-7" />
          </div>
          <div className="flex-1">
            <div className="eyebrow mb-1.5">兩組</div>
            <div className="space-y-1 font-mono text-[12.5px]">
              <div><span className="mr-1.5 text-accent">0</span>{NODES.filter((n) => s.color[n] === 0).join(" ") || <span className="font-sans text-ink-3">空</span>}</div>
              <div><span className="mr-1.5 text-green">1</span>{NODES.filter((n) => s.color[n] === 1).join(" ") || <span className="font-sans text-ink-3">空</span>}</div>
            </div>
            {s.conflict && <div className="mt-1.5 text-[12.5px] font-semibold text-amber">衝突：{s.conflict[0]} – {s.conflict[1]}</div>}
            {s.cycle.length > 0 && <div className="mt-0.5 font-mono text-[12px] text-amber">奇環 {[...s.cycle, s.cycle[0]].join("–")}</div>}
          </div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
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
