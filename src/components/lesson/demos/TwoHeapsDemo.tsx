"use client";

import { useMemo, useState } from "react";

/** 資料流：API 延遲（毫秒）。目標：隨時報出中位數。 */
const STREAM = [120, 45, 300, 80, 95, 210, 60, 150];

interface Step { desc: string; i: number; low: number[]; high: number[]; median: number | null; moved?: "toLow" | "toHigh" }

function median(low: number[], high: number[]) {
  if (!low.length && !high.length) return null;
  if (low.length > high.length) return low[0];
  if (high.length > low.length) return high[0];
  return (low[0] + high[0]) / 2;
}

function buildSteps(): Step[] {
  const steps: Step[] = [{ desc: "兩個堆積：左邊的最大堆積放較小的一半（堆頂是左半最大值），右邊的最小堆積放較大的一半（堆頂是右半最小值）。中位數永遠在兩個堆頂上。", i: -1, low: [], high: [], median: null }];
  const low: number[] = []; // 最大堆積：以遞減排序模擬，low[0] 是最大
  const high: number[] = []; // 最小堆積：以遞增排序模擬，high[0] 是最小
  const sortLow = () => low.sort((a, b) => b - a);
  const sortHigh = () => high.sort((a, b) => a - b);
  const snap = (desc: string, i: number, moved?: Step["moved"]) => steps.push({ desc, i, low: [...low], high: [...high], median: median(low, high), moved });

  for (let i = 0; i < STREAM.length; i++) {
    const x = STREAM[i];
    const prevMax = low[0];
    if (!low.length || x <= prevMax) {
      low.push(x); sortLow();
      snap(`${x} ${prevMax === undefined ? "是第一筆" : `不大於左半最大值 ${prevMax}`}，放進左邊（最大堆積）。`, i, "toLow");
    } else {
      high.push(x); sortHigh();
      snap(`${x} 大於左半最大值 ${low[0]}，放進右邊（最小堆積）。`, i, "toHigh");
    }
    if (low.length > high.length + 1) {
      const v = low.shift()!; high.push(v); sortHigh();
      snap(`左邊比右邊多超過一個，把左邊堆頂 ${v} 搬到右邊，維持兩邊大小差不超過 1。`, i, "toHigh");
    } else if (high.length > low.length) {
      const v = high.shift()!; low.push(v); sortLow();
      snap(`右邊比左邊多，把右邊堆頂 ${v} 搬到左邊。約定左邊可以多一個，這樣奇數筆時中位數就是左邊堆頂。`, i, "toLow");
    }
    const m = median(low, high)!;
    snap(low.length === high.length ? `兩邊一樣多（共 ${low.length + high.length} 筆），中位數是兩個堆頂的平均：(${low[0]} + ${high[0]}) / 2 = ${m}。` : `左邊多一個（共 ${low.length + high.length} 筆），中位數就是左邊堆頂 ${m}。`, i);
  }
  steps.push({ desc: "每筆資料最多做兩次堆積操作，O(log n)；查中位數只看堆頂，O(1)。整體不必排序整個資料流。", i: STREAM.length, low: [...low], high: [...high], median: median(low, high) });
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

function HeapCol({ title, items, tone, moved }: { title: string; items: number[]; tone: "low" | "high"; moved: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${moved ? "border-accent" : "border-line"}`}>
      <div className="eyebrow mb-2">{title}</div>
      <div className="flex min-h-[36px] flex-wrap items-center gap-1.5">
        {items.map((v, i) => (
          <span key={`${v}-${i}`} className={`grid h-9 w-12 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${
            i === 0 ? (tone === "low" ? "border-amber bg-amber-soft text-amber" : "border-green bg-green-soft text-green") : "border-line-strong bg-surface"
          }`}>{v}</span>
        ))}
        {items.length === 0 && <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-9 text-ink-3">空</span>}
      </div>
      <div className="mt-1.5 text-[12px] text-ink-3">{tone === "low" ? "最大堆積 · 左邊第一個是堆頂（左半最大）" : "最小堆積 · 左邊第一個是堆頂（右半最小）"}</div>
    </div>
  );
}

export function TwoHeapsDemo() {
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
        <span className="ml-auto text-[12px] text-ink-3">資料流中位數</span>
      </div>

      <div className="p-3.5">
        <div className="eyebrow mb-2">資料流（延遲 ms）</div>
        <div className="flex flex-wrap gap-1">
          {STREAM.map((v, i) => (
            <span key={i} className={`grid h-9 w-12 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${
              i === s.i ? "border-accent bg-accent text-accent-ink" : i < s.i ? "border-line bg-surface-2 text-ink-3" : "border-line-strong bg-surface"
            }`}>{v}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-line p-3.5 md:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)] md:items-start">
        <HeapCol title="左半（較小）" items={s.low} tone="low" moved={s.moved === "toLow"} />
        <div className="rounded-lg bg-surface-2 px-3 py-3 text-center">
          <div className="eyebrow mb-1">中位數</div>
          <div className="font-mono text-[22px] font-medium tabular-nums text-accent">{s.median ?? "—"}</div>
        </div>
        <HeapCol title="右半（較大）" items={s.high} tone="high" moved={s.moved === "toHigh"} />
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">步驟 {k}/{steps.length - 1}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}
