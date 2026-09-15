"use client";

import { useMemo, useState, type ReactNode } from "react";
import { StepHeader, StepFooter, BTN } from "./StepBar";

const POS: Record<string, [number, number]> = { S: [60, 130], A: [220, 50], B: [220, 210], C: [420, 50], D: [420, 210] };
const NODES = Object.keys(POS);
type Mode = "plain" | "negcycle";
/** 有向帶權圖，含負權邊，沒有負環 */
const EDGES_PLAIN: [string, string, number][] = [["S", "A", 6], ["S", "B", 7], ["A", "C", 5], ["A", "B", 8], ["A", "D", -4], ["B", "C", -3], ["B", "D", 9], ["C", "A", -2], ["D", "C", 7], ["D", "S", 2]];
/** 把 C → A 改成 -5，A → D → C → A 的總權重變成 -4 + 7 - 5 = -2，是負環 */
const EDGES_NEG: [string, string, number][] = EDGES_PLAIN.map(([u, v, w]) => (u === "C" && v === "A" ? [u, v, -5] : [u, v, w]));
const INF = Number.POSITIVE_INFINITY;
/** 權重標籤的位置：[沿邊的比例, 1 放在行進方向右側、-1 放左側]。A→D 與 B→C 在正中間交叉、D→S 橫越中間，個別挪開才不會疊在一起 */
const LABEL_AT: Record<string, [number, number]> = { AD: [0.3, 1], BC: [0.35, -1], DS: [0.78, 1] };

interface Step {
  desc: string;
  op: string;
  round: number;
  dist: Record<string, number>;
  /** 這一步更新的節點 */
  hot: string | null;
  probe: [string, string] | null;
  /** 本輪至今鬆弛成功的邊 */
  relaxed: [string, string][];
  parent: Record<string, string>;
  negCycle: [string, string][];
  finished: boolean;
}

