"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, CELL } from "./StepBar";
import { DemoInput } from "./DemoInput";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const DEFAULT = [5, 2, 9, 1, 7, 3, 8, 4];

const TEXT = demoText(
  {
    opStart: "開始",
    opEnd: "結束",
    intro: "把陣列想成一手撲克牌。左邊一張牌自己就是有序的；之後每次拿起下一張，往左找到它該在的位置插進去。",
    insertOp: (key: number) => `插入 ${key}`,
    pickUp: (i: number, key: number) => `拿起索引 ${i} 的 ${key}。左邊 ${i} 張已經有序，要把它插到正確位置。`,
    shift: (v: number, key: number) => `${v} 比 ${key} 大，${v} 往右挪一格，洞往左移。`,
    stop: (v: number, key: number) => `${v} 不比 ${key} 大，停下來。${key} 就插在 ${v} 的右邊。`,
    placedFirst: (key: number) => `一路挪到最左邊，${key} 放在索引 0。`,
    placedAt: (key: number, idx: number, sorted: number) => `${key} 放進索引 ${idx}，左邊 ${sorted} 張又是有序的了。`,
    finished: (shifts: number, compares: number, n: number) =>
      `排序完成。挪動 ${shifts} 次，正好是逆序對的數量；比較 ${compares} 次，是 ${shifts} 次挪動加上 ${compares - shifts} 次讓迴圈停下的比較，所以落在 ${shifts} 到 ${shifts} + (n−1) = ${shifts + n - 1} 之間。資料越接近有序，挪動越少，全有序時只要 n−1 次比較。`,
    ascending: "由小到大",
    arrayTitle: "陣列（虛線格是洞）",
    legend: "綠色是已排序區，黃色是剛和手上的牌比較過的元素，藍色是剛插入的位置",
    heldTitle: "手上的牌",
    comparesBefore: "比較 ",
    comparesAfter: " 次",
    shiftsBefore: "挪動 ",
    shiftsAfter: " 次",
  },
  {
    en: {
      opStart: "Start",
      opEnd: "Done",
      intro: "Think of the array as a hand of cards. The single card on the left is trivially sorted; each turn you pick up the next card and walk left until you find the spot it belongs in.",
      insertOp: (key: number) => `Insert ${key}`,
      pickUp: (i: number, key: number) => `Pick up ${key} at index ${i}. The ${i} cards to its left are already sorted, so it needs to go into the right place among them.`,
      shift: (v: number, key: number) => `${v} is greater than ${key}, so ${v} slides one cell to the right and the hole moves left.`,
      stop: (v: number, key: number) => `${v} is not greater than ${key}, so the walk stops here: ${key} belongs just to the right of ${v}.`,
      placedFirst: (key: number) => `Everything shifted across, so ${key} goes to index 0.`,
      placedAt: (key: number, idx: number, sorted: number) => `${key} drops into index ${idx}, and the ${sorted} cards on the left are sorted again.`,
      finished: (shifts: number, compares: number, n: number) =>
        `Sorted. There were ${shifts} shifts, exactly the number of inversions in the input, and ${compares} comparisons: one per shift plus the ${compares - shifts} comparisons that stopped an inner loop, so the count lands between ${shifts} and ${shifts} + (n−1) = ${shifts + n - 1}. The closer the input is to sorted, the fewer shifts; on already-sorted data only n−1 comparisons are needed.`,
      ascending: "ascending",
      arrayTitle: "Array (a dashed cell is the hole)",
      legend: "Green is the sorted region, amber is the element just compared with the card in hand, and blue is where the card was inserted.",
      heldTitle: "Card in hand",
      comparesBefore: "Comparisons: ",
      comparesAfter: "",
      shiftsBefore: "Shifts: ",
      shiftsAfter: "",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  op: string;
  /** 陣列內容，null 代表這格是「洞」（牌被拿在手上） */
  arr: (number | null)[];
  /** 手上的牌 */
  key?: number;
  /** 已排序區的右界（不含） */
  sortedEnd: number;
  /** 剛和手上的牌比較過的元素所在索引（被挪動的話是挪動後的位置） */
  cmp?: number;
  /** 剛插入的位置 */
  placed?: number;
  compares: number;
  shifts: number;
}

function buildSteps(t: T, arr: number[]): Step[] {
  const a: (number | null)[] = [...arr];
  const n = a.length;
  const steps: Step[] = [];
  let compares = 0;
  let shifts = 0;
  const snap = (desc: string, op: string, sortedEnd: number, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, arr: [...a], sortedEnd, compares, shifts, ...extra });

  snap(t.intro, t.opStart, 1);
  for (let i = 1; i < n; i++) {
    const key = a[i] as number;
    const label = t.insertOp(key);
    a[i] = null;
    // 插入進行中，已排序區含洞共 i + 1 格
    snap(t.pickUp(i, key), label, i + 1, { key });
    let j = i - 1;
    while (j >= 0) {
      const v = a[j] as number;
      compares++;
      if (v > key) {
        a[j + 1] = v;
        a[j] = null;
        shifts++;
        snap(t.shift(v, key), label, i + 1, { key, cmp: j + 1 });
        j--;
      } else {
        snap(t.stop(v, key), label, i + 1, { key, cmp: j });
        break;
      }
    }
    a[j + 1] = key;
    snap(j < 0 ? t.placedFirst(key) : t.placedAt(key, j + 1, i + 1), label, i + 1, { placed: j + 1 });
  }
  snap(t.finished(shifts, compares, n), t.opEnd, n);
  return steps;
}

export function InsertionSortDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const [arr, setArr] = useState(DEFAULT);
  const steps = useMemo(() => buildSteps(TEXT[locale], arr), [locale, arr]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const tone = (i: number, v: number | null) => {
    if (v === null) return "border-dashed border-line-strong bg-surface-2 text-ink-3";
    if (i === s.placed) return CELL.accent;
    if (i === s.cmp) return CELL.amber;
    if (i < s.sortedEnd) return CELL.green;
    return "border-line-strong bg-surface";
  };
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`[${arr.join(", ")}] · ${t.ascending}`} />
      <DemoInput value={arr} defaults={DEFAULT} onChange={(a) => { setArr(a); setK(0); }} />
      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[minmax(0,1fr)_120px]">
        <div>
          <div className="eyebrow mb-2">{t.arrayTitle}</div>
          <div className="flex flex-wrap gap-1">
            {s.arr.map((v, i) => (
              <span key={i} className={`grid h-8 w-9 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${tone(i, v)}`}>{v ?? "·"}</span>
            ))}
          </div>
          <div className="mt-2 text-[12px] text-ink-3">{t.legend}</div>
        </div>
        <div>
          <div className="eyebrow mb-2">{t.heldTitle}</div>
          {s.key !== undefined ? (
            <span className={`grid h-8 w-9 place-items-center rounded-md border font-mono text-[13px] ${CELL.accent}`}>{s.key}</span>
          ) : (
            <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-8 text-ink-3">{ui.demo.empty}</span>
          )}
          <div className="mt-2 text-[12px] text-ink-3">{t.comparesBefore}<span className="font-mono tabular-nums">{s.compares}</span>{t.comparesAfter}</div>
          <div className="text-[12px] text-ink-3">{t.shiftsBefore}<span className="font-mono tabular-nums">{s.shifts}</span>{t.shiftsAfter}</div>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
