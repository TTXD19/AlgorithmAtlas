"use client";

import { useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const TEXT = demoText(
  {
    mergeSort: "合併排序",
    binarySearch: "二分搜尋",
    karatsuba: "Karatsuba 乘法",
    naiveBigNum: "樸素大數乘法",
    strassen: "Strassen 矩陣乘",
    naiveMatrix: "樸素矩陣乘（分塊）",
    halveMergeSq: "切半但合併花 n²",
    case1: (ratio: string) =>
      `a/b^d = ${ratio} > 1：每往下一層工作量就乘 ${ratio}，最底層（葉子）壓倒一切。葉子有 n^(log_b a) 個，答案就是葉子數。`,
    case2: (d: number) => `a/b^d = 1：每一層工作量都一樣是 n^${d}，總共 log_b n 層，所以答案是 n^${d} × log n。`,
    case3: (ratio: string) =>
      `a/b^d = ${ratio} < 1：每往下一層工作量就乘 ${ratio}，等比遞減，根那一層就占了大半。答案是 f(n) 本身。`,
    presetsLabel: "常見演算法",
    knobA: "a：切成幾個子問題",
    knobB: "b：每個子問題縮小幾倍",
    knobD: "d：切與合併的成本 n^d",
    recurrence: "遞迴式",
    leaves: "葉子數",
    rootWork: "根的工作",
    compare: "比較",
    caseLabel: (n: number) => `情況 ${n}`,
    presetTag: (name: string) => `・${name}`,
    treeTitle: (n: string) => `遞迴樹每層的工作量（n = ${n}）`,
    levelLead: "第 i 層有 ",
    levelMid: " 個子問題，每個大小 n/",
    levelTail: "，工作量 = ",
    colLevel: "層",
    colNodes: "子問題數 × 大小",
    colWork: "工作量",
    leafRow: (i: number) => `${i}（葉）`,
    total: "總和",
    rootShare: "根那層占",
    leafShare: "葉子那層占",
    comma: "，",
  },
  {
    en: {
      mergeSort: "Merge sort",
      binarySearch: "Binary search",
      karatsuba: "Karatsuba multiplication",
      naiveBigNum: "Naive big-number multiplication",
      strassen: "Strassen matrix multiply",
      naiveMatrix: "Naive block matrix multiply",
      halveMergeSq: "Halve, but merging costs n²",
      case1: (ratio: string) =>
        `a/b^d = ${ratio} > 1: every level down multiplies the work by ${ratio}, so the bottom level — the leaves — overwhelms everything else. There are n^(log_b a) leaves, and that count is the answer.`,
      case2: (d: number) => `a/b^d = 1: every level does the same amount of work, n^${d}, and there are log_b n levels, so the answer is n^${d} × log n.`,
      case3: (ratio: string) =>
        `a/b^d = ${ratio} < 1: every level down multiplies the work by ${ratio}, a geometric decay, so the root level alone accounts for most of the total. The answer is f(n) itself.`,
      presetsLabel: "Common algorithms",
      knobA: "a: how many subproblems",
      knobB: "b: how many times smaller each subproblem is",
      knobD: "d: cost of splitting and merging, n^d",
      recurrence: "Recurrence",
      leaves: "Leaf count",
      rootWork: "Work at the root",
      compare: "Comparison",
      caseLabel: (n: number) => `Case ${n}`,
      presetTag: (name: string) => ` · ${name}`,
      treeTitle: (n: string) => `Work per level of the recursion tree (n = ${n})`,
      levelLead: "Level i has ",
      levelMid: " subproblems, each of size n/",
      levelTail: ", so the work is ",
      colLevel: "Level",
      colNodes: "Subproblems × size",
      colWork: "Work",
      leafRow: (i: number) => `${i} (leaves)`,
      total: "Total",
      rootShare: "The root level accounts for",
      leafShare: "The leaf level accounts for",
      comma: ", ",
    },
  },
);

type Dict = (typeof TEXT)["zh-Hant"];

/** 常見分治演算法的 (a, b, d)：T(n) = a·T(n/b) + Θ(n^d) */
const presets = (t: Dict): { name: string; a: number; b: number; d: number }[] => [
  { name: t.mergeSort, a: 2, b: 2, d: 1 },
  { name: t.binarySearch, a: 1, b: 2, d: 0 },
  { name: t.karatsuba, a: 3, b: 2, d: 1 },
  { name: t.naiveBigNum, a: 4, b: 2, d: 1 },
  { name: t.strassen, a: 7, b: 2, d: 2 },
  { name: t.naiveMatrix, a: 8, b: 2, d: 2 },
  { name: t.halveMergeSq, a: 2, b: 2, d: 2 },
];
const A_OPTS = [1, 2, 3, 4, 7, 8];
const B_OPTS = [2, 3, 4];
const D_OPTS = [0, 1, 2, 3];

const SUP = ["⁰", "¹", "²", "³"];
/** n^d 的顯示：n⁰ 省略、n¹ 寫 n */
function nPow(d: number) { return d === 0 ? "1" : d === 1 ? "n" : `n${SUP[d]}`; }
function fmt(x: number) { return x >= 1e6 ? x.toExponential(2).replace("e+", "×10^") : Math.round(x).toLocaleString("en-US"); }

const SMALL = "h-[28px] cursor-pointer rounded-md border px-2.5 font-mono text-[12.5px]";
const ON = "border-accent bg-accent text-accent-ink";
const OFF = "border-line bg-surface hover:bg-surface-2";

export function MasterTheoremDemo() {
  const t = TEXT[useLocale()];
  const PRESETS = presets(t);
  const [a, setA] = useState(2);
  const [b, setB] = useState(2);
  const [d, setD] = useState(1);

  const logba = Math.log(a) / Math.log(b);
  const isInt = Math.abs(logba - Math.round(logba)) < 1e-9;
  const expStr = isInt ? String(Math.round(logba)) : logba.toFixed(2);
  const ratio = a / Math.pow(b, d);
  const kase: 1 | 2 | 3 = Math.abs(ratio - 1) < 1e-9 ? 2 : ratio > 1 ? 1 : 3;
  const preset = PRESETS.find((p) => p.a === a && p.b === b && p.d === d);

  // 用具體的 n（b 的整數次方，約 1000）畫遞迴樹每層的工作量
  const depth = Math.round(Math.log(1000) / Math.log(b));
  const n = Math.pow(b, depth);
  const levels = Array.from({ length: depth + 1 }, (_, i) => {
    const nodes = Math.pow(a, i);
    const size = n / Math.pow(b, i);
    return { i, nodes, size, work: nodes * Math.pow(size, d) };
  });
  const total = levels.reduce((s, l) => s + l.work, 0);
  const maxWork = Math.max(...levels.map((l) => l.work));
  const rootPct = (levels[0].work / total) * 100;
  const leafPct = (levels[depth].work / total) * 100;

  const result =
    kase === 1 ? <>Θ(n<sup>{expStr}</sup>)</>
      : kase === 2 ? <>Θ({d === 0 ? "" : nPow(d) + " "}log n)</>
        : <>Θ({nPow(d)})</>;
  const caseText = {
    1: t.case1(ratio.toFixed(2)),
    2: t.case2(d),
    3: t.case3(ratio.toFixed(2)),
  }[kase];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span className="mr-1">{t.presetsLabel}</span>
        {PRESETS.map((p) => (
          <button key={p.name} type="button" onClick={() => { setA(p.a); setB(p.b); setD(p.d); }}
            className={`h-[28px] cursor-pointer rounded-md border px-2.5 text-[12.5px] ${preset?.name === p.name ? ON : OFF}`}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-line px-3.5 py-3 md:grid-cols-3">
        {[
          { label: t.knobA, opts: A_OPTS, v: a, set: setA },
          { label: t.knobB, opts: B_OPTS, v: b, set: setB },
          { label: t.knobD, opts: D_OPTS, v: d, set: setD },
        ].map((row) => (
          <div key={row.label}>
            <div className="eyebrow mb-1.5">{row.label}</div>
            <div className="flex flex-wrap gap-1">
              {row.opts.map((o) => (
                <button key={o} type="button" onClick={() => row.set(o)} className={`${SMALL} ${row.v === o ? ON : OFF}`}>{o}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3.5 border-b border-line px-3.5 py-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-1.5">{t.recurrence}</div>
          <div className="font-mono text-[15px]">T(n) = {a === 1 ? "" : `${a}·`}T(n/{b}) + Θ({nPow(d)})</div>
          <div className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
            <span className="text-ink-3">{t.leaves}</span>
            <span className="font-mono">n<sup>log<sub>{b}</sub> {a}</sup> = n<sup>{expStr}</sup></span>
            <span className="text-ink-3">{t.rootWork}</span>
            <span className="font-mono">f(n) = n<sup>{d}</sup>{d === 0 ? " = 1" : ""}</span>
            <span className="text-ink-3">{t.compare}</span>
            <span className="font-mono">
              log<sub>{b}</sub> {a} = {expStr} <span className="mx-1 font-semibold text-accent">{kase === 1 ? ">" : kase === 2 ? "=" : "<"}</span> d = {d}
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-accent-soft px-3.5 py-2.5">
          <div className="eyebrow mb-1">{t.caseLabel(kase)}{preset ? t.presetTag(preset.name) : ""}</div>
          <div className="font-mono text-[17px] font-semibold text-ink">T(n) = {result}</div>
          <p className="m-0 mt-1.5 text-[13px] text-ink-2">{caseText}</p>
        </div>
      </div>

      <div className="px-3.5 py-3">
        <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3">
          <span className="eyebrow">{t.treeTitle(n.toLocaleString("en-US"))}</span>
          <span className="text-[12px] text-ink-3">{t.levelLead}{a}<sup>i</sup>{t.levelMid}{b}<sup>i</sup>{t.levelTail}{nPow(d)} × ({a}/{b}<sup>{d}</sup>)<sup>i</sup> = {nPow(d)} × {ratio.toFixed(2)}<sup>i</sup></span>
        </div>
        <div className="grid grid-cols-[72px_minmax(0,1fr)_96px] items-center gap-x-3 text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
          <span>{t.colLevel}</span><span>{t.colNodes}</span><span className="text-right">{t.colWork}</span>
        </div>
        {levels.map((l) => {
          const w = (l.work / maxWork) * 100;
          const tone = (kase === 1 && l.i === depth) || (kase === 3 && l.i === 0) || kase === 2 ? "bg-accent" : "bg-line-strong";
          return (
            <div key={l.i} className="grid grid-cols-[72px_minmax(0,1fr)_96px] items-center gap-x-3 border-t border-line py-1 text-[12.5px]">
              <span className="font-mono text-ink-2">{l.i === depth ? t.leafRow(l.i) : l.i}</span>
              <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                <div className="h-2.5 w-full min-w-0 overflow-hidden rounded-sm bg-surface-2 sm:flex-1">
                  <i className={`block h-full rounded-sm ${tone}`} style={{ width: `${Math.max(0.8, w)}%` }} />
                </div>
                <span className="shrink-0 font-mono text-[11.5px] text-ink-3 tabular-nums sm:w-[150px]">{fmt(l.nodes)} × {fmt(l.size)}{d >= 2 ? SUP[d] : ""}</span>
              </div>
              <span className="text-right font-mono text-[12px] tabular-nums">{fmt(l.work)}</span>
            </div>
          );
        })}
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-2 text-[12.5px] text-ink-2">
          <span>{t.total} <span className="font-mono">{fmt(total)}</span></span>
          <span>{t.rootShare} <span className="font-mono">{rootPct.toFixed(1)}%</span></span>
          <span>{t.leafShare} <span className="font-mono">{leafPct.toFixed(1)}%</span></span>
          <span>{nPow(d)} = <span className="font-mono">{fmt(Math.pow(n, d))}</span>{t.comma}n log n = <span className="font-mono">{fmt(n * Math.log2(n))}</span></span>
        </div>
      </div>
    </div>
  );
}
