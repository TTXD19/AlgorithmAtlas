"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, CELL } from "./StepBar";
import { DemoInput } from "./DemoInput";

/** 無序的訂單編號尾碼，目標：找出某一筆在哪。 */
const DEFAULT_DATA = [17, 4, 29, 8, 51, 23, 12, 46, 3, 35];
const DEFAULT_TARGET = 46;

const TEXT = demoText(
  {
    intro: (target: number) => `要找 ${target}。資料沒有排序也沒有索引，只能從最左邊開始一格一格比。`,
    hit: (cmp: number, i: number, v: number, target: number) =>
      `第 ${cmp} 次比較：a[${i}] = ${v}，等於 ${target}，找到了，回傳索引 ${i}。總共比了 ${cmp} 次。`,
    miss: (cmp: number, i: number, v: number, target: number, atEnd: boolean) =>
      `第 ${cmp} 次比較：a[${i}] = ${v}，不是 ${target}，${atEnd ? "這已經是最後一格。" : "往右一格。"}`,
    notFound: (target: number, n: number) =>
      `掃到底都沒有 ${target}，回傳 −1。這是最壞情況：n = ${n} 個元素就比了 ${n} 次。`,
    findLabel: (target: number, missing: boolean) => `找 ${target}${missing ? "（不存在）" : ""}`,
    unsorted: (n: number) => `n = ${n} · 無序`,
    arrayTitle: "陣列（無序）",
    target: "目標",
    comparisons: "比較次數",
    result: "結果",
    atIndex: (i: number) => `索引 ${i}`,
    tableTitle: "最壞情況比較次數：線性 vs 二分（二分需要資料先排好）",
    colLinear: "線性 n",
    colBinary: "二分 ⌈log₂(n+1)⌉",
    note: "n = 10 時只差 6 次，為了省這幾次先排序（O(n log n)）反而更慢。n = 10 億時線性最壞要比 10 億次，二分只要 30 次，所以同一份資料要查很多次時，先排序一次再二分才划算。",
  },
  {
    en: {
      intro: (target: number) => `We are looking for ${target}. The data is neither sorted nor indexed, so all we can do is start at the left and compare one cell at a time.`,
      hit: (cmp: number, i: number, v: number, target: number) =>
        `Comparison ${cmp}: a[${i}] = ${v}, which equals ${target}. Found it — return index ${i}. That took ${cmp} comparison${cmp === 1 ? "" : "s"} in total.`,
      miss: (cmp: number, i: number, v: number, target: number, atEnd: boolean) =>
        `Comparison ${cmp}: a[${i}] = ${v}, which is not ${target}. ${atEnd ? "That was the last cell." : "Move one cell to the right."}`,
      notFound: (target: number, n: number) =>
        `The scan reached the end without finding ${target}, so return −1. This is the worst case: ${n} elements took ${n} comparisons.`,
      findLabel: (target: number, missing: boolean) => `Find ${target}${missing ? " (not present)" : ""}`,
      unsorted: (n: number) => `n = ${n} · unsorted`,
      arrayTitle: "The array (unsorted)",
      target: "Target",
      comparisons: "Comparisons",
      result: "Result",
      atIndex: (i: number) => `index ${i}`,
      tableTitle: "Worst-case comparisons: linear versus binary search (binary search needs sorted data)",
      colLinear: "Linear: n",
      colBinary: "Binary: ⌈log₂(n+1)⌉",
      note: "At n = 10 the difference is only 6 comparisons, and sorting first (O(n log n)) costs far more than it saves. At n = 1,000,000,000 linear search needs a billion comparisons in the worst case while binary search needs 30 — so sorting once and then binary searching only pays off when the same data is queried many times.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; i: number; cmp: number; found: number | null; done: boolean }

function buildSteps(t: T, data: number[], target: number): Step[] {
  const steps: Step[] = [{ desc: t.intro(target), i: -1, cmp: 0, found: null, done: false }];
  for (let i = 0; i < data.length; i++) {
    const cmp = i + 1;
    if (data[i] === target) {
      steps.push({ desc: t.hit(cmp, i, data[i], target), i, cmp, found: i, done: true });
      return steps;
    }
    steps.push({ desc: t.miss(cmp, i, data[i], target, i === data.length - 1), i, cmp, found: null, done: false });
  }
  steps.push({ desc: t.notFound(target, data.length), i: data.length, cmp: data.length, found: null, done: true });
  return steps;
}

const log2 = (n: number) => Math.ceil(Math.log2(n + 1));
const ROWS = [10, 1000, 1_000_000, 1_000_000_000];

export function LinearSearchDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const [data, setData] = useState(DEFAULT_DATA);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const steps = useMemo(() => buildSteps(TEXT[locale], data, target), [locale, data, target]);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={steps.length}
        setK={setK}
        left={<span className="font-mono text-[12.5px] text-ink">{t.findLabel(target, !data.includes(target))}</span>}
        right={t.unsorted(data.length)}
      />
      <DemoInput
        value={data}
        defaults={DEFAULT_DATA}
        onChange={(a) => { setData(a); setK(0); }}
        target={{ value: target, defaults: DEFAULT_TARGET, onChange: (v) => { setTarget(v); setK(0); } }}
      />

      <div className="p-3.5">
        <div className="eyebrow mb-2">{t.arrayTitle}</div>
        <div className="flex flex-wrap gap-1">
          {data.map((v, i) => {
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
          <span>{t.target} <span className="text-ink">{target}</span></span>
          <span>{t.comparisons} <span className="text-ink">{s.cmp}</span></span>
          <span>{t.result} <span className="text-ink">{s.done ? (s.found === null ? "−1" : t.atIndex(s.found)) : "…"}</span></span>
        </div>
      </div>

      <div className="border-t border-line p-3.5">
        <div className="eyebrow mb-2">{t.tableTitle}</div>
        <div className="overflow-x-auto">
          <table className="w-full max-w-[420px] border-collapse font-mono text-[12.5px] tabular-nums">
            <thead>
              <tr className="text-ink-3">
                <th className="py-1 pr-3 text-left font-medium">n</th>
                <th className="py-1 pr-3 text-right font-medium">{t.colLinear}</th>
                <th className="py-1 text-right font-medium">{t.colBinary}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((n) => (
                <tr key={n} className={`border-t border-line ${n === data.length ? "text-ink" : "text-ink-2"}`}>
                  <td className="py-1 pr-3">{n.toLocaleString("en-US")}</td>
                  <td className="py-1 pr-3 text-right">{n.toLocaleString("en-US")}</td>
                  <td className="py-1 text-right text-green">{log2(n)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 mb-0 text-[12px] text-ink-3">{t.note}</p>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
