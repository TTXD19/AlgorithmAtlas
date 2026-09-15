"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const ARRAYS = [
  { label: "能到終點", nums: [2, 3, 1, 1, 4, 1, 0, 2, 1] },
  { label: "卡在 0", nums: [3, 2, 1, 0, 4] },
];
type Mode = "reach" | "min";

interface Step { desc: string; i: number; far: number; curEnd: number; jumps: number; jumpFrom: number[]; done: boolean; ok?: boolean }

function buildSteps(nums: number[], mode: Mode): Step[] {
  const n = nums.length;
  const steps: Step[] = [];
  let far = 0;
  if (mode === "reach") {
    steps.push({ desc: `far = 0 表示「目前確定能踩到的最遠格子」。從 i = 0 往右掃，每格只問一件事：站在這裡最遠能跳到哪。`, i: -1, far, curEnd: 0, jumps: 0, jumpFrom: [], done: false });
    for (let i = 0; i < n; i++) {
      if (i > far) {
        steps.push({ desc: `i = ${i} 已經超過 far = ${far}，這格踩不到，後面的更不可能。回傳 false。`, i, far, curEnd: 0, jumps: 0, jumpFrom: [], done: true, ok: false });
        return steps;
      }
      const reach = i + nums[i];
      const nf = Math.max(far, reach);
      const grew = nf > far;
      far = nf;
      if (far >= n - 1) {
        steps.push({ desc: `站在 i = ${i}，nums[${i}] = ${nums[i]}，能跳到 ${reach}。far = ${far} 已經蓋到最後一格 ${n - 1}，回傳 true，不用再掃。`, i, far, curEnd: 0, jumps: 0, jumpFrom: [], done: true, ok: true });
        return steps;
      }
      steps.push({ desc: `站在 i = ${i}，nums[${i}] = ${nums[i]}，能跳到 ${reach}。${grew ? `far 更新為 ${far}。` : `沒有超過 far = ${far}，far 不變。`}`, i, far, curEnd: 0, jumps: 0, jumpFrom: [], done: false });
    }
    steps.push({ desc: `掃完，far = ${far} ≥ ${n - 1}，回傳 true。`, i: n - 1, far, curEnd: 0, jumps: 0, jumpFrom: [], done: true, ok: true });
    return steps;
  }
  let curEnd = 0;
  let jumps = 0;
  const jumpFrom: number[] = [];
  steps.push({ desc: `最少跳幾次。把「這一跳能踩到的範圍」當成 BFS 的一層：cur_end 是這層的右邊界，far 是下一層能到的最遠處。`, i: -1, far, curEnd, jumps, jumpFrom: [], done: false });
  for (let i = 0; i < n - 1; i++) {
    if (i > far) {
      steps.push({ desc: `i = ${i} 超過 far = ${far}，踩不到，無法到達終點。`, i, far, curEnd, jumps, jumpFrom: [...jumpFrom], done: true, ok: false });
      return steps;
    }
    far = Math.max(far, i + nums[i]);
    if (i === curEnd) {
      if (far <= i) {
        // 走到這層的右邊界，但整層沒有任何一格能跳得比這裡更遠：卡住了
        steps.push({ desc: `i = ${i} 是這一層的右邊界，但這一層最遠只能到 far = ${far}，再跳也不會前進，終點 ${n - 1} 到不了。`, i, far, curEnd, jumps, jumpFrom: [...jumpFrom], done: true, ok: false });
        return steps;
      }
      jumps++;
      jumpFrom.push(i);
      const prev = curEnd;
      curEnd = far;
      if (curEnd >= n - 1) {
        steps.push({ desc: `i = ${i} 是這一層的右邊界，必須跳了：jumps = ${jumps}，下一層是 ${prev + 1}～${Math.min(curEnd, n - 1)}，已經包含終點。答案 ${jumps} 跳。`, i, far, curEnd, jumps, jumpFrom: [...jumpFrom], done: true, ok: true });
        return steps;
      }
      steps.push({ desc: `i = ${i} 是這一層的右邊界，這層看完了，跳一次：jumps = ${jumps}，下一層的右邊界 cur_end = far = ${curEnd}。`, i, far, curEnd, jumps, jumpFrom: [...jumpFrom], done: false });
    } else {
      steps.push({ desc: `i = ${i}，nums[${i}] = ${nums[i]}，far = max(far, ${i + nums[i]}) = ${far}。還沒到這層的右邊界 ${curEnd}，繼續。`, i, far, curEnd, jumps, jumpFrom: [...jumpFrom], done: false });
    }
  }
  const ok = curEnd >= n - 1;
  steps.push({ desc: ok ? `到達終點，共 ${jumps} 跳。` : `掃完了，這一層的右邊界只到 ${curEnd}，終點 ${n - 1} 到不了。`, i: n - 1, far, curEnd, jumps, jumpFrom: [...jumpFrom], done: true, ok });
  return steps;
}

export function JumpGameDemo() {
  const [ai, setAi] = useState(0);
  const [mode, setMode] = useState<Mode>("reach");
  const [k, setK] = useState(0);
  const nums = ARRAYS[ai].nums;
  const steps = useMemo(() => buildSteps(nums, mode), [nums, mode]);
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
        <span>題目</span>
        <div className="flex gap-1.5">
          <button type="button" className={chip(mode === "reach")} onClick={() => { setMode("reach"); setK(0); }}>Jump Game：能不能到</button>
          <button type="button" className={chip(mode === "min")} onClick={() => { setMode("min"); setK(0); }}>Jump Game II：最少幾跳</button>
        </div>
        <span className="ml-1">陣列</span>
        <div className="flex gap-1.5">
          {ARRAYS.map((a, i) => (
            <button key={a.label} type="button" className={chip(ai === i)} onClick={() => { setAi(i); setK(0); }}>{a.label}</button>
          ))}
        </div>
      </div>
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{mode === "reach" ? "can_jump" : "min_jumps"}</span>} right="每格的數字是從這格最多能往前跳幾步" />

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
              {mode === "reach" ? (s.ok ? "→ true" : "→ false") : s.ok ? `→ ${s.jumps} 跳` : "→ 到不了"}
            </span>
          )}
        </div>
        <div className="mt-1.5 text-[12px] text-ink-3">
          綠色是目前確定踩得到的格子（綠條是 far 的範圍），虛線是還不確定的。{mode === "min" && "黃色是每次起跳的格子，黃條是這一層的右邊界 cur_end。"}
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
