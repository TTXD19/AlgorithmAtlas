"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, BTN } from "./StepBar";

/** 5×6 的地圖：1 是陸地、0 是水 */
const GRID = [
  [1, 1, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 1],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 1],
];
const R = GRID.length, C = GRID[0].length;
const DIRS: [number, number, string][] = [[-1, 0, "上"], [1, 0, "下"], [0, -1, "左"], [0, 1, "右"]];
const key = (r: number, c: number) => `${r},${c}`;

type Mode = "bfs" | "dfs";
interface Step {
  desc: string;
  /** 每格屬於第幾座島（已完成），未拜訪為 0 */
  island: number[][];
  /** 待在佇列／堆疊裡的格子 */
  active: string[];
  cur: string | null;
  /** 目前格子的四方向鄰居，附上判斷結果 */
  probe: { k: string; ok: boolean }[];
  count: number;
  scan: string | null;
}

function buildSteps(mode: Mode): Step[] {
  const steps: Step[] = [];
  const island = GRID.map((row) => row.map(() => 0));
  const seen = new Set<string>();
  const active: string[] = [];
  let count = 0;
  const snap = (desc: string, cur: string | null = null, probe: Step["probe"] = [], scan: string | null = null) =>
    steps.push({ desc, island: island.map((r) => [...r]), active: [...active], cur, probe, count, scan });
  const name = mode === "bfs" ? "佇列" : "堆疊";

  snap(`把每一格當成節點，上下左右相鄰的陸地之間有邊。從 (0, 0) 開始逐格掃描，找還沒拜訪過的陸地。`);
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (GRID[r][c] === 0 || seen.has(key(r, c))) continue;
      count++;
      seen.add(key(r, c));
      active.push(key(r, c));
      snap(`掃描到 (${r}, ${c}) 是還沒拜訪的陸地：這是第 ${count} 座島的起點。標記它並放入${name}，接著把整座島走完。`, null, [], key(r, c));
      while (active.length) {
        const k = mode === "bfs" ? active.shift()! : active.pop()!;
        const [cr, cc] = k.split(",").map(Number);
        const probe: Step["probe"] = [];
        const pushed: string[] = [];
        for (const [dr, dc, d] of DIRS) {
          const nr = cr + dr, nc = cc + dc;
          if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
          const nk = key(nr, nc);
          const ok = GRID[nr][nc] === 1 && !seen.has(nk);
          probe.push({ k: nk, ok });
          if (ok) { seen.add(nk); active.push(nk); pushed.push(`${d} (${nr}, ${nc})`); }
        }
        island[cr][cc] = count;
        snap(
          pushed.length
            ? `${mode === "bfs" ? "取出佇列前端" : "彈出堆疊頂端"} (${cr}, ${cc})，看四個方向：${pushed.join("、")} 是未拜訪的陸地，標記後放入${name}。`
            : `${mode === "bfs" ? "取出佇列前端" : "彈出堆疊頂端"} (${cr}, ${cc})，四個方向都是水、邊界或已拜訪，這格處理完畢。`,
          k, probe,
        );
      }
      snap(`${name}清空，第 ${count} 座島填色完成。回到掃描，繼續找下一塊未拜訪的陸地。`);
    }
  }
  snap(`掃描結束，共 ${count} 座島。每格最多進出${name}一次，時間 O(mn)。`);
  return steps;
}

export function GridDemo() {
  const bfs = useMemo(() => buildSteps("bfs"), []);
  const dfs = useMemo(() => buildSteps("dfs"), []);
  const [mode, setMode] = useState<Mode>("bfs");
  const [k, setK] = useState(0);
  const steps = mode === "bfs" ? bfs : dfs;
  const s = steps[k];
  const switchMode = (m: Mode) => { setMode(m); setK(0); };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["bfs", "dfs"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "bfs" ? "BFS（佇列）" : "DFS（堆疊）"}
              </button>
            ))}
          </div>
        }
        right={`${R}×${C} 網格 · 四方向`}
      />

      <div className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="p-4">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${C}, 40px)` }}>
            {GRID.map((row, r) =>
              row.map((v, c) => {
                const kk = key(r, c);
                const isCur = s.cur === kk;
                const inActive = s.active.includes(kk);
                const done = s.island[r][c] > 0;
                const pr = s.probe.find((p) => p.k === kk);
                const isScan = s.scan === kk;
                let cls = "border-line bg-surface-2 text-ink-3";
                if (v === 1) cls = "border-line-strong bg-surface text-ink";
                if (done) cls = "border-ink bg-ink text-bg";
                if (inActive || isScan) cls = "border-amber bg-amber-soft text-amber";
                if (isCur) cls = "border-accent bg-accent text-accent-ink";
                return (
                  <div key={kk} className={`relative grid h-10 w-10 place-items-center rounded-md border font-mono text-[12.5px] tabular-nums ${cls} ${pr ? (pr.ok ? "ring-2 ring-green" : "ring-2 ring-line-strong") : ""}`}>
                    {done ? s.island[r][c] : v}
                  </div>
                );
              }),
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-3.5 gap-y-1 text-[12px] text-ink-2">
            <Legend cls="border-line bg-surface-2">水</Legend>
            <Legend cls="border-line-strong bg-surface">未發現的陸地</Legend>
            <Legend cls="border-amber bg-amber-soft">{mode === "bfs" ? "在佇列中" : "在堆疊中"}</Legend>
            <Legend cls="border-accent bg-accent">處理中</Legend>
            <Legend cls="border-ink bg-ink">已完成（數字是島編號）</Legend>
            <Legend cls="border-green bg-surface ring-2 ring-green">可走的鄰居</Legend>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 border-t border-line p-4 text-[13px] md:border-t-0 md:border-l">
          <div>
            <div className="eyebrow mb-1.5">{mode === "bfs" ? "佇列（前 → 後）" : "堆疊（底 → 頂）"}</div>
            <div className="flex min-h-[30px] flex-wrap gap-1.5">
              {s.active.length ? (
                s.active.map((kk) => (
                  <span key={kk} className="grid h-7 place-items-center rounded-md border border-amber bg-amber-soft px-1.5 font-mono text-[12px] text-amber">({kk})</span>
                ))
              ) : (
                <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-7 text-ink-3">空</span>
              )}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1.5">目前格子的四方向</div>
            <div className="flex min-h-[30px] flex-wrap gap-1.5">
              {s.probe.length ? (
                s.probe.map((p) => (
                  <span key={p.k} className={`grid h-7 place-items-center rounded-md border px-1.5 font-mono text-[12px] ${p.ok ? "border-green bg-green-soft text-green" : "border-line bg-surface-2 text-ink-3 line-through"}`}>({p.k})</span>
                ))
              ) : (
                <span className="text-[12px] text-ink-3">{s.cur ? "" : "沒有正在處理的格子"}</span>
              )}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1.5">島嶼數</div>
            <div className="font-display text-[24px] tabular-nums text-ink">{s.count}</div>
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
      <i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-sm border-[1.5px] align-[-1px] ${cls}`} />
      {children}
    </span>
  );
}
