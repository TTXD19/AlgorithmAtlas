"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

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

const TEXT = demoText(
  {
    intro: (b: number, m: number) =>
      `把字串當成 ${b} 進位的數字，每個字元是一個「位數」（a=1、b=2、…）。h[0] = 0 代表空前綴，pw[0] = 1。所有運算都 mod ${m}，數字才不會爆掉。`,
    opStart: "開始",
    opBuilt: "建表完成",
    opEnd: "結束",
    read: (i: number, ch: string, v: number, prev: number, b: number, m: number, next: number, pwNext: number) =>
      `讀到 s[${i}] = '${ch}'（值 ${v}）。h[${i + 1}] = (h[${i}] × ${b} + ${v}) mod ${m} = (${prev} × ${b} + ${v}) mod ${m} = ${next}。同時 pw[${i + 1}] = ${b}^${i + 1} mod ${m} = ${pwNext}。`,
    built: (m: number) =>
      `前綴雜湊表建好了，O(n)。接下來任何一段 s[l, r) 的雜湊都能 O(1) 算出：hash(l, r) = (h[r] − h[l] × pw[r−l]) mod ${m}。把「前面 l 個字元的貢獻」乘到正確的位數後減掉，就只剩中間那段。`,
    cmpFirst: (s1: string, l1: number, r1: number, s2: string, l2: number, r2: number, len: number, m: number, hr1: number, hl1: number, pwLen: number, h1: number) =>
      `比較「${s1}」（s[${l1}, ${r1})）和「${s2}」（s[${l2}, ${r2})）。第一段：(h[${r1}] − h[${l1}] × pw[${len}]) mod ${m} = (${hr1} − ${hl1} × ${pwLen}) mod ${m} = ${h1}。`,
    cmpSecond: (l2: number, r2: number, len: number, m: number, hr2: number, hl2: number, pwLen: number, h2: number, note: string) =>
      `第二段：(h[${r2}] − h[${l2}] × pw[${len}]) mod ${m} = (${hr2} − ${hl2} × ${pwLen}) mod ${m} = ${h2}。${note}`,
    noteEqual: (s1: string, s2: string, m: number) =>
      `兩個雜湊相等，「${s1}」和「${s2}」幾乎肯定相同（碰撞機率約 1/${m}，實務上 mod 用 10⁹ 級的質數或雙雜湊）。`,
    noteDiff: "雜湊不同，兩段一定不相等，不需要逐字元比。",
    done: "三次子字串比較，每次都只做兩次乘法和減法，O(1)。建表 O(n) 之後，任意兩段的比較不再需要逐字元掃。",
    stringLabel: (last: number) => `字串 s（索引 0 … ${last}）`,
    prefixLabel: (n: number) => `前綴雜湊 h[0 … ${n}]`,
    powLabel: (b: number, m: number) => `次方表 pw[i] = ${b}^i mod ${m}`,
    quoted: (s: string) => `「${s}」`,
    verdictSame: "雜湊相同，視為相等",
    verdictDiff: "雜湊不同，一定不等",
  },
  {
    en: {
      intro: (b: number, m: number) =>
        `Treat the string as a number written in base ${b}, with each character as one digit (a = 1, b = 2, and so on). h[0] = 0 stands for the empty prefix and pw[0] = 1. Every operation is taken mod ${m} so the numbers never blow up.`,
      opStart: "Start",
      opBuilt: "Table built",
      opEnd: "Done",
      read: (i: number, ch: string, v: number, prev: number, b: number, m: number, next: number, pwNext: number) =>
        `Read s[${i}] = '${ch}' (value ${v}). h[${i + 1}] = (h[${i}] × ${b} + ${v}) mod ${m} = (${prev} × ${b} + ${v}) mod ${m} = ${next}. At the same time pw[${i + 1}] = ${b}^${i + 1} mod ${m} = ${pwNext}.`,
      built: (m: number) =>
        `The prefix hash table is built, in O(n). From here the hash of any slice s[l, r) comes out in O(1): hash(l, r) = (h[r] − h[l] × pw[r−l]) mod ${m}. Shift the contribution of the first l characters up to the right digit position, subtract it, and only the middle slice is left.`,
      cmpFirst: (s1: string, l1: number, r1: number, s2: string, l2: number, r2: number, len: number, m: number, hr1: number, hl1: number, pwLen: number, h1: number) =>
        `Compare "${s1}" (s[${l1}, ${r1})) with "${s2}" (s[${l2}, ${r2})). The first slice: (h[${r1}] − h[${l1}] × pw[${len}]) mod ${m} = (${hr1} − ${hl1} × ${pwLen}) mod ${m} = ${h1}.`,
      cmpSecond: (l2: number, r2: number, len: number, m: number, hr2: number, hl2: number, pwLen: number, h2: number, note: string) =>
        `The second slice: (h[${r2}] − h[${l2}] × pw[${len}]) mod ${m} = (${hr2} − ${hl2} × ${pwLen}) mod ${m} = ${h2}. ${note}`,
      noteEqual: (s1: string, s2: string, m: number) =>
        `The two hashes match, so "${s1}" and "${s2}" are almost certainly the same string — the chance of a collision is roughly 1/${m}, and real code uses a prime around 10⁹ or a double hash.`,
      noteDiff: "The hashes differ, so the two slices cannot be equal and there is no need to compare them character by character.",
      done: "Three substring comparisons, each of them two multiplications and two subtractions: O(1). After the O(n) build, comparing any two slices never needs a character-by-character scan again.",
      stringLabel: (last: number) => `The string s (indices 0 … ${last})`,
      prefixLabel: (n: number) => `Prefix hashes h[0 … ${n}]`,
      powLabel: (b: number, m: number) => `Powers pw[i] = ${b}^i mod ${m}`,
      quoted: (s: string) => `"${s}"`,
      verdictSame: "Same hash, so treated as equal",
      verdictDiff: "Different hashes, so certainly not equal",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

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

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const n = S.length;
  const h: number[] = [0];
  const pw: number[] = [1];
  const snap = (desc: string, op: string, i: number, extra: Partial<Step> = {}) => steps.push({ desc, op, h: [...h], pw: [...pw], i, ...extra });

  snap(t.intro(B, M), t.opStart, -1);
  for (let i = 0; i < n; i++) {
    const prev = h[i];
    const next = (prev * B + val(S[i])) % M;
    h.push(next);
    pw.push((pw[i] * B) % M);
    snap(
      t.read(i, S[i], val(S[i]), prev, B, M, next, pw[i + 1]),
      `h[${i + 1}]`,
      i,
      { formula: `h[${i + 1}] = (${prev} × ${B} + ${val(S[i])}) mod ${M} = ${next}` },
    );
  }
  snap(t.built(M), t.opBuilt, n);

  for (const c of CMPS) {
    const sub = (l: number) => S.slice(l, l + c.len);
    const sh = (l: number) => (((h[l + c.len] - h[l] * pw[c.len]) % M) + M) % M;
    const h1 = sh(c.l1);
    const h2 = sh(c.l2);
    const op = `hash(${c.l1},${c.l1 + c.len}) vs hash(${c.l2},${c.l2 + c.len})`;
    snap(
      t.cmpFirst(sub(c.l1), c.l1, c.l1 + c.len, sub(c.l2), c.l2, c.l2 + c.len, c.len, M, h[c.l1 + c.len], h[c.l1], pw[c.len], h1),
      op,
      n,
      { cmp: c, h1, formula: `hash(${c.l1},${c.l1 + c.len}) = (${h[c.l1 + c.len]} − ${h[c.l1]} × ${pw[c.len]}) mod ${M} = ${h1}` },
    );
    snap(
      t.cmpSecond(c.l2, c.l2 + c.len, c.len, M, h[c.l2 + c.len], h[c.l2], pw[c.len], h2, h1 === h2 ? t.noteEqual(sub(c.l1), sub(c.l2), M) : t.noteDiff),
      op,
      n,
      { cmp: c, h1, h2, formula: `hash(${c.l2},${c.l2 + c.len}) = (${h[c.l2 + c.len]} − ${h[c.l2]} × ${pw[c.len]}) mod ${M} = ${h2}` },
    );
  }
  snap(t.done, t.opEnd, n);
  return steps;
}

export function HashingDemo() {
  const t = TEXT[useLocale()];
  const steps = useMemo(() => buildSteps(t), [t]);
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
          <div className="eyebrow mb-1.5">{t.stringLabel(n - 1)}</div>
          <Cells items={S.split("")} tone={charTone} />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="eyebrow mb-1.5">{t.prefixLabel(n)}</div>
            <Cells items={Array.from({ length: n + 1 }, (_, j) => (j < s.h.length ? s.h[j] : "·"))} tone={hTone} w="w-10" />
          </div>
          <div>
            <div className="eyebrow mb-1.5">{t.powLabel(B, M)}</div>
            <Cells items={Array.from({ length: n + 1 }, (_, j) => (j < s.pw.length ? s.pw[j] : "·"))} tone={(j) => (s.cmp ? (j === s.cmp.len ? CELL.amber : "") : j === s.i + 1 ? CELL.accent : j > s.pw.length - 1 ? CELL.dim : "")} w="w-10" />
          </div>
        </div>
        {s.formula && (
          <div className="rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-[12.5px] text-ink">{s.formula}</div>
        )}
        {s.cmp && s.h2 !== undefined && (
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="rounded-md border border-amber bg-amber-soft px-2 py-0.5 font-mono text-amber">{t.quoted(S.slice(s.cmp.l1, s.cmp.l1 + s.cmp.len))} → {s.h1}</span>
            <span className="text-ink-3">{s.h1 === s.h2 ? "=" : "≠"}</span>
            <span className={`rounded-md border px-2 py-0.5 font-mono ${s.h1 === s.h2 ? "border-green bg-green-soft text-green" : "border-accent bg-accent text-accent-ink"}`}>{t.quoted(S.slice(s.cmp.l2, s.cmp.l2 + s.cmp.len))} → {s.h2}</span>
            <span className="text-ink-3">{s.h1 === s.h2 ? t.verdictSame : t.verdictDiff}</span>
          </div>
        )}
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
