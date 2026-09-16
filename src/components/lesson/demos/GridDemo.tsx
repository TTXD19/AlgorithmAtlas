"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, BTN } from "./StepBar";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

/** 5×6 的地圖：1 是陸地、0 是水 */
const GRID = [
  [1, 1, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 1],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 0, 1, 0, 0],
  [1, 0, 0, 0, 0, 1],
];
const R = GRID.length, C = GRID[0].length;
const key = (r: number, c: number) => `${r},${c}`;

const TEXT = demoText(
  {
    sep: "、",
    queue: "佇列",
    stack: "堆疊",
    dirUp: "上",
    dirDown: "下",
    dirLeft: "左",
    dirRight: "右",
    intro: "把每一格當成節點，上下左右相鄰的陸地之間有邊。從 (0, 0) 開始逐格掃描，找還沒拜訪過的陸地。",
    seed: (r: number, c: number, count: number, name: string) =>
      `掃描到 (${r}, ${c}) 是還沒拜訪的陸地：這是第 ${count} 座島的起點。標記它並放入${name}，接著把整座島走完。`,
    takeFront: (r: number, c: number) => `取出佇列前端 (${r}, ${c})`,
    popTop: (r: number, c: number) => `彈出堆疊頂端 (${r}, ${c})`,
    expand: (take: string, list: string, n: number, name: string) =>
      `${take}，看四個方向：${list} 是未拜訪的陸地，標記後放入${name}。`,
    dead: (take: string) => `${take}，四個方向都是水、邊界或已拜訪，這格處理完畢。`,
    cleared: (name: string, count: number) => `${name}清空，第 ${count} 座島填色完成。回到掃描，繼續找下一塊未拜訪的陸地。`,
    finish: (count: number, name: string) => `掃描結束，共 ${count} 座島。每格最多進出${name}一次，時間 O(mn)。`,
    modeBfs: "BFS（佇列）",
    modeDfs: "DFS（堆疊）",
    gridNote: (r: number, c: number) => `${r}×${c} 網格 · 四方向`,
    legendWater: "水",
    legendUnseen: "未發現的陸地",
    legendInQueue: "在佇列中",
    legendInStack: "在堆疊中",
    legendCur: "處理中",
    legendDone: "已完成（數字是島編號）",
    legendNeighbour: "可走的鄰居",
    queueTitle: "佇列（前 → 後）",
    stackTitle: "堆疊（底 → 頂）",
    probeTitle: "目前格子的四方向",
    noCur: "沒有正在處理的格子",
    islandCount: "島嶼數",
  },
  {
    en: {
      sep: ", ",
      queue: "queue",
      stack: "stack",
      dirUp: "up",
      dirDown: "down",
      dirLeft: "left",
      dirRight: "right",
      intro: "Treat every cell as a node, with an edge between any two land cells that touch vertically or horizontally. Scan cell by cell from (0, 0), looking for land that has not been visited yet.",
      seed: (r: number, c: number, count: number, name: string) =>
        `The scan reaches (${r}, ${c}), an unvisited land cell, and that makes it the seed of island ${count}. Mark it, put it on the ${name}, and then walk the island to its edges.`,
      takeFront: (r: number, c: number) => `Take (${r}, ${c}) from the front of the queue`,
      popTop: (r: number, c: number) => `Pop (${r}, ${c}) off the top of the stack`,
      expand: (take: string, list: string, n: number, name: string) =>
        `${take} and look in all four directions. ${list} ${n === 1 ? "is" : "are"} unvisited land, so mark ${n === 1 ? "it" : "them"} and add ${n === 1 ? "it" : "them"} to the ${name}.`,
      dead: (take: string) => `${take}. All four directions are water, off the edge, or already visited, so this cell is finished.`,
      cleared: (name: string, count: number) => `The ${name} is empty, so island ${count} is completely filled in. Back to the scan, to look for the next patch of unvisited land.`,
      finish: (count: number, name: string) => `The scan is over, with ${count} islands in total. Each cell enters and leaves the ${name} at most once, so the time is O(mn).`,
      modeBfs: "BFS (queue)",
      modeDfs: "DFS (stack)",
      gridNote: (r: number, c: number) => `${r}×${c} grid, four directions`,
      legendWater: "Water",
      legendUnseen: "Undiscovered land",
      legendInQueue: "In the queue",
      legendInStack: "In the stack",
      legendCur: "Being processed",
      legendDone: "Finished (the number is the island's id)",
      legendNeighbour: "A neighbour worth moving to",
      queueTitle: "Queue (front → back)",
      stackTitle: "Stack (bottom → top)",
      probeTitle: "The current cell's four directions",
      noCur: "No cell is being processed",
      islandCount: "Islands",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

const DIRS: [number, number, (t: T) => string][] = [
  [-1, 0, (t) => t.dirUp],
  [1, 0, (t) => t.dirDown],
  [0, -1, (t) => t.dirLeft],
  [0, 1, (t) => t.dirRight],
];

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

function buildSteps(t: T, mode: Mode): Step[] {
  const steps: Step[] = [];
  const island = GRID.map((row) => row.map(() => 0));
  const seen = new Set<string>();
  const active: string[] = [];
  let count = 0;
  const snap = (desc: string, cur: string | null = null, probe: Step["probe"] = [], scan: string | null = null) =>
    steps.push({ desc, island: island.map((r) => [...r]), active: [...active], cur, probe, count, scan });
  const name = mode === "bfs" ? t.queue : t.stack;

  snap(t.intro);
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (GRID[r][c] === 0 || seen.has(key(r, c))) continue;
      count++;
      seen.add(key(r, c));
      active.push(key(r, c));
      snap(t.seed(r, c, count, name), null, [], key(r, c));
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
          if (ok) { seen.add(nk); active.push(nk); pushed.push(`${d(t)} (${nr}, ${nc})`); }
        }
        island[cr][cc] = count;
        const take = mode === "bfs" ? t.takeFront(cr, cc) : t.popTop(cr, cc);
        snap(
          pushed.length ? t.expand(take, pushed.join(t.sep), pushed.length, name) : t.dead(take),
          k, probe,
        );
      }
      snap(t.cleared(name, count));
    }
  }
  snap(t.finish(count, name));
  return steps;
}

