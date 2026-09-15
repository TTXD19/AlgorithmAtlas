"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** 評審 B 給八部作品的名次，已按評審 A 的名次排好。逆序對 = 兩位評審意見相反的作品對數 */
const A = [3, 1, 4, 7, 2, 8, 5, 6];

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

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const arr = [...A];
  let total = 0;
  const base = { arr: [...arr], lo: -1, mid: -1, hi: -1, left: [] as number[], right: [] as number[], merged: [] as number[], li: 0, ri: 0, added: 0, total: 0, pairs: [] as string[] };

  steps.push({ ...base, desc: "逆序對：i < j 但 a[i] > a[j] 的配對。兩兩比要 O(n²)。改用合併排序：合併兩個已排序的半邊時，右邊元素先出來，就代表左邊剩下的每一個都比它大，一次加一整批。", op: "開始", phase: "intro" });

  const sort = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid);
    sort(mid + 1, hi);
    const left = arr.slice(lo, mid + 1), right = arr.slice(mid + 1, hi + 1);
    const merged: number[] = [];
    const pairs: string[] = [];
    let li = 0, ri = 0, added = 0;
    const label = `合併 [${lo}, ${mid}] + [${mid + 1}, ${hi}]`;
    const snap = (desc: string, took?: "L" | "R") => steps.push({ desc, op: label, arr: [...arr], lo, mid, hi, left: [...left], right: [...right], merged: [...merged], li, ri, took, added, total, pairs: [...pairs], phase: "merge" });

    snap(`左半 [${left.join(", ")}] 和右半 [${right.join(", ")}] 都已排序。兩個指標各指開頭，每次取較小的放進結果。`);
    while (li < left.length && ri < right.length) {
      if (left[li] <= right[ri]) {
        merged.push(left[li]); li++;
        snap(`左邊 ${left[li - 1]} ≤ 右邊 ${right[ri]}，左邊先出。左邊的元素本來就在前面，不構成逆序對。`, "L");
      } else {
        const cnt = left.length - li;
        for (let t = li; t < left.length; t++) pairs.push(`(${left[t]},${right[ri]})`);
        merged.push(right[ri]); ri++;
        added += cnt; total += cnt;
        snap(`右邊 ${right[ri - 1]} < 左邊 ${left[li]}，右邊先出。左邊剩下的 ${cnt} 個（${left.slice(li).join(", ")}）原本都排在它前面又都比它大，一次加 ${cnt} 對。累計 ${total}。`, "R");
      }
    }
    if (li < left.length) {
      const rest = left.slice(li);
      merged.push(...rest); li = left.length;
      snap(`右邊用完了，左邊剩下的 ${rest.join(", ")} 直接接上。它們後面沒有更小的右邊元素，不加。這次合併共加 ${added} 對。`);
    } else if (ri < right.length) {
      const rest = right.slice(ri);
      merged.push(...rest); ri = right.length;
      snap(`左邊用完了，右邊剩下的 ${rest.join(", ")} 直接接上，沒有左邊元素比它們大，不加。這次合併共加 ${added} 對。`);
    }
    for (let i = 0; i < merged.length; i++) arr[lo + i] = merged[i];
  };
  sort(0, A.length - 1);

  // 暴力驗證
  let brute = 0;
  for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) if (A[i] > A[j]) brute++;
  steps.push({ ...base, arr: [...arr], total, desc: `排序完成，逆序對總數 ${total}（暴力兩兩比對也是 ${brute}）。每層合併 O(n)，共 log n 層，O(n log n)。8 個元素最多 28 對，${total} 對代表兩位評審的名次有 ${Math.round((total / 28) * 100)}% 的配對意見相反。`, op: "結束", phase: "done" });
  return steps;
}

export function InversionsDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const inSeg = (i: number) => s.lo >= 0 && i >= s.lo && i <= s.hi;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right="8 個名次 · 合併排序時順便數" />
      <div className="px-3.5 pt-3">
        <div className="mb-1.5 flex items-baseline gap-3">
          <span className="eyebrow">陣列（合併完成的段落已排序）</span>
          <span className="text-[12px] text-ink-3">黃色：正在合併的區段</span>
        </div>
        <div className="flex gap-1">
          {A.map((_, i) => <span key={i} className="grid w-9 place-items-center font-mono text-[10.5px] text-ink-3">{i}</span>)}
        </div>
        <Cells items={s.arr} tone={(i) => (s.phase === "done" ? CELL.green : inSeg(i) ? CELL.amber : "")} />
      </div>

      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
          <span className="text-[12px] text-ink-3">左半</span>
          <Cells items={s.left} tone={(i) => (i < s.li ? CELL.dim : s.took === "R" ? CELL.amber : i === s.li && s.phase === "merge" ? CELL.accent : "")} empty="…" />
          <span className="text-[12px] text-ink-3">右半</span>
          <Cells items={s.right} tone={(i) => (i < s.ri ? CELL.dim : i === s.ri && s.phase === "merge" && s.took !== "R" ? CELL.accent : "")} empty="…" />
          <span className="text-[12px] text-ink-3">合併結果</span>
          <Cells items={s.merged} tone={(i) => (i === s.merged.length - 1 && s.took === "R" ? CELL.green : "")} empty="空" />
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
          <div className="rounded-lg border border-line bg-surface-2 px-3 py-2">
            <div className="eyebrow mb-0.5">這次合併加了</div>
            <div className="font-mono text-[15px] tabular-nums">{s.phase === "merge" ? `+${s.added}` : "…"}</div>
            {s.pairs.length > 0 && <div className="mt-0.5 font-mono text-[11px] text-ink-3">{s.pairs.join(" ")}</div>}
          </div>
          <div className="rounded-lg bg-accent-soft px-3 py-2">
            <div className="eyebrow mb-0.5">累計逆序對</div>
            <div className="font-mono text-[17px] font-semibold tabular-nums">{s.total}</div>
          </div>
        </div>
      </div>
      <div className="px-3.5 pb-2 text-[12px] text-ink-3">左右半邊：藍色是下一次要比較的兩個元素，灰色是已取走。右邊元素先出（綠色）時，左邊還沒取走的全部（黃色）各算一對。</div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
