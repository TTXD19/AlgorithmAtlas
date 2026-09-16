"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

/** 評審 B 給八部作品的名次，已按評審 A 的名次排好。逆序對 = 兩位評審意見相反的作品對數 */
const A = [3, 1, 4, 7, 2, 8, 5, 6];

const TEXT = demoText(
  {
    intro: "逆序對：i < j 但 a[i] > a[j] 的配對。兩兩比要 O(n²)。改用合併排序：合併兩個已排序的半邊時，右邊元素先出來，就代表左邊剩下的每一個都比它大，一次加一整批。",
    opStart: "開始",
    opEnd: "結束",
    mergeLabel: (lo: number, mid: number, hi: number) => `合併 [${lo}, ${mid}] + [${mid + 1}, ${hi}]`,
    bothSorted: (left: string, right: string) =>
      `左半 [${left}] 和右半 [${right}] 都已排序。兩個指標各指開頭，每次取較小的放進結果。`,
    takeLeft: (l: number, r: number) => `左邊 ${l} ≤ 右邊 ${r}，左邊先出。左邊的元素本來就在前面，不構成逆序對。`,
    takeRight: (r: number, l: number, cnt: number, rest: string, total: number) =>
      `右邊 ${r} < 左邊 ${l}，右邊先出。左邊剩下的 ${cnt} 個（${rest}）原本都排在它前面又都比它大，一次加 ${cnt} 對。累計 ${total}。`,
    restLeft: (rest: string, added: number) =>
      `右邊用完了，左邊剩下的 ${rest} 直接接上。它們後面沒有更小的右邊元素，不加。這次合併共加 ${added} 對。`,
    restRight: (rest: string, added: number) =>
      `左邊用完了，右邊剩下的 ${rest} 直接接上，沒有左邊元素比它們大，不加。這次合併共加 ${added} 對。`,
    done: (total: number, brute: number, pct: number) =>
      `排序完成，逆序對總數 ${total}（暴力兩兩比對也是 ${brute}）。每層合併 O(n)，共 log n 層，O(n log n)。8 個元素最多 28 對，${total} 對代表兩位評審的名次有 ${pct}% 的配對意見相反。`,
    headerNote: "8 個名次 · 合併排序時順便數",
    arrayLabel: "陣列（合併完成的段落已排序）",
    amberNote: "黃色：正在合併的區段",
    leftHalf: "左半",
    rightHalf: "右半",
    mergedLabel: "合併結果",
    addedLabel: "這次合併加了",
    totalLabel: "累計逆序對",
    legend: "左右半邊：藍色是下一次要比較的兩個元素，灰色是已取走。右邊元素先出（綠色）時，左邊還沒取走的全部（黃色）各算一對。",
  },
  {
    en: {
      intro: "An inversion is a pair with i < j but a[i] > a[j]. Comparing every pair costs O(n²). Merge sort does better: while merging two sorted halves, the moment an element from the right half comes out first, everything still waiting in the left half is greater than it, so a whole batch of inversions is counted at once.",
      opStart: "Start",
      opEnd: "Done",
      mergeLabel: (lo: number, mid: number, hi: number) => `Merge [${lo}, ${mid}] + [${mid + 1}, ${hi}]`,
      bothSorted: (left: string, right: string) =>
        `The left half [${left}] and the right half [${right}] are both sorted already. A pointer starts at the front of each, and the smaller of the two values is taken into the result every time.`,
      takeLeft: (l: number, r: number) =>
        `Left ${l} ≤ right ${r}, so the left value comes out first. It already sat ahead of the right value in the original order, so this pair is not an inversion.`,
      takeRight: (r: number, l: number, cnt: number, rest: string, total: number) =>
        `Right ${r} < left ${l}, so the right value comes out first. Every value still waiting on the left (${rest}) sat ahead of it and is greater than it, which counts ${cnt} inversion${cnt === 1 ? "" : "s"} in one go. Running total: ${total}.`,
      restLeft: (rest: string, added: number) =>
        `The right half is used up, so what remains on the left (${rest}) is appended as it is. No smaller right-hand value follows them, so nothing is counted. This merge added ${added} inversion${added === 1 ? "" : "s"} in total.`,
      restRight: (rest: string, added: number) =>
        `The left half is used up, so what remains on the right (${rest}) is appended as it is. No left-hand value is greater than them, so nothing is counted. This merge added ${added} inversion${added === 1 ? "" : "s"} in total.`,
      done: (total: number, brute: number, pct: number) =>
        `Sorting is complete, with ${total} inversions in total — brute force over every pair agrees at ${brute}. Each level of merging costs O(n) and there are log n levels, so O(n log n) overall. Eight items allow at most 28 pairs, so ${total} means the two judges rank ${pct}% of the pairs in opposite order.`,
      headerNote: "8 rankings, counted for free during the merge sort",
      arrayLabel: "The array (segments that have finished merging are sorted)",
      amberNote: "Amber: the segment being merged",
      leftHalf: "Left half",
      rightHalf: "Right half",
      mergedLabel: "Merged",
      addedLabel: "Added by this merge",
      totalLabel: "Inversions so far",
      legend: "In the two halves, blue is the next pair to be compared and grey is what has already been taken. When a right-hand value comes out first (green), every value still waiting on the left (amber) counts as one inversion.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string; op: string;
  arr: number[];                 // 目前整個陣列（合併完成的段落已排序）
  lo: number; mid: number; hi: number;
  left: number[]; right: number[]; merged: number[];
  li: number; ri: number;        // 左右指標（相對索引）
  took?: "L" | "R";
  added: number;                 // 這一次合併累計加了幾對
  total: number;
  pairs: string[];               // 這一次合併找到的逆序對
  phase: "intro" | "merge" | "done";
}

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const arr = [...A];
  let total = 0;
  const base = { arr: [...arr], lo: -1, mid: -1, hi: -1, left: [] as number[], right: [] as number[], merged: [] as number[], li: 0, ri: 0, added: 0, total: 0, pairs: [] as string[] };

  steps.push({ ...base, desc: t.intro, op: t.opStart, phase: "intro" });

  const sort = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid);
    sort(mid + 1, hi);
    const left = arr.slice(lo, mid + 1), right = arr.slice(mid + 1, hi + 1);
    const merged: number[] = [];
    const pairs: string[] = [];
    let li = 0, ri = 0, added = 0;
    const label = t.mergeLabel(lo, mid, hi);
    const snap = (desc: string, took?: "L" | "R") => steps.push({ desc, op: label, arr: [...arr], lo, mid, hi, left: [...left], right: [...right], merged: [...merged], li, ri, took, added, total, pairs: [...pairs], phase: "merge" });

    snap(t.bothSorted(left.join(", "), right.join(", ")));
    while (li < left.length && ri < right.length) {
      if (left[li] <= right[ri]) {
        merged.push(left[li]); li++;
        snap(t.takeLeft(left[li - 1], right[ri]), "L");
      } else {
        const cnt = left.length - li;
        for (let x = li; x < left.length; x++) pairs.push(`(${left[x]},${right[ri]})`);
        merged.push(right[ri]); ri++;
        added += cnt; total += cnt;
        snap(t.takeRight(right[ri - 1], left[li], cnt, left.slice(li).join(", "), total), "R");
      }
    }
    if (li < left.length) {
      const rest = left.slice(li);
      merged.push(...rest); li = left.length;
      snap(t.restLeft(rest.join(", "), added));
    } else if (ri < right.length) {
      const rest = right.slice(ri);
      merged.push(...rest); ri = right.length;
      snap(t.restRight(rest.join(", "), added));
    }
    for (let i = 0; i < merged.length; i++) arr[lo + i] = merged[i];
  };
  sort(0, A.length - 1);

  // 暴力驗證
  let brute = 0;
  for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) if (A[i] > A[j]) brute++;
  steps.push({ ...base, arr: [...arr], total, desc: t.done(total, brute, Math.round((total / 28) * 100)), op: t.opEnd, phase: "done" });
  return steps;
}

