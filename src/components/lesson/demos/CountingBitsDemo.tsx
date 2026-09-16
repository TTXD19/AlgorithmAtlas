"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const N = 181; // 10110101，有 5 個 1
const W = 8;
const bin = (n: number) => n.toString(2).padStart(W, "0");
const lowbitIndex = (n: number) => (n === 0 ? -1 : Math.log2(n & -n));

const TEXT = demoText(
  {
    intro: (n: number, bits: string) =>
      `n = ${n} = ${bits}，要數它有幾個 1。先看 Brian Kernighan 的方法：每次 n & (n − 1) 恰好清掉最低位的 1，清幾次就有幾個 1。`,
    kStep: (bits: string, hot: number, count: number) =>
      `n − 1 = ${bits}：減 1 會把最低位的 1 借成 0、後面的 0 全變 1。再和 n 做 AND，第 ${hot} 位那個 1 就被清掉，更高的位完全不動。count = ${count}。`,
    kEnd: (iter: number) => `n 變成 0，迴圈結束。跑了 ${iter} 次，正好等於 1 的個數，和位元寬度無關。`,
    naiveIntro: "對照組：逐位檢查。每輪看最低位 n & 1，加進 count，然後 n >>= 1。不管有幾個 1，都要看完每一位。",
    naiveStep: (pos: number, bit: number, iter: number, count: number) =>
      `第 ${pos} 位是 ${bit}${bit ? "，count 加 1" : "，count 不變"}，然後右移一位。這是第 ${iter} 次迴圈，count = ${count}。`,
    compare: (naive: number, kernighan: number) =>
      `逐位檢查跑了 ${naive} 次才數完，Kernighan 只要 ${kernighan} 次。1 越稀疏差距越大；要算漢明距離時，先 a ^ b 再數 1 就好。`,
    opStart: "開始",
    opEnd: "結束",
    opCompare: "比較",
    phaseNaive: "逐位檢查",
    phaseDone: "兩種方法比較",
    rowOriginal: "原本的 n",
    rowCurrent: "目前的 n",
    iterations: "這個方法的迴圈次數",
    kernighanTotal: "Kernighan 總次數",
    naiveTotal: "逐位檢查總次數",
  },
  {
    en: {
      intro: (n: number, bits: string) =>
        `n = ${n} = ${bits}, and we want to count its 1 bits. Start with Brian Kernighan's trick: n & (n − 1) clears exactly the lowest 1, so the number of times you can do it is the number of 1s.`,
      kStep: (bits: string, hot: number, count: number) =>
        `n − 1 = ${bits}: subtracting 1 borrows through the lowest 1, turning it into a 0 and every 0 below it into a 1. AND that with n and the 1 in bit ${hot} disappears, while every higher bit is untouched. count = ${count}.`,
      kEnd: (iter: number) => `n has reached 0 and the loop ends. It ran ${iter} times — exactly the number of 1s, no matter how wide the word is.`,
      naiveIntro: "For comparison, check one bit at a time. Each round reads the lowest bit with n & 1, adds it to count, then does n >>= 1. However few 1s there are, every bit still has to be looked at.",
      naiveStep: (pos: number, bit: number, iter: number, count: number) =>
        `Bit ${pos} is ${bit}, so count ${bit ? "goes up by 1" : "stays the same"}; then shift right by one. That was iteration ${iter}, count = ${count}.`,
      compare: (naive: number, kernighan: number) =>
        `Checking bit by bit took ${naive} iterations; Kernighan needed only ${kernighan}. The sparser the 1s, the wider the gap. For Hamming distance, XOR the two numbers first and then count the 1s.`,
      opStart: "start",
      opEnd: "end",
      opCompare: "compare",
      phaseNaive: "Bit by bit",
      phaseDone: "The two methods side by side",
      rowOriginal: "original n",
      rowCurrent: "current n",
      iterations: "Iterations of this method",
      kernighanTotal: "Kernighan total",
      naiveTotal: "Bit-by-bit total",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  phase: "k" | "naive" | "done";
  op: string;
  n: number;        // 這一步處理前的 n
  next: number;     // 處理後的 n
  count: number;    // 處理後的 count
  iter: number;     // 迴圈次數（處理後）
  hot: number;      // 被清掉／被看的位元索引，-1 表示沒有
  bit?: number;     // 逐位檢查時看到的位元值
}

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  steps.push({ desc: t.intro(N, bin(N)), phase: "k", op: t.opStart, n: N, next: N, count: 0, iter: 0, hot: -1 });
  let n = N, count = 0, iter = 0;
  while (n) {
    const hot = lowbitIndex(n);
    const next = n & (n - 1);
    iter++; count++;
    steps.push({ desc: t.kStep(bin(n - 1), hot, count), phase: "k", op: `n &= n − 1`, n, next, count, iter, hot });
    n = next;
  }
  const kIter = iter;
  steps.push({ desc: t.kEnd(kIter), phase: "k", op: t.opEnd, n: 0, next: 0, count, iter, hot: -1 });

  // 逐位檢查
  n = N; count = 0; iter = 0;
  steps.push({ desc: t.naiveIntro, phase: "naive", op: t.opStart, n: N, next: N, count: 0, iter: 0, hot: -1 });
  let shifted = 0;
  while (n) {
    const bit = n & 1;
    const next = n >> 1;
    iter++; count += bit;
    steps.push({ desc: t.naiveStep(shifted, bit, iter, count), phase: "naive", op: `count += n & 1; n >>= 1`, n, next, count, iter, hot: shifted, bit });
    n = next; shifted++;
  }
  steps.push({ desc: t.compare(iter, kIter), phase: "done", op: t.opCompare, n: 0, next: 0, count, iter, hot: -1 });
  return steps;
}

const K_TOTAL = 5, NAIVE_TOTAL = 8;

function BinRow({ label, v, tone }: { label: string; v: number; tone?: (bitIndex: number, bit: string) => string }) {
  const bs = bin(v).split("");
  return (
    <div className="flex items-center gap-2">
      <span className="w-[88px] shrink-0 font-mono text-[12px] text-ink-3">{label}</span>
      <Cells items={bs} tone={(i) => tone?.(W - 1 - i, bs[i]) || (bs[i] === "0" ? CELL.dim : "")} w="w-8" />
      <span className="w-9 text-right font-mono text-[13px] tabular-nums text-ink">{v}</span>
    </div>
  );
}

export function CountingBitsDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const inLoop = s.op !== t.opStart && s.op !== t.opEnd && s.op !== t.opCompare;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={s.phase === "k" ? "Brian Kernighan" : s.phase === "naive" ? t.phaseNaive : t.phaseDone} />

      <div className="grid gap-2 p-3.5">
        {s.phase === "k" && (
          <>
            <BinRow label="n" v={s.n} tone={(i) => (i === s.hot ? CELL.amber : "")} />
            {inLoop && <BinRow label="n − 1" v={s.n - 1} tone={(i) => (i === s.hot ? CELL.amber : i < s.hot ? CELL.green : "")} />}
            {inLoop && <div className="ml-[96px] h-px w-[280px] bg-line-strong" />}
            {inLoop && <BinRow label="n & (n − 1)" v={s.next} tone={(i) => (i === s.hot ? CELL.dim : "")} />}
          </>
        )}
        {s.phase === "naive" && (
          <>
            <BinRow label={t.rowOriginal} v={N} tone={(i) => (i === s.hot ? (s.bit ? CELL.green : CELL.amber) : i < s.hot ? CELL.dim : "")} />
            <BinRow label={t.rowCurrent} v={s.n} tone={(i) => (i === 0 && inLoop ? (s.bit ? CELL.green : CELL.amber) : "")} />
            {inLoop && <BinRow label="n >> 1" v={s.next} />}
          </>
        )}
        {s.phase === "done" && (
          <BinRow label="n" v={N} tone={(_, bit) => (bit === "1" ? CELL.green : "")} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3.5 border-t border-line p-3.5 md:grid-cols-4">
        <div>
          <div className="eyebrow mb-1">count</div>
          <div className="font-mono text-[20px] tabular-nums text-ink">{s.count}</div>
        </div>
        <div>
          <div className="eyebrow mb-1">{t.iterations}</div>
          <div className="font-mono text-[20px] tabular-nums text-ink">{s.phase === "done" ? "—" : s.iter}</div>
        </div>
        <div>
          <div className="eyebrow mb-1">{t.kernighanTotal}</div>
          <div className={`font-mono text-[20px] tabular-nums ${s.phase !== "k" ? "text-green" : "text-ink-3"}`}>{s.phase !== "k" ? K_TOTAL : "…"}</div>
        </div>
        <div>
          <div className="eyebrow mb-1">{t.naiveTotal}</div>
          <div className={`font-mono text-[20px] tabular-nums ${s.phase === "done" ? "text-amber" : "text-ink-3"}`}>{s.phase === "done" ? NAIVE_TOTAL : "…"}</div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
