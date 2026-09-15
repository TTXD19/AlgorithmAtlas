"use client";

import { useMemo, useState } from "react";

const SAMPLES = ["([{}])", "([)]", "(()", "{[()]}()"];
const PAIR: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

interface Step { desc: string; i: number; stack: string[]; ok?: boolean; bad?: boolean }

function buildSteps(s: string): Step[] {
  const steps: Step[] = [{ desc: "堆疊是空的。從左到右讀每個字元：左括號推入，右括號就和頂端比對。", i: -1, stack: [] }];
  const st: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c in PAIR) {
      if (st.length === 0) {
        steps.push({ desc: `讀到 ${c}，但堆疊是空的，沒有左括號可以配。不合法。`, i, stack: [], bad: true });
        return steps;
      }
      const top = st[st.length - 1];
      if (top !== PAIR[c]) {
        steps.push({ desc: `讀到 ${c}，頂端是 ${top}，配不起來（最近打開的必須最先關閉）。不合法。`, i, stack: [...st], bad: true });
        return steps;
      }
      st.pop();
      steps.push({ desc: `讀到 ${c}，頂端是 ${top}，剛好一對。彈出。`, i, stack: [...st] });
    } else {
      st.push(c);
      steps.push({ desc: `讀到 ${c}，左括號，推入堆疊。`, i, stack: [...st] });
    }
  }
  if (st.length) steps.push({ desc: `讀完了，但堆疊還剩 ${st.length} 個左括號沒關。不合法。`, i: s.length, stack: [...st], bad: true });
  else steps.push({ desc: "讀完了，堆疊剛好清空。每個左括號都有對應的右括號，合法。", i: s.length, stack: [], ok: true });
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

export function StackDemo() {
  const [sample, setSample] = useState(0);
  const steps = useMemo(() => buildSteps(SAMPLES[sample]), [sample]);
  const [k, setK] = useState(0);
  const s = steps[Math.min(k, steps.length - 1)];
  const str = SAMPLES[sample];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1">
          {SAMPLES.map((x, i) => (
            <button key={x} type="button" className={`${BTN} font-mono ${sample === i ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => { setSample(i); setK(0); }}>{x}</button>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>上一步</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(steps.length - 1, x + 1))} disabled={k >= steps.length - 1}>下一步</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>重設</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[minmax(0,1fr)_160px]">
        <div>
          <div className="eyebrow mb-2">輸入字串</div>
          <div className="flex gap-1">
            {str.split("").map((c, i) => (
              <span key={i} className={`grid h-10 w-9 place-items-center rounded-md border font-mono text-[16px] font-medium ${
                i === s.i ? (s.bad ? "border-amber bg-amber-soft text-amber" : "border-accent bg-accent text-accent-ink") : i < s.i ? "border-line bg-surface-2 text-ink-3" : "border-line-strong bg-surface"
              }`}>{c}</span>
            ))}
          </div>
          {(s.ok || s.bad) && (
            <div className={`mt-3 inline-block rounded-md px-2.5 py-1 text-[13px] font-semibold ${s.ok ? "bg-green-soft text-green" : "bg-amber-soft text-amber"}`}>{s.ok ? "合法" : "不合法"}</div>
          )}
        </div>
        <div>
          <div className="eyebrow mb-2">堆疊（頂 → 底）</div>
          <div className="flex min-h-[120px] flex-col-reverse justify-end gap-1 rounded-md border border-line bg-surface-2 p-2">
            {s.stack.length === 0 && <span className="text-center text-[12px] text-ink-3">空</span>}
            {s.stack.map((c, i) => (
              <span key={i} className={`grid h-8 place-items-center rounded-md border font-mono text-[15px] font-medium ${i === s.stack.length - 1 ? "border-accent bg-accent-soft text-ink" : "border-line-strong bg-surface"}`}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">步驟 {Math.min(k, steps.length - 1)}/{steps.length - 1}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}
