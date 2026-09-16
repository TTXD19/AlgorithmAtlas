"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, CELL } from "./StepBar";

/** 兩位數：前八個的十位數就是共用陣列 [5, 2, 9, 1, 7, 3, 8, 4]，個位數故意打亂；再補一個十位同為 2 的 24，才看得到第二趟的穩定性 */
const ARR = [52, 29, 91, 17, 73, 38, 84, 45, 24];
const DIGITS = 2;

const TEXT = demoText(
  {
    intro: "LSD 基數排序：從最低位（個位）開始，按這一位的數字把元素依序丟進 0..9 十個桶，再按桶的順序接回來。每一位做一遍。",
    ones: "個位",
    tens: "十位",
    place: (v: number, name: string, g: number) => `${v} 的${name}數是 ${g}，放進桶 ${g} 的尾端。同一桶內保持進來的順序（穩定）。`,
    opBucket: (pass: number, name: string) => `第 ${pass} 趟：按${name}分桶`,
    opCollect: (pass: number) => `第 ${pass} 趟：收集`,
    tieOnes: (bucket: number, pair: string) => `桶 ${bucket} 裡的 ${pair} 的個位相同，照原本的先後進桶，`,
    tieTens: (bucket: number, pair: string) => `桶 ${bucket} 裡的 ${pair} 的十位相同，進桶的先後就是上一趟按個位排好的順序，`,
    and: " 和 ",
    collectOnes: (list: string, tie: string) => `依桶 0..9 的順序接回來：[${list}]。${tie}現在整個序列按個位數有序。`,
    collectTens: (list: string, tie: string) => `依桶 0..9 的順序接回來：[${list}]。${tie}所以十位相同時個位也是對的。這就是每一趟都必須穩定的原因。`,
    done: "排序完成。d 位數就做 d 趟，每趟 O(n + 10)，總共 O(d·(n + k))。n 很大而位數固定時，d 是常數，等於線性時間。",
    opStart: "開始",
    opEnd: "結束",
    caption: "LSD 基數排序 · 十進位 · 2 位數",
    sequence: "序列（底線是這一趟看的位數）",
    buckets: "桶 0..9（每桶由上往下是先進後進）",
    legend: "藍色是正在分桶的元素，灰色是已經進桶的，綠色是收集回來後的序列",
  },
  {
    en: {
      intro: "LSD radix sort starts at the least significant digit (the ones). It drops each element into one of ten buckets 0..9 according to that digit, then collects the buckets back in order. One pass per digit.",
      ones: "ones",
      tens: "tens",
      place: (v: number, name: string, g: number) => `The ${name} digit of ${v} is ${g}, so ${v} joins the back of bucket ${g}. Within a bucket the arrival order is kept, which is what makes the pass stable.`,
      opBucket: (pass: number, name: string) => `Pass ${pass}: bucket by the ${name} digit`,
      opCollect: (pass: number) => `Pass ${pass}: collect`,
      tieOnes: (bucket: number, pair: string) => `${pair} share a ones digit in bucket ${bucket}, and they entered in their original order. `,
      tieTens: (bucket: number, pair: string) => `${pair} share a tens digit in bucket ${bucket}, and they entered in the order the previous pass left them in. `,
      and: " and ",
      collectOnes: (list: string, tie: string) => `Collecting the buckets in order 0..9 gives [${list}]. ${tie}The whole sequence is now sorted by its ones digit.`,
      collectTens: (list: string, tie: string) => `Collecting the buckets in order 0..9 gives [${list}]. ${tie}So whenever two numbers share a tens digit, their ones digits are already in the right order. This is exactly why every pass has to be stable.`,
      done: "The sort is finished. A d-digit key takes d passes, each one O(n + 10), so O(d·(n + k)) overall. When n is large and the number of digits is fixed, d is a constant and the sort runs in linear time.",
      opStart: "Start",
      opEnd: "Done",
      caption: "LSD radix sort · base 10 · 2 digits",
      sequence: "The sequence (the underlined digit is the one this pass reads)",
      buckets: "Buckets 0..9 (top to bottom is arrival order)",
      legend: "Blue is the element being placed, grey is already bucketed, green is the sequence after collecting",
    },
  },
);

