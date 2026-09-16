"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
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

const TEXT = demoText(
  {
    init: (v: number, edges: number) =>
      `起點 S 設為 0，其餘 ∞。V = ${v}，最多鬆弛 V − 1 = ${v - 1} 輪，每輪把所有 ${edges} 條邊掃一遍。`,
    roundStart: (round: number) => `第 ${round} 輪開始：依序檢查每一條邊 u → v，若 dist[u] + w < dist[v] 就更新。`,
    relax: (u: string, v: string, w: number, du: number, ws: string, nd: number, old: string) =>
      `邊 ${u} → ${v}（${w}）：${du} + ${ws} = ${nd} < ${old}，更新 dist[${v}] = ${nd}。`,
    converged: (round: number) => `第 ${round} 輪沒有任何邊能鬆弛，距離已經收斂，可以提前結束。`,
    roundEnd: (round: number, count: number) =>
      `第 ${round} 輪結束，這輪鬆弛成功 ${count} 次。經過 ${round} 輪，凡是「最多用 ${round} 條邊」的路徑能達到的最短距離，都已經反映在距離表上。`,
    finish: (list: string) => `結束。距離表：${list}。負權邊在 Dijkstra 會出錯，這裡沒問題。`,
    checkIntro: (v: number) => `已經做完 V − 1 = ${v - 1} 輪。再做第 ${v} 輪檢查：若還有邊能鬆弛，表示存在越走越短的負環。`,
    checkRelax: (u: string, v: string, w: number, du: number, ws: string, nd: number, dv: number, round: number) =>
      `邊 ${u} → ${v}（${w}）：${du} + ${ws} = ${nd} < ${dv}，第 ${round} 輪還能鬆弛。有負環。`,
    cycleFound: (loop: string) =>
      `沿 parent 往回走 V 步一定會落在負環上，再走一圈就把環找出來：${loop}。在這個環上繞一圈總權重是負的，最短路徑沒有定義。`,
    noCycle: "第 V 輪沒有邊能鬆弛，沒有負環。",
    opInit: "初始化",
    opRound: (round: number) => `第 ${round} 輪`,
    opCheck: (round: number) => `第 ${round} 輪（檢查）`,
    opEnd: "結束",
    sep: "、",
    modePlain: "例子 1：有負邊、無負環",
    modeNeg: "例子 2：有負環",
    legendInf: "距離仍是 ∞",
    legendKnown: "已有距離（可能還會變）",
    legendHot: "這一步被更新",
    legendRelaxed: "本輪鬆弛成功的邊",
    legendNeg: "負環",
    svgLabel: "Bellman-Ford 示範圖",
    distTable: "距離表",
    roundSuffix: (round: number) => `（第 ${round} 輪）`,
    relaxedTitle: "本輪鬆弛成功的邊",
    noneYet: "還沒有",
    conclusion: "結論",
    verdictNeg: "偵測到負環",
    verdictOk: "收斂，無負環",
  },
  {
    en: {
      init: (v: number, edges: number) =>
        `The source S starts at 0 and every other node at ∞. With V = ${v}, at most V − 1 = ${v - 1} rounds of relaxation are needed, and each round sweeps all ${edges} edges once.`,
      roundStart: (round: number) => `Round ${round} begins: check every edge u → v in turn, and update whenever dist[u] + w < dist[v].`,
      relax: (u: string, v: string, w: number, du: number, ws: string, nd: number, old: string) =>
        `Edge ${u} → ${v} (${w}): ${du} + ${ws} = ${nd} < ${old}, so dist[${v}] becomes ${nd}.`,
      converged: (round: number) => `Round ${round} relaxed nothing at all, so the distances have converged and the sweep can stop early.`,
      roundEnd: (round: number, count: number) =>
        `Round ${round} is finished, with ${count} successful relaxation${count === 1 ? "" : "s"}. After ${round} round${round === 1 ? "" : "s"}, every shortest distance reachable by a path of at most ${round} edge${round === 1 ? "" : "s"} is already in the distance table.`,
      finish: (list: string) => `Done. The distance table reads ${list}. Negative weights break Dijkstra, but they cause no trouble here.`,
      checkIntro: (v: number) => `All V − 1 = ${v - 1} rounds are complete. Round ${v} is one extra pass used as a test: if any edge can still be relaxed, some cycle keeps making paths shorter, which means a negative cycle.`,
      checkRelax: (u: string, v: string, w: number, du: number, ws: string, nd: number, dv: number, round: number) =>
        `Edge ${u} → ${v} (${w}): ${du} + ${ws} = ${nd} < ${dv}, so an edge still relaxes in round ${round}. There is a negative cycle.`,
      cycleFound: (loop: string) =>
        `Walking back V steps along the parent links always lands on the negative cycle, and one more lap traces it out: ${loop}. Going once around this cycle lowers the total weight, so the shortest path is undefined.`,
      noCycle: "No edge relaxes in round V, so there is no negative cycle.",
      opInit: "Initialise",
      opRound: (round: number) => `Round ${round}`,
      opCheck: (round: number) => `Round ${round} (check)`,
      opEnd: "Done",
      sep: ", ",
      modePlain: "Example 1: negative edges, no negative cycle",
      modeNeg: "Example 2: a negative cycle",
      legendInf: "Distance still ∞",
      legendKnown: "Has a distance (may still drop)",
      legendHot: "Updated this step",
      legendRelaxed: "Edge relaxed this round",
      legendNeg: "Negative cycle",
      svgLabel: "Bellman-Ford demo graph",
      distTable: "Distance table",
      roundSuffix: (round: number) => ` (round ${round})`,
      relaxedTitle: "Edges relaxed this round",
      noneYet: "None yet",
      conclusion: "Verdict",
      verdictNeg: "Negative cycle detected",
      verdictOk: "Converged, no negative cycle",
    },
  },
);

