"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const TEXT = demoText(
  {
    arrReach: "能到終點",
    arrStuck: "卡在 0",
    problem: "題目",
    modeReach: "Jump Game：能不能到",
    modeMin: "Jump Game II：最少幾跳",
    arrayLabel: "陣列",
    hint: "每格的數字是從這格最多能往前跳幾步",
    resultJumps: (j: number) => `→ ${j} 跳`,
    resultNo: "→ 到不了",
    legend: "綠色是目前確定踩得到的格子（綠條是 far 的範圍），虛線是還不確定的。",
    legendMin: "黃色是每次起跳的格子，黃條是這一層的右邊界 cur_end。",

    reachIntro: "far = 0 表示「目前確定能踩到的最遠格子」。從 i = 0 往右掃，每格只問一件事：站在這裡最遠能跳到哪。",
    reachBlocked: (i: number, far: number) => `i = ${i} 已經超過 far = ${far}，這格踩不到，後面的更不可能。回傳 false。`,
    reachHit: (i: number, v: number, reach: number, far: number, last: number) =>
      `站在 i = ${i}，nums[${i}] = ${v}，能跳到 ${reach}。far = ${far} 已經蓋到最後一格 ${last}，回傳 true，不用再掃。`,
    reachScan: (i: number, v: number, reach: number, grew: boolean, far: number) =>
      `站在 i = ${i}，nums[${i}] = ${v}，能跳到 ${reach}。${grew ? `far 更新為 ${far}。` : `沒有超過 far = ${far}，far 不變。`}`,
    reachDone: (far: number, last: number) => `掃完，far = ${far} ≥ ${last}，回傳 true。`,

    minIntro: "最少跳幾次。把「這一跳能踩到的範圍」當成 BFS 的一層：cur_end 是這層的右邊界，far 是下一層能到的最遠處。",
    minBlocked: (i: number, far: number) => `i = ${i} 超過 far = ${far}，踩不到，無法到達終點。`,
    minStuck: (i: number, far: number, last: number) =>
      `i = ${i} 是這一層的右邊界，但這一層最遠只能到 far = ${far}，再跳也不會前進，終點 ${last} 到不了。`,
    minFinal: (i: number, jumps: number, from: number, to: number) =>
      `i = ${i} 是這一層的右邊界，必須跳了：jumps = ${jumps}，下一層是 ${from}～${to}，已經包含終點。答案 ${jumps} 跳。`,
    minJump: (i: number, jumps: number, curEnd: number) =>
      `i = ${i} 是這一層的右邊界，這層看完了，跳一次：jumps = ${jumps}，下一層的右邊界 cur_end = far = ${curEnd}。`,
    minWiden: (i: number, v: number, reach: number, far: number, curEnd: number) =>
      `i = ${i}，nums[${i}] = ${v}，far = max(far, ${reach}) = ${far}。還沒到這層的右邊界 ${curEnd}，繼續。`,
    minOk: (jumps: number) => `到達終點，共 ${jumps} 跳。`,
    minFail: (curEnd: number, last: number) => `掃完了，這一層的右邊界只到 ${curEnd}，終點 ${last} 到不了。`,
  },
  {
    en: {
      arrReach: "Reaches the end",
      arrStuck: "Stuck on a 0",
      problem: "Problem",
      modeReach: "Jump Game: can you get there?",
      modeMin: "Jump Game II: fewest jumps",
      arrayLabel: "Array",
      hint: "Each number is the furthest you may jump forward from that cell",
      resultJumps: (j: number) => `→ ${j} jump${j === 1 ? "" : "s"}`,
      resultNo: "→ unreachable",
      legend: "Green cells are the ones we already know we can land on — the green bar is the span of far — and dashed cells are the ones we cannot be sure about yet.",
      legendMin: " Amber marks the cell each jump is taken from, and the amber bar is cur_end, the right edge of the current layer.",

      reachIntro: "far = 0 is the furthest cell we currently know we can land on. Scan right from i = 0 and ask one question at every cell: from here, how far can I jump?",
      reachBlocked: (i: number, far: number) => `i = ${i} is already past far = ${far}, so this cell cannot be reached — and nothing beyond it can be either. Return false.`,
      reachHit: (i: number, v: number, reach: number, far: number, last: number) =>
        `Standing at i = ${i} with nums[${i}] = ${v}, we can jump as far as ${reach}. far = ${far} already covers the last cell ${last}, so return true without scanning any further.`,
      reachScan: (i: number, v: number, reach: number, grew: boolean, far: number) =>
        `Standing at i = ${i} with nums[${i}] = ${v}, we can jump as far as ${reach}. ${grew ? `far becomes ${far}.` : `That does not beat far = ${far}, so far stays where it is.`}`,
      reachDone: (far: number, last: number) => `The scan is over with far = ${far} ≥ ${last}, so return true.`,

      minIntro: "Now for the fewest jumps. Treat the range one jump can cover as a BFS layer: cur_end is the right edge of the current layer, and far is the furthest the next layer will reach.",
      minBlocked: (i: number, far: number) => `i = ${i} is past far = ${far}, so this cell cannot be reached and neither can the end.`,
      minStuck: (i: number, far: number, last: number) =>
        `i = ${i} is the right edge of this layer, but the whole layer only reaches far = ${far}. Another jump would make no progress, so the end at ${last} is unreachable.`,
      minFinal: (i: number, jumps: number, from: number, to: number) =>
        `i = ${i} is the right edge of this layer, so we have to jump: jumps = ${jumps}. The next layer spans ${from}–${to}, which already contains the end, so the answer is ${jumps} jump${jumps === 1 ? "" : "s"}.`,
      minJump: (i: number, jumps: number, curEnd: number) =>
        `i = ${i} is the right edge of this layer and we have seen all of it, so take a jump: jumps = ${jumps}, and the next layer's right edge is cur_end = far = ${curEnd}.`,
      minWiden: (i: number, v: number, reach: number, far: number, curEnd: number) =>
        `i = ${i}, nums[${i}] = ${v}, so far = max(far, ${reach}) = ${far}. We have not hit this layer's right edge ${curEnd} yet, so keep going.`,
      minOk: (jumps: number) => `Reached the end in ${jumps} jump${jumps === 1 ? "" : "s"}.`,
      minFail: (curEnd: number, last: number) => `The scan is over and this layer's right edge only reaches ${curEnd}, so the end at ${last} is unreachable.`,
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

const arrays = (t: T) => [
  { label: t.arrReach, nums: [2, 3, 1, 1, 4, 1, 0, 2, 1] },
  { label: t.arrStuck, nums: [3, 2, 1, 0, 4] },
];
type Mode = "reach" | "min";

interface Step { desc: string; i: number; far: number; curEnd: number; jumps: number; jumpFrom: number[]; done: boolean; ok?: boolean }

function buildSteps(t: T, nums: number[], mode: Mode): Step[] {
  const n = nums.length;
  const steps: Step[] = [];
  let far = 0;
  if (mode === "reach") {
    steps.push({ desc: t.reachIntro, i: -1, far, curEnd: 0, jumps: 0, jumpFrom: [], done: false });
    for (let i = 0; i < n; i++) {
      if (i > far) {
        steps.push({ desc: t.reachBlocked(i, far), i, far, curEnd: 0, jumps: 0, jumpFrom: [], done: true, ok: false });
        return steps;
      }
      const reach = i + nums[i];
      const nf = Math.max(far, reach);
      const grew = nf > far;
      far = nf;
      if (far >= n - 1) {
        steps.push({ desc: t.reachHit(i, nums[i], reach, far, n - 1), i, far, curEnd: 0, jumps: 0, jumpFrom: [], done: true, ok: true });
        return steps;
      }
      steps.push({ desc: t.reachScan(i, nums[i], reach, grew, far), i, far, curEnd: 0, jumps: 0, jumpFrom: [], done: false });
    }
    steps.push({ desc: t.reachDone(far, n - 1), i: n - 1, far, curEnd: 0, jumps: 0, jumpFrom: [], done: true, ok: true });
    return steps;
  }
  let curEnd = 0;
  let jumps = 0;
  const jumpFrom: number[] = [];
  steps.push({ desc: t.minIntro, i: -1, far, curEnd, jumps, jumpFrom: [], done: false });
  for (let i = 0; i < n - 1; i++) {
    if (i > far) {
      steps.push({ desc: t.minBlocked(i, far), i, far, curEnd, jumps, jumpFrom: [...jumpFrom], done: true, ok: false });
      return steps;
    }
    far = Math.max(far, i + nums[i]);
    if (i === curEnd) {
      if (far <= i) {
        // 走到這層的右邊界，但整層沒有任何一格能跳得比這裡更遠：卡住了
        steps.push({ desc: t.minStuck(i, far, n - 1), i, far, curEnd, jumps, jumpFrom: [...jumpFrom], done: true, ok: false });
        return steps;
      }
      jumps++;
      jumpFrom.push(i);
      const prev = curEnd;
      curEnd = far;
      if (curEnd >= n - 1) {
        steps.push({ desc: t.minFinal(i, jumps, prev + 1, Math.min(curEnd, n - 1)), i, far, curEnd, jumps, jumpFrom: [...jumpFrom], done: true, ok: true });
        return steps;
      }
      steps.push({ desc: t.minJump(i, jumps, curEnd), i, far, curEnd, jumps, jumpFrom: [...jumpFrom], done: false });
    } else {
      steps.push({ desc: t.minWiden(i, nums[i], i + nums[i], far, curEnd), i, far, curEnd, jumps, jumpFrom: [...jumpFrom], done: false });
    }
  }
  const ok = curEnd >= n - 1;
  steps.push({ desc: ok ? t.minOk(jumps) : t.minFail(curEnd, n - 1), i: n - 1, far, curEnd, jumps, jumpFrom: [...jumpFrom], done: true, ok });
  return steps;
}

export function JumpGameDemo() {
  const t = TEXT[useLocale()];
  const ARRAYS = useMemo(() => arrays(t), [t]);
  const [ai, setAi] = useState(0);
  const [mode, setMode] = useState<Mode>("reach");
  const [k, setK] = useState(0);
  const nums = ARRAYS[ai].nums;
  const steps = useMemo(() => buildSteps(t, nums, mode), [t, nums, mode]);
  const s = steps[k];
  const n = nums.length;
  const chip = (on: boolean) => `h-[28px] cursor-pointer rounded-md border px-2.5 text-[12.5px] ${on ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`;

  const tone = (i: number) => {
    if (i === s.i) return CELL.accent;
    if (s.done && s.ok && i === n - 1) return CELL.green;
    if (mode === "min" && s.jumpFrom.includes(i)) return CELL.amber;
    if (i <= s.far && i > s.i) return CELL.green;
    if (i < s.i) return CELL.dim;
    if (i > s.far && s.i >= 0) return "border-dashed border-line-strong bg-surface text-ink-3";
    return "";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span>{t.problem}</span>
        <div className="flex gap-1.5">
          <button type="button" className={chip(mode === "reach")} onClick={() => { setMode("reach"); setK(0); }}>{t.modeReach}</button>
          <button type="button" className={chip(mode === "min")} onClick={() => { setMode("min"); setK(0); }}>{t.modeMin}</button>
        </div>
        <span className="ml-1">{t.arrayLabel}</span>
        <div className="flex gap-1.5">
          {ARRAYS.map((a, i) => (
            <button key={a.label} type="button" className={chip(ai === i)} onClick={() => { setAi(i); setK(0); }}>{a.label}</button>
          ))}
        </div>
      </div>
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{mode === "reach" ? "can_jump" : "min_jumps"}</span>} right={t.hint} />

      <div className="p-3.5">
        <div className="mb-1 flex gap-1 font-mono text-[10.5px] text-ink-3">
          {nums.map((_, i) => <span key={i} className="w-9 text-center">{i}</span>)}
        </div>
        <Cells items={nums} tone={tone} />
        <div className="mt-1 flex gap-1">
          {nums.map((_, i) => (
            <span key={i} className={`h-1.5 w-9 rounded-sm ${i <= s.far && s.i >= 0 ? "bg-green" : "bg-surface-2"}`} />
          ))}
        </div>
        {mode === "min" && s.i >= 0 && (
          <div className="mt-1 flex gap-1">
            {nums.map((_, i) => (
              <span key={i} className={`h-1.5 w-9 rounded-sm ${i <= s.curEnd ? "bg-amber" : "bg-surface-2"}`} />
            ))}
          </div>
        )}
        <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[12.5px] tabular-nums text-ink-2">
          <span>i = {s.i < 0 ? "—" : s.i}</span>
          <span>far = <span className="font-semibold text-green">{s.far}</span></span>
          {mode === "min" && <span>cur_end = <span className="font-semibold text-amber">{s.curEnd}</span></span>}
          {mode === "min" && <span>jumps = <span className="font-semibold">{s.jumps}</span></span>}
          {s.done && (
            <span className={`font-semibold ${s.ok ? "text-green" : "text-amber"}`}>
              {mode === "reach" ? (s.ok ? "→ true" : "→ false") : s.ok ? t.resultJumps(s.jumps) : t.resultNo}
            </span>
          )}
        </div>
        <div className="mt-1.5 text-[12px] text-ink-3">
          {t.legend}{mode === "min" && t.legendMin}
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
