"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, BTN } from "./StepBar";

/** 有序、有重複的陣列。目標 8 出現在索引 2、3、4。 */
const DATA = [2, 5, 8, 8, 8, 13, 21, 34, 55, 89];
const TARGET = 8;
const N = DATA.length;

type Mode = "find" | "lower" | "upper";
const LABEL: Record<Mode, string> = { find: "找任一個", lower: "lower_bound", upper: "upper_bound" };

interface Step { desc: string; lo: number; hi: number; mid: number | null; ans: number | null; cond?: string }

/** 閉區間 [lo, hi]，找到就回傳，找到的是「任一個」8。 */
function buildFind(): Step[] {
  const steps: Step[] = [{ desc: `閉區間寫法：lo = 0、hi = n − 1 = ${N - 1}，答案可能在 [lo, hi] 的任何位置。條件 lo ≤ hi 時繼續。`, lo: 0, hi: N - 1, mid: null, ans: null }];
  let lo = 0, hi = N - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (DATA[mid] === TARGET) {
      steps.push({ desc: `mid = ⌊(${lo} + ${hi}) / 2⌋ = ${mid}，a[${mid}] = ${DATA[mid]} 等於 ${TARGET}，直接回傳 ${mid}。注意它是三個 8 裡的最後一個，不是第一個，「找任一個」不保證邊界。`, lo, hi, mid, ans: mid, cond: `a[${mid}] == ${TARGET}` });
      return steps;
    }
    if (DATA[mid] < TARGET) {
      steps.push({ desc: `mid = ${mid}，a[${mid}] = ${DATA[mid]} < ${TARGET}，答案在右半，lo = mid + 1 = ${mid + 1}。`, lo, hi, mid, ans: null, cond: `a[${mid}] < ${TARGET}` });
      lo = mid + 1;
    } else {
      steps.push({ desc: `mid = ${mid}，a[${mid}] = ${DATA[mid]} > ${TARGET}，答案在左半，hi = mid − 1 = ${mid - 1}。`, lo, hi, mid, ans: null, cond: `a[${mid}] > ${TARGET}` });
      hi = mid - 1;
    }
  }
  steps.push({ desc: `lo > hi，區間空了，${TARGET} 不存在，回傳 −1。`, lo, hi, mid: null, ans: null });
  return steps;
}

/** 半開區間 [lo, hi)，找「第一個滿足 a[i] >= x（lower）或 a[i] > x（upper）的位置」。 */
function buildBound(kind: "lower" | "upper"): Step[] {
  const ok = (v: number) => (kind === "lower" ? v >= TARGET : v > TARGET);
  const sym = kind === "lower" ? "≥" : ">";
  const steps: Step[] = [{ desc: `半開區間寫法：lo = 0、hi = n = ${N}。要找的是「第一個 a[i] ${sym} ${TARGET} 的 i」，答案範圍是 0 到 n，所以 hi 要能等於 n。條件 lo < hi 時繼續。`, lo: 0, hi: N, mid: null, ans: null }];
  let lo = 0, hi = N;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ok(DATA[mid])) {
      steps.push({ desc: `mid = ${mid}，a[${mid}] = ${DATA[mid]} ${sym} ${TARGET} 成立，mid 可能就是答案，但左邊可能還有，hi = mid = ${mid}（mid 留在區間裡）。`, lo, hi, mid, ans: null, cond: `a[${mid}] ${sym} ${TARGET}` });
      hi = mid;
    } else {
      steps.push({ desc: `mid = ${mid}，a[${mid}] = ${DATA[mid]} ${sym} ${TARGET} 不成立，mid 一定不是答案，lo = mid + 1 = ${mid + 1}。`, lo, hi, mid, ans: null, cond: `a[${mid}] ${sym} ${TARGET} ✗` });
      lo = mid + 1;
    }
  }
  const lowerAns = DATA.filter((v) => v < TARGET).length;
  const tail = kind === "lower"
    ? `lo = hi = ${lo}，這是第一個 ${TARGET} 的位置。${TARGET} 存在的判斷：lo < n 且 a[lo] == ${TARGET}。`
    : `lo = hi = ${lo}，這是最後一個 ${TARGET} 的下一格。upper − lower = ${lo} − ${lowerAns} = ${lo - lowerAns}，就是 ${TARGET} 出現的次數。`;
  steps.push({ desc: tail, lo, hi, mid: null, ans: lo });
  return steps;
}

export function BinarySearchDemo() {
  const find = useMemo(() => buildFind(), []);
  const lower = useMemo(() => buildBound("lower"), []);
  const upper = useMemo(() => buildBound("upper"), []);
  const [mode, setMode] = useState<Mode>("find");
  const [k, setK] = useState(0);
  const steps = mode === "find" ? find : mode === "lower" ? lower : upper;
  const s = steps[k];
  const halfOpen = mode !== "find";
  const inRange = (i: number) => (halfOpen ? i >= s.lo && i < s.hi : i >= s.lo && i <= s.hi);
  const cells = halfOpen ? [...DATA.map(String), "n"] : DATA.map(String);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["find", "lower", "upper"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} font-mono ${mode === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => { setMode(m); setK(0); }}>
                {LABEL[m]}
              </button>
            ))}
          </div>
        }
        right={`目標 ${TARGET} · ${halfOpen ? "半開區間 [lo, hi)" : "閉區間 [lo, hi]"}`}
      />

      <div className="overflow-x-auto p-3.5">
        <div className="eyebrow mb-2">有序陣列</div>
        <div className="flex gap-1">
          {cells.map((v, i) => {
            const isN = halfOpen && i === N;
            const tone = s.ans === i
              ? "border-green bg-green-soft text-green"
              : s.mid === i
                ? "border-accent bg-accent text-accent-ink"
                : isN
                  ? "border-dashed border-line-strong bg-surface text-ink-3"
                  : inRange(i)
                    ? "border-line-strong bg-surface"
                    : "border-line bg-surface-2 text-ink-3";
            return (
              <div key={i} className="flex w-10 flex-col items-center gap-1">
                <span className={`grid h-8 w-10 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${tone}`}>{v}</span>
                <span className="font-mono text-[10.5px] text-ink-3">{i}</span>
                <div className="flex h-4 justify-center gap-0.5">
                  {s.lo === i && <span className="rounded bg-accent-soft px-1 font-mono text-[10px] leading-4 text-ink">lo</span>}
                  {s.mid === i && <span className="rounded bg-accent px-1 font-mono text-[10px] leading-4 text-accent-ink">mid</span>}
                  {s.hi === i && <span className="rounded bg-amber-soft px-1 font-mono text-[10px] leading-4 text-amber">hi</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[12.5px] tabular-nums">
          <span>lo = <span className="text-ink">{s.lo}</span></span>
          <span>hi = <span className="text-ink">{s.hi}</span></span>
          <span>mid = <span className="text-ink">{s.mid ?? "…"}</span></span>
          {s.cond && <span>判斷 <span className="text-ink">{s.cond}</span></span>}
          {s.ans !== null && <span className="text-green">回傳 {s.ans}</span>}
        </div>
        <p className="mt-2 mb-0 text-[12px] text-ink-3">
          {halfOpen
            ? "灰色格子已經被排除。hi 指向的格子不在區間裡（半開），所以 hi = n 時指向陣列外的虛線格。"
            : "灰色格子已經被排除。lo 和 hi 指向的格子都還在區間裡（閉區間）。"}
        </p>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