export function GridDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const bfs = useMemo(() => buildSteps(t, "bfs"), [t]);
  const dfs = useMemo(() => buildSteps(t, "dfs"), [t]);
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
                {m === "bfs" ? t.modeBfs : t.modeDfs}
              </button>
            ))}
          </div>
        }
        right={t.gridNote(R, C)}
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
            <Legend cls="border-line bg-surface-2">{t.legendWater}</Legend>
            <Legend cls="border-line-strong bg-surface">{t.legendUnseen}</Legend>
            <Legend cls="border-amber bg-amber-soft">{mode === "bfs" ? t.legendInQueue : t.legendInStack}</Legend>
            <Legend cls="border-accent bg-accent">{t.legendCur}</Legend>
            <Legend cls="border-ink bg-ink">{t.legendDone}</Legend>
            <Legend cls="border-green bg-surface ring-2 ring-green">{t.legendNeighbour}</Legend>
          </div>
        </div>

        <div className="flex flex-col gap-3.5 border-t border-line p-4 text-[13px] md:border-t-0 md:border-l">
          <div>
            <div className="eyebrow mb-1.5">{mode === "bfs" ? t.queueTitle : t.stackTitle}</div>
            <div className="flex min-h-[30px] flex-wrap gap-1.5">
              {s.active.length ? (
                s.active.map((kk) => (
                  <span key={kk} className="grid h-7 place-items-center rounded-md border border-amber bg-amber-soft px-1.5 font-mono text-[12px] text-amber">({kk})</span>
                ))
              ) : (
                <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-7 text-ink-3">{ui.demo.empty}</span>
              )}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1.5">{t.probeTitle}</div>
            <div className="flex min-h-[30px] flex-wrap gap-1.5">
              {s.probe.length ? (
                s.probe.map((p) => (
                  <span key={p.k} className={`grid h-7 place-items-center rounded-md border px-1.5 font-mono text-[12px] ${p.ok ? "border-green bg-green-soft text-green" : "border-line bg-surface-2 text-ink-3 line-through"}`}>({p.k})</span>
                ))
              ) : (
                <span className="text-[12px] text-ink-3">{s.cur ? "" : t.noCur}</span>
              )}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1.5">{t.islandCount}</div>
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
