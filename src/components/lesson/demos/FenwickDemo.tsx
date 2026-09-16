"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** 1-indexed 原陣列 */
const ARR = [0, 5, 3, 8, 6, 2, 7, 4, 1];
const N = ARR.length - 1;
const lowbit = (i: number) => i & -i;
const bin = (i: number) => i.toString(2).padStart(4, "0");

const TEXT = demoText(
  {
    build: "tree[i] 負責的區間長度是 lowbit(i)，也就是 i 的二進位最右邊那個 1 的值。tree[6] = 0110 負責 2 個：a[5..6]；tree[8] = 1000 負責 8 個：a[1..8]。",
    prefixIntro: "前綴和 prefix(6)：從 i = 6 開始，每次加 tree[i]，然後 i −= lowbit(i)，把最右邊的 1 拿掉。",
    prefixStep: (i: number, b: string, v: number, from: number, acc: number, lb: number, next: number) =>
      `i = ${i} (${b})，加 tree[${i}] = ${v}（負責 a[${from}..${i}]），累計 ${acc}。i −= lowbit = ${lb} → ${next}。`,
    prefixEnd: (acc: number, count: number) => `i = 0 停止。a[1..6] 的和 = ${acc}，只加了 ${count} 個格子。最多加 log n 個。`,
    updateIntro: "單點更新 update(3, +2)：從 i = 3 開始，每次 tree[i] += 2，然後 i += lowbit(i)，跳到下一個「也負責 a[3]」的格子。",
    updateStep: (i: number, b: string, v: number, lb: number, next: number) =>
      `i = ${i} (${b})，tree[${i}] 加 2 變成 ${v}。i += lowbit = ${lb} → ${next}。`,
    updateEnd: (count: number, total: number) =>
      `超出 n 停止。改了 ${count} 個格子，O(log n)。現在再算 prefix(6) 會是 ${total}。`,
    caption: "索引從 1 開始",
    rangesLabel: "每個 tree[i] 負責的區間（長度 = lowbit(i)）",
    covers: (i: number, from: number) => `tree[${i}] 負責 a[${from}..${i}]`,
    indexLabel: "索引 i",
    arrayLabel: "原陣列 a[i]",
    runningTotal: (acc: number) => ` · 累計 ${acc}`,
  },
  {
    en: {
      build: "The range that tree[i] covers is lowbit(i) long — the value of the rightmost 1 bit in i. tree[6] = 0110 covers 2 entries, a[5..6], while tree[8] = 1000 covers 8 entries, a[1..8].",
      prefixIntro: "Prefix sum prefix(6): start at i = 6, add tree[i] each time, then do i −= lowbit(i), which strips off the rightmost 1 bit.",
      prefixStep: (i: number, b: string, v: number, from: number, acc: number, lb: number, next: number) =>
        `i = ${i} (${b}): add tree[${i}] = ${v}, which covers a[${from}..${i}], bringing the running total to ${acc}. Then i −= lowbit = ${lb} → ${next}.`,
      prefixEnd: (acc: number, count: number) =>
        `i has reached 0, so we stop. The sum of a[1..6] is ${acc} and it took only ${count} cells. At most log n cells are ever added.`,
      updateIntro: "Point update update(3, +2): start at i = 3, do tree[i] += 2 each time, then i += lowbit(i) to jump to the next cell that also covers a[3].",
      updateStep: (i: number, b: string, v: number, lb: number, next: number) =>
        `i = ${i} (${b}): tree[${i}] gains 2 and becomes ${v}. Then i += lowbit = ${lb} → ${next}.`,
      updateEnd: (count: number, total: number) =>
        `i has passed n, so we stop. ${count} cells changed, which is O(log n). Recomputing prefix(6) now gives ${total}.`,
      caption: "indices start at 1",
      rangesLabel: "The range each tree[i] covers (length = lowbit(i))",
      covers: (i: number, from: number) => `tree[${i}] covers a[${from}..${i}]`,
      indexLabel: "Index i",
      arrayLabel: "Original array a[i]",
      runningTotal: (acc: number) => ` · running total ${acc}`,
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

function buildBIT(a: number[]) {
  const t = new Array(a.length).fill(0);
  for (let i = 1; i <= N; i++) { t[i] += a[i]; const j = i + lowbit(i); if (j <= N) t[j] += t[i]; }
  return t;
}

interface Step { desc: string; op: string; arr: number[]; tree: number[]; i: number | null; touched: number[]; acc?: number }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const arr = [...ARR];
  let tree = buildBIT(arr);
  const touched: number[] = [];
  const snap = (desc: string, op: string, i: number | null, acc?: number) => steps.push({ desc, op, arr: [...arr], tree: [...tree], i, touched: [...touched], acc });

  snap(t.build, "build", null);

  // prefix(6)
  let i = 6, acc = 0; touched.length = 0;
  snap(t.prefixIntro, "prefix(6)", i, 0);
  while (i > 0) {
    acc += tree[i]; touched.push(i);
    snap(t.prefixStep(i, bin(i), tree[i], i - lowbit(i) + 1, acc, lowbit(i), i - lowbit(i)), "prefix(6)", i, acc);
    i -= lowbit(i);
  }
  snap(t.prefixEnd(acc, touched.length), "prefix(6)", null, acc);

  // update(3, +2)
  touched.length = 0;
  i = 3; const delta = 2; arr[3] += delta;
  snap(t.updateIntro, "update(3, +2)", i);
  while (i <= N) {
    tree[i] += delta; touched.push(i);
    snap(t.updateStep(i, bin(i), tree[i], lowbit(i), i + lowbit(i)), "update(3, +2)", i);
    i += lowbit(i);
  }
  snap(t.updateEnd(touched.length, acc + delta), "update(3, +2)", null);
  tree = buildBIT(arr);
  return steps;
}

export function FenwickDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const idx = Array.from({ length: N }, (_, j) => j + 1);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.caption} />
      <div className="px-3.5 pt-3.5">
        <div className="eyebrow mb-1.5">{t.rangesLabel}</div>
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}>
          {idx.map((j) => {
            const len = lowbit(j), from = j - len + 1;
            const tone = s.i === j ? "bg-accent" : s.touched.includes(j) ? "bg-green" : "bg-line-strong";
            return <div key={j} className={`h-2 rounded-sm ${tone}`} style={{ gridColumn: `${from} / span ${len}` }} title={t.covers(j, from)} />;
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 px-3.5 py-3 md:grid-cols-3">
        <div>
          <div className="eyebrow mb-1.5">{t.indexLabel}</div>
          <Cells items={idx} tone={(j) => (s.i === j + 1 ? CELL.accent : s.touched.includes(j + 1) ? CELL.green : "")} w="w-8" />
        </div>
        <div>
          <div className="eyebrow mb-1.5">{t.arrayLabel}</div>
          <Cells items={s.arr.slice(1)} tone={(j) => (s.op.startsWith("update") && j + 1 === 3 ? CELL.amber : "")} w="w-8" />
        </div>
        <div>
          <div className="eyebrow mb-1.5">tree[i]</div>
          <Cells items={s.tree.slice(1)} tone={(j) => (s.i === j + 1 ? CELL.accent : s.touched.includes(j + 1) ? CELL.green : "")} w="w-8" />
        </div>
      </div>
      {s.i !== null && (
        <div className="border-t border-line px-3.5 py-2 font-mono text-[12.5px] text-ink-2">
          i = {s.i} = {bin(s.i)}₂ · lowbit(i) = i &amp; −i = {lowbit(s.i)}{s.acc !== undefined && t.runningTotal(s.acc)}
        </div>
      )}
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
