"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const CAP = 6;

interface State {
  buf: (number | null)[];
  head: number;   // 下一個要出隊的位置
  size: number;
  hi: number | null;
  last: string;
}

const TEXT = demoText(
  {
    intro: (cap: number) => `容量 ${cap} 的環狀陣列。head 指向最前面的元素，tail = (head + size) % ${cap} 是下一個空位。`,
    full: "佇列滿了。實務上會像動態陣列一樣擴容成兩倍，再把元素依序搬過去。",
    enqueued: (v: number, head: number, size: number, cap: number, tail: number, wrapped: boolean) =>
      `enqueue(${v})：放到 tail = (${head} + ${size}) % ${cap} = ${tail}${wrapped ? "，繞回陣列前面了" : ""}。O(1)。`,
    empty: "佇列是空的。",
    dequeued: (v: number, from: number, to: number, wrapped: boolean) =>
      `dequeue() 取出 ${v}：head 從 ${from} 往前推到 ${to}${wrapped ? "，繞回 0" : ""}。不搬任何元素，O(1)。陣列版的 pop(0) 要搬 n 個。`,
    buffer: (size: number, cap: number) => `底層陣列（size ${size} / ${cap}）`,
    logical: "邏輯順序（前 → 後）：",
  },
  {
    en: {
      intro: (cap: number) => `A circular array of capacity ${cap}. head points at the front element; tail = (head + size) % ${cap} is the next free slot.`,
      full: "The queue is full. In practice you would double the capacity like a dynamic array and copy the elements across in order.",
      enqueued: (v: number, head: number, size: number, cap: number, tail: number, wrapped: boolean) =>
        `enqueue(${v}): goes to tail = (${head} + ${size}) % ${cap} = ${tail}${wrapped ? ", wrapping back to the front of the array" : ""}. O(1).`,
      empty: "The queue is empty.",
      dequeued: (v: number, from: number, to: number, wrapped: boolean) =>
        `dequeue() takes ${v}: head moves from ${from} to ${to}${wrapped ? ", wrapping back to 0" : ""}. Nothing is shifted, so O(1). The array version's pop(0) would move n elements.`,
      buffer: (size: number, cap: number) => `Backing array (size ${size} / ${cap})`,
      logical: "Logical order (front → back): ",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

const init = (t: T): State => ({ buf: Array(CAP).fill(null), head: 0, size: 0, hi: null, last: t.intro(CAP) });
const rnd = () => Math.floor(Math.random() * 90) + 10;

function enqueue(t: T, s: State): State {
  if (s.size === CAP) return { ...s, hi: null, last: t.full };
  const tail = (s.head + s.size) % CAP;
  const v = rnd();
  const buf = [...s.buf];
  buf[tail] = v;
  return { ...s, buf, size: s.size + 1, hi: tail, last: t.enqueued(v, s.head, s.size, CAP, tail, tail < s.head) };
}

function dequeue(t: T, s: State): State {
  if (s.size === 0) return { ...s, hi: null, last: t.empty };
  const v = s.buf[s.head];
  const buf = [...s.buf];
  buf[s.head] = null;
  const head = (s.head + 1) % CAP;
  return { ...s, buf, head, size: s.size - 1, hi: null, last: t.dequeued(v!, s.head, head, head === 0 && s.head === CAP - 1) };
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium";

export function CircularQueueDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const initial = useMemo(() => init(t), [t]);
  const [s, setS] = useState<State>(initial);
  const tail = (s.head + s.size) % CAP;
  const many = (f: (s: State) => State, k: number) => setS((c) => { let x = c; for (let i = 0; i < k; i++) x = f(x); return x; });

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setS((c) => enqueue(t, c))}>enqueue</button>
        <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => many((c) => enqueue(t, c), 3)}>enqueue ×3</button>
        <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setS((c) => dequeue(t, c))}>dequeue</button>
        <button type="button" className={`${BTN} ml-auto border-line bg-surface hover:bg-surface-2`} onClick={() => setS(initial)}>{ui.demo.reset}</button>
      </div>

      <div className="px-3.5 pt-4 pb-3">
        <div className="eyebrow mb-1.5">{t.buffer(s.size, CAP)}</div>
        <div className="flex gap-1">
          {s.buf.map((v, i) => {
            const inUse = v !== null;
            return (
              <div key={i} className="flex w-12 flex-col items-center gap-1 font-mono text-[11px] text-ink-3">
                <span>[{i}]</span>
                <span className={`grid h-10 w-full place-items-center rounded-md border text-[14px] font-medium ${
                  i === s.hi ? "border-accent bg-accent text-accent-ink" : inUse ? "border-accent bg-accent-soft text-ink" : "border-dashed border-line"
                }`}>{v ?? ""}</span>
                <div className="flex h-5 gap-0.5">
                  {i === s.head && s.size > 0 && <span className="rounded bg-green-soft px-1 text-[10px] leading-5 text-green">head</span>}
                  {i === tail && s.size < CAP && <span className="rounded bg-amber-soft px-1 text-[10px] leading-5 text-amber">tail</span>}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-1 mb-0 text-[12px] text-ink-3">{t.logical}{s.size === 0 ? ui.demo.empty : Array.from({ length: s.size }, (_, j) => s.buf[(s.head + j) % CAP]).join(" → ")}</p>
      </div>

      <div className="border-t border-line px-3.5 py-2.5 text-[13.5px]">{s.last}</div>
    </div>
  );
}
