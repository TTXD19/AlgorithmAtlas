"use client";

import { useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { BTN_PLAIN } from "./StepBar";

const W = 8;
const MASK8 = (1 << W) - 1;
const bitsOf = (n: number): number[] => Array.from({ length: W }, (_, i) => (n >> (W - 1 - i)) & 1);

const ON = "border-line-strong bg-surface text-ink";
const OFF = "border-line bg-surface-2 text-ink-3";
const ACCENT = "border-accent bg-accent text-accent-ink";
const AMBER = "border-amber bg-amber-soft text-amber";
const GREEN = "border-green bg-green-soft text-green";

const TEXT = demoText(
  {
    bitTitle: (i: number) => `第 ${i} 位`,
    hint: "點 A、B 的格子翻轉位元，下面的結果即時更新。",
    width: "8 位元 · 最高位在左，第 0 位在右",
    inputs: "輸入（可點）",
    operators: "四種位元運算",
    andNote: "兩邊都是 1 才是 1：常用來「取出」某些位",
    orNote: "任一邊是 1 就是 1：常用來「設定」某些位",
    xorNote: "不同才是 1：常用來「翻轉」，也能抵消",
    notNote: "全部翻轉。8 位元下 ~A = 255 − A",
    shifts: "移位",
    shlOverflow: "乘 2，最高位的 1 被擠出去了（溢位）",
    shlPad: "乘 2，右邊補 0",
    shrDrop: "整數除 2，最低位的 1 被丟掉（餘數）",
    shrPad: "整數除 2，左邊補 0",
    bitOps: "取位、設位、清位（選第 i 位）",
    maskNote: "遮罩：只有第 i 位是 1",
    labelGet: "取位",
    labelSet: "設位",
    labelClear: "清位",
    labelFlip: "翻轉",
    getNote: (pos: number, got: number) => `(A >> ${pos}) & 1 = ${got}：第 ${pos} 位是 ${got ? "1（開）" : "0（關）"}`,
    setNote: (pos: number) => `A | (1 << ${pos})：把第 ${pos} 位變 1，其他位不動`,
    clearNote: (pos: number) => `A & ~(1 << ${pos})：把第 ${pos} 位變 0，其他位不動`,
    flipNote: (pos: number) => `A ^ (1 << ${pos})：第 ${pos} 位 0 變 1、1 變 0`,
  },
  {
    en: {
      bitTitle: (i: number) => `bit ${i}`,
      hint: "Click any cell of A or B to flip that bit; everything below updates as you go.",
      width: "8 bits · most significant on the left, bit 0 on the right",
      inputs: "Inputs (clickable)",
      operators: "The four bitwise operators",
      andNote: "1 only where both sides are 1: the usual way to read out selected bits",
      orNote: "1 wherever either side is 1: the usual way to set selected bits",
      xorNote: "1 only where the bits differ: the usual way to flip bits, and it cancels itself out",
      notNote: "Flips every bit. Over 8 bits, ~A = 255 − A.",
      shifts: "Shifts",
      shlOverflow: "Multiplies by 2, and the top 1 is pushed off the end (overflow)",
      shlPad: "Multiplies by 2, padding the right with 0",
      shrDrop: "Integer division by 2, and the bottom 1 is dropped (the remainder)",
      shrPad: "Integer division by 2, padding the left with 0",
      bitOps: "Get, set and clear a bit (pick bit i)",
      maskNote: "A mask with a 1 at bit i and nowhere else",
      labelGet: "get",
      labelSet: "set",
      labelClear: "clear",
      labelFlip: "flip",
      getNote: (pos: number, got: number) => `(A >> ${pos}) & 1 = ${got}: bit ${pos} is ${got ? "1 (on)" : "0 (off)"}`,
      setNote: (pos: number) => `A | (1 << ${pos}): turns bit ${pos} on and leaves every other bit alone`,
      clearNote: (pos: number) => `A & ~(1 << ${pos}): turns bit ${pos} off and leaves every other bit alone`,
      flipNote: (pos: number) => `A ^ (1 << ${pos}): bit ${pos} goes from 0 to 1, or from 1 to 0`,
    },
  },
);

function BitRow({ label, value, onToggle, tone, note }: { label: string; value: number; onToggle?: (i: number) => void; tone?: (bitIndex: number, bit: number) => string; note?: string }) {
  const t = TEXT[useLocale()];
  const bs = bitsOf(value);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-[76px] shrink-0 font-mono text-[12.5px] text-ink-2">{label}</span>
      <div className="flex gap-1">
        {bs.map((b, i) => {
          const idx = W - 1 - i;
          const cls = tone?.(idx, b) || (b ? ON : OFF);
          return onToggle ? (
            <button key={i} type="button" onClick={() => onToggle(idx)} title={t.bitTitle(idx)} className={`grid h-8 w-8 cursor-pointer place-items-center rounded-md border font-mono text-[13px] tabular-nums hover:brightness-95 ${cls}`}>{b}</button>
          ) : (
            <span key={i} className={`grid h-8 w-8 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${cls}`}>{b}</span>
          );
        })}
      </div>
      <span className="w-9 text-right font-mono text-[13px] tabular-nums text-ink">{value}</span>
      {note && <span className="text-[12px] text-ink-3">{note}</span>}
    </div>
  );
}

