"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

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

const TEXT = demoText(
  {
    intro: "陣列有 6 個元素、容量 8。每一格佔 4 bytes，位址是 base + 4 × index。試試各種操作，看哪些要搬東西。",
    opRead: "讀取 arr[3]",
    opPush: "尾端 push",
    opInsertFront: "開頭插入",
    opInsertAt: "在 arr[2] 插入",
    opDeleteFront: "刪除開頭",
    opDeleteBack: "刪除尾端",
    read: (v: number) => `直接算位址 base + 4 × 3，一次就拿到 ${v}。不管陣列多長都是 1 步。`,
    readMissing: "元素不到 4 個，arr[3] 不存在。",
    pushGrow: (newCap: number, n: number, v: number) =>
      `容量滿了：配一塊容量 ${newCap} 的新記憶體，把 ${n} 個元素全部搬過去，再放入 ${v}。這次花 ${n + 1}，但很少發生（見攤銷分析）。`,
    push: (v: number, at: number) => `尾端還有空位，直接把 ${v} 放進 arr[${at}]。花 1。`,
    insertFront: (v: number, n: number, grow: boolean) =>
      `要在 arr[0] 放 ${v}，原本 ${n} 個元素每個都得往右挪一格，才空得出位置。花 ${n + 1}，是 O(n)。${grow ? "而且容量剛好滿了，還多一次搬家。" : ""}`,
    insertAt: (at: number, shifted: number, v: number) =>
      `arr[${at}] 之後的 ${shifted} 個元素往右挪，再放入 ${v}。花 ${shifted + 1}。插得越前面搬得越多。`,
    emptyArray: "陣列是空的。",
    deleteFront: (v: number, rest: number) =>
      `移除 ${v} 後不能留洞，後面 ${rest} 個元素全部往左挪一格。花 ${rest}，O(n)。`,
    deleteBack: (v: number) => `把 size 減 1 就好，${v} 那格之後會被覆蓋。花 1。這就是為什麼堆疊用陣列做最合適。`,
    memory: (size: number, cap: number) => `記憶體（size ${size} / 容量 ${cap}）`,
    legendAdded: "新放入",
    legendMoved: "被搬動",
    legendRead: "被讀取",
    cost: (n: number) => `成本 ${n}`,
  },
  {
    en: {
      intro: "The array holds 6 elements and has capacity 8. Each slot takes 4 bytes, so the address of a slot is base + 4 × index. Try the operations and watch which ones have to move data.",
      opRead: "Read arr[3]",
      opPush: "Push at the end",
      opInsertFront: "Insert at the front",
      opInsertAt: "Insert at arr[2]",
      opDeleteFront: "Delete the first",
      opDeleteBack: "Delete the last",
      read: (v: number) => `Compute the address base + 4 × 3 and ${v} comes back in a single step, however long the array is.`,
      readMissing: "There are fewer than 4 elements, so arr[3] does not exist.",
      pushGrow: (newCap: number, n: number, v: number) =>
        `The array is full: allocate a fresh block of capacity ${newCap}, copy all ${n} elements across, then store ${v}. This push costs ${n + 1}, but it happens rarely — that is what the amortised analysis is about.`,
      push: (v: number, at: number) => `There is still a free slot at the end, so ${v} goes straight into arr[${at}]. Cost 1.`,
      insertFront: (v: number, n: number, grow: boolean) =>
        `To put ${v} in arr[0], every one of the ${n} existing elements has to shift one slot right to open up the space. Cost ${n + 1}, which is O(n).${grow ? " The capacity was full as well, so there is a reallocation on top of that." : ""}`,
      insertAt: (at: number, shifted: number, v: number) =>
        `The ${shifted} elements from arr[${at}] onwards shift one slot right, then ${v} goes in. Cost ${shifted + 1}. The further forward you insert, the more has to move.`,
      emptyArray: "The array is empty.",
      deleteFront: (v: number, rest: number) =>
        `Removing ${v} must not leave a hole, so the remaining ${rest} elements each shift one slot left. Cost ${rest}, which is O(n).`,
      deleteBack: (v: number) => `Just decrement size — the slot holding ${v} is simply overwritten later. Cost 1. This is why an array makes such a good backing store for a stack.`,
      memory: (size: number, cap: number) => `Memory (size ${size} / capacity ${cap})`,
      legendAdded: "just written",
      legendMoved: "moved",
      legendRead: "read",
      cost: (n: number) => `Cost ${n}`,
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

const START = [12, 7, 3, 9, 15, 4];
const init = (t: T): State => ({ items: START, cap: 8, moved: [], added: null, read: null, cost: 0, last: t.intro });

const rnd = () => Math.floor(Math.random() * 90) + 10;
const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);

const buildOps = (t: T): { label: string; run: (s: State) => State }[] => [
  {
    label: t.opRead,
    run: (s) => s.items.length > 3
      ? { ...s, moved: [], added: null, read: 3, cost: 1, last: t.read(s.items[3]) }
      : { ...s, moved: [], added: null, read: null, cost: 0, last: t.readMissing },
  },
  {
    label: t.opPush,
    run: (s) => {
      const v = rnd();
      if (s.items.length === s.cap) {
        const n = s.items.length;
        return { ...s, items: [...s.items, v], cap: s.cap * 2, moved: range(0, n), added: n, read: null, cost: n + 1, last: t.pushGrow(s.cap * 2, n, v) };
      }
      return { ...s, items: [...s.items, v], moved: [], added: s.items.length, read: null, cost: 1, last: t.push(v, s.items.length) };
    },
  },
  {
    label: t.opInsertFront,
    run: (s) => {
      const v = rnd();
      const n = s.items.length;
      const grow = n === s.cap;
      return { ...s, items: [v, ...s.items], cap: grow ? s.cap * 2 : s.cap, moved: range(1, n + 1), added: 0, read: null, cost: n + 1, last: t.insertFront(v, n, grow) };
    },
  },
  {
    label: t.opInsertAt,
    run: (s) => {
      const v = rnd();
      const n = s.items.length;
      const at = Math.min(2, n);
      const grow = n === s.cap;
      const items = [...s.items.slice(0, at), v, ...s.items.slice(at)];
      return { ...s, items, cap: grow ? s.cap * 2 : s.cap, moved: range(at + 1, n + 1), added: at, read: null, cost: n - at + 1, last: t.insertAt(at, n - at, v) };
    },
  },
  {
    label: t.opDeleteFront,
    run: (s) => {
      const n = s.items.length;
      if (!n) return { ...s, moved: [], added: null, read: null, cost: 0, last: t.emptyArray };
      return { ...s, items: s.items.slice(1), moved: range(0, n - 1), added: null, read: null, cost: n - 1, last: t.deleteFront(s.items[0], n - 1) };
    },
  },
  {
    label: t.opDeleteBack,
    run: (s) => {
      const n = s.items.length;
      if (!n) return { ...s, moved: [], added: null, read: null, cost: 0, last: t.emptyArray };
      return { ...s, items: s.items.slice(0, -1), moved: [], added: null, read: null, cost: 1, last: t.deleteBack(s.items[n - 1]) };
    },
  },
];

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium";

export function ArrayOpsDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const initial = useMemo(() => init(t), [t]);
  const ops = useMemo(() => buildOps(t), [t]);
  const [s, setS] = useState<State>(initial);
  const cells = Math.min(s.cap, 16);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        {ops.map((op) => (
          <button key={op.label} type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setS(op.run)}>
            {op.label}
          </button>
        ))}
        <button type="button" className={`${BTN} ml-auto border-line bg-surface hover:bg-surface-2`} onClick={() => setS(initial)}>{ui.demo.reset}</button>
      </div>

      <div className="overflow-x-auto px-3.5 pt-3.5 pb-2">
        <div className="eyebrow mb-1.5">{t.memory(s.items.length, s.cap)}</div>
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
          <Legend cls="border-accent bg-accent" t={t.legendAdded} />
          <Legend cls="border-amber bg-amber-soft" t={t.legendMoved} />
          <Legend cls="border-green bg-green-soft" t={t.legendRead} />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[12px]">{t.cost(s.cost)}</span>
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
