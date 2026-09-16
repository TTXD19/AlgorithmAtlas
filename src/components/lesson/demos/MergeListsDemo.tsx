"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const A = [1, 3, 5, 8];
const B = [2, 3, 7];

const TEXT = demoText(
  {
    intro: "準備一個 dummy 節點當結果的起點，tail 指著它。i、j 分別指向兩條串列的頭。",
    takeA: (av: number, bv: number) => `${av} ≤ ${bv}，取 A 的`,
    takeB: (bv: number) => `${bv} 比較小，取 B 的`,
    tie: "相等時取 A 的，保持穩定。",
    compare: (av: number, bv: number, choice: string, ptr: string, tie: string) =>
      `比較 ${av} 和 ${bv}：${choice}。tail.next 指向它，tail 往前推，${ptr} 也往前推。${tie}`,
    rest: (empty: string, rest: string, vals: string) =>
      `${empty} 用完了。${rest} 剩下的 ${vals} 本來就是接好的，tail.next 直接指過去，不用一個一個接。`,
    done: "完成。回傳 dummy.next。每個節點只看一次，O(n + m) 時間；沒有建新節點，只改指標，O(1) 額外空間。",
    result: "結果",
  },
  {
    en: {
      intro: "Start with a dummy node as the head of the result, with tail pointing at it. i and j point at the heads of the two lists.",
      takeA: (av: number, bv: number) => `${av} ≤ ${bv}, so take A's node`,
      takeB: (bv: number) => `${bv} is smaller, so take B's node`,
      tie: "On a tie we take A's node, which is what keeps the merge stable.",
      compare: (av: number, bv: number, choice: string, ptr: string, tie: string) =>
        `Compare ${av} and ${bv}: ${choice}. tail.next points at it, tail moves along, and ${ptr} moves along too.${tie ? ` ${tie}` : ""}`,
      rest: (empty: string, rest: string, vals: string) =>
        `${empty} has run out. What is left of ${rest}, ${vals}, is already linked together, so tail.next can point straight at it rather than appending node by node.`,
      done: "Done — return dummy.next. Every node is visited exactly once, so O(n + m) time, and no new node is allocated, only pointers rewired, so O(1) extra space.",
      result: "Out",
    },
  },
);

type Dict = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; i: number; j: number; out: { v: number; from: "a" | "b" }[]; pick?: "a" | "b" }

function buildSteps(t: Dict): Step[] {
  const steps: Step[] = [];
  let i = 0, j = 0;
  const out: { v: number; from: "a" | "b" }[] = [];
  steps.push({ desc: t.intro, i, j, out: [] });
  while (i < A.length && j < B.length) {
    const pick: "a" | "b" = A[i] <= B[j] ? "a" : "b";
    const v = pick === "a" ? A[i] : B[j];
    const choice = pick === "a" ? t.takeA(A[i], B[j]) : t.takeB(B[j]);
    steps.push({ desc: t.compare(A[i], B[j], choice, pick === "a" ? "i" : "j", A[i] === B[j] ? t.tie : ""), i, j, out: [...out], pick });
    out.push({ v, from: pick });
    if (pick === "a") i++; else j++;
  }
  const rest = i < A.length ? "A" : "B";
  const restVals = i < A.length ? A.slice(i) : B.slice(j);
  steps.push({ desc: t.rest(rest === "A" ? "B" : "A", rest, restVals.join(" → ")), i, j, out: [...out] });
  restVals.forEach((v) => out.push({ v, from: rest === "A" ? "a" : "b" }));
  steps.push({ desc: t.done, i: A.length, j: B.length, out: [...out] });
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

export function MergeListsDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const steps = useMemo(() => buildSteps(t), [t]);
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
      </div>

      <div className="flex flex-col gap-3 overflow-x-auto px-3.5 pt-3.5 pb-3">
        <ListRow label="A" vals={A} ptr={s.i} ptrLabel="i" pick={s.pick === "a"} tone="accent" />
        <ListRow label="B" vals={B} ptr={s.j} ptrLabel="j" pick={s.pick === "b"} tone="amber" />
        <div className="flex items-center">
          <span className="w-8 shrink-0 font-mono text-[12px] text-ink-3">{t.result}</span>
          <span className="rounded-md border border-dashed border-line-strong px-2 py-1 font-mono text-[11.5px] text-ink-3">dummy</span>
          {s.out.map((o, idx) => (
            <span key={idx} className="flex items-center">
              <span className="mx-0.5 text-ink-3">→</span>
              <span className={`grid h-9 w-10 place-items-center rounded-md border font-mono text-[14px] font-medium ${o.from === "a" ? "border-accent bg-accent-soft" : "border-amber bg-amber-soft text-amber"}`}>{o.v}</span>
            </span>
          ))}
          {s.out.length > 0 && <span className="ml-1.5 rounded bg-surface-2 px-1.5 font-mono text-[10.5px] text-ink-2">tail</span>}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">{ui.demo.step} {k}/{steps.length - 1}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}

function ListRow({ label, vals, ptr, ptrLabel, pick, tone }: { label: string; vals: number[]; ptr: number; ptrLabel: string; pick: boolean; tone: "accent" | "amber" }) {
  const soft = tone === "accent" ? "border-accent bg-accent-soft" : "border-amber bg-amber-soft text-amber";
  const solid = tone === "accent" ? "border-accent bg-accent text-accent-ink" : "border-amber bg-amber text-accent-ink";
  return (
    <div className="flex items-start">
      <span className="w-8 shrink-0 pt-2 font-mono text-[12px] text-ink-3">{label}</span>
      {vals.map((v, idx) => {
        const used = idx < ptr;
        const cur = idx === ptr;
        return (
          <div key={idx} className="flex flex-col items-center">
            <div className="flex items-center">
              <span className={`grid h-9 w-10 place-items-center rounded-md border font-mono text-[14px] font-medium ${used ? "border-line bg-surface-2 text-ink-3 line-through" : cur && pick ? solid : cur ? soft : "border-line-strong bg-surface"}`}>{v}</span>
              <span className="w-5 text-center text-ink-3">{idx < vals.length - 1 ? "→" : "∅"}</span>
            </div>
            <div className="h-5">{cur && <span className="rounded bg-surface-2 px-1.5 font-mono text-[10.5px] leading-5 text-ink-2">{ptrLabel}</span>}</div>
          </div>
        );
      })}
    </div>
  );
}
