"use client";

import { useMemo, useState } from "react";

/** 資料流：文章的閱讀數。目標：隨時知道前 K 高。 */
const STREAM = [42, 7, 88, 15, 63, 91, 3, 55, 70, 88, 12, 99];
const K = 3;

interface Step { desc: string; i: number; heap: number[]; action: "push" | "replace" | "skip" | "none"; dropped?: number }

function buildSteps(): Step[] {
  const steps: Step[] = [{ desc: `維持一個大小最多為 ${K} 的最小堆積。堆頂是「目前前 ${K} 名裡最小的」，也就是入榜門檻。`, i: -1, heap: [], action: "none" }];
  const h: number[] = [];
  const sorted = () => [...h].sort((a, b) => a - b);
  for (let i = 0; i < STREAM.length; i++) {
    const x = STREAM[i];
    if (h.length < K) {
      h.push(x);
      steps.push({ desc: `堆積還沒滿，直接把 ${x} 放進去。目前門檻 ${Math.min(...h)}。`, i, heap: sorted(), action: "push" });
    } else if (x > h[0] || x > Math.min(...h)) {
      const min = Math.min(...h);
      h.splice(h.indexOf(min), 1);
      h.push(x);
      steps.push({ desc: `${x} 比門檻 ${min} 大：彈出 ${min}，推入 ${x}。前 ${K} 名更新，新門檻 ${Math.min(...h)}。`, i, heap: sorted(), action: "replace", dropped: min });
    } else {
      steps.push({ desc: `${x} 不超過門檻 ${Math.min(...h)}，連進榜的資格都沒有，直接跳過。這一步是 O(1)。`, i, heap: sorted(), action: "skip" });
    }
  }
  steps.push({ desc: `掃完 ${STREAM.length} 筆。堆積裡就是前 ${K} 名，每筆最多一次 O(log K) 的操作，總共 O(n log K)。`, i: STREAM.length, heap: sorted(), action: "none" });
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

export function TopKDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>上一步</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(steps.length - 1, x + 1))} disabled={k === steps.length - 1}>下一步</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>重設</button>
        </div>
        <span className="ml-auto text-[12px] text-ink-3">K = {K} · 最小堆積</span>
      </div>

      <div className="p-3.5">
        <div className="eyebrow mb-2">資料流（閱讀數）</div>
        <div className="flex flex-wrap gap-1">
          {STREAM.map((v, i) => (
            <span key={i} className={`grid h-9 w-10 place-items-center rounded-md border font-mono text-[13px] ${
              i === s.i
                ? s.action === "skip" ? "border-line-strong bg-surface-2 text-ink-3 line-through" : "border-accent bg-accent text-accent-ink"
                : i < s.i ? "border-line bg-surface-2 text-ink-3" : "border-line-strong bg-surface"
            }`}>{v}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-2">堆積（大小 ≤ {K}，左邊是堆頂）</div>
          <div className="flex items-center gap-1.5">
            {s.heap.map((v, i) => (
              <span key={`${v}-${i}`} className={`grid h-9 w-10 place-items-center rounded-md border font-mono text-[13px] ${
                i === 0 ? "border-amber bg-amber-soft text-amber" : "border-line-strong bg-surface"
              }`}>{v}</span>
            ))}
            {s.heap.length === 0 && <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-9 text-ink-3">空</span>}
            {s.dropped !== undefined && (
              <span className="ml-2 inline-flex items-center gap-1.5 text-[12px] text-ink-3">
                彈出 <span className="grid h-7 w-8 place-items-center rounded-md border border-line bg-surface-2 font-mono line-through">{s.dropped}</span>
              </span>
            )}
          </div>
          <div className="mt-1.5 text-[12px] text-ink-3">黃色是堆頂，也就是入榜門檻</div>
        </div>
        <div>
          <div className="eyebrow mb-2">目前前 {K} 名</div>
          <div className="font-mono text-[15px] tabular-nums">
            {s.heap.length ? [...s.heap].reverse().join("  ›  ") : "—"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">步驟 {k}/{steps.length - 1}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}
