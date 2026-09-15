"use client";

import { useMemo, useState, type ReactNode } from "react";
import { StepHeader, StepFooter, CELL } from "./StepBar";

const NODES = ["A", "B", "C", "D"];
const POS: [number, number][] = [[80, 55], [340, 55], [340, 215], [80, 215]];
/** 有向帶權圖，B → C 是負權邊，沒有負環 */
const EDGES: [number, number, number][] = [[0, 1, 4], [0, 3, 9], [3, 0, 1], [1, 2, -2], [1, 3, 5], [2, 3, 3], [3, 2, 8], [2, 0, 6]];
/** 權重標籤：[沿邊的比例, 放在行進方向的右側 1 或左側 -1]。兩條對角線在正中間交叉，標籤各自往起點挪 */
const LABEL_AT: Record<string, [number, number]> = { "13": [0.28, 1], "20": [0.28, 1] };
const INF = Number.POSITIVE_INFINITY;
const QUERY: [number, number] = [3, 2]; // 最後還原 D → C 的路徑

interface Step {
  desc: string;
  op: string;
  k: number | null;
  d: number[][];
  cur?: [number, number];
  changed: [number, number][];
  path?: number[];
  final?: boolean;
}

const fmt = (x: number) => (x === INF ? "∞" : String(x));
/** 說明文字裡的負號用 −，放在加號後面時加括號 */
const num = (x: number) => (x < 0 ? `(−${-x})` : String(x));
const lead = (x: number) => (x < 0 ? `−${-x}` : String(x));

function buildSteps(): Step[] {
  const n = NODES.length;
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)));
  const nxt = Array.from({ length: n }, () => Array<number>(n).fill(-1));
  for (let i = 0; i < n; i++) nxt[i][i] = i;
  for (const [u, v, w] of EDGES) { d[u][v] = w; nxt[u][v] = v; }
  const steps: Step[] = [];
  let changed: [number, number][] = [];
  let k: number | null = null;
  const snap = (desc: string, op: string, extra: Partial<Step> = {}) => steps.push({ desc, op, k, d: d.map((r) => [...r]), changed: [...changed], ...extra });

  snap(`距離矩陣 dist[i][j] 一開始只有直接相連的邊：自己到自己是 0，有邊就是邊的權重，沒有邊是 ∞。這時的意思是「不經過任何中間點」的最短距離。接下來依序允許 A、B、C、D 當中間點。`, "初始化");
  let prevRound = "";
  for (k = 0; k < n; k++) {
    changed = [];
    const allowed = NODES.slice(0, k + 1).join("、");
    snap(`${prevRound}k = ${NODES[k]}：現在允許經過 ${allowed}。對每一格檢查 dist[i][${NODES[k]}] + dist[${NODES[k]}][j] 是否比 dist[i][j] 小。只會用到第 ${NODES[k]} 列和第 ${NODES[k]} 行（黃框），而這兩條在這一輪自己不會變。`, `k = ${NODES[k]}`);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (d[i][k] === INF || d[k][j] === INF) continue;
        const via = d[i][k] + d[k][j];
        if (via < d[i][j]) {
          const old = d[i][j];
          d[i][j] = via;
          nxt[i][j] = nxt[i][k];
          changed.push([i, j]);
          snap(`dist[${NODES[i]}][${NODES[j]}] 原本是 ${fmt(old)}。經過 ${NODES[k]}：dist[${NODES[i]}][${NODES[k]}] + dist[${NODES[k]}][${NODES[j]}] = ${lead(d[i][k])} + ${num(d[k][j])} = ${lead(via)} < ${fmt(old)}，更新成 ${lead(via)}。`, `k = ${NODES[k]}`, { cur: [i, j] });
        }
      }
    }
    prevRound = `k = ${NODES[k]} 這一輪更新了 ${changed.length} 格（${changed.map(([i, j]) => `${NODES[i]}→${NODES[j]}`).join("、")}）。`;
  }
  k = null;
  const diagOk = d.every((row, i) => row[i] >= 0);
  snap(`${prevRound}四輪做完，矩陣就是任意兩點的最短距離。檢查對角線：dist[i][i] 全都是 0，${diagOk ? "沒有負環" : "有負數，表示有負環"}。如果某個 dist[i][i] 變成負的，代表從 i 出發繞一圈回來總權重是負的。`, "檢查對角線", { final: true });

  const [s, t] = QUERY;
  const path = [s];
  let x = s;
  while (x !== t) { x = nxt[x][t]; path.push(x); }
  snap(`要還原路徑，另外記錄 next[i][j]：從 i 往 j 走的第一步。更新 dist[i][j] 時令 next[i][j] = next[i][k]。${NODES[s]} → ${NODES[t]} 的最短距離是 ${d[s][t]}，沿著 next 走：${path.map((p) => NODES[p]).join(" → ")}，權重 ${path.slice(1).map((v, idx) => num(EDGES.find(([a, b]) => a === path[idx] && b === v)![2])).join(" + ")} = ${d[s][t]}，比直接走 ${NODES[s]} → ${NODES[t]} 那條權重 ${EDGES.find(([a, b]) => a === s && b === t)![2]} 的邊還短。`, `路徑 ${NODES[s]} → ${NODES[t]}`, { final: true, path });
  return steps;
}

