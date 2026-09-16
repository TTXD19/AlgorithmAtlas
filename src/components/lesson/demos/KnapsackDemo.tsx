"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter } from "./StepBar";

/** 四個物品：重量 w、價值 v。背包容量 7。 */
const ITEMS = [
  { name: "A", w: 1, v: 1 },
  { name: "B", w: 3, v: 4 },
  { name: "C", w: 4, v: 5 },
  { name: "D", w: 5, v: 7 },
];
const CAP = 7;

const TEXT = demoText(
  {
    defineState: "定義狀態：dp[i][w] = 只考慮前 i 個物品、容量為 w 時的最大價值。答案是右下角 dp[4][7]。",
    labelDefine: "定義狀態",
    baseCase: "base case：一個物品都沒有，不管容量多少價值都是 0。第 0 列全填 0。",
    labelBase: "base case",
    rowIntro: (i: number, name: string, w: number, v: number, cap: number) =>
      `第 ${i} 列：考慮物品 ${name}（重 ${w}、值 ${v}）。容量 0 什麼都放不下，dp[${i}][0] = 0。接著 w 從 1 到 ${cap} 逐格填。`,
    labelItem: (name: string) => `物品 ${name}`,
    labelCell: (name: string, w: number) => `物品 ${name} · w = ${w}`,
    tooHeavy: (w: number, name: string, weight: number, i: number, skip: number) =>
      `容量 ${w} 放不下 ${name}（重 ${weight}），只有「不選」一條路：抄上一列同一欄，dp[${i}][${w}] = dp[${i - 1}][${w}] = ${skip}。`,
    choose: (i: number, w: number, name: string, weight: number, value: number, skip: number, take: number, best: number, tail: string) =>
      `不選 ${name}（黃）：dp[${i - 1}][${w}] = ${skip}。選 ${name}（綠）：先留 ${weight} 的空間給它，剩下容量 ${w - weight} 給前 ${i - 1} 個物品，dp[${i - 1}][${w - weight}] + ${value} = ${take}。取大的 ${best}${tail}。`,
    tailTake: "，選比較好",
    tailSkip: "，不選比較好",
    tailEqual: "，兩邊一樣",
    backtrackIntro: (n: number, cap: number, ans: number) =>
      `填完了，答案 dp[${n}][${cap}] = ${ans}。但表只告訴我們最大價值，要知道選了誰，得從右下角往上回溯。`,
    labelBacktrack: "回溯",
    answer: (ans: number) => `答案 = ${ans}`,
    chose: (i: number, w: number, here: number, above: number, name: string, weight: number) =>
      `dp[${i}][${w}] = ${here} ≠ dp[${i - 1}][${w}] = ${above}，這一格是靠「選 ${name}」得到的。記下 ${name}，容量扣掉 ${weight}，跳到 dp[${i - 1}][${w - weight}]。`,
    choseFormula: (name: string, from: number, to: number) => `選 ${name}：w ${from} → ${to}`,
    notChose: (i: number, w: number, here: number, name: string) =>
      `dp[${i}][${w}] = ${here} = dp[${i - 1}][${w}]，這一格是抄上面來的，${name} 沒有選。往上一格。`,
    notChoseFormula: (name: string, w: number) => `不選 ${name}：w 維持 ${w}`,
    finish: (names: string[], weight: number, cap: number, value: number) =>
      `回到第 0 列，結束。選了 ${names.join("、")}，總重 ${weight} ≤ ${cap}，總價值 ${value}。表格大小 (n+1)×(W+1)，每格 O(1)，整體 O(nW)。`,
    labelEnd: "結束",
    header: (cap: number) => `4 個物品 · 容量 ${cap}`,
    noItem: "無",
    itemsTitle: "物品",
    itemChip: (name: string, w: number, v: number) => `${name}：重 ${w} 值 ${v}`,
    legendSkip: "不選：dp[i−1][w]",
    legendTake: "選：dp[i−1][w−wᵢ] + vᵢ",
  },
  {
    en: {
      defineState: "The state: dp[i][w] is the best value obtainable from the first i items with a capacity of w. The answer is the bottom-right cell, dp[4][7].",
      labelDefine: "Define the state",
      baseCase: "Base case: with no items at all, the value is 0 whatever the capacity, so row 0 is all zeros.",
      labelBase: "Base case",
      rowIntro: (i: number, name: string, w: number, v: number, cap: number) =>
        `Row ${i} brings in item ${name} (weight ${w}, value ${v}). Nothing fits in capacity 0, so dp[${i}][0] = 0. Now fill w from 1 to ${cap}, one cell at a time.`,
      labelItem: (name: string) => `Item ${name}`,
      labelCell: (name: string, w: number) => `Item ${name} · w = ${w}`,
      tooHeavy: (w: number, name: string, weight: number, i: number, skip: number) =>
        `Capacity ${w} cannot hold ${name} (weight ${weight}), so skipping it is the only option: copy the cell directly above, dp[${i}][${w}] = dp[${i - 1}][${w}] = ${skip}.`,
      choose: (i: number, w: number, name: string, weight: number, value: number, skip: number, take: number, best: number, tail: string) =>
        `Skip ${name} (yellow): dp[${i - 1}][${w}] = ${skip}. Take ${name} (green): set aside ${weight} of the capacity for it, leaving ${w - weight} for the first ${i - 1} items, so dp[${i - 1}][${w - weight}] + ${value} = ${take}. Keep the larger one, ${best}${tail}.`,
      tailTake: " — taking it wins",
      tailSkip: " — skipping it wins",
      tailEqual: " — the two are equal",
      backtrackIntro: (n: number, cap: number, ans: number) =>
        `The table is full and the answer is dp[${n}][${cap}] = ${ans}. But the table only gives the best value; to see which items it used, walk back from the bottom-right corner.`,
      labelBacktrack: "Backtrack",
      answer: (ans: number) => `answer = ${ans}`,
      chose: (i: number, w: number, here: number, above: number, name: string, weight: number) =>
        `dp[${i}][${w}] = ${here} ≠ dp[${i - 1}][${w}] = ${above}, so this cell came from taking ${name}. Record ${name}, subtract ${weight} from the capacity, and jump to dp[${i - 1}][${w - weight}].`,
      choseFormula: (name: string, from: number, to: number) => `take ${name}: w ${from} → ${to}`,
      notChose: (i: number, w: number, here: number, name: string) =>
        `dp[${i}][${w}] = ${here} = dp[${i - 1}][${w}], so this cell was copied from the one above and ${name} was not taken. Move up a row.`,
      notChoseFormula: (name: string, w: number) => `skip ${name}: w stays ${w}`,
      finish: (names: string[], weight: number, cap: number, value: number) =>
        `Row 0 — done. The chosen items are ${names.join(", ")}, weighing ${weight} ≤ ${cap} in total and worth ${value}. The table is (n+1)×(W+1) and every cell costs O(1), so the whole thing is O(nW).`,
      labelEnd: "Done",
      header: (cap: number) => `4 items · capacity ${cap}`,
      noItem: "none",
      itemsTitle: "Items",
      itemChip: (name: string, w: number, v: number) => `${name}: weight ${w}, value ${v}`,
      legendSkip: "Skip: dp[i−1][w]",
      legendTake: "Take: dp[i−1][w−wᵢ] + vᵢ",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

type Pos = [number, number];
interface Step {
  desc: string; label: string; formula: string;
  table: (number | null)[][];
  cur: Pos | null; skip: Pos | null; take: Pos | null;
  path: Pos[]; chosen: number[]; rejected: number[];
}

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const n = ITEMS.length;
  const table: (number | null)[][] = Array.from({ length: n + 1 }, () => Array.from({ length: CAP + 1 }, () => null));
  const snap = (desc: string, label: string, formula: string, extra: Partial<Step> = {}) =>
    steps.push({ desc, label, formula, table: table.map((r) => [...r]), cur: null, skip: null, take: null, path: [], chosen: [], rejected: [], ...extra });

  snap(t.defineState, t.labelDefine, "dp[i][w] = max(dp[i−1][w], dp[i−1][w−wᵢ] + vᵢ)");
  for (let w = 0; w <= CAP; w++) table[0][w] = 0;
  snap(t.baseCase, t.labelBase, "dp[0][w] = 0");

  for (let i = 1; i <= n; i++) {
    const it = ITEMS[i - 1];
    table[i][0] = 0;
    snap(t.rowIntro(i, it.name, it.w, it.v, CAP), t.labelItem(it.name), `dp[${i}][0] = 0`, { cur: [i, 0] });
    for (let w = 1; w <= CAP; w++) {
      const skip = table[i - 1][w] as number;
      if (w < it.w) {
        table[i][w] = skip;
        snap(t.tooHeavy(w, it.name, it.w, i, skip), t.labelCell(it.name, w), `dp[${i}][${w}] = dp[${i - 1}][${w}] = ${skip}`, { cur: [i, w], skip: [i - 1, w] });
      } else {
        const takeBase = table[i - 1][w - it.w] as number;
        const take = takeBase + it.v;
        table[i][w] = Math.max(skip, take);
        snap(
          t.choose(i, w, it.name, it.w, it.v, skip, take, table[i][w] as number, take > skip ? t.tailTake : take < skip ? t.tailSkip : t.tailEqual),
          t.labelCell(it.name, w),
          `dp[${i}][${w}] = max(${skip}, ${takeBase} + ${it.v}) = ${table[i][w]}`,
          { cur: [i, w], skip: [i - 1, w], take: [i - 1, w - it.w] },
        );
      }
    }
  }

  // 回溯：從 dp[n][CAP] 往上走，值有變就是選了這個物品
  const path: Pos[] = [[n, CAP]];
  const chosen: number[] = [];
  const rejected: number[] = [];
  let w: number = CAP;
  const answer = table[n][CAP] as number;
  snap(t.backtrackIntro(n, CAP, answer), t.labelBacktrack, t.answer(answer), { cur: [n, CAP], path: [...path] });
  for (let i = n; i >= 1; i--) {
    const it = ITEMS[i - 1];
    const here = table[i][w] as number;
    const above = table[i - 1][w] as number;
    if (here !== above) {
      chosen.push(i - 1);
      path.push([i - 1, w - it.w]);
      snap(t.chose(i, w, here, above, it.name, it.w), t.labelBacktrack, t.choseFormula(it.name, w, w - it.w), { cur: [i - 1, w - it.w], path: [...path], chosen: [...chosen], rejected: [...rejected] });
      w -= it.w;
    } else {
      rejected.push(i - 1);
      path.push([i - 1, w]);
      snap(t.notChose(i, w, here, it.name), t.labelBacktrack, t.notChoseFormula(it.name, w), { cur: [i - 1, w], path: [...path], chosen: [...chosen], rejected: [...rejected] });
    }
  }
  const names = chosen.slice().reverse().map((c) => ITEMS[c].name);
  snap(t.finish(names, chosen.reduce((a, c) => a + ITEMS[c].w, 0), CAP, answer), t.labelEnd, t.answer(answer), { path: [...path], chosen: [...chosen], rejected: [...rejected] });
  return steps;
}

const same = (a: Pos | null, i: number, w: number) => a !== null && a[0] === i && a[1] === w;

export function KnapsackDemo() {
  const t = TEXT[useLocale()];
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const onPath = (i: number, w: number) => s.path.some((p) => p[0] === i && p[1] === w);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.label}</span>} right={t.header(CAP)} />

      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="overflow-x-auto">
          <div className="eyebrow mb-2">dp[i][w]</div>
          <table className="border-collapse font-mono text-[12.5px] tabular-nums">
            <thead>
              <tr>
                <th className="pr-2 pb-1 text-left text-[10.5px] font-normal text-ink-3">i \ w</th>
                {Array.from({ length: CAP + 1 }, (_, w) => (
                  <th key={w} className="w-9 pb-1 text-center text-[10.5px] font-normal text-ink-3">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.map((row, i) => (
                <tr key={i}>
                  <td className="pr-2 text-[11px] whitespace-nowrap text-ink-3">
                    {i === 0 ? t.noItem : `${ITEMS[i - 1].name} (${ITEMS[i - 1].w},${ITEMS[i - 1].v})`}
                  </td>
                  {row.map((v, w) => {
                    let cls = "border-line-strong bg-surface";
                    if (same(s.cur, i, w)) cls = "border-accent bg-accent text-accent-ink";
                    else if (same(s.skip, i, w)) cls = "border-amber bg-amber-soft text-amber";
                    else if (same(s.take, i, w)) cls = "border-green bg-green-soft text-green";
                    else if (onPath(i, w)) cls = "border-green bg-green-soft text-green";
                    else if (v === null) cls = "border-line bg-surface-2 text-ink-3";
                    return (
                      <td key={w} className="p-0.5">
                        <span className={`grid h-8 w-8 place-items-center rounded-md border ${cls}`}>{v === null ? "·" : v}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <div className="eyebrow mb-2">{t.itemsTitle}</div>
            <div className="flex flex-wrap gap-1.5">
              {ITEMS.map((it, idx) => (
                <span
                  key={it.name}
                  className={`rounded-md border px-2 py-1 font-mono text-[12.5px] tabular-nums ${
                    s.chosen.includes(idx) ? "border-green bg-green-soft text-green" : s.rejected.includes(idx) ? "border-line bg-surface-2 text-ink-3 line-through" : s.cur && s.cur[0] === idx + 1 && s.path.length === 0 ? "border-accent bg-accent-soft" : "border-line-strong bg-surface"
                  }`}
                >
                  {t.itemChip(it.name, it.w, it.v)}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[13px] tabular-nums">{s.formula}</div>
          <div className="flex flex-wrap gap-3 text-[12px] text-ink-3">
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-amber bg-amber-soft align-middle" />{t.legendSkip}</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-green bg-green-soft align-middle" />{t.legendTake}</span>
          </div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
