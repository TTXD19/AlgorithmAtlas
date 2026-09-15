"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, CELL, BTN } from "./StepBar";

/** 無序的訂單編號尾碼，目標：找出某一筆在哪。 */
const DATA = [17, 4, 29, 8, 51, 23, 12, 46, 3, 35];
const TARGETS = { hit: 46, miss: 40 } as const;
type Mode = keyof typeof TARGETS;

interface Step { desc: string; i: number; cmp: number; found: number | null; done: boolean }

function buildSteps(target: number): Step[] {
  const steps: Step[] = [{ desc: `要找 ${target}。資料沒有排序也沒有索引，只能從最左邊開始一格一格比。`, i: -1, cmp: 0, found: null, done: false }];
  for (let i = 0; i < DATA.length; i++) {
    const cmp = i + 1;
    if (DATA[i] === target) {
      steps.push({ desc: `第 ${cmp} 次比較：a[${i}] = ${DATA[i]}，等於 ${target}，找到了，回傳索引 ${i}。總共比了 ${cmp} 次。`, i, cmp, found: i, done: true });
      return steps;
    }
    steps.push({ desc: `第 ${cmp} 次比較：a[${i}] = ${DATA[i]}，不是 ${target}，${i === DATA.length - 1 ? "這已經是最後一格。" : "往右一格。"}`, i, cmp, found: null, done: false });
  }
  steps.push({ desc: `掃到底都沒有 ${target}，回傳 −1。這是最壞情況：n = ${DATA.length} 個元素就比了 ${DATA.length} 次。`, i: DATA.length, cmp: DATA.length, found: null, done: true });
  return steps;
}

const log2 = (n: number) => Math.ceil(Math.log2(n + 1));
const ROWS = [10, 1000, 1_000_000, 1_000_000_000];

export function LinearSearchDemo() {
  const hit = useMemo(() => buildSteps(TARGETS.hit), []);
  const miss = useMemo(() => buildSteps(TARGETS.miss), []);
  const [mode, setMode] = useState<Mode>("hit");
  const [k, setK] = useState(0);
  const steps = mode === "hit" ? hit : miss;
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["hit", "miss"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => { setMode(m); setK(0); }}>
                找 {TARGETS[m]}{m === "miss" ? "（不存在）" : ""}
              </button>
            ))}
          </div>
        }
        right={`n = ${DATA.length} · 無序`}
      />

      <div className="p-3.5">
        <div className="eyebrow mb-2">陣列（無序）</div>
        <div className="flex flex-wrap gap-1">
          {DATA.map((v, i) => {
            const tone = s.found === i ? CELL.green : i === s.i ? CELL.accent : i < s.i ? CELL.dim : "border-line-strong bg-surface";
            return (
              <div key={i} className="flex w-10 flex-col items-center gap-1">
                <span className={`grid h-8 w-10 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${tone}`}>{v}</span>
                <span className="font-mono text-[10.5px] text-ink-3">{i}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[12.5px] tabular-nums">
          <span>目標 <span className="text-ink">{TARGETS[mode]}</span></span>
          <span>比較次數 <span className="text-ink">{s.cmp}</span></span>
          <span>結果 <span className="text-ink">{s.done ? (s.found === null ? "−1" : `索引 ${s.found}`) : "…"}</span></span>
        </div>
      </div>

      <div className="border-t border-line p-3.5">
        <div className="eyebrow mb-2">最壞情況比較次數：線性 vs 二分（二分需要資料先排好）</div>
        <div className="overflow-x-auto">
          <table className="w-full max-w-[420px] border-collapse font-mono text-[12.5px] tabular-nums">
            <thead>
              <tr className="text-ink-3">
                <th className="py-1 pr-3 text-left font-medium">n</th>
                <th className="py-1 pr-3 text-right font-medium">線性 n</th>
                <th className="py-1 text-right font-medium">二分 ⌈log₂(n+1)⌉</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((n) => (
                <tr key={n} className={`border-t border-line ${n === DATA.length ? "text-ink" : "text-ink-2"}`}>
                  <td className="py-1 pr-3">{n.toLocaleString("en-US")}</td>
                  <td className="py-1 pr-3 text-right">{n.toLocaleString("en-US")}</td>
                  <td className="py-1 text-right text-green">{log2(n)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 mb-0 text-[12px] text-ink-3">n = 10 時只差 6 次，為了省這幾次先排序（O(n log n)）反而更慢。n = 10 億時線性最壞要比 10 億次，二分只要 30 次，所以同一份資料要查很多次時，先排序一次再二分才划算。</p>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