type Dict = (typeof TEXT)["zh-Hant"];

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

function buildSteps(t: Dict, edges: [string, string, number][]): Step[] {
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
  snap(t.init(V, edges.length), t.opInit);
  let converged = false;
  for (round = 1; round <= V - 1 && !converged; round++) {
    relaxed = [];
    snap(t.roundStart(round), t.opRound(round));
    for (const [u, v, w] of edges) {
      if (dist[u] === INF) continue;
      const nd = dist[u] + w;
      if (nd < dist[v]) {
        const old = dist[v];
        dist[v] = nd;
        parent[v] = u;
        relaxed.push([u, v]);
        snap(t.relax(u, v, w, dist[u], w > 0 ? String(w) : `(${w})`, nd, fmt(old)), t.opRound(round), v, [u, v]);
      }
    }
    if (relaxed.length === 0) {
      converged = true;
      snap(t.converged(round), t.opRound(round));
    } else {
      snap(t.roundEnd(round, relaxed.length), t.opRound(round));
    }
  }
  if (converged) {
    round = 0;
    snap(t.finish(NODES.map((n) => `${n}=${fmt(dist[n])}`).join(t.sep)), t.opEnd, null, null, true);
    return steps;
  }
  round = V;
  relaxed = [];
  snap(t.checkIntro(V), t.opCheck(V));
  let cycleFrom: string | null = null;
  for (const [u, v, w] of edges) {
    if (dist[u] === INF) continue;
    if (dist[u] + w < dist[v]) {
      cycleFrom = v;
      parent[v] = u;
      relaxed.push([u, v]);
      snap(t.checkRelax(u, v, w, dist[u], w > 0 ? String(w) : `(${w})`, dist[u] + w, dist[v], V), t.opCheck(V), v, [u, v]);
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
    snap(t.cycleFound([...loop, loop[0]].join(" → ")), t.opEnd, null, null, true);
  } else {
    snap(t.noCycle, t.opEnd, null, null, true);
  }
  return steps;
}

export function BellmanFordDemo() {
  const t = TEXT[useLocale()];
  const plain = useMemo(() => buildSteps(t, EDGES_PLAIN), [t]);
  const neg = useMemo(() => buildSteps(t, EDGES_NEG), [t]);
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
                {m === "plain" ? t.modePlain : t.modeNeg}
              </button>
            ))}
          </div>
        }
        right={<span className="font-mono">{s.op}</span>}
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        <Legend cls="border-line-strong bg-[var(--node-fill)]">{t.legendInf}</Legend>
        <Legend cls="border-amber bg-amber-soft">{t.legendKnown}</Legend>
        <Legend cls="border-accent bg-accent">{t.legendHot}</Legend>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-accent align-[3px]" />{t.legendRelaxed}</span>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-amber align-[3px]" />{t.legendNeg}</span>
      </div>

      <div className="grid grid-cols-1 @[640px]:grid-cols-[minmax(0,1fr)_230px]">
        <svg viewBox="0 0 500 260" role="img" aria-label={t.svgLabel} className="block h-auto w-full">
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
            const [at, side] = LABEL_AT[a + b] ?? [0.5, 1];
            const probe = s.probe !== null && s.probe[0] === a && s.probe[1] === b;
            const neg = has(s.negCycle, a, b);
            const rel = has(s.relaxed, a, b);
            const stroke = neg ? "var(--amber)" : probe || rel ? "var(--accent)" : "var(--line-strong)";
            const marker = neg ? "url(#bf-arrow-amber)" : probe || rel ? "url(#bf-arrow-accent)" : "url(#bf-arrow)";
            const mx = x1 + dx * at + nx * 11 * side, my = y1 + dy * at + ny * 11 * side;
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
            <div className="eyebrow mb-1.5">{t.distTable}{s.round > 0 ? t.roundSuffix(s.round) : ""}</div>
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
            <div className="eyebrow mb-1.5">{t.relaxedTitle}</div>
            <div className="min-h-5 font-mono text-[12.5px]">
              {s.relaxed.length ? s.relaxed.map(([a, b]) => `${a}→${b}`).join(t.sep) : <span className="font-sans text-ink-3">{t.noneYet}</span>}
            </div>
          </div>
          {s.finished && (
            <div>
              <div className="eyebrow mb-1.5">{t.conclusion}</div>
              <div className={`text-[12.5px] font-semibold ${s.negCycle.length ? "text-amber" : "text-green"}`}>{s.negCycle.length ? t.verdictNeg : t.verdictOk}</div>
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
