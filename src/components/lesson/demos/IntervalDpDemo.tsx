"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const TEXT = demoText(
  {
    opInit: "初始化",
    opDone: "完成",
    init: (arr: string) =>
      `兩端補 1 得到 [${arr}]。dp[i][j] 是「把 i 和 j 之間（不含兩端）的氣球全部戳破」的最大分數。相鄰的 dp[i][i+1] 中間沒有氣球，都是 0。`,
    candidate: (len: number, i: number, j: number, k: number, ak: number, dpLeft: number | null, dpRight: number | null, ai: number, aj: number, product: number, cand: number) =>
      `長度 ${len}，區間 (${i}, ${j})：假設 ${ak} 是最後一顆被戳破的。左邊 dp[${i}][${k}] = ${dpLeft}，右邊 dp[${k}][${j}] = ${dpRight}，戳它時鄰居是 ${ai} 和 ${aj}，得 ${ai}×${ak}×${aj} = ${product}。合計 ${cand}。`,
    fillBest: (best: number, bk: number, i: number, j: number) => ` 枚舉完畢，最大是 ${best}（k = ${bk}），填入 dp[${i}][${j}]。`,
    fillOnly: (i: number, j: number, best: number) => ` 只有這一個分割點，dp[${i}][${j}] = ${best}。`,
    bestSoFar: " 目前最好。",
    notBetter: (best: number) => ` 沒有超過目前最好的 ${best}。`,
    answer: (last: number, value: number | null) =>
      `dp[0][${last}] = ${value} 就是答案。每個區間看一次，每次枚舉 O(n) 個分割點，區間有 O(n²) 個，總共 O(n³)。`,
    header: (nums: string) => `nums = [${nums}] · 按區間長度由小到大`,
    balloons: "氣球（兩端是補的 1，下方是索引）",
    tableTitle: "dp[i][j]（列 i，行 j，只有 i < j 有意義）",
    tableNote: "格子右下角小字是選到的分割點 k",
    transition: "轉移式",
    thisCandidate: "這一步的候選",
    kLabel: (k: number, balloon: number) => `${k}（氣球 ${balloon}）`,
    candValue: "候選值",
    bestValue: "目前最大",
    colourNote: "藍色氣球是「最後戳」的 k，黃色是區間兩端（還在），灰色是區間內已被子問題戳掉的。表格裡藍色是正在填的格子，黃色是它用到的兩個子區間。",
  },
  {
    en: {
      opInit: "Set up",
      opDone: "Done",
      init: (arr: string) =>
        `Padding both ends with a 1 gives [${arr}]. dp[i][j] is the best score for popping every balloon strictly between i and j. Adjacent entries dp[i][i+1] have no balloon in between, so they are all 0.`,
      candidate: (len: number, i: number, j: number, k: number, ak: number, dpLeft: number | null, dpRight: number | null, ai: number, aj: number, product: number, cand: number) =>
        `Length ${len}, interval (${i}, ${j}): suppose ${ak} is the last balloon popped. The left side is dp[${i}][${k}] = ${dpLeft} and the right side is dp[${k}][${j}] = ${dpRight}. By the time it is popped its neighbours are ${ai} and ${aj}, which scores ${ai}×${ak}×${aj} = ${product}. That comes to ${cand} in total.`,
      fillBest: (best: number, bk: number, i: number, j: number) => ` That was the last split point to try, so the maximum is ${best} (k = ${bk}), which goes into dp[${i}][${j}].`,
      fillOnly: (i: number, j: number, best: number) => ` This interval has only one split point, so dp[${i}][${j}] = ${best}.`,
      bestSoFar: " That is the best so far.",
      notBetter: (best: number) => ` That does not beat the current best of ${best}.`,
      answer: (last: number, value: number | null) =>
        `dp[0][${last}] = ${value} is the answer. Each interval is solved once, each one tries O(n) split points, and there are O(n²) intervals, so the total is O(n³).`,
      header: (nums: string) => `nums = [${nums}] · shortest intervals first`,
      balloons: "The balloons (the 1 at each end is padding; indices below)",
      tableTitle: "dp[i][j] (row i, column j; only i < j is meaningful)",
      tableNote: "The small label in the bottom-right corner of a cell is the split point k that won.",
      transition: "Transition",
      thisCandidate: "This step's candidate",
      kLabel: (k: number, balloon: number) => `${k} (balloon ${balloon})`,
      candValue: "Candidate",
      bestValue: "Best so far",
      colourNote: "The blue balloon is k, the one popped last. Yellow marks the two ends of the interval, which are still intact, and grey marks the balloons inside it that the subproblems have already popped. In the table, blue is the cell being filled and yellow the two subintervals it reads.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

/** Burst Balloons：戳破每顆氣球得到 左×自己×右 的分數，求最大總分。 */
const NUMS = [3, 1, 5, 8];
const A = [1, ...NUMS, 1];
const L = A.length;

interface Step {
  desc: string;
  op: string;
  dp: (number | null)[][];
  bestK: (number | null)[][];
  i: number;
  j: number;
  k: number | null;
  cand: number | null;
  best: number | null;
}

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const dp: (number | null)[][] = Array.from({ length: L }, () => Array<number | null>(L).fill(null));
  const bestK: (number | null)[][] = Array.from({ length: L }, () => Array<number | null>(L).fill(null));
  const snap = (desc: string, op: string, i: number, j: number, k: number | null, cand: number | null, best: number | null) =>
    steps.push({ desc, op, dp: dp.map((r) => [...r]), bestK: bestK.map((r) => [...r]), i, j, k, cand, best });

  for (let i = 0; i + 1 < L; i++) dp[i][i + 1] = 0;
  snap(t.init(A.join(", ")), t.opInit, -1, -1, null, null, null);

  for (let len = 2; len < L; len++) {
    for (let i = 0; i + len < L; i++) {
      const j = i + len;
      let best = -1;
      let bk = -1;
      for (let k = i + 1; k < j; k++) {
        const cand = (dp[i][k] ?? 0) + (dp[k][j] ?? 0) + A[i] * A[k] * A[j];
        if (cand > best) { best = cand; bk = k; }
        const last = k === j - 1;
        const prefix = t.candidate(len, i, j, k, A[k], dp[i][k], dp[k][j], A[i], A[j], A[i] * A[k] * A[j], cand);
        if (last) {
          dp[i][j] = best;
          bestK[i][j] = bk;
          snap(`${prefix}${j - i > 2 ? t.fillBest(best, bk, i, j) : t.fillOnly(i, j, best)}`, `dp[${i}][${j}]`, i, j, k, cand, best);
        } else {
          snap(`${prefix}${cand === best ? t.bestSoFar : t.notBetter(best)}`, `dp[${i}][${j}]`, i, j, k, cand, best);
        }
      }
    }
  }
  snap(t.answer(L - 1, dp[0][L - 1]), t.opDone, 0, L - 1, null, null, dp[0][L - 1]);
  return steps;
}

export function IntervalDpDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const inside = (x: number) => s.i >= 0 && x > s.i && x < s.j;
  const last = k === steps.length - 1;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.header(NUMS.join(", "))} />
      <div className="px-3.5 pt-3.5">
        <div className="eyebrow mb-1.5">{t.balloons}</div>
        <Cells
          items={A}
          w="w-10"
          tone={(x) => (x === s.k ? CELL.accent : (x === s.i || x === s.j) && s.i >= 0 ? CELL.amber : inside(x) ? CELL.dim : "")}
        />
        <div className="mt-1 flex gap-1 font-mono text-[10.5px] text-ink-3">
          {A.map((_, x) => <span key={x} className="w-10 text-center">{x}</span>)}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        <div className="overflow-x-auto">
          <div className="eyebrow mb-1.5">{t.tableTitle}</div>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${L + 1}, 46px)` }}>
            <div className="grid h-7 place-items-center font-mono text-[11px] text-ink-3">i \ j</div>
            {A.map((_, j) => <div key={`h${j}`} className="grid h-7 place-items-center font-mono text-[12px] font-semibold text-ink-2">{j}</div>)}
            {s.dp.map((row, i) => (
              <RowView key={i} i={i} row={row} bestK={s.bestK[i]} s={s} last={last} />
            ))}
          </div>
          <div className="mt-2 font-mono text-[11px] text-ink-3">{t.tableNote}</div>
        </div>
        <div className="text-[13px] text-ink-2">
          <div className="eyebrow mb-1.5">{t.transition}</div>
          <p className="m-0 font-mono text-[12px]">dp[i][j] = max over k in (i, j) of</p>
          <p className="m-0 font-mono text-[12px]">dp[i][k] + dp[k][j] + A[i]·A[k]·A[j]</p>
          {s.k !== null && (
            <>
              <div className="eyebrow mt-3 mb-1.5">{t.thisCandidate}</div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12.5px]">
                <span className="text-ink-3">k</span><span>{t.kLabel(s.k, A[s.k])}</span>
                <span className="text-ink-3">{t.candValue}</span><span>{s.cand}</span>
                <span className="text-ink-3">{t.bestValue}</span><span className="text-ink">{s.best}</span>
              </div>
            </>
          )}
          <p className="mt-3 mb-0 text-[12.5px] text-ink-3">{t.colourNote}</p>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

function RowView({ i, row, bestK, s, last }: { i: number; row: (number | null)[]; bestK: (number | null)[]; s: Step; last: boolean }) {
  return (
    <>
      <div className="grid h-10 place-items-center font-mono text-[12px] font-semibold text-ink-2">{i}</div>
      {row.map((v, j) => {
        if (j <= i) return <div key={j} />;
        const isCur = i === s.i && j === s.j;
        const isSub = s.k !== null && ((i === s.i && j === s.k) || (i === s.k && j === s.j));
        const tone = isCur && last
          ? "border-green bg-green-soft text-green"
          : isCur ? "border-accent bg-accent text-accent-ink"
          : isSub ? "border-amber bg-amber-soft text-amber"
          : v !== null ? (j === i + 1 ? "border-line bg-surface-2 text-ink-3" : "border-line-strong bg-surface text-ink") : "border-dashed border-line text-ink-3";
        return (
          <div key={j} className={`relative grid h-10 place-items-center rounded-md border font-mono text-[13.5px] font-medium tabular-nums ${tone}`}>
            {v ?? ""}
            {bestK[j] !== null && <span className="absolute right-1 bottom-0 text-[9px] opacity-70">k{bestK[j]}</span>}
          </div>
        );
      })}
    </>
  );
}
