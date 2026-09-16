"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const NUMS = [1, 3, -1, -3, 5, 3, 6, 7];
const K = 3;

const TEXT = demoText(
  {
    intro: (k: number) => `視窗大小 ${k}。deque 存索引，對應的值從前到後遞減，所以最前面永遠是視窗最大值。`,
    popSmaller: (v: number, popped: number[]) =>
      `加入 ${v} 之前，先從尾端彈出比它小的：${popped.join("、")}。它們比 ${v} 小又比它早離開視窗，永遠不可能再當最大值。`,
    push: (i: number) => `把索引 ${i} 推入尾端。`,
    pushAndEvict: (i: number, front: number, frontValue: number) =>
      `把索引 ${i} 推入尾端；最前面的索引 ${front}（值 ${frontValue}）已經離開視窗，從前端彈出。`,
    windowMax: (head: string, lo: number, hi: number, max: number) =>
      `${head} 視窗 [${lo}, ${hi}] 的最大值就是 deque 最前面：${max}。`,
    notFull: (head: string) => `${head} 視窗還沒滿，不輸出。`,
    finish: "完成。每個索引最多推入一次、彈出一次，n 個視窗總共 O(n)，暴力解每個視窗掃 k 次是 O(nk)。",
    numsTitle: "nums（藍底是目前視窗）",
    dequeTitle: "deque（前 → 後，索引 : 值）",
    outputTitle: "輸出（每個視窗的最大值）",
    noOutput: "尚無",
  },
  {
    en: {
      intro: (k: number) => `The window is ${k} wide. The deque holds indices whose values decrease from front to back, so the front is always the largest value in the window.`,
      popSmaller: (v: number, popped: number[]) =>
        `Before adding ${v}, pop everything smaller off the back: ${popped.join(", ")}. Anything popped here is smaller than ${v} and leaves the window earlier, so it can never be the maximum again.`,
      push: (i: number) => `Push index ${i} onto the back.`,
      pushAndEvict: (i: number, front: number, frontValue: number) =>
        `Push index ${i} onto the back; index ${front} at the front (value ${frontValue}) has left the window, so pop it off the front.`,
      windowMax: (head: string, lo: number, hi: number, max: number) =>
        `${head} The maximum of window [${lo}, ${hi}] is whatever sits at the front of the deque: ${max}.`,
      notFull: (head: string) => `${head} The window is not full yet, so there is nothing to output.`,
      finish: "Done. Every index is pushed at most once and popped at most once, so all n windows together cost O(n). Rescanning k elements per window would be O(nk).",
      numsTitle: "nums (the blue cells are the current window)",
      dequeTitle: "deque (front → back, index : value)",
      outputTitle: "Output (the maximum of each window)",
      noOutput: "none yet",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; i: number; dq: number[]; out: number[]; popped?: number[]; front?: number }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const dq: number[] = [];
  const out: number[] = [];
  steps.push({ desc: t.intro(K), i: -1, dq: [], out: [] });
  for (let i = 0; i < NUMS.length; i++) {
    const popped: number[] = [];
    while (dq.length && NUMS[dq[dq.length - 1]] <= NUMS[i]) popped.push(dq.pop()!);
    if (popped.length) steps.push({ desc: t.popSmaller(NUMS[i], popped.map((j) => NUMS[j])), i, dq: [...dq], out: [...out], popped });
    dq.push(i);
    let front: number | undefined;
    if (dq[0] <= i - K) { front = dq.shift(); }
    const head = front !== undefined ? t.pushAndEvict(i, front, NUMS[front]) : t.push(i);
    if (i >= K - 1) {
      out.push(NUMS[dq[0]]);
      steps.push({ desc: t.windowMax(head, i - K + 1, i, NUMS[dq[0]]), i, dq: [...dq], out: [...out], front });
    } else {
      steps.push({ desc: t.notFull(head), i, dq: [...dq], out: [...out], front });
    }
  }
  steps.push({ desc: t.finish, i: NUMS.length, dq: [...dq], out: [...out] });
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

export function MonotonicQueueDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const lo = Math.max(0, s.i - K + 1);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>{ui.demo.prev}</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(steps.length - 1, x + 1))} disabled={k === steps.length - 1}>{ui.demo.next}</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>{ui.demo.reset}</button>
        </div>
        <span className="ml-auto font-mono text-[12px] text-ink-3">k = {K}</span>
      </div>

      <div className="overflow-x-auto px-3.5 pt-3.5 pb-3">
        <div className="eyebrow mb-1.5">{t.numsTitle}</div>
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
            <div className="eyebrow mb-1.5">{t.dequeTitle}</div>
            <div className="flex min-h-9 items-center gap-1 rounded-md border border-line bg-surface-2 px-2 py-1">
              {s.dq.length === 0 && <span className="text-[12px] text-ink-3">{ui.demo.empty}</span>}
              {s.dq.map((i, idx) => (
                <span key={i} className={`rounded-md border px-2 py-0.5 font-mono text-[12.5px] ${idx === 0 ? "border-green bg-green-soft text-green" : "border-amber bg-amber-soft text-amber"}`}>{i} : {NUMS[i]}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1.5">{t.outputTitle}</div>
            <div className="flex min-h-9 items-center gap-1 rounded-md border border-line bg-surface-2 px-2 py-1">
              {s.out.length === 0 && <span className="text-[12px] text-ink-3">{t.noOutput}</span>}
              {s.out.map((v, i) => <span key={i} className="rounded-md border border-line-strong bg-surface px-2 py-0.5 font-mono text-[12.5px]">{v}</span>)}
            </div>
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
