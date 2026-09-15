"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, CELL } from "./StepBar";

/** 共用陣列再補兩個重複值，才看得出「穩定」是什麼意思。a、b 標記同值的先後。 */
const ITEMS: { v: number; tag: string }[] = [
  { v: 5, tag: "5ᵃ" }, { v: 2, tag: "2ᵃ" }, { v: 9, tag: "9" }, { v: 1, tag: "1" }, { v: 7, tag: "7" },
  { v: 3, tag: "3" }, { v: 8, tag: "8" }, { v: 4, tag: "4" }, { v: 2, tag: "2ᵇ" }, { v: 5, tag: "5ᵇ" },
];
const K = 10; // 值域 0..9

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

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const count = new Array<number>(K).fill(0);
  const out = new Array<string | null>(ITEMS.length).fill(null);
  const snap = (desc: string, op: string, phase: Step["phase"], extra: Partial<Step> = {}) =>
    steps.push({ desc, op, phase, count: [...count], out: [...out], ...extra });

  snap(`值域是 0..${K - 1}，開一個長度 ${K} 的 count 陣列，全部歸零。整個過程不做任何兩兩比較。`, "開始", "none");
  for (let i = 0; i < ITEMS.length; i++) {
    count[ITEMS[i].v]++;
    snap(`看到 ${ITEMS[i].tag}，count[${ITEMS[i].v}] 加一，變成 ${count[ITEMS[i].v]}。`, "階段 1：計數", "count", { i, c: ITEMS[i].v });
  }
  snap("計數完成。count[v] 是值 v 出現的次數。到這裡如果只要輸出數字，直接依序印出來就好，但那樣會丟掉原本的物件（穩定性）。", "階段 1 完成", "count");
  for (let c = 1; c < K; c++) {
    count[c] += count[c - 1];
    snap(`count[${c}] += count[${c - 1}]，變成 ${count[c]}。意思是「≤ ${c} 的元素有 ${count[c]} 個」，所以值 ${c} 的最後一個要放在索引 ${count[c] - 1}。`, "階段 2：前綴累加", "prefix", { c });
  }
  snap("前綴累加完成。現在 count[v] − 1 就是「值 v 最右邊那個」在輸出裡的位置。", "階段 2 完成", "prefix");
  for (let i = ITEMS.length - 1; i >= 0; i--) {
    const { v, tag } = ITEMS[i];
    count[v]--;
    out[count[v]] = tag;
    snap(`由後往前：拿 ${tag}，count[${v}] 減一變 ${count[v]}，放到 out[${count[v]}]。從後面拿、往後面放，同值的先後順序才不會反過來。`, "階段 3：放回", "place", { i, c: v, placed: count[v] });
  }
  snap(`排序完成，且 2ᵃ 仍在 2ᵇ 前面、5ᵃ 仍在 5ᵇ 前面，這就是穩定。時間 O(n + k)，n = ${ITEMS.length}、k = ${K}。`, "結束", "none");
  return steps;
}

export function CountingSortDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const cell = "grid h-8 w-9 place-items-center rounded-md border font-mono text-[13px] tabular-nums";
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right="共用陣列 + 兩個重複值 · 值域 0..9" />
      <div className="p-3.5">
        <div className="eyebrow mb-2">輸入</div>
        <div className="flex flex-wrap gap-1">
          {ITEMS.map((it, i) => (
            <span key={i} className={`${cell} ${i === s.i ? CELL.accent : s.phase === "place" && s.i !== undefined && i > s.i ? CELL.dim : "border-line-strong bg-surface"}`}>{it.tag}</span>
          ))}
        </div>
      </div>
      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-2">{s.phase === "count" || k === 0 ? "count（值 v 出現幾次）" : "count（前綴累加後：值 v 的下一個放置位置 + 1）"}</div>
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
        <div className="eyebrow mb-2">輸出</div>
        <div className="flex flex-wrap gap-1">
          {s.out.map((v, i) => (
            <span key={i} className={`${cell} ${i === s.placed ? CELL.accent : v === null ? "border-dashed border-line bg-surface-2 text-ink-3" : CELL.green}`}>{v ?? "·"}</span>
          ))}
        </div>
        <div className="mt-2 text-[12px] text-ink-3">藍色是正在處理的元素（輸出裡是剛放進去的位置），黃色是它對應的 count 格，綠色是已放好的輸出</div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
