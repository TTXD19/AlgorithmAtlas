"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** Single Number：每個數出現兩次，只有 12 出現一次 */
const NUMS = [5, 3, 9, 3, 5, 12, 9];
const W = 4;
const bin = (n: number) => n.toString(2).padStart(W, "0");

interface Step {
  desc: string;
  phase: "single" | "swap";
  op: string;
  i: number;
  before: number;
  acc: number;
  paired: number[];
  swap: { a: number; b: number; line: number };
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const paired: number[] = [];
  const seen = new Map<number, number>();
  let acc = 0;
  const noSwap = { a: 5, b: 9, line: -1 };
  steps.push({ desc: `目標：找出唯一沒有成對的數。acc 從 0 開始，把每個數 XOR 進去。0 ^ x = x，x ^ x = 0，所以成對的會互相抵消。`, phase: "single", op: "開始", i: -1, before: 0, acc: 0, paired: [], swap: noSwap });
  for (let i = 0; i < NUMS.length; i++) {
    const x = NUMS[i];
    const before = acc;
    acc ^= x;
    const first = seen.get(x);
    let desc: string;
    if (first !== undefined) {
      paired.push(first, i);
      desc = `${x} 第二次出現：${bin(before)} ^ ${bin(x)} = ${bin(acc)}。它把上次留下的 ${x} 抵消掉了，acc 裡不再有 ${x} 的痕跡。`;
    } else {
      seen.set(x, i);
      desc = `acc ^= ${x}：${bin(before)} ^ ${bin(x)} = ${bin(acc)}（${acc}）。`;
    }
    steps.push({ desc, phase: "single", op: `acc ^= ${x}`, i, before, acc, paired: [...paired], swap: noSwap });
  }
  steps.push({ desc: `掃完了。三對數字各自抵消成 0，acc = ${acc} 就是落單的那一個。O(n) 時間、O(1) 空間，順序完全不影響結果（XOR 有交換律與結合律）。`, phase: "single", op: "結束", i: NUMS.length, before: acc, acc, paired: [...paired], swap: noSwap });

  // 不用暫存變數交換
  let a = 5, b = 9;
  steps.push({ desc: `第二個技巧：交換 a = 5、b = 9 卻不開暫存變數。只用三次 XOR。`, phase: "swap", op: "swap(a, b)", i: -1, before: 0, acc: 0, paired: [], swap: { a, b, line: 0 } });
  a ^= b;
  steps.push({ desc: `a ^= b：a 變成 a ^ b = ${bin(a)}（${a}）。它同時「記得」原本的 a 和 b。`, phase: "swap", op: "a ^= b", i: -1, before: 0, acc: 0, paired: [], swap: { a, b, line: 1 } });
  b ^= a;
  steps.push({ desc: `b ^= a：b = b ^ (a ^ b) = a，得到原本的 a = ${b}。b 抵消掉了自己，剩下 a。`, phase: "swap", op: "b ^= a", i: -1, before: 0, acc: 0, paired: [], swap: { a, b, line: 2 } });
  a ^= b;
  steps.push({ desc: `a ^= b：a = (a ^ b) ^ a = b，得到原本的 b = ${a}。交換完成。實務上直接寫 a, b = b, a 就好，這裡是為了看懂 XOR 的抵消性質。`, phase: "swap", op: "a ^= b", i: -1, before: 0, acc: 0, paired: [], swap: { a, b, line: 3 } });
  return steps;
}

const LINES = ["a = 5, b = 9", "a ^= b", "b ^= a", "a ^= b"];

function BinRow({ label, v, hot }: { label: string; v: number; hot?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 font-mono text-[12px] text-ink-3">{label}</span>
      <Cells items={bin(v).split("")} tone={() => (hot ? CELL.amber : "")} w="w-8" />
      <span className="font-mono text-[13px] tabular-nums text-ink">= {v}</span>
    </div>
  );
}

export function XorTricksDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={s.phase === "single" ? "Single Number · 7 個數" : "不用暫存變數的交換"} />

      {s.phase === "single" ? (
        <>
          <div className="p-3.5">
            <div className="eyebrow mb-2">nums（灰色是已經互相抵消的一對）</div>
            <Cells items={NUMS} tone={(i) => (i === s.i ? CELL.accent : s.paired.includes(i) ? CELL.dim : i < s.i ? CELL.amber : "")} w="w-10" />
          </div>
          <div className="grid gap-2 border-t border-line p-3.5">
            <div className="eyebrow mb-0.5">累積</div>
            {s.i >= 0 && s.i < NUMS.length ? (
              <>
                <BinRow label="acc" v={s.before} />
                <BinRow label={`^ ${NUMS[s.i]}`} v={NUMS[s.i]} hot />
                <div className="ml-16 h-px w-40 bg-line-strong" />
                <BinRow label="acc" v={s.acc} hot />
              </>
            ) : (
              <BinRow label="acc" v={s.acc} hot={s.i >= NUMS.length} />
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[auto_minmax(0,1fr)]">
          <div>
            <div className="eyebrow mb-2">程式</div>
            <div className="grid gap-1">
              {LINES.map((ln, i) => (
                <div key={i} className={`rounded-md border px-2.5 py-1 font-mono text-[13px] ${i === s.swap.line ? CELL.accent : i < s.swap.line ? CELL.dim : "border-line bg-surface"}`}>{ln}</div>
              ))}
            </div>
          </div>
          <div className="grid content-start gap-2">
            <div className="eyebrow mb-0.5">目前的值</div>
            <BinRow label="a" v={s.swap.a} hot={s.swap.line === 1 || s.swap.line === 3} />
            <BinRow label="b" v={s.swap.b} hot={s.swap.line === 2} />
          </div>
        </div>
      )}

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
