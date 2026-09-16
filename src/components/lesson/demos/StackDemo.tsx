"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const SAMPLES = ["([{}])", "([)]", "(()", "{[()]}()"];
const PAIR: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

const TEXT = demoText(
  {
    intro: "堆疊是空的。從左到右讀每個字元：左括號推入，右括號就和頂端比對。",
    noOpen: (c: string) => `讀到 ${c}，但堆疊是空的，沒有左括號可以配。不合法。`,
    mismatch: (c: string, top: string) => `讀到 ${c}，頂端是 ${top}，配不起來（最近打開的必須最先關閉）。不合法。`,
    pop: (c: string, top: string) => `讀到 ${c}，頂端是 ${top}，剛好一對。彈出。`,
    push: (c: string) => `讀到 ${c}，左括號，推入堆疊。`,
    leftover: (n: number) => `讀完了，但堆疊還剩 ${n} 個左括號沒關。不合法。`,
    balanced: "讀完了，堆疊剛好清空。每個左括號都有對應的右括號，合法。",
    inputTitle: "輸入字串",
    stackTitle: "堆疊（頂 → 底）",
    valid: "合法",
    invalid: "不合法",
  },
  {
    en: {
      intro: "The stack starts empty. Read the characters left to right: push every opening bracket, and match every closing bracket against the top.",
      noOpen: (c: string) => `Read ${c}, but the stack is empty — there is no opening bracket left to match it. Not balanced.`,
      mismatch: (c: string, top: string) => `Read ${c} while the top is ${top}. They are not a pair, and the most recently opened bracket must close first. Not balanced.`,
      pop: (c: string, top: string) => `Read ${c} while the top is ${top} — exactly a pair, so pop it.`,
      push: (c: string) => `Read ${c}, an opening bracket, so push it onto the stack.`,
      leftover: (n: number) => `End of the string, but ${n} opening bracket${n === 1 ? "" : "s"} never closed. Not balanced.`,
      balanced: "End of the string and the stack is exactly empty. Every opening bracket found its partner, so the string is balanced.",
      inputTitle: "Input string",
      stackTitle: "Stack (top → bottom)",
      valid: "Balanced",
      invalid: "Not balanced",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; i: number; stack: string[]; ok?: boolean; bad?: boolean }

function buildSteps(t: T, s: string): Step[] {
  const steps: Step[] = [{ desc: t.intro, i: -1, stack: [] }];
  const st: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c in PAIR) {
      if (st.length === 0) {
        steps.push({ desc: t.noOpen(c), i, stack: [], bad: true });
        return steps;
      }
      const top = st[st.length - 1];
      if (top !== PAIR[c]) {
        steps.push({ desc: t.mismatch(c, top), i, stack: [...st], bad: true });
        return steps;
      }
      st.pop();
      steps.push({ desc: t.pop(c, top), i, stack: [...st] });
    } else {
      st.push(c);
      steps.push({ desc: t.push(c), i, stack: [...st] });
    }
  }
  if (st.length) steps.push({ desc: t.leftover(st.length), i: s.length, stack: [...st], bad: true });
  else steps.push({ desc: t.balanced, i: s.length, stack: [], ok: true });
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

export function StackDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const [sample, setSample] = useState(0);
  const steps = useMemo(() => buildSteps(TEXT[locale], SAMPLES[sample]), [locale, sample]);
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
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>{ui.demo.prev}</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(steps.length - 1, x + 1))} disabled={k >= steps.length - 1}>{ui.demo.next}</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>{ui.demo.reset}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[minmax(0,1fr)_160px]">
        <div>
          <div className="eyebrow mb-2">{t.inputTitle}</div>
          <div className="flex gap-1">
            {str.split("").map((c, i) => (
              <span key={i} className={`grid h-10 w-9 place-items-center rounded-md border font-mono text-[16px] font-medium ${
                i === s.i ? (s.bad ? "border-amber bg-amber-soft text-amber" : "border-accent bg-accent text-accent-ink") : i < s.i ? "border-line bg-surface-2 text-ink-3" : "border-line-strong bg-surface"
              }`}>{c}</span>
            ))}
          </div>
          {(s.ok || s.bad) && (
            <div className={`mt-3 inline-block rounded-md px-2.5 py-1 text-[13px] font-semibold ${s.ok ? "bg-green-soft text-green" : "bg-amber-soft text-amber"}`}>{s.ok ? t.valid : t.invalid}</div>
          )}
        </div>
        <div>
          <div className="eyebrow mb-2">{t.stackTitle}</div>
          <div className="flex min-h-[120px] flex-col-reverse justify-end gap-1 rounded-md border border-line bg-surface-2 p-2">
            {s.stack.length === 0 && <span className="text-center text-[12px] text-ink-3">{ui.demo.empty}</span>}
            {s.stack.map((c, i) => (
              <span key={i} className={`grid h-8 place-items-center rounded-md border font-mono text-[15px] font-medium ${i === s.stack.length - 1 ? "border-accent bg-accent-soft text-ink" : "border-line-strong bg-surface"}`}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">{ui.demo.step} {Math.min(k, steps.length - 1)}/{steps.length - 1}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}
