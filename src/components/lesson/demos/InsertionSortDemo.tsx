"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, CELL } from "./StepBar";

const ARR = [5, 2, 9, 1, 7, 3, 8, 4];

interface Step {
  desc: string;
  op: string;
  /** 陣列內容，null 代表這格是「洞」（牌被拿在手上） */
  arr: (number | null)[];
  /** 手上的牌 */
  key?: number;
  /** 已排序區的右界（不含） */
  sortedEnd: number;
  /** 剛和手上的牌比較過的元素所在索引（被挪動的話是挪動後的位置） */
  cmp?: number;
  /** 剛插入的位置 */
  placed?: number;
  compares: number;
  shifts: number;
}

function buildSteps(): Step[] {
  const a: (number | null)[] = [...ARR];
  const n = a.length;
  const steps: Step[] = [];
  let compares = 0;
  let shifts = 0;
  const snap = (desc: string, op: string, sortedEnd: number, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, arr: [...a], sortedEnd, compares, shifts, ...extra });

  snap("把陣列想成一手撲克牌。左邊一張牌自己就是有序的；之後每次拿起下一張，往左找到它該在的位置插進去。", "開始", 1);
  for (let i = 1; i < n; i++) {
    const key = a[i] as number;
    const label = `插入 ${key}`;
    a[i] = null;
    // 插入進行中，已排序區含洞共 i + 1 格
    snap(`拿起索引 ${i} 的 ${key}。左邊 ${i} 張已經有序，要把它插到正確位置。`, label, i + 1, { key });
    let j = i - 1;
    while (j >= 0) {
      const v = a[j] as number;
      compares++;
      if (v > key) {
        a[j + 1] = v;
        a[j] = null;
        shifts++;
        snap(`${v} 比 ${key} 大，${v} 往右挪一格，洞往左移。`, label, i + 1, { key, cmp: j + 1 });
        j--;
      } else {
        snap(`${v} 不比 ${key} 大，停下來。${key} 就插在 ${v} 的右邊。`, label, i + 1, { key, cmp: j });
        break;
      }
    }
    a[j + 1] = key;
    snap(j < 0 ? `一路挪到最左邊，${key} 放在索引 0。` : `${key} 放進索引 ${j + 1}，左邊 ${i + 1} 張又是有序的了。`, label, i + 1, { placed: j + 1 });
  }
  snap(`排序完成。挪動 ${shifts} 次，正好是逆序對的數量；比較 ${compares} 次，是 ${shifts} 次挪動加上 ${compares - shifts} 次讓迴圈停下的比較，所以落在 ${shifts} 到 ${shifts} + (n−1) = ${shifts + n - 1} 之間。資料越接近有序，挪動越少，全有序時只要 n−1 次比較。`, "結束", n);
  return steps;
}

export function InsertionSortDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const tone = (i: number, v: number | null) => {
    if (v === null) return "border-dashed border-line-strong bg-surface-2 text-ink-3";
    if (i === s.placed) return CELL.accent;
    if (i === s.cmp) return CELL.amber;
    if (i < s.sortedEnd) return CELL.green;
    return "border-line-strong bg-surface";
  };
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`[${ARR.join(", ")}] · 由小到大`} />
      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[minmax(0,1fr)_120px]">
        <div>
          <div className="eyebrow mb-2">陣列（虛線格是洞）</div>
          <div className="flex flex-wrap gap-1">
            {s.arr.map((v, i) => (
              <span key={i} className={`grid h-8 w-9 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${tone(i, v)}`}>{v ?? "·"}</span>
            ))}
          </div>
          <div className="mt-2 text-[12px] text-ink-3">綠色是已排序區，黃色是剛和手上的牌比較過的元素，藍色是剛插入的位置</div>
        </div>
        <div>
          <div className="eyebrow mb-2">手上的牌</div>
          {s.key !== undefined ? (
            <span className={`grid h-8 w-9 place-items-center rounded-md border font-mono text-[13px] ${CELL.accent}`}>{s.key}</span>
          ) : (
            <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-8 text-ink-3">空</span>
          )}
          <div className="mt-2 text-[12px] text-ink-3">比較 <span className="font-mono tabular-nums">{s.compares}</span> 次</div>
          <div className="text-[12px] text-ink-3">挪動 <span className="font-mono tabular-nums">{s.shifts}</span> 次</div>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
