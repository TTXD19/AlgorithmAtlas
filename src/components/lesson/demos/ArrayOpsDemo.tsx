"use client";

import { useState } from "react";

interface State {
  items: number[];
  cap: number;
  /** 上一個操作搬動過的索引（黃）、新放入的索引（藍）、被讀取的索引（綠） */
  moved: number[];
  added: number | null;
  read: number | null;
  cost: number;
  last: string;
}

const START = [12, 7, 3, 9, 15, 4];
const INIT: State = { items: START, cap: 8, moved: [], added: null, read: null, cost: 0, last: "陣列有 6 個元素、容量 8。每一格佔 4 bytes，位址是 base + 4 × index。試試各種操作，看哪些要搬東西。" };

const rnd = () => Math.floor(Math.random() * 90) + 10;
const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);

const OPS: { label: string; run: (s: State) => State }[] = [
  {
    label: "讀取 arr[3]",
    run: (s) => s.items.length > 3
      ? { ...s, moved: [], added: null, read: 3, cost: 1, last: `直接算位址 base + 4 × 3，一次就拿到 ${s.items[3]}。不管陣列多長都是 1 步。` }
      : { ...s, moved: [], added: null, read: null, cost: 0, last: "元素不到 4 個，arr[3] 不存在。" },
  },
  {
    label: "尾端 push",
    run: (s) => {
      const v = rnd();
      if (s.items.length === s.cap) {
        const n = s.items.length;
        return { ...s, items: [...s.items, v], cap: s.cap * 2, moved: range(0, n), added: n, read: null, cost: n + 1, last: `容量滿了：配一塊容量 ${s.cap * 2} 的新記憶體，把 ${n} 個元素全部搬過去，再放入 ${v}。這次花 ${n + 1}，但很少發生（見攤銷分析）。` };
      }
      return { ...s, items: [...s.items, v], moved: [], added: s.items.length, read: null, cost: 1, last: `尾端還有空位，直接把 ${v} 放進 arr[${s.items.length}]。花 1。` };
    },
  },
  {
    label: "開頭插入",
    run: (s) => {
      const v = rnd();
      const n = s.items.length;
      const grow = n === s.cap;
      return { ...s, items: [v, ...s.items], cap: grow ? s.cap * 2 : s.cap, moved: range(1, n + 1), added: 0, read: null, cost: n + 1, last: `要在 arr[0] 放 ${v}，原本 ${n} 個元素每個都得往右挪一格，才空得出位置。花 ${n + 1}，是 O(n)。${grow ? "而且容量剛好滿了，還多一次搬家。" : ""}` };
    },
  },
  {
    label: "在 arr[2] 插入",
    run: (s) => {
      const v = rnd();
      const n = s.items.length;
      const at = Math.min(2, n);
      const grow = n === s.cap;
      const items = [...s.items.slice(0, at), v, ...s.items.slice(at)];
      return { ...s, items, cap: grow ? s.cap * 2 : s.cap, moved: range(at + 1, n + 1), added: at, read: null, cost: n - at + 1, last: `arr[${at}] 之後的 ${n - at} 個元素往右挪，再放入 ${v}。花 ${n - at + 1}。插得越前面搬得越多。` };
    },
  },
  {
    label: "刪除開頭",
    run: (s) => {
      const n = s.items.length;
      if (!n) return { ...s, moved: [], added: null, read: null, cost: 0, last: "陣列是空的。" };
      return { ...s, items: s.items.slice(1), moved: range(0, n - 1), added: null, read: null, cost: n - 1, last: `移除 ${s.items[0]} 後不能留洞，後面 ${n - 1} 個元素全部往左挪一格。花 ${n - 1}，O(n)。` };
    },
  },
  {
    label: "刪除尾端",
    run: (s) => {
      const n = s.items.length;
      if (!n) return { ...s, moved: [], added: null, read: null, cost: 0, last: "陣列是空的。" };
      return { ...s, items: s.items.slice(0, -1), moved: [], added: null, read: null, cost: 1, last: `把 size 減 1 就好，${s.items[n - 1]} 那格之後會被覆蓋。花 1。這就是為什麼堆疊用陣列做最合適。` };
    },
  },
];

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium";

export function ArrayOpsDemo() {
  const [s, setS] = useState<State>(INIT);
  const cells = Math.min(s.cap, 16);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        {OPS.map((op) => (
          <button key={op.label} type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setS(op.run)}>
            {op.label}
          </button>
        ))}
        <button type="button" className={`${BTN} ml-auto border-line bg-surface hover:bg-surface-2`} onClick={() => setS(INIT)}>重設</button>
      </div>

      <div className="overflow-x-auto px-3.5 pt-3.5 pb-2">
        <div className="eyebrow mb-1.5">記憶體（size {s.items.length} / 容量 {s.cap}）</div>
        <div className="flex gap-1">
          {Array.from({ length: cells }, (_, i) => {
            const has = i < s.items.length;
            const tone = s.added === i
              ? "border-accent bg-accent text-accent-ink"
              : s.read === i
                ? "border-green bg-green-soft text-green"
                : s.moved.includes(i)
                  ? "border-amber bg-amber-soft text-amber"
                  : has
                    ? "border-line-strong bg-surface"
                    : "border-dashed border-line";
            return (
              <div key={i} className="flex w-11 shrink-0 flex-col items-center gap-1 font-mono text-[11px] text-ink-3">
                <span>[{i}]</span>
                <span className={`grid h-9 w-full place-items-center rounded-md border text-[14px] font-medium ${tone}`}>{has ? s.items[i] : ""}</span>
                <span className="text-[10px]">0x{(0x100 + i * 4).toString(16).toUpperCase()}</span>
              </div>
            );
          })}
          {s.cap > 16 && <span className="self-center text-[12px] text-ink-3">…</span>}
        </div>
        <div className="mt-2 flex gap-3 text-[11.5px] text-ink-3">
          <Legend cls="border-accent bg-accent" t="新放入" />
          <Legend cls="border-amber bg-amber-soft" t="被搬動" />
          <Legend cls="border-green bg-green-soft" t="被讀取" />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[12px]">成本 {s.cost}</span>
        <span className="flex-1">{s.last}</span>
      </div>
    </div>
  );
}

function Legend({ cls, t }: { cls: string; t: string }) {
  return (
    <span className="flex items-center gap-1">
      <i className={`inline-block h-2.5 w-2.5 rounded-sm border ${cls}`} />
      {t}
    </span>
  );
}
