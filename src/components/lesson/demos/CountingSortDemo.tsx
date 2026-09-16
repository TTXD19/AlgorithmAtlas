"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, CELL } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

/** 共用陣列再補兩個重複值，才看得出「穩定」是什麼意思。a、b 標記同值的先後。 */
const ITEMS: { v: number; tag: string }[] = [
  { v: 5, tag: "5ᵃ" }, { v: 2, tag: "2ᵃ" }, { v: 9, tag: "9" }, { v: 1, tag: "1" }, { v: 7, tag: "7" },
  { v: 3, tag: "3" }, { v: 8, tag: "8" }, { v: 4, tag: "4" }, { v: 2, tag: "2ᵇ" }, { v: 5, tag: "5ᵇ" },
];
const K = 10; // 值域 0..9

const TEXT = demoText(
  {
    init: (k: number) => `值域是 0..${k - 1}，開一個長度 ${k} 的 count 陣列，全部歸零。整個過程不做任何兩兩比較。`,
    opStart: "開始",
    opCount: "階段 1：計數",
    opCountDone: "階段 1 完成",
    opPrefix: "階段 2：前綴累加",
    opPrefixDone: "階段 2 完成",
    opPlace: "階段 3：放回",
    opEnd: "結束",
    counted: (tag: string, v: number, n: number) => `看到 ${tag}，count[${v}] 加一，變成 ${n}。`,
    countDone: "計數完成。count[v] 是值 v 出現的次數。到這裡如果只要輸出數字，直接依序印出來就好，但那樣會丟掉原本的物件（穩定性）。",
    prefix: (c: number, now: number) =>
      `count[${c}] += count[${c - 1}]，變成 ${now}。意思是「≤ ${c} 的元素有 ${now} 個」，所以值 ${c} 的最後一個要放在索引 ${now - 1}。`,
    prefixDone: "前綴累加完成。現在 count[v] − 1 就是「值 v 最右邊那個」在輸出裡的位置。",
    place: (tag: string, v: number, now: number) =>
      `由後往前：拿 ${tag}，count[${v}] 減一變 ${now}，放到 out[${now}]。從後面拿、往後面放，同值的先後順序才不會反過來。`,
    done: (n: number, k: number) => `排序完成，且 2ᵃ 仍在 2ᵇ 前面、5ᵃ 仍在 5ᵇ 前面，這就是穩定。時間 O(n + k)，n = ${n}、k = ${k}。`,
    headerNote: "共用陣列 + 兩個重複值 · 值域 0..9",
    inputLabel: "輸入",
    outputLabel: "輸出",
    countRaw: "count（值 v 出現幾次）",
    countPrefix: "count（前綴累加後：值 v 的下一個放置位置 + 1）",
    legend: "藍色是正在處理的元素（輸出裡是剛放進去的位置），黃色是它對應的 count 格，綠色是已放好的輸出",
  },
  {
    en: {
      init: (k: number) => `The values run from 0 to ${k - 1}, so allocate a count array of length ${k} and zero it. Nothing in this algorithm ever compares two elements with each other.`,
      opStart: "Start",
      opCount: "Phase 1: counting",
      opCountDone: "Phase 1 complete",
      opPrefix: "Phase 2: prefix sums",
      opPrefixDone: "Phase 2 complete",
      opPlace: "Phase 3: placing",
      opEnd: "Done",
      counted: (tag: string, v: number, n: number) => `${tag} turns up, so count[${v}] goes up by one, to ${n}.`,
      countDone: "Counting is done: count[v] holds how many times the value v appears. If the numbers were all you needed, you could print them in order right here — but that throws away the original objects, and with them the stability.",
      prefix: (c: number, now: number) =>
        `count[${c}] += count[${c - 1}] gives ${now}. That says ${now} elements have a value ≤ ${c}, so the last element with value ${c} belongs at index ${now - 1}.`,
      prefixDone: "The prefix sums are done. count[v] − 1 is now the output position of the rightmost element with value v.",
      place: (tag: string, v: number, now: number) =>
        `Walking backwards: take ${tag}, decrement count[${v}] to ${now}, and write it into out[${now}]. Reading from the back and writing to the back is exactly what stops equal values from swapping order.`,
      done: (n: number, k: number) => `Sorting is finished, and 2ᵃ is still ahead of 2ᵇ and 5ᵃ still ahead of 5ᵇ — that is what stable means. The time is O(n + k), with n = ${n} and k = ${k}.`,
      headerNote: "The shared array plus two duplicate values, over the range 0..9",
      inputLabel: "Input",
      outputLabel: "Output",
      countRaw: "count (how often the value v appears)",
      countPrefix: "count (after the prefix sums: one past the next slot for value v)",
      legend: "Blue is the element being handled — in the output row it is the slot just written. Amber is its count entry, and green is output that has already been placed.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  op: string;
  phase: "count" | "prefix" | "place" | "none";
  count: number[];
  /** 輸出陣列，null 代表還沒放 */
  out: (string | null)[];
  /** 正在看的輸入索引 */
  i?: number;
  /** 正在看的 count 索引 */
  c?: number;
  /** 剛放進輸出的索引 */
  placed?: number;
}

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const count = new Array<number>(K).fill(0);
  const out = new Array<string | null>(ITEMS.length).fill(null);
  const snap = (desc: string, op: string, phase: Step["phase"], extra: Partial<Step> = {}) =>
    steps.push({ desc, op, phase, count: [...count], out: [...out], ...extra });

  snap(t.init(K), t.opStart, "none");
  for (let i = 0; i < ITEMS.length; i++) {
    count[ITEMS[i].v]++;
    snap(t.counted(ITEMS[i].tag, ITEMS[i].v, count[ITEMS[i].v]), t.opCount, "count", { i, c: ITEMS[i].v });
  }
  snap(t.countDone, t.opCountDone, "count");
  for (let c = 1; c < K; c++) {
    count[c] += count[c - 1];
    snap(t.prefix(c, count[c]), t.opPrefix, "prefix", { c });
  }
  snap(t.prefixDone, t.opPrefixDone, "prefix");
  for (let i = ITEMS.length - 1; i >= 0; i--) {
    const { v, tag } = ITEMS[i];
    count[v]--;
    out[count[v]] = tag;
    snap(t.place(tag, v, count[v]), t.opPlace, "place", { i, c: v, placed: count[v] });
  }
  snap(t.done(ITEMS.length, K), t.opEnd, "none");
  return steps;
}

export function CountingSortDemo() {
  const t = TEXT[useLocale()];
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const cell = "grid h-8 w-9 place-items-center rounded-md border font-mono text-[13px] tabular-nums";
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.headerNote} />
      <div className="p-3.5">
        <div className="eyebrow mb-2">{t.inputLabel}</div>
        <div className="flex flex-wrap gap-1">
          {ITEMS.map((it, i) => (
            <span key={i} className={`${cell} ${i === s.i ? CELL.accent : s.phase === "place" && s.i !== undefined && i > s.i ? CELL.dim : "border-line-strong bg-surface"}`}>{it.tag}</span>
          ))}
        </div>
      </div>
      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-2">{s.phase === "count" || k === 0 ? t.countRaw : t.countPrefix}</div>
        <div className="flex flex-wrap gap-1">
          {s.count.map((c, v) => (
            <div key={v} className="flex flex-col items-center gap-0.5">
              <span className="font-mono text-[10.5px] text-ink-3">{v}</span>
              <span className={`${cell} ${v === s.c ? CELL.amber : c === 0 ? CELL.dim : "border-line-strong bg-surface"}`}>{c}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-2">{t.outputLabel}</div>
        <div className="flex flex-wrap gap-1">
          {s.out.map((v, i) => (
            <span key={i} className={`${cell} ${i === s.placed ? CELL.accent : v === null ? "border-dashed border-line bg-surface-2 text-ink-3" : CELL.green}`}>{v ?? "·"}</span>
          ))}
        </div>
        <div className="mt-2 text-[12px] text-ink-3">{t.legend}</div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