export function BitwiseBasicsDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const [a, setA] = useState(0b10110010);
  const [b, setB] = useState(0b01101100);
  const [pos, setPos] = useState(3);
  const mask = 1 << pos;
  const flipA = (i: number) => setA((v) => v ^ (1 << i));
  const flipB = (i: number) => setB((v) => v ^ (1 << i));

  const and = a & b, or = a | b, xor = a ^ b, not = ~a & MASK8;
  const shl = (a << 1) & MASK8, shr = a >> 1;
  const got = (a >> pos) & 1;
  const atPos = (i: number) => (i === pos ? AMBER : "");

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span>{t.hint}</span>
        <button type="button" className={`${BTN_PLAIN} ml-auto`} onClick={() => { setA(0b10110010); setB(0b01101100); setPos(3); }}>{ui.demo.reset}</button>
        <span className="text-[12px] text-ink-3">{t.width}</span>
      </div>

      <div className="grid gap-2 p-3.5">
        <div className="eyebrow mb-0.5">{t.inputs}</div>
        <BitRow label="A" value={a} onToggle={flipA} tone={(_, bit) => (bit ? ACCENT : "")} />
        <BitRow label="B" value={b} onToggle={flipB} tone={(_, bit) => (bit ? ACCENT : "")} />
      </div>

      <div className="grid gap-2 border-t border-line p-3.5">
        <div className="eyebrow mb-0.5">{t.operators}</div>
        <BitRow label="A & B" value={and} tone={(_, bit) => (bit ? GREEN : "")} note={t.andNote} />
        <BitRow label="A | B" value={or} tone={(_, bit) => (bit ? GREEN : "")} note={t.orNote} />
        <BitRow label="A ^ B" value={xor} tone={(_, bit) => (bit ? GREEN : "")} note={t.xorNote} />
        <BitRow label="~A" value={not} tone={(_, bit) => (bit ? GREEN : "")} note={t.notNote} />
      </div>

      <div className="grid gap-2 border-t border-line p-3.5">
        <div className="eyebrow mb-0.5">{t.shifts}</div>
        <BitRow label="A << 1" value={shl} tone={(i, bit) => (i === 0 ? OFF : bit ? GREEN : "")} note={a & 0x80 ? t.shlOverflow : t.shlPad} />
        <BitRow label="A >> 1" value={shr} tone={(i, bit) => (i === W - 1 ? OFF : bit ? GREEN : "")} note={a & 1 ? t.shrDrop : t.shrPad} />
      </div>

      <div className="grid gap-2 border-t border-line p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="eyebrow">{t.bitOps}</div>
          <div className="ml-auto flex gap-1">
            {Array.from({ length: W }, (_, k) => W - 1 - k).map((i) => (
              <button key={i} type="button" onClick={() => setPos(i)} className={`grid h-7 w-7 cursor-pointer place-items-center rounded-md border font-mono text-[12px] ${i === pos ? AMBER : "border-line bg-surface hover:bg-surface-2"}`}>{i}</button>
            ))}
          </div>
        </div>
        <BitRow label={`1 << ${pos}`} value={mask} tone={atPos} note={t.maskNote} />
        <BitRow label="A" value={a} tone={atPos} />
        <BitRow label={t.labelGet} value={got} tone={(i) => (i === 0 ? (got ? GREEN : OFF) : "")} note={t.getNote(pos, got)} />
        <BitRow label={t.labelSet} value={a | mask} tone={(i, bit) => (i === pos ? (bit ? GREEN : "") : "")} note={t.setNote(pos)} />
        <BitRow label={t.labelClear} value={a & ~mask} tone={(i) => (i === pos ? OFF : "")} note={t.clearNote(pos)} />
        <BitRow label={t.labelFlip} value={a ^ mask} tone={(i, bit) => (i === pos ? (bit ? GREEN : OFF) : "")} note={t.flipNote(pos)} />
      </div>
    </div>
  );
}