export function InversionsDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const inSeg = (i: number) => s.lo >= 0 && i >= s.lo && i <= s.hi;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.headerNote} />
      <div className="px-3.5 pt-3">
        <div className="mb-1.5 flex items-baseline gap-3">
          <span className="eyebrow">{t.arrayLabel}</span>
          <span className="text-[12px] text-ink-3">{t.amberNote}</span>
        </div>
        <div className="flex gap-1">
          {A.map((_, i) => <span key={i} className="grid w-9 place-items-center font-mono text-[10.5px] text-ink-3">{i}</span>)}
        </div>
        <Cells items={s.arr} tone={(i) => (s.phase === "done" ? CELL.green : inSeg(i) ? CELL.amber : "")} />
      </div>

      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
          <span className="text-[12px] text-ink-3">{t.leftHalf}</span>
          <Cells items={s.left} tone={(i) => (i < s.li ? CELL.dim : s.took === "R" ? CELL.amber : i === s.li && s.phase === "merge" ? CELL.accent : "")} empty="…" />
          <span className="text-[12px] text-ink-3">{t.rightHalf}</span>
          <Cells items={s.right} tone={(i) => (i < s.ri ? CELL.dim : i === s.ri && s.phase === "merge" && s.took !== "R" ? CELL.accent : "")} empty="…" />
          <span className="text-[12px] text-ink-3">{t.mergedLabel}</span>
          <Cells items={s.merged} tone={(i) => (i === s.merged.length - 1 && s.took === "R" ? CELL.green : "")} empty={ui.demo.empty} />
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
          <div className="rounded-lg border border-line bg-surface-2 px-3 py-2">
            <div className="eyebrow mb-0.5">{t.addedLabel}</div>
            <div className="font-mono text-[15px] tabular-nums">{s.phase === "merge" ? `+${s.added}` : "…"}</div>
            {s.pairs.length > 0 && <div className="mt-0.5 font-mono text-[11px] text-ink-3">{s.pairs.join(" ")}</div>}
          </div>
          <div className="rounded-lg bg-accent-soft px-3 py-2">
            <div className="eyebrow mb-0.5">{t.totalLabel}</div>
            <div className="font-mono text-[17px] font-semibold tabular-nums">{s.total}</div>
          </div>
        </div>
      </div>
      <div className="px-3.5 pb-2 text-[12px] text-ink-3">{t.legend}</div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
