"use client";

import { useState } from "react";

/** 常見分治演算法的 (a, b, d)：T(n) = a·T(n/b) + Θ(n^d) */
const PRESETS: { name: string; a: number; b: number; d: number }[] = [
  { name: "合併排序", a: 2, b: 2, d: 1 },
  { name: "二分搜尋", a: 1, b: 2, d: 0 },
  { name: "Karatsuba 乘法", a: 3, b: 2, d: 1 },
  { name: "樸素大數乘法", a: 4, b: 2, d: 1 },
  { name: "Strassen 矩陣乘", a: 7, b: 2, d: 2 },
  { name: "樸素矩陣乘（分塊）", a: 8, b: 2, d: 2 },
  { name: "切半但合併花 n²", a: 2, b: 2, d: 2 },
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
    1: `a/b^d = ${ratio.toFixed(2)} > 1：每往下一層工作量就乘 ${ratio.toFixed(2)}，最底層（葉子）壓倒一切。葉子有 n^(log_b a) 個，答案就是葉子數。`,
    2: `a/b^d = 1：每一層工作量都一樣是 n^${d}，總共 log_b n 層，所以答案是 n^${d} × log n。`,
    3: `a/b^d = ${ratio.toFixed(2)} < 1：每往下一層工作量就乘 ${ratio.toFixed(2)}，等比遞減，根那一層就占了大半。答案是 f(n) 本身。`,
  }[kase];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span className="mr-1">常見演算法</span>
        {PRESETS.map((p) => (
          <button key={p.name} type="button" onClick={() => { setA(p.a); setB(p.b); setD(p.d); }}
            className={`h-[28px] cursor-pointer rounded-md border px-2.5 text-[12.5px] ${preset?.name === p.name ? ON : OFF}`}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-line px-3.5 py-3 md:grid-cols-3">
        {[
          { label: "a：切成幾個子問題", opts: A_OPTS, v: a, set: setA },
          { label: "b：每個子問題縮小幾倍", opts: B_OPTS, v: b, set: setB },
          { label: "d：切與合併的成本 n^d", opts: D_OPTS, v: d, set: setD },
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
          <div className="eyebrow mb-1.5">遞迴式</div>
          <div className="font-mono text-[15px]">T(n) = {a === 1 ? "" : `${a}·`}T(n/{b}) + Θ({nPow(d)})</div>
          <div className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
            <span className="text-ink-3">葉子數</span>
            <span className="font-mono">n<sup>log<sub>{b}</sub> {a}</sup> = n<sup>{expStr}</sup></span>
            <span className="text-ink-3">根的工作</span>
            <span className="font-mono">f(n) = n<sup>{d}</sup>{d === 0 ? " = 1" : ""}</span>
            <span className="text-ink-3">比較</span>
            <span className="font-mono">
              log<sub>{b}</sub> {a} = {expStr} <span className="mx-1 font-semibold text-accent">{kase === 1 ? ">" : kase === 2 ? "=" : "<"}</span> d = {d}
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-accent-soft px-3.5 py-2.5">
          <div className="eyebrow mb-1">情況 {kase}{preset ? `・${preset.name}` : ""}</div>
          <div className="font-mono text-[17px] font-semibold text-ink">T(n) = {result}</div>
          <p className="m-0 mt-1.5 text-[13px] text-ink-2">{caseText}</p>
        </div>
      </div>

      <div className="px-3.5 py-3">
        <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3">
          <span className="eyebrow">遞迴樹每層的工作量（n = {n.toLocaleString("en-US")}）</span>
          <span className="text-[12px] text-ink-3">第 i 層有 {a}<sup>i</sup> 個子問題，每個大小 n/{b}<sup>i</sup>，工作量 = {nPow(d)} × ({a}/{b}<sup>{d}</sup>)<sup>i</sup> = {nPow(d)} × {ratio.toFixed(2)}<sup>i</sup></span>
        </div>
        <div className="grid grid-cols-[72px_minmax(0,1fr)_96px] items-center gap-x-3 text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
          <span>層</span><span>子問題數 × 大小</span><span className="text-right">工作量</span>
        </div>
        {levels.map((l) => {
          const w = (l.work / maxWork) * 100;
          const tone = (kase === 1 && l.i === depth) || (kase === 3 && l.i === 0) || kase === 2 ? "bg-accent" : "bg-line-strong";
          return (
            <div key={l.i} className="grid grid-cols-[72px_minmax(0,1fr)_96px] items-center gap-x-3 border-t border-line py-1 text-[12.5px]">
              <span className="font-mono text-ink-2">{l.i === depth ? `${l.i}（葉）` : l.i}</span>
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
          <span>總和 <span className="font-mono">{fmt(total)}</span></span>
          <span>根那層占 <span className="font-mono">{rootPct.toFixed(1)}%</span></span>
          <span>葉子那層占 <span className="font-mono">{leafPct.toFixed(1)}%</span></span>
          <span>{nPow(d)} = <span className="font-mono">{fmt(Math.pow(n, d))}</span>，n log n = <span className="font-mono">{fmt(n * Math.log2(n))}</span></span>
        </div>
      </div>
    </div>
  );
}
