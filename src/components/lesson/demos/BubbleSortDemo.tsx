"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** 所有排序示範共用的陣列 */
const ARR = [5, 2, 9, 1, 7, 3, 8, 4];

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

function buildSteps(): Step[] {
  const a = [...ARR];
  const n = a.length;
  const steps: Step[] = [];
  let compares = 0;
  let swaps = 0;
  let fixedFrom = n;
  const snap = (desc: string, op: string, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, arr: [...a], swapped: false, fixedFrom, compares, swaps, ...extra });

  snap("從左到右比較相鄰兩格，大的往右換。每掃完一輪，目前最大的那個一定被推到尾端，尾端就固定了。", "開始");
  for (let pass = 0; pass < n - 1; pass++) {
    let swappedThisPass = false;
    for (let j = 0; j < n - 1 - pass; j++) {
      compares++;
      const label = `第 ${pass + 1} 輪`;
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        swappedThisPass = true;
        const after = j + 1 === n - 1 - pass ? "到達這一輪的尾端。" : "往右移一格，下一步再和它右邊的比。";
        snap(`比較 ${a[j + 1]} 和 ${a[j]}：左邊比較大，交換。${a[j + 1]} ${after}`, label, { cmp: [j, j + 1], swapped: true });
      } else {
        snap(`比較 ${a[j]} 和 ${a[j + 1]}：順序正確，不動。`, label, { cmp: [j, j + 1] });
      }
    }
    fixedFrom = n - 1 - pass;
    if (!swappedThisPass) {
      fixedFrom = 0;
      snap(`第 ${pass + 1} 輪一次交換都沒有：前 ${n - pass} 格已經由小到大，後面又是固定好的最大值，整個陣列已經有序，提前結束。已經有序的輸入正是靠這個檢查只掃一輪、O(n)。`, `第 ${pass + 1} 輪結束`);
      break;
    }
    if (fixedFrom === 1) {
      fixedFrom = 0;
      snap(`第 ${pass + 1} 輪結束，${a[1]} 固定在索引 1，剩下的索引 0 只有一格，自然也就定位了。`, `第 ${pass + 1} 輪結束`);
    } else {
      snap(`第 ${pass + 1} 輪結束，${a[fixedFrom]} 是還沒固定的格子裡最大的，固定在索引 ${fixedFrom}。下一輪只掃前 ${fixedFrom} 格。`, `第 ${pass + 1} 輪結束`);
    }
  }
  fixedFrom = 0;
  snap(`排序完成。比較 ${compares} 次（沒有提前結束要 n(n−1)/2 = ${(n * (n - 1)) / 2} 次）、交換 ${swaps} 次。交換次數正好等於原陣列的逆序對數量，完全反序時最多，也是 ${(n * (n - 1)) / 2} 次。`, "結束");
  return steps;
}

export function BubbleSortDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const tone = (i: number) => {
    if (s.cmp && (i === s.cmp[0] || i === s.cmp[1])) return s.swapped ? CELL.accent : CELL.amber;
    if (i >= s.fixedFrom) return CELL.green;
    return "";
  };
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`[${ARR.join(", ")}] · 由小到大`} />
      <div className="p-3.5">
        <div className="eyebrow mb-2">陣列</div>
        <Cells items={s.arr} tone={tone} />
        <div className="mt-2 text-[12px] text-ink-3">黃色是正在比較的兩格（沒交換），藍色是比較後交換了的兩格，綠色是已固定的尾端</div>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-line px-3.5 py-3 text-[13px] md:grid-cols-3">
        <div><div className="eyebrow mb-1">比較次數</div><span className="font-mono text-[15px] tabular-nums">{s.compares}</span></div>
        <div><div className="eyebrow mb-1">交換次數</div><span className="font-mono text-[15px] tabular-nums">{s.swaps}</span></div>
        <div><div className="eyebrow mb-1">已固定</div><span className="font-mono text-[15px] tabular-nums">{ARR.length - s.fixedFrom} / {ARR.length}</span></div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
