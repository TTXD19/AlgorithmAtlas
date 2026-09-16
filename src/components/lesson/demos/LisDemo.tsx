"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";

/** 八天的股價，找最長的一段「一路上漲」的子序列。 */
const NUMS = [3, 1, 4, 1, 5, 9, 2, 6];

type Mode = "dp" | "tails";
type Phase = "none" | "look" | "fill";

const TEXT = demoText(
  {
    sep: "、",
    defineState: "定義狀態：dp[i] = 以 nums[i] 結尾的最長遞增子序列長度。base case 每一格都是 1（自己一個）。",
    defineStateLabel: "定義狀態",
    first: (x: number) => `nums[0] = ${x}，前面沒有東西，dp[0] = 1。`,
    labelI: (i: number) => `i = ${i}`,
    labelFind: (i: number) => `i = ${i}：找 j`,
    labelFill: (i: number) => `i = ${i}：填入`,
    noCands: (i: number, x: number) => `nums[${i}] = ${x}：往前看所有 j < ${i}，沒有任何 nums[j] 比 ${x} 小，接不到任何人後面。`,
    alone: (i: number) => `dp[${i}] = 1，只能自己開一段。`,
    cands: (i: number, x: number, list: string, best: number, bestDp: number) =>
      `nums[${i}] = ${x}：往前看所有 j < ${i}，比它小的有 ${list}（綠），可以接在它們後面。其中 dp 最大的是 j = ${best}（黃，dp = ${bestDp}）。`,
    fill: (i: number, best: number, val: number) =>
      `dp[${i}] = dp[${best}] + 1 = ${val}。這一格要看前面所有 j，所以每格 O(n)，整體 O(n²)。`,
    backtrack: (max: number, seq: string) =>
      `答案是 dp 裡的最大值 ${max}，不一定在最後一格。沿著「接在誰後面」往回走，就能拿到一條 LIS：${seq}（綠）。`,
    backtrackLabel: "回溯",
    tailsIntro: "換一個狀態：tails[k] = 長度為 k+1 的遞增子序列中，結尾最小的那個值。tails 一定嚴格遞增，所以可以二分搜尋。",
    labelSearch: (i: number) => `i = ${i}：二分搜尋`,
    labelAppend: (i: number) => `i = ${i}：接在尾端`,
    labelReplace: (i: number) => `i = ${i}：取代`,
    searchEnd: (i: number, x: number, empty: boolean) =>
      `nums[${i}] = ${x}：二分搜尋 tails 裡第一個 ≥ ${x} 的位置。${empty ? "tails 是空的，" : `所有值都比 ${x} 小，`}位置在最尾端。`,
    appendFirst: (x: number) => `${x} 自己成為長度 1 的遞增子序列，tails 長度變成 1。`,
    appendMore: (x: number, len: number) => `${x} 比所有結尾都大，可以接在最長的後面，tails 長度變成 ${len}。`,
    searchFound: (i: number, x: number, pos: number, val: number) =>
      `nums[${i}] = ${x}：二分搜尋 tails 裡第一個 ≥ ${x} 的位置，找到 tails[${pos}] = ${val}（黃）。`,
    replaceSame: (pos: number, x: number) =>
      `tails[${pos}] 已經是 ${x}，換成自己等於沒換。長度 ${pos + 1} 的子序列結尾維持 ${x}。`,
    replaceWith: (pos: number, old: number, x: number, len: number) =>
      `tails[${pos}] 從 ${old} 換成 ${x}：長度 ${pos + 1} 的遞增子序列，結尾可以更小，以後更容易被接上。長度不變，仍是 ${len}。`,
    tailsEnd: (len: number, list: string, order: string, a: number, b: number) =>
      `結束，LIS 長度 = tails 長度 = ${len}。但 tails = [${list}] 不是 LIS 本身：它們來自 ${order}，索引不是遞增的（${a} 出現在 ${b} 之後）。tails 只保證長度正確，要拿到序列本身得另外記前驅。每個元素一次二分搜尋，O(n log n)。`,
    endLabel: "結束",
    dpMode: "O(n²) DP 表",
    tailsMode: "O(n log n) tails",
    numsTitle: "nums（股價）",
    dpTitle: "dp[i]（以 nums[i] 結尾的 LIS 長度）",
    dpFormula: "dp[i] = 1 + max(dp[j])，j < i 且 nums[j] < nums[i]",
    tailsTitle: "tails（長度 k+1 的遞增子序列，結尾最小值）",
    tailsFormula: "pos = lower_bound(tails, x)；pos == len ? append : tails[pos] = x",
    lowerBoundLine: (x: number, pos: number) => `x = ${x}，lower_bound → pos = ${pos}`,
    appendTag: "（append）",
    replaceTag: "（取代）",
    from: (i: number) => `來自 ${i}`,
    fromNote: "「來自」是那個值在 nums 裡的索引。索引不遞增，就代表 tails 不是一條真正的子序列。",
  },
  {
    en: {
      sep: ", ",
      defineState: "Define the state: dp[i] is the length of the longest increasing subsequence that ends at nums[i]. The base case is 1 in every cell — the element on its own.",
      defineStateLabel: "Define the state",
      first: (x: number) => `nums[0] = ${x}. There is nothing before it, so dp[0] = 1.`,
      labelI: (i: number) => `i = ${i}`,
      labelFind: (i: number) => `i = ${i}: find j`,
      labelFill: (i: number) => `i = ${i}: fill in`,
      noCands: (i: number, x: number) => `nums[${i}] = ${x}: look back at every j < ${i}. No nums[j] is smaller than ${x}, so this element cannot extend anything.`,
      alone: (i: number) => `dp[${i}] = 1 — it has to start a subsequence of its own.`,
      cands: (i: number, x: number, list: string, best: number, bestDp: number) =>
        `nums[${i}] = ${x}: look back at every j < ${i}. The smaller values are ${list} (green), so this element can extend any of them. The largest dp among those is at j = ${best} (amber, dp = ${bestDp}).`,
      fill: (i: number, best: number, val: number) =>
        `dp[${i}] = dp[${best}] + 1 = ${val}. Filling one cell scans every earlier j, so each cell costs O(n) and the whole table costs O(n²).`,
      backtrack: (max: number, seq: string) =>
        `The answer is the largest value in dp, ${max} — not necessarily the last cell. Walking back along "which element did this extend" recovers one LIS: ${seq} (green).`,
      backtrackLabel: "Trace back",
      tailsIntro: "A different state: tails[k] is the smallest value that can end an increasing subsequence of length k+1. tails is always strictly increasing, which is exactly what makes binary search possible.",
      labelSearch: (i: number) => `i = ${i}: binary search`,
      labelAppend: (i: number) => `i = ${i}: append`,
      labelReplace: (i: number) => `i = ${i}: replace`,
      searchEnd: (i: number, x: number, empty: boolean) =>
        `nums[${i}] = ${x}: binary search tails for the first position holding a value ≥ ${x}. ${empty ? "tails is empty" : `Every value there is smaller than ${x}`}, so that position is the very end.`,
      appendFirst: (x: number) => `${x} on its own is an increasing subsequence of length 1, so tails grows to length 1.`,
      appendMore: (x: number, len: number) => `${x} is larger than every tail, so it extends the longest subsequence and tails grows to length ${len}.`,
      searchFound: (i: number, x: number, pos: number, val: number) =>
        `nums[${i}] = ${x}: binary search tails for the first position holding a value ≥ ${x}, which lands on tails[${pos}] = ${val} (amber).`,
      replaceSame: (pos: number, x: number) =>
        `tails[${pos}] is already ${x}, so writing ${x} over it changes nothing. Subsequences of length ${pos + 1} still end at ${x}.`,
      replaceWith: (pos: number, old: number, x: number, len: number) =>
        `tails[${pos}] goes from ${old} to ${x}: an increasing subsequence of length ${pos + 1} can now end on a smaller value, which makes it easier to extend later. The length is unchanged, still ${len}.`,
      tailsEnd: (len: number, list: string, order: string, a: number, b: number) =>
        `Done. The LIS length equals the length of tails, ${len}. But tails = [${list}] is not the LIS itself: those values came from ${order}, and their indices do not increase (${a} appears after ${b}). tails only guarantees the right length; recovering the sequence needs a separate predecessor array. One binary search per element gives O(n log n).`,
      endLabel: "Done",
      dpMode: "O(n²) DP table",
      tailsMode: "O(n log n) tails",
      numsTitle: "nums (stock prices)",
      dpTitle: "dp[i] (LIS length ending at nums[i])",
      dpFormula: "dp[i] = 1 + max(dp[j]) over j < i with nums[j] < nums[i]",
      tailsTitle: "tails (smallest ending value for length k+1)",
      tailsFormula: "pos = lower_bound(tails, x); pos == len ? append : tails[pos] = x",
      lowerBoundLine: (x: number, pos: number) => `x = ${x}, lower_bound → pos = ${pos}`,
      appendTag: " (append)",
      replaceTag: " (replace)",
      from: (i: number) => `from ${i}`,
      fromNote: 'The "from" row is where each value sits in nums. Those indices do not increase, which is why tails is not itself a subsequence.',
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface DpStep { desc: string; label: string; i: number; phase: Phase; dp: (number | null)[]; cands: number[]; best: number | null; lis: number[] }
interface TailStep { desc: string; label: string; i: number; phase: Phase; tails: number[]; src: number[]; pos: number | null; kind: "replace" | "append" | null }

function buildDp(t: T): DpStep[] {
  const steps: DpStep[] = [];
  const dp: (number | null)[] = NUMS.map(() => null);
  const prev: number[] = NUMS.map(() => -1);
  const snap = (desc: string, label: string, i: number, phase: Phase, cands: number[] = [], best: number | null = null, lis: number[] = []) =>
    steps.push({ desc, label, i, phase, dp: [...dp], cands, best, lis });

  snap(t.defineState, t.defineStateLabel, -1, "none");
  for (let i = 0; i < NUMS.length; i++) {
    const cands: number[] = [];
    let best = -1;
    for (let j = 0; j < i; j++) {
      if (NUMS[j] < NUMS[i]) {
        cands.push(j);
        if (best === -1 || (dp[j] as number) > (dp[best] as number)) best = j;
      }
    }
    if (i === 0) {
      dp[0] = 1;
      snap(t.first(NUMS[0]), t.labelI(0), 0, "fill");
      continue;
    }
    if (cands.length === 0) {
      snap(t.noCands(i, NUMS[i]), t.labelFind(i), i, "look");
      dp[i] = 1;
      snap(t.alone(i), t.labelFill(i), i, "fill");
    } else {
      snap(
        t.cands(i, NUMS[i], cands.map((j) => `nums[${j}]=${NUMS[j]}`).join(t.sep), best, dp[best] as number),
        t.labelFind(i), i, "look", cands, best,
      );
      dp[i] = (dp[best] as number) + 1;
      prev[i] = best;
      snap(t.fill(i, best, dp[i] as number), t.labelFill(i), i, "fill", [], best);
    }
  }
  let bestEnd = 0;
  for (let i = 1; i < NUMS.length; i++) if ((dp[i] as number) > (dp[bestEnd] as number)) bestEnd = i;
  const lis: number[] = [];
  for (let i: number = bestEnd; i !== -1; i = prev[i]) lis.push(i);
  lis.reverse();
  snap(
    t.backtrack(dp[bestEnd] as number, lis.map((i) => NUMS[i]).join(" → ")),
    t.backtrackLabel, NUMS.length, "none", [], null, lis,
  );
  return steps;
}

function buildTails(t: T): TailStep[] {
  const steps: TailStep[] = [];
  const tails: number[] = [];
  const src: number[] = [];
  const snap = (desc: string, label: string, i: number, phase: Phase, pos: number | null = null, kind: "replace" | "append" | null = null) =>
    steps.push({ desc, label, i, phase, tails: [...tails], src: [...src], pos, kind });

  snap(t.tailsIntro, t.defineStateLabel, -1, "none");
  for (let i = 0; i < NUMS.length; i++) {
    const x = NUMS[i];
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1; else hi = mid;
    }
    if (lo === tails.length) {
      snap(t.searchEnd(i, x, tails.length === 0), t.labelSearch(i), i, "look", lo);
      const wasEmpty = tails.length === 0;
      tails.push(x);
      src.push(i);
      snap(
        wasEmpty ? t.appendFirst(x) : t.appendMore(x, tails.length),
        t.labelAppend(i), i, "fill", lo, "append",
      );
    } else {
      snap(t.searchFound(i, x, lo, tails[lo]), t.labelSearch(i), i, "look", lo);
      const old = tails[lo];
      tails[lo] = x;
      src[lo] = i;
      snap(
        old === x ? t.replaceSame(lo, x) : t.replaceWith(lo, old, x, tails.length),
        t.labelReplace(i), i, "fill", lo, "replace",
      );
    }
  }
  const order = src.map((s) => `nums[${s}]`).join(", ");
  snap(
    t.tailsEnd(tails.length, tails.join(", "), order, tails[1], tails[2]),
    t.endLabel, NUMS.length, "none",
  );
  return steps;
}

export function LisDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const dpSteps = useMemo(() => buildDp(TEXT[locale]), [locale]);
  const tailSteps = useMemo(() => buildTails(TEXT[locale]), [locale]);
  const [mode, setMode] = useState<Mode>("dp");
  const [k, setK] = useState(0);
  const total = mode === "dp" ? dpSteps.length : tailSteps.length;
  const switchMode = (m: Mode) => { setMode(m); setK(0); };
  const d = dpSteps[Math.min(k, dpSteps.length - 1)];
  const ts = tailSteps[Math.min(k, tailSteps.length - 1)];
  const cur = mode === "dp" ? d : ts;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={total}
        setK={setK}
        left={
          <div className="flex items-center gap-1.5">
            {(["dp", "tails"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "dp" ? t.dpMode : t.tailsMode}
              </button>
            ))}
            <span className="ml-1 font-mono text-[12.5px] text-ink">{cur.label}</span>
          </div>
        }
        right={`nums = [${NUMS.join(", ")}]`}
      />

      <div className="grid grid-cols-1 gap-3.5 p-3.5">
        <div>
          <div className="eyebrow mb-2">{t.numsTitle}</div>
          <div className="flex gap-3">
            <div>
              <div className="mb-1 font-mono text-[10.5px] text-ink-3">i</div>
              <Cells items={NUMS.map((_, i) => i)} tone={() => CELL.dim} />
            </div>
            <div>
              <div className="mb-1 font-mono text-[10.5px] text-ink-3">nums[i]</div>
              {mode === "dp" ? (
                <Cells
                  items={NUMS}
                  tone={(i) => {
                    if (d.lis.includes(i)) return CELL.green;
                    if (i === d.i) return CELL.accent;
                    if (d.phase === "look" && i === d.best) return CELL.amber;
                    if (d.phase === "look" && d.cands.includes(i)) return CELL.green;
                    return i < d.i ? "" : CELL.dim;
                  }}
                />
              ) : (
                <Cells items={NUMS} tone={(i) => (i === ts.i ? CELL.accent : i < ts.i ? "" : CELL.dim)} />
              )}
            </div>
          </div>
        </div>

        {mode === "dp" ? (
          <div>
            <div className="eyebrow mb-2">{t.dpTitle}</div>
            <div className="flex gap-3">
              <div>
                <div className="mb-1 font-mono text-[10.5px] text-ink-3">i</div>
                <Cells items={NUMS.map((_, i) => i)} tone={() => CELL.dim} />
              </div>
              <div>
                <div className="mb-1 font-mono text-[10.5px] text-ink-3">dp[i]</div>
                <Cells
                  items={d.dp.map((v) => (v === null ? "·" : v))}
                  tone={(i) => {
                    if (i === d.i && d.phase === "fill") return CELL.accent;
                    if (d.phase === "look" && i === d.best) return CELL.amber;
                    if (d.phase === "look" && d.cands.includes(i)) return CELL.green;
                    return d.dp[i] === null ? CELL.dim : "";
                  }}
                />
              </div>
            </div>
            <div className="mt-2 rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[13px] tabular-nums">
              {d.phase === "fill" && d.best !== null ? `dp[${d.i}] = dp[${d.best}] + 1 = ${d.dp[d.i]}` : t.dpFormula}
            </div>
          </div>
        ) : (
          <div>
            <div className="eyebrow mb-2">{t.tailsTitle}</div>
            <div className="flex gap-3">
              <div>
                <div className="mb-1 font-mono text-[10.5px] text-ink-3">k</div>
                <Cells items={ts.tails.map((_, i) => i)} tone={() => CELL.dim} empty="" />
              </div>
              <div>
                <div className="mb-1 font-mono text-[10.5px] text-ink-3">tails[k]</div>
                <Cells
                  items={ts.tails}
                  tone={(i) => (i === ts.pos ? (ts.phase === "look" ? CELL.amber : CELL.accent) : "")}
                  empty={ui.demo.empty}
                />
                {ts.tails.length > 0 && (
                  <div className="mt-1 flex gap-1">
                    {ts.src.map((s, i) => (
                      <span key={i} className="grid w-9 place-items-center font-mono text-[10px] text-ink-3">{t.from(s)}</span>
                    ))}
                  </div>
                )}
              </div>
              {ts.phase === "look" && ts.pos === ts.tails.length && (
                <div>
                  <div className="mb-1 font-mono text-[10.5px] text-ink-3">&nbsp;</div>
                  <span className="grid h-8 w-9 place-items-center rounded-md border border-dashed border-amber text-[12px] text-amber">+</span>
                </div>
              )}
            </div>
            <div className="mt-2 rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[13px] tabular-nums">
              {ts.phase === "none" ? t.tailsFormula : ts.pos !== null ? `${t.lowerBoundLine(NUMS[ts.i], ts.pos)}${ts.kind === "append" ? t.appendTag : ts.kind === "replace" ? t.replaceTag : ""}` : ""}
            </div>
            <div className="mt-1.5 text-[12px] text-ink-3">{t.fromNote}</div>
          </div>
        )}
      </div>

      <StepFooter k={k} total={total}>{cur.desc}</StepFooter>
    </div>
  );
}
