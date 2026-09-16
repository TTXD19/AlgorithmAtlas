"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, BTN } from "./StepBar";

/** 對撞指標：有序陣列兩數之和（LeetCode 167） */
const SUM_DATA = [2, 3, 5, 8, 11, 14, 17, 21];
const TARGET = 25;
/** 同向指標：移除有序陣列的重複（LeetCode 26） */
const DUP_DATA = [1, 1, 2, 2, 2, 3, 5, 5, 6, 6];

type Mode = "sum" | "dedup";

const TEXT = demoText(
  {
    otherPair: (a: number, b: number, target: number) =>
      `（${a} + ${b} 也等於 ${target}，對撞指標回傳的是先夾到的那一對。）`,
    sumIntro: (target: number) => `陣列已排序，要找兩數相加等於 ${target}。左指標 l 放最小值，右指標 r 放最大值。`,
    sumFound: (a: number, b: number, sum: number, target: number, l: number, r: number, cmp: number, pairs: number, other: string) =>
      `${a} + ${b} = ${sum}，等於 ${target}，回傳索引 [${l}, ${r}]。總共比了 ${cmp} 次，暴力列舉最多要看 ${pairs} 對。${other}`,
    sumTooSmall: (a: number, b: number, sum: number, target: number) =>
      `${a} + ${b} = ${sum} < ${target}，太小。${b} 已經是剩下最大的，${a} 配誰都不夠，${a} 可以永遠淘汰，l 往右。`,
    sumTooBig: (a: number, b: number, sum: number, target: number) =>
      `${a} + ${b} = ${sum} > ${target}，太大。${a} 已經是剩下最小的，${b} 配誰都太大，${b} 可以永遠淘汰，r 往左。`,
    sumNone: "指標相遇，沒有答案。",
    dedupIntro: "慢指標 w 是「下一個要寫入的位置」，快指標 r 負責往前讀。arr[0] 一定保留，所以 w 從 1 開始、r 也從 1 開始。",
    dedupNew: (r: number, v: number, prev: number, w: number) =>
      `arr[${r}] = ${v} 和上一個保留的 ${prev} 不同，是新值：寫到 arr[${w}]，w 變成 ${w + 1}。`,
    dedupDup: (r: number, v: number, prev: number) =>
      `arr[${r}] = ${v} 和上一個保留的 ${prev} 相同，是重複：r 往前，w 不動。`,
    dedupEnd: (w: number) => `r 走到底。前 w = ${w} 格就是去重後的結果，後面的內容不重要。原地完成，O(n) 時間、O(1) 額外空間。`,
    modeSum: "對撞：兩數之和",
    modeDedup: "同向：移除重複",
    rightSum: (target: number) => `目標 ${target} · 已排序`,
    rightDedup: "原地去重 · 已排序",
    titleSum: "有序陣列",
    titleDedup: "陣列（會被原地改寫）",
    comma: "，",
    targetIs: (target: number) => `目標 ${target}`,
    foundAt: (a: number, b: number) => `找到 [${a}, ${b}]`,
    kept: "已保留 ",
    noteSum: "劃掉的格子已被證明不可能是答案的一部分，之後不會再看。",
    noteDedup: "綠色是已寫好的去重結果（arr[0..w)），黃色是 r 正在讀的格子。",
  },
  {
    en: {
      otherPair: (a: number, b: number, target: number) =>
        ` (${a} + ${b} also adds up to ${target}; converging pointers return whichever pair they close in on first.)`,
      sumIntro: (target: number) => `The array is sorted and we want two numbers that add up to ${target}. Put the left pointer l on the smallest value and the right pointer r on the largest.`,
      sumFound: (a: number, b: number, sum: number, target: number, l: number, r: number, cmp: number, pairs: number, other: string) =>
        `${a} + ${b} = ${sum}, which is exactly ${target}, so return the indices [${l}, ${r}]. That took ${cmp} comparison${cmp === 1 ? "" : "s"}, where brute force would check up to ${pairs} pairs.${other}`,
      sumTooSmall: (a: number, b: number, sum: number, target: number) =>
        `${a} + ${b} = ${sum} < ${target}, too small. ${b} is already the largest value left, so ${a} cannot reach ${target} with any partner. ${a} is ruled out for good and l moves right.`,
      sumTooBig: (a: number, b: number, sum: number, target: number) =>
        `${a} + ${b} = ${sum} > ${target}, too large. ${a} is already the smallest value left, so ${b} overshoots with any partner. ${b} is ruled out for good and r moves left.`,
      sumNone: "The pointers have met, so there is no answer.",
      dedupIntro: 'The slow pointer w marks "the next position to write to" and the fast pointer r reads ahead. arr[0] is always kept, so w and r both start at 1.',
      dedupNew: (r: number, v: number, prev: number, w: number) =>
        `arr[${r}] = ${v} differs from ${prev}, the last value kept, so it is new: write it to arr[${w}] and w becomes ${w + 1}.`,
      dedupDup: (r: number, v: number, prev: number) =>
        `arr[${r}] = ${v} matches ${prev}, the last value kept, so it is a duplicate: r moves on and w stays put.`,
      dedupEnd: (w: number) => `r has reached the end. The first w = ${w} slots are the deduplicated result, and whatever follows them no longer matters. All of it happened in place, in O(n) time and O(1) extra space.`,
      modeSum: "Converging: two sum",
      modeDedup: "Same direction: remove duplicates",
      rightSum: (target: number) => `target ${target} · sorted`,
      rightDedup: "dedupe in place · sorted",
      titleSum: "Sorted array",
      titleDedup: "Array (rewritten in place)",
      comma: ", ",
      targetIs: (target: number) => `target ${target}`,
      foundAt: (a: number, b: number) => `found [${a}, ${b}]`,
      kept: "kept ",
      noteSum: "A struck-through cell has been ruled out: it cannot be part of any answer, so it is never looked at again.",
      noteDedup: "Green is the deduplicated result written so far (arr[0..w)), and amber is the cell r is reading.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; l: number; r: number; arr: number[]; found?: [number, number]; dead: number[]; write?: number }

/** 資料裡若還有別的一對也等於目標，順便說明對撞指標只回傳先夾到的那一對。 */
function otherPair(t: T, l: number, r: number): string {
  for (let i = 0; i < SUM_DATA.length; i++) {
    for (let j = i + 1; j < SUM_DATA.length; j++) {
      if (SUM_DATA[i] + SUM_DATA[j] === TARGET && !(i === l && j === r)) {
        return t.otherPair(SUM_DATA[i], SUM_DATA[j], TARGET);
      }
    }
  }
  return "";
}

function buildSum(t: T): Step[] {
  const steps: Step[] = [{ desc: t.sumIntro(TARGET), l: 0, r: SUM_DATA.length - 1, arr: SUM_DATA, dead: [] }];
  const dead: number[] = [];
  let l = 0, r = SUM_DATA.length - 1;
  while (l < r) {
    const sum = SUM_DATA[l] + SUM_DATA[r];
    if (sum === TARGET) {
      steps.push({ desc: t.sumFound(SUM_DATA[l], SUM_DATA[r], sum, TARGET, l, r, steps.length, (SUM_DATA.length * (SUM_DATA.length - 1)) / 2, otherPair(t, l, r)), l, r, arr: SUM_DATA, found: [l, r], dead: [...dead] });
      return steps;
    }
    if (sum < TARGET) {
      dead.push(l);
      steps.push({ desc: t.sumTooSmall(SUM_DATA[l], SUM_DATA[r], sum, TARGET), l, r, arr: SUM_DATA, dead: [...dead] });
      l++;
    } else {
      dead.push(r);
      steps.push({ desc: t.sumTooBig(SUM_DATA[l], SUM_DATA[r], sum, TARGET), l, r, arr: SUM_DATA, dead: [...dead] });
      r--;
    }
  }
  steps.push({ desc: t.sumNone, l, r, arr: SUM_DATA, dead: [...dead] });
  return steps;
}

function buildDedup(t: T): Step[] {
  const arr = [...DUP_DATA];
  const steps: Step[] = [{ desc: t.dedupIntro, l: 1, r: 1, arr: [...arr], dead: [], write: 1 }];
  let w = 1;
  for (let r = 1; r < arr.length; r++) {
    if (arr[r] !== arr[w - 1]) {
      arr[w] = arr[r];
      steps.push({ desc: t.dedupNew(r, arr[r], arr[w - 1], w), l: w + 1, r, arr: [...arr], dead: [], write: w + 1 });
      w++;
    } else {
      steps.push({ desc: t.dedupDup(r, arr[r], arr[w - 1]), l: w, r, arr: [...arr], dead: [], write: w });
    }
  }
  steps.push({ desc: t.dedupEnd(w), l: w, r: arr.length, arr: [...arr], dead: [], write: w });
  return steps;
}

export function TwoPointersDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const sum = useMemo(() => buildSum(TEXT[locale]), [locale]);
  const dedup = useMemo(() => buildDedup(TEXT[locale]), [locale]);
  const [mode, setMode] = useState<Mode>("sum");
  const [k, setK] = useState(0);
  const steps = mode === "sum" ? sum : dedup;
  const s = steps[k];
  const isSum = mode === "sum";

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["sum", "dedup"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => { setMode(m); setK(0); }}>
                {m === "sum" ? t.modeSum : t.modeDedup}
              </button>
            ))}
          </div>
        }
        right={isSum ? t.rightSum(TARGET) : t.rightDedup}
      />

      <div className="overflow-x-auto p-3.5">
        <div className="eyebrow mb-2">{isSum ? t.titleSum : t.titleDedup}</div>
        <div className="flex gap-1">
          {s.arr.map((v, i) => {
            const tone = isSum
              ? s.found && (i === s.found[0] || i === s.found[1])
                ? "border-green bg-green-soft text-green"
                : i === s.l || i === s.r
                  ? "border-accent bg-accent text-accent-ink"
                  : s.dead.includes(i) ? "border-line bg-surface-2 text-ink-3 line-through" : "border-line-strong bg-surface"
              : i === s.r && i < s.arr.length
                ? "border-amber bg-amber-soft text-amber"
                : i < (s.write ?? 0)
                  ? "border-green bg-green-soft text-green"
                  : "border-line-strong bg-surface";
            return (
              <div key={i} className="flex w-10 flex-col items-center gap-1">
                <span className={`grid h-8 w-10 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${tone}`}>{v}</span>
                <span className="font-mono text-[10.5px] text-ink-3">{i}</span>
                <div className="flex h-4 gap-0.5">
                  {isSum && s.l === i && <span className="rounded bg-accent-soft px-1 font-mono text-[10px] leading-4 text-ink">l</span>}
                  {isSum && s.r === i && <span className="rounded bg-accent-soft px-1 font-mono text-[10px] leading-4 text-ink">r</span>}
                  {!isSum && s.l === i && <span className="rounded bg-green-soft px-1 font-mono text-[10px] leading-4 text-green">w</span>}
                  {!isSum && s.r === i && <span className="rounded bg-amber-soft px-1 font-mono text-[10px] leading-4 text-amber">r</span>}
                </div>
              </div>
            );
          })}
          {!isSum && s.r === s.arr.length && (
            <div className="flex w-10 flex-col items-center gap-1">
              <span className="grid h-8 w-10 place-items-center rounded-md border border-dashed border-line-strong font-mono text-[11px] text-ink-3">end</span>
              <span className="font-mono text-[10.5px] text-ink-3">{s.arr.length}</span>
              <div className="flex h-4"><span className="rounded bg-amber-soft px-1 font-mono text-[10px] leading-4 text-amber">r</span></div>
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[12.5px] tabular-nums">
          {isSum ? (
            <>
              <span>l = <span className="text-ink">{s.l}</span>{t.comma}r = <span className="text-ink">{s.r}</span></span>
              <span>a[l] + a[r] = <span className="text-ink">{s.l < s.r ? s.arr[s.l] + s.arr[s.r] : "…"}</span></span>
              <span>{t.targetIs(TARGET)}</span>
              {s.found && <span className="text-green">{t.foundAt(s.found[0], s.found[1])}</span>}
            </>
          ) : (
            <>
              <span>w = <span className="text-ink">{s.l}</span>{t.comma}r = <span className="text-ink">{s.r}</span></span>
              <span>{t.kept}<span className="text-ink">{s.arr.slice(0, s.write ?? 0).join(", ") || "…"}</span></span>
            </>
          )}
        </div>
        <p className="mt-2 mb-0 text-[12px] text-ink-3">
          {isSum ? t.noteSum : t.noteDedup}
        </p>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
