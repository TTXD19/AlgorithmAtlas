"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, BTN } from "./StepBar";

/** 有序、有重複的陣列。目標 8 出現在索引 2、3、4。 */
const DATA = [2, 5, 8, 8, 8, 13, 21, 34, 55, 89];
const TARGET = 8;
const N = DATA.length;

type Mode = "find" | "lower" | "upper";

const TEXT = demoText(
  {
    findAny: "找任一個",
    findIntro: (last: number) => `閉區間寫法：lo = 0、hi = n − 1 = ${last}，答案可能在 [lo, hi] 的任何位置。條件 lo ≤ hi 時繼續。`,
    findHit: (lo: number, hi: number, mid: number, v: number, target: number) =>
      `mid = ⌊(${lo} + ${hi}) / 2⌋ = ${mid}，a[${mid}] = ${v} 等於 ${target}，直接回傳 ${mid}。注意它是三個 ${target} 裡的最後一個，不是第一個，「找任一個」不保證邊界。`,
    findRight: (mid: number, v: number, target: number) =>
      `mid = ${mid}，a[${mid}] = ${v} < ${target}，答案在右半，lo = mid + 1 = ${mid + 1}。`,
    findLeft: (mid: number, v: number, target: number) =>
      `mid = ${mid}，a[${mid}] = ${v} > ${target}，答案在左半，hi = mid − 1 = ${mid - 1}。`,
    findMiss: (target: number) => `lo > hi，區間空了，${target} 不存在，回傳 −1。`,
    boundIntro: (n: number, sym: string, target: number) =>
      `半開區間寫法：lo = 0、hi = n = ${n}。要找的是「第一個 a[i] ${sym} ${target} 的 i」，答案範圍是 0 到 n，所以 hi 要能等於 n。條件 lo < hi 時繼續。`,
    boundOk: (mid: number, v: number, sym: string, target: number) =>
      `mid = ${mid}，a[${mid}] = ${v} ${sym} ${target} 成立，mid 可能就是答案，但左邊可能還有，hi = mid = ${mid}（mid 留在區間裡）。`,
    boundNo: (mid: number, v: number, sym: string, target: number) =>
      `mid = ${mid}，a[${mid}] = ${v} ${sym} ${target} 不成立，mid 一定不是答案，lo = mid + 1 = ${mid + 1}。`,
    lowerTail: (lo: number, target: number) =>
      `lo = hi = ${lo}，這是第一個 ${target} 的位置。${target} 存在的判斷：lo < n 且 a[lo] == ${target}。`,
    upperTail: (lo: number, lower: number, target: number) =>
      `lo = hi = ${lo}，這是最後一個 ${target} 的下一格。upper − lower = ${lo} − ${lower} = ${lo - lower}，就是 ${target} 出現的次數。`,
    targetLabel: (target: number) => `目標 ${target}`,
    halfOpenLabel: "半開區間 [lo, hi)",
    closedLabel: "閉區間 [lo, hi]",
    sortedArray: "有序陣列",
    test: "判斷",
    returns: (ans: number) => `回傳 ${ans}`,
    noteHalfOpen: "灰色格子已經被排除。hi 指向的格子不在區間裡（半開），所以 hi = n 時指向陣列外的虛線格。",
    noteClosed: "灰色格子已經被排除。lo 和 hi 指向的格子都還在區間裡（閉區間）。",
  },
  {
    en: {
      findAny: "find any",
      findIntro: (last: number) => `The closed-interval form: lo = 0 and hi = n − 1 = ${last}, so the answer may sit anywhere in [lo, hi]. Keep going while lo ≤ hi.`,
      findHit: (lo: number, hi: number, mid: number, v: number, target: number) =>
        `mid = ⌊(${lo} + ${hi}) / 2⌋ = ${mid}, and a[${mid}] = ${v} equals ${target}, so return ${mid} immediately. Notice that it is the last of the three ${target}s, not the first: searching for any match promises nothing about the boundary.`,
      findRight: (mid: number, v: number, target: number) =>
        `mid = ${mid}, a[${mid}] = ${v} < ${target}, so the answer is in the right half: lo = mid + 1 = ${mid + 1}.`,
      findLeft: (mid: number, v: number, target: number) =>
        `mid = ${mid}, a[${mid}] = ${v} > ${target}, so the answer is in the left half: hi = mid − 1 = ${mid - 1}.`,
      findMiss: (target: number) => `lo > hi, the interval is empty, ${target} is not there, so return −1.`,
      boundIntro: (n: number, sym: string, target: number) =>
        `The half-open form: lo = 0 and hi = n = ${n}. We are after the first i with a[i] ${sym} ${target}. The answer ranges from 0 to n, so hi has to be able to reach n. Keep going while lo < hi.`,
      boundOk: (mid: number, v: number, sym: string, target: number) =>
        `mid = ${mid}: a[${mid}] = ${v} ${sym} ${target} holds, so mid may be the answer, but something further left may qualify too. Set hi = mid = ${mid}, which keeps mid inside the interval.`,
      boundNo: (mid: number, v: number, sym: string, target: number) =>
        `mid = ${mid}: a[${mid}] = ${v} ${sym} ${target} fails, so mid certainly is not the answer. Set lo = mid + 1 = ${mid + 1}.`,
      lowerTail: (lo: number, target: number) =>
        `lo = hi = ${lo}, the index of the first ${target}. To decide whether ${target} is present at all: lo < n and a[lo] == ${target}.`,
      upperTail: (lo: number, lower: number, target: number) =>
        `lo = hi = ${lo}, one slot past the last ${target}. upper − lower = ${lo} − ${lower} = ${lo - lower}, which is how many times ${target} occurs.`,
      targetLabel: (target: number) => `target ${target}`,
      halfOpenLabel: "half-open [lo, hi)",
      closedLabel: "closed [lo, hi]",
      sortedArray: "Sorted array",
      test: "test",
      returns: (ans: number) => `returns ${ans}`,
      noteHalfOpen: "The grey cells are already ruled out. The cell hi points at is not in the interval — that is what half-open means — so when hi = n it points at the dashed cell past the end of the array.",
      noteClosed: "The grey cells are already ruled out. The cells lo and hi point at are both still inside the interval, because it is closed at each end.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; lo: number; hi: number; mid: number | null; ans: number | null; cond?: string }

/** 閉區間 [lo, hi]，找到就回傳，找到的是「任一個」8。 */
function buildFind(t: T): Step[] {
  const steps: Step[] = [{ desc: t.findIntro(N - 1), lo: 0, hi: N - 1, mid: null, ans: null }];
  let lo = 0, hi = N - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (DATA[mid] === TARGET) {
      steps.push({ desc: t.findHit(lo, hi, mid, DATA[mid], TARGET), lo, hi, mid, ans: mid, cond: `a[${mid}] == ${TARGET}` });
      return steps;
    }
    if (DATA[mid] < TARGET) {
      steps.push({ desc: t.findRight(mid, DATA[mid], TARGET), lo, hi, mid, ans: null, cond: `a[${mid}] < ${TARGET}` });
      lo = mid + 1;
    } else {
      steps.push({ desc: t.findLeft(mid, DATA[mid], TARGET), lo, hi, mid, ans: null, cond: `a[${mid}] > ${TARGET}` });
      hi = mid - 1;
    }
  }
  steps.push({ desc: t.findMiss(TARGET), lo, hi, mid: null, ans: null });
  return steps;
}

/** 半開區間 [lo, hi)，找「第一個滿足 a[i] >= x（lower）或 a[i] > x（upper）的位置」。 */
function buildBound(t: T, kind: "lower" | "upper"): Step[] {
  const ok = (v: number) => (kind === "lower" ? v >= TARGET : v > TARGET);
  const sym = kind === "lower" ? "≥" : ">";
  const steps: Step[] = [{ desc: t.boundIntro(N, sym, TARGET), lo: 0, hi: N, mid: null, ans: null }];
  let lo = 0, hi = N;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ok(DATA[mid])) {
      steps.push({ desc: t.boundOk(mid, DATA[mid], sym, TARGET), lo, hi, mid, ans: null, cond: `a[${mid}] ${sym} ${TARGET}` });
      hi = mid;
    } else {
      steps.push({ desc: t.boundNo(mid, DATA[mid], sym, TARGET), lo, hi, mid, ans: null, cond: `a[${mid}] ${sym} ${TARGET} ✗` });
      lo = mid + 1;
    }
  }
  const lowerAns = DATA.filter((v) => v < TARGET).length;
  const tail = kind === "lower" ? t.lowerTail(lo, TARGET) : t.upperTail(lo, lowerAns, TARGET);
  steps.push({ desc: tail, lo, hi, mid: null, ans: lo });
  return steps;
}

