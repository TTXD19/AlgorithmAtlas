"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, BTN } from "./StepBar";

/** 4×4 網格，每格是走進去要付的成本。只能往右或往下。 */
const G = [
  [1, 3, 1, 2],
  [1, 5, 1, 3],
  [4, 2, 1, 1],
  [2, 1, 3, 1],
];
const R = G.length;
const C = G[0].length;

const TEXT = demoText(
  {
    tagDefine: "定義",
    tagAnswer: "答案",
    fromAbove: "上面",
    fromLeft: "左邊",
    dirRight: "右",
    dirDown: "下",
    minIntro: "dp[r][c] 是「從左上角走到 (r, c) 的最小成本」。每格只能從上面或左邊走進來，所以由上到下、由左到右填，用到的格子一定已經算好。",
    minOrigin: (v: number) => `起點：dp[0][0] = grid[0][0] = ${v}。`,
    minTopRow: (c: number, g: number, v: number) =>
      `第 0 列只能從左邊來：dp[0][${c}] = dp[0][${c - 1}] + ${g} = ${v}。`,
    minLeftCol: (r: number, g: number, v: number) =>
      `第 0 行只能從上面來：dp[${r}][0] = dp[${r - 1}][0] + ${g} = ${v}。`,
    minCell: (r: number, c: number, up: number, left: number, best: number, g: number, v: number, src: string) =>
      `(${r}, ${c})：上面 ${up}、左邊 ${left}，取小的 ${best} 加上本格 ${g} = ${v}，來自${src}。`,
    minAnswer: (r: number, c: number, v: number) =>
      `右下角 dp[${r}][${c}] = ${v} 就是答案。從終點往回比較「上面和左邊誰比較小」，就能還原這條最便宜的路徑（綠色）。`,
    countIntro: "dp[r][c] 是「從左上角走到 (r, c) 有幾條路」。走進 (r, c) 的最後一步不是從上面就是從左邊，兩邊的路數相加就是答案。",
    countOrigin: "起點本身算一條路：dp[0][0] = 1。",
    countEdge: (r: number, c: number, dir: string) =>
      `(${r}, ${c}) 在邊上，只有一直往${dir}這一種走法，dp = 1。`,
    countCell: (r: number, c: number, up: number, left: number, v: number) =>
      `(${r}, ${c})：從上面來有 ${up} 條，從左邊來有 ${left} 條，兩者互斥所以相加 = ${v}。`,
    countAnswer: (r: number, c: number, v: number, steps: number, downs: number) =>
      `右下角 dp[${r}][${c}] = ${v}。這其實是 C(${steps}, ${downs})：${steps} 步裡挑 ${downs} 步往下。這張表就是帕斯卡三角形。`,
    caption: (rows: number, cols: number) => `${rows}×${cols} · 只能往右或往下`,
    current: "目前",
    recurrence: "轉移式",
    minHint: "格子右下角的小字是走進該格的成本。黃色是這一格選用的來源，藍色是正在填的格子。",
    countHint: "兩個來源都要算，黃色標出上面與左邊兩格。邊界那一列與那一行都是 1。",
    shared: "兩個版本的填表順序完全一樣：每格只依賴上面與左邊，所以逐列由左到右掃就對了。",
  },
  {
    en: {
      tagDefine: "Definition",
      tagAnswer: "Answer",
      fromAbove: "above",
      fromLeft: "the left",
      dirRight: "right",
      dirDown: "down",
      minIntro: "dp[r][c] is the cheapest cost of walking from the top-left corner to (r, c). A cell can only be entered from above or from the left, so filling the table top to bottom and left to right guarantees that the cells we need are already computed.",
      minOrigin: (v: number) => `Starting cell: dp[0][0] = grid[0][0] = ${v}.`,
      minTopRow: (c: number, g: number, v: number) =>
        `Row 0 can only be entered from the left: dp[0][${c}] = dp[0][${c - 1}] + ${g} = ${v}.`,
      minLeftCol: (r: number, g: number, v: number) =>
        `Column 0 can only be entered from above: dp[${r}][0] = dp[${r - 1}][0] + ${g} = ${v}.`,
      minCell: (r: number, c: number, up: number, left: number, best: number, g: number, v: number, src: string) =>
        `(${r}, ${c}): above is ${up}, the left is ${left}. Take the smaller one, ${best}, and add this cell's own cost ${g} = ${v}, arriving from ${src}.`,
      minAnswer: (r: number, c: number, v: number) =>
        `The bottom-right cell dp[${r}][${c}] = ${v} is the answer. Walking back from the end and asking each time whether above or the left was smaller reconstructs the cheapest path, shown in green.`,
      countIntro: "dp[r][c] is the number of paths from the top-left corner to (r, c). The last step into (r, c) comes either from above or from the left, so adding the two counts gives the answer.",
      countOrigin: "The starting cell counts as one path in itself: dp[0][0] = 1.",
      countEdge: (r: number, c: number, dir: string) =>
        `(${r}, ${c}) sits on the border, and the only way to reach it is to keep going ${dir}, so dp = 1.`,
      countCell: (r: number, c: number, up: number, left: number, v: number) =>
        `(${r}, ${c}): ${up} path${up === 1 ? "" : "s"} arrive${up === 1 ? "s" : ""} from above and ${left} from the left. The two sets are disjoint, so the total is ${v}.`,
      countAnswer: (r: number, c: number, v: number, steps: number, downs: number) =>
        `The bottom-right cell dp[${r}][${c}] = ${v}. That is exactly C(${steps}, ${downs}): out of ${steps} steps, choose the ${downs} that go down. The table is Pascal's triangle.`,
      caption: (rows: number, cols: number) => `${rows}×${cols} · right and down only`,
      current: "Current",
      recurrence: "Recurrence",
      minHint: "The small number in the bottom-right of a cell is the cost of entering it. Amber marks the source this cell chose, and blue marks the cell being filled.",
      countHint: "Both sources count, so amber marks the cell above and the cell to the left. The top row and the left column are all 1.",
      shared: "Both versions fill the table in exactly the same order: every cell depends only on the one above and the one to its left, so a row-by-row, left-to-right sweep is enough.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

type Mode = "min" | "count";
type Pos = [number, number];
interface Step { desc: string; dp: (number | null)[][]; cur: Pos | null; from: Pos[]; path: Pos[]; tag: string }

function buildSteps(t: T, mode: Mode): Step[] {
  const steps: Step[] = [];
  const dp: (number | null)[][] = Array.from({ length: R }, () => Array<number | null>(C).fill(null));
  const snap = (desc: string, tag: string, cur: Pos | null = null, from: Pos[] = [], path: Pos[] = []) =>
    steps.push({ desc, dp: dp.map((r) => [...r]), cur, from, path, tag });

  if (mode === "min") {
    snap(t.minIntro, t.tagDefine);
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const tag = `dp[${r}][${c}]`;
        if (r === 0 && c === 0) {
          dp[0][0] = G[0][0];
          snap(t.minOrigin(G[0][0]), tag, [0, 0]);
        } else if (r === 0) {
          dp[r][c] = (dp[r][c - 1] ?? 0) + G[r][c];
          snap(t.minTopRow(c, G[r][c], dp[r][c]!), tag, [r, c], [[r, c - 1]]);
        } else if (c === 0) {
          dp[r][c] = (dp[r - 1][c] ?? 0) + G[r][c];
          snap(t.minLeftCol(r, G[r][c], dp[r][c]!), tag, [r, c], [[r - 1, c]]);
        } else {
          const up = dp[r - 1][c] ?? 0;
          const left = dp[r][c - 1] ?? 0;
          const src: Pos = up <= left ? [r - 1, c] : [r, c - 1];
          dp[r][c] = Math.min(up, left) + G[r][c];
          snap(t.minCell(r, c, up, left, Math.min(up, left), G[r][c], dp[r][c]!, up <= left ? t.fromAbove : t.fromLeft), tag, [r, c], [src]);
        }
      }
    }
    const path: Pos[] = [];
    let r = R - 1;
    let c = C - 1;
    while (r > 0 || c > 0) {
      path.push([r, c]);
      if (r === 0) c--;
      else if (c === 0) r--;
      else if ((dp[r - 1][c] ?? 0) <= (dp[r][c - 1] ?? 0)) r--;
      else c--;
    }
    path.push([0, 0]);
    snap(t.minAnswer(R - 1, C - 1, dp[R - 1][C - 1]!), t.tagAnswer, null, [], path);
  } else {
    snap(t.countIntro, t.tagDefine);
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        const tag = `dp[${r}][${c}]`;
        if (r === 0 || c === 0) {
          dp[r][c] = 1;
          if (r === 0 && c === 0) snap(t.countOrigin, tag, [0, 0]);
          else snap(t.countEdge(r, c, r === 0 ? t.dirRight : t.dirDown), tag, [r, c], [r === 0 ? [r, c - 1] : [r - 1, c]]);
        } else {
          const up = dp[r - 1][c] ?? 0;
          const left = dp[r][c - 1] ?? 0;
          dp[r][c] = up + left;
          snap(t.countCell(r, c, up, left, dp[r][c]!), tag, [r, c], [[r - 1, c], [r, c - 1]]);
        }
      }
    }
    snap(t.countAnswer(R - 1, C - 1, dp[R - 1][C - 1]!, R + C - 2, R - 1), t.tagAnswer);
  }
  return steps;
}

