"use client";

import { useMemo, useState } from "react";

const NUMS = [4, 9, 2, 7, 11, 5];
const TARGET = 12;

const CODE = [
  "def two_sum(nums, target):",
  "    seen = {}",
  "    for i, x in enumerate(nums):",
  "        need = target - x",
  "        if need in seen:",
  "            return [seen[need], i]",
  "        seen[x] = i",
];

interface Step { desc: string; line: number; i: number; seen: [number, number][]; found?: [number, number]; need?: number; hit?: boolean }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const seen: [number, number][] = [];
  steps.push({ desc: "seen 是空的雜湊表，用來記「看過的數字 → 它的索引」。", line: 2, i: -1, seen: [] });
  for (let i = 0; i < NUMS.length; i++) {
    const x = NUMS[i];
    const need = TARGET - x;
    const hit = seen.find(([k]) => k === need);
    steps.push({ desc: `看 nums[${i}] = ${x}，需要的搭檔是 ${TARGET} − ${x} = ${need}。查 seen 裡有沒有 ${need}：一次雜湊查詢，O(1)。`, line: 4, i, seen: [...seen], need, hit: !!hit });
    if (hit) {
      steps.push({ desc: `有！${need} 在索引 ${hit[1]}。回傳 [${hit[1]}, ${i}]。整個過程只掃了一遍陣列。`, line: 5, i, seen: [...seen], need, hit: true, found: [hit[1], i] });
      return steps;
    }
    seen.push([x, i]);
    steps.push({ desc: `沒有。把 ${x} → ${i} 存進 seen，之後的數字如果需要 ${x} 就找得到。`, line: 6, i, seen: [...seen], need });
  }
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

export function TwoSumDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>上一步</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(steps.length - 1, x + 1))} disabled={k === steps.length - 1}>下一步</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>重設</button>
        </div>
        <span className="ml-auto font-mono text-[12px] text-ink-3">target = {TARGET}</span>
      </div>

      <div className="px-3.5 pt-3.5">
        <div className="eyebrow mb-1.5">nums</div>
        <div className="flex gap-1">
          {NUMS.map((v, i) => {
            const tone = s.found && (s.found[0] === i || s.found[1] === i)
              ? "border-green bg-green-soft text-green"
              : i === s.i
                ? "border-accent bg-accent text-accent-ink"
                : i < s.i
                  ? "border-line-strong bg-surface-2 text-ink-2"
                  : "border-line-strong bg-surface";
            return (
              <div key={i} className="flex w-11 flex-col items-center gap-1 font-mono text-[11px] text-ink-3">
                <span>[{i}]</span>
                <span className={`grid h-9 w-full place-items-center rounded-md border text-[14px] font-medium ${tone}`}>{v}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px]">
        <pre className="m-0 overflow-x-auto bg-code-bg px-4 py-3.5 font-mono text-[13px] leading-[1.7] text-code-ink">
          {CODE.map((line, idx) => (
            <div key={idx} className={`-mx-4 px-4 ${s.line === idx + 1 ? "bg-white/10" : ""}`}>
              <span className="mr-3 inline-block w-4 text-right text-code-cm select-none">{idx + 1}</span>
              {line}
            </div>
          ))}
        </pre>
        <div className="border-t border-line p-4 md:border-t-0 md:border-l">
          <div className="eyebrow mb-2">seen（值 → 索引）</div>
          <div className="flex min-h-[100px] flex-col gap-1">
            {s.seen.length === 0 && <span className="rounded-md border border-dashed border-line-strong px-2 py-1.5 text-center text-[12px] text-ink-3">空</span>}
            {s.seen.map(([v, i]) => (
              <div key={v} className={`flex justify-between rounded-md border px-2.5 py-1 font-mono text-[12.5px] ${s.hit && v === s.need ? "border-green bg-green-soft text-green" : "border-line bg-surface"}`}>
                <span>{v}</span><span className="text-ink-3">→ {i}</span>
              </div>
            ))}
          </div>
          {s.need !== undefined && (
            <div className={`mt-2 rounded-md px-2 py-1 text-[12px] ${s.hit ? "bg-green-soft text-green" : "bg-surface-2 text-ink-2"}`}>
              查 {s.need}：{s.hit ? "找到" : "不在表裡"}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">步驟 {k}/{steps.length - 1}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}
