"use client";

import { useState } from "react";

const CAP = 3;
const KEYS = ["A", "B", "C", "D", "E"];

interface State {
  /** 最近使用在前、最久沒用在後 */
  order: string[];
  hi: string | null;
  evicted: string | null;
  ops: number;
  last: string;
}

const INIT: State = { order: [], hi: null, evicted: null, ops: 0, last: `容量 ${CAP} 的 LRU 快取。雙向串列記「誰最近被用過」，雜湊表記「每個 key 的節點在哪」。` };

function put(s: State, k: string): State {
  if (s.order.includes(k)) {
    return { ...s, order: [k, ...s.order.filter((x) => x !== k)], hi: k, evicted: null, ops: s.ops + 1, last: `put(${k})：雜湊表說 ${k} 已經在快取裡，直接拿到它的節點。從原位置拆下（改 prev 和 next 兩個指標）、接到最前面。全部 O(1)。` };
  }
  if (s.order.length < CAP) {
    return { ...s, order: [k, ...s.order], hi: k, evicted: null, ops: s.ops + 1, last: `put(${k})：還有空間，新節點接到最前面，雜湊表加一筆 ${k} → 節點。O(1)。` };
  }
  const victim = s.order[s.order.length - 1];
  return { ...s, order: [k, ...s.order.slice(0, -1)], hi: k, evicted: victim, ops: s.ops + 1, last: `put(${k})：快取滿了。尾端的 ${victim} 最久沒被用，拆掉它（O(1)，因為雙向所以知道它的前一個）、雜湊表刪掉 ${victim}，再把 ${k} 接到最前面。` };
}

function get(s: State, k: string): State {
  if (!s.order.includes(k)) {
    return { ...s, hi: null, evicted: null, ops: s.ops + 1, last: `get(${k})：雜湊表裡沒有 ${k}，快取未命中（miss）。O(1)。` };
  }
  return { ...s, order: [k, ...s.order.filter((x) => x !== k)], hi: k, evicted: null, ops: s.ops + 1, last: `get(${k})：命中。雜湊表 O(1) 找到節點，把它移到最前面，代表「剛剛用過」。單向串列做不到 O(1) 拆節點，因為不知道前一個是誰。` };
}

const BTN = "h-[28px] cursor-pointer whitespace-nowrap rounded-md border px-2.5 font-mono text-[12.5px] font-medium";

export function LRUCacheDemo() {
  const [s, setS] = useState<State>(INIT);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span className="flex items-center gap-1.5">put
          {KEYS.map((k) => <button key={k} type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setS((c) => put(c, k))}>{k}</button>)}
        </span>
        <span className="flex items-center gap-1.5">get
          {KEYS.map((k) => <button key={k} type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setS((c) => get(c, k))}>{k}</button>)}
        </span>
        <button type="button" className={`${BTN} ml-auto border-line bg-surface hover:bg-surface-2`} onClick={() => setS(INIT)}>重設</button>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[minmax(0,1fr)_170px]">
        <div>
          <div className="eyebrow mb-2">雙向串列（最近 ⇄ 最久）</div>
          <div className="flex flex-wrap items-center">
            <span className="rounded-md border border-line-strong bg-surface-2 px-2 py-1 font-mono text-[11.5px] text-ink-2">head</span>
            <Link />
            {s.order.length === 0 && <span className="rounded-md border border-dashed border-line px-2 py-1 text-[12px] text-ink-3">空</span>}
            {s.order.map((k) => (
              <span key={k} className="flex items-center">
                <span className={`flex h-9 items-stretch overflow-hidden rounded-md border font-mono text-[13.5px] font-medium ${k === s.hi ? "border-accent bg-accent text-accent-ink" : "border-line-strong bg-surface"}`}>
                  <span className="grid w-6 place-items-center border-r border-current/30 text-[10px]">‹</span>
                  <span className="grid w-9 place-items-center">{k}</span>
                  <span className="grid w-6 place-items-center border-l border-current/30 text-[10px]">›</span>
                </span>
                <Link />
              </span>
            ))}
            <span className="rounded-md border border-line-strong bg-surface-2 px-2 py-1 font-mono text-[11.5px] text-ink-2">tail</span>
            {s.evicted && <span className="ml-3 rounded-md border border-amber bg-amber-soft px-2 py-1 font-mono text-[12px] text-amber line-through">{s.evicted}</span>}
          </div>
          <p className="mt-2.5 mb-0 text-[12.5px] text-ink-3">head 和 tail 是哨兵節點，讓最前面與最後面的插入刪除不用特判。</p>
        </div>
        <div>
          <div className="eyebrow mb-2">雜湊表（key → 節點）</div>
          <div className="flex min-h-[80px] flex-col gap-1">
            {s.order.length === 0 && <span className="rounded-md border border-dashed border-line-strong px-2 py-1.5 text-center text-[12px] text-ink-3">空</span>}
            {[...s.order].sort().map((k) => (
              <div key={k} className={`flex justify-between rounded-md border px-2.5 py-1 font-mono text-[12.5px] ${k === s.hi ? "border-accent bg-accent-soft" : "border-line"}`}>
                <span>{k}</span><span className="text-ink-3">→ 節點</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">操作 {s.ops}</span>
        <span className="flex-1">{s.last}</span>
      </div>
    </div>
  );
}

function Link() {
  return <span className="mx-0.5 text-ink-3">⇄</span>;
}