type Dict = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  op: string;
  /** 目前的序列 */
  arr: number[];
  /** 正在處理的位數：0 個位、1 十位；-1 代表沒有 */
  digit: number;
  /** 10 個桶 */
  buckets: number[][];
  /** 正在分桶的元素在 arr 裡的索引 */
  i?: number;
  /** 已從 arr 移出的索引（灰掉） */
  moved: number[];
  /** 剛收集回來 */
  collected?: boolean;
}

const digitOf = (x: number, d: number) => Math.floor(x / 10 ** d) % 10;

function buildSteps(t: Dict): Step[] {
  const steps: Step[] = [];
  let arr = [...ARR];
  let buckets: number[][] = Array.from({ length: 10 }, () => []);
  const snap = (desc: string, op: string, digit: number, moved: number[], extra: Partial<Step> = {}) =>
    steps.push({ desc, op, arr: [...arr], digit, buckets: buckets.map((b) => [...b]), moved: [...moved], ...extra });

  snap(t.intro, t.opStart, -1, []);
  for (let d = 0; d < DIGITS; d++) {
    const name = d === 0 ? t.ones : t.tens;
    buckets = Array.from({ length: 10 }, () => []);
    const moved: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const g = digitOf(arr[i], d);
      buckets[g].push(arr[i]);
      moved.push(i);
      snap(t.place(arr[i], name, g), t.opBucket(d + 1, name), d, moved, { i });
    }
    arr = buckets.flat();
    const tie = buckets.findIndex((b) => b.length > 1);
    const pair = tie >= 0 ? buckets[tie].join(t.and) : "";
    const tieNote = tie >= 0 ? (d === 0 ? t.tieOnes(tie, pair) : t.tieTens(tie, pair)) : "";
    snap(
      d === 0
        ? t.collectOnes(arr.join(", "), tieNote)
        : t.collectTens(arr.join(", "), tieNote),
      t.opCollect(d + 1), d, [], { collected: true },
    );
  }
  snap(t.done, t.opEnd, -1, []);
  return steps;
}

function DigitCell({ v, digit, tone }: { v: number; digit: number; tone: string }) {
  const s = String(v).padStart(DIGITS, "0");
  const hi = digit >= 0 ? DIGITS - 1 - digit : -1;
  return (
    <span className={`grid h-8 w-10 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${tone}`}>
      <span>
        {s.split("").map((ch, idx) => (
          <span key={idx} className={idx === hi ? "font-bold underline decoration-2 underline-offset-2" : ""}>{ch}</span>
        ))}
      </span>
    </span>
  );
}

export function RadixSortDemo() {
  const t = TEXT[useLocale()];
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.caption} />
      <div className="p-3.5">
        <div className="eyebrow mb-2">{t.sequence}</div>
        <div className="flex flex-wrap gap-1">
          {s.arr.map((v, i) => (
            <DigitCell key={i} v={v} digit={s.digit} tone={i === s.i ? CELL.accent : s.moved.includes(i) ? CELL.dim : s.collected || k === steps.length - 1 ? CELL.green : "border-line-strong bg-surface"} />
          ))}
        </div>
      </div>
      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-2">{t.buckets}</div>
        <div className="grid grid-cols-10 gap-1">
          {s.buckets.map((b, g) => (
            <div key={g} className="flex flex-col items-center gap-1">
              <span className={`font-mono text-[11px] ${s.i !== undefined && digitOf(s.arr[s.i], s.digit) === g ? "font-bold text-accent" : "text-ink-3"}`}>{g}</span>
              <div className="flex min-h-9 w-full flex-col gap-1 rounded-md border border-dashed border-line p-0.5">
                {b.map((v, idx) => (
                  <span key={idx} className={`grid h-7 place-items-center rounded border font-mono text-[12px] tabular-nums ${s.i !== undefined && s.arr[s.i] === v && idx === b.length - 1 ? CELL.accent : "border-line-strong bg-surface"}`}>{v}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[12px] text-ink-3">{t.legend}</div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
