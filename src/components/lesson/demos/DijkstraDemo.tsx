"use client";

import { useMemo, useState, type ReactNode } from "react";
import { StepHeader, StepFooter } from "./StepBar";

const POS: Record<string, [number, number]> = { A: [60, 130], B: [190, 50], C: [190, 210], D: [350, 90], E: [370, 220], F: [540, 140] };
const NODES = Object.keys(POS);
/** 無向帶權圖：路口與路段所需分鐘數 */
const EDGES: [string, string, number][] = [["A", "B", 4], ["A", "C", 2], ["B", "C", 1], ["B", "D", 5], ["C", "D", 8], ["C", "E", 10], ["D", "E", 2], ["D", "F", 6], ["E", "F", 5]];
const INF = Number.POSITIVE_INFINITY;

interface Step {
  desc: string;
  op: string;
  dist: Record<string, number>;
  pq: [number, string][];
  cur: string | null;
  done: string[];
  probe: [string, string] | null;
  /** 這一步被鬆弛成功的節點 */
  hot: string | null;
  parent: Record<string, string>;
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const adj: Record<string, [string, number][]> = Object.fromEntries(NODES.map((n) => [n, []]));
  EDGES.forEach(([u, v, w]) => { adj[u].push([v, w]); adj[v].push([u, w]); });
  const dist: Record<string, number> = Object.fromEntries(NODES.map((n) => [n, INF]));
  const parent: Record<string, string> = {};
  const done: string[] = [];
  const pq: [number, string][] = [];
  const push = (d: number, n: string) => { pq.push([d, n]); pq.sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1])); };
  const snap = (desc: string, op: string, cur: string | null = null, probe: [string, string] | null = null, hot: string | null = null) =>
    steps.push({ desc, op, dist: { ...dist }, pq: pq.map((x) => [...x] as [number, string]), cur, done: [...done], probe, hot, parent: { ...parent } });

  snap("所有節點的距離先設為 ∞。優先佇列裡放 (距離, 節點)，永遠讓距離最小的排在最前面。", "初始化");
  dist.A = 0;
  push(0, "A");
  snap("起點 A 的距離設為 0，把 (0, A) 放入優先佇列。", "初始化");
  while (pq.length) {
    const [d, u] = pq.shift()!;
    if (done.includes(u)) {
      snap(`取出 (${d}, ${u})，但 ${u} 已經確定過了，這是舊的紀錄，直接跳過。`, `取出 ${u}`, null);
      continue;
    }
    done.push(u);
    const known = adj[u].filter(([v]) => done.includes(v)).map(([v]) => v);
    const note = known.length === 0 ? "" : known.length === adj[u].length ? `鄰居 ${known.join("、")} 都已確定，沒有邊需要鬆弛。` : `鄰居 ${known.join("、")} 已確定，不用再看。`;
    snap(`取出距離最小的 (${d}, ${u})。所有還沒確定的節點距離都 ≥ ${d}，而且邊權非負，所以 ${u} 不可能再更短：dist[${u}] = ${d} 確定。${note}`, `取出 ${u}`, u);
    for (const [v, w] of adj[u]) {
      if (done.includes(v)) continue;
      const nd = d + w;
      if (nd < dist[v]) {
        const old = dist[v];
        dist[v] = nd;
        parent[v] = u;
        push(nd, v);
        snap(`鬆弛邊 ${u} – ${v}（權重 ${w}）：${d} + ${w} = ${nd} ${old === INF ? "< ∞" : `< ${old}`}，更新 dist[${v}] = ${nd}，把 (${nd}, ${v}) 放入優先佇列。`, `取出 ${u}`, u, [u, v], v);
      } else {
        snap(`鬆弛邊 ${u} – ${v}（權重 ${w}）：${d} + ${w} = ${nd} ≥ ${dist[v]}，沒有更短，不更新。`, `取出 ${u}`, u, [u, v]);
      }
    }
  }
  snap(`優先佇列為空，所有節點的最短距離都確定了。從 A 到 F 最短是 ${dist.F}，沿 parent 往回走就是路徑。`, "結束");
  return steps;
}

function path(parent: Record<string, string>, t: string): string[] {
  const out = [t];
  let cur = t;
  while (parent[cur]) { cur = parent[cur]; out.unshift(cur); }
  return out;
}

