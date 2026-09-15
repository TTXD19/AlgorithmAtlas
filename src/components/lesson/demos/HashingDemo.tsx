"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** 多項式雜湊：h[i+1] = (h[i] * B + val(s[i])) mod M，val(a)=1 … val(z)=26 */
const S = "abcabca";
const B = 31;
const M = 101;
const val = (c: string) => c.charCodeAt(0) - 96;

type Cmp = { l1: number; l2: number; len: number };
const CMPS: Cmp[] = [
  { l1: 0, l2: 3, len: 3 }, // abc vs abc
  { l1: 1, l2: 4, len: 3 }, // bca vs bca
  { l1: 0, l2: 1, len: 3 }, // abc vs bca
];

interface Step {
  desc: string;
  op: string;
  h: number[];
  pw: number[];
  i: number;          // 正在處理的字元
  cmp?: Cmp;          // 比較階段
  h1?: number;
  h2?: number;
  formula?: string;
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const n = S.length;
  const h: number[] = [0];
  const pw: number[] = [1];
  const snap = (desc: string, op: string, i: number, extra: Partial<Step> = {}) => steps.push({ desc, op, h: [...h], pw: [...pw], i, ...extra });

  snap(`把字串當成 ${B} 進位的數字，每個字元是一個「位數」（a=1、b=2、…）。h[0] = 0 代表空前綴，pw[0] = 1。所有運算都 mod ${M}，數字才不會爆掉。`, "開始", -1);
  for (let i = 0; i < n; i++) {
    const prev = h[i];
    const next = (prev * B + val(S[i])) % M;
    h.push(next);
    pw.push((pw[i] * B) % M);
    snap(
      `讀到 s[${i}] = '${S[i]}'（值 ${val(S[i])}）。h[${i + 1}] = (h[${i}] × ${B} + ${val(S[i])}) mod ${M} = (${prev} × ${B} + ${val(S[i])}) mod ${M} = ${next}。同時 pw[${i + 1}] = ${B}^${i + 1} mod ${M} = ${pw[i + 1]}。`,
      `h[${i + 1}]`,
      i,
      { formula: `h[${i + 1}] = (${prev} × ${B} + ${val(S[i])}) mod ${M} = ${next}` },
    );
  }
  snap(`前綴雜湊表建好了，O(n)。接下來任何一段 s[l, r) 的雜湊都能 O(1) 算出：hash(l, r) = (h[r] − h[l] × pw[r−l]) mod ${M}。把「前面 l 個字元的貢獻」乘到正確的位數後減掉，就只剩中間那段。`, "建表完成", n);

  for (const c of CMPS) {
    const sub = (l: number) => S.slice(l, l + c.len);
    const sh = (l: number) => (((h[l + c.len] - h[l] * pw[c.len]) % M) + M) % M;
    const h1 = sh(c.l1);
    const h2 = sh(c.l2);
    const op = `hash(${c.l1},${c.l1 + c.len}) vs hash(${c.l2},${c.l2 + c.len})`;
    snap(
      `比較「${sub(c.l1)}」（s[${c.l1}, ${c.l1 + c.len})）和「${sub(c.l2)}」（s[${c.l2}, ${c.l2 + c.len})）。第一段：(h[${c.l1 + c.len}] − h[${c.l1}] × pw[${c.len}]) mod ${M} = (${h[c.l1 + c.len]} − ${h[c.l1]} × ${pw[c.len]}) mod ${M} = ${h1}。`,
      op,
      n,
      { cmp: c, h1, formula: `hash(${c.l1},${c.l1 + c.len}) = (${h[c.l1 + c.len]} − ${h[c.l1]} × ${pw[c.len]}) mod ${M} = ${h1}` },
    );
    snap(
      `第二段：(h[${c.l2 + c.len}] − h[${c.l2}] × pw[${c.len}]) mod ${M} = (${h[c.l2 + c.len]} − ${h[c.l2]} × ${pw[c.len]}) mod ${M} = ${h2}。${h1 === h2 ? `兩個雜湊相等，「${sub(c.l1)}」和「${sub(c.l2)}」幾乎肯定相同（碰撞機率約 1/${M}，實務上 mod 用 10⁹ 級的質數或雙雜湊）。` : `雜湊不同，兩段一定不相等，不需要逐字元比。`}`,
      op,
      n,
      { cmp: c, h1, h2, formula: `hash(${c.l2},${c.l2 + c.len}) = (${h[c.l2 + c.len]} − ${h[c.l2]} × ${pw[c.len]}) mod ${M} = ${h2}` },
    );
  }
  snap(`三次子字串比較，每次都只做兩次乘法和減法，O(1)。建表 O(n) 之後，任意兩段的比較不再需要逐字元掃。`, "結束", n);
  return steps;
}

