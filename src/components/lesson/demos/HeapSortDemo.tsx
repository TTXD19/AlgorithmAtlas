"use client";

import { useMemo, useState } from "react";
import { BinaryTreeSVG, type BNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";
import { DemoInput } from "./DemoInput";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const DEFAULT = [5, 2, 9, 1, 7, 3, 8, 4];

const TEXT = demoText(
  {
    sep: "、",
    opStart: "開始",
    opHeapify: (i: number) => `heapify：索引 ${i}`,
    opHeapifyDone: "heapify 完成",
    opExtract: (v: number) => `取出 ${v}`,
    opEnd: "結束",

    noChildren: (i: number, v: number) => `索引 ${i} 的 ${v} 沒有子節點，不用動。`,
    atLeaf: (v: number) => `${v} 到達葉節點，sift down 結束。`,
    holds: (i: number, v: number, kids: string) => `索引 ${i} 的 ${v} 不小於子節點 ${kids}，最大堆積性質成立，停下。`,
    swapDown: (i: number, before: number, child: number) => `索引 ${i} 的 ${before} 比子節點 ${child} 小，和較大的子節點交換，繼續往下。`,

    intro: "堆積排序分兩個階段：先把陣列原地整理成最大堆積（heapify），再反覆把堆頂（最大值）換到尾端、縮小堆積、修復堆頂。",
    heapified: (top: number) => `heapify 完成，${top} 在堆頂。從最後一個非葉節點往前做 sift down，總成本是 O(n)，不是 O(n log n)。`,
    extract: (top: number, last: number, end: number, size: number) =>
      `把堆頂 ${top} 和堆積最後一個元素 ${last} 交換，${top} 落到索引 ${end}，堆積縮小成 ${size} 個。`,
    finished: "排序完成。每次取出後修復堆頂是 O(log n)，取 n 次，總共 O(n log n)。整個過程只用了陣列本身，額外空間 O(1)。",

    right: (arr: string) => `[${arr}] · 最大堆積 · 由小到大`,
    emptyHeap: "堆積已空",
    arrTitle: (size: number) => `陣列（前 ${size} 格是堆積，綠色尾端已排好）`,
    note: "黃色是正在比較的父子節點，藍色是剛交換的兩格。樹只畫堆積的部分，節點下方是它在陣列裡的索引。",
  },
  {
    en: {
      sep: ", ",
      opStart: "Start",
      opHeapify: (i: number) => `heapify: index ${i}`,
      opHeapifyDone: "heapify done",
      opExtract: (v: number) => `Extract ${v}`,
      opEnd: "Done",

      noChildren: (i: number, v: number) => `The ${v} at index ${i} has no children, so there is nothing to do.`,
      atLeaf: (v: number) => `${v} has reached a leaf, so the sift down is over.`,
      holds: (i: number, v: number, kids: string) =>
        `The ${v} at index ${i} is not smaller than ${kids.includes(",") ? "its children" : "its child"} ${kids}, so the max-heap property holds and we stop.`,
      swapDown: (i: number, before: number, child: number) =>
        `The ${before} at index ${i} is smaller than its child ${child}, so swap it with the larger child and carry on downwards.`,

      intro: "Heap sort runs in two phases: first rearrange the array in place into a max-heap (heapify), then repeatedly swap the root — the largest value — to the tail, shrink the heap, and repair the root.",
      heapified: (top: number) => `heapify is finished and ${top} sits at the root. Sifting down from the last non-leaf node backwards costs O(n) in total, not O(n log n).`,
      extract: (top: number, last: number, end: number, size: number) =>
        `Swap the root ${top} with ${last}, the last element of the heap. ${top} lands at index ${end} and the heap shrinks to ${size} element${size === 1 ? "" : "s"}.`,
      finished: "The array is sorted. Repairing the root after each extraction is O(log n) and there are n extractions, so O(n log n) altogether. Everything happened inside the array itself, so the extra space is O(1).",

      right: (arr: string) => `[${arr}] · max-heap · ascending`,
      emptyHeap: "The heap is empty",
      arrTitle: (size: number) => `Array (the first ${size} ${size === 1 ? "cell is" : "cells are"} the heap; the green tail is already sorted)`,
      note: "Amber marks the parent and children being compared, and blue marks the two cells just swapped. The tree draws only the heap part, and the number under each node is its index in the array.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

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

function buildSteps(t: T, arr: number[]): Step[] {
  const a = [...arr];
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
        if (phase === "build" && i === start) snap(t.noChildren(i, a[i]), op, { cmp: [i] });
        else snap(t.atLeaf(a[i]), op, { cmp: [i] });
        return;
      }
      if (big === i) {
        snap(t.holds(i, a[i], kids.map((c) => a[c]).join(t.sep)), op, { cmp: [i, ...kids] });
        return;
      }
      const before = a[i];
      [a[i], a[big]] = [a[big], a[i]];
      snap(t.swapDown(i, before, a[i]), op, { cmp: [i, ...kids], swap: [i, big] });
      i = big;
    }
  };

  snap(t.intro, t.opStart);
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    siftDown(i, t.opHeapify(i), "build");
  }
  snap(t.heapified(a[0]), t.opHeapifyDone);
  for (let end = n - 1; end >= 1; end--) {
    const top = a[0];
    [a[0], a[end]] = [a[end], a[0]];
    heapSize = end;
    snap(t.extract(top, a[0], end, heapSize), t.opExtract(top), { swap: [0, end] });
    if (heapSize > 1) siftDown(0, t.opExtract(top), "extract");
  }
  heapSize = 0;
  snap(t.finished, t.opEnd);
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
  const t = TEXT[useLocale()];
  const [arr, setArr] = useState(DEFAULT);
  const steps = useMemo(() => buildSteps(t, arr), [t, arr]);
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
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.right(arr.join(", "))} />
      <DemoInput value={arr} defaults={DEFAULT} onChange={(a) => { setArr(a); setK(0); }} />
      <BinaryTreeSVG
        root={tree}
        height={26 + 4 * 56}
        empty={t.emptyHeap}
        tone={(nd) => {
          const i = indexOf(s.arr, nd.v);
          if (s.swap && (i === s.swap[0] || i === s.swap[1]) && i < s.heapSize) return "accent";
          if (s.cmp && s.cmp.includes(i)) return "amber";
          return "none";
        }}
        sub={(nd) => `[${indexOf(s.arr, nd.v)}]`}
      />
      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-2">{t.arrTitle(s.heapSize)}</div>
        <Cells items={s.arr} tone={tone} />
        <div className="mt-2 text-[12px] text-ink-3">{t.note}</div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
