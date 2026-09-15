"use client";

import { useMemo, useState } from "react";
import { BinaryTreeSVG, type BNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const ARR = [5, 2, 9, 1, 7, 3, 8, 4];

interface Step {
  desc: string;
  op: string;
  arr: number[];
  /** 堆積的大小（之後的尾端已排好） */
  heapSize: number;
  /** 正在比較的索引（父與子） */
  cmp?: number[];
  /** 剛交換的兩格 */
  swap?: [number, number];
}

function buildSteps(): Step[] {
  const a = [...ARR];
  const n = a.length;
  const steps: Step[] = [];
  let heapSize = n;
  const snap = (desc: string, op: string, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, arr: [...a], heapSize, ...extra });

  const siftDown = (start: number, op: string, phase: "build" | "extract") => {
    let i = start;
    for (;;) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let big = i;
      if (l < heapSize && a[l] > a[big]) big = l;
      if (r < heapSize && a[r] > a[big]) big = r;
      const kids = [l, r].filter((c) => c < heapSize);
      if (kids.length === 0) {
        if (phase === "build" && i === start) snap(`索引 ${i} 的 ${a[i]} 沒有子節點，不用動。`, op, { cmp: [i] });
        else snap(`${a[i]} 到達葉節點，sift down 結束。`, op, { cmp: [i] });
        return;
      }
      if (big === i) {
        snap(`索引 ${i} 的 ${a[i]} 不小於子節點 ${kids.map((c) => a[c]).join("、")}，最大堆積性質成立，停下。`, op, { cmp: [i, ...kids] });
        return;
      }
      const before = a[i];
      [a[i], a[big]] = [a[big], a[i]];
      snap(`索引 ${i} 的 ${before} 比子節點 ${a[i]} 小，和較大的子節點交換，繼續往下。`, op, { cmp: [i, ...kids], swap: [i, big] });
      i = big;
    }
  };

  snap("堆積排序分兩個階段：先把陣列原地整理成最大堆積（heapify），再反覆把堆頂（最大值）換到尾端、縮小堆積、修復堆頂。", "開始");
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    siftDown(i, `heapify：索引 ${i}`, "build");
  }
  snap(`heapify 完成，${a[0]} 在堆頂。從最後一個非葉節點往前做 sift down，總成本是 O(n)，不是 O(n log n)。`, "heapify 完成");
  for (let end = n - 1; end >= 1; end--) {
    const top = a[0];
    [a[0], a[end]] = [a[end], a[0]];
    heapSize = end;
    snap(`把堆頂 ${top} 和堆積最後一個元素 ${a[0]} 交換，${top} 落到索引 ${end}，堆積縮小成 ${heapSize} 個。`, `取出 ${top}`, { swap: [0, end] });
    if (heapSize > 1) siftDown(0, `取出 ${top}`, "extract");
  }
  heapSize = 0;
  snap("排序完成。每次取出後修復堆頂是 O(log n)，取 n 次，總共 O(n log n)。整個過程只用了陣列本身，額外空間 O(1)。", "結束");
  return steps;
}

function toTree(arr: number[], size: number, i = 0): BNode | null {
  if (i >= size) return null;
  return { v: arr[i], l: toTree(arr, size, 2 * i + 1), r: toTree(arr, size, 2 * i + 2) };
}

/** 把值對應回堆積索引：同一個值在陣列裡只出現一次，所以可以直接查 */
function indexOf(arr: number[], v: number | string) {
  return arr.indexOf(v as number);
}

export function HeapSortDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const tree = toTree(s.arr, s.heapSize);
  const tone = (i: number) => {
    if (s.swap && (i === s.swap[0] || i === s.swap[1])) return CELL.accent;
    if (s.cmp && s.cmp.includes(i)) return CELL.amber;
    if (i >= s.heapSize) return CELL.green;
    return "";
  };
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`[${ARR.join(", ")}] · 最大堆積 · 由小到大`} />
      <BinaryTreeSVG
        root={tree}
        height={26 + 4 * 56}
        empty="堆積已空"
        tone={(nd) => {
          const i = indexOf(s.arr, nd.v);
          if (s.swap && (i === s.swap[0] || i === s.swap[1]) && i < s.heapSize) return "accent";
          if (s.cmp && s.cmp.includes(i)) return "amber";
          return "none";
        }}
        sub={(nd) => `[${indexOf(s.arr, nd.v)}]`}
      />
      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-2">陣列（前 {s.heapSize} 格是堆積，綠色尾端已排好）</div>
        <Cells items={s.arr} tone={tone} />
        <div className="mt-2 text-[12px] text-ink-3">黃色是正在比較的父子節點，藍色是剛交換的兩格。樹只畫堆積的部分，節點下方是它在陣列裡的索引。</div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
