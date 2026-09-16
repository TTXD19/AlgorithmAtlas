"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const CODE = [
  "def factorial(n):",
  "    if n == 1:",
  "        return 1",
  "    return n * factorial(n - 1)",
];

const TEXT = demoText(
  {
    ready: (start: number) => `準備呼叫 factorial(${start})，呼叫堆疊目前是空的。`,
    enter: (n: number) => `進入 factorial(${n})，堆疊上多一層。檢查 n == 1？`,
    baseCase: "n 是 1，到達 base case，直接回傳 1。",
    recurse: (n: number) => `n 是 ${n}，不是 base case。要先算出 factorial(${n - 1}) 才能回傳，所以這一層先等著。`,
    returnOne: "factorial(1) 回傳 1，這一層結束，從堆疊彈出。",
    returnN: (n: number, prev: number, value: number) => `拿到 factorial(${n - 1}) = ${prev}，算出 ${n} × ${prev} = ${value}，回傳並彈出。`,
    finish: (start: number, final: number) => `堆疊清空，最外層拿到 factorial(${start}) = ${final}。注意最深時堆疊有 ${start} 層，這就是空間 O(n) 的來源。`,
    stackTitle: "呼叫堆疊（頂 → 底）",
    waiting: "等待中",
    running: "執行中",
  },
  {
    en: {
      ready: (start: number) => `About to call factorial(${start}). The call stack is empty.`,
      enter: (n: number) => `Enter factorial(${n}), which adds a frame to the stack. Is n == 1?`,
      baseCase: "n is 1, so this is the base case: return 1 straight away.",
      recurse: (n: number) => `n is ${n}, so this is not the base case. This frame cannot return until factorial(${n - 1}) is known, so it waits.`,
      returnOne: "factorial(1) returns 1, so this frame is finished and is popped off the stack.",
      returnN: (n: number, prev: number, value: number) => `factorial(${n - 1}) = ${prev} comes back, so this frame works out ${n} × ${prev} = ${value}, returns it, and is popped.`,
      finish: (start: number, final: number) => `The stack is empty again and the outermost call has factorial(${start}) = ${final}. At its deepest the stack held ${start} frames, and that is where the O(n) space comes from.`,
      stackTitle: "Call stack (top → bottom)",
      waiting: "waiting",
      running: "running",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Frame { n: number; status: "waiting" | "active" | "returning"; value?: number }
interface Step { desc: string; line: number; frames: Frame[]; result?: number }

/** 模擬 factorial(4) 的每一步：推入 4 層再依序返回。 */
function buildSteps(t: T, start: number): Step[] {
  const steps: Step[] = [];
  const stack: Frame[] = [];
  const snap = (desc: string, line: number, result?: number) =>
    steps.push({ desc, line, frames: stack.map((f) => ({ ...f })), result });

  steps.push({ desc: t.ready(start), line: 0, frames: [] });
  for (let n = start; n >= 1; n--) {
    stack.forEach((f) => (f.status = "waiting"));
    stack.push({ n, status: "active" });
    snap(t.enter(n), 1);
    if (n === 1) {
      snap(t.baseCase, 2);
    } else {
      snap(t.recurse(n), 3);
    }
  }
  let value = 1;
  for (let n = 1; n <= start; n++) {
    const top = stack[stack.length - 1];
    top.status = "returning";
    top.value = value;
    snap(n === 1 ? t.returnOne : t.returnN(n, value / n, value), n === 1 ? 2 : 3, value);
    stack.pop();
    if (stack.length) stack[stack.length - 1].status = "active";
    value *= n + 1;
  }
  const final = Array.from({ length: start }, (_, i) => i + 1).reduce((a, b) => a * b, 1);
  steps.push({ desc: t.finish(start, final), line: 0, frames: [], result: final });
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

export function CallStackDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const steps = useMemo(() => buildSteps(t, 4), [t]);
  const [i, setI] = useState(0);
  const s = steps[i];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>{ui.demo.prev}</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={i === steps.length - 1}>{ui.demo.next}</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setI(0)}>{ui.demo.reset}</button>
        </div>
        <span className="ml-auto font-mono text-[12px] text-ink-3">factorial(4)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px]">
        <pre className="m-0 overflow-x-auto bg-code-bg px-4 py-3.5 font-mono text-[13px] leading-[1.7] text-code-ink">
          {CODE.map((line, idx) => (
            <div key={idx} className={`-mx-4 px-4 ${s.line === idx + 1 ? "bg-white/10" : ""}`}>
              <span className="mr-3 inline-block w-4 text-right text-code-cm select-none">{idx + 1}</span>
              {line}
            </div>
          ))}
        </pre>

        <div className="flex flex-col border-t border-line p-4 md:border-t-0 md:border-l">
          <div className="eyebrow mb-2">{t.stackTitle}</div>
          <div className="flex min-h-[132px] flex-col-reverse justify-end gap-1.5">
            {s.frames.length === 0 && <span className="rounded-md border border-dashed border-line-strong px-2 py-1.5 text-center text-[12px] text-ink-3">{ui.demo.empty}</span>}
            {s.frames.map((f, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 font-mono text-[12.5px] ${
                  f.status === "active"
                    ? "border-accent bg-accent text-accent-ink"
                    : f.status === "returning"
                      ? "border-green bg-green-soft text-green"
                      : "border-amber bg-amber-soft text-amber"
                }`}
              >
                <span>factorial({f.n})</span>
                <span className="text-[11px]">{f.status === "waiting" ? t.waiting : f.status === "returning" ? `→ ${f.value}` : t.running}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">{ui.demo.step} {i}/{steps.length - 1}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}
