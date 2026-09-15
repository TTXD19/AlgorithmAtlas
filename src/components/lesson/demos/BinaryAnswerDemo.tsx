"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** Koko 吃香蕉（LeetCode 875）：piles 是每堆的數量，h 是警衛回來前的小時數。 */
const PILES = [30, 11, 23, 4, 20];
const H = 6;
const MAX = Math.max(...PILES);

interface Step { desc: string; lo: number; hi: number; mid: number | null; hours: number[] | null; feasible: boolean | null; tested: Record<number, boolean>; ans: number | null }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const tested: Record<number, boolean> = {};
  const snap = (desc: string, lo: number, hi: number, extra: Partial<Step> = {}) =>
    steps.push({ desc, lo, hi, mid: null, hours: null, feasible: null, ans: null, tested: { ...tested }, ...extra });

  snap(`速度 k 的可能範圍是 1 到最大堆 ${MAX}（再快也沒用，一小時只能吃一堆；而 h = ${H} ≥ ${PILES.length} 堆，k = ${MAX} 一定來得及）。速度越快越來得及，所以可行性是單調的：某個 k 可行，比它大的都可行。`, 1, MAX);
  let lo = 1, hi = MAX;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const hours = PILES.map((p) => Math.ceil(p / mid));
    const total = hours.reduce((a, b) => a + b, 0);
    const feasible = total <= H;
    tested[mid] = feasible;
    const calc = PILES.map((p, i) => `⌈${p}/${mid}⌉=${hours[i]}`).join(" + ");
    snap(`試 k = ${mid}：${calc}，共 ${total} 小時，${feasible ? `≤ ${H}，來得及` : `> ${H}，來不及`}。`, lo, hi, { mid, hours, feasible });
    if (feasible) {
      snap(`${mid} 可行，答案是 ${mid} 或更小，hi = mid = ${mid}（${mid} 自己還可能是答案，要留著）。`, lo, mid, { mid, hours, feasible });
      hi = mid;
    } else {
      snap(`${mid} 不可行，比它慢的也都不可行，lo = mid + 1 = ${mid + 1}。`, mid + 1, hi, { mid, hours, feasible });
      lo = mid + 1;
    }
  }
  snap(`lo = hi = ${lo}，最小可行速度是 ${lo}。總共只驗證了 ${Object.keys(tested).length} 個速度（最多 ⌈log₂ ${MAX}⌉ = ${Math.ceil(Math.log2(MAX))} 個）；從 1 開始一個一個試，要試到 ${lo} 才找到。`, lo, hi, { ans: lo });
  return steps;
}

export function BinaryAnswerDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const speeds = Array.from({ length: MAX }, (_, i) => i + 1);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.mid !== null ? `check(${s.mid})` : s.ans !== null ? "結束" : "開始"}</span>} right={`piles = [${PILES.join(", ")}] · h = ${H}`} />

      <div className="p-3.5">
        <div className="eyebrow mb-2">候選速度 k（1 到 {MAX}），對「答案」二分</div>
        <div className="flex flex-wrap gap-1">
          {speeds.map((v) => {
            const inRange = v >= s.lo && v <= s.hi;
            const t = s.tested[v];
            const tone = s.ans === v
              ? "border-green bg-green text-accent-ink"
              : s.mid === v
                ? "border-accent bg-accent text-accent-ink"
                : t === true
                  ? "border-green bg-green-soft text-green"
                  : t === false
                    ? "border-amber bg-amber-soft text-amber"
                    : inRange ? "border-line-strong bg-surface" : "border-line bg-surface-2 text-ink-3";
            return (
              <div key={v} className="flex flex-col items-center gap-0.5">
                <span className={`grid h-7 w-7 place-items-center rounded-md border font-mono text-[11.5px] tabular-nums ${tone}`}>{v}</span>
                <span className="h-3.5 font-mono text-[9.5px] leading-[14px] text-ink-3">{s.lo === v && s.hi === v ? "lo=hi" : s.lo === v ? "lo" : s.hi === v ? "hi" : ""}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-1 text-[12px] text-ink-3">黃色：驗證過不可行。綠色：驗證過可行。可行的一定全在右邊，這就是能二分的理由。</div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-2">可行性檢查：每堆要幾小時 ⌈pile / k⌉</div>
          <div className="mb-1 font-mono text-[10.5px] text-ink-3">piles</div>
          <Cells items={PILES} w="w-10" />
          <div className="mt-2 mb-1 font-mono text-[10.5px] text-ink-3">小時數{s.mid !== null ? `（k = ${s.mid}）` : ""}</div>
          <Cells items={s.hours ?? []} tone={() => (s.feasible ? CELL.green : CELL.amber)} empty={s.ans !== null ? "搜尋結束" : "尚未檢查"} w="w-10" />
        </div>
        <div>
          <div className="eyebrow mb-2">目前狀態</div>
          <div className="flex flex-col gap-1 font-mono text-[13px] tabular-nums">
            <span>lo = <span className="text-ink">{s.lo}</span>，hi = <span className="text-ink">{s.hi}</span></span>
            <span>總小時 = <span className="text-ink">{s.hours ? s.hours.reduce((a, b) => a + b, 0) : "…"}</span>，上限 h = {H}</span>
            <span>
              結果：{s.feasible === null ? <span className="text-ink-3">…</span> : s.feasible ? <span className="text-green">可行 → hi = mid</span> : <span className="text-amber">不可行 → lo = mid + 1</span>}
            </span>
          </div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
