"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** Koko 吃香蕉（LeetCode 875）：piles 是每堆的數量，h 是警衛回來前的小時數。 */
const PILES = [30, 11, 23, 4, 20];
const H = 6;
const MAX = Math.max(...PILES);

const TEXT = demoText(
  {
    opStart: "開始",
    opEnd: "結束",
    intro: (max: number, h: number, piles: number) =>
      `速度 k 的可能範圍是 1 到最大堆 ${max}（再快也沒用，一小時只能吃一堆；而 h = ${h} ≥ ${piles} 堆，k = ${max} 一定來得及）。速度越快越來得及，所以可行性是單調的：某個 k 可行，比它大的都可行。`,
    test: (mid: number, calc: string, total: number, h: number, feasible: boolean) =>
      `試 k = ${mid}：${calc}，共 ${total} 小時，${feasible ? `≤ ${h}，來得及` : `> ${h}，來不及`}。`,
    feasible: (mid: number) => `${mid} 可行，答案是 ${mid} 或更小，hi = mid = ${mid}（${mid} 自己還可能是答案，要留著）。`,
    infeasible: (mid: number) => `${mid} 不可行，比它慢的也都不可行，lo = mid + 1 = ${mid + 1}。`,
    done: (lo: number, tested: number, max: number, logMax: number) =>
      `lo = hi = ${lo}，最小可行速度是 ${lo}。總共只驗證了 ${tested} 個速度（最多 ⌈log₂ ${max}⌉ = ${logMax} 個）；從 1 開始一個一個試，要試到 ${lo} 才找到。`,
    candidates: (max: number) => `候選速度 k（1 到 ${max}），對「答案」二分`,
    legend: "黃色：驗證過不可行。綠色：驗證過可行。可行的一定全在右邊，這就是能二分的理由。",
    checkTitle: "可行性檢查：每堆要幾小時 ⌈pile / k⌉",
    hoursLabel: (mid: number | null) => `小時數${mid !== null ? `（k = ${mid}）` : ""}`,
    searchOver: "搜尋結束",
    notChecked: "尚未檢查",
    stateTitle: "目前狀態",
    comma: "，",
    totalHours: "總小時",
    limit: "上限",
    resultLabel: "結果：",
    feasibleTag: "可行 → hi = mid",
    infeasibleTag: "不可行 → lo = mid + 1",
  },
  {
    en: {
      opStart: "Start",
      opEnd: "Done",
      intro: (max: number, h: number, piles: number) =>
        `The speed k can only lie between 1 and the largest pile, ${max} (eating faster than that is wasted, because only one pile can be eaten per hour; and since h = ${h} ≥ ${piles} piles, k = ${max} always finishes in time). A higher speed is never worse, so feasibility is monotone: if some k works, every larger k works too.`,
      test: (mid: number, calc: string, total: number, h: number, feasible: boolean) =>
        `Try k = ${mid}: ${calc}, which is ${total} hours — ${feasible ? `that is ≤ ${h}, so it finishes in time` : `that is more than ${h}, so it does not finish in time`}.`,
      feasible: (mid: number) => `${mid} works, so the answer is ${mid} or smaller: hi = mid = ${mid}. Keep ${mid} itself in the range, because it may still be the answer.`,
      infeasible: (mid: number) => `${mid} does not work, and nothing slower can either, so lo = mid + 1 = ${mid + 1}.`,
      done: (lo: number, tested: number, max: number, logMax: number) =>
        `lo = hi = ${lo}, so the smallest workable speed is ${lo}. Only ${tested} speeds were checked in all, and at most ⌈log₂ ${max}⌉ = ${logMax} would ever be needed; trying every speed from 1 upwards would have taken ${lo} checks.`,
      candidates: (max: number) => `Candidate speeds k (1 to ${max}) — binary search over the answer itself`,
      legend: "Yellow: checked and not feasible. Green: checked and feasible. Every feasible speed sits to the right of every infeasible one, and that is exactly what makes binary search valid here.",
      checkTitle: "Feasibility check: the hours each pile needs, ⌈pile / k⌉",
      hoursLabel: (mid: number | null) => `Hours${mid !== null ? ` (k = ${mid})` : ""}`,
      searchOver: "search finished",
      notChecked: "not checked yet",
      stateTitle: "Current state",
      comma: ", ",
      totalHours: "Total hours",
      limit: "limit",
      resultLabel: "Result: ",
      feasibleTag: "feasible → hi = mid",
      infeasibleTag: "not feasible → lo = mid + 1",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; lo: number; hi: number; mid: number | null; hours: number[] | null; feasible: boolean | null; tested: Record<number, boolean>; ans: number | null }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const tested: Record<number, boolean> = {};
  const snap = (desc: string, lo: number, hi: number, extra: Partial<Step> = {}) =>
    steps.push({ desc, lo, hi, mid: null, hours: null, feasible: null, ans: null, tested: { ...tested }, ...extra });

  snap(t.intro(MAX, H, PILES.length), 1, MAX);
  let lo = 1, hi = MAX;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    const hours = PILES.map((p) => Math.ceil(p / mid));
    const total = hours.reduce((a, b) => a + b, 0);
    const feasible = total <= H;
    tested[mid] = feasible;
    const calc = PILES.map((p, i) => `⌈${p}/${mid}⌉=${hours[i]}`).join(" + ");
    snap(t.test(mid, calc, total, H, feasible), lo, hi, { mid, hours, feasible });
    if (feasible) {
      snap(t.feasible(mid), lo, mid, { mid, hours, feasible });
      hi = mid;
    } else {
      snap(t.infeasible(mid), mid + 1, hi, { mid, hours, feasible });
      lo = mid + 1;
    }
  }
  snap(t.done(lo, Object.keys(tested).length, MAX, Math.ceil(Math.log2(MAX))), lo, hi, { ans: lo });
  return steps;
}

