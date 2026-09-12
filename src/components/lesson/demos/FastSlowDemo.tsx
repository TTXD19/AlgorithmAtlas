"use client";

import { useMemo, useState } from "react";

const MID_VALS = [2, 4, 6, 8, 10, 12, 14];
const CYC_VALS = [1, 2, 3, 4, 5, 6];
const CYC_BACK = 2; // 最後一個節點的 next 指回索引 2

interface Step { desc: string; slow: number | null; fast: number | null; meet?: number; entry?: number; phase?: 1 | 2 }

function buildMiddle(): Step[] {
  const n = MID_VALS.length;
  const steps: Step[] = [{ desc: "slow 和 fast 都從 head 出發。每回合 slow 走 1 步、fast 走 2 步。", slow: 0, fast: 0 }];
  let slow = 0;
  let fast: number | null = 0;
  // while fast and fast.next: slow = slow.next; fast = fast.next.next
  while (fast !== null && fast + 1 < n) {
    slow += 1;
    fast = fast + 2 < n ? fast + 2 : null;
    steps.push({ desc: `slow 到 ${MID_VALS[slow]}，fast 到 ${fast === null ? "None" : MID_VALS[fast]}。fast 走的路永遠是 slow 的兩倍。`, slow, fast });
  }
  steps.push({ desc: `fast 到底了（fast 或 fast.next 是 None），slow 剛好在中點 ${MID_VALS[slow]}。只掃一遍、不用先數長度。`, slow, fast, meet: slow });
  return steps;
}

function buildCycle(): Step[] {
  const n = CYC_VALS.length;
  const next = (i: number) => (i + 1 < n ? i + 1 : CYC_BACK);
  const steps: Step[] = [{ desc: `節點 ${CYC_VALS[n - 1]} 的 next 指回 ${CYC_VALS[CYC_BACK]}，所以有環。slow 和 fast 都從 head 出發。`, slow: 0, fast: 0, phase: 1 }];
  let slow = 0, fast = 0;
  while (true) {
    slow = next(slow);
    fast = next(next(fast));
    if (slow === fast) {
      steps.push({ desc: `slow 和 fast 在 ${CYC_VALS[slow]} 相遇。有環的話一定會相遇：fast 每回合追近 1 步，在環裡繞一圈內必追上。`, slow, fast, meet: slow, phase: 1 });
      break;
    }
    steps.push({ desc: `slow 到 ${CYC_VALS[slow]}，fast 到 ${CYC_VALS[fast]}。fast 已經在環裡繞，等 slow 進來被追上。`, slow, fast, phase: 1 });
  }
  steps.push({ desc: "第二階段：找環的起點。把 slow 放回 head，fast 留在相遇點，兩個都改成每回合走 1 步。", slow: 0, fast, phase: 2 });
  slow = 0;
  while (slow !== fast) {
    slow = next(slow);
    fast = next(fast);
    steps.push({ desc: slow === fast ? `兩個指標在 ${CYC_VALS[slow]} 相遇，這就是環的起點。數學上「head 到起點」和「相遇點到起點」的距離相等（Floyd）。` : `slow 到 ${CYC_VALS[slow]}，fast 到 ${CYC_VALS[fast]}。`, slow, fast, phase: 2, entry: slow === fast ? slow : undefined });
  }
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";
type Mode = "middle" | "cycle";

export function FastSlowDemo() {
  const middle = useMemo(() => buildMiddle(), []);
  const cycle = useMemo(() => buildCycle(), []);
  const [mode, setMode] = useState<Mode>("middle");
  const [k, setK] = useState(0);
  const steps = mode === "middle" ? middle : cycle;
  const vals = mode === "middle" ? MID_VALS : CYC_VALS;
  const s = steps[k];
  const last = steps.length - 1;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1">
          {(["middle", "cycle"] as Mode[]).map((m) => (
            <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => { setMode(m); setK(0); }}>
              {m === "middle" ? "找中點" : "偵測環"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>上一步</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(last, x + 1))} disabled={k === last}>下一步</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>重設</button>
        </div>
      </div>

      <div className="overflow-x-auto px-3.5 pt-4 pb-3">
        <div className="flex items-start">
          {vals.map((v, i) => {
            const isSlow = s.slow === i, isFast = s.fast === i;
            const tone = s.entry === i
              ? "border-green bg-green text-accent-ink"
              : s.meet === i
                ? "border-green bg-green-soft text-green"
                : isSlow && isFast
                  ? "border-accent bg-accent text-accent-ink"
                  : isSlow
                    ? "border-accent bg-accent-soft text-ink"
                    : isFast
                      ? "border-amber bg-amber-soft text-amber"
                      : "border-line-strong bg-surface";
            const isLast = i === vals.length - 1;
            return (
              <div key={i} className="flex w-[66px] flex-col items-center gap-1">
                <div className="flex items-center">
                  <span className={`grid h-9 w-10 place-items-center rounded-md border font-mono text-[14px] font-medium ${tone}`}>{v}</span>
                  <span className="w-6 text-center font-mono text-[14px] text-ink-3">{isLast ? (mode === "cycle" ? "↩" : "∅") : "→"}</span>
                </div>
                <div className="flex h-5 gap-1">
                  {isSlow && <span className="rounded bg-accent px-1.5 font-mono text-[10.5px] leading-5 text-accent-ink">slow</span>}
                  {isFast && <span className="rounded bg-amber-soft px-1.5 font-mono text-[10.5px] leading-5 text-amber">fast</span>}
                </div>
              </div>
            );
          })}
          {mode === "middle" && s.fast === null && (
            <div className="flex w-[66px] flex-col items-center gap-1">
              <span className="rounded-md border border-dashed border-line px-2 py-1 font-mono text-[11.5px] text-ink-3">None</span>
              <div className="flex h-5"><span className="rounded bg-amber-soft px-1.5 font-mono text-[10.5px] leading-5 text-amber">fast</span></div>
            </div>
          )}
        </div>
        {mode === "cycle" && <p className="mt-1 mb-0 text-[12px] text-ink-3">↩ 表示節點 {CYC_VALS[CYC_VALS.length - 1]} 的 next 指回節點 {CYC_VALS[CYC_BACK]}。{s.phase === 2 ? "現在是第二階段：兩個指標都一次走一步。" : ""}</p>}
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">步驟 {k}/{last}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}