/** 目前格子用到的來源方向：↑ 上面、← 左邊。 */
function arrows(r: number, c: number, fromSet: Set<string>): string {
  return (fromSet.has(`${r - 1}-${c}`) ? "↑" : "") + (fromSet.has(`${r}-${c - 1}`) ? "←" : "");
}

export function GridDpDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const minSteps = useMemo(() => buildSteps(TEXT[locale], "min"), [locale]);
  const countSteps = useMemo(() => buildSteps(TEXT[locale], "count"), [locale]);
  const [mode, setMode] = useState<Mode>("min");
  const [k, setK] = useState(0);
  const steps = mode === "min" ? minSteps : countSteps;
  const s = steps[Math.min(k, steps.length - 1)];
  const switchMode = (m: Mode) => { setMode(m); setK(0); };
  const key = (p: Pos) => `${p[0]}-${p[1]}`;
  const fromSet = new Set(s.from.map(key));
  const pathSet = new Set(s.path.map(key));
  const curKey = s.cur ? key(s.cur) : "";

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={Math.min(k, steps.length - 1)}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["min", "count"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "min" ? "Min Path Sum" : "Unique Paths"}
              </button>
            ))}
          </div>
        }
        right={t.caption(R, C)}
      />
      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${C}, 52px)` }}>
          {s.dp.map((row, r) =>
            row.map((v, c) => {
              const id = `${r}-${c}`;
              const tone = id === curKey
                ? "border-accent bg-accent text-accent-ink"
                : fromSet.has(id) ? "border-amber bg-amber-soft text-amber"
                : pathSet.has(id) ? "border-green bg-green-soft text-green"
                : v !== null ? "border-line-strong bg-surface text-ink" : "border-dashed border-line text-ink-3";
              return (
                <div key={id} className={`relative grid h-12 place-items-center rounded-md border font-mono text-[15px] font-medium tabular-nums ${tone}`}>
                  {v ?? ""}
                  {mode === "min" && <span className="absolute right-1 bottom-0.5 text-[9.5px] opacity-70">+{G[r][c]}</span>}
                  {id === curKey && <span className="absolute top-0 left-1 text-[10px]">{arrows(r, c, fromSet)}</span>}
                </div>
              );
            }),
          )}
        </div>
        <div className="text-[13px] text-ink-2">
          <div className="eyebrow mb-1.5">{t.current}</div>
          <div className="font-mono text-[12.5px] text-ink">{s.tag}</div>
          <div className="eyebrow mt-3 mb-1.5">{t.recurrence}</div>
          <p className="m-0 font-mono text-[12.5px]">
            {mode === "min" ? "dp[r][c] = min(dp[r-1][c], dp[r][c-1]) + grid[r][c]" : "dp[r][c] = dp[r-1][c] + dp[r][c-1]"}
          </p>
          <p className="mt-3 mb-0 text-[12.5px] text-ink-3">
            {mode === "min" ? t.minHint : t.countHint}
          </p>
          <p className="mt-2 mb-0 text-[12.5px] text-ink-3">{t.shared}</p>
        </div>
      </div>
      <StepFooter k={Math.min(k, steps.length - 1)} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
