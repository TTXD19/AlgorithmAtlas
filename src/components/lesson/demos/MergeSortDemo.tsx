"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, CELL } from "./StepBar";

const ARR = [5, 2, 9, 1, 7, 3, 8, 4];
const DEPTHS = 4; // 8 → 4 → 2 → 1

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

function buildSteps(): Step[] {
  const n = ARR.length;
  const rows: Row[] = Array.from({ length: DEPTHS }, (_, d) => (d === 0 ? [...ARR] : new Array<number | null>(n).fill(null)));
  const done: Step["done"] = [];
  const steps: Step[] = [];
  const snap = (desc: string, op: string, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, rows: rows.map((r) => [...r]), done: [...done], ...extra });

  snap("合併排序分兩個階段：先一路切半直到每段只有一個元素（一個元素天生有序），再把相鄰兩段合併回去。", "開始");

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
    snap(`切半：索引 [${lo}..${hi - 1}] 分成 [${lo}..${mid - 1}] 和 [${mid}..${hi - 1}]，往下一層，各自遞迴排序。`, `split(${lo}, ${hi - 1})`, { focus: { depth: depth + 1, lo, hi } });
    sort(depth + 1, lo, mid);
    sort(depth + 1, mid, hi);
    // 合併
    const label = `merge(${lo}, ${mid - 1} | ${mid}, ${hi - 1})`;
    let i = lo;
    let j = mid;
    let k = lo;
    const child = rows[depth + 1];
    snap(`合併：左段 [${child.slice(lo, mid).join(", ")}] 和右段 [${child.slice(mid, hi).join(", ")}] 都已有序。兩個指標各指段首，每次挑較小的放上去。`, label, { focus: { depth, lo, hi }, ptr: { i, j } });
    while (i < mid && j < hi) {
      const L = child[i] as number;
      const R = child[j] as number;
      if (L <= R) {
        rows[depth][k] = L;
        child[i] = null;
        i++;
        snap(`比較 ${L} 和 ${R}：${L} 較小（相等時取左邊，保持穩定），放到輸出，左指標右移。`, label, { focus: { depth, lo, hi }, ptr: { i, j }, placed: [k] });
      } else {
        rows[depth][k] = R;
        child[j] = null;
        j++;
        snap(`比較 ${L} 和 ${R}：${R} 較小，放到輸出，右指標右移。`, label, { focus: { depth, lo, hi }, ptr: { i, j }, placed: [k] });
      }
      k++;
    }
    const rest: number[] = [];
    const placed: number[] = [];
    while (i < mid) { rest.push(child[i] as number); rows[depth][k] = child[i]; child[i] = null; placed.push(k); i++; k++; }
    while (j < hi) { rest.push(child[j] as number); rows[depth][k] = child[j]; child[j] = null; placed.push(k); j++; k++; }
    done.push({ depth, lo, hi });
    snap(`一邊用完了，另一邊剩下的 [${rest.join(", ")}] 本來就有序，直接整段搬上去。[${lo}..${hi - 1}] 合併完成：[${rows[depth].slice(lo, hi).join(", ")}]。`, label, { focus: { depth, lo, hi }, placed });
  };
  sort(0, 0, n);
  snap("排序完成。每一層合併總共處理 n 個元素，共 log₂n 層，所以是 O(n log n)。合併需要一塊 O(n) 的暫存空間。", "結束");
  return steps;
}

export function MergeSortDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const n = ARR.length;

  const tone = (depth: number, idx: number, v: number | null) => {
    if (v === null) return "border-dashed border-line bg-surface-2 text-ink-3";
    if (s.placed && s.focus && s.focus.depth === depth && s.placed.includes(idx)) return CELL.accent;
    if (s.ptr && s.focus && depth === s.focus.depth + 1 && (idx === s.ptr.i || idx === s.ptr.j)) return CELL.amber;
    if (s.done.some((d) => d.depth === depth && idx >= d.lo && idx < d.hi)) return CELL.green;
    return "border-line-strong bg-surface";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`[${ARR.join(", ")}] · 由小到大`} />
      <div className="p-3.5">
        <div className="eyebrow mb-2">遞迴的每一層（上：整段，下：切到只剩一個）</div>
        <div className="flex flex-col gap-1.5">
          {s.rows.map((row, depth) => {
            const seg = n >> depth;
            return (
              <div key={depth} className="flex items-center gap-2">
                <span className="w-10 shrink-0 font-mono text-[11px] text-ink-3">層 {depth}</span>
                <div className="flex flex-wrap gap-1">
                  {row.map((v, idx) => (
                    <span
                      key={idx}
                      className={`grid h-8 w-9 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${tone(depth, idx, v)}`}
                      style={{ marginLeft: idx > 0 && idx % seg === 0 ? 10 : 0 }}
                    >
                      {v ?? "·"}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-[12px] text-ink-3">黃色是合併時左右兩段的指標，藍色是剛放進輸出的位置，綠色是已排好的區段</div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