export function DijkstraDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const last = k === steps.length - 1;
  const finalPath = last ? path(s.parent, "F") : [];
  const onPath = (a: string, b: string) => finalPath.some((n, i) => i > 0 && ((finalPath[i - 1] === a && n === b) || (finalPath[i - 1] === b && n === a)));
  const isTree = (a: string, b: string) => s.parent[b] === a || s.parent[a] === b;
  const fmt = (d: number) => (d === INF ? "∞" : String(d));

  return (
    <div className="@container overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right="起點 A · 邊上的數字是分鐘數" />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        <Legend cls="border-line-strong bg-[var(--node-fill)]">未發現</Legend>
        <Legend cls="border-amber bg-amber-soft">在優先佇列中</Legend>
        <Legend cls="border-accent bg-accent">處理中</Legend>
        <Legend cls="border-ink bg-ink">已確定</Legend>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-accent align-[3px]" />目前最短路徑樹</span>
      </div>

      <div className="grid grid-cols-1 @[640px]:grid-cols-[minmax(0,1fr)_230px]">
        <svg viewBox="0 0 600 260" role="img" aria-label="Dijkstra 示範圖" className="block h-auto w-full">
          {EDGES.map(([a, b, w]) => {
            const [x1, y1] = POS[a], [x2, y2] = POS[b];
            const probe = s.probe !== null && ((s.probe[0] === a && s.probe[1] === b) || (s.probe[0] === b && s.probe[1] === a));
            const tree = isTree(a, b);
            const fin = last && onPath(a, b);
            const stroke = fin ? "var(--green)" : probe ? "var(--amber)" : tree ? "var(--accent)" : "var(--line-strong)";
            return (
              <g key={a + b}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={fin || probe ? 3.5 : tree ? 2.5 : 1.5} strokeDasharray={probe && !tree ? "5 4" : undefined} />
                <rect x={(x1 + x2) / 2 - 9} y={(y1 + y2) / 2 - 8} width="18" height="15" rx="3" fill="var(--surface)" />
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2} textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontFamily="var(--font-mono)" fill={probe ? "var(--amber)" : "var(--ink-2)"} fontWeight={probe ? 600 : 400}>{w}</text>
              </g>
            );
          })}
          {NODES.map((n) => {
            const [x, y] = POS[n];
            const inPq = s.pq.some(([, v]) => v === n);
            const state = s.cur === n ? "c" : s.done.includes(n) ? "v" : inPq ? "q" : "";
            return (
              <g key={n} className={`node ${state}`}>
                <circle cx={x} cy={y} r="18" />
                <text className="lbl" x={x} y={y}>{n}</text>
                <text className="dist" x={x} y={y + 31} stroke="var(--surface)" strokeWidth={3} strokeLinejoin="round" paintOrder="stroke" style={s.hot === n ? { fill: "var(--accent)", fontWeight: 600 } : undefined}>d={fmt(s.dist[n])}</text>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-col gap-3.5 border-t border-line p-4 text-[13px] @[640px]:border-t-0 @[640px]:border-l">
          <div>
            <div className="eyebrow mb-1.5">距離表</div>
            <div className="grid grid-cols-6 gap-1 font-mono text-[12px] tabular-nums">
              {NODES.map((n) => (
                <div key={n} className="text-center">
                  <div className="mb-0.5 text-[10.5px] text-ink-3">{n}</div>
                  <div className={`grid h-7 place-items-center rounded-md border ${s.hot === n ? "border-accent bg-accent text-accent-ink" : s.done.includes(n) ? "border-ink bg-ink text-bg" : "border-line-strong bg-surface"}`}>{fmt(s.dist[n])}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1.5">優先佇列（小 → 大）</div>
            <div className="flex min-h-[30px] flex-wrap gap-1.5">
              {s.pq.length ? (
                s.pq.map(([d, n], i) => (
                  <span key={`${d}-${n}-${i}`} className={`grid h-7 place-items-center rounded-md border px-1.5 font-mono text-[12px] ${s.done.includes(n) ? "border-line bg-surface-2 text-ink-3 line-through" : "border-amber bg-amber-soft text-amber"}`}>({d}, {n})</span>
                ))
              ) : (
                <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-7 text-ink-3">空</span>
              )}
            </div>
            <div className="mt-1 text-[11.5px] text-ink-3">劃掉的是已經確定節點的舊紀錄，取出時會被跳過</div>
          </div>
          {last && (
            <div>
              <div className="eyebrow mb-1.5">A → F 最短路徑</div>
              <div className="font-mono text-[12.5px] text-green">{finalPath.join(" → ")}<span className="ml-2 text-ink-3">= {s.dist.F}</span></div>
            </div>
          )}
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
