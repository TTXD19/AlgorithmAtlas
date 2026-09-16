"use client";

import { useMemo, useState } from "react";
import { DEMO_GRAPH, demoConfigs, type DemoAlgo } from "@/lib/graph-demo";
import { getDemoText } from "@/lib/demo-text";
import { useT, useLocale } from "../LocaleProvider";

const BTN_BASE = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";
const BTN = `${BTN_BASE} border-line bg-surface hover:bg-surface-2`;
const BTN_PRIMARY = `${BTN_BASE} border-accent bg-accent text-accent-ink hover:brightness-110`;

export function GraphDemo({ algo }: { algo: DemoAlgo }) {
  const locale = useLocale();
  const config = useMemo(() => demoConfigs(getDemoText(locale).graph)[algo], [locale, algo]);
  const steps = useMemo(() => config.steps(), [config]);
  const [i, setI] = useState(0);
  const t = useT();
  const s = steps[i];
  const N = DEMO_GRAPH.nodes;
  const isTree = (a: string, b: string) => s.tree.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

  return (
    <div className="@container overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1.5">
          <button type="button" className={BTN} onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>{t.demo.prev}</button>
          <button type="button" className={BTN_PRIMARY} onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))} disabled={i === steps.length - 1}>{t.demo.next}</button>
          <button type="button" className={BTN} onClick={() => setI(0)}>{t.demo.reset}</button>
        </div>
        <div className="ml-auto flex flex-wrap gap-x-3.5 gap-y-1.5 text-[12px]">
          <Legend cls="border-line-strong bg-[var(--node-fill)]">{t.demo.undiscovered}</Legend>
          <Legend cls="border-amber bg-amber-soft">{config.activeLegend}</Legend>
          <Legend cls="border-accent bg-accent">{t.demo.processing}</Legend>
          <Legend cls="border-ink bg-ink">{t.demo.finished}</Legend>
        </div>
      </div>

      <div className="grid grid-cols-1 @[640px]:grid-cols-[minmax(0,1fr)_220px]">
        <svg viewBox="0 0 630 260" role="img" aria-label="走訪示範圖" className="block h-auto w-full">
          {DEMO_GRAPH.edges.map(([a, b]) => (
            <line key={a + b} className={`edge ${isTree(a, b) ? "tree" : ""}`} x1={N[a][0]} y1={N[a][1]} x2={N[b][0]} y2={N[b][1]} />
          ))}
          {Object.entries(N).map(([k, [x, y]]) => {
            const state = s.current === k ? "c" : s.active.includes(k) ? "q" : s.done.includes(k) ? "v" : "";
            return (
              <g key={k} className={`node ${state}`}>
                <circle cx={x} cy={y} r="18" />
                <text className="lbl" x={x} y={y}>{k}</text>
                <text className="dist" x={x} y={y + 31}>{s.label[k] ?? ""}</text>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-row gap-3.5 border-t border-line p-4 text-[13px] @[640px]:flex-col @[640px]:border-t-0 @[640px]:border-l">
          <div className="flex-1">
            <div className="eyebrow mb-1.5">{config.activeTitle}</div>
            <div className="flex min-h-[30px] flex-wrap gap-1.5">
              {s.active.length ? (
                s.active.map((k, idx) => (
                  <span key={`${k}-${idx}`} className="grid h-7 w-7 place-items-center rounded-md border border-amber bg-amber-soft font-mono text-[13px] text-amber">{k}</span>
                ))
              ) : (
                <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-7 text-ink-3">{t.demo.empty}</span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="eyebrow mb-1.5">{t.demo.order}</div>
            <div className="min-h-5 font-mono text-[13px] tracking-[0.04em]">
              {s.order.length ? (
                s.order.map((k, idx) => (
                  <span key={k}>{idx > 0 && <span className="text-ink-3"> → </span>}{k}</span>
                ))
              ) : (
                <span className="font-sans text-ink-3">尚未開始</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">{t.demo.step} {i}/{steps.length - 1}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}

function Legend({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap">
      <i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-[1.5px] align-[-1px] ${cls}`} />
      {children}
    </span>
  );
}
