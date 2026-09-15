"use client";

import { useMemo, useState, type ReactNode } from "react";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";

type Mode = "short" | "long";

interface Graph {
  /** 已經是拓撲順序 */
  order: string[];
  pos: Record<string, [number, number]>;
  edges: [string, string, number][];
  source: string;
  r: number;
}

/** 例子 1：含負權邊的 DAG，起點 S；R 排在 S 前面，從 S 走不到 */
const SHORT: Graph = {
  order: ["R", "S", "T", "X", "Y", "Z"],
  pos: { R: [45, 150], S: [135, 60], T: [225, 200], X: [325, 60], Y: [415, 200], Z: [505, 120] },
  edges: [["R", "S", 5], ["R", "T", 3], ["S", "T", 2], ["S", "X", 6], ["T", "X", 7], ["T", "Y", 4], ["T", "Z", 2], ["X", "Y", -1], ["X", "Z", 1], ["Y", "Z", -2]],
  source: "S",
  r: 18,
};

/** 例子 2：專案排程。邊 u → v 的權重是「u 這項工作要做幾天」，最長路徑 = 最早可以開始的時間 */
const DUR: Record<string, number> = { 開工: 0, 規格: 3, 後端: 6, 前端: 4, 文件: 2, 測試: 3, 上線: 0 };
const LONG: Graph = {
  order: ["開工", "規格", "後端", "前端", "文件", "測試", "上線"],
  pos: { 開工: [42, 130], 規格: [135, 130], 後端: [255, 55], 前端: [255, 205], 文件: [395, 210], 測試: [395, 80], 上線: [510, 140] },
  edges: [["開工", "規格"], ["規格", "後端"], ["規格", "前端"], ["規格", "文件"], ["後端", "測試"], ["前端", "測試"], ["文件", "上線"], ["測試", "上線"]].map(([u, v]) => [u, v, DUR[u]] as [string, string, number]),
  source: "開工",
  r: 21,
};

interface Step {
  desc: string;
  op: string;
  dist: Record<string, number>;
  parent: Record<string, string>;
  cur: string | null;
  probe: [string, string] | null;
  done: string[];
  critical?: [string, string][];
}

const fmtW = (w: number) => (w < 0 ? `(−${-w})` : String(w));