function buildSteps(edges: [string, string, number][]): Step[] {
  const steps: Step[] = [];
  const V = NODES.length;
  const dist: Record<string, number> = Object.fromEntries(NODES.map((n) => [n, INF]));
  const parent: Record<string, string> = {};
  let relaxed: [string, string][] = [];
  let round = 0;
  const negCycle: [string, string][] = [];
  const snap = (desc: string, op: string, hot: string | null = null, probe: [string, string] | null = null, finished = false) =>
    steps.push({ desc, op, round, dist: { ...dist }, hot, probe, relaxed: [...relaxed], parent: { ...parent }, negCycle: [...negCycle], finished });
  const fmt = (d: number) => (d === INF ? "∞" : String(d));

  dist.S = 0;
  snap(`起點 S 設為 0，其餘 ∞。V = ${V}，最多鬆弛 V − 1 = ${V - 1} 輪，每輪把所有 ${edges.length} 條邊掃一遍。`, "初始化");
  let converged = false;
  for (round = 1; round <= V - 1 && !converged; round++) {
    relaxed = [];
    snap(`第 ${round} 輪開始：依序檢查每一條邊 u → v，若 dist[u] + w < dist[v] 就更新。`, `第 ${round} 輪`);
    for (const [u, v, w] of edges) {
      if (dist[u] === INF) continue;
      const nd = dist[u] + w;
      if (nd < dist[v]) {
        const old = dist[v];
        dist[v] = nd;
        parent[v] = u;
        relaxed.push([u, v]);
        snap(`邊 ${u} → ${v}（${w}）：${dist[u]} + ${w > 0 ? w : `(${w})`} = ${nd} < ${fmt(old)}，更新 dist[${v}] = ${nd}。`, `第 ${round} 輪`, v, [u, v]);
      }
    }
    if (relaxed.length === 0) {
      converged = true;
      snap(`第 ${round} 輪沒有任何邊能鬆弛，距離已經收斂，可以提前結束。`, `第 ${round} 輪`);
    } else {
      snap(`第 ${round} 輪結束，這輪鬆弛成功 ${relaxed.length} 次。經過 ${round} 輪，凡是「最多用 ${round} 條邊」的路徑能達到的最短距離，都已經反映在距離表上。`, `第 ${round} 輪`);
    }
  }
  if (converged) {
    round = 0;
    snap(`結束。距離表：${NODES.map((n) => `${n}=${fmt(dist[n])}`).join("、")}。負權邊在 Dijkstra 會出錯，這裡沒問題。`, "結束", null, null, true);
    return steps;
  }
  round = V;
  relaxed = [];
  snap(`已經做完 V − 1 = ${V - 1} 輪。再做第 ${V} 輪檢查：若還有邊能鬆弛，表示存在越走越短的負環。`, `第 ${V} 輪（檢查）`);
  let cycleFrom: string | null = null;
  for (const [u, v, w] of edges) {
    if (dist[u] === INF) continue;
    if (dist[u] + w < dist[v]) {
      cycleFrom = v;
      parent[v] = u;
      relaxed.push([u, v]);
      snap(`邊 ${u} → ${v}（${w}）：${dist[u]} + ${w > 0 ? w : `(${w})`} = ${dist[u] + w} < ${dist[v]}，第 ${V} 輪還能鬆弛。有負環。`, `第 ${V} 輪（檢查）`, v, [u, v]);
      break;
    }
  }
  if (cycleFrom) {
    let x: string = cycleFrom;
    for (let i = 0; i < V; i++) x = parent[x];
    const start: string = x;
    const loop: string[] = [start];
    let y: string = parent[start];
    while (y !== start) { loop.unshift(y); y = parent[y]; }
    for (let i = 0; i < loop.length; i++) negCycle.push([loop[i], loop[(i + 1) % loop.length]]);
    snap(`沿 parent 往回走 V 步一定會落在負環上，再走一圈就把環找出來：${[...loop, loop[0]].join(" → ")}。在這個環上繞一圈總權重是負的，最短路徑沒有定義。`, "結束", null, null, true);
  } else {
    snap("第 V 輪沒有邊能鬆弛，沒有負環。", "結束", null, null, true);
  }
  return steps;
}

