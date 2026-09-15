"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const ARR = [5, 2, 9, 1, 7, 3, 8, 4];

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

function buildSteps(): Step[] {
  const a = [...ARR];
  const n = a.length;
  const steps: Step[] = [];
  let compares = 0;
  let swaps = 0;
  const snap = (desc: string, op: string, i: number, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, arr: [...a], i, compares, swaps, ...extra });

  snap("每一輪在「還沒排好的區域」裡找最小值，然後和這一輪的第一格交換。左邊排好的區域每輪長一格。", "開始", 0);
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    const label = `第 ${i + 1} 輪`;
    snap(`第 ${i + 1} 輪：從索引 ${i} 開始掃，先假設 ${a[i]} 是最小的。`, label, i, { min });
    for (let j = i + 1; j < n; j++) {
      compares++;
      if (a[j] < a[min]) {
        const prev = a[min];
        min = j;
        snap(`${a[j]} 比目前最小的 ${prev} 更小，${a[j]} 成為新的最小值候選。`, label, i, { j, min });
      } else {
        snap(`${a[j]} 不比 ${a[min]} 小，最小值候選不變。`, label, i, { j, min });
      }
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      swaps++;
      snap(`掃完了，最小值是 ${a[i]}（索引 ${min}）。和索引 ${i} 的 ${a[min]} 交換，這輪只做這一次交換。`, label, i + 1, { swap: [i, min] });
    } else {
      snap(`掃完了，最小值 ${a[i]} 本來就在索引 ${i}，不用交換。`, label, i + 1, { min: i });
    }
  }
  snap(`排序完成。比較 ${compares} 次（永遠是 n(n−1)/2，不管資料多有序），交換只有 ${swaps} 次（最多 n−1 次）。`, "結束", n);
  return steps;
}

export function SelectionSortDemo() {
  const steps = useMemo(() => buildSteps(), []);
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
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`[${ARR.join(", ")}] · 由小到大`} />
      <div className="p-3.5">
        <div className="eyebrow mb-2">陣列</div>
        <Cells items={s.arr} tone={tone} />
        <div className="mt-2 text-[12px] text-ink-3">黃色是目前的最小值候選，藍色是正在看的格子或剛交換的兩格，綠色是左邊已排好的區域</div>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-line px-3.5 py-3 text-[13px] md:grid-cols-3">
        <div><div className="eyebrow mb-1">比較次數</div><span className="font-mono text-[15px] tabular-nums">{s.compares}</span></div>
        <div><div className="eyebrow mb-1">交換次數</div><span className="font-mono text-[15px] tabular-nums">{s.swaps}</span></div>
        <div><div className="eyebrow mb-1">已排好</div><span className="font-mono text-[15px] tabular-nums">{Math.min(s.i, ARR.length)} / {ARR.length}</span></div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
