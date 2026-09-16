"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** House Robber：每間房子的錢，相鄰兩間不能都搶。 */
const NUMS = [2, 7, 9, 3, 1, 8, 4];

type Phase = "none" | "base" | "look" | "fill";
type Pick = "take" | "skip" | "tie";

const TEXT = demoText(
  {
    sep: "、",
    defineState: "定義狀態：dp[i] = 只考慮前 i+1 間房子，能搶到的最多錢。答案是 dp[n−1]。",
    defineStateLabel: "定義狀態",
    base1: (v: number) => `base case：只有一間房子，當然搶它。dp[0] = ${v}。`,
    base2: (a: number, b: number, v: number) => `base case：兩間房子相鄰，只能搶一間，取大的。dp[1] = max(${a}, ${b}) = ${v}。`,
    look: (i: number, money: number, skip: number, prev2: number, take: number) =>
      `第 ${i} 間有 $${money}。兩個選擇：不搶，答案跟 dp[${i - 1}] = ${skip} 一樣（黃）；搶，就不能搶第 ${i - 1} 間，只能接在 dp[${i - 2}] = ${prev2} 後面（綠），得 ${prev2} + ${money} = ${take}。`,
    labelLook: (i: number) => `i = ${i}：看兩個來源`,
    fill: (i: number, v: number, pick: Pick) =>
      `取大的：dp[${i}] = ${v}${pick === "take" ? "，這一格是「搶」比較好" : pick === "skip" ? "，這一格是「不搶」比較好" : "，兩邊一樣"}。dp[${i}] 只用到前兩格，所以其實只要留 prev2 和 prev1 兩個變數。`,
    labelFill: (i: number) => `i = ${i}：填入`,
    end: (last: number, v: number, chosen: string, sum: string) =>
      `答案 dp[${last}] = ${v}。從尾往前回溯：dp[i] 跟 dp[i−1] 不同就代表第 i 間有搶，跳到 i−2；相同就是沒搶。搶的是第 ${chosen} 間（綠），${sum} = ${v}。`,
    answerFormula: (v: number) => `答案 = ${v}`,
    backtrackLabel: "回溯",
    rightNote: "相鄰不能都搶",
    rowsTitle: "nums（每間房子的錢）與 dp（只考慮第 0～i 間，能搶到的最多錢）",
    legendSkip: "不搶第 i 間：dp[i−1]",
    legendTake: "搶第 i 間：dp[i−2] + nums[i]",
    rolling: "滾動變數",
  },
  {
    en: {
      sep: ", ",
      defineState: "Define the state: dp[i] is the most money you can take from the first i+1 houses. The answer is dp[n−1].",
      defineStateLabel: "Define the state",
      base1: (v: number) => `Base case: with only one house, you obviously rob it. dp[0] = ${v}.`,
      base2: (a: number, b: number, v: number) => `Base case: two adjacent houses, so only one of them can be robbed — take the larger. dp[1] = max(${a}, ${b}) = ${v}.`,
      look: (i: number, money: number, skip: number, prev2: number, take: number) =>
        `House ${i} holds $${money}. Two choices: skip it, and the answer stays dp[${i - 1}] = ${skip} (amber); or rob it, which rules out house ${i - 1} and leaves you building on dp[${i - 2}] = ${prev2} (green), giving ${prev2} + ${money} = ${take}.`,
      labelLook: (i: number) => `i = ${i}: two sources`,
      fill: (i: number, v: number, pick: Pick) =>
        `Take the larger: dp[${i}] = ${v}${pick === "take" ? ", so robbing wins in this cell" : pick === "skip" ? ", so skipping wins in this cell" : ", so the two options tie"}. dp[${i}] only ever reads the two cells before it, which means two variables, prev2 and prev1, are all you really need.`,
      labelFill: (i: number) => `i = ${i}: fill in`,
      end: (last: number, v: number, chosen: string, sum: string) =>
        `The answer is dp[${last}] = ${v}. Tracing back from the end: where dp[i] differs from dp[i−1], house i was robbed, so jump to i−2; where they match, it was skipped. The houses robbed are ${chosen} (green), and ${sum} = ${v}.`,
      answerFormula: (v: number) => `answer = ${v}`,
      backtrackLabel: "Trace back",
      rightNote: "no two adjacent houses",
      rowsTitle: "nums (money in each house) and dp (the most you can take from houses 0 through i)",
      legendSkip: "Skip house i: dp[i−1]",
      legendTake: "Rob house i: dp[i−2] + nums[i]",
      rolling: "Rolling variables",
    },
  },
);

type Dict = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; i: number; phase: Phase; dp: (number | null)[]; chosen: number[]; formula: string; label: string }

