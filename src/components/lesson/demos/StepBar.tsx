"use client";

import type { ReactNode } from "react";
import { useT } from "../../LocaleProvider";

export const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";
export const BTN_PLAIN = `${BTN} border-line bg-surface hover:bg-surface-2`;
export const BTN_PRIMARY = `${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`;

/** 示範元件共用的上方控制列：上一步／下一步／重設 + 右側說明 */
export function StepHeader({ k, total, setK, right, left }: { k: number; total: number; setK: (f: (x: number) => number) => void; right?: ReactNode; left?: ReactNode }) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
      <div className="flex gap-1.5">
        <button type="button" className={BTN_PLAIN} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>{t.demo.prev}</button>
        <button type="button" className={BTN_PRIMARY} onClick={() => setK((x) => Math.min(total - 1, x + 1))} disabled={k >= total - 1}>{t.demo.next}</button>
        <button type="button" className={BTN_PLAIN} onClick={() => setK(() => 0)}>{t.demo.reset}</button>
      </div>
      {left}
      {right && <span className="ml-auto text-[12px] text-ink-3">{right}</span>}
    </div>
  );
}

/** 示範元件共用的下方說明列 */
export function StepFooter({ k, total, children }: { k: number; total: number; children: ReactNode }) {
  const t = useT();
  return (
    <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
      <span className="shrink-0 font-mono text-[12px] text-ink-3">{t.demo.step} {k}/{total - 1}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

/** 一格一格的小方塊列（陣列、佇列、堆疊都用得到） */
export function Cells({ items, tone = () => "", empty, w = "w-9" }: { items: (string | number)[]; tone?: (i: number) => string; empty?: string; w?: string }) {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((v, i) => (
        <span key={i} className={`grid h-8 ${w} place-items-center rounded-md border font-mono text-[13px] tabular-nums ${tone(i) || "border-line-strong bg-surface"}`}>{v}</span>
      ))}
      {items.length === 0 && <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-8 text-ink-3">{empty ?? t.demo.empty}</span>}
    </div>
  );
}

export const CELL = {
  accent: "border-accent bg-accent text-accent-ink",
  amber: "border-amber bg-amber-soft text-amber",
  green: "border-green bg-green-soft text-green",
  dim: "border-line bg-surface-2 text-ink-3",
};