function buildSteps(mode: Mode): Step[] {
  const g = mode === "short" ? SHORT : LONG;
  const worst = mode === "short" ? Infinity : -Infinity;
  const better = (a: number, b: number) => (mode === "short" ? a < b : a > b);
  const fmt = (x: number) => (x === Infinity ? "∞" : x === -Infinity ? "−∞" : x < 0 ? `−${-x}` : String(x));
  const dist: Record<string, number> = Object.fromEntries(g.order.map((n) => [n, worst]));
  const parent: Record<string, string> = {};
  const done: string[] = [];
  const steps: Step[] = [];
  const snap = (desc: string, op: string, cur: string | null = null, probe: [string, string] | null = null, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, dist: { ...dist }, parent: { ...parent }, cur, probe, done: [...done], ...extra });

  dist[g.source] = 0;
  if (mode === "short") {
    snap(`節點已經照拓撲順序排好（下方那一列）：${g.order.join(" → ")}，每條邊都從左邊的節點指向右邊。起點 ${g.source} 設為 0，其餘 ∞。接下來照這個順序處理每個節點，把它的出邊各鬆弛一次。`, "初始化");
  } else {
    snap(`專案有 ${g.order.length - 2} 項工作，箭頭 u → v 表示 v 要等 u 做完才能開始，邊上的數字是 u 要做幾天。拓撲順序：${g.order.join(" → ")}。dist[v] 是 v 最早可以開工的日子，要等「所有」前置工作都完成，所以取最大值：開工設為 0，其餘先設為 −∞。`, "初始化");
  }

  for (const u of g.order) {
    const out = g.edges.filter(([a]) => a === u);
    if (dist[u] === worst) {
      done.push(u);
      snap(`輪到 ${u}，但 dist[${u}] = ${fmt(dist[u])}：從起點根本走不到它，它的 ${out.length} 條出邊都不能拿來鬆弛，直接跳過。${u} 排在 ${g.source} 前面，所以一定走不到。`, `處理 ${u}`, u);
      continue;
    }
    if (out.length === 0) {
      done.push(u);
      snap(mode === "short" ? `輪到 ${u}，dist[${u}] = ${fmt(dist[u])}。它沒有出邊，不用鬆弛。` : `輪到${u}，最早第 ${dist[u]} 天。它沒有後續工作，不用鬆弛。`, `處理 ${u}`, u);
      continue;
    }
    out.forEach(([a, b, w], idx) => {
      const cand = dist[a] + w;
      const upd = better(cand, dist[b]);
      const old = dist[b];
      if (upd) { dist[b] = cand; parent[b] = a; }
      let text: string;
      if (mode === "short") {
        const lead = idx === 0 ? `輪到 ${u}：指向它的邊都在前面處理過了，dist[${u}] = ${fmt(dist[u])} 已經是最終答案。` : "";
        text = `${lead}${a} → ${b}（${fmt(w)}）：${fmt(dist[a])} + ${fmtW(w)} = ${fmt(cand)}，${upd ? `比目前的 ${fmt(old)} 小，更新 dist[${b}] = ${fmt(cand)}。` : `沒有比目前的 ${fmt(old)} 小，不更新。`}`;
      } else {
        const lead = idx === 0 ? `輪到${u}：它的前置工作都處理過了，最早第 ${dist[u]} 天可以開始，不會再變。` : "";
        text = `${lead}${a} → ${b}（${a}要做 ${w} 天）：${dist[a]} + ${w} = ${cand}，${upd ? `比目前的 ${fmt(old)} 晚，${b}最早要第 ${cand} 天才能開始。` : `沒有比目前的第 ${old} 天晚，不更新。`}`;
      }
      snap(text, `處理 ${u}`, u, [a, b]);
    });
    done.push(u);
  }

  if (mode === "short") {
    const reach = g.order.filter((n) => dist[n] !== Infinity).map((n) => `${n} = ${fmt(dist[n])}`).join("、");
    snap(`全部處理完：${reach}，R 走不到仍是 ∞。每個節點、每條邊都只看一次，O(V + E)。有負權邊也沒關係：處理 u 的時候，所有指向 u 的邊都已經鬆弛過，dist[u] 不會再變。Y 和 Z 都被更新了兩次，後來的值來自負權邊 X → Y 和 Y → Z。`, "結束");
  } else {
    const last = g.order[g.order.length - 1];
    const critical: [string, string][] = [];
    for (let v = last; parent[v]; v = parent[v]) critical.unshift([parent[v], v]);
    const pathNodes = [critical[0][0], ...critical.map(([, v]) => v)];
    const front = dist["測試"] - (dist["前端"] + DUR["前端"]);
    const docs = dist["上線"] - (dist["文件"] + DUR["文件"]);
    snap(`上線最早在第 ${dist[last]} 天，這就是總工期。沿著 parent 往回走得到關鍵路徑 ${pathNodes.join(" → ")}：這條路上任何一項工作延誤一天，上線就晚一天。不在路上的工作有浮動時間，前端第 ${dist["前端"] + DUR["前端"]} 天做完，但測試第 ${dist["測試"]} 天才開始，可以晚 ${front} 天；文件可以晚 ${docs} 天。`, "關鍵路徑", null, null, { critical });
  }
  return steps;
}