export function BinarySearchDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const find = useMemo(() => buildFind(TEXT[locale]), [locale]);
  const lower = useMemo(() => buildBound(TEXT[locale], "lower"), [locale]);
  const upper = useMemo(() => buildBound(TEXT[locale], "upper"), [locale]);
  const [mode, setMode] = useState<Mode>("find");
  const [k, setK] = useState(0);
  const steps = mode === "find" ? find : mode === "lower" ? lower : upper;
  const s = steps[k];
  const halfOpen = mode !== "find";
  const inRange = (i: number) => (halfOpen ? i >= s.lo && i < s.hi : i >= s.lo && i <= s.hi);
  const cells = halfOpen ? [...DATA.map(String), "n"] : DATA.map(String);
  const LABEL: Record<Mode, string> = { find: t.findAny, lower: "lower_bound", upper: "upper_bound" };

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
        right={`${t.targetLabel(TARGET)} · ${halfOpen ? t.halfOpenLabel : t.closedLabel}`}
      />

      <div className="overflow-x-auto p-3.5">
        <div className="eyebrow mb-2">{t.sortedArray}</div>
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
          {s.cond && <span>{t.test} <span className="text-ink">{s.cond}</span></span>}
          {s.ans !== null && <span className="text-green">{t.returns(s.ans)}</span>}
        </div>
        <p className="mt-2 mb-0 text-[12px] text-ink-3">
          {halfOpen ? t.noteHalfOpen : t.noteClosed}
        </p>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
