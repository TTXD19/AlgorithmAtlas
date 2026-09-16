"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** 所有排序示範共用的陣列 */
const ARR = [5, 2, 9, 1, 7, 3, 8, 4];

const TEXT = demoText(
  {
    opStart: "開始",
    opEnd: "結束",
    pass: (p: number) => `第 ${p} 輪`,
    passEnd: (p: number) => `第 ${p} 輪結束`,
    intro: "從左到右比較相鄰兩格，大的往右換。每掃完一輪，目前最大的那個一定被推到尾端，尾端就固定了。",
    reachedEnd: "到達這一輪的尾端。",
    movedRight: "往右移一格，下一步再和它右邊的比。",
    swap: (big: number, small: number, after: string) =>
      `比較 ${big} 和 ${small}：左邊比較大，交換。${big} ${after}`,
    keep: (a: number, b: number) => `比較 ${a} 和 ${b}：順序正確，不動。`,
    earlyExit: (p: number, front: number) =>
      `第 ${p} 輪一次交換都沒有：前 ${front} 格已經由小到大，後面又是固定好的最大值，整個陣列已經有序，提前結束。已經有序的輸入正是靠這個檢查只掃一輪、O(n)。`,
    passDoneLast: (p: number, v: number) =>
      `第 ${p} 輪結束，${v} 固定在索引 1，剩下的索引 0 只有一格，自然也就定位了。`,
    passDone: (p: number, v: number, idx: number) =>
      `第 ${p} 輪結束，${v} 是還沒固定的格子裡最大的，固定在索引 ${idx}。下一輪只掃前 ${idx} 格。`,
    finished: (compares: number, worst: number, swaps: number) =>
      `排序完成。比較 ${compares} 次（沒有提前結束要 n(n−1)/2 = ${worst} 次）、交換 ${swaps} 次。交換次數正好等於原陣列的逆序對數量，完全反序時最多，也是 ${worst} 次。`,
    caption: (arr: string) => `[${arr}] · 由小到大`,
    arrayLabel: "陣列",
    legend: "黃色是正在比較的兩格（沒交換），藍色是比較後交換了的兩格，綠色是已固定的尾端",
    compares: "比較次數",
    swaps: "交換次數",
    fixed: "已固定",
  },
  {
    en: {
      opStart: "Start",
      opEnd: "Done",
      pass: (p: number) => `Pass ${p}`,
      passEnd: (p: number) => `End of pass ${p}`,
      intro: "Compare each adjacent pair from left to right and swap whenever the larger value is on the left. Every pass pushes the largest remaining value to the end, so the tail becomes fixed.",
      reachedEnd: "has reached the end of this pass.",
      movedRight: "moves one slot to the right, and the next step compares it with its new right neighbour.",
      swap: (big: number, small: number, after: string) =>
        `Compare ${big} and ${small}: the larger value is on the left, so swap them. ${big} ${after}`,
      keep: (a: number, b: number) => `Compare ${a} and ${b}: already in order, so leave them alone.`,
      earlyExit: (p: number, front: number) =>
        `Pass ${p} made no swaps at all. The first ${front} slots are already ascending and everything after them is the fixed tail, so the array is sorted and we stop early. This check is exactly what lets an already sorted input finish in a single pass, in O(n) time.`,
      passDoneLast: (p: number, v: number) =>
        `Pass ${p} is over and ${v} is fixed at index 1. That leaves only index 0, and a single slot is sorted by itself.`,
      passDone: (p: number, v: number, idx: number) =>
        `Pass ${p} is over. ${v} was the largest of the unfixed slots, so it is fixed at index ${idx}. The next pass only scans the first ${idx} slots.`,
      finished: (compares: number, worst: number, swaps: number) =>
        `Sorting is complete: ${compares} comparisons (without the early exit it would take n(n−1)/2 = ${worst}) and ${swaps} swaps. The number of swaps is exactly the number of inversions in the original array, which peaks at ${worst} when the input is fully reversed.`,
      caption: (arr: string) => `[${arr}] · ascending`,
      arrayLabel: "Array",
      legend: "Amber is the pair being compared with no swap, blue is a pair that was just swapped, and green is the fixed tail.",
      compares: "Comparisons",
      swaps: "Swaps",
      fixed: "Fixed",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  op: string;
  arr: number[];
  /** 正在比較的相鄰兩格 */
  cmp?: [number, number];
  /** 這一步有沒有交換 */
  swapped: boolean;
  /** 從這個索引起的尾端已固定 */
  fixedFrom: number;
  compares: number;
  swaps: number;
}

function buildSteps(t: T): Step[] {
  const a = [...ARR];
  const n = a.length;
  const steps: Step[] = [];
  let compares = 0;
  let swaps = 0;
  let fixedFrom = n;
  const snap = (desc: string, op: string, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, arr: [...a], swapped: false, fixedFrom, compares, swaps, ...extra });

  snap(t.intro, t.opStart);
  for (let pass = 0; pass < n - 1; pass++) {
    let swappedThisPass = false;
    for (let j = 0; j < n - 1 - pass; j++) {
      compares++;
      const label = t.pass(pass + 1);
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        swappedThisPass = true;
        const after = j + 1 === n - 1 - pass ? t.reachedEnd : t.movedRight;
        snap(t.swap(a[j + 1], a[j], after), label, { cmp: [j, j + 1], swapped: true });
      } else {
        snap(t.keep(a[j], a[j + 1]), label, { cmp: [j, j + 1] });
      }
    }
    fixedFrom = n - 1 - pass;
    if (!swappedThisPass) {
      fixedFrom = 0;
      snap(t.earlyExit(pass + 1, n - pass), t.passEnd(pass + 1));
      break;
    }
    if (fixedFrom === 1) {
      fixedFrom = 0;
      snap(t.passDoneLast(pass + 1, a[1]), t.passEnd(pass + 1));
    } else {
      snap(t.passDone(pass + 1, a[fixedFrom], fixedFrom), t.passEnd(pass + 1));
    }
  }
  fixedFrom = 0;
  snap(t.finished(compares, (n * (n - 1)) / 2, swaps), t.opEnd);
  return steps;
}

export function BubbleSortDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const tone = (i: number) => {
    if (s.cmp && (i === s.cmp[0] || i === s.cmp[1])) return s.swapped ? CELL.accent : CELL.amber;
    if (i >= s.fixedFrom) return CELL.green;
    return "";
  };
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.caption(ARR.join(", "))} />
      <div className="p-3.5">
        <div className="eyebrow mb-2">{t.arrayLabel}</div>
        <Cells items={s.arr} tone={tone} />
        <div className="mt-2 text-[12px] text-ink-3">{t.legend}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-line px-3.5 py-3 text-[13px] md:grid-cols-3">
        <div><div className="eyebrow mb-1">{t.compares}</div><span className="font-mono text-[15px] tabular-nums">{s.compares}</span></div>
        <div><div className="eyebrow mb-1">{t.swaps}</div><span className="font-mono text-[15px] tabular-nums">{s.swaps}</span></div>
        <div><div className="eyebrow mb-1">{t.fixed}</div><span className="font-mono text-[15px] tabular-nums">{ARR.length - s.fixedFrom} / {ARR.length}</span></div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
