"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, CELL } from "./StepBar";
import { DemoInput } from "./DemoInput";

const DEFAULT = [5, 2, 9, 1, 7, 3, 8, 4];
/** 遞迴層數：8 → 4 → 2 → 1 是 4 層；一般是 ⌈log₂ n⌉ + 1 */
const depthsOf = (n: number) => Math.ceil(Math.log2(n)) + 1;

/** 第 depth 層各區段的起點索引，跟 sort() 的切法一致，用來在區段之間留空隙。 */
function segStarts(n: number, depth: number): Set<number> {
  const starts = new Set<number>();
  const go = (lo: number, hi: number, d: number) => {
    if (d === 0 || hi - lo <= 1) { starts.add(lo); return; }
    const mid = lo + ((hi - lo) >> 1);
    go(lo, mid, d - 1);
    go(mid, hi, d - 1);
  };
  go(0, n, depth);
  return starts;
}

const TEXT = demoText(
  {
    opStart: "開始",
    opEnd: "結束",
    intro: "合併排序分兩個階段：先一路切半直到每段只有一個元素（一個元素天生有序），再把相鄰兩段合併回去。",
    split: (lo: number, hi: number, mid: number) =>
      `切半：索引 [${lo}..${hi}] 分成 [${lo}..${mid - 1}] 和 [${mid}..${hi}]，往下一層，各自遞迴排序。`,
    mergeIntro: (left: string, right: string) =>
      `合併：左段 [${left}] 和右段 [${right}] 都已有序。兩個指標各指段首，每次挑較小的放上去。`,
    takeLeft: (l: number, r: number) =>
      `比較 ${l} 和 ${r}：${l} 較小（相等時取左邊，保持穩定），放到輸出，左指標右移。`,
    takeRight: (l: number, r: number) => `比較 ${l} 和 ${r}：${r} 較小，放到輸出，右指標右移。`,
    drain: (rest: string, lo: number, hi: number, result: string) =>
      `一邊用完了，另一邊剩下的 [${rest}] 本來就有序，直接整段搬上去。[${lo}..${hi}] 合併完成：[${result}]。`,
    finished: "排序完成。每一層合併總共處理 n 個元素，共 log₂n 層，所以是 O(n log n)。合併需要一塊 O(n) 的暫存空間。",
    caption: (arr: string) => `[${arr}] · 由小到大`,
    levelsTitle: "遞迴的每一層（上：整段，下：切到只剩一個）",
    level: (d: number) => `層 ${d}`,
    legend: "黃色是合併時左右兩段的指標，藍色是剛放進輸出的位置，綠色是已排好的區段",
  },
  {
    en: {
      opStart: "Start",
      opEnd: "Done",
      intro: "Merge sort has two phases: first keep halving until every segment holds a single element (which is sorted by definition), then merge neighbouring segments back together.",
      split: (lo: number, hi: number, mid: number) =>
        `Split: indices [${lo}..${hi}] become [${lo}..${mid - 1}] and [${mid}..${hi}]. Both move down a level and are sorted recursively.`,
      mergeIntro: (left: string, right: string) =>
        `Merge: the left segment [${left}] and the right segment [${right}] are both sorted. One pointer sits at the head of each, and every step takes the smaller of the two.`,
      takeLeft: (l: number, r: number) =>
        `Compare ${l} and ${r}: ${l} is smaller (ties go to the left, which is what keeps the sort stable), so it goes to the output and the left pointer advances.`,
      takeRight: (l: number, r: number) =>
        `Compare ${l} and ${r}: ${r} is smaller, so it goes to the output and the right pointer advances.`,
      drain: (rest: string, lo: number, hi: number, result: string) =>
        `One side is exhausted. Whatever is left on the other side, [${rest}], is already sorted, so it is copied up in one go. The merge of [${lo}..${hi}] is done: [${result}].`,
      finished: "Sorting is complete. Each level of merging handles n elements in total and there are log₂n levels, which is where O(n log n) comes from. Merging also needs an O(n) scratch buffer.",
      caption: (arr: string) => `[${arr}] · ascending`,
      levelsTitle: "Every level of the recursion (top: the whole array, bottom: split down to single elements)",
      level: (d: number) => `Lvl ${d}`,
      legend: "Amber marks the two pointers during a merge, blue marks the slot just written to the output, and green marks a segment that is already sorted.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

type Row = (number | null)[];

interface Step {
  desc: string;
  op: string;
  /** rows[d] 是第 d 層目前持有的值，null 代表這格的值在別層 */
  rows: Row[];
  /** 正在處理的區段 */
  focus?: { depth: number; lo: number; hi: number };
  /** 合併時左右兩個指標指到的絕對索引（在 depth+1 那一層） */
  ptr?: { i: number; j: number };
  /** 剛放進去的位置（在 depth 那一層） */
  placed?: number[];
  /** 已完成排序的區段（depth, lo, hi） */
  done: { depth: number; lo: number; hi: number }[];
}

function buildSteps(t: T, arr: number[]): Step[] {
  const n = arr.length;
  const rows: Row[] = Array.from({ length: depthsOf(n) }, (_, d) => (d === 0 ? [...arr] : new Array<number | null>(n).fill(null)));
  const done: Step["done"] = [];
  const steps: Step[] = [];
  const snap = (desc: string, op: string, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, rows: rows.map((r) => [...r]), done: [...done], ...extra });

  snap(t.intro, t.opStart);

  const sort = (depth: number, lo: number, hi: number) => {
    const len = hi - lo;
    if (len === 1) {
      done.push({ depth, lo, hi });
      return;
    }
    const mid = lo + (len >> 1);
    // 切半：把值搬到下一層
    for (let x = lo; x < hi; x++) {
      rows[depth + 1][x] = rows[depth][x];
      rows[depth][x] = null;
    }
    snap(t.split(lo, hi - 1, mid), `split(${lo}, ${hi - 1})`, { focus: { depth: depth + 1, lo, hi } });
    sort(depth + 1, lo, mid);
    sort(depth + 1, mid, hi);
    // 合併
    const label = `merge(${lo}, ${mid - 1} | ${mid}, ${hi - 1})`;
    let i = lo;
    let j = mid;
    let k = lo;
    const child = rows[depth + 1];
    snap(t.mergeIntro(child.slice(lo, mid).join(", "), child.slice(mid, hi).join(", ")), label, { focus: { depth, lo, hi }, ptr: { i, j } });
    while (i < mid && j < hi) {
      const L = child[i] as number;
      const R = child[j] as number;
      if (L <= R) {
        rows[depth][k] = L;
        child[i] = null;
        i++;
        snap(t.takeLeft(L, R), label, { focus: { depth, lo, hi }, ptr: { i, j }, placed: [k] });
      } else {
        rows[depth][k] = R;
        child[j] = null;
        j++;
        snap(t.takeRight(L, R), label, { focus: { depth, lo, hi }, ptr: { i, j }, placed: [k] });
      }
      k++;
    }
    const rest: number[] = [];
    const placed: number[] = [];
    while (i < mid) { rest.push(child[i] as number); rows[depth][k] = child[i]; child[i] = null; placed.push(k); i++; k++; }
    while (j < hi) { rest.push(child[j] as number); rows[depth][k] = child[j]; child[j] = null; placed.push(k); j++; k++; }
    done.push({ depth, lo, hi });
    snap(t.drain(rest.join(", "), lo, hi - 1, rows[depth].slice(lo, hi).join(", ")), label, { focus: { depth, lo, hi }, placed });
  };
  sort(0, 0, n);
  snap(t.finished, t.opEnd);
  return steps;
}

export function MergeSortDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const [arr, setArr] = useState(DEFAULT);
  const steps = useMemo(() => buildSteps(TEXT[locale], arr), [locale, arr]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const n = arr.length;

  const tone = (depth: number, idx: number, v: number | null) => {
    if (v === null) return "border-dashed border-line bg-surface-2 text-ink-3";
    if (s.placed && s.focus && s.focus.depth === depth && s.placed.includes(idx)) return CELL.accent;
    if (s.ptr && s.focus && depth === s.focus.depth + 1 && (idx === s.ptr.i || idx === s.ptr.j)) return CELL.amber;
    if (s.done.some((d) => d.depth === depth && idx >= d.lo && idx < d.hi)) return CELL.green;
    return "border-line-strong bg-surface";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.caption(arr.join(", "))} />
      <DemoInput value={arr} defaults={DEFAULT} onChange={(a) => { setArr(a); setK(0); }} />
      <div className="p-3.5">
        <div className="eyebrow mb-2">{t.levelsTitle}</div>
        <div className="flex flex-col gap-1.5">
          {s.rows.map((row, depth) => {
            const starts = segStarts(n, depth);
            return (
              <div key={depth} className="flex items-center gap-2">
                <span className="w-10 shrink-0 font-mono text-[11px] text-ink-3">{t.level(depth)}</span>
                <div className="flex flex-wrap gap-1">
                  {row.map((v, idx) => (
                    <span
                      key={idx}
                      className={`grid h-8 w-9 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${tone(depth, idx, v)}`}
                      style={{ marginLeft: idx > 0 && starts.has(idx) ? 10 : 0 }}
                    >
                      {v ?? "·"}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-[12px] text-ink-3">{t.legend}</div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
