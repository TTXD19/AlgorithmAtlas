"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";
import { DemoInput } from "./DemoInput";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const DEFAULT = [5, 2, 9, 1, 7, 3, 8, 4];

const TEXT = demoText(
  {
    opStart: "開始",
    opEnd: "結束",
    round: (n: number) => `第 ${n} 輪`,
    intro: "每一輪在「還沒排好的區域」裡找最小值，然後和這一輪的第一格交換。左邊排好的區域每輪長一格。",
    roundStart: (n: number, from: number, v: number) => `第 ${n} 輪：從索引 ${from} 開始掃，先假設 ${v} 是最小的。`,
    newMin: (v: number, prev: number) => `${v} 比目前最小的 ${prev} 更小，${v} 成為新的最小值候選。`,
    keepMin: (v: number, min: number) => `${v} 不比 ${min} 小，最小值候選不變。`,
    swapped: (min: number, minIdx: number, i: number, other: number) =>
      `掃完了，最小值是 ${min}（索引 ${minIdx}）。和索引 ${i} 的 ${other} 交換，這輪只做這一次交換。`,
    alreadyInPlace: (min: number, i: number) => `掃完了，最小值 ${min} 本來就在索引 ${i}，不用交換。`,
    finished: (compares: number, swaps: number) =>
      `排序完成。比較 ${compares} 次（永遠是 n(n−1)/2，不管資料多有序），交換只有 ${swaps} 次（最多 n−1 次）。`,
    ascending: "由小到大",
    arrayTitle: "陣列",
    legend: "黃色是目前的最小值候選，藍色是正在看的格子或剛交換的兩格，綠色是左邊已排好的區域",
    compares: "比較次數",
    swaps: "交換次數",
    sorted: "已排好",
  },
  {
    en: {
      opStart: "Start",
      opEnd: "Done",
      round: (n: number) => `Round ${n}`,
      intro: "Each round finds the smallest value in the unsorted region and swaps it with the first cell of that region. The sorted region on the left grows by one cell per round.",
      roundStart: (n: number, from: number, v: number) => `Round ${n}: scan from index ${from}, assuming for now that ${v} is the smallest.`,
      newMin: (v: number, prev: number) => `${v} is smaller than the current smallest, ${prev}, so ${v} becomes the new candidate.`,
      keepMin: (v: number, min: number) => `${v} is not smaller than ${min}, so the candidate is unchanged.`,
      swapped: (min: number, minIdx: number, i: number, other: number) =>
        `The scan is finished: the smallest value is ${min}, at index ${minIdx}. Swap it with ${other} at index ${i} — that is the only swap this round.`,
      alreadyInPlace: (min: number, i: number) => `The scan is finished: the smallest value ${min} is already at index ${i}, so no swap is needed.`,
      finished: (compares: number, swaps: number) =>
        `Sorted. That took ${compares} comparisons — always n(n−1)/2, however ordered the input happens to be — and only ${swaps} swaps, at most n−1.`,
      ascending: "ascending",
      arrayTitle: "Array",
      legend: "Amber is the current smallest candidate, blue is the cell being examined or the two cells just swapped, and green is the sorted region on the left.",
      compares: "Comparisons",
      swaps: "Swaps",
      sorted: "Sorted",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  op: string;
  arr: number[];
  /** 目前這輪的起點（左邊都已排好） */
  i: number;
  /** 正在看的索引 */
  j?: number;
  /** 目前找到的最小值索引 */
  min?: number;
  /** 剛交換的兩格 */
  swap?: [number, number];
  compares: number;
  swaps: number;
}

function buildSteps(t: T, arr: number[]): Step[] {
  const a = [...arr];
  const n = a.length;
  const steps: Step[] = [];
  let compares = 0;
  let swaps = 0;
  const snap = (desc: string, op: string, i: number, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, arr: [...a], i, compares, swaps, ...extra });

  snap(t.intro, t.opStart, 0);
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    const label = t.round(i + 1);
    snap(t.roundStart(i + 1, i, a[i]), label, i, { min });
    for (let j = i + 1; j < n; j++) {
      compares++;
      if (a[j] < a[min]) {
        const prev = a[min];
        min = j;
        snap(t.newMin(a[j], prev), label, i, { j, min });
      } else {
        snap(t.keepMin(a[j], a[min]), label, i, { j, min });
      }
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      swaps++;
      snap(t.swapped(a[i], min, i, a[min]), label, i + 1, { swap: [i, min] });
    } else {
      snap(t.alreadyInPlace(a[i], i), label, i + 1, { min: i });
    }
  }
  snap(t.finished(compares, swaps), t.opEnd, n);
  return steps;
}

export function SelectionSortDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const [arr, setArr] = useState(DEFAULT);
  const steps = useMemo(() => buildSteps(TEXT[locale], arr), [locale, arr]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const tone = (i: number) => {
    if (s.swap && (i === s.swap[0] || i === s.swap[1])) return CELL.accent;
    if (i === s.min) return CELL.amber;
    if (i === s.j) return CELL.accent;
    if (i < s.i) return CELL.green;
    return "";
  };
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`[${arr.join(", ")}] · ${t.ascending}`} />
      <DemoInput value={arr} defaults={DEFAULT} onChange={(a) => { setArr(a); setK(0); }} />
      <div className="p-3.5">
        <div className="eyebrow mb-2">{t.arrayTitle}</div>
        <Cells items={s.arr} tone={tone} />
        <div className="mt-2 text-[12px] text-ink-3">{t.legend}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-line px-3.5 py-3 text-[13px] md:grid-cols-3">
        <div><div className="eyebrow mb-1">{t.compares}</div><span className="font-mono text-[15px] tabular-nums">{s.compares}</span></div>
        <div><div className="eyebrow mb-1">{t.swaps}</div><span className="font-mono text-[15px] tabular-nums">{s.swaps}</span></div>
        <div><div className="eyebrow mb-1">{t.sorted}</div><span className="font-mono text-[15px] tabular-nums">{Math.min(s.i, arr.length)} / {arr.length}</span></div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
