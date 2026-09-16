"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const N = 4;
const BASE = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => r * N + c + 1));

const TEXT = demoText(
  {
    dirRight: "右",
    dirDown: "下",
    dirLeft: "左",
    dirUp: "上",
    spiralIntro: "四個邊界 top/bottom/left/right 圍住整個矩陣。先沿著 top 那一列往右走。",
    moveTo: (dir: string, r: number, c: number, k: number) => `往${dir}：走到 (${r}, ${c})，第 ${k} 個。`,
    afterTop: (top: number) => `top 那一列走完，top 往下縮成 ${top}。接著沿 right 那一行往下。`,
    afterRight: (right: number) => `right 那一行走完，right 往左縮成 ${right}。接著沿 bottom 那一列往左。`,
    afterBottom: (bottom: number) => `bottom 那一列走完，bottom 往上縮成 ${bottom}。接著沿 left 那一行往上。`,
    afterLeft: (left: number, again: boolean) => `left 那一行走完，left 往右縮成 ${left}。${again ? "邊界還沒交叉，再繞一圈。" : ""}`,
    spiralDone: (total: number) => `邊界交叉，${total} 格全部走完，每格恰好一次，O(mn)。`,
    rotateIntro: "原矩陣。目標：順時針轉 90°，而且不另外開一個矩陣。",
    transposeSwap: (r: number, c: number) => `轉置：交換 (${r}, ${c}) 和 (${c}, ${r})，也就是 m[r][c] ↔ m[c][r]。只處理對角線上方，才不會換回去。`,
    transposeDone: "轉置完成：原本的列變成行。但方向還差一步。",
    reverseRow: (r: number) => `把第 ${r} 列左右反轉。`,
    rotateDone: "完成。原本第 0 列（1 2 3 4）現在在最右邊那一行，由上到下，就是順時針轉 90°。",
    modeSpiral: "螺旋走訪",
    modeRotate: "旋轉 90°",
    toEnd: "跳到結尾",
    stateTitle: "目前狀態",
    direction: "方向",
    spiralNote: "格子裡的數字是走訪順序。灰框是目前的邊界，每走完一邊就往內縮一格。",
    phasesTitle: "兩個階段",
    phaseTranspose: "轉置：m[r][c] ↔ m[c][r]",
    phaseReverse: "每一列左右反轉",
    rotateNote: "逆時針轉 90° 就把第二步改成「每一行上下反轉」。轉 180° 則是兩個都做。",
  },
  {
    en: {
      dirRight: "right",
      dirDown: "down",
      dirLeft: "left",
      dirUp: "up",
      spiralIntro: "The four bounds top/bottom/left/right enclose the whole matrix. Start along the top row, heading right.",
      moveTo: (dir: string, r: number, c: number, k: number) => `Heading ${dir}: step onto (${r}, ${c}), cell number ${k}.`,
      afterTop: (top: number) => `The top row is finished, so top shrinks down to ${top}. Next, head down the right column.`,
      afterRight: (right: number) => `The right column is finished, so right shrinks left to ${right}. Next, head left along the bottom row.`,
      afterBottom: (bottom: number) => `The bottom row is finished, so bottom shrinks up to ${bottom}. Next, head up the left column.`,
      afterLeft: (left: number, again: boolean) => `The left column is finished, so left shrinks right to ${left}.${again ? " The bounds have not crossed yet, so go round once more." : ""}`,
      spiralDone: (total: number) => `The bounds have crossed. All ${total} cells were visited, each exactly once, so this is O(mn).`,
      rotateIntro: "The original matrix. The goal: rotate it 90° clockwise without allocating a second matrix.",
      transposeSwap: (r: number, c: number) => `Transpose: swap (${r}, ${c}) with (${c}, ${r}), which is m[r][c] ↔ m[c][r]. Only the cells above the diagonal are touched, otherwise every swap would be undone.`,
      transposeDone: "The transpose is done: the rows have become columns. The orientation still needs one more step.",
      reverseRow: (r: number) => `Reverse row ${r} from left to right.`,
      rotateDone: "Finished. The original row 0 (1 2 3 4) is now the rightmost column read top to bottom, which is exactly a 90° clockwise rotation.",
      modeSpiral: "Spiral traversal",
      modeRotate: "Rotate 90°",
      toEnd: "Skip to end",
      stateTitle: "Current state",
      direction: "Direction",
      spiralNote: "The number in a cell is its position in the visit order. The solid borders mark the current bounds, which shrink inwards by one every time a side is finished.",
      phasesTitle: "Two phases",
      phaseTranspose: "Transpose: m[r][c] ↔ m[c][r]",
      phaseReverse: "Reverse each row",
      rotateNote: "For a 90° anticlockwise rotation, change the second step to reversing each column top to bottom. For 180°, do both reversals.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

const dirLabels = (t: T) => [`→ ${t.dirRight}`, `↓ ${t.dirDown}`, `← ${t.dirLeft}`, `↑ ${t.dirUp}`];

interface SpiralStep { desc: string; order: (number | null)[][]; cur: [number, number] | null; dir: number; bounds: [number, number, number, number] }

/** 用「四個邊界」的寫法模擬螺旋走訪，每走一格記一步。 */
function buildSpiral(t: T): SpiralStep[] {
  const steps: SpiralStep[] = [];
  const order: (number | null)[][] = BASE.map((row) => row.map(() => null));
  let top = 0, bottom = N - 1, left = 0, right = N - 1;
  let k = 0;
  const snap = (desc: string, cur: [number, number] | null, dir: number) =>
    steps.push({ desc, order: order.map((r) => [...r]), cur, dir, bounds: [top, bottom, left, right] });
  snap(t.spiralIntro, null, 0);
  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) { order[top][c] = ++k; snap(t.moveTo(t.dirRight, top, c, k), [top, c], 0); }
    top++;
    snap(t.afterTop(top), null, 1);
    if (top > bottom) break;
    for (let r = top; r <= bottom; r++) { order[r][right] = ++k; snap(t.moveTo(t.dirDown, r, right, k), [r, right], 1); }
    right--;
    snap(t.afterRight(right), null, 2);
    if (left > right) break;
    for (let c = right; c >= left; c--) { order[bottom][c] = ++k; snap(t.moveTo(t.dirLeft, bottom, c, k), [bottom, c], 2); }
    bottom--;
    snap(t.afterBottom(bottom), null, 3);
    if (top > bottom) break;
    for (let r = bottom; r >= top; r--) { order[r][left] = ++k; snap(t.moveTo(t.dirUp, r, left, k), [r, left], 3); }
    left++;
    snap(t.afterLeft(left, top <= bottom && left <= right), null, 0);
  }
  steps.push({ desc: t.spiralDone(N * N), order: order.map((r) => [...r]), cur: null, dir: 0, bounds: [top, bottom, left, right] });
  return steps;
}

interface RotateStep { desc: string; m: number[][]; hi: [number, number][] }

/** 旋轉 90°：先轉置，再把每一列反轉。逐對 swap 讓人看到每一步。 */
function buildRotate(t: T): RotateStep[] {
  const steps: RotateStep[] = [];
  const m = BASE.map((r) => [...r]);
  const snap = (desc: string, hi: [number, number][] = []) => steps.push({ desc, m: m.map((r) => [...r]), hi });
  snap(t.rotateIntro);
  for (let r = 0; r < N; r++)
    for (let c = r + 1; c < N; c++) {
      [m[r][c], m[c][r]] = [m[c][r], m[r][c]];
      snap(t.transposeSwap(r, c), [[r, c], [c, r]]);
    }
  snap(t.transposeDone);
  for (let r = 0; r < N; r++) {
    m[r].reverse();
    snap(t.reverseRow(r), Array.from({ length: N }, (_, c) => [r, c] as [number, number]));
  }
  snap(t.rotateDone);
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";
type Mode = "spiral" | "rotate";

export function MatrixDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const spiral = useMemo(() => buildSpiral(t), [t]);
  const rotate = useMemo(() => buildRotate(t), [t]);
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
              {m === "spiral" ? t.modeSpiral : t.modeRotate}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>{ui.demo.prev}</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(last, x + 1))} disabled={k === last}>{ui.demo.next}</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(last)} disabled={k === last}>{t.toEnd}</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>{ui.demo.reset}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        {mode === "spiral" ? <SpiralView s={spiral[k]} /> : <RotateView s={rotate[k]} />}
        <div className="text-[13px] text-ink-2">
          {mode === "spiral" ? (
            <>
              <div className="eyebrow mb-1.5">{t.stateTitle}</div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12.5px]">
                <span className="text-ink-3">{t.direction}</span><span>{dirLabels(t)[spiral[k].dir]}</span>
                <span className="text-ink-3">top / bottom</span><span>{spiral[k].bounds[0]} / {spiral[k].bounds[1]}</span>
                <span className="text-ink-3">left / right</span><span>{spiral[k].bounds[2]} / {spiral[k].bounds[3]}</span>
              </div>
              <p className="mt-3 mb-0 text-[12.5px] text-ink-3">{t.spiralNote}</p>
            </>
          ) : (
            <>
              <div className="eyebrow mb-1.5">{t.phasesTitle}</div>
              <ol className="m-0 list-decimal pl-5 text-[13px]">
                <li className={k >= 1 && k <= 6 ? "font-semibold text-ink" : ""}>{t.phaseTranspose}</li>
                <li className={k >= 8 && k <= 11 ? "font-semibold text-ink" : ""}>{t.phaseReverse}</li>
              </ol>
              <p className="mt-3 mb-0 text-[12.5px] text-ink-3">{t.rotateNote}</p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">{ui.demo.step} {k}/{last}</span>
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
