"use client";

import { useMemo, useState } from "react";

const N = 4;
const BASE = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => r * N + c + 1));
const DIR_LABEL = ["→ 右", "↓ 下", "← 左", "↑ 上"];

interface SpiralStep { desc: string; order: (number | null)[][]; cur: [number, number] | null; dir: number; bounds: [number, number, number, number] }

/** 用「四個邊界」的寫法模擬螺旋走訪，每走一格記一步。 */
function buildSpiral(): SpiralStep[] {
  const steps: SpiralStep[] = [];
  const order: (number | null)[][] = BASE.map((row) => row.map(() => null));
  let top = 0, bottom = N - 1, left = 0, right = N - 1;
  let k = 0;
  const snap = (desc: string, cur: [number, number] | null, dir: number) =>
    steps.push({ desc, order: order.map((r) => [...r]), cur, dir, bounds: [top, bottom, left, right] });
  snap("四個邊界 top/bottom/left/right 圍住整個矩陣。先沿著 top 那一列往右走。", null, 0);
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) { order[top][c] = ++k; snap(`往右：走到 (${top}, ${c})，第 ${k} 個。`, [top, c], 0); }
    top++;
    snap(`top 那一列走完，top 往下縮成 ${top}。接著沿 right 那一行往下。`, null, 1);
    if (top > bottom) break;
    for (let r = top; r <= bottom; r++) { order[r][right] = ++k; snap(`往下：走到 (${r}, ${right})，第 ${k} 個。`, [r, right], 1); }
    right--;
    snap(`right 那一行走完，right 往左縮成 ${right}。接著沿 bottom 那一列往左。`, null, 2);
    if (left > right) break;
    for (let c = right; c >= left; c--) { order[bottom][c] = ++k; snap(`往左：走到 (${bottom}, ${c})，第 ${k} 個。`, [bottom, c], 2); }
    bottom--;
    snap(`bottom 那一列走完，bottom 往上縮成 ${bottom}。接著沿 left 那一行往上。`, null, 3);
    if (top > bottom) break;
    for (let r = bottom; r >= top; r--) { order[r][left] = ++k; snap(`往上：走到 (${r}, ${left})，第 ${k} 個。`, [r, left], 3); }
    left++;
    snap(`left 那一行走完，left 往右縮成 ${left}。${top <= bottom && left <= right ? "邊界還沒交叉，再繞一圈。" : ""}`, null, 0);
  }
  steps.push({ desc: `邊界交叉，${N * N} 格全部走完，每格恰好一次，O(mn)。`, order: order.map((r) => [...r]), cur: null, dir: 0, bounds: [top, bottom, left, right] });
  return steps;
}

interface RotateStep { desc: string; m: number[][]; hi: [number, number][] }