export function HashingDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const n = S.length;
  const inSeg = (idx: number, l: number, len: number) => idx >= l && idx < l + len;

  const charTone = (i: number) => {
    if (s.cmp) {
      if (inSeg(i, s.cmp.l1, s.cmp.len)) return CELL.amber;
      if (s.h2 !== undefined && inSeg(i, s.cmp.l2, s.cmp.len)) return s.h1 === s.h2 ? CELL.green : CELL.accent;
      return CELL.dim;
    }
    if (i === s.i) return CELL.accent;
    if (i < s.i) return CELL.dim;
    return "";
  };
  const hTone = (j: number) => {
    if (s.cmp) {
      const c = s.cmp;
      const used = [c.l1, c.l1 + c.len, ...(s.h2 !== undefined ? [c.l2, c.l2 + c.len] : [])];
      return used.includes(j) ? CELL.amber : "";
    }
    if (j === s.i + 1) return CELL.accent;
    if (j > s.h.length - 1) return CELL.dim;
    return "";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`s = "${S}" · B = ${B} · M = ${M}`} />
      <div className="grid grid-cols-1 gap-3.5 p-3.5">
        <div>
          <div className="eyebrow mb-1.5">字串 s（索引 0 … {n - 1}）</div>
          <Cells items={S.split("")} tone={charTone} />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="eyebrow mb-1.5">前綴雜湊 h[0 … {n}]</div>
            <Cells items={Array.from({ length: n + 1 }, (_, j) => (j < s.h.length ? s.h[j] : "·"))} tone={hTone} w="w-10" />
          </div>
          <div>
            <div className="eyebrow mb-1.5">次方表 pw[i] = {B}^i mod {M}</div>
            <Cells items={Array.from({ length: n + 1 }, (_, j) => (j < s.pw.length ? s.pw[j] : "·"))} tone={(j) => (s.cmp ? (j === s.cmp.len ? CELL.amber : "") : j === s.i + 1 ? CELL.accent : j > s.pw.length - 1 ? CELL.dim : "")} w="w-10" />
          </div>
        </div>
        {s.formula && (
          <div className="rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-[12.5px] text-ink">{s.formula}</div>
        )}
        {s.cmp && s.h2 !== undefined && (
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="rounded-md border border-amber bg-amber-soft px-2 py-0.5 font-mono text-amber">「{S.slice(s.cmp.l1, s.cmp.l1 + s.cmp.len)}」 → {s.h1}</span>
            <span className="text-ink-3">{s.h1 === s.h2 ? "=" : "≠"}</span>
            <span className={`rounded-md border px-2 py-0.5 font-mono ${s.h1 === s.h2 ? "border-green bg-green-soft text-green" : "border-accent bg-accent text-accent-ink"}`}>「{S.slice(s.cmp.l2, s.cmp.l2 + s.cmp.len)}」 → {s.h2}</span>
            <span className="text-ink-3">{s.h1 === s.h2 ? "雜湊相同，視為相等" : "雜湊不同，一定不等"}</span>
          </div>
        )}
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
