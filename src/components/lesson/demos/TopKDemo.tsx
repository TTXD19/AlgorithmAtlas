"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

/** 資料流：文章的閱讀數。目標：隨時知道前 K 高。 */
const STREAM = [42, 7, 88, 15, 63, 91, 3, 55, 70, 88, 12, 99];
const K = 3;

const TEXT = demoText(
  {
    intro: `維持一個大小最多為 ${K} 的最小堆積。堆頂是「目前前 ${K} 名裡最小的」，也就是入榜門檻。`,
    push: (x: number, cut: number) => `堆積還沒滿，直接把 ${x} 放進去。目前門檻 ${cut}。`,
    replace: (x: number, cut: number, next: number) => `${x} 比門檻 ${cut} 大：彈出 ${cut}，推入 ${x}。前 ${K} 名更新，新門檻 ${next}。`,
    skip: (x: number, cut: number) => `${x} 不超過門檻 ${cut}，連進榜的資格都沒有，直接跳過。這一步是 O(1)。`,
    done: (n: number) => `掃完 ${n} 筆。堆積裡就是前 ${K} 名，每筆最多一次 O(log K) 的操作，總共 O(n log K)。`,
    minHeap: "最小堆積",
    streamTitle: "資料流（閱讀數）",
    heapTitle: `堆積（大小 ≤ ${K}，左邊是堆頂）`,
    popped: "彈出",
    heapLegend: "黃色是堆頂，也就是入榜門檻",
    topTitle: `目前前 ${K} 名`,
  },
  {
    en: {
      intro: `Keep a min-heap holding at most ${K} elements. The top of the heap is the smallest of the current top ${K}, which makes it the cut-off for getting onto the list.`,
      push: (x: number, cut: number) => `The heap is not full yet, so ${x} goes straight in. The cut-off is now ${cut}.`,
      replace: (x: number, cut: number, next: number) => `${x} beats the cut-off of ${cut}: pop ${cut} and push ${x}. The top ${K} changes, and the new cut-off is ${next}.`,
      skip: (x: number, cut: number) => `${x} does not beat the cut-off of ${cut}, so it cannot make the list at all — skip it. This step is O(1).`,
      done: (n: number) => `All ${n} values have been read. The heap holds exactly the top ${K}. Each value costs at most one O(log K) operation, so the whole pass is O(n log K).`,
      minHeap: "min-heap",
      streamTitle: "Stream (view counts)",
      heapTitle: `Heap (size ≤ ${K}, top on the left)`,
      popped: "popped",
      heapLegend: "Amber is the top of the heap — the cut-off for getting onto the list.",
      topTitle: `Current top ${K}`,
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; i: number; heap: number[]; action: "push" | "replace" | "skip" | "none"; dropped?: number }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [{ desc: t.intro, i: -1, heap: [], action: "none" }];
  const h: number[] = [];
  const sorted = () => [...h].sort((a, b) => a - b);
  for (let i = 0; i < STREAM.length; i++) {
    const x = STREAM[i];
    if (h.length < K) {
      h.push(x);
      steps.push({ desc: t.push(x, Math.min(...h)), i, heap: sorted(), action: "push" });
    } else if (x > h[0] || x > Math.min(...h)) {
      const min = Math.min(...h);
      h.splice(h.indexOf(min), 1);
      h.push(x);
      steps.push({ desc: t.replace(x, min, Math.min(...h)), i, heap: sorted(), action: "replace", dropped: min });
    } else {
      steps.push({ desc: t.skip(x, Math.min(...h)), i, heap: sorted(), action: "skip" });
    }
  }
  steps.push({ desc: t.done(STREAM.length), i: STREAM.length, heap: sorted(), action: "none" });
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

export function TopKDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>{ui.demo.prev}</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(steps.length - 1, x + 1))} disabled={k === steps.length - 1}>{ui.demo.next}</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>{ui.demo.reset}</button>
        </div>
        <span className="ml-auto text-[12px] text-ink-3">K = {K} · {t.minHeap}</span>
      </div>

      <div className="p-3.5">
        <div className="eyebrow mb-2">{t.streamTitle}</div>
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
          <div className="eyebrow mb-2">{t.heapTitle}</div>
          <div className="flex items-center gap-1.5">
            {s.heap.map((v, i) => (
              <span key={`${v}-${i}`} className={`grid h-9 w-10 place-items-center rounded-md border font-mono text-[13px] ${
                i === 0 ? "border-amber bg-amber-soft text-amber" : "border-line-strong bg-surface"
              }`}>{v}</span>
            ))}
            {s.heap.length === 0 && <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-9 text-ink-3">{ui.demo.empty}</span>}
            {s.dropped !== undefined && (
              <span className="ml-2 inline-flex items-center gap-1.5 text-[12px] text-ink-3">
                {t.popped} <span className="grid h-7 w-8 place-items-center rounded-md border border-line bg-surface-2 font-mono line-through">{s.dropped}</span>
              </span>
            )}
          </div>
          <div className="mt-1.5 text-[12px] text-ink-3">{t.heapLegend}</div>
        </div>
        <div>
          <div className="eyebrow mb-2">{t.topTitle}</div>
          <div className="font-mono text-[15px] tabular-nums">
            {s.heap.length ? [...s.heap].reverse().join("  ›  ") : "—"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">{ui.demo.step} {k}/{steps.length - 1}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}
