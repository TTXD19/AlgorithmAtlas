"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

interface State { n: number; cap: number; total: number; copies: number; history: number[]; last: string }
const TEXT = demoText(
  {
    intro: "陣列是空的，容量 1。按「push」加入元素。",
    grew: (cap: number, next: number, moved: number, cost: number) =>
      `容量 ${cap} 已滿：配置容量 ${next} 的新陣列，搬移 ${moved} 個元素，再放入新元素。這次花 ${cost}。`,
    cheap: "還有空位，直接放進去。這次花 1。",
    doubles: "滿了就把容量加倍",
    array: (n: number, cap: number) => `陣列（${n} / 容量 ${cap}）`,
    onlyFirst: "…（只畫前 64 格）",
    statPushes: "push 次數 n",
    statTotal: "總成本",
    statCopies: "其中搬移次數",
    statAvg: "平均每次 push",
    costChart: "每次 push 的成本（最近 40 次）",
    noPush: "尚未 push",
    amortised: "　搬移總次數永遠小於 n，所以總成本 < 3n，平均每次 < 3，這就是 O(1) 攤銷。",
  },
  {
    en: {
      intro: 'The array is empty with capacity 1. Press "push" to add an element.',
      grew: (cap: number, next: number, moved: number, cost: number) =>
        `Capacity ${cap} is full: allocate a new array of capacity ${next}, move ${moved} element${moved === 1 ? "" : "s"} across, then add the new one. This push costs ${cost}.`,
      cheap: "There is room, so it goes straight in. This push costs 1.",
      doubles: "Capacity doubles when it fills up",
      array: (n: number, cap: number) => `Array (${n} / capacity ${cap})`,
      onlyFirst: "…(only the first 64 slots are drawn)",
      statPushes: "pushes n",
      statTotal: "total cost",
      statCopies: "of which are moves",
      statAvg: "average per push",
      costChart: "Cost of each push (last 40)",
      noPush: "no pushes yet",
      amortised: "  The total number of moves is always under n, so the total cost is < 3n and the average is < 3. That is what amortised O(1) means.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

const init = (t: T): State => ({ n: 0, cap: 1, total: 0, copies: 0, history: [], last: t.intro });

function push(t: T, s: State): State {
  if (s.n === s.cap) {
    const cost = s.n + 1;
    return {
      n: s.n + 1, cap: s.cap * 2, total: s.total + cost, copies: s.copies + s.n,
      history: [...s.history, cost].slice(-40),
      last: t.grew(s.cap, s.cap * 2, s.n, cost),
    };
  }
  return {
    ...s, n: s.n + 1, total: s.total + 1,
    history: [...s.history, 1].slice(-40),
    last: t.cheap,
  };
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium";

export function DynamicArrayDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const initial = useMemo(() => init(t), [t]);
  const [s, setS] = useState<State>(initial);
  const many = (k: number) => setS((cur) => { let x = cur; for (let i = 0; i < k; i++) x = push(t, x); return x; });
  const maxH = Math.max(1, ...s.history);
  const avg = s.n ? s.total / s.n : 0;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1.5">
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setS((c) => push(t, c))}>push</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => many(8)}>push ×8</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setS(initial)}>{ui.demo.reset}</button>
        </div>
        <span className="ml-auto text-[12px] text-ink-3">{t.doubles}</span>
      </div>

      <div className="px-3.5 pt-3.5">
        <div className="eyebrow mb-1.5">{t.array(s.n, s.cap)}</div>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: Math.min(s.cap, 64) }, (_, i) => (
            <span key={i} className={`h-5 w-5 rounded-[3px] border ${i < s.n ? "border-accent bg-accent-soft" : "border-dashed border-line-strong"}`} />
          ))}
          {s.cap > 64 && <span className="text-[12px] text-ink-3">{t.onlyFirst}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-y border-line bg-line mt-3.5 md:grid-cols-4">
        <Stat label={t.statPushes} v={s.n} />
        <Stat label={t.statTotal} v={s.total} />
        <Stat label={t.statCopies} v={s.copies} />
        <Stat label={t.statAvg} v={avg.toFixed(2)} hi />
      </div>

      <div className="px-3.5 pt-3">
        <div className="eyebrow mb-1.5">{t.costChart}</div>
        <div className="flex h-[70px] items-end gap-[3px]">
          {s.history.length === 0 && <span className="text-[12px] text-ink-3">{t.noPush}</span>}
          {s.history.map((h, i) => (
            <i key={i} title={`${h}`} className={`block w-2 rounded-t-sm ${h > 1 ? "bg-amber" : "bg-accent"}`} style={{ height: `${Math.max(6, (h / maxH) * 100)}%` }} />
          ))}
        </div>
      </div>

      <div className="border-t border-line px-3.5 py-2.5 text-[13.5px]">
        {s.last}
        {s.n >= 8 && <span className="text-ink-2">{t.amortised}</span>}
      </div>
    </div>
  );
}

function Stat({ label, v, hi }: { label: string; v: number | string; hi?: boolean }) {
  return (
    <div className="bg-surface px-3.5 py-2.5">
      <div className="eyebrow">{label}</div>
      <div className={`font-mono text-[18px] font-medium tabular-nums ${hi ? "text-accent" : ""}`}>{v}</div>
    </div>
  );
}