export function DagShortestDemo() {
  const short = useMemo(() => buildSteps("short"), []);
  const long = useMemo(() => buildSteps("long"), []);
  const [mode, setMode] = useState<Mode>("short");
  const [k, setK] = useState(0);
  const steps = mode === "short" ? short : long;
  const g = mode === "short" ? SHORT : LONG;
  const s = steps[Math.min(k, steps.length - 1)];
  const switchMode = (m: Mode) => { setMode(m); setK(0); };
  const fmt = (x: number) => (x === Infinity ? "∞" : x === -Infinity ? "−∞" : String(x));
  const isParent = (a: string, b: string) => s.parent[b] === a;
  const isCritical = (a: string, b: string) => !!s.critical?.some(([x, y]) => x === a && y === b);
  const unknown = (x: number) => x === Infinity || x === -Infinity;

  return (
    <div className="@container overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={Math.min(k, steps.length - 1)}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["short", "long"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "short" ? "最短路徑（含負權）" : "最長路徑：專案排程"}
              </button>
            ))}
          </div>
        }
        right={<span className="font-mono">{s.op}</span>}
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        <Legend cls="border-accent bg-accent">正在處理的節點</Legend>
        <Legend cls="border-amber bg-amber-soft">已有距離</Legend>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-amber align-[3px]" />正在鬆弛的邊</span>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-accent align-[3px]" />{mode === "short" ? "目前最短路徑樹" : "目前最晚的前置工作"}</span>
      </div>

      <svg viewBox="0 0 550 260" role="img" aria-label="DAG 最短路徑示範圖" className="block h-auto w-full">
        <defs>
          <marker id="dag-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--line-strong)" /></marker>
          <marker id="dag-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
          <marker id="dag-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--amber)" /></marker>
        </defs>
        {g.edges.map(([a, b, w]) => {
          const [x1, y1] = g.pos[a], [x2, y2] = g.pos[b];
          const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
          const sx = x1 + (dx / len) * g.r, sy = y1 + (dy / len) * g.r;
          const ex = x2 - (dx / len) * (g.r + 3), ey = y2 - (dy / len) * (g.r + 3);
          const probe = !!s.probe && s.probe[0] === a && s.probe[1] === b;
          const tree = isCritical(a, b) || (!s.critical && isParent(a, b));
          const stroke = probe ? "var(--amber)" : tree ? "var(--accent)" : "var(--line-strong)";
          const marker = probe ? "url(#dag-arrow-amber)" : tree ? "url(#dag-arrow-accent)" : "url(#dag-arrow)";
          const mx = (x1 + x2) / 2 + (-dy / len) * 11, my = (y1 + y2) / 2 + (dx / len) * 11;
          return (
            <g key={a + b}>
              <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={stroke} strokeWidth={probe || isCritical(a, b) ? 3 : tree ? 2.5 : 1.5} markerEnd={marker} />
              <rect x={mx - 10} y={my - 7} width="20" height="14" rx="3" fill="var(--surface)" />
              <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontFamily="var(--font-mono)" fill={w < 0 ? "var(--amber)" : "var(--ink-2)"} fontWeight={probe ? 600 : 400}>{w < 0 ? `−${-w}` : w}</text>
            </g>
          );
        })}
        {g.order.map((n) => {
          const [x, y] = g.pos[n];
          const state = s.cur === n || (s.probe && s.probe[1] === n) ? "c" : !unknown(s.dist[n]) ? "q" : "";
          const below = y > 130;
          return (
            <g key={n} className={`node ${state}`}>
              <circle cx={x} cy={y} r={g.r} />
              <text className="lbl" x={x} y={y} style={g.r > 18 ? { fontSize: "12px" } : undefined}>{n}</text>
              <text className="dist" x={x} y={below ? y + g.r + 12 : y - g.r - 10}>d={fmt(s.dist[n])}</text>
            </g>
          );
        })}
      </svg>

      <div className="border-t border-line p-3.5">
        <div className="eyebrow mb-1.5">拓撲順序（綠色 = 已處理，藍色 = 正在處理）</div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[300px] gap-1" style={{ gridTemplateColumns: `3.6rem repeat(${g.order.length}, minmax(0, 1fr))` }}>
            <span className="self-center text-[11.5px] text-ink-3">節點</span>
            {g.order.map((n) => (
              <span key={`n${n}`} className={`grid h-8 min-w-0 place-items-center rounded-md border font-mono text-[12.5px] ${s.cur === n ? CELL.accent : s.done.includes(n) ? CELL.green : "border-line-strong bg-surface text-ink"}`}>{n}</span>
            ))}
            <span className="self-center text-[11.5px] text-ink-3">{mode === "short" ? "dist" : "最早開始"}</span>
            {g.order.map((n) => (
              <span key={`d${n}`} className={`grid h-8 min-w-0 place-items-center rounded-md border font-mono text-[12.5px] tabular-nums ${s.probe && s.probe[1] === n ? CELL.amber : unknown(s.dist[n]) ? CELL.dim : "border-line-strong bg-surface text-ink"}`}>{fmt(s.dist[n])}</span>
            ))}
          </div>
        </div>
        {mode === "long" && (
          <div className="mt-2.5">
            <div className="eyebrow mb-1">工作天數</div>
            <Cells items={LONG.order.slice(1, -1).map((n) => `${n} ${DUR[n]}`)} w="w-[4.2rem]" />
          </div>
        )}
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
