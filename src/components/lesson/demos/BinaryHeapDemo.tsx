"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

/** 最小堆積：一段固定的操作腳本，拆成逐步的比較與交換。 */
type Op = { kind: "push"; v: number } | { kind: "pop" };
const SCRIPT: Op[] = [
  { kind: "push", v: 7 }, { kind: "push", v: 3 }, { kind: "push", v: 9 }, { kind: "push", v: 1 },
  { kind: "push", v: 4 }, { kind: "push", v: 8 }, { kind: "pop" }, { kind: "pop" },
];

const TEXT = demoText(
  {
    intro: "堆積是空的。它是一棵用陣列存的完全二元樹：索引 i 的父節點在 (i−1)/2，子節點在 2i+1 與 2i+2。",
    opStart: "開始",
    opEnd: "結束",
    pushPlaced: (v: number, i: number) => `把 ${v} 放到陣列尾端（索引 ${i}），也就是樹的最底層最左邊的空位。接著往上調整（sift up）。`,
    cmpParent: (i: number, vi: number, p: number, vp: number) => `比較索引 ${i} 的 ${vi} 和父節點索引 ${p} 的 ${vp}。`,
    swapUp: (child: number, parent: number) => `${child} 比父節點 ${parent} 小，違反最小堆積性質，交換。`,
    reachedRoot: (v: number) => `${v} 到達根節點，它是目前的最小值。sift up 結束。`,
    siftUpDone: (vi: number, vp: number) => `${vi} 不小於父節點 ${vp}，位置正確，sift up 結束。`,
    popMoved: (top: number, last: number) => `取出根節點 ${top}，那是最小值。把尾端的 ${last} 搬到根，維持完全二元樹的形狀，接著往下調整（sift down）。`,
    popEmpty: (top: number) => `取出根節點 ${top}，堆積空了。`,
    noChild: (i: number) => `索引 ${i} 沒有子節點，sift down 結束。`,
    twoChildren: (vl: number, vr: number, vc: number, c: number, vi: number) => `子節點 ${vl} 與 ${vr}，較小的是 ${vc}（索引 ${c}），和 ${vi} 比較。`,
    oneChild: (vl: number, vi: number) => `只有一個子節點 ${vl}，和 ${vi} 比較。`,
    swapDown: (parent: number, child: number) => `${parent} 比子節點 ${child} 大，交換往下。`,
    siftDownDone: (v: number) => `${v} 不大於任何子節點，位置正確，sift down 結束。`,
    finish: "腳本結束。每次 push 或 pop 最多沿著樹高走一趟，樹高是 log n，所以都是 O(log n)。",
    scriptNote: "最小堆積 · 腳本：push 7, 3, 9, 1, 4, 8 → pop ×2",
    treeAlt: "堆積的樹狀視角",
    arrayView: "陣列視角",
    minRoot: "最小值（根）",
    justPopped: "剛取出",
  },
  {
    en: {
      intro: "The heap is empty. It is a complete binary tree stored in an array: the parent of index i sits at (i−1)/2, and its children at 2i+1 and 2i+2.",
      opStart: "Start",
      opEnd: "Done",
      pushPlaced: (v: number, i: number) => `Put ${v} at the end of the array (index ${i}), which is the leftmost free slot on the bottom level of the tree. Now sift it up.`,
      cmpParent: (i: number, vi: number, p: number, vp: number) => `Compare ${vi} at index ${i} with its parent ${vp} at index ${p}.`,
      swapUp: (child: number, parent: number) => `${child} is smaller than its parent ${parent}, which breaks the min-heap property, so swap them.`,
      reachedRoot: (v: number) => `${v} has reached the root, so it is the current minimum. The sift up ends here.`,
      siftUpDone: (vi: number, vp: number) => `${vi} is not smaller than its parent ${vp}, so it is already in the right place and the sift up ends here.`,
      popMoved: (top: number, last: number) => `Take the root, ${top} — that is the minimum. Move the last element, ${last}, into the root to keep the tree complete, then sift it down.`,
      popEmpty: (top: number) => `Take the root, ${top}. The heap is now empty.`,
      noChild: (i: number) => `Index ${i} has no children, so the sift down ends here.`,
      twoChildren: (vl: number, vr: number, vc: number, c: number, vi: number) => `The children are ${vl} and ${vr}; the smaller one is ${vc} at index ${c}. Compare it with ${vi}.`,
      oneChild: (vl: number, vi: number) => `There is only one child, ${vl}. Compare it with ${vi}.`,
      swapDown: (parent: number, child: number) => `${parent} is larger than its child ${child}, so swap it down.`,
      siftDownDone: (v: number) => `${v} is no larger than either child, so it is in the right place and the sift down ends here.`,
      finish: "The script is finished. A push or a pop walks at most the height of the tree, and that height is log n, so both are O(log n).",
      scriptNote: "Min-heap · script: push 7, 3, 9, 1, 4, 8 → pop ×2",
      treeAlt: "Tree view of the heap",
      arrayView: "Array view",
      minRoot: "Minimum (root)",
      justPopped: "Just popped",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  heap: number[];
  /** 正在比較的兩個索引 */
  cmp?: [number, number];
  /** 剛交換的兩個索引 */
  swap?: [number, number];
  /** 剛取出的值 */
  popped?: number;
  /** 目前在做哪個操作 */
  op: string;
}

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const h: number[] = [];
  const snap = (s: Omit<Step, "heap">) => steps.push({ ...s, heap: [...h] });
  const parent = (i: number) => Math.floor((i - 1) / 2);

  snap({ desc: t.intro, op: t.opStart });
  for (const op of SCRIPT) {
    if (op.kind === "push") {
      const label = `push(${op.v})`;
      h.push(op.v);
      let i = h.length - 1;
      snap({ desc: t.pushPlaced(op.v, i), op: label, swap: [i, i] });
      while (i > 0) {
        const p = parent(i);
        snap({ desc: t.cmpParent(i, h[i], p, h[p]), op: label, cmp: [i, p] });
        if (h[i] < h[p]) {
          [h[i], h[p]] = [h[p], h[i]];
          snap({ desc: t.swapUp(h[p], h[i]), op: label, swap: [i, p] });
          i = p;
          if (i === 0) snap({ desc: t.reachedRoot(h[0]), op: label });
        } else {
          snap({ desc: t.siftUpDone(h[i], h[p]), op: label });
          break;
        }
      }
    } else {
      const label = "pop()";
      const top = h[0];
      const last = h.pop()!;
      if (h.length) h[0] = last;
      snap({
        desc: h.length ? t.popMoved(top, last) : t.popEmpty(top),
        op: label, popped: top, swap: h.length ? [0, 0] : undefined,
      });
      let i = 0;
      while (h.length) {
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l >= h.length) { snap({ desc: t.noChild(i), op: label, popped: top }); break; }
        const c = r < h.length && h[r] < h[l] ? r : l;
        snap({ desc: r < h.length ? t.twoChildren(h[l], h[r], h[c], c, h[i]) : t.oneChild(h[l], h[i]), op: label, cmp: [i, c], popped: top });
        if (h[c] < h[i]) {
          [h[c], h[i]] = [h[i], h[c]];
          snap({ desc: t.swapDown(h[c], h[i]), op: label, swap: [i, c], popped: top });
          i = c;
        } else {
          snap({ desc: t.siftDownDone(h[i]), op: label, popped: top });
          break;
        }
      }
    }
  }
  snap({ desc: t.finish, op: t.opEnd });
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

/** 樹的座標：最多 4 層（15 個節點） */
function nodePos(i: number, total: number) {
  const depth = Math.floor(Math.log2(i + 1));
  const levels = Math.max(1, Math.floor(Math.log2(Math.max(total, 1))) + 1);
  const idxInLevel = i - (2 ** depth - 1);
  const slots = 2 ** depth;
  const x = 40 + ((idxInLevel + 0.5) / slots) * 560;
  const y = 28 + depth * (levels > 3 ? 52 : 58);
  return { x, y };
}

export function BinaryHeapDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const n = s.heap.length;
  const cls = (i: number) =>
    s.swap && s.swap.includes(i) ? "swap" : s.cmp && s.cmp.includes(i) ? "cmp" : "";

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>{ui.demo.prev}</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(steps.length - 1, x + 1))} disabled={k === steps.length - 1}>{ui.demo.next}</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>{ui.demo.reset}</button>
        </div>
        <span className="font-mono text-[12.5px] text-ink">{s.op}</span>
        <span className="ml-auto text-[12px] text-ink-3">{t.scriptNote}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_200px]">
        <svg viewBox="0 0 640 210" className="block h-auto w-full" role="img" aria-label={t.treeAlt}>
          {s.heap.map((_, i) => {
            if (i === 0) return null;
            const p = Math.floor((i - 1) / 2);
            const a = nodePos(p, n), b = nodePos(i, n);
            return <line key={`e${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--line-strong)" strokeWidth="1.5" />;
          })}
          {s.heap.map((v, i) => {
            const { x, y } = nodePos(i, n);
            const c = cls(i);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="17" fill={c === "swap" ? "var(--accent)" : c === "cmp" ? "var(--amber-soft)" : "var(--surface)"} stroke={c === "swap" ? "var(--accent)" : c === "cmp" ? "var(--amber)" : "var(--line-strong)"} strokeWidth={c ? 2 : 1.5} />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fontFamily="var(--font-mono)" fill={c === "swap" ? "var(--accent-ink)" : "var(--ink)"}>{v}</text>
                <text x={x} y={y + 27} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--ink-3)">[{i}]</text>
              </g>
            );
          })}
          {n === 0 && <text x="320" y="100" textAnchor="middle" fontSize="12" fill="var(--ink-3)">{ui.demo.empty}</text>}
        </svg>

        <div className="flex flex-col gap-3 border-t border-line p-4 text-[13px] md:border-t-0 md:border-l">
          <div>
            <div className="eyebrow mb-1.5">{t.arrayView}</div>
            <div className="flex flex-wrap gap-1">
              {s.heap.map((v, i) => {
                const c = cls(i);
                return (
                  <span key={i} className={`grid h-8 w-8 place-items-center rounded-md border font-mono text-[13px] ${
                    c === "swap" ? "border-accent bg-accent text-accent-ink" : c === "cmp" ? "border-amber bg-amber-soft text-amber" : "border-line-strong bg-surface"
                  }`}>{v}</span>
                );
              })}
              {n === 0 && <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-8 text-ink-3">{ui.demo.empty}</span>}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1.5">{t.minRoot}</div>
            <div className="font-mono text-[18px] font-medium tabular-nums">{n ? s.heap[0] : "—"}</div>
          </div>
          {s.popped !== undefined && (
            <div>
              <div className="eyebrow mb-1.5">{t.justPopped}</div>
              <span className="inline-grid h-8 w-8 place-items-center rounded-md border border-green bg-green-soft font-mono text-[13px] text-green">{s.popped}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">{ui.demo.step} {k}/{steps.length - 1}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}
