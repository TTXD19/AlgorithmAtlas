"use client";

import { useMemo, useState } from "react";

const NUMS = [1, 3, -1, -3, 5, 3, 6, 7];
const K = 3;

interface Step { desc: string; i: number; dq: number[]; out: number[]; popped?: number[]; front?: number }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const dq: number[] = [];
  const out: number[] = [];
  steps.push({ desc: `視窗大小 ${K}。deque 存索引，對應的值從前到後遞減，所以最前面永遠是視窗最大值。`, i: -1, dq: [], out: [] });
  for (let i = 0; i < NUMS.length; i++) {
    const popped: number[] = [];
    while (dq.length && NUMS[dq[dq.length - 1]] <= NUMS[i]) popped.push(dq.pop()!);
    if (popped.length) steps.push({ desc: `加入 ${NUMS[i]} 之前，先從尾端彈出比它小的：${popped.map((j) => NUMS[j]).join("、")}。它們比 ${NUMS[i]} 小又比它早離開視窗，永遠不可能再當最大值。`, i, dq: [...dq], out: [...out], popped });
    dq.push(i);
    let front: number | undefined;
    if (dq[0] <= i - K) { front = dq.shift(); }
    const desc = `把索引 ${i} 推入尾端${front !== undefined ? `；最前面的索引 ${front}（值 ${NUMS[front]}）已經離開視窗，從前端彈出` : ""}。`;
    if (i >= K - 1) {
      out.push(NUMS[dq[0]]);
      steps.push({ desc: `${desc} 視窗 [${i - K + 1}, ${i}] 的最大值就是 deque 最前面：${NUMS[dq[0]]}。`, i, dq: [...dq], out: [...out], front });
    } else {
      steps.push({ desc: `${desc} 視窗還沒滿，不輸出。`, i, dq: [...dq], out: [...out], front });
    }
  }
  steps.push({ desc: `完成。每個索引最多推入一次、彈出一次，n 個視窗總共 O(n)，暴力解每個視窗掃 k 次是 O(nk)。`, i: NUMS.length, dq: [...dq], out: [...out] });
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

export function MonotonicQueueDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const lo = Math.max(0, s.i - K + 1);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>上一步</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(steps.length - 1, x + 1))} disabled={k === steps.length - 1}>下一步</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>重設</button>
        </div>
        <span className="ml-auto font-mono text-[12px] text-ink-3">k = {K}</span>
      </div>

      <div className="overflow-x-auto px-3.5 pt-3.5 pb-3">
        <div className="eyebrow mb-1.5">nums（藍底是目前視窗）</div>
        <div className="flex gap-1">
          {NUMS.map((v, i) => {
            const inWin = s.i >= 0 && s.i < NUMS.length && i >= lo && i <= s.i;
            const inDq = s.dq.includes(i);
            const tone = i === s.i
              ? "border-accent bg-accent text-accent-ink"
              : s.popped?.includes(i) || s.front === i
                ? "border-line bg-surface-2 text-ink-3 line-through"
                : inDq
                  ? "border-amber bg-amber-soft text-amber"
                  : inWin
                    ? "border-accent bg-accent-soft text-ink"
                    : "border-line-strong bg-surface";
            return (
              <div key={i} className="flex w-11 shrink-0 flex-col items-center gap-1 font-mono text-[11px] text-ink-3">
                <span>[{i}]</span>
                <span className={`grid h-9 w-full place-items-center rounded-md border text-[14px] font-medium ${tone}`}>{v}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="eyebrow mb-1.5">deque（前 → 後，索引 : 值）</div>
            <div className="flex min-h-9 items-center gap-1 rounded-md border border-line bg-surface-2 px-2 py-1">
              {s.dq.length === 0 && <span className="text-[12px] text-ink-3">空</span>}
              {s.dq.map((i, idx) => (
                <span key={i} className={`rounded-md border px-2 py-0.5 font-mono text-[12.5px] ${idx === 0 ? "border-green bg-green-soft text-green" : "border-amber bg-amber-soft text-amber"}`}>{i} : {NUMS[i]}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1.5">輸出（每個視窗的最大值）</div>
            <div className="flex min-h-9 items-center gap-1 rounded-md border border-line bg-surface-2 px-2 py-1">
              {s.out.length === 0 && <span className="text-[12px] text-ink-3">尚無</span>}
              {s.out.map((v, i) => <span key={i} className="rounded-md border border-line-strong bg-surface px-2 py-0.5 font-mono text-[12.5px]">{v}</span>)}
            </div>
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