export function BellmanFordDemo() {
  const plain = useMemo(() => buildSteps(EDGES_PLAIN), []);
  const neg = useMemo(() => buildSteps(EDGES_NEG), []);
  const [mode, setMode] = useState<Mode>("plain");
  const [k, setK] = useState(0);
  const steps = mode === "plain" ? plain : neg;
  const edges = mode === "plain" ? EDGES_PLAIN : EDGES_NEG;
  const s = steps[k];
  const switchMode = (m: Mode) => { setMode(m); setK(0); };
  const fmt = (d: number) => (d === INF ? "∞" : String(d));
  const has = (list: [string, string][], a: string, b: string) => list.some(([x, y]) => x === a && y === b);

  return (
    <div className="@container overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["plain", "negcycle"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "plain" ? "例子 1：有負邊、無負環" : "例子 2：有負環"}
              </button>
            ))}
          </div>
        }
        right={<span className="font-mono">{s.op}</span>}
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        <Legend cls="border-line-strong bg-[var(--node-fill)]">距離仍是 ∞</Legend>
        <Legend cls="border-amber bg-amber-soft">已有距離（可能還會變）</Legend>
        <Legend cls="border-accent bg-accent">這一步被更新</Legend>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-accent align-[3px]" />本輪鬆弛成功的邊</span>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-amber align-[3px]" />負環</span>
      </div>

      <div className="grid grid-cols-1 @[640px]:grid-cols-[minmax(0,1fr)_230px]">
        <svg viewBox="0 0 500 260" role="img" aria-label="Bellman-Ford 示範圖" className="block h-auto w-full">
          <defs>
            <marker id="bf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--line-strong)" /></marker>
            <marker id="bf-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
            <marker id="bf-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--amber)" /></marker>
          </defs>
          {edges.map(([a, b, w]) => {
            const [cx1, cy1] = POS[a], [cx2, cy2] = POS[b];
            const dx = cx2 - cx1, dy = cy2 - cy1, len = Math.hypot(dx, dy);
            const nx = -dy / len, ny = dx / len;
            // 反向邊也存在（A→C 與 C→A）時，兩條線各往自己行進方向的右側平移，才不會疊成一條
            const off = edges.some(([p, q]) => p === b && q === a) ? 5 : 0;
            const x1 = cx1 + nx * off, y1 = cy1 + ny * off, x2 = cx2 + nx * off, y2 = cy2 + ny * off;
            const ex = x2 - (dx / len) * 21, ey = y2 - (dy / len) * 21;
            const [t, side] = LABEL_AT[a + b] ?? [0.5, 1];
            const probe = s.probe !== null && s.probe[0] === a && s.probe[1] === b;
            const neg = has(s.negCycle, a, b);
            const rel = has(s.relaxed, a, b);
            const stroke = neg ? "var(--amber)" : probe || rel ? "var(--accent)" : "var(--line-strong)";
            const marker = neg ? "url(#bf-arrow-amber)" : probe || rel ? "url(#bf-arrow-accent)" : "url(#bf-arrow)";
            const mx = x1 + dx * t + nx * 11 * side, my = y1 + dy * t + ny * 11 * side;
            return (
              <g key={a + b}>
                <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={stroke} strokeWidth={neg || probe ? 3 : rel ? 2.5 : 1.5} markerEnd={marker} />
                <rect x={mx - 10} y={my - 7} width="20" height="14" rx="3" fill="var(--surface)" />
                <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontFamily="var(--font-mono)" fill={w < 0 ? "var(--amber)" : "var(--ink-2)"} fontWeight={probe ? 600 : 400}>{w}</text>
              </g>
            );
          })}
          {NODES.map((n) => {
            const [x, y] = POS[n];
            const state = s.hot === n ? "c" : s.dist[n] !== INF ? "q" : "";
            return (
              <g key={n} className={`node ${state}`}>
                <circle cx={x} cy={y} r="18" />
                <text className="lbl" x={x} y={y}>{n}</text>
                <text className="dist" x={x} y={y < 130 ? y - 31 : y + 31} style={s.hot === n ? { fill: "var(--accent)", fontWeight: 600 } : undefined}>d={fmt(s.dist[n])}</text>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-col gap-3.5 border-t border-line p-4 text-[13px] @[640px]:border-t-0 @[640px]:border-l">
          <div>
            <div className="eyebrow mb-1.5">距離表{s.round > 0 ? `（第 ${s.round} 輪）` : ""}</div>
            <div className="grid grid-cols-5 gap-1 font-mono text-[12px] tabular-nums">
              {NODES.map((n) => (
                <div key={n} className="text-center">
                  <div className="mb-0.5 text-[10.5px] text-ink-3">{n}</div>
                  <div className={`grid h-7 place-items-center rounded-md border ${s.hot === n ? "border-accent bg-accent text-accent-ink" : s.dist[n] === INF ? "border-line bg-surface-2 text-ink-3" : "border-line-strong bg-surface"}`}>{fmt(s.dist[n])}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1.5">本輪鬆弛成功的邊</div>
            <div className="min-h-5 font-mono text-[12.5px]">
              {s.relaxed.length ? s.relaxed.map(([a, b]) => `${a}→${b}`).join("、") : <span className="font-sans text-ink-3">還沒有</span>}
            </div>
          </div>
          {s.finished && (
            <div>
              <div className="eyebrow mb-1.5">結論</div>
              <div className={`text-[12.5px] font-semibold ${s.negCycle.length ? "text-amber" : "text-green"}`}>{s.negCycle.length ? "偵測到負環" : "收斂，無負環"}</div>
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
