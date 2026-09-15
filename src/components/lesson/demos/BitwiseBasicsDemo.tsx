"use client";

import { useState } from "react";
import { BTN_PLAIN } from "./StepBar";

const W = 8;
const MASK8 = (1 << W) - 1;
const bitsOf = (n: number): number[] => Array.from({ length: W }, (_, i) => (n >> (W - 1 - i)) & 1);

const ON = "border-line-strong bg-surface text-ink";
const OFF = "border-line bg-surface-2 text-ink-3";
const ACCENT = "border-accent bg-accent text-accent-ink";
const AMBER = "border-amber bg-amber-soft text-amber";
const GREEN = "border-green bg-green-soft text-green";

function BitRow({ label, value, onToggle, tone, note }: { label: string; value: number; onToggle?: (i: number) => void; tone?: (bitIndex: number, bit: number) => string; note?: string }) {
  const bs = bitsOf(value);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-[76px] shrink-0 font-mono text-[12.5px] text-ink-2">{label}</span>
      <div className="flex gap-1">
        {bs.map((b, i) => {
          const idx = W - 1 - i;
          const cls = tone?.(idx, b) || (b ? ON : OFF);
          return onToggle ? (
            <button key={i} type="button" onClick={() => onToggle(idx)} title={`第 ${idx} 位`} className={`grid h-8 w-8 cursor-pointer place-items-center rounded-md border font-mono text-[13px] tabular-nums hover:brightness-95 ${cls}`}>{b}</button>
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
        <span>點 A、B 的格子翻轉位元，下面的結果即時更新。</span>
        <button type="button" className={`${BTN_PLAIN} ml-auto`} onClick={() => { setA(0b10110010); setB(0b01101100); setPos(3); }}>重設</button>
        <span className="text-[12px] text-ink-3">8 位元 · 最高位在左，第 0 位在右</span>
      </div>

      <div className="grid gap-2 p-3.5">
        <div className="eyebrow mb-0.5">輸入（可點）</div>
        <BitRow label="A" value={a} onToggle={flipA} tone={(_, bit) => (bit ? ACCENT : "")} />
        <BitRow label="B" value={b} onToggle={flipB} tone={(_, bit) => (bit ? ACCENT : "")} />
      </div>

      <div className="grid gap-2 border-t border-line p-3.5">
        <div className="eyebrow mb-0.5">四種位元運算</div>
        <BitRow label="A & B" value={and} tone={(_, bit) => (bit ? GREEN : "")} note="兩邊都是 1 才是 1：常用來「取出」某些位" />
        <BitRow label="A | B" value={or} tone={(_, bit) => (bit ? GREEN : "")} note="任一邊是 1 就是 1：常用來「設定」某些位" />
        <BitRow label="A ^ B" value={xor} tone={(_, bit) => (bit ? GREEN : "")} note="不同才是 1：常用來「翻轉」，也能抵消" />
        <BitRow label="~A" value={not} tone={(_, bit) => (bit ? GREEN : "")} note="全部翻轉。8 位元下 ~A = 255 − A" />
      </div>

      <div className="grid gap-2 border-t border-line p-3.5">
        <div className="eyebrow mb-0.5">移位</div>
        <BitRow label="A << 1" value={shl} tone={(i, bit) => (i === 0 ? OFF : bit ? GREEN : "")} note={`乘 2${a & 0x80 ? "，最高位的 1 被擠出去了（溢位）" : "，右邊補 0"}`} />
        <BitRow label="A >> 1" value={shr} tone={(i, bit) => (i === W - 1 ? OFF : bit ? GREEN : "")} note={`整數除 2${a & 1 ? "，最低位的 1 被丟掉（餘數）" : "，左邊補 0"}`} />
      </div>

      <div className="grid gap-2 border-t border-line p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="eyebrow">取位、設位、清位（選第 i 位）</div>
          <div className="ml-auto flex gap-1">
            {Array.from({ length: W }, (_, k) => W - 1 - k).map((i) => (
              <button key={i} type="button" onClick={() => setPos(i)} className={`grid h-7 w-7 cursor-pointer place-items-center rounded-md border font-mono text-[12px] ${i === pos ? AMBER : "border-line bg-surface hover:bg-surface-2"}`}>{i}</button>
            ))}
          </div>
        </div>
        <BitRow label={`1 << ${pos}`} value={mask} tone={atPos} note="遮罩：只有第 i 位是 1" />
        <BitRow label="A" value={a} tone={atPos} />
        <BitRow label={`取位`} value={got} tone={(i) => (i === 0 ? (got ? GREEN : OFF) : "")} note={`(A >> ${pos}) & 1 = ${got}：第 ${pos} 位是 ${got ? "1（開）" : "0（關）"}`} />
        <BitRow label="設位" value={a | mask} tone={(i, bit) => (i === pos ? (bit ? GREEN : "") : "")} note={`A | (1 << ${pos})：把第 ${pos} 位變 1，其他位不動`} />
        <BitRow label="清位" value={a & ~mask} tone={(i) => (i === pos ? OFF : "")} note={`A & ~(1 << ${pos})：把第 ${pos} 位變 0，其他位不動`} />
        <BitRow label="翻轉" value={a ^ mask} tone={(i, bit) => (i === pos ? (bit ? GREEN : OFF) : "")} note={`A ^ (1 << ${pos})：第 ${pos} 位 0 變 1、1 變 0`} />
      </div>
    </div>
  );
}