export function FloydDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const onPath = (u: number, v: number) => !!s.path && s.path.some((p, idx) => idx + 1 < s.path!.length && p === u && s.path![idx + 1] === v);

  const cellTone = (i: number, j: number) => {
    if (s.cur && s.cur[0] === i && s.cur[1] === j) return CELL.accent;
    if (s.cur && s.k !== null && ((i === s.cur[0] && j === s.k) || (i === s.k && j === s.cur[1]))) return CELL.amber;
    if (s.path && i === QUERY[0] && j === QUERY[1]) return CELL.green;
    if (s.changed.some(([a, b]) => a === i && b === j) && s.k !== null) return CELL.green;
    if (s.k !== null && (i === s.k || j === s.k)) return "border-amber bg-surface text-ink";
    if (s.d[i][j] === INF) return CELL.dim;
    return "border-line-strong bg-surface text-ink";
  };
  const nodeState = (v: number) => {
    if (s.path) return s.path.includes(v) ? "c" : "";
    if (s.cur && (s.cur[0] === v || s.cur[1] === v)) return "c";
    if (s.k === v) return "q";
    return "";
  };

  return (
    <div className="@container overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right="4 個節點、8 條有向邊，B → C 為負權" />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        <Legend cls="border-amber bg-amber-soft">中間點 k</Legend>
        <Legend cls="border-accent bg-accent">正在更新的 i、j</Legend>
        <span className="whitespace-nowrap"><i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px] border align-[-1px] ${CELL.amber}`} />用到的兩格</span>
        <span className="whitespace-nowrap"><i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px] border align-[-1px] ${CELL.green}`} />這一輪更新過</span>
      </div>

      <div className="grid grid-cols-1 @[640px]:grid-cols-[minmax(0,1fr)_260px]">
        <svg viewBox="0 0 420 270" role="img" aria-label="Floyd-Warshall 示範圖" className="block h-auto w-full">
          <defs>
            <marker id="fw-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--line-strong)" /></marker>
            <marker id="fw-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
          </defs>
          {EDGES.map(([a, b, w]) => {
            const [cx1, cy1] = POS[a], [cx2, cy2] = POS[b];
            const dx = cx2 - cx1, dy = cy2 - cy1, len = Math.hypot(dx, dy);
            const nx = -dy / len, ny = dx / len;
            const off = EDGES.some(([p, q]) => p === b && q === a) ? 5 : 0;
            const x1 = cx1 + nx * off, y1 = cy1 + ny * off, x2 = cx2 + nx * off, y2 = cy2 + ny * off;
            const ex = x2 - (dx / len) * 21, ey = y2 - (dy / len) * 21;
            const [t, side] = LABEL_AT[`${a}${b}`] ?? [0.5, 1];
            const hot = onPath(a, b);
            const mx = x1 + dx * t + nx * 12 * side, my = y1 + dy * t + ny * 12 * side;
            return (
              <g key={`${a}${b}`}>
                <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={hot ? "var(--accent)" : "var(--line-strong)"} strokeWidth={hot ? 3 : 1.5} markerEnd={hot ? "url(#fw-arrow-accent)" : "url(#fw-arrow)"} />
                <rect x={mx - 10} y={my - 7} width="20" height="14" rx="3" fill="var(--surface)" />
                <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontFamily="var(--font-mono)" fill={w < 0 ? "var(--amber)" : "var(--ink-2)"} fontWeight={hot ? 600 : 400}>{w}</text>
              </g>
            );
          })}
          {NODES.map((name, v) => {
            const [x, y] = POS[v];
            return (
              <g key={name} className={`node ${nodeState(v)}`}>
                <circle cx={x} cy={y} r="18" />
                <text className="lbl" x={x} y={y}>{name}</text>
              </g>
            );
          })}
        </svg>

        <div className="border-t border-line p-4 @[640px]:border-t-0 @[640px]:border-l">
          <div className="eyebrow mb-1.5">dist[i][j]{s.k !== null ? `（中間點可用到 ${NODES[s.k]}）` : ""}</div>
          <div className="grid grid-cols-5 gap-1 font-mono text-[12.5px] tabular-nums">
            <span className="text-center text-[10.5px] text-ink-3">i \ j</span>
            {NODES.map((nm) => <span key={`h${nm}`} className="text-center text-[11px] text-ink-3">{nm}</span>)}
            {NODES.map((rowName, i) => (
              <Row key={rowName} label={rowName}>
                {NODES.map((_, j) => (
                  <span key={j} className={`grid h-8 place-items-center rounded-md border ${cellTone(i, j)}`}>{fmt(s.d[i][j])}</span>
                ))}
              </Row>
            ))}
          </div>
          {s.path && (
            <div className="mt-3 text-[12.5px]">
              <span className="eyebrow mr-2">路徑</span>
              <span className="font-mono text-accent">{s.path.map((p) => NODES[p]).join(" → ")}</span>
            </div>
          )}
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <span className="grid place-items-center text-[11px] text-ink-3">{label}</span>
      {children}
    </>
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
