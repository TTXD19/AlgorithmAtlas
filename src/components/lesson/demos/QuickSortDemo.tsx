"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const ARR = [5, 2, 9, 1, 7, 3, 8, 4];

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

function buildSteps(): Step[] {
  const a = [...ARR];
  const steps: Step[] = [];
  const fixed: number[] = [];
  const snap = (desc: string, op: string, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, arr: [...a], fixed: [...fixed], ...extra });

  snap("Lomuto 分割：取範圍最後一個元素當 pivot，用指標 j 從左掃到右，把 ≤ pivot 的元素往前集中到 i 之前，最後把 pivot 放到 i+1，它就永遠定位了。", "開始");

  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      fixed.push(lo);
      return;
    }
    const p = a[hi];
    const label = `partition(${lo}, ${hi})`;
    let i = lo - 1;
    snap(`處理範圍 [${lo}..${hi}]，pivot 取最後一個元素 ${p}。i 從 ${lo - 1} 開始，代表「≤ pivot 區」目前是空的。`, label, { range: [lo, hi], pivot: hi, i });
    for (let j = lo; j < hi; j++) {
      if (a[j] <= p) {
        i++;
        const moved = a[j];
        [a[i], a[j]] = [a[j], a[i]];
        snap(
          i === j
            ? `a[${j}] = ${moved} ≤ ${p}，i 前進到 ${i}，剛好就是 j，交換自己不動。`
            : `a[${j}] = ${moved} ≤ ${p}，i 前進到 ${i}，把 ${moved} 換到 i 的位置（和 ${a[j]} 交換）。`,
          label, { range: [lo, hi], pivot: hi, i, j, swap: [i, j] },
        );
      } else {
        snap(`a[${j}] = ${a[j]} > ${p}，留在右邊，j 繼續往右。`, label, { range: [lo, hi], pivot: hi, i, j });
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    fixed.push(i + 1);
    /** 描述分割後的一邊：空的、只剩一個（自然定位）、或還要遞迴 */
    const side = (name: string, l: number, r: number, rel: string) =>
      r < l ? `${name}是空的` : l === r ? `${name}只剩 ${a[l]} 一個，不用再分割` : `${name} [${l}..${r}] 全部 ${rel} ${p}，還要遞迴`;
    const place = i + 1 === hi ? `掃完了，i+1 = ${hi} 剛好就是 pivot 所在的位置，不用移動` : `掃完了，把 pivot ${p} 換到 i+1 = ${i + 1}`;
    const skewed = hi - lo >= 2 && (i < lo || i + 1 === hi)
      ? `這次 ${p} 是範圍裡的${i < lo ? "最小值" : "最大值"}，其餘 ${hi - lo} 個全落在同一邊，範圍只縮小 1，這就是最壞情況的樣子。`
      : "";
    snap(`${place}，${p} 定位完成。${side("左邊", lo, i, "≤")}；${side("右邊", i + 2, hi, ">")}。${skewed}`, label, { range: [lo, hi], pivot: i + 1, swap: i + 1 === hi ? undefined : [i + 1, hi] });
    sort(lo, i);
    sort(i + 2, hi);
  };
  sort(0, a.length - 1);
  snap("排序完成。每層分割合計掃 O(n)，pivot 切得均勻就只有 log n 層，平均 O(n log n)。[2, 1, 3] 裡的 3、右半的 5 和 7 都是當時範圍裡的極值，每次只少一個元素；如果每次都這樣（例如已排序的資料固定取尾端），會變成 n 層、O(n²)。實務上隨機選 pivot 來避免。", "結束");
  return steps;
}

export function QuickSortDemo() {
  const steps = useMemo(() => buildSteps(), []);
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
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`[${ARR.join(", ")}] · Lomuto 分割`} />
      <div className="p-3.5">
        <div className="eyebrow mb-2">陣列</div>
        <Cells items={s.arr} tone={tone} />
        <div className="mt-1 flex gap-1">
          {marks.map((m, idx) => (
            <span key={idx} className="grid h-4 w-9 place-items-center font-mono text-[10.5px] text-ink-3">{m}</span>
          ))}
        </div>
        <div className="mt-1.5 text-[12px] text-ink-3">黃色是 pivot，藍色是剛交換的兩格，綠色是已定位的元素，灰色在目前範圍之外。i 是 ≤ pivot 區的右界，j 是掃描指標，p 標出 pivot。</div>
      </div>
      {s.range && s.i !== undefined && (
        <div className="grid grid-cols-2 gap-3 border-t border-line px-3.5 py-3 text-[13px] md:grid-cols-3">
          <div><div className="eyebrow mb-1">≤ pivot 區</div><span className="font-mono text-[13px] tabular-nums">{s.i >= s.range[0] ? `[${s.arr.slice(s.range[0], s.i + 1).join(", ")}]` : "空"}</span></div>
          <div><div className="eyebrow mb-1">&gt; pivot 區</div><span className="font-mono text-[13px] tabular-nums">{s.j !== undefined && s.j > s.i ? `[${s.arr.slice(s.i + 1, s.j + 1).join(", ")}]` : "空"}</span></div>
          <div><div className="eyebrow mb-1">還沒看</div><span className="font-mono text-[13px] tabular-nums">{(() => { const from = s.j === undefined ? s.range[0] : s.j + 1; return from < s.range[1] ? `[${s.arr.slice(from, s.range[1]).join(", ")}]` : "空"; })()}</span></div>
        </div>
      )}
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
