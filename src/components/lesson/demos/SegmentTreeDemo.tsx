"use client";

import { useMemo, useState } from "react";
import { BinaryTreeSVG, type BNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const ARR = [5, 3, 8, 6, 2, 7, 4, 1];

interface SNode extends BNode { lo: number; hi: number; sum: number; l?: SNode | null; r?: SNode | null }

function build(a: number[], lo: number, hi: number): SNode {
  if (lo === hi) return { v: a[lo], lo, hi, sum: a[lo] };
  const mid = (lo + hi) >> 1;
  const l = build(a, lo, mid), r = build(a, mid + 1, hi);
  return { v: l.sum + r.sum, lo, hi, sum: l.sum + r.sum, l, r };
}
function cloneS(n: SNode): SNode { return { ...n, l: n.l ? cloneS(n.l) : null, r: n.r ? cloneS(n.r) : null }; }

interface Step { desc: string; op: string; tree: SNode; arr: number[]; hot: string[]; taken: string[]; skipped: string[]; acc?: number }
const key = (n: SNode) => `${n.lo}-${n.hi}`;

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const arr = [...ARR];
  let root = build(arr, 0, arr.length - 1);
  const taken: string[] = [], skipped: string[] = [];
  const snap = (desc: string, op: string, hot: string[] = [], acc?: number) => steps.push({ desc, op, tree: cloneS(root), arr: [...arr], hot, taken: [...taken], skipped: [...skipped], acc });

  snap("每個節點負責一段區間，存那段的總和。葉節點就是原陣列，根是全部的總和。建樹 O(n)。", "build");

  // query(2, 5)
  const ql = 2, qh = 5; let acc = 0;
  const q = (n: SNode) => {
    if (n.hi < ql || n.lo > qh) { skipped.push(key(n)); snap(`[${n.lo}, ${n.hi}] 和 [${ql}, ${qh}] 完全不相交，跳過。`, `query(${ql}, ${qh})`, [key(n)], acc); return; }
    if (ql <= n.lo && n.hi <= qh) { acc += n.sum; taken.push(key(n)); snap(`[${n.lo}, ${n.hi}] 完全在 [${ql}, ${qh}] 裡，直接拿它的和 ${n.sum}，不必往下。累計 ${acc}。`, `query(${ql}, ${qh})`, [key(n)], acc); return; }
    snap(`[${n.lo}, ${n.hi}] 和 [${ql}, ${qh}] 部分重疊，往兩個子節點分下去。`, `query(${ql}, ${qh})`, [key(n)], acc);
    q(n.l!); q(n.r!);
  };
  q(root);
  snap(`區間和 [${ql}, ${qh}] = ${acc}。每一層最多只有兩個節點需要往下分，所以碰到的節點數是 O(log n)，不必逐一掃過區間裡的每個元素。`, `query(${ql}, ${qh})`, [], acc);

  // update(3, +4)
  taken.length = 0; skipped.length = 0;
  const ui = 3, delta = 4;
  arr[ui] += delta;
  const u = (n: SNode) => {
    n.sum += delta; n.v = n.sum;
    snap(`[${n.lo}, ${n.hi}] 包含索引 ${ui}，總和加 ${delta} 變成 ${n.sum}。`, `update(${ui}, +${delta})`, [key(n)]);
    if (n.lo === n.hi) return;
    const mid = (n.lo + n.hi) >> 1;
    u(ui <= mid ? n.l! : n.r!);
  };
  u(root);
  snap(`更新只走一條從根到葉的路徑，O(log n)。之後再 query 就是新的值。`, `update(${ui}, +${delta})`);
  root = build(arr, 0, arr.length - 1);
  return steps;
}

export function SegmentTreeDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right="區間和 · 查 [2, 5] → 把索引 3 加 4" />
      <BinaryTreeSVG
        root={s.tree}
        levelH={54} r={16}
        tone={(n) => { const kk = key(n as SNode); return s.hot.includes(kk) ? "accent" : s.taken.includes(kk) ? "green" : s.skipped.includes(kk) ? "dim" : "none"; }}
        sub={(n) => { const sn = n as SNode; return sn.lo === sn.hi ? `[${sn.lo}]` : `[${sn.lo},${sn.hi}]`; }}
      />
      <div className="flex flex-wrap items-center gap-4 border-t border-line px-3.5 py-2.5">
        <div>
          <div className="eyebrow mb-1">原陣列</div>
          <Cells items={s.arr} tone={(i) => (i >= 2 && i <= 5 && s.op.startsWith("query") ? CELL.amber : i === 3 && s.op.startsWith("update") ? CELL.accent : "")} w="w-8" />
        </div>
        {s.acc !== undefined && (
          <div>
            <div className="eyebrow mb-1">累計</div>
            <div className="font-mono text-[18px] font-medium tabular-nums">{s.acc}</div>
          </div>
        )}
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