function buildSteps(t: Dict): Step[] {
  const steps: Step[] = [];
  const dp: (number | null)[] = NUMS.map(() => null);
  const snap = (desc: string, i: number, phase: Phase, formula: string, label: string, chosen: number[] = []) =>
    steps.push({ desc, i, phase, dp: [...dp], chosen, formula, label });

  snap(t.defineState, -1, "none", "dp[i] = max(dp[i−1], dp[i−2] + nums[i])", t.defineStateLabel);
  dp[0] = NUMS[0];
  snap(t.base1(NUMS[0]), 0, "base", `dp[0] = ${NUMS[0]}`, "base case");
  dp[1] = Math.max(NUMS[0], NUMS[1]);
  snap(t.base2(NUMS[0], NUMS[1], dp[1]), 1, "base", `dp[1] = max(${NUMS[0]}, ${NUMS[1]}) = ${dp[1]}`, "base case");

  for (let i = 2; i < NUMS.length; i++) {
    const skip = dp[i - 1] as number;
    const take = (dp[i - 2] as number) + NUMS[i];
    snap(
      t.look(i, NUMS[i], skip, dp[i - 2] as number, take),
      i, "look", `dp[${i}] = max(dp[${i - 1}], dp[${i - 2}] + ${NUMS[i]}) = max(${skip}, ${take})`, t.labelLook(i),
    );
    dp[i] = Math.max(skip, take);
    snap(
      t.fill(i, dp[i] as number, take > skip ? "take" : take < skip ? "skip" : "tie"),
      i, "fill", `dp[${i}] = ${dp[i]}`, t.labelFill(i),
    );
  }

  // 回溯：從最後一格往前看每一格是「搶」還是「不搶」
  const chosen: number[] = [];
  let i: number = NUMS.length - 1;
  while (i >= 0) {
    if (i === 0 || (dp[i] as number) !== (dp[i - 1] as number)) { chosen.push(i); i -= 2; }
    else i -= 1;
  }
  chosen.reverse();
  snap(
    t.end(NUMS.length - 1, dp[NUMS.length - 1] as number, chosen.join(t.sep), chosen.map((c) => NUMS[c]).join(" + ")),
    NUMS.length, "none", t.answerFormula(dp[NUMS.length - 1] as number), t.backtrackLabel, chosen,
  );
  return steps;
}

export function Dp1dDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const looking = s.phase === "look";
  const cur = s.phase === "look" || s.phase === "fill" || s.phase === "base" ? s.i : -1;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.label}</span>} right={`nums = [${NUMS.join(", ")}] · ${t.rightNote}`} />

      <div className="grid grid-cols-1 gap-3.5 p-3.5">
        <div>
          <div className="eyebrow mb-2">{t.rowsTitle}</div>
          <div className="overflow-x-auto">
            <div className="grid w-max grid-cols-[auto_auto] items-center gap-x-2.5 gap-y-1">
              <span className="text-right font-mono text-[10.5px] text-ink-3">i</span>
              <div className="flex gap-1">
                {NUMS.map((_, i) => (
                  <span key={i} className="w-9 text-center font-mono text-[10.5px] text-ink-3">{i}</span>
                ))}
              </div>
              <span className="text-right font-mono text-[10.5px] text-ink-3">nums[i]</span>
              <Cells
                items={NUMS}
                tone={(i) => (s.chosen.includes(i) ? CELL.green : i === cur ? CELL.accent : "")}
              />
              <span className="text-right font-mono text-[10.5px] text-ink-3">dp[i]</span>
              <Cells
                items={s.dp.map((v) => (v === null ? "·" : v))}
                tone={(i) => {
                  if (looking && i === s.i - 1) return CELL.amber;
                  if (looking && i === s.i - 2) return CELL.green;
                  if (i === cur) return CELL.accent;
                  return s.dp[i] === null ? CELL.dim : "";
                }}
              />
            </div>
          </div>
          {looking && (
            <div className="mt-1.5 flex flex-wrap gap-3 text-[12px] text-ink-3">
              <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-amber bg-amber-soft align-middle" />{t.legendSkip}</span>
              <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-green bg-green-soft align-middle" />{t.legendTake}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[13px] tabular-nums">{s.formula}</div>
          <div className="flex items-center gap-2 text-[12px] text-ink-3">
            <span>{t.rolling}</span>
            <span className="grid h-8 min-w-14 place-items-center rounded-md border border-line-strong bg-surface px-2 font-mono text-[12.5px] tabular-nums">
              prev2 = {cur >= 2 ? s.dp[cur - 2] : cur >= 0 ? 0 : "·"}
            </span>
            <span className="grid h-8 min-w-14 place-items-center rounded-md border border-line-strong bg-surface px-2 font-mono text-[12.5px] tabular-nums">
              prev1 = {cur >= 1 ? s.dp[cur - 1] : cur === 0 ? 0 : "·"}
            </span>
          </div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
