"use client";

import { useState } from "react";
import { BTN } from "./StepBar";

const NODES = ["A", "B", "C", "D", "E"];
const POS: Record<string, [number, number]> = { A: [70, 60], B: [200, 30], C: [330, 70], D: [130, 160], E: [280, 170] };
/** 有向邊 from → to，含權重 */
const EDGES: [string, string, number][] = [["A", "B", 4], ["A", "D", 1], ["B", "C", 2], ["B", "E", 5], ["D", "E", 3], ["E", "C", 1]];

export function AdjacencyDemo() {
  const [directed, setDirected] = useState(false);
  const [weighted, setWeighted] = useState(false);
  const [pick, setPick] = useState<string | null>("B");

  const edges = directed ? EDGES : EDGES.flatMap(([a, b, w]) => [[a, b, w], [b, a, w]] as [string, string, number][]);
  const list: Record<string, [string, number][]> = Object.fromEntries(NODES.map((n) => [n, []]));
  edges.forEach(([a, b, w]) => list[a].push([b, w]));
  const matrix = NODES.map((a) => NODES.map((b) => edges.find(([x, y]) => x === a && y === b)?.[2] ?? 0));
  const E = EDGES.length;
  const isHot = (a: string, b: string) => pick !== null && (a === pick || (!directed && b === pick));

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1">
          <button type="button" className={`${BTN} ${!directed ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => setDirected(false)}>無向</button>
          <button type="button" className={`${BTN} ${directed ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => setDirected(true)}>有向</button>
        </div>
        <button type="button" className={`${BTN} ${weighted ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => setWeighted((x) => !x)}>{weighted ? "帶權重" : "無權重"}</button>
        <span className="ml-auto text-[12px] text-ink-3">點節點看它的鄰居 · V = 5、E = {E}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 400 210" className="block h-auto w-full" role="img" aria-label="範例圖">
          <defs><marker id="adj-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" /></marker></defs>
          {EDGES.map(([a, b, w]) => {
            const [x1, y1] = POS[a], [x2, y2] = POS[b];
            const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
            const ex = x2 - (dx / len) * 20, ey = y2 - (dy / len) * 20;
            const hot = isHot(a, b) || (!directed && isHot(b, a));
            return (
              <g key={a + b}>
                <line x1={x1} y1={y1} x2={directed ? ex : x2} y2={directed ? ey : y2} stroke={hot ? "var(--accent)" : "var(--line-strong)"} strokeWidth={hot ? 2.5 : 1.5} markerEnd={directed ? "url(#adj-arrow)" : undefined} />
                {weighted && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 5} textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--ink-2)">{w}</text>}
              </g>
            );
          })}
          {NODES.map((n) => {
            const [x, y] = POS[n];
            const me = pick === n;
            const nb = pick !== null && list[pick].some(([b]) => b === n);
            return (
              <g key={n} onClick={() => setPick(n)} className="cursor-pointer">
                <circle cx={x} cy={y} r="17" fill={me ? "var(--accent)" : nb ? "var(--accent-soft)" : "var(--surface)"} stroke={me || nb ? "var(--accent)" : "var(--line-strong)"} strokeWidth={me || nb ? 2 : 1.5} />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fontFamily="var(--font-mono)" fill={me ? "var(--accent-ink)" : "var(--ink)"}>{n}</text>
              </g>
            );
          })}
        </svg>

        <div className="grid grid-cols-1 gap-3 border-t border-line p-3.5 text-[12.5px] sm:grid-cols-2 lg:border-t-0 lg:border-l">
          <div>
            <div className="eyebrow mb-1.5">鄰接串列 · {edges.length} 筆</div>
            <div className="space-y-0.5 font-mono">
              {NODES.map((n) => (
                <div key={n} className={`flex gap-2 rounded px-1.5 py-0.5 ${pick === n ? "bg-accent-soft" : ""}`}>
                  <span className="w-4 text-ink-3">{n}</span>
                  <span>→ [{list[n].map(([b, w]) => (weighted ? `${b}:${w}` : b)).join(", ")}]</span>
                </div>
              ))}
            </div>
            <div className="mt-1.5 text-[11.5px] text-ink-3">空間 O(V + E)，找鄰居直接讀那一列</div>
          </div>
          <div>
            <div className="eyebrow mb-1.5">鄰接矩陣 · {NODES.length * NODES.length} 格</div>
            <table className="font-mono tabular-nums">
              <thead><tr><th />{NODES.map((n) => <th key={n} className={`w-7 text-center font-medium ${pick === n ? "text-accent" : "text-ink-3"}`}>{n}</th>)}</tr></thead>
              <tbody>
                {NODES.map((a, i) => (
                  <tr key={a} className={pick === a ? "bg-accent-soft" : ""}>
                    <th className={`pr-1 text-left font-medium ${pick === a ? "text-accent" : "text-ink-3"}`}>{a}</th>
                    {matrix[i].map((v, j) => <td key={j} className={`h-6 w-7 text-center ${v ? "text-ink" : "text-line-strong"}`}>{v ? (weighted ? v : 1) : "·"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-1.5 text-[11.5px] text-ink-3">空間 O(V²)，查兩點是否相鄰 O(1)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