export function BinaryAnswerDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const speeds = Array.from({ length: MAX }, (_, i) => i + 1);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.mid !== null ? `check(${s.mid})` : s.ans !== null ? t.opEnd : t.opStart}</span>} right={`piles = [${PILES.join(", ")}] · h = ${H}`} />

      <div className="p-3.5">
        <div className="eyebrow mb-2">{t.candidates(MAX)}</div>
        <div className="flex flex-wrap gap-1">
          {speeds.map((v) => {
            const inRange = v >= s.lo && v <= s.hi;
            const checked = s.tested[v];
            const tone = s.ans === v
              ? "border-green bg-green text-accent-ink"
              : s.mid === v
                ? "border-accent bg-accent text-accent-ink"
                : checked === true
                  ? "border-green bg-green-soft text-green"
                  : checked === false
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
        <div className="mt-1 text-[12px] text-ink-3">{t.legend}</div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-2">{t.checkTitle}</div>
          <div className="mb-1 font-mono text-[10.5px] text-ink-3">piles</div>
          <Cells items={PILES} w="w-10" />
          <div className="mt-2 mb-1 font-mono text-[10.5px] text-ink-3">{t.hoursLabel(s.mid)}</div>
          <Cells items={s.hours ?? []} tone={() => (s.feasible ? CELL.green : CELL.amber)} empty={s.ans !== null ? t.searchOver : t.notChecked} w="w-10" />
        </div>
        <div>
          <div className="eyebrow mb-2">{t.stateTitle}</div>
          <div className="flex flex-col gap-1 font-mono text-[13px] tabular-nums">
            <span>lo = <span className="text-ink">{s.lo}</span>{t.comma}hi = <span className="text-ink">{s.hi}</span></span>
            <span>{t.totalHours} = <span className="text-ink">{s.hours ? s.hours.reduce((a, b) => a + b, 0) : "…"}</span>{t.comma}{t.limit} h = {H}</span>
            <span>
              {t.resultLabel}{s.feasible === null ? <span className="text-ink-3">…</span> : s.feasible ? <span className="text-green">{t.feasibleTag}</span> : <span className="text-amber">{t.infeasibleTag}</span>}
            </span>
          </div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
