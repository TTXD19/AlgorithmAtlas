"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const GRID = [
  ["A", "B", "C", "E"],
  ["S", "F", "C", "S"],
  ["A", "D", "E", "E"],
];
const WORD = "SEE";
const ROWS = GRID.length, COLS = GRID[0].length;
const DIRS: [number, number, string][] = [[-1, 0, "上"], [0, 1, "右"], [1, 0, "下"], [0, -1, "左"]];

type Pos = [number, number];
interface Step { desc: string; op: string; path: Pos[]; i: number; probe?: Pos; kind: "mark" | "miss" | "visited" | "unmark" | "found" | "skip" | "none"; skipped: Pos[] }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const path: Pos[] = [];
  const skipped: Pos[] = [];
  const snap = (desc: string, op: string, i: number, kind: Step["kind"], probe?: Pos) =>
    steps.push({ desc, op, path: path.map((p) => [...p] as Pos), i, probe, kind, skipped: skipped.map((p) => [...p] as Pos) });
  const visited = GRID.map((row) => row.map(() => false));

  snap(`在 ${ROWS}×${COLS} 網格裡找「${WORD}」。每個格子都可能是起點，從起點開始往四個方向 DFS，走過的格子標記起來，不能重複用。`, "開始", 0, "none");
  const dfs = (r: number, c: number, i: number): boolean => {
    visited[r][c] = true;
    path.push([r, c]);
    if (i === WORD.length - 1) {
      snap(`(${r}, ${c}) 是「${GRID[r][c]}」，對上最後一個字母。路徑 ${path.map(([a, b]) => `(${a},${b})`).join("→")} 拼出「${WORD}」，回傳 true。`, `找到「${WORD}」`, i, "found");
      return true;
    }
    snap(`(${r}, ${c}) 是「${GRID[r][c]}」，對上 word[${i}]。標記為已走過，接著往四個方向找 word[${i + 1}] = 「${WORD[i + 1]}」。`, `標記 (${r}, ${c})`, i, "mark");
    for (const [dr, dc, name] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (visited[nr][nc]) {
        snap(`往${name} (${nr}, ${nc})：已經在路徑上，不能再用，跳過。`, `往${name}`, i + 1, "visited", [nr, nc]);
        continue;
      }
      if (GRID[nr][nc] !== WORD[i + 1]) {
        snap(`往${name} (${nr}, ${nc}) 是「${GRID[nr][nc]}」，不是「${WORD[i + 1]}」，這個方向不通。`, `往${name}`, i + 1, "miss", [nr, nc]);
        continue;
      }
      if (dfs(nr, nc, i + 1)) return true;
    }
    visited[r][c] = false;
    path.pop();
    snap(`(${r}, ${c}) 四個方向都走不通。回復標記：把它設回未走過，這樣別條路徑之後還能經過它。`, `回復 (${r}, ${c})`, i, "unmark", [r, c]);
    return false;
  };

  let pending: Pos[] = [];
  const flush = () => {
    if (!pending.length) return;
    skipped.push(...pending);
    snap(`起點掃描：${pending.map(([a, b]) => `(${a},${b})`).join("、")} 的字母都不是「${WORD[0]}」，直接跳過。`, "掃描起點", 0, "skip");
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
  snap(`每個起點往 4 個方向、深度 L，上界 O(m·n·4ᴸ)（不回頭的話是 3ᴸ）。回復標記是關鍵：沒有它，第一次失敗的格子會永遠被鎖住。`, "結束", WORD.length - 1, "none");
  return steps;
}

export function WordSearchDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const onPath = (r: number, c: number) => s.path.findIndex(([a, b]) => a === r && b === c);
  const isSkipped = (r: number, c: number) => s.skipped.some(([a, b]) => a === r && b === c);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`找「${WORD}」 · 方向順序：上、右、下、左`} />
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
          <div className="eyebrow mb-1.5">word（i = {s.i}）</div>
          <Cells items={WORD.split("")} tone={(i) => (i === s.i ? (s.kind === "found" ? CELL.green : CELL.accent) : i < s.i ? CELL.dim : "")} />
          <div className="eyebrow mt-3 mb-1.5">目前路徑</div>
          <div className="font-mono text-[12.5px]">{s.path.length ? s.path.map(([a, b]) => `(${a},${b})`).join(" → ") : <span className="text-ink-3">空</span>}</div>
          <p className="mt-3 mb-0 text-[12.5px] text-ink-3">實色框是路徑上已標記的格子（角落數字是第幾步），黃色是正在探的鄰格，虛線框是剛回復標記的格子。</p>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
