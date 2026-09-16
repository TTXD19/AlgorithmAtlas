"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

/** Single Number：每個數出現兩次，只有 12 出現一次 */
const NUMS = [5, 3, 9, 3, 5, 12, 9];
const W = 4;
const bin = (n: number) => n.toString(2).padStart(W, "0");

const TEXT = demoText(
  {
    intro: "目標：找出唯一沒有成對的數。acc 從 0 開始，把每個數 XOR 進去。0 ^ x = x，x ^ x = 0，所以成對的會互相抵消。",
    opStart: "開始",
    opEnd: "結束",
    second: (x: number, beforeBin: string, xBin: string, accBin: string) =>
      `${x} 第二次出現：${beforeBin} ^ ${xBin} = ${accBin}。它把上次留下的 ${x} 抵消掉了，acc 裡不再有 ${x} 的痕跡。`,
    firstTime: (x: number, beforeBin: string, xBin: string, accBin: string, acc: number) =>
      `acc ^= ${x}：${beforeBin} ^ ${xBin} = ${accBin}（${acc}）。`,
    doneSingle: (acc: number) =>
      `掃完了。三對數字各自抵消成 0，acc = ${acc} 就是落單的那一個。O(n) 時間、O(1) 空間，順序完全不影響結果（XOR 有交換律與結合律）。`,
    swapIntro: "第二個技巧：交換 a = 5、b = 9 卻不開暫存變數。只用三次 XOR。",
    swap1: (aBin: string, a: number) => `a ^= b：a 變成 a ^ b = ${aBin}（${a}）。它同時「記得」原本的 a 和 b。`,
    swap2: (b: number) => `b ^= a：b = b ^ (a ^ b) = a，得到原本的 a = ${b}。b 抵消掉了自己，剩下 a。`,
    swap3: (a: number) =>
      `a ^= b：a = (a ^ b) ^ a = b，得到原本的 b = ${a}。交換完成。實務上直接寫 a, b = b, a 就好，這裡是為了看懂 XOR 的抵消性質。`,
    headerSingle: "Single Number · 7 個數",
    headerSwap: "不用暫存變數的交換",
    numsLabel: "nums（灰色是已經互相抵消的一對）",
    accLabel: "累積",
    codeLabel: "程式",
    valuesLabel: "目前的值",
  },
  {
    en: {
      intro: "The goal is to find the one value with no partner. acc starts at 0 and every number is XORed into it. Because 0 ^ x = x and x ^ x = 0, anything that appears twice cancels itself out.",
      opStart: "Start",
      opEnd: "Done",
      second: (x: number, beforeBin: string, xBin: string, accBin: string) =>
        `${x} turns up for the second time: ${beforeBin} ^ ${xBin} = ${accBin}. It cancels the ${x} that the first occurrence left behind, so acc holds no trace of ${x} any more.`,
      firstTime: (x: number, beforeBin: string, xBin: string, accBin: string, acc: number) =>
        `acc ^= ${x}: ${beforeBin} ^ ${xBin} = ${accBin} (${acc}).`,
      doneSingle: (acc: number) =>
        `The scan is over. The three pairs have each cancelled down to 0, so acc = ${acc} is the value that stands alone. O(n) time, O(1) space, and the order of the numbers makes no difference at all, because XOR is both commutative and associative.`,
      swapIntro: "A second trick: swap a = 5 and b = 9 without a temporary variable, using nothing but three XORs.",
      swap1: (aBin: string, a: number) => `a ^= b: a becomes a ^ b = ${aBin} (${a}). That one value still remembers both of the originals.`,
      swap2: (b: number) => `b ^= a: b = b ^ (a ^ b) = a, which recovers the original a = ${b}. The old b cancels itself, leaving a behind.`,
      swap3: (a: number) =>
        `a ^= b: a = (a ^ b) ^ a = b, which recovers the original b = ${a}, and the swap is complete. Real code would simply write a, b = b, a; this version is here to make XOR's cancelling property visible.`,
      headerSingle: "Single Number, 7 values",
      headerSwap: "A swap with no temporary variable",
      numsLabel: "nums (greyed-out pairs have already cancelled each other out)",
      accLabel: "Running XOR",
      codeLabel: "Code",
      valuesLabel: "Current values",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

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

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const paired: number[] = [];
  const seen = new Map<number, number>();
  let acc = 0;
  const noSwap = { a: 5, b: 9, line: -1 };
  steps.push({ desc: t.intro, phase: "single", op: t.opStart, i: -1, before: 0, acc: 0, paired: [], swap: noSwap });
  for (let i = 0; i < NUMS.length; i++) {
    const x = NUMS[i];
    const before = acc;
    acc ^= x;
    const first = seen.get(x);
    let desc: string;
    if (first !== undefined) {
      paired.push(first, i);
      desc = t.second(x, bin(before), bin(x), bin(acc));
    } else {
      seen.set(x, i);
      desc = t.firstTime(x, bin(before), bin(x), bin(acc), acc);
    }
    steps.push({ desc, phase: "single", op: `acc ^= ${x}`, i, before, acc, paired: [...paired], swap: noSwap });
  }
  steps.push({ desc: t.doneSingle(acc), phase: "single", op: t.opEnd, i: NUMS.length, before: acc, acc, paired: [...paired], swap: noSwap });

  // 不用暫存變數交換
  let a = 5, b = 9;
  steps.push({ desc: t.swapIntro, phase: "swap", op: "swap(a, b)", i: -1, before: 0, acc: 0, paired: [], swap: { a, b, line: 0 } });
  a ^= b;
  steps.push({ desc: t.swap1(bin(a), a), phase: "swap", op: "a ^= b", i: -1, before: 0, acc: 0, paired: [], swap: { a, b, line: 1 } });
  b ^= a;
  steps.push({ desc: t.swap2(b), phase: "swap", op: "b ^= a", i: -1, before: 0, acc: 0, paired: [], swap: { a, b, line: 2 } });
  a ^= b;
  steps.push({ desc: t.swap3(a), phase: "swap", op: "a ^= b", i: -1, before: 0, acc: 0, paired: [], swap: { a, b, line: 3 } });
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
  const t = TEXT[useLocale()];
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={s.phase === "single" ? t.headerSingle : t.headerSwap} />

      {s.phase === "single" ? (
        <>
          <div className="p-3.5">
            <div className="eyebrow mb-2">{t.numsLabel}</div>
            <Cells items={NUMS} tone={(i) => (i === s.i ? CELL.accent : s.paired.includes(i) ? CELL.dim : i < s.i ? CELL.amber : "")} w="w-10" />
          </div>
          <div className="grid gap-2 border-t border-line p-3.5">
            <div className="eyebrow mb-0.5">{t.accLabel}</div>
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
            <div className="eyebrow mb-2">{t.codeLabel}</div>
            <div className="grid gap-1">
              {LINES.map((ln, i) => (
                <div key={i} className={`rounded-md border px-2.5 py-1 font-mono text-[13px] ${i === s.swap.line ? CELL.accent : i < s.swap.line ? CELL.dim : "border-line bg-surface"}`}>{ln}</div>
              ))}
            </div>
          </div>
          <div className="grid content-start gap-2">
            <div className="eyebrow mb-0.5">{t.valuesLabel}</div>
            <BinRow label="a" v={s.swap.a} hot={s.swap.line === 1 || s.swap.line === 3} />
            <BinRow label="b" v={s.swap.b} hot={s.swap.line === 2} />
          </div>
        </div>
      )}

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
