"use client";

import { useState } from "react";

const CAP = 6;

interface State {
  buf: (number | null)[];
  head: number;   // 下一個要出隊的位置
  size: number;
  hi: number | null;
  last: string;
}

const INIT: State = { buf: Array(CAP).fill(null), head: 0, size: 0, hi: null, last: `容量 ${CAP} 的環狀陣列。head 指向最前面的元素，tail = (head + size) % ${CAP} 是下一個空位。` };
const rnd = () => Math.floor(Math.random() * 90) + 10;

function enqueue(s: State): State {
  if (s.size === CAP) return { ...s, hi: null, last: "佇列滿了。實務上會像動態陣列一樣擴容成兩倍，再把元素依序搬過去。" };
  const tail = (s.head + s.size) % CAP;
  const v = rnd();
  const buf = [...s.buf];
  buf[tail] = v;
  return { ...s, buf, size: s.size + 1, hi: tail, last: `enqueue(${v})：放到 tail = (${s.head} + ${s.size}) % ${CAP} = ${tail}${tail < s.head ? "，繞回陣列前面了" : ""}。O(1)。` };
}

function dequeue(s: State): State {
  if (s.size === 0) return { ...s, hi: null, last: "佇列是空的。" };
  const v = s.buf[s.head];
  const buf = [...s.buf];
  buf[s.head] = null;
  const head = (s.head + 1) % CAP;
  return { ...s, buf, head, size: s.size - 1, hi: null, last: `dequeue() 取出 ${v}：head 從 ${s.head} 往前推到 ${head}${head === 0 && s.head === CAP - 1 ? "，繞回 0" : ""}。不搬任何元素，O(1)。陣列版的 pop(0) 要搬 n 個。` };
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium";

export function CircularQueueDemo() {
  const [s, setS] = useState<State>(INIT);
  const tail = (s.head + s.size) % CAP;
  const many = (f: (s: State) => State, k: number) => setS((c) => { let x = c; for (let i = 0; i < k; i++) x = f(x); return x; });

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setS(enqueue)}>enqueue</button>
        <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => many(enqueue, 3)}>enqueue ×3</button>
        <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setS(dequeue)}>dequeue</button>
        <button type="button" className={`${BTN} ml-auto border-line bg-surface hover:bg-surface-2`} onClick={() => setS(INIT)}>重設</button>
      </div>

      <div className="px-3.5 pt-4 pb-3">
        <div className="eyebrow mb-1.5">底層陣列（size {s.size} / {CAP}）</div>
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
        <p className="mt-1 mb-0 text-[12px] text-ink-3">邏輯順序（前 → 後）：{s.size === 0 ? "空" : Array.from({ length: s.size }, (_, j) => s.buf[(s.head + j) % CAP]).join(" → ")}</p>
      </div>

      <div className="border-t border-line px-3.5 py-2.5 text-[13.5px]">{s.last}</div>
    </div>
  );
}
