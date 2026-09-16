"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const MID_VALS = [2, 4, 6, 8, 10, 12, 14];
const CYC_VALS = [1, 2, 3, 4, 5, 6];
const CYC_BACK = 2; // 最後一個節點的 next 指回索引 2

const TEXT = demoText(
  {
    tabMiddle: "找中點",
    tabCycle: "偵測環",
    midInit: "slow 和 fast 都從 head 出發。每回合 slow 走 1 步、fast 走 2 步。",
    midAdvance: (slow: number, fast: string) => `slow 到 ${slow}，fast 到 ${fast}。fast 走的路永遠是 slow 的兩倍。`,
    midDone: (v: number) => `fast 到底了（fast 或 fast.next 是 None），slow 剛好在中點 ${v}。只掃一遍、不用先數長度。`,
    cycInit: (last: number, back: number) => `節點 ${last} 的 next 指回 ${back}，所以有環。slow 和 fast 都從 head 出發。`,
    cycMeet: (v: number) => `slow 和 fast 在 ${v} 相遇。有環的話一定會相遇：fast 每回合追近 1 步，在環裡繞一圈內必追上。`,
    cycAdvance: (slow: number, fast: number) => `slow 到 ${slow}，fast 到 ${fast}。fast 已經在環裡繞，等 slow 進來被追上。`,
    phase2: "第二階段：找環的起點。把 slow 放回 head，fast 留在相遇點，兩個都改成每回合走 1 步。",
    entry: (v: number) => `兩個指標在 ${v} 相遇，這就是環的起點。數學上「head 到起點」和「相遇點到起點」的距離相等（Floyd）。`,
    advance: (slow: number, fast: number) => `slow 到 ${slow}，fast 到 ${fast}。`,
    loopNote: (last: number, back: number) => `↩ 表示節點 ${last} 的 next 指回節點 ${back}。`,
    phase2Note: "現在是第二階段：兩個指標都一次走一步。",
  },
  {
    en: {
      tabMiddle: "Find the middle",
      tabCycle: "Detect a cycle",
      midInit: "slow and fast both start at head. Each round slow takes one step and fast takes two.",
      midAdvance: (slow: number, fast: string) => `slow moves to ${slow} and fast moves to ${fast}. fast always covers twice the distance slow does.`,
      midDone: (v: number) => `fast has run off the end (fast or fast.next is None), and slow has landed exactly on the middle node ${v}. One pass, with no need to count the length first.`,
      cycInit: (last: number, back: number) => `The next pointer of node ${last} points back to ${back}, so the list has a cycle. slow and fast both start at head.`,
      cycMeet: (v: number) => `slow and fast meet at ${v}. When there is a cycle they always meet: fast closes the gap by one node each round, so it catches up within a single lap of the cycle.`,
      cycAdvance: (slow: number, fast: number) => `slow moves to ${slow} and fast moves to ${fast}. fast is already going round the cycle, waiting for slow to enter it and be caught.`,
      phase2: "Phase two: find where the cycle begins. Move slow back to head, leave fast at the meeting point, and advance both one step per round.",
      entry: (v: number) => `The two pointers meet at ${v}, and that node is the start of the cycle. The distance from head to the start equals the distance from the meeting point to the start (Floyd's argument).`,
      advance: (slow: number, fast: number) => `slow moves to ${slow} and fast moves to ${fast}.`,
      loopNote: (last: number, back: number) => `↩ means the next pointer of node ${last} points back to node ${back}.`,
      phase2Note: " Phase two is running: both pointers now move one step at a time.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; slow: number | null; fast: number | null; meet?: number; entry?: number; phase?: 1 | 2 }

function buildMiddle(t: T): Step[] {
  const n = MID_VALS.length;
  const steps: Step[] = [{ desc: t.midInit, slow: 0, fast: 0 }];
  let slow = 0;
  let fast: number | null = 0;
  // while fast and fast.next: slow = slow.next; fast = fast.next.next
  while (fast !== null && fast + 1 < n) {
    slow += 1;
    fast = fast + 2 < n ? fast + 2 : null;
    steps.push({ desc: t.midAdvance(MID_VALS[slow], fast === null ? "None" : String(MID_VALS[fast])), slow, fast });
  }
  steps.push({ desc: t.midDone(MID_VALS[slow]), slow, fast, meet: slow });
  return steps;
}

function buildCycle(t: T): Step[] {
  const n = CYC_VALS.length;
  const next = (i: number) => (i + 1 < n ? i + 1 : CYC_BACK);
  const steps: Step[] = [{ desc: t.cycInit(CYC_VALS[n - 1], CYC_VALS[CYC_BACK]), slow: 0, fast: 0, phase: 1 }];
  let slow = 0, fast = 0;
  while (true) {
    slow = next(slow);
    fast = next(next(fast));
    if (slow === fast) {
      steps.push({ desc: t.cycMeet(CYC_VALS[slow]), slow, fast, meet: slow, phase: 1 });
      break;
    }
    steps.push({ desc: t.cycAdvance(CYC_VALS[slow], CYC_VALS[fast]), slow, fast, phase: 1 });
  }
  steps.push({ desc: t.phase2, slow: 0, fast, phase: 2 });
  slow = 0;
  while (slow !== fast) {
    slow = next(slow);
    fast = next(fast);
    steps.push({ desc: slow === fast ? t.entry(CYC_VALS[slow]) : t.advance(CYC_VALS[slow], CYC_VALS[fast]), slow, fast, phase: 2, entry: slow === fast ? slow : undefined });
  }
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";
type Mode = "middle" | "cycle";

export function FastSlowDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const middle = useMemo(() => buildMiddle(TEXT[locale]), [locale]);
  const cycle = useMemo(() => buildCycle(TEXT[locale]), [locale]);
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
              {m === "middle" ? t.tabMiddle : t.tabCycle}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>{ui.demo.prev}</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(last, x + 1))} disabled={k === last}>{ui.demo.next}</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>{ui.demo.reset}</button>
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
        {mode === "cycle" && <p className="mt-1 mb-0 text-[12px] text-ink-3">{t.loopNote(CYC_VALS[CYC_VALS.length - 1], CYC_VALS[CYC_BACK])}{s.phase === 2 ? t.phase2Note : ""}</p>}
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">{ui.demo.step} {k}/{last}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}
