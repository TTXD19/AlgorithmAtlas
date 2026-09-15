"use client";

import { useMemo, useState } from "react";

/** 最小堆積：一段固定的操作腳本，拆成逐步的比較與交換。 */
type Op = { kind: "push"; v: number } | { kind: "pop" };
const SCRIPT: Op[] = [
  { kind: "push", v: 7 }, { kind: "push", v: 3 }, { kind: "push", v: 9 }, { kind: "push", v: 1 },
  { kind: "push", v: 4 }, { kind: "push", v: 8 }, { kind: "pop" }, { kind: "pop" },
];

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

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const h: number[] = [];
  const snap = (s: Omit<Step, "heap">) => steps.push({ ...s, heap: [...h] });
  const parent = (i: number) => Math.floor((i - 1) / 2);

  snap({ desc: "堆積是空的。它是一棵用陣列存的完全二元樹：索引 i 的父節點在 (i−1)/2，子節點在 2i+1 與 2i+2。", op: "開始" });
  for (const op of SCRIPT) {
    if (op.kind === "push") {
      const label = `push(${op.v})`;
      h.push(op.v);
      let i = h.length - 1;
      snap({ desc: `把 ${op.v} 放到陣列尾端（索引 ${i}），也就是樹的最底層最左邊的空位。接著往上調整（sift up）。`, op: label, swap: [i, i] });
      while (i > 0) {
        const p = parent(i);
        snap({ desc: `比較索引 ${i} 的 ${h[i]} 和父節點索引 ${p} 的 ${h[p]}。`, op: label, cmp: [i, p] });
        if (h[i] < h[p]) {
          [h[i], h[p]] = [h[p], h[i]];
          snap({ desc: `${h[p]} 比父節點 ${h[i]} 小，違反最小堆積性質，交換。`, op: label, swap: [i, p] });
          i = p;
          if (i === 0) snap({ desc: `${h[0]} 到達根節點，它是目前的最小值。sift up 結束。`, op: label });
        } else {
          snap({ desc: `${h[i]} 不小於父節點 ${h[p]}，位置正確，sift up 結束。`, op: label });
          break;
        }
      }
    } else {
      const label = "pop()";
      const top = h[0];
      const last = h.pop()!;
      if (h.length) h[0] = last;
      snap({
        desc: h.length
          ? `取出根節點 ${top}，那是最小值。把尾端的 ${last} 搬到根，維持完全二元樹的形狀，接著往下調整（sift down）。`
          : `取出根節點 ${top}，堆積空了。`,
        op: label, popped: top, swap: h.length ? [0, 0] : undefined,
      });
      let i = 0;
      while (h.length) {
        const l = 2 * i + 1, r = 2 * i + 2;
        if (l >= h.length) { snap({ desc: `索引 ${i} 沒有子節點，sift down 結束。`, op: label, popped: top }); break; }
        const c = r < h.length && h[r] < h[l] ? r : l;
        snap({ desc: r < h.length ? `子節點 ${h[l]} 與 ${h[r]}，較小的是 ${h[c]}（索引 ${c}），和 ${h[i]} 比較。` : `只有一個子節點 ${h[l]}，和 ${h[i]} 比較。`, op: label, cmp: [i, c], popped: top });
        if (h[c] < h[i]) {
          [h[c], h[i]] = [h[i], h[c]];
          snap({ desc: `${h[c]} 比子節點 ${h[i]} 大，交換往下。`, op: label, swap: [i, c], popped: top });
          i = c;
        } else {
          snap({ desc: `${h[i]} 不大於任何子節點，位置正確，sift down 結束。`, op: label, popped: top });
          break;
        }
      }
    }
  }
  snap({ desc: "腳本結束。每次 push 或 pop 最多沿著樹高走一趟，樹高是 log n，所以都是 O(log n)。", op: "結束" });
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
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const n = s.heap.length;
  const cls = (i: number) =>
    s.swap && s.swap.includes(i) ? "swap" : s.cmp && s.cmp.includes(i) ? "cmp" : "";

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>上一步</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(steps.length - 1, x + 1))} disabled={k === steps.length - 1}>下一步</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>重設</button>
        </div>
        <span className="font-mono text-[12.5px] text-ink">{s.op}</span>
        <span className="ml-auto text-[12px] text-ink-3">最小堆積 · 腳本：push 7, 3, 9, 1, 4, 8 → pop ×2</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_200px]">
        <svg viewBox="0 0 640 210" className="block h-auto w-full" role="img" aria-label="堆積的樹狀視角">
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
          {n === 0 && <text x="320" y="100" textAnchor="middle" fontSize="12" fill="var(--ink-3)">空</text>}
        </svg>

        <div className="flex flex-col gap-3 border-t border-line p-4 text-[13px] md:border-t-0 md:border-l">
          <div>
            <div className="eyebrow mb-1.5">陣列視角</div>
            <div className="flex flex-wrap gap-1">
              {s.heap.map((v, i) => {
                const c = cls(i);
                return (
                  <span key={i} className={`grid h-8 w-8 place-items-center rounded-md border font-mono text-[13px] ${
                    c === "swap" ? "border-accent bg-accent text-accent-ink" : c === "cmp" ? "border-amber bg-amber-soft text-amber" : "border-line-strong bg-surface"
                  }`}>{v}</span>
                );
              })}
              {n === 0 && <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-8 text-ink-3">空</span>}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1.5">最小值（根）</div>
            <div className="font-mono text-[18px] font-medium tabular-nums">{n ? s.heap[0] : "—"}</div>
          </div>
          {s.popped !== undefined && (
            <div>
              <div className="eyebrow mb-1.5">剛取出</div>
              <span className="inline-grid h-8 w-8 place-items-center rounded-md border border-green bg-green-soft font-mono text-[13px] text-green">{s.popped}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">步驟 {k}/{steps.length - 1}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}
