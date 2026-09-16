"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const GRID = [
  ["A", "B", "C", "E"],
  ["S", "F", "C", "S"],
  ["A", "D", "E", "E"],
];
const WORD = "SEE";
const ROWS = GRID.length, COLS = GRID[0].length;
type DirName = "up" | "right" | "down" | "left";
const DIRS: [number, number, DirName][] = [[-1, 0, "up"], [0, 1, "right"], [1, 0, "down"], [0, -1, "left"]];

const TEXT = demoText(
  {
    up: "上",
    right: "右",
    down: "下",
    left: "左",
    dirOp: (dir: string) => `往${dir}`,
    opStart: "開始",
    opEnd: "結束",
    intro: `在 ${ROWS}×${COLS} 網格裡找「${WORD}」。每個格子都可能是起點，從起點開始往四個方向 DFS，走過的格子標記起來，不能重複用。`,
    found: (r: number, c: number, ch: string, path: string) =>
      `(${r}, ${c}) 是「${ch}」，對上最後一個字母。路徑 ${path} 拼出「${WORD}」，回傳 true。`,
    foundOp: `找到「${WORD}」`,
    mark: (r: number, c: number, ch: string, i: number, next: string) =>
      `(${r}, ${c}) 是「${ch}」，對上 word[${i}]。標記為已走過，接著往四個方向找 word[${i + 1}] = 「${next}」。`,
    markOp: (r: number, c: number) => `標記 (${r}, ${c})`,
    visitedProbe: (dir: string, r: number, c: number) => `往${dir} (${r}, ${c})：已經在路徑上，不能再用，跳過。`,
    miss: (dir: string, r: number, c: number, ch: string, want: string) =>
      `往${dir} (${r}, ${c}) 是「${ch}」，不是「${want}」，這個方向不通。`,
    unmark: (r: number, c: number) => `(${r}, ${c}) 四個方向都走不通。回復標記：把它設回未走過，這樣別條路徑之後還能經過它。`,
    unmarkOp: (r: number, c: number) => `回復 (${r}, ${c})`,
    skipScan: (list: string, first: string) => `起點掃描：${list} 的字母都不是「${first}」，直接跳過。`,
    skipOp: "掃描起點",
    listSep: "、",
    finished: "每個起點往 4 個方向、深度 L，上界 O(m·n·4ᴸ)（不回頭的話是 3ᴸ）。回復標記是關鍵：沒有它，第一次失敗的格子會永遠被鎖住。",
    headerRight: `找「${WORD}」 · 方向順序：上、右、下、左`,
    wordLabel: (i: number) => `word（i = ${i}）`,
    pathTitle: "目前路徑",
    legend: "實色框是路徑上已標記的格子（角落數字是第幾步），黃色是正在探的鄰格，虛線框是剛回復標記的格子。",
  },
  {
    en: {
      up: "up",
      right: "right",
      down: "down",
      left: "left",
      dirOp: (dir: string) => `Go ${dir}`,
      opStart: "Start",
      opEnd: "Done",
      intro: `Find "${WORD}" in a ${ROWS}×${COLS} grid. Every cell is a possible starting point; from a start, a DFS explores all four directions, marking each cell it walks through so that the same cell is never reused.`,
      found: (r: number, c: number, ch: string, path: string) =>
        `(${r}, ${c}) holds "${ch}", which matches the last letter. The path ${path} spells "${WORD}", so return true.`,
      foundOp: `Found "${WORD}"`,
      mark: (r: number, c: number, ch: string, i: number, next: string) =>
        `(${r}, ${c}) holds "${ch}", which matches word[${i}]. Mark it as visited, then look in all four directions for word[${i + 1}] = "${next}".`,
      markOp: (r: number, c: number) => `Mark (${r}, ${c})`,
      visitedProbe: (dir: string, r: number, c: number) => `Going ${dir} to (${r}, ${c}): it is already on the path, so it cannot be reused — skip it.`,
      miss: (dir: string, r: number, c: number, ch: string, want: string) =>
        `Going ${dir} to (${r}, ${c}): it holds "${ch}", not "${want}", so this direction is a dead end.`,
      unmark: (r: number, c: number) => `All four directions out of (${r}, ${c}) are dead ends. Undo the mark — set it back to unvisited — so that another path can still pass through it later.`,
      unmarkOp: (r: number, c: number) => `Undo (${r}, ${c})`,
      skipScan: (list: string, first: string) => `Scanning for starting points: none of the letters at ${list} is "${first}", so skip them.`,
      skipOp: "Scan for starts",
      listSep: ", ",
      finished: "Each start branches four ways to depth L, giving an upper bound of O(m·n·4ᴸ), or 3ᴸ if you never step straight back. Undoing the mark is what makes this work: without it, a cell that failed once would stay locked out forever.",
      headerRight: `Find "${WORD}" · direction order: up, right, down, left`,
      wordLabel: (i: number) => `word (i = ${i})`,
      pathTitle: "Current path",
      legend: "A solid cell is a marked cell on the path (the small number is its position in the path), amber is the neighbour being probed, and a dashed border marks the cell whose mark was just undone.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

type Pos = [number, number];
interface Step { desc: string; op: string; path: Pos[]; i: number; probe?: Pos; kind: "mark" | "miss" | "visited" | "unmark" | "found" | "skip" | "none"; skipped: Pos[] }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const path: Pos[] = [];
  const skipped: Pos[] = [];
  const snap = (desc: string, op: string, i: number, kind: Step["kind"], probe?: Pos) =>
    steps.push({ desc, op, path: path.map((p) => [...p] as Pos), i, probe, kind, skipped: skipped.map((p) => [...p] as Pos) });
  const visited = GRID.map((row) => row.map(() => false));

  snap(t.intro, t.opStart, 0, "none");
  const dfs = (r: number, c: number, i: number): boolean => {
    visited[r][c] = true;
    path.push([r, c]);
    if (i === WORD.length - 1) {
      snap(t.found(r, c, GRID[r][c], path.map(([a, b]) => `(${a},${b})`).join("→")), t.foundOp, i, "found");
      return true;
    }
    snap(t.mark(r, c, GRID[r][c], i, WORD[i + 1]), t.markOp(r, c), i, "mark");
    for (const [dr, dc, name] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      const dir = t[name];
      if (visited[nr][nc]) {
        snap(t.visitedProbe(dir, nr, nc), t.dirOp(dir), i + 1, "visited", [nr, nc]);
        continue;
      }
      if (GRID[nr][nc] !== WORD[i + 1]) {
        snap(t.miss(dir, nr, nc, GRID[nr][nc], WORD[i + 1]), t.dirOp(dir), i + 1, "miss", [nr, nc]);
        continue;
      }
      if (dfs(nr, nc, i + 1)) return true;
    }
    visited[r][c] = false;
    path.pop();
    snap(t.unmark(r, c), t.unmarkOp(r, c), i, "unmark", [r, c]);
    return false;
  };

  let pending: Pos[] = [];
  const flush = () => {
    if (!pending.length) return;
    skipped.push(...pending);
    snap(t.skipScan(pending.map(([a, b]) => `(${a},${b})`).join(t.listSep), WORD[0]), t.skipOp, 0, "skip");
    pending = [];
  };
  let done = false;
  for (let r = 0; r < ROWS && !done; r++) {
    for (let c = 0; c < COLS && !done; c++) {
      if (GRID[r][c] !== WORD[0]) { pending.push([r, c]); continue; }
      flush();
      if (dfs(r, c, 0)) done = true;
    }
  }
  snap(t.finished, t.opEnd, WORD.length - 1, "none");
  return steps;
}

export function WordSearchDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const onPath = (r: number, c: number) => s.path.findIndex(([a, b]) => a === r && b === c);
  const isSkipped = (r: number, c: number) => s.skipped.some(([a, b]) => a === r && b === c);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.headerRight} />
      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, 44px)` }}>
          {GRID.map((row, r) =>
            row.map((ch, c) => {
              const idx = onPath(r, c);
              const probe = s.probe && s.probe[0] === r && s.probe[1] === c;
              let cls = "border-line-strong bg-surface";
              if (idx >= 0) cls = s.kind === "found" ? "border-green bg-green-soft text-green" : "border-accent bg-accent text-accent-ink";
              else if (probe && s.kind === "unmark") cls = "border-dashed border-accent bg-surface text-ink-3";
              else if (probe) cls = "border-amber bg-amber-soft text-amber";
              else if (isSkipped(r, c)) cls = "border-line bg-surface-2 text-ink-3";
              return (
                <div key={`${r}-${c}`} className={`relative grid h-11 place-items-center rounded-md border font-mono text-[15px] font-medium ${cls}`}>
                  {ch}
                  {idx >= 0 && <span className="absolute right-1 bottom-0.5 text-[9px] opacity-80">{idx}</span>}
                </div>
              );
            }),
          )}
        </div>
        <div className="text-[13px] text-ink-2">
          <div className="eyebrow mb-1.5">{t.wordLabel(s.i)}</div>
          <Cells items={WORD.split("")} tone={(i) => (i === s.i ? (s.kind === "found" ? CELL.green : CELL.accent) : i < s.i ? CELL.dim : "")} />
          <div className="eyebrow mt-3 mb-1.5">{t.pathTitle}</div>
          <div className="font-mono text-[12.5px]">{s.path.length ? s.path.map(([a, b]) => `(${a},${b})`).join(" → ") : <span className="text-ink-3">{ui.demo.empty}</span>}</div>
          <p className="mt-3 mb-0 text-[12.5px] text-ink-3">{t.legend}</p>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
