"use client";

import { useMemo, useState } from "react";

const T = [73, 74, 75, 71, 69, 72, 76, 73];

interface Step { desc: string; i: number; stack: number[]; ans: (number | null)[]; popped?: number }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const st: number[] = [];
  const ans: (number | null)[] = T.map(() => null);
  steps.push({ desc: "堆疊存「還沒找到更高溫度的日子」的索引。從左到右每天處理一次。", i: -1, stack: [], ans: [...ans] });
  for (let i = 0; i < T.length; i++) {
    let popped = 0;
    while (st.length && T[st[st.length - 1]] < T[i]) {
      const j = st.pop()!;
      ans[j] = i - j;
      popped++;
      steps.push({ desc: `第 ${i} 天 ${T[i]}° 比堆疊頂端第 ${j} 天的 ${T[j]}° 高：第 ${j} 天的答案出來了，等 ${i - j} 天。彈出。`, i, stack: [...st], ans: [...ans], popped: j });
    }
    st.push(i);
    steps.push({ desc: popped ? `沒有更矮的了，把第 ${i} 天推入，它現在也在等更高的溫度。` : `第 ${i} 天 ${T[i]}° 沒有比頂端高${st.length > 1 ? `（頂端第 ${st[st.length - 2]} 天 ${T[st[st.length - 2]]}°）` : ""}，直接推入。堆疊由底到頂溫度遞減。`, i, stack: [...st], ans: [...ans] });
  }
  ans.forEach((a, j) => { if (a === null) ans[j] = 0; });
  steps.push({ desc: `走完了。堆疊裡剩下的日子之後都沒有更高溫，答案 0。每個索引只推入一次、彈出一次，O(n)。`, i: T.length, stack: [...st], ans: [...ans] });
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

export function MonotonicStackDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const top = s.stack[s.stack.length - 1];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>上一步</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(steps.length - 1, x + 1))} disabled={k === steps.length - 1}>下一步</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>重設</button>
        </div>
        <span className="ml-auto font-mono text-[12px] text-ink-3">Daily Temperatures</span>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[minmax(0,1fr)_150px]">
        <div className="overflow-x-auto">
          <div className="eyebrow mb-1.5">溫度 / 答案（要等幾天）</div>
          <div className="flex gap-1">
            {T.map((t, i) => {
              const inStack = s.stack.includes(i);
              const tone = i === s.i
                ? "border-accent bg-accent text-accent-ink"
                : i === s.popped
                  ? "border-green bg-green-soft text-green"
                  : inStack
                    ? "border-amber bg-amber-soft text-amber"
                    : "border-line-strong bg-surface";
              return (
                <div key={i} className="flex w-11 shrink-0 flex-col items-center gap-1 font-mono text-[11px] text-ink-3">
                  <span>[{i}]</span>
                  <div className="flex h-12 w-full items-end justify-center">
                    <span className={`grid w-full place-items-center rounded-t-md border border-b-0 text-[13px] font-medium ${tone}`} style={{ height: `${((t - 65) / 12) * 100}%` }}>{t}</span>
                  </div>
                  <span className={`grid h-7 w-full place-items-center rounded-md border text-[12.5px] ${s.ans[i] === null ? "border-dashed border-line" : i === s.popped ? "border-green bg-green-soft text-green" : "border-line bg-surface-2 text-ink"}`}>{s.ans[i] ?? ""}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="eyebrow mb-2">堆疊（頂 → 底）</div>
          <div className="flex min-h-[110px] flex-col-reverse justify-end gap-1 rounded-md border border-line bg-surface-2 p-2">
            {s.stack.length === 0 && <span className="text-center text-[12px] text-ink-3">空</span>}
            {s.stack.map((i) => (
              <span key={i} className={`flex justify-between rounded-md border px-2 font-mono text-[12.5px] leading-7 ${i === top ? "border-amber bg-amber-soft text-amber" : "border-line-strong bg-surface"}`}>
                <span>[{i}]</span><span>{T[i]}°</span>
              </span>
            ))}
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