/** 旋轉 90°：先轉置，再把每一列反轉。逐對 swap 讓人看到每一步。 */
function buildRotate(): RotateStep[] {
  const steps: RotateStep[] = [];
  const m = BASE.map((r) => [...r]);
  const snap = (desc: string, hi: [number, number][] = []) => steps.push({ desc, m: m.map((r) => [...r]), hi });
  snap("原矩陣。目標：順時針轉 90°，而且不另外開一個矩陣。");
  for (let r = 0; r < N; r++)
    for (let c = r + 1; c < N; c++) {
      [m[r][c], m[c][r]] = [m[c][r], m[r][c]];
      snap(`轉置：交換 (${r}, ${c}) 和 (${c}, ${r})，也就是 m[r][c] ↔ m[c][r]。只處理對角線上方，才不會換回去。`, [[r, c], [c, r]]);
    }
  snap("轉置完成：原本的列變成行。但方向還差一步。");
  for (let r = 0; r < N; r++) {
    m[r].reverse();
    snap(`把第 ${r} 列左右反轉。`, Array.from({ length: N }, (_, c) => [r, c] as [number, number]));
  }
  snap("完成。原本第 0 列（1 2 3 4）現在在最右邊那一行，由上到下，就是順時針轉 90°。");
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";
type Mode = "spiral" | "rotate";

export function MatrixDemo() {
  const spiral = useMemo(() => buildSpiral(), []);
  const rotate = useMemo(() => buildRotate(), []);
  const [mode, setMode] = useState<Mode>("spiral");
  const [k, setK] = useState(0);
  const steps = mode === "spiral" ? spiral : rotate;
  const last = steps.length - 1;
  const switchMode = (m: Mode) => { setMode(m); setK(0); };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1">
          {(["spiral", "rotate"] as Mode[]).map((m) => (
            <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
              {m === "spiral" ? "螺旋走訪" : "旋轉 90°"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>上一步</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(last, x + 1))} disabled={k === last}>下一步</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(last)} disabled={k === last}>跳到結尾</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>重設</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        {mode === "spiral" ? <SpiralView s={spiral[k]} /> : <RotateView s={rotate[k]} />}
        <div className="text-[13px] text-ink-2">
          {mode === "spiral" ? (
            <>
              <div className="eyebrow mb-1.5">目前狀態</div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12.5px]">
                <span className="text-ink-3">方向</span><span>{DIR_LABEL[spiral[k].dir]}</span>
                <span className="text-ink-3">top / bottom</span><span>{spiral[k].bounds[0]} / {spiral[k].bounds[1]}</span>
                <span className="text-ink-3">left / right</span><span>{spiral[k].bounds[2]} / {spiral[k].bounds[3]}</span>
              </div>
              <p className="mt-3 mb-0 text-[12.5px] text-ink-3">格子裡的數字是走訪順序。灰框是目前的邊界，每走完一邊就往內縮一格。</p>
            </>
          ) : (
            <>
              <div className="eyebrow mb-1.5">兩個階段</div>
              <ol className="m-0 list-decimal pl-5 text-[13px]">
                <li className={k >= 1 && k <= 6 ? "font-semibold text-ink" : ""}>轉置：m[r][c] ↔ m[c][r]</li>
                <li className={k >= 8 && k <= 11 ? "font-semibold text-ink" : ""}>每一列左右反轉</li>
              </ol>
              <p className="mt-3 mb-0 text-[12.5px] text-ink-3">逆時針轉 90° 就把第二步改成「每一行上下反轉」。轉 180° 則是兩個都做。</p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">步驟 {k}/{last}</span>
        <span className="flex-1">{steps[k].desc}</span>
      </div>
    </div>
  );
}

function SpiralView({ s }: { s: SpiralStep }) {
  const [top, bottom, left, right] = s.bounds;
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${N}, 44px)` }}>
      {BASE.map((row, r) =>
        row.map((v, c) => {
          const o = s.order[r][c];
          const cur = s.cur && s.cur[0] === r && s.cur[1] === c;
          const inBounds = r >= top && r <= bottom && c >= left && c <= right;
          return (
            <div
              key={`${r}-${c}`}
              className={`relative grid h-11 place-items-center rounded-md border font-mono text-[14px] font-medium ${
                cur ? "border-accent bg-accent text-accent-ink" : o ? "border-accent bg-accent-soft text-ink" : inBounds ? "border-line-strong bg-surface" : "border-dashed border-line text-ink-3"
              }`}
            >
              {o ?? v}
              {!o && <span className="absolute right-1 bottom-0.5 text-[9px] text-ink-3">{v}</span>}
            </div>
          );
        }),
      )}
    </div>
  );
}

function RotateView({ s }: { s: RotateStep }) {
  const hi = new Set(s.hi.map(([r, c]) => `${r}-${c}`));
  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${N}, 44px)` }}>
      {s.m.map((row, r) =>
        row.map((v, c) => (
          <div key={`${r}-${c}`} className={`grid h-11 place-items-center rounded-md border font-mono text-[14px] font-medium ${hi.has(`${r}-${c}`) ? "border-amber bg-amber-soft text-amber" : "border-line-strong bg-surface"}`}>
            {v}
          </div>
        )),
      )}
    </div>
  );
}
