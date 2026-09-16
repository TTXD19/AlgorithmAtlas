"use client";

import { useMemo, useState } from "react";
import { BinaryTreeSVG, type BNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const ARR = [5, 3, 8, 6, 2, 7, 4, 1];

const TEXT = demoText(
  {
    build: "每個節點負責一段區間，存那段的總和。葉節點就是原陣列，根是全部的總和。建樹 O(n)。",
    disjoint: (lo: number, hi: number, ql: number, qh: number) => `[${lo}, ${hi}] 和 [${ql}, ${qh}] 完全不相交，跳過。`,
    inside: (lo: number, hi: number, ql: number, qh: number, sum: number, acc: number) =>
      `[${lo}, ${hi}] 完全在 [${ql}, ${qh}] 裡，直接拿它的和 ${sum}，不必往下。累計 ${acc}。`,
    partial: (lo: number, hi: number, ql: number, qh: number) => `[${lo}, ${hi}] 和 [${ql}, ${qh}] 部分重疊，往兩個子節點分下去。`,
    queryDone: (ql: number, qh: number, acc: number) =>
      `區間和 [${ql}, ${qh}] = ${acc}。每一層最多只有兩個節點需要往下分，所以碰到的節點數是 O(log n)，不必逐一掃過區間裡的每個元素。`,
    updateNode: (lo: number, hi: number, i: number, delta: number, sum: number) => `[${lo}, ${hi}] 包含索引 ${i}，總和加 ${delta} 變成 ${sum}。`,
    updateDone: "更新只走一條從根到葉的路徑，O(log n)。之後再 query 就是新的值。",
    headerNote: "區間和 · 查 [2, 5] → 把索引 3 加 4",
    arrLabel: "原陣列",
    accLabel: "累計",
  },
  {
    en: {
      build: "Each node owns one range and stores the sum over that range. The leaves are the original array and the root holds the total. Building the tree costs O(n).",
      disjoint: (lo: number, hi: number, ql: number, qh: number) => `[${lo}, ${hi}] and [${ql}, ${qh}] do not overlap at all, so this branch is skipped.`,
      inside: (lo: number, hi: number, ql: number, qh: number, sum: number, acc: number) =>
        `[${lo}, ${hi}] lies entirely inside [${ql}, ${qh}], so take its sum of ${sum} and stop there — going deeper would add nothing. Running total: ${acc}.`,
      partial: (lo: number, hi: number, ql: number, qh: number) => `[${lo}, ${hi}] and [${ql}, ${qh}] overlap only partly, so the query splits into both children.`,
      queryDone: (ql: number, qh: number, acc: number) =>
        `The range sum over [${ql}, ${qh}] is ${acc}. At most two nodes per level ever have to be split, so a query touches O(log n) nodes rather than every element inside the range.`,
      updateNode: (lo: number, hi: number, i: number, delta: number, sum: number) => `[${lo}, ${hi}] covers index ${i}, so its sum gains ${delta} and becomes ${sum}.`,
      updateDone: "An update walks a single path from the root down to one leaf, so it is O(log n). Every later query sees the new value.",
      headerNote: "Range sums: query [2, 5], then add 4 to index 3",
      arrLabel: "The original array",
      accLabel: "Running total",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

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

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const arr = [...ARR];
  let root = build(arr, 0, arr.length - 1);
  const taken: string[] = [], skipped: string[] = [];
  const snap = (desc: string, op: string, hot: string[] = [], acc?: number) => steps.push({ desc, op, tree: cloneS(root), arr: [...arr], hot, taken: [...taken], skipped: [...skipped], acc });

  snap(t.build, "build");

  // query(2, 5)
  const ql = 2, qh = 5; let acc = 0;
  const q = (n: SNode) => {
    if (n.hi < ql || n.lo > qh) { skipped.push(key(n)); snap(t.disjoint(n.lo, n.hi, ql, qh), `query(${ql}, ${qh})`, [key(n)], acc); return; }
    if (ql <= n.lo && n.hi <= qh) { acc += n.sum; taken.push(key(n)); snap(t.inside(n.lo, n.hi, ql, qh, n.sum, acc), `query(${ql}, ${qh})`, [key(n)], acc); return; }
    snap(t.partial(n.lo, n.hi, ql, qh), `query(${ql}, ${qh})`, [key(n)], acc);
    q(n.l!); q(n.r!);
  };
  q(root);
  snap(t.queryDone(ql, qh, acc), `query(${ql}, ${qh})`, [], acc);

  // update(3, +4)
  taken.length = 0; skipped.length = 0;
  const ui = 3, delta = 4;
  arr[ui] += delta;
  const u = (n: SNode) => {
    n.sum += delta; n.v = n.sum;
    snap(t.updateNode(n.lo, n.hi, ui, delta, n.sum), `update(${ui}, +${delta})`, [key(n)]);
    if (n.lo === n.hi) return;
    const mid = (n.lo + n.hi) >> 1;
    u(ui <= mid ? n.l! : n.r!);
  };
  u(root);
  snap(t.updateDone, `update(${ui}, +${delta})`);
  root = build(arr, 0, arr.length - 1);
  return steps;
}

export function SegmentTreeDemo() {
  const t = TEXT[useLocale()];
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.headerNote} />
      <BinaryTreeSVG
        root={s.tree}
        levelH={54} r={16}
        tone={(n) => { const kk = key(n as SNode); return s.hot.includes(kk) ? "accent" : s.taken.includes(kk) ? "green" : s.skipped.includes(kk) ? "dim" : "none"; }}
        sub={(n) => { const sn = n as SNode; return sn.lo === sn.hi ? `[${sn.lo}]` : `[${sn.lo},${sn.hi}]`; }}
      />
      <div className="flex flex-wrap items-center gap-4 border-t border-line px-3.5 py-2.5">
        <div>
          <div className="eyebrow mb-1">{t.arrLabel}</div>
          <Cells items={s.arr} tone={(i) => (i >= 2 && i <= 5 && s.op.startsWith("query") ? CELL.amber : i === 3 && s.op.startsWith("update") ? CELL.accent : "")} w="w-8" />
        </div>
        {s.acc !== undefined && (
          <div>
            <div className="eyebrow mb-1">{t.accLabel}</div>
            <div className="font-mono text-[18px] font-medium tabular-nums">{s.acc}</div>
          </div>
        )}
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
