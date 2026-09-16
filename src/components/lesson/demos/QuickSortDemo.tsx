"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const ARR = [5, 2, 9, 1, 7, 3, 8, 4];

const TEXT = demoText(
  {
    opStart: "開始",
    opEnd: "結束",
    intro: "Lomuto 分割：取範圍最後一個元素當 pivot，用指標 j 從左掃到右，把 ≤ pivot 的元素往前集中到 i 之前，最後把 pivot 放到 i+1，它就永遠定位了。",
    rangeStart: (lo: number, hi: number, p: number) =>
      `處理範圍 [${lo}..${hi}]，pivot 取最後一個元素 ${p}。i 從 ${lo - 1} 開始，代表「≤ pivot 區」目前是空的。`,
    leSame: (j: number, moved: number, p: number, i: number) => `a[${j}] = ${moved} ≤ ${p}，i 前進到 ${i}，剛好就是 j，交換自己不動。`,
    leSwap: (j: number, moved: number, p: number, i: number, other: number) =>
      `a[${j}] = ${moved} ≤ ${p}，i 前進到 ${i}，把 ${moved} 換到 i 的位置（和 ${other} 交換）。`,
    gt: (j: number, v: number, p: number) => `a[${j}] = ${v} > ${p}，留在右邊，j 繼續往右。`,
    leftSide: "左邊",
    rightSide: "右邊",
    sideEmpty: (name: string) => `${name}是空的`,
    sideOne: (name: string, v: number) => `${name}只剩 ${v} 一個，不用再分割`,
    sideRecurse: (name: string, l: number, r: number, rel: string, p: number) => `${name} [${l}..${r}] 全部 ${rel} ${p}，還要遞迴`,
    placeInPlace: (hi: number) => `掃完了，i+1 = ${hi} 剛好就是 pivot 所在的位置，不用移動`,
    placeMove: (p: number, idx: number) => `掃完了，把 pivot ${p} 換到 i+1 = ${idx}`,
    skewed: (p: number, isMin: boolean, rest: number) =>
      `這次 ${p} 是範圍裡的${isMin ? "最小值" : "最大值"}，其餘 ${rest} 個全落在同一邊，範圍只縮小 1，這就是最壞情況的樣子。`,
    partitionDone: (place: string, p: number, left: string, right: string, skewed: string) =>
      `${place}，${p} 定位完成。${left}；${right}。${skewed}`,
    finished: "排序完成。每層分割合計掃 O(n)，pivot 切得均勻就只有 log n 層，平均 O(n log n)。[2, 1, 3] 裡的 3、右半的 5 和 7 都是當時範圍裡的極值，每次只少一個元素；如果每次都這樣（例如已排序的資料固定取尾端），會變成 n 層、O(n²)。實務上隨機選 pivot 來避免。",
    lomuto: "Lomuto 分割",
    arrayTitle: "陣列",
    legend: "黃色是 pivot，藍色是剛交換的兩格，綠色是已定位的元素，灰色在目前範圍之外。i 是 ≤ pivot 區的右界，j 是掃描指標，p 標出 pivot。",
    leTitle: "≤ pivot 區",
    gtTitle: "> pivot 區",
    unseenTitle: "還沒看",
  },
  {
    en: {
      opStart: "Start",
      opEnd: "Done",
      intro: "Lomuto partitioning: take the last element of the range as the pivot and sweep a pointer j from left to right, gathering every element ≤ pivot ahead of i. At the end the pivot moves to i+1, where it is in its final position for good.",
      rangeStart: (lo: number, hi: number, p: number) =>
        `Working on the range [${lo}..${hi}], with the last element, ${p}, as the pivot. i starts at ${lo - 1}, meaning the ≤ pivot region is empty so far.`,
      leSame: (j: number, moved: number, p: number, i: number) => `a[${j}] = ${moved} ≤ ${p}, so i advances to ${i}, which is exactly j — swapping it with itself changes nothing.`,
      leSwap: (j: number, moved: number, p: number, i: number, other: number) =>
        `a[${j}] = ${moved} ≤ ${p}, so i advances to ${i} and ${moved} moves into that slot, swapping with ${other}.`,
      gt: (j: number, v: number, p: number) => `a[${j}] = ${v} > ${p}, so it stays on the right and j carries on.`,
      leftSide: "the left part",
      rightSide: "the right part",
      sideEmpty: (name: string) => `${name} is empty`,
      sideOne: (name: string, v: number) => `${name} is just ${v}, so it needs no further partitioning`,
      sideRecurse: (name: string, l: number, r: number, rel: string, p: number) => `${name}, [${l}..${r}], is entirely ${rel} ${p}, so it recurses`,
      placeInPlace: (hi: number) => `The sweep is finished, and i+1 = ${hi} is already where the pivot sits, so nothing moves`,
      placeMove: (p: number, idx: number) => `The sweep is finished, so the pivot ${p} swaps into i+1 = ${idx}`,
      skewed: (p: number, isMin: boolean, rest: number) =>
        `This time ${p} was the ${isMin ? "smallest" : "largest"} value in the range, so the other ${rest} elements all landed on one side and the range shrank by just 1. That is what the worst case looks like.`,
      partitionDone: (place: string, p: number, left: string, right: string, skewed: string) =>
        `${place}, and ${p} is now in its final position. That leaves two sides: ${left}; ${right}.${skewed ? ` ${skewed}` : ""}`,
      finished: "Sorted. Each level of partitioning sweeps O(n) elements in total, and an evenly splitting pivot gives only log n levels, so the average is O(n log n). The 3 in [2, 1, 3], and the 5 and 7 in the right half, were each the extreme value of their range, so those ranges shrank by a single element. If that happened every time — as it does on already-sorted data with a fixed last-element pivot — you would get n levels and O(n²). In practice, choosing the pivot at random avoids it.",
      lomuto: "Lomuto partitioning",
      arrayTitle: "Array",
      legend: "Amber is the pivot, blue is the pair just swapped, green is an element in its final position, and grey is outside the current range. i is the right edge of the ≤ pivot region, j is the scanning pointer, and p marks the pivot.",
      leTitle: "≤ pivot region",
      gtTitle: "> pivot region",
      unseenTitle: "Not yet scanned",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  op: string;
  arr: number[];
  /** 目前在分割的範圍 [lo, hi] */
  range?: [number, number];
  /** pivot 的索引（分割中固定在 hi） */
  pivot?: number;
  /** ≤ pivot 區的右界 i（含） */
  i?: number;
  /** 正在看的索引 j */
  j?: number;
  /** 剛交換的兩格 */
  swap?: [number, number];
  /** 已經定位、不會再動的索引 */
  fixed: number[];
}

function buildSteps(t: T): Step[] {
  const a = [...ARR];
  const steps: Step[] = [];
  const fixed: number[] = [];
  const snap = (desc: string, op: string, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, arr: [...a], fixed: [...fixed], ...extra });

  snap(t.intro, t.opStart);

  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      fixed.push(lo);
      return;
    }
    const p = a[hi];
    const label = `partition(${lo}, ${hi})`;
    let i = lo - 1;
    snap(t.rangeStart(lo, hi, p), label, { range: [lo, hi], pivot: hi, i });
    for (let j = lo; j < hi; j++) {
      if (a[j] <= p) {
        i++;
        const moved = a[j];
        [a[i], a[j]] = [a[j], a[i]];
        snap(
          i === j
            ? t.leSame(j, moved, p, i)
            : t.leSwap(j, moved, p, i, a[j]),
          label, { range: [lo, hi], pivot: hi, i, j, swap: [i, j] },
        );
      } else {
        snap(t.gt(j, a[j], p), label, { range: [lo, hi], pivot: hi, i, j });
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    fixed.push(i + 1);
    /** 描述分割後的一邊：空的、只剩一個（自然定位）、或還要遞迴 */
    const side = (name: string, l: number, r: number, rel: string) =>
      r < l ? t.sideEmpty(name) : l === r ? t.sideOne(name, a[l]) : t.sideRecurse(name, l, r, rel, p);
    const place = i + 1 === hi ? t.placeInPlace(hi) : t.placeMove(p, i + 1);
    const skewed = hi - lo >= 2 && (i < lo || i + 1 === hi) ? t.skewed(p, i < lo, hi - lo) : "";
    snap(t.partitionDone(place, p, side(t.leftSide, lo, i, "≤"), side(t.rightSide, i + 2, hi, ">"), skewed), label, { range: [lo, hi], pivot: i + 1, swap: i + 1 === hi ? undefined : [i + 1, hi] });
    sort(lo, i);
    sort(i + 2, hi);
  };
  sort(0, a.length - 1);
  snap(t.finished, t.opEnd);
  return steps;
}

export function QuickSortDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const tone = (idx: number) => {
    if (s.swap && (idx === s.swap[0] || idx === s.swap[1])) return CELL.accent;
    if (idx === s.pivot) return CELL.amber;
    if (s.fixed.includes(idx)) return CELL.green;
    if (s.range && (idx < s.range[0] || idx > s.range[1])) return CELL.dim;
    return "";
  };
  const marks = ARR.map((_, idx) => {
    const m: string[] = [];
    if (s.range && idx === s.i) m.push("i");
    if (s.range && idx === s.j) m.push("j");
    if (idx === s.pivot) m.push("p");
    return m.join("");
  });
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`[${ARR.join(", ")}] · ${t.lomuto}`} />
      <div className="p-3.5">
        <div className="eyebrow mb-2">{t.arrayTitle}</div>
        <Cells items={s.arr} tone={tone} />
        <div className="mt-1 flex gap-1">
          {marks.map((m, idx) => (
            <span key={idx} className="grid h-4 w-9 place-items-center font-mono text-[10.5px] text-ink-3">{m}</span>
          ))}
        </div>
        <div className="mt-1.5 text-[12px] text-ink-3">{t.legend}</div>
      </div>
      {s.range && s.i !== undefined && (
        <div className="grid grid-cols-2 gap-3 border-t border-line px-3.5 py-3 text-[13px] md:grid-cols-3">
          <div><div className="eyebrow mb-1">{t.leTitle}</div><span className="font-mono text-[13px] tabular-nums">{s.i >= s.range[0] ? `[${s.arr.slice(s.range[0], s.i + 1).join(", ")}]` : ui.demo.empty}</span></div>
          <div><div className="eyebrow mb-1">{t.gtTitle}</div><span className="font-mono text-[13px] tabular-nums">{s.j !== undefined && s.j > s.i ? `[${s.arr.slice(s.i + 1, s.j + 1).join(", ")}]` : ui.demo.empty}</span></div>
          <div><div className="eyebrow mb-1">{t.unseenTitle}</div><span className="font-mono text-[13px] tabular-nums">{(() => { const from = s.j === undefined ? s.range[0] : s.j + 1; return from < s.range[1] ? `[${s.arr.slice(from, s.range[1]).join(", ")}]` : ui.demo.empty; })()}</span></div>
        </div>
      )}
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
